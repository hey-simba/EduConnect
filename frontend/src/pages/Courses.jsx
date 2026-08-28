import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating, interactive = false, onRate = () => {}, size = 'md' }) {
    const [hovered, setHovered] = useState(0);
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    const displayRating = interactive ? (hovered || rating) : rating;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onRate(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={`${sizeClass} transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    <svg viewBox="0 0 24 24" fill={star <= displayRating ? '#F59E0B' : 'none'} stroke={star <= displayRating ? '#F59E0B' : '#6B7280'} strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ isOpen, onClose, course, user, onReviewSuccess }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setError('Please select a star rating.');
        setError('');
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE}/courses/${course._id}/reviews`, {
                studentId: user._id || user.id,
                studentName: user.name,
                rating,
                comment
            });
            onReviewSuccess(res.data);
            onClose();
            setRating(0);
            setComment('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !course) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">⭐ Rate This Course</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl font-bold">✕</button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You're reviewing: <span className="text-gray-900 dark:text-white font-semibold">{course.title}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center gap-2 py-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Your Rating</p>
                        <StarRating rating={rating} interactive onRate={setRating} size="lg" />
                        <p className="text-sm text-amber-500 dark:text-amber-400 font-bold h-5">
                            {rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] : ''}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-500 mb-1">Your Review (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share what you liked or disliked about this course..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-orange-500 hover:from-amber-500 hover:to-orange-500 dark:hover:from-amber-400 dark:hover:to-orange-400 text-black font-extrabold py-3 rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Course Detail Modal ──────────────────────────────────────────────────────
function CourseDetailModal({ isOpen, onClose, courseId, user, enrolledIds, onEnrollSuccess, onReviewSuccess }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        if (!isOpen || !courseId) return;
        setLoading(true);
        axios.get(`${API_BASE}/courses/${courseId}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [isOpen, courseId]);

    const handleEnroll = async () => {
        setEnrollError('');
        setEnrolling(true);
        try {
            const res = await axios.post(`${API_BASE}/courses/${courseId}/enroll`, {
                studentId: user._id || user.id
            });
            onEnrollSuccess(res.data);
            // Refresh course data to get updated enrollment count
            const updated = await axios.get(`${API_BASE}/courses/${courseId}`);
            setData(updated.data);
        } catch (err) {
            setEnrollError(err.response?.data?.message || 'Enrollment failed.');
        } finally {
            setEnrolling(false);
        }
    };

    if (!isOpen) return null;

    const course = data?.course;
    const reviews = data?.reviews || [];
    const isEnrolled = course && enrolledIds.includes(course._id);
    const userId = user?._id || user?.id;
    const hasReviewed = reviews.some(r => r.studentId === userId || r.studentId?._id === userId);

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center px-6 py-4 z-10">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Course Details</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl font-bold">✕</button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading...</div>
                ) : course ? (
                    <div className="p-6 space-y-6">
                        {/* Course Thumbnail */}
                        {course.thumbnail && (
                            <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Course Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-1 rounded-lg">{course.category}</span>
                                <span className="text-xs font-bold bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-1 rounded-lg">{course.level}</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{course.title}</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{course.description}</p>
                            <p className="text-sm text-gray-500 mt-2">by <span className="text-blue-600 dark:text-cyan-400 font-semibold">{course.instructorName}</span></p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <div className="text-amber-500 dark:text-amber-400 font-extrabold text-lg">{course.averageRating.toFixed(1)}</div>
                                <StarRating rating={Math.round(course.averageRating)} size="sm" />
                                <div className="text-xs text-gray-500 mt-1">{course.totalRatings} reviews</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <div className="text-green-600 dark:text-green-400 font-extrabold text-lg">{course.totalEnrollments}</div>
                                <div className="text-xs text-gray-500">students</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <div className="text-green-600 dark:text-green-400 font-extrabold text-lg">৳{course.price}</div>
                                <div className="text-xs text-gray-500">price</div>
                            </div>
                        </div>

                        {/* Enroll / Review CTA */}
                        <div className="space-y-3">
                            {user?.role === 'instructor' ? (
                                (userId === (course.instructorId?._id || course.instructorId)) ? (
                                    <button disabled className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-blue-200 dark:border-blue-800">
                                        You posted this course
                                    </button>
                                ) : (
                                    <button disabled className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                        Instructors cannot buy courses
                                    </button>
                                )
                            ) : isEnrolled ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 font-bold text-sm py-3 px-4 rounded-xl text-center">
                                        ✓ Enrolled
                                    </div>
                                    {!hasReviewed && (
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="flex-1 bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 text-black font-extrabold text-sm py-3 rounded-xl transition-all hover:scale-[1.01]"
                                        >
                                            ⭐ Leave a Review
                                        </button>
                                    )}
                                    {hasReviewed && (
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm py-3 rounded-xl text-center font-semibold">
                                            ✓ Reviewed
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-extrabold py-3 rounded-xl transition-all hover:scale-[1.01] shadow-lg disabled:opacity-50"
                                >
                                    {enrolling ? '⏳ Processing...' : `🎓 Enroll for ৳${course.price}`}
                                </button>
                            )}
                            {enrollError && <p className="text-red-500 dark:text-red-400 text-sm font-medium text-center">{enrollError}</p>}
                        </div>

                        {/* Curriculum Preview */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h4 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                📚 Course Curriculum
                                <span className="text-xs font-normal text-gray-500">({course.videos?.length || 0} Lessons)</span>
                            </h4>
                            {course.videos && course.videos.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {course.videos.map((vid, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 text-sm">🔒</span>
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{idx + 1}. {vid.title}</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{vid.duration || ''}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center py-2">No videos added yet.</p>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h4 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                ⭐ Student Reviews
                                <span className="text-xs font-normal text-gray-500">({reviews.length})</span>
                            </h4>
                            {reviews.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No reviews yet. Be the first!</p>
                            ) : (
                                <div className="space-y-3">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-transparent">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{review.studentName}</span>
                                                <StarRating rating={review.rating} size="sm" />
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">{review.comment}</p>
                                            )}
                                            <p className="text-[10px] text-gray-500 dark:text-gray-600 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                course={course}
                user={user}
                onReviewSuccess={(data) => {
                    onReviewSuccess(data);
                    setShowReviewModal(false);
                    // Re-fetch course to show updated rating
                    axios.get(`${API_BASE}/courses/${courseId}`).then(res => setData(res.data));
                }}
            />
        </div>
    );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, isEnrolled, onClick }) {
    const categoryColors = {
        Math: 'bg-blue-500/20 text-blue-400',
        Science: 'bg-green-500/20 text-green-400',
        English: 'bg-purple-500/20 text-purple-400',
        Bengali: 'bg-orange-500/20 text-orange-400',
        ICT: 'bg-cyan-500/20 text-cyan-400',
        Commerce: 'bg-yellow-500/20 text-yellow-400',
        Arts: 'bg-pink-500/20 text-pink-400',
        Other: 'bg-gray-500/20 text-gray-400'
    };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer group"
        >
            {/* Thumbnail */}
            <div className="h-44 bg-gradient-to-br from-blue-100 via-purple-100 to-gray-200 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-300">
                        {{ Math: '📐', Science: '🔬', English: '📚', Bengali: '🖊️', ICT: '💻', Commerce: '📊', Arts: '🎨' }[course.category] || '📖'}
                    </div>
                )}
                {isEnrolled && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                        ✓ Enrolled
                    </div>
                )}
                <div className="absolute bottom-3 left-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[course.category] || categoryColors.Other} backdrop-blur-sm bg-white/80 dark:bg-black/50 shadow-sm`}>
                        {course.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                    {course.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">by {course.instructorName}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={Math.round(course.averageRating)} size="sm" />
                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400">{course.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">({course.totalRatings})</span>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                        <span className="text-green-600 dark:text-green-400 font-bold">৳</span>
                        <span className="text-sm font-extrabold text-gray-900 dark:text-white">{course.price}</span>
                    </div>
                    <span className="text-xs text-gray-500">{course.totalEnrollments} students</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Courses Page ────────────────────────────────────────────────────────
export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [tokens, setTokens] = useState(0);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')) || { id: '650000000000000000000001', name: 'Demo User', role: 'student' }; }
        catch { return { id: '650000000000000000000001', name: 'Demo User', role: 'student' }; }
    })();
    const userId = user._id || user.id;

    const CATEGORIES = ['All', 'Math', 'Science', 'English', 'Bengali', 'ICT', 'Commerce', 'Arts', 'Other'];

    const loadCourses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory !== 'All') params.category = selectedCategory;
            params.sortBy = sortBy;
            const res = await axios.get(`${API_BASE}/courses`, { params });
            setCourses(res.data);
        } catch (err) {
            console.error('Load courses error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadEnrollments = async () => {
        try {
            const res = await axios.get(`${API_BASE}/courses/enrollments/${userId}`);
            const ids = res.data.map(e => e.courseId?._id || e.courseId);
            setEnrolledIds(ids);
        } catch (err) {
            console.error('Load enrollments error:', err);
        }
    };

    const loadTokens = async () => {
        try {
            const res = await axios.get(`${API_BASE}/wallet/tokens/${userId}`);
            if (res.data.tokens !== undefined) setTokens(res.data.tokens);
        } catch (err) {
            console.error('Load tokens error:', err);
        }
    };

    useEffect(() => {
        loadCourses();
        loadEnrollments();
        loadTokens();
    }, [selectedCategory, sortBy]);

    const handleEnrollSuccess = (data) => {
        setEnrolledIds(prev => [...prev, selectedCourseId]);
        setTokens(data.remainingTokens ?? tokens);
    };

    const handleReviewSuccess = (data) => {
        // Update the course's rating in the list optimistically
        setCourses(prev => prev.map(c =>
            c._id === selectedCourseId
                ? { ...c, averageRating: data.newAverageRating, totalRatings: data.totalRatings }
                : c
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            {/* Page Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] border-b border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #1D4ED8 0%, transparent 50%), radial-gradient(circle at 75% 50%, #7C3AED 0%, transparent 50%)' }}>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
                            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Courses</span>
                        </h1>
                        <p className="text-blue-100 dark:text-gray-400 text-lg max-w-xl">
                            Learn from expert instructors. Purchase courses securely with SSL Commerz and study at your own pace.
                        </p>
                    </div>
                    {user?.role === 'instructor' && (
                        <div className="mt-6 md:mt-0">
                            <a href="/instructor/create-course" className="inline-block bg-white text-blue-900 hover:bg-gray-100 font-extrabold py-4 px-8 rounded-xl shadow-lg transition-all hover:scale-[1.02]">
                                + Add New Course
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Filter & Sort Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Category pills */}
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border ${
                                    selectedCategory === cat
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:text-gray-900 dark:hover:border-gray-500 dark:hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-500 min-w-[180px]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="rating">Highest Rated</option>
                        <option value="popular">Most Popular</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-500 mb-6">
                    Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{courses.length}</span> courses
                    {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                </p>

                {/* Course Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-72 animate-pulse border border-gray-200 dark:border-gray-800" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Courses Found</h3>
                        <p className="text-gray-500">Try a different category or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                isEnrolled={enrolledIds.includes(course._id)}
                                onClick={() => setSelectedCourseId(course._id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Course Detail Modal */}
            <CourseDetailModal
                isOpen={!!selectedCourseId}
                onClose={() => setSelectedCourseId(null)}
                courseId={selectedCourseId}
                user={user}
                enrolledIds={enrolledIds}
                onEnrollSuccess={handleEnrollSuccess}
                onReviewSuccess={handleReviewSuccess}
            />
        </div>
    );
}
