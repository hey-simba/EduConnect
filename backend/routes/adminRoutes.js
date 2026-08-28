const express = require('express');
const router = express.Router();
const { getPendingInstructors, approveInstructor, rejectInstructor } = require('../controllers/adminController');

// All paths map to /api/admin/...

// Get list of pending instructors
router.get('/instructors/pending', getPendingInstructors);

// Approve instructor
router.put('/instructors/approve/:id', approveInstructor);

// Reject instructor
router.put('/instructors/reject/:id', rejectInstructor);

module.exports = router;
