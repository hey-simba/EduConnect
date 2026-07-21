import React, { useState } from 'react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');

  // Dummy data to populate the UI
  const enrolledCourses = [
    { id: 1, title: 'Advanced Operating Systems', progress: 75, instructor: 'Dr. Alan Turing' },
    { id: 2, title: 'Discrete Mathematics Foundations', progress: 30, instructor: 'Prof. Ada Lovelace' },
    { id: 3, title: 'Web Development Bootcamp', progress: 100, instructor: 'Sarah Connor' },
  ];

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
            onClick={() => setActiveTab('assignments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'assignments' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            📝 Assignments
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            ⚙️ Profile Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, Student! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to continue your learning journey?</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center text-xl shadow-sm">
             🎓
          </div>
        </header>

        {/* Tab Content Rendering */}
        {activeTab === 'courses' && (
          <section className="animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Enrolled Masterclasses
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <div key={course.id} className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="w-full h-40 bg-gray-100 dark:bg-[#1F2937] rounded-xl mb-4 flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
                    {course.progress === 100 ? '🏆' : '💻'}
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-2">{course.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">with {course.instructor}</p>
                  
                  {/* Progress Bar */}
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
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'assignments' && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 animate-fade-in">
            <span className="text-4xl mb-4">📁</span>
            <p>No pending assignments right now.</p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 animate-fade-in">
            <span className="text-4xl mb-4">⚙️</span>
            <p>Profile settings module goes here.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;