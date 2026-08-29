const TuitionPost = require('../models/TuitionPost');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/tuitions - Fetch all tuition job posts
const getTuitions = async (req, res) => {
    try {
        const { subject, area, minSalary, maxSalary, sortBy } = req.query;
        let query = {};

        // Filter by subject
        if (subject && subject !== 'All') {
            query.subjects = { $in: [subject] };
        }

        // Filter by location area
        if (area && area !== 'All') {
            query['location.area'] = area;
        }

        // Filter by salary range
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) query.salary.$gte = Number(minSalary);
            if (maxSalary) query.salary.$lte = Number(maxSalary);
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default: newest
        if (sortBy === 'salary-high') {
            sortOption = { salary: -1 };
        } else if (sortBy === 'salary-low') {
            sortOption = { salary: 1 };
        }

        const posts = await TuitionPost.find(query).sort(sortOption);
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
            throw new Error('Insufficient tokens. Posting a tuition job costs 1 Token.');
        }

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

        // Deduct 1 token from the student
        student.tokens -= 1;
        await student.save({ session });

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
