const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuitionPost',
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    preferableAmount: {
        type: Number,
        required: true
    },
    cvUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

// FR-3: Ensure a tutor can only apply once to a specific tuition post
applicationSchema.index({ postId: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
