const mongoose = require('mongoose');

// FR-5: Enrollment/Purchase History schema
// Links a student to a course they have purchased — required to leave a review
const enrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Track the token price paid at time of purchase (price can change later)
    tokensPaid: { type: Number, required: true },
    enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
