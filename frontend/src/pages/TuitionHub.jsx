import { useState, useEffect } from 'react';

// ✅ Imported the service (Model)
import { fetchTuitionJobs } from "../services/tuitionService.js";

// ✅ Uncommented your CreateTuitionModal import
import CreateTuitionModal from '../components/CreateTuitionModal';

// NOTE: You will need to create these components next!
import BuyTokensModal from '../components/BuyTokensModal';
import ApplyTuitionModal from '../components/ApplyTuitionModal';
import axios from 'axios';

export default function TuitionHub() {
    // Mock authenticated user state
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { id: '650000000000000000000001', name: 'Demo User', email: 'demo@educonnect.com', role: 'student' };
    });

    const [tokens, setTokens] = useState(0);
    const [posts, setPosts] = useState([]);
    const [appliedPosts, setAppliedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchJobId, setSearchJobId] = useState('');
    const [tuitionType, setTuitionType] = useState('All');
    const [district, setDistrict] = useState('All');
    const [area, setArea] = useState('');
    const [subject, setSubject] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [sortBy, setSortBy] = useState('Newest');

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBuyTokensModalOpen, setIsBuyTokensModalOpen] = useState(false);
    const [selectedPostToApply, setSelectedPostToApply] = useState(null);

    // NFR-1: Backend-driven filtering — passes active filters as query params
    // so MongoDB uses indexes instead of filtering in JS on the client.
    const loadData = async (filters = {}) => {
        try {
            setLoading(true);

            // Build params object; omit empty / "All" values so URL stays clean
            const params = {};
            if (filters.subject && filters.subject !== '') params.subject = filters.subject;
            if (filters.area && filters.area !== '')       params.area    = filters.area;
            if (filters.minSalary && filters.minSalary !== '') params.minSalary = filters.minSalary;
            if (filters.maxSalary && filters.maxSalary !== '') params.maxSalary = filters.maxSalary;
            if (filters.sortBy) {
                if (filters.sortBy === 'SalaryDesc') params.sortBy = 'salary-high';
                else if (filters.sortBy === 'SalaryAsc') params.sortBy = 'salary-low';
            }

            const response = await fetchTuitionJobs(params);
            
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

            // Fetch token balance only for instructors (tokens are tutor-only)
            if (user.role === 'instructor') {
                const tokenRes = await axios.get(`http://localhost:5000/api/wallet/tokens/${user._id || user.id || '650000000000000000000002'}`);
                if (tokenRes.data.tokens !== undefined) {
                    setTokens(tokenRes.data.tokens);
                }
            } else {
                setTokens(0);
            }

            // Fetch applied posts if user is instructor
            if (user.role === 'instructor') {
                const appRes = await axios.get(`http://localhost:5000/api/applications/my-applications?tutorId=${user._id || user.id || '650000000000000000000002'}`);
                setAppliedPosts(appRes.data);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    // NFR-1: Initial load + re-fetch whenever role/user or filters change
    useEffect(() => {
        loadData({ subject, area, minSalary, maxSalary, sortBy });
    }, [user.role, user.id, subject, area, minSalary, maxSalary, sortBy]);

    // Apply backend filters — re-fetches from MongoDB using indexes
    const applyFilters = () => {
        loadData({ subject, area, minSalary, maxSalary, sortBy });
    };

    const handleApplicationSuccess = (postId) => {
        setAppliedPosts(prev => [...prev, postId]);
        setTokens(prev => Math.max(0, prev - 1));
    };

    // Client-side filters for fields that don't go to backend
    // (jobId & district are light-weight client filters; heavy ones go to MongoDB)
    const safePosts = Array.isArray(posts) ? posts : [];
    
    const displayedPosts = safePosts.filter(post => {
        const matchesJobId = searchJobId === '' || post.jobId?.toLowerCase().includes(searchJobId.toLowerCase());
        const matchesDistrict = district === 'All' || post.location?.district === district;
        return matchesJobId && matchesDistrict;
    });

    const resetFilters = () => {
        setSearchJobId('');
        setTuitionType('All');
        setDistrict('All');
        setArea('');
        setSubject('');
        setMinSalary('');
        setMaxSalary('');
        setSortBy('Newest');
        // Re-fetch with no filters
        loadData({});
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

                        {/* Token Wallet Badge — Tutors only */}
                        {user.role === 'instructor' && (
                            <button 
                                onClick={() => setIsBuyTokensModalOpen(true)} 
                                className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl hover:bg-amber-500/20 transition-colors"
                            >
                                <span className="text-amber-500 text-xl">🪙</span>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Tokens</div>
                                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{tokens} Balance</div>
                                </div>
                                <span className="ml-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg transition-all shadow-sm">
                                    + Buy
                                </span>
                            </button>
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

                                {/* Search by Subject */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Subject</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Math, Physics"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Search by Area */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Area / Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Dhanmondi, Gulshan"
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
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
                                        <option value="Faridpur">Faridpur</option>
                                        <option value="Gazipur">Gazipur</option>
                                        <option value="Gopalganj">Gopalganj</option>
                                        <option value="Jamalpur">Jamalpur</option>
                                        <option value="Kishoreganj">Kishoreganj</option>
                                        <option value="Madaripur">Madaripur</option>
                                        <option value="Manikganj">Manikganj</option>
                                        <option value="Munshiganj">Munshiganj</option>
                                        <option value="Mymensingh">Mymensingh</option>
                                        <option value="Narayanganj">Narayanganj</option>
                                        <option value="Narsingdi">Narsingdi</option>
                                        <option value="Netrakona">Netrakona</option>
                                        <option value="Rajbari">Rajbari</option>
                                        <option value="Shariatpur">Shariatpur</option>
                                        <option value="Sherpur">Sherpur</option>
                                        <option value="Tangail">Tangail</option>
                                        <option value="Bogura">Bogura</option>
                                        <option value="Joypurhat">Joypurhat</option>
                                        <option value="Naogaon">Naogaon</option>
                                        <option value="Natore">Natore</option>
                                        <option value="Chapainawabganj">Chapainawabganj</option>
                                        <option value="Pabna">Pabna</option>
                                        <option value="Rajshahi">Rajshahi</option>
                                        <option value="Sirajganj">Sirajganj</option>
                                        <option value="Dinajpur">Dinajpur</option>
                                        <option value="Gaibandha">Gaibandha</option>
                                        <option value="Kurigram">Kurigram</option>
                                        <option value="Lalmonirhat">Lalmonirhat</option>
                                        <option value="Nilphamari">Nilphamari</option>
                                        <option value="Panchagarh">Panchagarh</option>
                                        <option value="Rangpur">Rangpur</option>
                                        <option value="Thakurgaon">Thakurgaon</option>
                                        <option value="Barguna">Barguna</option>
                                        <option value="Barisal">Barisal</option>
                                        <option value="Bhola">Bhola</option>
                                        <option value="Jhalokathi">Jhalokathi</option>
                                        <option value="Patuakhali">Patuakhali</option>
                                        <option value="Pirojpur">Pirojpur</option>
                                        <option value="Bandarban">Bandarban</option>
                                        <option value="Brahmanbaria">Brahmanbaria</option>
                                        <option value="Chandpur">Chandpur</option>
                                        <option value="Chattogram">Chattogram</option>
                                        <option value="Comilla">Comilla</option>
                                        <option value="Cox's Bazar">Cox's Bazar</option>
                                        <option value="Feni">Feni</option>
                                        <option value="Khagrachhari">Khagrachhari</option>
                                        <option value="Lakshmipur">Lakshmipur</option>
                                        <option value="Noakhali">Noakhali</option>
                                        <option value="Rangamati">Rangamati</option>
                                        <option value="Habiganj">Habiganj</option>
                                        <option value="Moulvibazar">Moulvibazar</option>
                                        <option value="Sunamganj">Sunamganj</option>
                                        <option value="Sylhet">Sylhet</option>
                                        <option value="Bagerhat">Bagerhat</option>
                                        <option value="Chuadanga">Chuadanga</option>
                                        <option value="Jessore">Jessore</option>
                                        <option value="Jhenaidah">Jhenaidah</option>
                                        <option value="Khulna">Khulna</option>
                                        <option value="Kushtia">Kushtia</option>
                                        <option value="Magura">Magura</option>
                                        <option value="Meherpur">Meherpur</option>
                                        <option value="Narail">Narail</option>
                                        <option value="Satkhira">Satkhira</option>
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

                                {/* Apply Filters — triggers backend query with indexed fields */}
                                <button
                                    onClick={applyFilters}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                                >
                                    🔍 Apply Filters
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Tuition Post Cards Feed */}
                    <section className="w-full lg:w-3/4 space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-[#111827] px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                Showing <span className="text-blue-600 dark:text-blue-400 font-extrabold">{displayedPosts.length}</span> tuition job listings
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sort By:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none cursor-pointer text-gray-700 dark:text-gray-300 focus:border-blue-500"
                                >
                                    <option value="Newest">Newest First</option>
                                    <option value="SalaryDesc">Salary: High to Low</option>
                                    <option value="SalaryAsc">Salary: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500 font-medium animate-pulse">🔄 Loading tuition posts...</div>
                        ) : displayedPosts.length === 0 ? (
                            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                                <h4 className="text-xl font-bold">No Tuition Jobs Found</h4>
                                <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
                            </div>
                        ) : (
                            displayedPosts.map((post) => (
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
                                            appliedPosts.includes(post._id) ? (
                                                <button 
                                                    disabled
                                                    className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-sm px-6 py-2.5 rounded-xl shadow-inner cursor-not-allowed border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                                                >
                                                    <span className="text-green-500">✓</span> Already Applied
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        if (tokens < 1) {
                                                            setIsBuyTokensModalOpen(true);
                                                        } else {
                                                            setSelectedPostToApply(post);
                                                        }
                                                    }}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                                                >
                                                    Apply as Tutor
                                                </button>
                                            )
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

            <CreateTuitionModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                userTokens={tokens}
                user={user}
                onBuyTokensClick={() => {
                    setIsCreateModalOpen(false);
                    setIsBuyTokensModalOpen(true);
                }}
                onPostCreated={loadData}
            />
            
            <BuyTokensModal 
                isOpen={isBuyTokensModalOpen} 
                onClose={() => setIsBuyTokensModalOpen(false)} 
                user={user}
            />
            <ApplyTuitionModal 
                isOpen={!!selectedPostToApply} 
                onClose={() => setSelectedPostToApply(null)} 
                post={selectedPostToApply}
                userTokens={tokens}
                user={user}
                onApplicationSuccess={handleApplicationSuccess}
            />

        </div>
    );
}