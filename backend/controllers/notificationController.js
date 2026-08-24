const Notification = require('../models/Notification');

// GET /api/notifications/:userId - Fetch all notifications for a user
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20); // Return the 20 most recent

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/notifications/:userId/mark-read - Mark all notifications as read
const markAllRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/notifications/:notificationId - Delete a single notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const deleted = await Notification.findByIdAndDelete(notificationId);
        if (!deleted) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markAllRead, deleteNotification };
