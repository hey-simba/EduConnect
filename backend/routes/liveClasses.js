const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');

// GET /api/live-classes - Get all live classes
router.get('/', async (req, res) => {
    try {
        const classes = await LiveClass.find().sort({ scheduledAt: -1 });
        res.status(200).json(classes);
    } catch (error) {
        console.error('Fetch live classes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/live-classes/instructor/:instructorId
router.get('/instructor/:instructorId', async (req, res) => {
    try {
        const classes = await LiveClass.find({ instructorId: req.params.instructorId }).sort({ scheduledAt: -1 });
        res.status(200).json(classes);
    } catch (error) {
        console.error('Fetch instructor live classes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
