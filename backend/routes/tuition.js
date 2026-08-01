const express = require('express');
const router = express.Router();
const { getTuitions, createTuition } = require('../controllers/tuitionController');

// GET /api/tuitions - Fetch all tuition job posts
router.get('/', getTuitions);

// POST /api/tuitions - Create a new tuition job post
router.post('/', createTuition);

module.exports = router;
