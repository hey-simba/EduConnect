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
    // 1. Video Content Management
    playlistUrl: { type: String, default: '' },
    videos: [{
        title: { type: String, required: true },
        youtubeUrl: { type: String, required: true },
        isPreview: { type: Boolean, default: false }, // Free to watch?
        duration: { type: String, default: '00:00' }
    }],
    
    // 2. Course Highlights
    totalDuration: { type: String, default: '0 hours' }, 
    totalAssignments: { type: Number, default: 0 },
    hasCertificate: { type: Boolean, default: true },
    
    // 3. Admin Verification Logic
    approvalStatus: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    
    // Original Stats
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Performance index for category and rating-based queries
courseSchema.index({ category: 1 });
courseSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Course', courseSchema);
