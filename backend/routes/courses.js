const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    getInstructorCourses,
    createCourse,
    enrollInCourse,
    submitReview,
    getMyEnrollments,
    updateProgress,
    claimCertificate
} = require('../controllers/courseController');

// GET /api/courses — list all courses (with optional ?category=Math&sortBy=rating)
router.get('/', getCourses);

// GET /api/courses/enrollments/:studentId — purchase history
router.get('/enrollments/:studentId', getMyEnrollments);

// GET /api/courses/instructor/:instructorId - get all courses created by an instructor
router.get('/instructor/:instructorId', getInstructorCourses);

// GET /api/courses/:courseId — single course + reviews
router.get('/:courseId', getCourseById);

// POST /api/courses — create a new course
router.post('/', createCourse);

// POST /api/courses/:courseId/enroll — enroll (purchase) a course
router.post('/:courseId/enroll', enrollInCourse);

// POST /api/courses/:courseId/reviews — submit a review
router.post('/:courseId/reviews', submitReview);

// PUT /api/courses/:courseId/progress — mark video watched
router.put('/:courseId/progress', updateProgress);

// POST /api/courses/:courseId/certificate — claim certificate
router.post('/:courseId/certificate', claimCertificate);

module.exports = router;
