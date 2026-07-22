import React from 'react';

const HomePage = () => {
  return (
    // ✅ Replaced the fragment with a div to restore your exact original background colors
    <div className="bg-white dark:bg-[#010816] w-full min-h-screen transition-colors duration-300">
      
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        
        {/* Grid Background Overlay */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] pointer-events-none z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            Now Enrolling for Fall Cohorts
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-gray-900 dark:text-white leading-[1.1] mb-8 max-w-4xl mx-auto drop-shadow-sm">
            Master the skills that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              shape tomorrow.
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join a premier ecosystem of industry experts and ambitious learners. Elevate your career with interactive, real-world masterclasses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1">
              Explore Courses
            </button>
            <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl bg-white dark:bg-[#111827] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              Become an Instructor
            </button>
          </div>

          <div className="relative max-w-5xl mx-auto rounded-2xl border border-gray-200/50 dark:border-gray-800/80 bg-white/50 dark:bg-[#0B1120]/50 backdrop-blur-xl shadow-2xl p-3 lg:p-5 transform hover:scale-[1.02] transition-transform duration-700 ease-out">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#010816] dark:via-[#010816]/80 z-20 pointer-events-none rounded-b-2xl"></div>
            
            <div className="aspect-[16/9] bg-gray-50 dark:bg-[#151E32] rounded-xl overflow-hidden relative border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
              
              <div className="absolute top-4 left-4 right-4 h-12 bg-white dark:bg-[#1F2937] rounded-lg shadow-sm flex items-center px-4 gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              
              <div className="absolute top-20 left-4 bottom-4 w-48 lg:w-64 bg-white dark:bg-[#1F2937] rounded-lg shadow-sm hidden sm:flex flex-col gap-3 p-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md mt-4"></div>
              </div>
              
              <div className="absolute top-20 left-4 sm:left-56 lg:left-72 right-4 bottom-4 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1F2937] rounded-lg shadow-sm col-span-2 lg:col-span-1"></div>
                <div className="bg-white dark:bg-[#1F2937] rounded-lg shadow-sm col-span-2 lg:col-span-1"></div>
                <div className="bg-white dark:bg-[#1F2937] rounded-lg shadow-sm col-span-2 h-32"></div>
              </div>

            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
};

export default HomePage;