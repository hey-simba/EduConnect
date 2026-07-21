import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer'; // <-- Import the new Footer

const PublicLayout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#010816] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 selection:bg-blue-500/30">
      
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col relative w-full overflow-hidden">
        {children}
      </main>
      
      <Footer /> {/* <-- Add it right here at the bottom */}
      
    </div>
  );
};

export default PublicLayout;