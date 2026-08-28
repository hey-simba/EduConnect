import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('verification');
    
    // Data States
    const [pendingInstructors, setPendingInstructors] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [reports, setReports] = useState([
        // Mock data for moderation (Moderation backend not yet built)
        { _id: 'r1', type: 'Course', targetName: 'Fake Course 101', reportedBy: 'student123', reason: 'Misleading content', date: '2026-08-28' },
        { _id: 'r2', type: 'Chat', targetName: 'Message from user99', reportedBy: 'student456', reason: 'Inappropriate language', date: '2026-08-28' }
    ]);
    const [loading, setLoading] = useState(true);

    const userRole = user?.role;

    useEffect(() => {
        if (!userRole || userRole !== 'admin') {
            navigate('/home');
        } else {
            fetchPendingInstructors();
            fetchPendingCourses();
        }
    }, [userRole, navigate]);

    const fetchPendingInstructors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/instructors/pending');
            setPendingInstructors(response.data);
        } catch (error) {
            console.error('Error fetching pending instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/courses/pending');
            setPendingCourses(response.data);
        } catch (error) {
            console.error('Error fetching pending courses:', error);
        }
    };

    const handleApproveInstructor = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/instructors/approve/${id}`);
            alert('Instructor approved successfully. Notification email sent.');
            fetchPendingInstructors();
        } catch (error) {
            console.error('Error approving instructor:', error);
            alert('Failed to approve instructor');
        }
    };

    const handleRejectInstructor = async (id) => {
        if (!window.confirm('Are you sure you want to reject this instructor?')) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/instructors/reject/${id}`);
            alert('Instructor rejected successfully. Notification email sent.');
            fetchPendingInstructors();
        } catch (error) {
            console.error('Error rejecting instructor:', error);
            alert('Failed to reject instructor');
        }
    };

    const handleApproveCourse = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/courses/approve/${id}`);
            alert('Course approved successfully and is now public.');
            fetchPendingCourses();
        } catch (error) {
            console.error('Error approving course:', error);
            alert('Failed to approve course');
        }
    };

    const handleRejectCourse = async (id) => {
        if (!window.confirm('Are you sure you want to reject this course?')) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/courses/reject/${id}`);
            alert('Course rejected successfully.');
            fetchPendingCourses();
        } catch (error) {
            console.error('Error rejecting course:', error);
            alert('Failed to reject course');
        }
    };

    const handleDismissReport = (id) => {
        alert('Dismiss report endpoint not yet implemented.');
        setReports(prev => prev.filter(r => r._id !== id));
    };

    const handleTakeAction = (id) => {
        alert('Action taken against report! Endpoint not yet implemented.');
        setReports(prev => prev.filter(r => r._id !== id));
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 flex flex-col md:flex-row">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 md:min-h-screen">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-1">Admin Panel</h2>
                    <p className="text-gray-400 text-sm">EduConnect System</p>
                </div>
                <nav className="mt-4 flex flex-col gap-2 px-4">
                    <button 
                        onClick={() => setActiveTab('verification')}
                        className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'verification' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                    >
                        👥 Instructor Verification
                    </button>
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                    >
                        📚 Course Publishing
                    </button>
                    <button 
                        onClick={() => setActiveTab('moderation')}
                        className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'moderation' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                    >
                        🛡️ Moderation
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8">
                
                {/* Header Welcome */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}</h1>
                        <p className="text-gray-500">Manage platform operations, verify users, and maintain quality.</p>
                    </div>
                    <div className="text-5xl hidden md:block">👑</div>
                </div>

                {/* TAB: Instructor Verification */}
                {activeTab === 'verification' && (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Pending Instructor Approvals</h2>
                        
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Loading pending applications...</p>
                        ) : pendingInstructors.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No pending instructors at the moment.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th className="p-4 border-b">Name</th>
                                            <th className="p-4 border-b">Email</th>
                                            <th className="p-4 border-b">CV Link</th>
                                            <th className="p-4 text-right border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingInstructors.map(instructor => (
                                            <tr key={instructor._id} className="border-b hover:bg-gray-50 transition">
                                                <td className="p-4 font-medium">{instructor.name}</td>
                                                <td className="p-4 text-gray-600">{instructor.email}</td>
                                                <td className="p-4 text-blue-600">
                                                    {instructor.cvLink ? (
                                                        <a href={instructor.cvLink} target="_blank" rel="noopener noreferrer" className="hover:underline">View CV</a>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="p-4 flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleApproveInstructor(instructor._id)}
                                                        className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectInstructor(instructor._id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Course Publishing Queue */}
                {activeTab === 'courses' && (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Course Publishing Queue</h2>
                            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">{pendingCourses.length} Pending</span>
                        </div>
                        
                        {pendingCourses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No courses pending review.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingCourses.map(course => (
                                    <div key={course._id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                By <span className="font-semibold text-gray-700">{course.instructorName}</span> • {course.category}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Submitted on {new Date(course.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                                                Review Details
                                            </button>
                                            <button 
                                                onClick={() => handleApproveCourse(course._id)}
                                                className="flex-1 md:flex-none bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRejectCourse(course._id)}
                                                className="flex-1 md:flex-none bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Moderation */}
                {activeTab === 'moderation' && (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">User Reports & Moderation</h2>
                            <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">{reports.length} Reports</span>
                        </div>
                        
                        {reports.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No active reports. Community is safe.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th className="p-4 border-b">Type</th>
                                            <th className="p-4 border-b">Target</th>
                                            <th className="p-4 border-b">Reason</th>
                                            <th className="p-4 border-b">Reported By</th>
                                            <th className="p-4 text-right border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map(report => (
                                            <tr key={report._id} className="border-b hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${report.type === 'Course' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {report.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{report.targetName}</td>
                                                <td className="p-4 text-red-600 font-medium">{report.reason}</td>
                                                <td className="p-4 text-gray-500 text-sm">{report.reportedBy}<br/><span className="text-xs">{report.date}</span></td>
                                                <td className="p-4 flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleTakeAction(report._id)}
                                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition text-sm"
                                                    >
                                                        Take Action
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDismissReport(report._id)}
                                                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
