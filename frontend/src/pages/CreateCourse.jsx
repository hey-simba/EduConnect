import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateCourse() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false); // New success state
    
    // Core Course Details
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Other',
        level: 'Beginner',
        thumbnail: '',
        totalDuration: '',
        totalAssignments: 0,
        hasCertificate: true,
        playlistUrl: ''
    });

    // Dynamic Video Curriculum
    const [videos, setVideos] = useState([
        { title: '', youtubeUrl: '', isPreview: false, duration: '' }
    ]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleVideoChange = (index, field, value) => {
        const newVideos = [...videos];
        newVideos[index][field] = field === 'isPreview' ? value : value;
        setVideos(newVideos);
    };

    const addVideoRow = () => {
        setVideos([...videos, { title: '', youtubeUrl: '', isPreview: false, duration: '' }]);
    };

    const removeVideoRow = (index) => {
        const newVideos = [...videos];
        newVideos.splice(index, 1);
        setVideos(newVideos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Get user from local storage (mock instructor auth)
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('You must be logged in to create a course.');
                setLoading(false);
                return;
            }
            const user = JSON.parse(userStr);

            const payload = {
                ...formData,
                price: Number(formData.price),
                instructorId: user.id, // Or _id based on how auth is setup
                instructorName: user.name,
                videos
            };

            const response = await axios.post('http://localhost:5000/api/courses', payload);
            if (response.data) {
                setSubmitted(true); // Show the success screen
            }
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.message || 'Failed to create course. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') {
        return <div className="text-center py-20 text-red-500 font-bold text-2xl">Access Denied. Only verified instructors can create courses.</div>;
    }

    // ✅ SUCCESS SCREEN — shown after course is submitted
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-lg w-full text-center">
                    {/* Animated Checkmark */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Course Submitted! 🎉
                    </h2>

                    <p className="text-gray-600 text-lg mb-2">
                        Thank you for your course submission.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                        <p className="text-blue-800 text-sm font-medium flex items-start gap-2">
                            <span className="mt-0.5">🔔</span>
                            <span>
                                Our admin team will review your course content and notify you once it has been <strong>approved</strong>. 
                                Your course will go live on EduConnect immediately after approval.
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/instructor-dashboard')}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({
                                    title: '', description: '', price: '', category: 'Other',
                                    level: 'Beginner', thumbnail: '', totalDuration: '',
                                    totalAssignments: 0, hasCertificate: true, playlistUrl: ''
                                });
                                setVideos([{ title: '', youtubeUrl: '', isPreview: false, duration: '' }]);
                            }}
                            className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                        >
                            Submit Another Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 my-10 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Course</h1>
            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">1. Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Course Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleFormChange} required className="w-full p-2 border rounded" placeholder="e.g. Master Web Development" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleFormChange} required className="w-full p-2 border rounded" rows="4" placeholder="What will students learn?"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (in Tokens/BDT) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleFormChange} required className="w-full p-2 border rounded" placeholder="e.g. 1500" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                            <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border rounded">
                                <option value="Science">Science</option>
                                <option value="Math">Math</option>
                                <option value="English">English</option>
                                <option value="ICT">ICT</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Level</label>
                            <select name="level" value={formData.level} onChange={handleFormChange} className="w-full p-2 border rounded">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Highlights */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">2. Course Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Duration</label>
                            <input type="text" name="totalDuration" value={formData.totalDuration} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="e.g. 15 Hours" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Assignments</label>
                            <input type="number" name="totalAssignments" value={formData.totalAssignments} onChange={handleFormChange} className="w-full p-2 border rounded" min="0" />
                        </div>
                        <div className="flex items-center mt-6">
                            <input type="checkbox" name="hasCertificate" checked={formData.hasCertificate} onChange={handleFormChange} id="cert" className="mr-2 h-5 w-5" />
                            <label htmlFor="cert" className="text-sm font-medium">Offers Certificate of Completion</label>
                        </div>
                    </div>
                </div>

                {/* 3. Curriculum / Videos */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">3. Curriculum (YouTube Links)</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Main Playlist URL (Optional)</label>
                        <input type="text" name="playlistUrl" value={formData.playlistUrl} onChange={handleFormChange} className="w-full p-2 border rounded" placeholder="https://youtube.com/playlist?list=..." />
                    </div>

                    <div className="space-y-4">
                        {videos.map((video, index) => (
                            <div key={index} className="p-4 border rounded bg-white relative">
                                {videos.length > 1 && (
                                    <button type="button" onClick={() => removeVideoRow(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">X</button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Video Title</label>
                                        <input type="text" required value={video.title} onChange={(e) => handleVideoChange(index, 'title', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. 1. Introduction" />
                                    </div>
                                    <div className="md:col-span-5">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">YouTube Video URL</label>
                                        <input type="url" required value={video.youtubeUrl} onChange={(e) => handleVideoChange(index, 'youtubeUrl', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="https://youtube.com/watch?v=..." />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Access</label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={video.isPreview} onChange={(e) => handleVideoChange(index, 'isPreview', e.target.checked)} className="sr-only peer" />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-900">{video.isPreview ? 'Free Preview' : 'Locked'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addVideoRow} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 transition-colors">+ Add Another Video</button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                    {loading ? 'Submitting for Verification...' : 'Submit Course to Admin'}
                </button>
            </form>
        </div>
    );
}
