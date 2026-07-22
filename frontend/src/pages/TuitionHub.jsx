import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ Imported the service (Model)
import { fetchTuitionJobs } from "../services/tuitionService.js";

// ✅ Uncommented your CreateTuitionModal import
import CreateTuitionModal from '../components/CreateTuitionModal';

// NOTE: You will need to create these components next!
// import BuyTokensModal from '../components/BuyTokensModal';
// import ApplyTuitionModal from '../components/ApplyTuitionModal';

export default function TuitionHub() {
    const navigate = useNavigate();

    // Mock authenticated user state
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { id: '650000000000000000000001', name: 'Demo User', email: 'demo@educonnect.com', role: 'student' };
    });

    const [tokens, setTokens] = useState(3);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchJobId, setSearchJobId] = useState('');
    const [tuitionType, setTuitionType] = useState('All');
    const [district, setDistrict] = useState('All');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBuyTokensModalOpen, setIsBuyTokensModalOpen] = useState(false);
    const [selectedPostToApply, setSelectedPostToApply] = useState(null);

    // ✅ REAL DATABASE FETCH VIA SERVICE (FIXED)
    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const response = await fetchTuitionJobs(); 
                
                // Safely extract array regardless of response structure
                if (Array.isArray(response)) {
                    setPosts(response);
                } else if (response?.data && Array.isArray(response.data)) {
                    setPosts(response.data);
                } else if (response?.jobs && Array.isArray(response.jobs)) {
                    setPosts(response.jobs);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Failed to load posts:", error);
                setPosts([]); // Fallback to prevent crash
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    // Filter Logic (FIXED: Safe Array Check)
    const safePosts = Array.isArray(posts) ? posts : [];
    
    const filteredPosts = safePosts.filter(post => {
        const matchesJobId = searchJobId === '' || post.jobId?.toLowerCase().includes(searchJobId.toLowerCase());
        const matchesDistrict = district === 'All' || post.location?.district === district;
        const matchesMinSalary = minSalary === '' || (post.salary && post.salary >= parseInt(minSalary));
        const matchesMaxSalary = maxSalary === '' || (post.salary && post.salary <= parseInt(maxSalary));
        
        // Note: If you add 'tuitionType' to your backend model later, uncomment this line:
        // const matchesType = tuitionType === 'All' || post.tuitionType === tuitionType;
        
        return matchesJobId && matchesDistrict && matchesMinSalary && matchesMaxSalary;
    });

    const resetFilters = () => {
        setSearchJobId('');
        setTuitionType('All');
        setDistrict('All');
        setMinSalary('');
        setMaxSalary('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                
                {/* Page Controls Banner */}
                <div className="mb-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Tuition Hub</h2>
                        <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase border border-purple-500/20">Live Jobs</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* User Role Switcher */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold">
                            <button 
                                onClick={() => { const u = {...user, role: 'student'}; setUser(u); localStorage.setItem('user', JSON.stringify(u)); }}
                                className={`px-4 py-2 rounded-lg transition-all ${user.role === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                👨‍🎓 Student
                            </button>
                            <button 
                                onClick={() => { const u = {...user, role: 'instructor'}; setUser(u); localStorage.setItem('user', JSON.stringify(u)); }}
                                className={`px-4 py-2 rounded-lg transition-all ${user.role === 'instructor' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                👨‍🏫 Tutor
                            </button>
                        </div>

                        {/* Token Wallet Badge */}
                        {user.role === 'instructor' && (
                            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
                                <span className="text-amber-500 text-xl">🪙</span>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Tokens</div>
                                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{tokens} Balance</div>
                                </div>
                                <button 
                                    onClick={() => setIsBuyTokensModalOpen(true)} 
                                    className="ml-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                >
                                    + Buy
                                </button>
                            </div>
                        )}

                        {/* Post Tuition Button */}
                        {user.role === 'student' && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                            >
                                ➕ Post Tutor Wanted
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <aside className="w-full lg:w-1/4 space-y-6">
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    🔍 Find Tuition
                                </h3>
                                <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                                    Reset
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Search by Job ID */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Search By Job ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Job ID (e.g. TUT-123)"
                                        value={searchJobId}
                                        onChange={(e) => setSearchJobId(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Tuition Type */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Tuition Type</label>
                                    <select 
                                        value={tuitionType} 
                                        onChange={(e) => setTuitionType(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none cursor-pointer"
                                    >
                                        <option value="All">All Tuition Types</option>
                                        <option value="Home Tutoring">Home Tutoring</option>
                                        <option value="Online Tutoring">Online Tutoring</option>
                                    </select>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Select District</label>
                                    <select 
                                        value={district} 
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none cursor-pointer"
                                    >
                                        <option value="All">All Districts</option>
                                        <option value="Dhaka">Dhaka</option>
                                        <option value="Chattogram">Chattogram</option>
                                    </select>
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Salary Range (Tk)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" placeholder="Min" value={minSalary} onChange={(e) => setMinSalary(e.target.value)}
                                            className="w-1/2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none"
                                        />
                                        <input 
                                            type="number" placeholder="Max" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)}
                                            className="w-1/2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Tuition Post Cards Feed */}
                    <section className="w-full lg:w-3/4 space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-[#111827] px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                Showing <span className="text-blue-600 dark:text-blue-400 font-extrabold">{filteredPosts.length}</span> tuition job listings
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500 font-medium animate-pulse">🔄 Loading tuition posts...</div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                                <h4 className="text-xl font-bold">No Tuition Jobs Found</h4>
                                <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <div 
                                    key={post._id}
                                    className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                                            <span>📍</span>
                                            <span>{post.location?.area}, {post.location?.district}</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-lg">
                                            Job ID: {post.jobId}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-3">
                                        {post.title}
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm mb-6 bg-gray-50 dark:bg-[#1A2333] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Medium</div>
                                            <div className="font-extrabold mt-0.5">{post.medium}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Class</div>
                                            <div className="font-extrabold mt-0.5">{post.classLevel}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Salary</div>
                                            <div className="font-extrabold text-blue-600 text-lg mt-0.5">
                                                {post.salary?.toLocaleString()} Tk<span className="text-xs text-gray-500 font-normal">/Month</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-xs text-gray-400 font-medium">
                                            Posted by: <span className="font-bold">{post.studentName || 'Student'}</span>
                                        </div>

                                        {user.role === 'instructor' ? (
                                            <button 
                                                onClick={() => setSelectedPostToApply(post)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                                            >
                                                Apply as Tutor
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-400 italic bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                                Switch to Tutor to apply
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </main>

            <CreateTuitionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            
            {/* 
            <BuyTokensModal isOpen={isBuyTokensModalOpen} onClose={() => setIsBuyTokensModalOpen(false)} />
            <ApplyTuitionModal isOpen={!!selectedPostToApply} onClose={() => setSelectedPostToApply(null)} post={selectedPostToApply} /> 
            */}

        </div>
    );
}