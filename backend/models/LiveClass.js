const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        default: 60
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    agoraChannel: {
        type: String,
        default: ''
    }
}, { timestamps: true });

liveClassSchema.index({ instructorId: 1, scheduledAt: -1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);
