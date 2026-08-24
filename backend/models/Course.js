const mongoose = require('mongoose');

// FR-5: Course schema with aggregated rating fields
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instructorName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // Price in tokens
    thumbnail: { type: String, default: '' },        // URL or path to thumbnail image
    category: {
        type: String,
        enum: ['Math', 'Science', 'English', 'Bengali', 'ICT', 'Commerce', 'Arts', 'Other'],
        default: 'Other'
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    duration: { type: String, default: '' },        // e.g. "12 hours"
    totalLessons: { type: Number, default: 0 },
    // NFR-2: Aggregated rating fields — updated atomically on each new review
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Performance index for category and rating-based queries
courseSchema.index({ category: 1 });
courseSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Course', courseSchema);
