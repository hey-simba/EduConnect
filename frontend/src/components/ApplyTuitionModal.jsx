import { useState } from 'react';
import axios from 'axios';

export default function ApplyTuitionModal({ isOpen, onClose, post, userTokens, user, onApplicationSuccess }) {
    const [amount, setAmount] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !post) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (userTokens < 1) {
            setError('Insufficient tokens. Please buy tokens first.');
            return;
        }

        if (!amount || !cvFile) {
            setError('Please provide your preferable amount and upload your CV.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('tutorId', user._id || user.id || '650000000000000000000002');
        formData.append('preferableAmount', amount);
        formData.append('cvFile', cvFile);

        try {
            await axios.post(`http://localhost:5000/api/applications/${post._id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onApplicationSuccess(post._id);
            setAmount('');
            setCvFile(null);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-purple-600 px-6 py-5 flex justify-between items-center text-white">
                    <h2 className="text-xl font-extrabold tracking-tight">Apply for Tuition</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{post.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Location: {post.location?.area}, {post.location?.district}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Budget: {post.salary} Tk/Month</p>
                    </div>

                    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-700/30">
                        <span className="text-amber-500 text-2xl">🪙</span>
                        <div>
                            <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Token Cost</div>
                            <div className="text-sm font-extrabold text-amber-900 dark:text-amber-300">Applying costs 1 Token. Your balance: {userTokens}</div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Preferable Salary Amount (Tk/Month) *
                            </label>
                            <input 
                                type="number" 
                                required
                                placeholder="e.g. 5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Upload CV (PDF/DOC) *
                            </label>
                            <input 
                                type="file" 
                                required
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setCvFile(e.target.files[0])}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading || userTokens < 1}
                                className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all ${
                                    userTokens < 1 
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 hover:-translate-y-0.5'
                                }`}
                            >
                                {loading ? 'Submitting...' : 'Confirm Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
