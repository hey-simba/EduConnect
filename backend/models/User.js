const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    accountStatus: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Approved' // Instructors will explicitly be set to Pending on creation
    },
    cvLink: {
        type: String,
        trim: true
    },
    tokens: {
        type: Number,
        default: 0 // Users start with 0 tokens and can buy more
    },
    // NEW: Instructor specific fields
    description: {
        type: String,
        default: '',
        trim: true
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    availableBalance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
});

const User = mongoose.model('User', userSchema);
module.exports = User;