const mongoose = require('mongoose');

const tuitionPostSchema = new mongoose.Schema({
    jobId: { type: String, unique: true },
    studentName: { type: String },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, // e.g., "Tutor Needed For English Medium"
    location: { district: String, area: String, address: String },
    medium: { type: String, required: true },
    classLevel: { type: String, required: true },
    preferredTutorGender: { type: String, enum: ['All', 'Male', 'Female'], default: 'All' },
    tutoringDays: { type: String }, // e.g., "5 Days/Week"
    subjects: [{ type: String }], // Array of subjects like ['Biology', 'Chemistry']
    salary: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('TuitionPost', tuitionPostSchema);