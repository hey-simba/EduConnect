import React from 'react';

const Header = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-[#010816]/70 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
        
        <div className="text-2xl font-extrabold tracking-tighter text-blue-600 dark:text-blue-500 cursor-pointer drop-shadow-sm">
          EduConnect
        </div>
        
        <nav className="hidden md:flex gap-10 font-medium text-sm text-gray-600 dark:text-gray-300">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Platform</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Masterclasses</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Instructors</a>
        </nav>

        <div className="flex items-center gap-5">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <button className="hidden md:block font-semibold text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Log In
          </button>
          
          <button className="px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5">
            Start Learning
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;