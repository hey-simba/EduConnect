import React from 'react';
import { Link } from 'react-router-dom';

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

      </div>
    </div>
  );
};

export default HomePage;