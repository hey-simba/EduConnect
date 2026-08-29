import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function StudentDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('courses');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'applications') {
      setActiveTab('applications');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user._id && !user.id) return;
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/courses/enrollments/${user._id || user.id}`);
        // Map backend format to UI format
        const courses = res.data.map(enrollment => {
          const totalVideos = enrollment.courseId?.videos?.length || 1;
          const watched = enrollment.watchedVideos?.length || 0;
          const calculatedProgress = Math.round((watched / totalVideos) * 100);

          return {
            ...enrollment.courseId,
            progress: calculatedProgress
          };
        });
        setEnrolledCourses(courses);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const loadApplications = async () => {
    if (!user._id && !user.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/student/${user._id || user.id}`);
      setApplications(res.data);
    } catch (err) {
      console.error('Load applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    }
  }, [activeTab]);

  const handleMessageTutor = (tutorId) => {
    navigate(`/messages?userId=${tutorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010816] text-gray-900 dark:text-gray-100 flex transition-colors duration-500 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-500">EduConnect</h1>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1 block">Student Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'courses' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            📚 My Courses
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            📩 Applications Received
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'assignments' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            📝 Assignments
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            ⚙️ Profile & Wallet
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to continue your learning journey?</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center text-xl shadow-sm">
             🎓
          </div>
        </header>

        {activeTab === 'courses' && (
          <section className="animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Enrolled Masterclasses
            </h3>
            
            {loading ? (
              <p className="text-gray-500">Loading your courses...</p>
            ) : enrolledCourses.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-10 text-center shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                <span className="text-5xl mb-4">🛒</span>
                <h4 className="text-xl font-bold mb-2">No courses yet!</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Explore our catalog and find the perfect course to level up your skills.</p>
                <Link to="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <Link to={`/course/${course._id}`} key={course._id} className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group cursor-pointer block">
                    <div className="w-full h-40 bg-gray-100 dark:bg-[#1F2937] rounded-xl mb-4 overflow-hidden relative">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">💻</div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">
                        {course.category}
                      </div>
                    </div>
                    <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">with {course.instructorName}</p>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-2.5 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}`} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span>{course.progress}% Complete</span>
                      <span>{course.progress === 100 ? 'Finished' : 'In Progress'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'applications' && (
          <section className="animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              Applications Received
            </h3>
            
            {loading ? (
              <p className="text-gray-500">Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No applications received yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Post a tuition job to receive applications from students.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="p-4 font-semibold">Tuition Post</th>
                      <th className="p-4 font-semibold">Student</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Applied On</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{app.postId?.title || 'Unknown Post'}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {app.tutorId?._id ? (
                            <Link to={`/user/${app.tutorId._id}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                              {app.tutorId?.name || 'Unknown Student'}
                            </Link>
                          ) : (
                            <span className="text-gray-500">Unknown Student</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleMessageTutor(app.tutorId?._id || app.tutorId)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                          >
                            💬 Message
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'assignments' && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 animate-fade-in">
            <span className="text-4xl mb-4">📁</span>
            <p>No pending assignments right now.</p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="animate-fade-in w-full max-w-6xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Profile & Wallet Settings
            </h3>
            
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center text-3xl font-bold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold">{user.name || 'Student'}</h4>
                <p className="text-gray-500 dark:text-gray-400">{user.email || 'No email provided'}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold">
                  <span>Role:</span>
                  <span className="uppercase text-blue-600 dark:text-blue-400">{user.role || 'student'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <h4 className="text-blue-100 font-semibold mb-1">My Token Wallet</h4>
                <div className="text-4xl font-extrabold mb-4">{user.tokens || 0} <span className="text-xl font-medium opacity-80">Tokens</span></div>
                <p className="text-sm text-blue-100 mb-6">Use tokens to post in the Tuition Hub or buy specialized courses.</p>
                <button 
                  onClick={async () => {
                    const amount = window.prompt("How many tokens would you like to buy? (1 Token = 100 BDT)", "1");
                    if (!amount || isNaN(amount)) return;
                    
                    try {
                        // Backend expects the amount in BDT (1 Token = 100 BDT)
                        const totalBdt = Number(amount) * 100;

                        const res = await axios.post(`http://localhost:5000/api/wallet/buy`, {
                            userId: user._id || user.id,
                            amount: totalBdt,
                            name: user.name,
                            email: user.email
                        });
                        
                        if (res.data.paymentUrl) {
                            window.location.href = res.data.paymentUrl;
                        } else {
                            alert('SSL Commerz failed to generate payment URL.');
                        }
                    } catch (err) {
                        alert(err.response?.data?.message || 'Failed to initiate payment.');
                    }
                  }}
                  className="bg-white text-blue-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors w-full shadow-sm"
                >
                  Top Up Wallet (SSL Commerz)
                </button>
              </div>

              {/* Edit Profile Form Shell */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h4 className="font-bold text-lg mb-4">Update Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full mt-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed" />
                  </div>
                  <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
