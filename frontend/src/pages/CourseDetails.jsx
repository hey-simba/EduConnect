import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [hasAccess, setHasAccess] = useState(false); // Global lock state
    const [watchedVideos, setWatchedVideos] = useState([]);
    const [certificateClaimed, setCertificateClaimed] = useState(false);
    
    // Assignments state
    const [assignments, setAssignments] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id || user?.id;

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course details
                const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
                const fetchedCourse = res.data.course;
                setCourse(fetchedCourse);

                let userHasAccess = false;
                let userEnrollment = null;

                // Check access
                if (user) {
                    if (user.role === 'instructor' && userId === fetchedCourse.instructorId) {
                        // The creator of the course has full access
                        userHasAccess = true;
                    } else if (user.role === 'student') {
                        // Check if student is enrolled
                        const enrollmentsRes = await axios.get(`http://localhost:5000/api/courses/enrollments/${userId}`);
                        userEnrollment = enrollmentsRes.data.find(e => e.courseId._id === courseId);
                        if (userEnrollment) {
                            userHasAccess = true;
                            setWatchedVideos(userEnrollment.watchedVideos || []);
                            setCertificateClaimed(userEnrollment.certificateClaimed || false);
                        }
                    }
                }
                
                setHasAccess(userHasAccess);

                // Fetch Assignments
                const assignRes = await axios.get(`http://localhost:5000/api/assignments/course/${courseId}`);
                setAssignments(assignRes.data);

                // Default to first video, but it will be locked if no access
                if (fetchedCourse.videos && fetchedCourse.videos.length > 0) {
                    setActiveVideo(fetchedCourse.videos[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching course", err);
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId, userId]);

    const handleAssignmentSubmit = async (assignmentId, file) => {
        if (!file) return alert('Select a file first');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', userId);

        setUploading(true);
        try {
            await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Assignment submitted successfully!');
            // Refresh assignments
            const assignRes = await axios.get(`http://localhost:5000/api/assignments/course/${courseId}`);
            setAssignments(assignRes.data);
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit assignment');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoSelect = async (video) => {
        if (!hasAccess && !video.isPreview) {
            alert("Please purchase the course to watch premium videos.");
            return;
        }
        
        window.open(video.youtubeUrl, '_blank');
        
        if (user?.role === 'student' && !watchedVideos.includes(video.youtubeUrl)) {
            try {
                const res = await axios.put(`http://localhost:5000/api/courses/${courseId}/progress`, {
                    studentId: userId,
                    videoUrl: video.youtubeUrl
                });
                setWatchedVideos(res.data.watchedVideos);
            } catch (err) {
                console.error("Failed to update progress", err);
            }
        }
    };

    const handleClaimCertificate = async () => {
        try {
            await axios.post(`http://localhost:5000/api/courses/${courseId}/certificate`, { studentId: userId });
            setCertificateClaimed(true);
            alert("Certificate claimed! A PDF has been sent to your email.");
        } catch (err) {
            alert("Failed to claim certificate.");
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            alert("Please sign in to enroll.");
            navigate('/signin');
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {
                studentId: userId
            });
            
            // Integration with Teammate's SSL Commerz backend
            if (res.data.paymentUrl) {
                window.location.href = res.data.paymentUrl; // Redirect to payment gateway
            } else {
                // Fallback if payment is not required or backend isn't ready
                alert(res.data.message || "Enrolled successfully!");
                setHasAccess(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed.");
        }
    };

    const allAssignmentsPassed = assignments.length > 0 ? assignments.every(a => {
        const sub = a.submissions.find(s => s.studentId === userId);
        return sub && sub.status === 'Graded' && sub.grade >= 50;
    }) : true;

    const progress100 = course?.videos?.length > 0 && watchedVideos.length === course.videos.length;

    useEffect(() => {
        // Auto-trigger certificate email when 100% complete and all assignments passed
        if (course && hasAccess && course.hasCertificate && progress100 && allAssignmentsPassed && !certificateClaimed) {
            handleClaimCertificate();
        }
    }, [course, hasAccess, progress100, allAssignmentsPassed, certificateClaimed]);

    if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading Course...</div>;
    if (!course) return <div className="text-center py-20 text-xl text-red-500">Course not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Status Warning Banner for Instructor */}
            {user?.role === 'instructor' && userId === course.instructorId && course.approvalStatus !== 'Approved' && (
                <div className={`text-center py-3 px-6 font-bold text-white shadow-md ${course.approvalStatus === 'Rejected' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                    ⚠️ {course.approvalStatus === 'Rejected' 
                        ? 'This course was rejected by the admin and will not be published.' 
                        : 'This course is pending admin approval. It is currently hidden from students.'}
                </div>
            )}

            {/* Header Banner */}
            <div className="bg-blue-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="md:w-2/3">
                        <span className="bg-blue-700 text-sm py-1 px-3 rounded-full uppercase tracking-wider mb-4 inline-block">
                            {course.category}
                        </span>
                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-lg text-blue-200 mb-6">{course.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">👨‍🏫 Instructor: <strong className="ml-1">{course.instructorName}</strong></span>
                            <span>⭐ {course.averageRating} ({course.totalRatings} ratings)</span>
                            <span>👥 {course.totalEnrollments} Students</span>
                        </div>
                    </div>
                    <div className="md:w-1/3 mt-8 md:mt-0 bg-white text-gray-900 p-6 rounded-xl shadow-xl text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">৳{course.price}</div>
                        
                        {user?.role === 'instructor' ? (
                            userId === course.instructorId ? (
                                <button disabled className="w-full bg-blue-100 text-blue-800 font-bold py-3 px-4 rounded-lg mb-4 cursor-not-allowed border border-blue-200">
                                    You posted this course
                                </button>
                            ) : (
                                <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded-lg mb-4 cursor-not-allowed">
                                    Instructors cannot buy courses
                                </button>
                            )
                        ) : (
                            !hasAccess ? (
                                <button onClick={handleEnroll} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4">
                                    Enroll Now (SSL Commerz)
                                </button>
                            ) : (
                                <button disabled className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg mb-4 cursor-not-allowed">
                                    You are Enrolled
                                </button>
                            )
                        )}

                        <ul className="text-left text-sm space-y-2 text-gray-600">
                            <li>⏱️ {course.totalDuration || 'Self-paced'}</li>
                            <li>📚 {course.videos?.length || 0} Lessons</li>
                            <li>📝 {course.totalAssignments} Assignments</li>
                            <li>🎓 {course.hasCertificate ? 'Certificate of Completion' : 'No Certificate'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content (Player & Curriculum) */}
            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Course Thumbnail & About */}
                <div className="lg:col-span-2">
                    {/* Course Thumbnail & Progress Box */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                        <div className="aspect-video relative bg-gray-900">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-90" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">No Thumbnail</div>
                            )}
                            
                            {!hasAccess && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                    <span className="text-5xl mb-4">🔒</span>
                                    <h3 className="text-xl font-bold">Content Locked</h3>
                                    <p className="text-gray-300 mt-2">Purchase the course to unlock the videos.</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar (Only for Enrolled Students) */}
                        {hasAccess && user?.role === 'student' && (
                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Your Progress</h3>
                                        <p className="text-sm text-gray-500">{watchedVideos.length} of {course.videos?.length || 0} lessons completed</p>
                                    </div>
                                    <div className="text-2xl font-extrabold text-blue-600">
                                        {course.videos?.length > 0 ? Math.round((watchedVideos.length / course.videos.length) * 100) : 0}%
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${course.videos?.length > 0 ? (watchedVideos.length / course.videos.length) * 100 : 0}%` }}></div>
                                </div>

                                {/* Certificate Button */}
                                {course.hasCertificate && course.videos?.length > 0 && watchedVideos.length === course.videos.length && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {certificateClaimed ? (
                                            <div className="bg-green-100 text-green-800 font-bold p-4 rounded-xl text-center flex items-center justify-center gap-2">
                                                <span>🏆</span> Certificate Sent to Email!
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleClaimCertificate}
                                                disabled={!allAssignmentsPassed}
                                                className={`w-full font-extrabold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${allAssignmentsPassed ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black hover:scale-[1.01]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                <span>🎓</span> {allAssignmentsPassed ? 'Claim Your Certificate' : 'Pass All Assignments to Claim'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                            {course.description}
                        </p>
                    </div>

                    {/* Assignments Section */}
                    {hasAccess && assignments.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6">Assignments</h2>
                            <div className="space-y-6">
                                {assignments.map(assignment => {
                                    const submission = assignment.submissions.find(s => s.studentId === userId);
                                    
                                    return (
                                        <div key={assignment._id} className="border border-gray-200 rounded-lg p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-lg text-gray-900">{assignment.title}</h3>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-4 whitespace-pre-line">{assignment.prompt}</p>
                                            
                                            {/* Submission Status */}
                                            {submission ? (
                                                <div className={`p-4 rounded-lg ${submission.status === 'Graded' ? (submission.grade >= 50 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-blue-50 border border-blue-200'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-sm mb-1">
                                                                Status: {submission.status}
                                                            </p>
                                                            <a href={`http://localhost:5000${submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                                                                View Submitted File
                                                            </a>
                                                        </div>
                                                        {submission.status === 'Graded' && (
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Grade</div>
                                                                <div className={`text-2xl font-extrabold ${submission.grade >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {submission.grade}/100
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-4 border-t pt-4">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Submit Your Work (PDF, DOCX, ZIP)</label>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => handleAssignmentSubmit(assignment._id, e.target.files[0])}
                                                        disabled={uploading}
                                                        className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100
                                                        disabled:opacity-50 cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Curriculum List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <h3 className="font-bold text-lg text-gray-800">Course Curriculum</h3>
                            <p className="text-sm text-gray-500">{course.videos?.length || 0} Lessons</p>
                        </div>
                        
                        <div className="max-h-[600px] overflow-y-auto">
                            {course.videos && course.videos.map((video, idx) => {
                                const isWatched = watchedVideos.includes(video.youtubeUrl);
                                return (
                                    <div 
                                        key={video._id || idx}
                                        onClick={() => handleVideoSelect(video)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex justify-between items-center hover:bg-gray-50`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`mt-1 mr-3 flex-shrink-0 text-sm ${!hasAccess && !video.isPreview ? 'text-gray-400' : isWatched ? 'text-green-500' : 'text-blue-600'}`}>
                                                {!hasAccess && !video.isPreview ? '🔒' : isWatched ? '✅' : '▶️'}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-medium ${isWatched ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                    {idx + 1}. {video.title}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                            {video.duration || '00:00'}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!course.videos || course.videos.length === 0) && (
                                <div className="p-6 text-center text-gray-500 italic">No videos uploaded yet.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
