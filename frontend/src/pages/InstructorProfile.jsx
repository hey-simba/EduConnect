import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function InstructorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE}/instructors/${id}`);
                setProfile(res.data);
            } catch (err) {
                console.error('Load profile error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id]);

    const handleMessage = () => {
        navigate(`/messages?userId=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
                <div className="text-gray-500 font-medium">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
                <div className="text-gray-500 font-medium">Instructor not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-md mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{profile.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{profile.email}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{profile.totalCourses}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Courses</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{profile.totalLiveClasses}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Live Classes</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-extrabold text-green-600 dark:text-green-400">{profile.totalEnrollments}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Students</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{profile.avgRating}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Rating</div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            💬 Message
                        </button>
                    </div>
                </div>

                {profile.courses && profile.courses.length > 0 ? (
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-md">
                        <h2 className="text-2xl font-extrabold mb-6">Courses by {profile.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.courses.map(course => (
                                <div key={course._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>৳{course.price}</span>
                                        <span>★ {course.averageRating || 0}</span>
                                        <span>{course.totalEnrollments || 0} students</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500">
                        <p>No published courses yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
