const express = require('express');
const router = express.Router();
const { getFeaturedInstructors, getInstructorProfile } = require('../controllers/instructorController');

// GET /api/instructors/featured
router.get('/featured', getFeaturedInstructors);

// GET /api/instructors/:id
router.get('/:id', getInstructorProfile);

module.exports = router;
