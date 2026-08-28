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
        if (tutor.role !== 'student') {
            throw new Error('Only students can apply to tuition jobs.');
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

        // FR-9: Create initial message between student and tutor to start conversation
        const initialMessage = new Notification({
            userId: post.studentId,
            type: 'NEW_APPLICANT',
            message: `${tutor.name} has applied to your post: ${post.title}`,
            link: `/instructor/${tutorId}`
        });
        await initialMessage.save({ session });

        const Message = require('../models/Message');
        const systemMessage = new Message({
            senderId: tutorId,
            receiverId: post.studentId,
            content: `Hi! I have applied for your tuition post: "${post.title}". My proposed budget is ${preferableAmount} Tk/Month. Let's discuss further.`,
            type: 'application',
            relatedPostId: postId,
            read: false
        });
        await systemMessage.save({ session });

        await session.commitTransaction();
        session.endSession();

        // FR-4 / NFR-3: Emit real-time socket event to the specific student (< 100ms)
        // io and userSocketMap are attached to the Express app in server.js
        const emitToUser = req.app.get('emitToUser');
        const studentId = post.studentId.toString();

        if (emitToUser) {
            emitToUser(studentId, 'NEW_APPLICANT', {
                _id: initialMessage._id,
                type: 'NEW_APPLICANT',
                message: initialMessage.message,
                link: initialMessage.link,
                isRead: false,
                createdAt: initialMessage.createdAt
            });
            console.log(`📡 Real-time notification sent to student ${studentId}`);

            const populatedMessage = await Message.findById(systemMessage._id)
                .populate('senderId', 'name email')
                .populate('receiverId', 'name email');

            emitToUser(tutorId.toString(), 'newMessage', populatedMessage);
            emitToUser(studentId, 'newMessage', populatedMessage);
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

        const applications = await Application.find({ tutorId }).select('postId status createdAt');
        const appliedPostIds = applications.map(app => app.postId.toString());
        
        res.status(200).json(appliedPostIds);
    } catch (error) {
        console.error('Fetch apps error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/applications/student/:studentId - Get applications received by a student
const getStudentApplications = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) return res.status(400).json({ message: 'Student ID required' });

        const studentPosts = await TuitionPost.find({ studentId }).select('_id title');
        const postIds = studentPosts.map(p => p._id);

        const applications = await Application.find({ postId: { $in: postIds } })
            .populate('postId', 'title')
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Fetch student applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/applications/tutor/:tutorId - Get applications sent by a tutor with details
const getTutorApplications = async (req, res) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) return res.status(400).json({ message: 'Tutor ID required' });

        const applications = await Application.find({ tutorId })
            .populate({
                path: 'postId',
                select: 'title salary location status studentId',
                populate: { path: 'studentId', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Fetch tutor applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { applyForTuition, getMyApplications, getStudentApplications, getTutorApplications };
