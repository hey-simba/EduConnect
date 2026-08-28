const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createAssignment,
    getCourseAssignments,
    submitAssignment,
    getUngradedSubmissions,
    gradeSubmission
} = require('../controllers/assignmentController');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/assignments');
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST /api/assignments (Create new assignment)
router.post('/', createAssignment);

// GET /api/assignments/course/:courseId (List assignments for a course)
router.get('/course/:courseId', getCourseAssignments);

// POST /api/assignments/:assignmentId/submit (Submit an assignment file)
router.post('/:assignmentId/submit', upload.single('file'), submitAssignment);

// GET /api/assignments/instructor/:instructorId/ungraded (Queue of ungraded submissions)
router.get('/instructor/:instructorId/ungraded', getUngradedSubmissions);

// PUT /api/assignments/:assignmentId/grade/:studentId (Grade a submission)
router.put('/:assignmentId/grade/:studentId', gradeSubmission);

module.exports = router;
