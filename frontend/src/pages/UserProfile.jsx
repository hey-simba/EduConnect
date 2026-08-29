import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE}/users/${id}/profile`);
                setProfile(res.data);
            } catch (err) {
                console.error('Load profile error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id]);

    const handleMessage = () => {
        navigate(`/messages?userId=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
                <div className="text-gray-500 font-medium">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
                <div className="text-gray-500 font-medium">User not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-md">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{profile.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">{profile.email}</p>
                            <span className="inline-block px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full capitalize">
                                {profile.role}
                            </span>
                        </div>
                        <button
                            onClick={handleMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            💬 Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
