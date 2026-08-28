const express = require('express');
const router = express.Router();
const { getFeaturedInstructors, getInstructorProfile, updateInstructorProfile, renewSubscription } = require('../controllers/instructorController');

// GET /api/instructors/featured
router.get('/featured', getFeaturedInstructors);

// GET /api/instructors/:id
router.get('/:id', getInstructorProfile);

// PUT /api/instructors/:id/profile
router.put('/:id/profile', updateInstructorProfile);

// PUT /api/instructors/:id/renew-subscription
router.put('/:id/renew-subscription', renewSubscription);

module.exports = router;
