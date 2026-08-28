const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    prompt: { 
        type: String, 
        required: true 
    },
    deadline: { 
        type: Date, 
        required: true 
    },
    submissions: [{
        studentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        fileUrl: { 
            type: String, 
            required: true 
        }, // Path to the file uploaded via Multer
        grade: { 
            type: Number, 
            default: null 
        }, // Instructor assigned grade (e.g., out of 100)
        status: { 
            type: String, 
            enum: ['Pending', 'Graded'], 
            default: 'Pending' 
        },
        submittedAt: { 
            type: Date, 
            default: Date.now 
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
