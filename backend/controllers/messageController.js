const Message = require('../models/Message');
const User = require('../models/User');

const personId = (person) => {
    if (!person) return '';
    if (typeof person === 'string') return person;
    if (person._id) return person._id.toString();
    return String(person);
};

const emitMessage = (req, populated) => {
    const emitToUser = req.app.get('emitToUser');
    if (!emitToUser || !populated) return;
    emitToUser(personId(populated.receiverId), 'newMessage', populated);
    emitToUser(personId(populated.senderId), 'messageSent', populated);
};

// GET /api/messages/:userId/:otherUserId
const getConversation = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        })
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ createdAt: 1 })
            .limit(200);

        await Message.updateMany(
            { senderId: otherUserId, receiverId: userId, read: false },
            { read: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/messages/recent/:userId
const getRecentConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        })
            .sort({ createdAt: -1 })
            .limit(200);

        const conversationMap = new Map();
        messages.forEach(msg => {
            const otherId = personId(msg.senderId) === userId.toString()
                ? personId(msg.receiverId)
                : personId(msg.senderId);

            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    otherUserId: otherId,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unread: personId(msg.receiverId) === userId.toString() && !msg.read
                });
            }
        });

        const otherIds = Array.from(conversationMap.keys());
        const users = await User.find({ _id: { $in: otherIds } }).select('name email role');
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const conversations = Array.from(conversationMap.values()).map(conv => {
            const other = userMap.get(conv.otherUserId);
            return {
                ...conv,
                otherUserName: other?.name || `User ${conv.otherUserId.slice(-6)}`,
                otherUserRole: other?.role || ''
            };
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Get recent conversations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/messages/contact/:userId
const getContact = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('_id name email role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/messages/send
const sendMessage = async (req, res) => {
    const { senderId, receiverId, content, type, relatedPostId } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const message = new Message({
            senderId,
            receiverId,
            content,
            type: type || 'text',
            relatedPostId: relatedPostId || null
        });
        await message.save();

        const populated = await Message.findById(message._id)
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email');

        emitMessage(req, populated);
        res.status(201).json(populated);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getConversation,
    getRecentConversations,
    sendMessage,
    getContact
};
