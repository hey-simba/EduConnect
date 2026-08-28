import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };

  return (
    <div className="bg-gray-50 dark:bg-[#010816] min-h-screen transition-colors duration-300 pb-20">
      
      {/* Welcome Banner */}
      <div className="bg-blue-600 dark:bg-blue-900 text-white pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome back, {user.name}! 👋</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Ready to learn something new today? Jump right back into your courses, join a live session, or find the perfect tutor near you.
          </p>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Courses */}
          <Link to="/courses" className="group bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recorded Courses</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
              Learn at your own pace from verified industry experts. Watch free previews and earn certificates.
            </p>
            <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Explore Courses →</span>
          </Link>

          {/* Pillar 2: Live Classes */}
          <Link to="/live-classes" className="group bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              🔴
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Live Classes</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
              Join real-time interactive sessions hosted by top educators. Set reminders so you never miss out.
            </p>
            <span className="text-red-600 dark:text-red-400 font-semibold group-hover:underline">View Schedule →</span>
          </Link>

          {/* Pillar 3: Tuition Hub */}
          <Link to="/tuition-hub" className="group bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              📍
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tuition Hub</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
              Looking for a private tutor? Post your requirements or apply to nearby tuition jobs easily.
            </p>
            <span className="text-green-600 dark:text-green-400 font-semibold group-hover:underline">Find Tutors →</span>
          </Link>

        </div>

        {/* Sneak Peek / Featured Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Right Now</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Course Teaser */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-1/3 bg-gray-200 dark:bg-gray-700 aspect-video sm:aspect-auto flex items-center justify-center text-4xl">
                💻
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Top Course</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Full-Stack Web Development</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Master React, Node, and MongoDB with real projects.</p>
                <Link to="/courses" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View Course</Link>
              </div>
            </div>

            {/* Upcoming Live Class Teaser */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-1/3 bg-gray-200 dark:bg-gray-700 aspect-video sm:aspect-auto flex items-center justify-center text-4xl">
                🎙️
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Starting in 2 hours</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Q&A: Cracking Job Interviews</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Join our verified expert to discuss resume building.</p>
                <button className="text-left text-red-600 dark:text-red-400 text-sm font-semibold hover:underline">🔔 Set Reminder</button>
              </div>
            </div>

          </div>
        </div>

        {/* Featured Instructors Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Instructors</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Top-rated educators based on courses, live classes, and student feedback.</p>
          <FeaturedInstructors />
        </div>

      </div>
    </div>
  );
};

const FeaturedInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/instructors/featured?limit=3`);
        setInstructors(res.data);
      } catch (err) {
        console.error('Load featured instructors error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInstructors();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No featured instructors yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {instructors.map((instructor) => (
        <div
          key={instructor._id}
          className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {instructor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{instructor.name}</h3>
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                ★ {(instructor.avgCourseRating || 0).toFixed(1)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{instructor.totalCoursesPublished || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">Courses</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-lg font-extrabold text-green-600 dark:text-green-400">{instructor.totalStudentsEnrolled || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">Students</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{Math.round(instructor.score || 0)}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">Score</div>
            </div>
          </div>
          <Link
            to={`/instructor/${instructor._id}`}
            className="mt-4 block text-center w-full py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            View Profile
          </Link>
        </div>
      ))}
    </div>
  );
};

export default HomePage;