const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'application', 'system'],
        default: 'text'
    },
    relatedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuitionPost',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
