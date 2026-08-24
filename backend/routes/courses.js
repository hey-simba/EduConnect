const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    submitReview,
    getMyEnrollments
} = require('../controllers/courseController');

// GET /api/courses — list all courses (with optional ?category=Math&sortBy=rating)
router.get('/', getCourses);

// GET /api/courses/enrollments/:studentId — purchase history
router.get('/enrollments/:studentId', getMyEnrollments);

// GET /api/courses/:courseId — single course + reviews
router.get('/:courseId', getCourseById);

// POST /api/courses — create a new course
router.post('/', createCourse);

// POST /api/courses/:courseId/enroll — enroll (purchase) a course
router.post('/:courseId/enroll', enrollInCourse);

// POST /api/courses/:courseId/reviews — submit a review
router.post('/:courseId/reviews', submitReview);

module.exports = router;
