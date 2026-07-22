const express = require('express');
const router = express.Router();
const TuitionPost = require('../models/TuitionPost');

// GET /api/tuitions - Fetch all tuition job posts
router.get('/', async (req, res) => {
    try {
        const posts = await TuitionPost.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching tuition posts:', error);
        res.status(500).json({ message: 'Server error while fetching tuition posts' });
    }
});

// POST /api/tuitions - Create a new tuition job post
router.post('/', async (req, res) => {
    try {
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

        // Provide a dummy ObjectId if studentId is not supplied from frontend
        const fallbackStudentId = studentId || '650000000000000000000001';

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

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error creating tuition post:', error);
        res.status(500).json({ message: 'Server error while creating tuition post', error: error.message });
    }
});

module.exports = router;
