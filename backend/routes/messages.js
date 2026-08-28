const express = require('express');
const router = express.Router();
const {
    getConversation,
    getRecentConversations,
    sendMessage,
    getContact
} = require('../controllers/messageController');

// Static segments must be registered before /:userId/:otherUserId
router.get('/recent/:userId', getRecentConversations);
router.get('/contact/:userId', getContact);
router.get('/:userId/:otherUserId', getConversation);
router.post('/send', sendMessage);

module.exports = router;
