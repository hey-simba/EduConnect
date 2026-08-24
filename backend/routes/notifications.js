const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, deleteNotification } = require('../controllers/notificationController');

// GET /api/notifications/:userId
router.get('/:userId', getNotifications);

// PATCH /api/notifications/:userId/mark-read
router.patch('/:userId/mark-read', markAllRead);

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', deleteNotification);

module.exports = router;
