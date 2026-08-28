import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InstructorDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [profile, setProfile] = useState({ name: user?.name || '', description: '' });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            try {
                // Fetch instructor's courses (includes pending ones)
                const coursesRes = await axios.get(`http://localhost:5000/api/courses/instructor/${user._id || user.id}`);
                setCourses(coursesRes.data);

                // Fetch instructor's detailed profile
                const profileRes = await axios.get(`http://localhost:5000/api/instructors/${user._id || user.id}`);
                if (profileRes.data.instructor) {
                    setProfile({
                        name: profileRes.data.instructor.name || user.name,
                        description: profileRes.data.instructor.description || ''
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        if (user) fetchData();
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
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase mb-2">Total Earnings</h3>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                            ৳{courses.reduce((sum, course) => sum + (course.price * (course.totalEnrollments || 0)), 0)}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase mb-2">Active Courses</h3>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`pb-3 px-4 font-bold text-sm transition-all ${activeTab === 'courses' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        My Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`pb-3 px-4 font-bold text-sm transition-all ${activeTab === 'earnings' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        💰 Earnings & Payouts
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 px-4 font-bold text-sm transition-all ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        ⚙️ Profile Settings
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'courses' && (
                    <div>
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
                )}



                {activeTab === 'profile' && (
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setUpdatingProfile(true);
                                try {
                                    await axios.put(`http://localhost:5000/api/instructors/${user._id || user.id}/profile`, profile);
                                    alert('Profile updated successfully!');
                                } catch (err) {
                                    alert('Failed to update profile.');
                                } finally {
                                    setUpdatingProfile(false);
                                }
                            }}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.name} 
                                        onChange={(e) => setProfile({...profile, name: e.target.value})} 
                                        required
                                        className="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description / Bio</label>
                                    <textarea 
                                        value={profile.description} 
                                        onChange={(e) => setProfile({...profile, description: e.target.value})} 
                                        rows="5"
                                        placeholder="Tell students about your expertise, background, and what you teach..."
                                        className="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={updatingProfile}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                                >
                                    {updatingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Earnings & Payouts</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                        <h3 className="font-bold text-lg">Earnings by Course</h3>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="text-gray-500 border-b border-gray-100 dark:border-gray-700 text-sm">
                                            <tr>
                                                <th className="p-4 font-semibold">Course</th>
                                                <th className="p-4 font-semibold">Price</th>
                                                <th className="p-4 font-semibold">Sales</th>
                                                <th className="p-4 font-semibold text-right">Earned</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course._id} className="border-b border-gray-50 dark:border-gray-750">
                                                    <td className="p-4 text-sm font-medium">{course.title}</td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">৳{course.price}</td>
                                                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">{course.totalEnrollments || 0}</td>
                                                    <td className="p-4 text-right font-bold text-green-600">৳{course.price * (course.totalEnrollments || 0)}</td>
                                                </tr>
                                            ))}
                                            {courses.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="p-6 text-center text-gray-500">No courses published yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-green-100 text-sm font-bold uppercase mb-2">Total Lifetime Earnings</div>
                                        <div className="text-5xl font-extrabold mb-8">
                                            ৳{courses.reduce((sum, course) => sum + (course.price * (course.totalEnrollments || 0)), 0)}
                                        </div>
                                        <button onClick={() => alert('Withdrawal request via SSL Commerz requires backend setup. See instructions provided to your teammate.')} className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition-colors shadow-md">
                                            Withdraw via SSL Commerz
                                        </button>
                                    </div>
                                    {/* Decoration */}
                                    <div className="absolute -bottom-6 -right-6 text-9xl opacity-20 transform rotate-12">💰</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="font-bold mb-2">How Payouts Work</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        When students purchase your course, the earnings are immediately added to your total. 
                                        You can withdraw your funds directly to your bank account or Mobile Banking via SSL Commerz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
