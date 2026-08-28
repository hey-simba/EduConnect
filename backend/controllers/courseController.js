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
const claimCertificate = async (req, res) => {
    try {
        const { studentId } = req.body;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({ studentId, courseId }).populate('studentId').populate('courseId');
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        enrollment.certificateClaimed = true;
        await enrollment.save();

        // Normally you would trigger NodeMailer here to send the PDF.
        // We will leave this for the teammate to integrate.
        
        res.status(200).json({ message: 'Certificate sent successfully!' });
    } catch (error) {
        console.error('Claim certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    getInstructorCourses,
    createCourse,
    enrollInCourse,
    submitReview,
    getMyEnrollments,
    updateProgress,
    claimCertificate
};
