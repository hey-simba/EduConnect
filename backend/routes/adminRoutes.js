const express = require('express');
const router = express.Router();
const { 
    getPendingInstructors, 
    approveInstructor, 
    rejectInstructor,
    getPendingCourses,
    approveCourse,
    rejectCourse
} = require('../controllers/adminController');

// Instructor routes
router.get('/instructors/pending', getPendingInstructors);
router.put('/instructors/approve/:id', approveInstructor);
router.put('/instructors/reject/:id', rejectInstructor);

// Course routes
router.get('/courses/pending', getPendingCourses);
router.put('/courses/approve/:id', approveCourse);
router.put('/courses/reject/:id', rejectCourse);

module.exports = router;
