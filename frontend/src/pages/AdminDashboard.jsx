import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/home');
        }
    }, [user, navigate]);

    if (!user || user.role !== 'admin') {
        return null; // Prevents flashing before redirect
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-gray-900 text-white py-12 px-6 shadow-md">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Admin Control Panel</h1>
                    <p className="text-gray-400 text-lg">System Overview & Management</p>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-6 mt-10">
                <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
                    <span className="text-6xl mb-4 block">🛡️</span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, System Administrator</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        This is the secure admin panel. From here, you will be able to review pending instructor applications, approve courses, and manage the platform.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Review Courses</button>
                        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">Manage Users</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
