const mongoose = require('mongoose');

// FR-5: Review schema — one review per student per course
const reviewSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' }
}, { timestamps: true });

// Enforce one-review-per-student-per-course constraint
reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
