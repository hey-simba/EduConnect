const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../uploads/assignments');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. INSTRUCTOR: Create a new assignment
const createAssignment = async (req, res) => {
    try {
        const { courseId, title, prompt, deadline, instructorId } = req.body;

        // Verify the instructor owns this course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.instructorId.toString() !== instructorId) {
            return res.status(403).json({ message: 'Not authorized to add assignments to this course' });
        }

        const newAssignment = new Assignment({
            courseId,
            instructorId,
            title,
            prompt,
            deadline
        });

        await newAssignment.save();

        // Increment totalAssignments in the Course model
        course.totalAssignments += 1;
        await course.save();

        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. PUBLIC/STUDENT: Get assignments for a specific course
const getCourseAssignments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const assignments = await Assignment.find({ courseId }).sort({ deadline: 1 });
        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3. STUDENT: Submit an assignment
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { studentId } = req.body; // Provided in formData
        
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const fileUrl = `/uploads/assignments/${req.file.filename}`;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Check if already submitted
        const existingSubmissionIndex = assignment.submissions.findIndex(s => s.studentId.toString() === studentId);
        if (existingSubmissionIndex !== -1) {
            // Update submission
            assignment.submissions[existingSubmissionIndex].fileUrl = fileUrl;
            assignment.submissions[existingSubmissionIndex].submittedAt = Date.now();
            assignment.submissions[existingSubmissionIndex].status = 'Pending'; // Reset grading if re-submitted
        } else {
            // New submission
            assignment.submissions.push({
                studentId,
                fileUrl,
                status: 'Pending'
            });
        }

        await assignment.save();
        res.status(200).json({ message: 'Assignment submitted successfully', fileUrl });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 4. INSTRUCTOR: Get all ungraded submissions across their courses
const getUngradedSubmissions = async (req, res) => {
    try {
        const { instructorId } = req.params;
        
        // Find all assignments for this instructor
        const assignments = await Assignment.find({ instructorId }).populate('submissions.studentId', 'name email').populate('courseId', 'title');
        
        let ungraded = [];
        assignments.forEach(assignment => {
            assignment.submissions.forEach(sub => {
                if (sub.status === 'Pending') {
                    ungraded.push({
                        assignmentId: assignment._id,
                        assignmentTitle: assignment.title,
                        courseTitle: assignment.courseId.title,
                        student: sub.studentId, // populated with name and email
                        fileUrl: sub.fileUrl,
                        submittedAt: sub.submittedAt
                    });
                }
            });
        });

        res.status(200).json(ungraded);
    } catch (error) {
        console.error('Error fetching ungraded submissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 5. INSTRUCTOR: Grade an assignment submission
const gradeSubmission = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;
        const { grade } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const submission = assignment.submissions.find(s => s.studentId.toString() === studentId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        submission.grade = Number(grade);
        submission.status = 'Graded';

        await assignment.save();
        res.status(200).json({ message: 'Graded successfully' });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createAssignment,
    getCourseAssignments,
    submitAssignment,
    getUngradedSubmissions,
    gradeSubmission
};
