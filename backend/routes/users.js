const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:id/profile - Get public user profile
router.get('/:id/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name email role createdAt')
            .lean();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
