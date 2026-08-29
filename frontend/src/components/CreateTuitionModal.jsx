import { useState } from 'react';
import { createTuitionPost } from "../services/tuitionService.js";

export default function CreateTuitionModal({ isOpen, onClose, onPostCreated, user }) {
    const [formData, setFormData] = useState({
        title: '',
        medium: 'Bangla Medium',
        classLevel: '',
        salary: '',
        district: 'Dhaka',
        area: '',
        subjects: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setError('');

        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user'));
            const { subjects, ...restFormData } = formData;

            const newPost = {
                ...restFormData,
                salary: Number(formData.salary),
                subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
                studentName: currentUser?.name || 'Anonymous',
                studentId: currentUser?._id || currentUser?.id || '650000000000000000000001',
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
            setError(error.response?.data?.message || error.message || "Failed to create post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111827] w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Post Tutor Wanted</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-lg">✕</button>
                </div>

                <div className="mb-4 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-700/30">
                    <span className="text-amber-500 text-xl">🪙</span>
                    <div>
                        <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Posting Costs 1 Token</div>
                        <div className="text-sm font-extrabold text-amber-900 dark:text-amber-300">
                            You must have at least 1 token in your wallet to post.
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-semibold p-3 rounded-xl border border-red-200 dark:border-red-800/30">
                        <span>{error}</span>
                    </div>
                )}

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
                                <option>University Level</option>
                                <option>Madrasah</option>
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
                                <option>Faridpur</option>
                                <option>Gazipur</option>
                                <option>Gopalganj</option>
                                <option>Jamalpur</option>
                                <option>Kishoreganj</option>
                                <option>Madaripur</option>
                                <option>Manikganj</option>
                                <option>Munshiganj</option>
                                <option>Mymensingh</option>
                                <option>Narayanganj</option>
                                <option>Narsingdi</option>
                                <option>Netrakona</option>
                                <option>Rajbari</option>
                                <option>Shariatpur</option>
                                <option>Sherpur</option>
                                <option>Tangail</option>
                                <option>Bogura</option>
                                <option>Joypurhat</option>
                                <option>Naogaon</option>
                                <option>Natore</option>
                                <option>Chapainawabganj</option>
                                <option>Pabna</option>
                                <option>Rajshahi</option>
                                <option>Sirajganj</option>
                                <option>Dinajpur</option>
                                <option>Gaibandha</option>
                                <option>Kurigram</option>
                                <option>Lalmonirhat</option>
                                <option>Nilphamari</option>
                                <option>Panchagarh</option>
                                <option>Rangpur</option>
                                <option>Thakurgaon</option>
                                <option>Barguna</option>
                                <option>Barisal</option>
                                <option>Bhola</option>
                                <option>Jhalokathi</option>
                                <option>Patuakhali</option>
                                <option>Pirojpur</option>
                                <option>Bandarban</option>
                                <option>Brahmanbaria</option>
                                <option>Chandpur</option>
                                <option>Chattogram</option>
                                <option>Comilla</option>
                                <option>Cox's Bazar</option>
                                <option>Feni</option>
                                <option>Khagrachhari</option>
                                <option>Lakshmipur</option>
                                <option>Noakhali</option>
                                <option>Rangamati</option>
                                <option>Habiganj</option>
                                <option>Moulvibazar</option>
                                <option>Sunamganj</option>
                                <option>Sylhet</option>
                                <option>Bagerhat</option>
                                <option>Chuadanga</option>
                                <option>Jessore</option>
                                <option>Jhenaidah</option>
                                <option>Khulna</option>
                                <option>Kushtia</option>
                                <option>Magura</option>
                                <option>Meherpur</option>
                                <option>Narail</option>
                                <option>Satkhira</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Area</label>
                            <input required type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Dhanmondi" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Subjects (Comma separated)</label>
                        <input required type="text" name="subjects" value={formData.subjects} onChange={handleChange} placeholder="e.g. Math, Chemistry, English" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Salary (Tk / Month)</label>
                        <input required type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. 5000" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Tuition Job'}
                    </button>
                </form>
            </div>
        </div>
    );
}