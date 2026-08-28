const User = require('../models/User');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');

// GET /api/instructors/featured - Get featured instructors
const getFeaturedInstructors = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const instructors = await User.find({ role: 'instructor' }).select('_id name email').lean();

        const instructorsWithStats = await Promise.all(
            instructors.map(async (instructor) => {
                const courses = await Course.find({ instructorId: instructor._id, isPublished: true }).lean();
                const liveClasses = await LiveClass.find({ instructorId: instructor._id }).lean();

                const totalCourses = courses.length;
                const totalLiveClasses = liveClasses.length;

                const avgRating = totalCourses > 0
                    ? courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / totalCourses
                    : 0;

                const totalEnrollments = courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0);

                const score = (totalCourses * 10) + (totalLiveClasses * 5) + (avgRating * 20) + (totalEnrollments * 0.5);

                return {
                    _id: instructor._id,
                    name: instructor.name,
                    email: instructor.email,
                    totalCourses,
                    totalLiveClasses,
                    avgRating: Math.round(avgRating * 10) / 10,
                    totalEnrollments,
                    score: Math.round(score * 100) / 100
                };
            })
        );

        instructorsWithStats.sort((a, b) => b.score - a.score);
        res.status(200).json(instructorsWithStats.slice(0, limit));
    } catch (error) {
        console.error('Get featured instructors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/instructors/:id - Get single instructor profile
const getInstructorProfile = async (req, res) => {
    try {
        const instructor = await User.findById(req.params.id).select('_id name email role description totalEarnings availableBalance').lean();
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const courses = await Course.find({ instructorId: instructor._id, isPublished: true }).lean();
        const liveClasses = await LiveClass.find({ instructorId: instructor._id }).lean();

        const stats = {
            totalCourses: courses.length,
            totalLiveClasses: liveClasses.length,
            avgRating: courses.length > 0
                ? courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / courses.length
                : 0,
            totalEnrollments: courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)
        };

        res.status(200).json({ instructor, stats, courses, liveClasses });
    } catch (error) {
        console.error('Get instructor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/instructors/:id/profile - Update instructor profile
const updateInstructorProfile = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        const instructor = await User.findById(id);
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        if (name) instructor.name = name;
        if (description !== undefined) instructor.description = description;

        await instructor.save();

        res.status(200).json({ message: 'Profile updated successfully', user: instructor });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getFeaturedInstructors, getInstructorProfile, updateInstructorProfile };
