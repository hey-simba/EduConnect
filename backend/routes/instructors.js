const express = require('express');
const router = express.Router();
const { getFeaturedInstructors, getInstructorProfile, updateInstructorProfile } = require('../controllers/instructorController');

// GET /api/instructors/featured
router.get('/featured', getFeaturedInstructors);

// GET /api/instructors/:id
router.get('/:id', getInstructorProfile);

// PUT /api/instructors/:id/profile
router.put('/:id/profile', updateInstructorProfile);

module.exports = router;
