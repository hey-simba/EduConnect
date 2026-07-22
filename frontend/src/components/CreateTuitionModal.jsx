import React, { useState } from 'react';
import { createTuitionPost } from "../services/tuitionService.js";

export default function CreateTuitionModal({ isOpen, onClose, onPostCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        medium: 'Bangla Medium',
        classLevel: '',
        salary: '',
        district: 'Dhaka',
        area: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            const newPost = {
                ...formData,
                salary: Number(formData.salary),
                studentName: user?.name || 'Anonymous',
                location: {
                    district: formData.district,
                    area: formData.area
                },
                jobId: Math.floor(100000 + Math.random() * 900000).toString() 
            };

            await createTuitionPost(newPost);
            
            if (onPostCreated) onPostCreated(); 
            onClose();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111827] w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Post Tutor Wanted</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Post Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Need a math tutor for Class 8" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Medium</label>
                            <select name="medium" value={formData.medium} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500">
                                <option>Bangla Medium</option>
                                <option>English Medium</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Class Level</label>
                            <input required type="text" name="classLevel" value={formData.classLevel} onChange={handleChange} placeholder="e.g. Class 8" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">District</label>
                            <select name="district" value={formData.district} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500">
                                <option>Dhaka</option>
                                <option>Chattogram</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Area</label>
                            <input required type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Dhanmondi" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Salary (Tk / Month)</label>
                        <input required type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. 5000" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Tuition Job'}
                    </button>
                </form>
            </div>
        </div>
    );
}