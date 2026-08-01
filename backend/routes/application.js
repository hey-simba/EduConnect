const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { applyForTuition, getMyApplications } = require('../controllers/applicationController');

// Multer setup for local CV upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// POST /api/applications/:postId/apply
router.post('/:postId/apply', upload.single('cvFile'), applyForTuition);

// GET /api/applications/my-applications
router.get('/my-applications', getMyApplications);

module.exports = router;
