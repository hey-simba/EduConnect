import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using react-router

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-[#010816] border-t border-gray-200 dark:border-gray-800/60 pt-16 pb-8 transition-colors duration-500 relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-extrabold tracking-tighter text-blue-600 dark:text-blue-500 mb-4">
              EduConnect
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Bridging the gap between ambitious learners and industry experts. Master the skills of tomorrow, today.
            </p>
          </div>

          {/* Dashboards Column */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Portals</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <li><Link to="/student-dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/instructor-dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Instructor Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Explore Courses</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Become an Instructor</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Code of Conduct</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} EduConnect Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Mockup */}
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"></div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;