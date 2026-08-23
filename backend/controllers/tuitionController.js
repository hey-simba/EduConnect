const TuitionPost = require('../models/TuitionPost');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/tuitions - Fetch all tuition job posts
const getTuitions = async (req, res) => {
    try {
        const posts = await TuitionPost.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching tuition posts:', error);
        res.status(500).json({ message: 'Server error while fetching tuition posts' });
    }
};

// POST /api/tuitions - Create a new tuition job post
const createTuition = async (req, res) => {
    const {
        studentId,
        title,
        location,
        medium,
        classLevel,
        preferredTutorGender,
        tutoringDays,
        subjects,
        salary,
        status,
        jobId,
        studentName
    } = req.body;

    const fallbackStudentId = studentId || '650000000000000000000001';

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the student
        const student = await User.findById(fallbackStudentId).session(session);
        if (!student) {
            throw new Error('Student account not found');
        }

        if (student.tokens < 1) {
            throw new Error('Insufficient tokens. Please buy more tokens to post a tuition.');
        }

        // Deduct 1 token
        student.tokens -= 1;
        await student.save({ session });

        const newPost = new TuitionPost({
            studentId: fallbackStudentId,
            title,
            location,
            medium,
            classLevel,
            preferredTutorGender,
            tutoringDays,
            subjects,
            salary,
            status,
            jobId,
            studentName
        });

        const savedPost = await newPost.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(savedPost);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating tuition post:', error);
        res.status(400).json({ message: error.message || 'Server error while creating tuition post' });
    }
};

module.exports = {
    getTuitions,
    createTuition
};
