const User = require('../models/User');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');

// GET /api/instructors/featured - Get featured instructors
const getFeaturedInstructors = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        
        const featuredInstructors = await User.aggregate([
            { $match: { role: 'instructor', accountStatus: 'Approved' } },
            {
                $lookup: {
                    from: 'courses', // MongoDB automatically names the collection plural
                    localField: '_id',
                    foreignField: 'instructorId',
                    as: 'courses'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    description: 1,
                    totalCoursesPublished: { $size: "$courses" },
                    totalStudentsEnrolled: { $sum: "$courses.totalEnrollments" },
                    avgCourseRating: { $avg: "$courses.averageRating" }
                }
            },
            {
                $addFields: {
                    avgCourseRating: { $ifNull: ["$avgCourseRating", 0] },
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: ["$avgCourseRating", 20] },
                            { $multiply: ["$totalStudentsEnrolled", 0.5] },
                            { $multiply: ["$totalCoursesPublished", 5] }
                        ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: limit }
        ]);

        res.status(200).json(featuredInstructors);
    } catch (error) {
        console.error('Featured instructors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/instructors/:id - Get single instructor profile
const getInstructorProfile = async (req, res) => {
    try {
        const instructor = await User.findById(req.params.id).select('_id name email role description totalEarnings availableBalance trialEndsAt isSubscribed subscriptionExpiry').lean();
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

// PUT /api/instructors/:id/renew-subscription
const renewSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await User.findById(id);
        
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        instructor.isSubscribed = true;
        
        // Add 1 month from now
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        instructor.subscriptionExpiry = oneMonthFromNow;

        await instructor.save();

        res.status(200).json({ 
            message: 'Subscription renewed successfully!', 
            subscriptionExpiry: instructor.subscriptionExpiry,
            isSubscribed: true
        });
    } catch (error) {
        console.error('Renew subscription error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = { getFeaturedInstructors, getInstructorProfile, updateInstructorProfile, renewSubscription };
