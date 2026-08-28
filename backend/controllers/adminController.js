const User = require('../models/User');
const nodemailer = require('nodemailer');

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email
const sendApprovalEmail = async (email, name, status) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Nodemailer credentials not set in .env. Skipping email sending.');
            return;
        }

        const subject = status === 'Approved' 
            ? 'EduConnect Instructor Account Approved'
            : 'EduConnect Instructor Account Update';
            
        const text = status === 'Approved'
            ? `Hello ${name},\n\nCongratulations! Your instructor account on EduConnect has been approved. You can now log in and start creating courses.\n\nBest Regards,\nThe EduConnect Team`
            : `Hello ${name},\n\nWe regret to inform you that your application to become an instructor on EduConnect has not been approved at this time.\n\nBest Regards,\nThe EduConnect Team`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text
        });
        console.log(`✉️ Notification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// GET: Fetch all pending instructors
const getPendingInstructors = async (req, res) => {
    try {
        const pendingInstructors = await User.find({ role: 'instructor', accountStatus: 'Pending' }).select('-password');
        res.status(200).json(pendingInstructors);
    } catch (error) {
        console.error('Error fetching pending instructors:', error);
        res.status(500).json({ message: 'Server error while fetching pending instructors' });
    }
};

// PUT: Approve an instructor
const approveInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(
            id,
            { accountStatus: 'Approved' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send Email
        await sendApprovalEmail(user.email, user.name, 'Approved');

        res.status(200).json({ message: 'Instructor approved successfully', user });
    } catch (error) {
        console.error('Error approving instructor:', error);
        res.status(500).json({ message: 'Server error while approving instructor' });
    }
};

// PUT: Reject an instructor
const rejectInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(
            id,
            { accountStatus: 'Rejected' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send Email
        await sendApprovalEmail(user.email, user.name, 'Rejected');

        res.status(200).json({ message: 'Instructor rejected successfully', user });
    } catch (error) {
        console.error('Error rejecting instructor:', error);
        res.status(500).json({ message: 'Server error while rejecting instructor' });
    }
};

// GET: Fetch all pending courses
const getPendingCourses = async (req, res) => {
    try {
        const Course = require('../models/Course'); // Import dynamically if not at top
        const pendingCourses = await Course.find({ approvalStatus: 'Pending' });
        res.status(200).json(pendingCourses);
    } catch (error) {
        console.error('Error fetching pending courses:', error);
        res.status(500).json({ message: 'Server error while fetching pending courses' });
    }
};

// PUT: Approve a course
const approveCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const Course = require('../models/Course');
        const course = await Course.findByIdAndUpdate(
            id,
            { approvalStatus: 'Approved', isPublished: true },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course approved successfully', course });
    } catch (error) {
        console.error('Error approving course:', error);
        res.status(500).json({ message: 'Server error while approving course' });
    }
};

// PUT: Reject a course
const rejectCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const Course = require('../models/Course');
        const course = await Course.findByIdAndUpdate(
            id,
            { approvalStatus: 'Rejected', isPublished: false },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course rejected successfully', course });
    } catch (error) {
        console.error('Error rejecting course:', error);
        res.status(500).json({ message: 'Server error while rejecting course' });
    }
};

module.exports = {
    getPendingInstructors,
    approveInstructor,
    rejectInstructor,
    getPendingCourses,
    approveCourse,
    rejectCourse
};
