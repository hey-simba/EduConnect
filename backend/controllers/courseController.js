const Course = require('../models/Course');
const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────
// GET /api/courses — Fetch all published courses
// ─────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
    try {
        const { category, sortBy } = req.query;
        let query = { isPublished: true, approvalStatus: 'Approved' };

        if (category && category !== 'All') {
            query.category = category;
        }

        let sortOption = { createdAt: -1 }; // Default: newest
        if (sortBy === 'rating')     sortOption = { averageRating: -1 };
        if (sortBy === 'popular')    sortOption = { totalEnrollments: -1 };
        if (sortBy === 'price-low')  sortOption = { price: 1 };
        if (sortBy === 'price-high') sortOption = { price: -1 };

        const courses = await Course.find(query).sort(sortOption);
        res.status(200).json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/courses/:courseId — Get single course + its reviews
// ─────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const reviews = await Review.find({ courseId: req.params.courseId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ course, reviews });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/courses/instructor/:instructorId — Get all courses by an instructor (including pending)
// ─────────────────────────────────────────────────────────
const getInstructorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.params.instructorId }).sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/courses — Create a new course (instructor only)
// ─────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
    try {
        const { 
            title, description, instructorId, instructorName, price, 
            category, level, thumbnail, playlistUrl, videos, 
            totalDuration, totalAssignments, hasCertificate 
        } = req.body;

        // Check Subscription or Trial
        const user = await User.findById(instructorId);
        if (user && user.role === 'instructor') {
            const now = new Date();
            const hasActiveTrial = user.trialEndsAt && new Date(user.trialEndsAt) > now;
            const hasActiveSubscription = user.isSubscribed && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now;
            
            if (!hasActiveTrial && !hasActiveSubscription) {
                return res.status(403).json({ message: 'Your trial or subscription has expired. Please renew your subscription to publish new courses.' });
            }
        }

        if (!title || !description || !instructorId || price === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const course = new Course({
            title, description, instructorId, instructorName,
            price, category, level, thumbnail, 
            playlistUrl, videos, totalDuration, totalAssignments, hasCertificate,
            approvalStatus: 'Pending', // Force pending on creation
            totalLessons: videos ? videos.length : 0
        });
        await course.save();

        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(400).json({ message: error.message || 'Server error creating course' });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/courses/:courseId/enroll — Purchase/Enroll in a course
// ACID Transaction: deduct tokens + create enrollment record atomically
// ─────────────────────────────────────────────────────────
const enrollInCourse = async (req, res) => {
    const { studentId } = req.body;
    const { courseId } = req.params;

    if (!studentId) return res.status(400).json({ message: 'Student ID required' });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const course = await Course.findById(courseId).session(session);
        if (!course) throw new Error('Course not found');
        if (!course.isPublished) throw new Error('This course is not available');

        const student = await User.findById(studentId).session(session);
        if (!student) throw new Error('Student not found');

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId }).session(session);
        if (existingEnrollment) throw new Error('You are already enrolled in this course');

        // NOTE: Course payment is handled via SSL Commerz (Direct Taka).
        // The token deduction logic has been removed as per requirement.
        // In the final implementation, this enrollment block should be triggered 
        // by the SSL Commerz success callback. For now, it simply enrolls the user for testing.


        // Create enrollment record (Purchase History)
        const enrollment = new Enrollment({
            studentId,
            courseId,
            tokensPaid: course.price
        });
        await enrollment.save({ session });

        // Increment enrollment counter on course
        course.totalEnrollments += 1;
        await course.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: `Successfully enrolled in "${course.title}"!`,
            enrollment,
            remainingTokens: student.tokens
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Enroll error:', error);
        res.status(400).json({ message: error.message || 'Enrollment failed' });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/courses/:courseId/reviews — Submit a review
// ACID Transaction: verify purchase → save review → update aggregated rating
// ─────────────────────────────────────────────────────────
const submitReview = async (req, res) => {
    const { studentId, studentName, rating, comment } = req.body;
    const { courseId } = req.params;

    if (!studentId || !rating) {
        return res.status(400).json({ message: 'Student ID and rating are required' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Verify the student has purchased this course
        const enrollment = await Enrollment.findOne({ studentId, courseId }).session(session);
        if (!enrollment) {
            throw new Error('You must enroll in this course before leaving a review.');
        }

        // Step 2: Check for duplicate review
        const existingReview = await Review.findOne({ courseId, studentId }).session(session);
        if (existingReview) {
            throw new Error('You have already reviewed this course.');
        }

        // Step 3: Save the review
        const review = new Review({ courseId, studentId, studentName: studentName || 'Student', rating, comment });
        await review.save({ session });

        // Step 4: NFR-2 — Atomically recalculate and update the course's averageRating
        // Using MongoDB aggregation pipeline inside the session for accuracy
        const aggregation = await Review.aggregate([
            { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
            { $group: { _id: '$courseId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]).session(session);

        const newAvg = aggregation[0]?.avgRating ?? rating;
        const newCount = aggregation[0]?.count ?? 1;

        await Course.findByIdAndUpdate(
            courseId,
            { averageRating: Math.round(newAvg * 10) / 10, totalRatings: newCount },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Review submitted successfully!',
            review,
            newAverageRating: Math.round(newAvg * 10) / 10,
            totalRatings: newCount
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Review error:', error);
        res.status(400).json({ message: error.message || 'Failed to submit review' });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/courses/enrollments/:studentId — Get student's enrollment history
// ─────────────────────────────────────────────────────────
const getMyEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await Enrollment.find({ studentId }).populate('courseId');
        res.status(200).json(enrollments);
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────
// PUT /api/courses/:courseId/progress — Mark video watched
// ─────────────────────────────────────────────────────────
const updateProgress = async (req, res) => {
    try {
        const { studentId, videoUrl } = req.body;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        if (!enrollment.watchedVideos.includes(videoUrl)) {
            enrollment.watchedVideos.push(videoUrl);
            await enrollment.save();
        }

        res.status(200).json({ watchedVideos: enrollment.watchedVideos });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/courses/:courseId/certificate — Claim Certificate
// ─────────────────────────────────────────────────────────
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

const claimCertificate = async (req, res) => {
    try {
        const { studentId } = req.body;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({ studentId, courseId }).populate('studentId').populate('courseId');
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        // Ensure all videos are watched
        const course = enrollment.courseId;
        const student = enrollment.studentId;
        const totalVideos = course.videos ? course.videos.length : 0;
        
        if (enrollment.watchedVideos.length < totalVideos) {
            return res.status(403).json({ message: 'You must watch all videos before claiming the certificate.' });
        }

        // (Skipping assignment check for now as Assignments aren't fully built yet)

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ message: 'Server email configuration is missing. Cannot send certificate.' });
        }

        // Generate PDF
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            let pdfData = Buffer.concat(buffers);

            // Send Email with PDF Attachment
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: `Certificate of Completion: ${course.title}`,
                text: `Congratulations ${student.name}! \n\nYou have successfully completed the course "${course.title}". Please find your certificate attached. \n\nBest Regards,\nEduConnect Team`,
                attachments: [{
                    filename: `${student.name.replace(/\s+/g, '_')}_Certificate.pdf`,
                    content: pdfData
                }]
            };

            try {
                await transporter.sendMail(mailOptions);
                enrollment.certificateClaimed = true;
                await enrollment.save();
                res.status(200).json({ message: 'Certificate sent successfully to your email!' });
            } catch (emailErr) {
                console.error('Email error:', emailErr);
                res.status(500).json({ message: 'Failed to send email. Check server credentials.' });
            }
        });

        // Design the PDF
        doc.rect(0, 0, 842, 595).fill('#f9fafb');
        doc.rect(20, 20, 802, 555).stroke('#d1d5db');
        doc.fillColor('#1f2937').fontSize(40).font('Helvetica-Bold').text('Certificate of Completion', 0, 150, { align: 'center' });
        doc.fontSize(20).font('Helvetica').text('This is to certify that', 0, 230, { align: 'center' });
        doc.fontSize(35).font('Helvetica-Bold').fillColor('#3b82f6').text(student.name, 0, 280, { align: 'center' });
        doc.fontSize(20).font('Helvetica').fillColor('#1f2937').text('has successfully completed the course', 0, 340, { align: 'center' });
        doc.fontSize(25).font('Helvetica-Bold').text(`"${course.title}"`, 0, 390, { align: 'center' });
        doc.fontSize(15).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`, 100, 480);
        doc.text(`Instructor: ${course.instructorName}`, 550, 480);
        doc.end();

    } catch (error) {
        console.error('Claim certificate error:', error);
        res.status(500).json({ message: 'Server error while generating certificate' });
    }
};

// ─────────────────────────────────────────────────────────
// SSL Commerz Payment Integration for Courses
// ─────────────────────────────────────────────────────────
const SSLCommerzPayment = require('sslcommerz-lts');
const store_id = process.env.STORE_ID || 'testbox';
const store_passwd = process.env.STORE_PASSWD || 'testpass@ssl';
const is_live = false;

const initCoursePayment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { studentId } = req.body;

        const course = await Course.findById(courseId);
        const student = await User.findById(studentId);

        if (!course || !student) return res.status(404).json({ message: 'Course or Student not found' });
        
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled' });

        const tran_id = 'C' + new Date().getTime();

        const data = {
            total_amount: course.price,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `http://localhost:5000/api/courses/payment/success/${courseId}/${studentId}`,
            fail_url: `http://localhost:5000/api/courses/payment/fail`,
            cancel_url: `http://localhost:5000/api/courses/payment/cancel`,
            ipn_url: `http://localhost:5000/api/courses/payment/ipn`,
            shipping_method: 'No',
            product_name: course.title,
            product_category: 'Education',
            product_profile: 'general',
            cus_name: student.name,
            cus_email: student.email,
            cus_add1: 'Dhaka',
            cus_city: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111'
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then(apiResponse => {
            if (apiResponse?.GatewayPageURL) {
                res.status(200).json({ paymentUrl: apiResponse.GatewayPageURL });
            } else {
                if (store_id === 'testbox') {
                    return res.status(200).json({ paymentUrl: data.success_url }); // Mock fallback
                }
                return res.status(400).json({ message: apiResponse?.failedreason || 'Gateway failed' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Payment gateway initialization failed' });
    }
};

const coursePaymentSuccess = async (req, res) => {
    const { courseId, studentId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (course) {
            const enrollment = new Enrollment({
                studentId,
                courseId,
                tokensPaid: course.price
            });
            await enrollment.save();
            
            // Update total enrollments
            course.totalEnrollments += 1;
            await course.save();
        }
        res.redirect('http://localhost:5173/student-dashboard?payment=success');
    } catch (error) {
        console.error(error);
        res.redirect('http://localhost:5173/courses?payment=error');
    }
};

const coursePaymentFail = (req, res) => res.redirect('http://localhost:5173/courses?payment=fail');
const coursePaymentCancel = (req, res) => res.redirect('http://localhost:5173/courses?payment=cancel');

module.exports = {
    getCourses,
    getCourseById,
    getInstructorCourses,
    createCourse,
    enrollInCourse,
    submitReview,
    getMyEnrollments,
    updateProgress,
    claimCertificate,
    initCoursePayment,
    coursePaymentSuccess,
    coursePaymentFail,
    coursePaymentCancel
};
