import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-blue-900/50 text-gray-400 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/home">
              <h2 className="inline-block text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300 mb-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all">
                EduConnect
              </h2>
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              A premium, comprehensive learning management ecosystem designed to bridge the gap between students and expert instructors through an intuitive, data-driven platform.
            </p>
          </div>

          {/* Quick Links (Fixed Routing) */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/courses" className="hover:text-cyan-400 transition-colors">Courses</Link></li>
              <li><Link to="/live-classes" className="hover:text-cyan-400 transition-colors">Live Classes</Link></li>
              <li><Link to="/tuition-hub" className="hover:text-cyan-400 transition-colors">Tuition Hub</Link></li>
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} EduConnect. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;