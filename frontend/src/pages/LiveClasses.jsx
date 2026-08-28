export default function LiveClasses() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🎥</div>
        <h1 className="text-4xl font-extrabold mb-4">Live Classes</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
          Join interactive live sessions with expert instructors. Real-time video streaming powered by Agora is coming soon.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-xl text-blue-400 text-sm font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
