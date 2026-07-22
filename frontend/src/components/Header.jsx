import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getNavClass = ({ isActive }) => {
    return isActive
      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] px-3 py-2 text-sm font-extrabold transition-all duration-300"
      : "text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-semibold transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]";
  };

  const getMobileNavClass = ({ isActive }) => {
    return isActive
      ? "block text-cyan-400 bg-blue-900/40 px-3 py-3 rounded-md text-base font-extrabold transition-colors"
      : "block text-gray-300 hover:text-cyan-400 hover:bg-blue-900/30 px-3 py-3 rounded-md text-base font-semibold transition-colors";
  };

  return (
    <header className="w-full bg-black/95 border-b border-blue-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              EduConnect
            </Link>
          </div>

          {/* MIDDLE: Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/home" className={getNavClass}>Home</NavLink>
            <NavLink to="/courses" className={getNavClass}>Courses</NavLink>
            <NavLink to="/live-classes" className={getNavClass}>Live Classes</NavLink>
            <NavLink to="/tuition-hub" className={getNavClass}>Tuition Hub</NavLink>
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Theme Toggle (Sun/Moon Icon) */}
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 focus:outline-none hidden sm:block"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? (
                // Sun Icon (Currently Dark, click to see Light)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                // Moon Icon (Currently Light, click to go Dark)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            
            {/* Profile Button */}
            <Link to="/dashboard" className="hidden sm:inline-flex bg-blue-600/20 border border-blue-500 text-cyan-300 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-md text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]">
              Profile
            </Link>

            {/* Mobile Menu Button (Hamburger) */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-400 hover:text-cyan-300 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-blue-900/50 shadow-lg px-4 pt-2 pb-6 space-y-2">
          <NavLink to="/home" onClick={toggleMobileMenu} className={getMobileNavClass}>Home</NavLink>
          <NavLink to="/courses" onClick={toggleMobileMenu} className={getMobileNavClass}>Courses</NavLink>
          <NavLink to="/live-classes" onClick={toggleMobileMenu} className={getMobileNavClass}>Live Classes</NavLink>
          <NavLink to="/tuition-hub" onClick={toggleMobileMenu} className={getMobileNavClass}>Tuition Hub</NavLink>
          
          <div className="border-t border-gray-800 pt-4 mt-2 flex justify-between items-center px-3">
             <Link to="/dashboard" onClick={toggleMobileMenu} className="bg-blue-600/20 border border-blue-500 text-cyan-300 px-4 py-2 rounded-md text-sm font-bold">
               Profile
             </Link>
             
             {/* Mobile Theme Toggle (Sun/Moon) */}
             <button onClick={toggleTheme} className="text-gray-400 hover:text-cyan-300">
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
             </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;