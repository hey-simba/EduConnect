import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function InstructorDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch only courses created by this instructor
        // We will fetch all courses and filter for now, or you could create a specific backend route
        const fetchMyCourses = async () => {
            try {
                // Since our current getCourses only returns published & approved courses,
                // we might need a separate API route to get all instructor's courses including pending ones.
                // For now, we will just simulate it by fetching all and filtering if the backend allowed it.
                // Note: You will eventually want an /api/courses/instructor/:id route
                const res = await axios.get(`http://localhost:5000/api/courses`);
                const myCourses = res.data.filter(c => c.instructorId === user?.id || c.instructorId === user?._id);
                setCourses(myCourses);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        
        if (user) fetchMyCourses();
    }, [user]);

    if (!user || user.role !== 'instructor') {
        return <div className="text-center py-20 text-red-500 font-bold">Access Denied. Instructor only.</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-[#010816] min-h-screen pb-20 transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12 px-6 shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
                        <p className="text-blue-200 text-lg">Welcome back, {user.name}! Ready to teach?</p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <Link to="/instructor/create-course" className="bg-white text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
                            + Create New Course
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-10">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase mb-2">Total Students</h3>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {courses.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase mb-2">Active Courses</h3>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase mb-2">Tokens Earned</h3>
                        <div className="text-4xl font-bold text-green-600">
                            {courses.reduce((sum, course) => sum + (course.totalEnrollments * course.price || 0), 0)}
                        </div>
                    </div>
                </div>

                {/* My Courses List */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Courses</h2>
                
                {loading ? (
                    <p className="text-gray-500">Loading your courses...</p>
                ) : courses.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">You haven't created any courses yet.</p>
                        <Link to="/instructor/create-course" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            Create your first course →
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="p-4 font-semibold">Course Title</th>
                                    <th className="p-4 font-semibold">Price</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Enrollments</th>
                                    <th className="p-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{course.title}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">৳{course.price}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                course.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                                course.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {course.approvalStatus || 'Approved'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{course.totalEnrollments}</td>
                                        <td className="p-4 text-right">
                                            <Link to={`/course/${course._id}`} className="text-blue-600 hover:underline text-sm font-semibold">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
