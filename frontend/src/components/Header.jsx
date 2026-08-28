import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../services/socket';

const API_BASE   = 'http://localhost:5000/api';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // FR-4: Notification state
  const [notifications, setNotifications]   = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const socketRef = useRef(null);

  // Get logged-in user from localStorage (same pattern as TuitionHub)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  })();
  const userId = user?._id || user?.id;

  // Unread count derived from state
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Dark mode ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Socket.io connection & notification fetch ---
  useEffect(() => {
    if (!userId) return;

    // Fetch existing notifications from DB
    axios.get(`${API_BASE}/notifications/${userId}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Notification fetch error:', err));

    const socket = getSocket(userId);
    socketRef.current = socket;

    const onNewApplicant = (data) => {
      setNotifications(prev => {
        if (data._id && prev.some(n => n._id === data._id)) return prev;
        return [{
          _id: data._id || Date.now().toString(),
          type: data.type || 'NEW_APPLICANT',
          message: data.message,
          link: data.link || '',
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString()
        }, ...prev];
      });
    };

    socket.on('NEW_APPLICANT', onNewApplicant);

    return () => {
      socket.off('NEW_APPLICANT', onNewApplicant);
    };
  }, [userId]);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await axios.patch(`${API_BASE}/notifications/${userId}/mark-read`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE}/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const getNavClass = ({ isActive }) => {
    return isActive
      ? `px-3 py-2 text-sm font-extrabold transition-all duration-300 ${isDarkMode ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-blue-600'}`
      : `px-3 py-2 text-sm font-semibold transition-all duration-300 ${isDarkMode ? 'text-gray-300 hover:text-cyan-400 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]' : 'text-gray-600 hover:text-blue-600'}`;
  };

  const getMobileNavClass = ({ isActive }) => {
    return isActive
      ? `block px-3 py-3 rounded-md text-base font-extrabold transition-colors ${isDarkMode ? 'text-cyan-400 bg-blue-900/40' : 'text-blue-600 bg-blue-50'}`
      : `block px-3 py-3 rounded-md text-base font-semibold transition-colors ${isDarkMode ? 'text-gray-300 hover:text-cyan-400 hover:bg-blue-900/30' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`;
  };

  return (
    <header className={`w-full ${isDarkMode ? 'bg-black/95 border-b border-blue-900/50' : 'bg-white border-b border-gray-200'} backdrop-blur-md sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className={`text-2xl font-extrabold tracking-wider ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-blue-600'}`}>
              EduConnect
            </Link>
          </div>

          {/* MIDDLE: Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/home" className={getNavClass}>Home</NavLink>
            <NavLink to="/courses" className={getNavClass}>Courses</NavLink>
            <NavLink to="/live-classes" className={getNavClass}>Live Classes</NavLink>
            <NavLink to="/tuition-hub" className={getNavClass}>Tuition Hub</NavLink>
            <NavLink to="/messages" className={getNavClass}>Messages</NavLink>
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Theme Toggle (Sun/Moon Icon) */}
            <button 
              onClick={toggleTheme}
              className={`${isDarkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-300 focus:outline-none hidden sm:block`}
              title="Toggle Dark/Light Mode"
            >
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
            
            {/* Notification Bell — FR-4 Real-Time */}
            <div className="relative hidden sm:block">
              <button 
                id="notification-bell-btn"
                onClick={() => {
                  setShowNotifPanel(prev => !prev);
                  if (!showNotifPanel && unreadCount > 0) handleMarkAllRead();
                }}
                className={`${isDarkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-300 focus:outline-none relative`}
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {/* Dynamic badge — only shown when there are unread notifications */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel Dropdown */}
              {showNotifPanel && (
                <div
                  id="notification-panel"
                  className={`absolute right-0 mt-3 w-80 ${isDarkMode ? 'bg-gray-900 border-blue-900/50 shadow-black/50' : 'bg-white border-gray-200 shadow-gray-300/50'} rounded-2xl shadow-2xl overflow-hidden z-50`}
                >
                  <div className={`flex justify-between items-center px-4 py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔔 Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <p>No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif._id}
                          to={notif.link || '#'}
                          onClick={() => setShowNotifPanel(false)}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors border-b ${isDarkMode ? 'hover:bg-gray-800 border-gray-800/50' : 'hover:bg-gray-100 border-gray-200'} ${!notif.isRead ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                        >
                          <span className="text-lg mt-0.5">
                            {notif.type === 'NEW_APPLICANT' ? '👤' : notif.type === 'PAYMENT_SUCCESS' ? '💰' : '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${!notif.isRead ? (isDarkMode ? 'text-white font-semibold' : 'text-gray-900 font-semibold') : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`}>
                              {notif.message}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notif._id)}
                            className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors flex-shrink-0 ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-600 hover:bg-gray-200'}`}
                            title="Delete notification"
                          >
                            ✕
                          </button>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <Link to={user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard'} className={`hidden sm:inline-flex px-5 py-2 rounded-md text-sm font-bold transition-all duration-300 ${isDarkMode ? 'bg-blue-600/20 border border-blue-500 text-cyan-300 hover:bg-blue-600 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md'}`}>
              Dashboard
            </Link>

            {/* Mobile Menu Button (Hamburger) */}
            <button 
              onClick={toggleMobileMenu}
              className={`md:hidden ${isDarkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-blue-600'} focus:outline-none`}
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
        <div className={`md:hidden ${isDarkMode ? 'bg-black/95 border-b border-blue-900/50' : 'bg-white border-b border-gray-200'} shadow-lg px-4 pt-2 pb-6 space-y-2`}>
          <NavLink to="/home" onClick={toggleMobileMenu} className={getMobileNavClass}>Home</NavLink>
          <NavLink to="/courses" onClick={toggleMobileMenu} className={getMobileNavClass}>Courses</NavLink>
          <NavLink to="/live-classes" onClick={toggleMobileMenu} className={getMobileNavClass}>Live Classes</NavLink>
          <NavLink to="/tuition-hub" onClick={toggleMobileMenu} className={getMobileNavClass}>Tuition Hub</NavLink>
          <NavLink to="/messages" onClick={toggleMobileMenu} className={getMobileNavClass}>Messages</NavLink>
          
          <div className={`border-t pt-4 mt-2 flex justify-between items-center px-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
             <Link to={user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard'} onClick={toggleMobileMenu} className={`px-4 py-2 rounded-md text-sm font-bold ${isDarkMode ? 'bg-blue-600/20 border border-blue-500 text-cyan-300' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
               Dashboard
             </Link>
             
             {/* Mobile Theme Toggle (Sun/Moon) */}
             <button onClick={toggleTheme} className={`${isDarkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-blue-600'}`}>
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