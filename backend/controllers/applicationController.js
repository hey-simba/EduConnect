const Application = require('../models/Application');
const TuitionPost = require('../models/TuitionPost');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const applyForTuition = async (req, res) => {
    // In a real app, userId comes from req.user (auth middleware). For now, we expect it in the body.
    const { tutorId, preferableAmount } = req.body;
    const postId = req.params.postId;
    const cvFile = req.file;

    if (!tutorId || !preferableAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tutor = await User.findById(tutorId).session(session);
        if (!tutor) {
            throw new Error('Tutor not found');
        }
        if (tutor.role !== 'instructor') {
            throw new Error('Only instructors can apply');
        }
        if (tutor.tokens < 1) {
            throw new Error('Insufficient tokens. Please buy more tokens to apply.');
        }

        const post = await TuitionPost.findById(postId).session(session);
        if (!post) {
            throw new Error('Tuition post not found');
        }

        const existingApplication = await Application.findOne({ postId, tutorId }).session(session);
        if (existingApplication) {
            throw new Error('You have already applied to this tuition');
        }

        // Deduct token
        tutor.tokens -= 1;
        await tutor.save({ session });

        // Save application
        const cvUrl = cvFile ? `/uploads/${cvFile.filename}` : '';
        const newApp = new Application({
            postId,
            tutorId,
            preferableAmount,
            cvUrl
        });
        await newApp.save({ session });

        // Create persistent notification for student (stored in DB)
        const newNotification = new Notification({
            userId: post.studentId,
            type: 'NEW_APPLICANT',
            message: `A tutor has applied to your post: ${post.title}`,
            link: `/student-dashboard`
        });
        await newNotification.save({ session });

        await session.commitTransaction();
        session.endSession();

        // FR-4 / NFR-3: Emit real-time socket event to the specific student (< 100ms)
        // io and userSocketMap are attached to the Express app in server.js
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');
        const studentId = post.studentId.toString();
        const targetSocketId = userSocketMap[studentId];

        if (io && targetSocketId) {
            io.to(targetSocketId).emit('NEW_APPLICANT', {
                message: newNotification.message,
                link: newNotification.link,
                postTitle: post.title,
                timestamp: new Date().toISOString()
            });
            console.log(`📡 Real-time notification sent to student ${studentId}`);
        }

        res.status(201).json({ message: 'Application submitted successfully', application: newApp });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Apply error:', error);
        res.status(400).json({ message: error.message || 'Server error during application' });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const { tutorId } = req.query; // Usually req.user.id
        if (!tutorId) return res.status(400).json({ message: 'Tutor ID required' });

        const applications = await Application.find({ tutorId }).select('postId');
        const appliedPostIds = applications.map(app => app.postId.toString());
        
        res.status(200).json(appliedPostIds);
    } catch (error) {
        console.error('Fetch apps error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { applyForTuition, getMyApplications };
