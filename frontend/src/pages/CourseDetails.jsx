import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course details
                const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
                setCourse(res.data.course);

                // Set the first available preview video as the active video
                if (res.data.course.videos && res.data.course.videos.length > 0) {
                    const firstPreview = res.data.course.videos.find(v => v.isPreview);
                    setActiveVideo(firstPreview || res.data.course.videos[0]);
                }

                // If user is logged in, check if they are enrolled
                if (user) {
                    const enrollmentsRes = await axios.get(`http://localhost:5000/api/courses/enrollments/${user.id}`);
                    const hasEnrolled = enrollmentsRes.data.some(e => e.courseId._id === courseId);
                    setIsEnrolled(hasEnrolled);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching course", err);
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId]);

    const handleVideoSelect = (video) => {
        if (video.isPreview || isEnrolled) {
            setActiveVideo(video);
        } else {
            alert("This video is locked. Please enroll in the course to access it.");
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
                studentId: user.id
            });
            alert(res.data.message);
            setIsEnrolled(true);
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed.");
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading Course...</div>;
    if (!course) return <div className="text-center py-20 text-xl text-red-500">Course not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
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
                        {!isEnrolled ? (
                            <button onClick={handleEnroll} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4">
                                Enroll Now
                            </button>
                        ) : (
                            <button disabled className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg mb-4 cursor-not-allowed">
                                You are Enrolled
                            </button>
                        )}
                        <ul className="text-left text-sm space-y-2 text-gray-600">
                            <li>⏱️ {course.totalDuration || 'Self-paced'}</li>
                            <li>📚 {course.totalLessons} Lessons</li>
                            <li>📝 {course.totalAssignments} Assignments</li>
                            <li>🎓 {course.hasCertificate ? 'Certificate of Completion' : 'No Certificate'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content (Player & Curriculum) */}
            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Video Player & About */}
                <div className="lg:col-span-2">
                    {/* Video Player Box */}
                    <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video mb-6">
                        {activeVideo && (activeVideo.isPreview || isEnrolled) ? (
                            <ReactPlayer 
                                url={activeVideo.youtubeUrl} 
                                width="100%" 
                                height="100%" 
                                controls={true}
                                config={{ youtube: { playerVars: { modestbranding: 1, rel: 0 } } }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white bg-gray-800">
                                <span className="text-5xl mb-4">🔒</span>
                                <h3 className="text-xl font-bold">Content Locked</h3>
                                <p className="text-gray-400 mt-2">Enroll in the course to unlock this video.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                            {course.description}
                        </p>
                    </div>
                </div>

                {/* Right Col: Curriculum List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <h3 className="font-bold text-lg text-gray-800">Course Curriculum</h3>
                            <p className="text-sm text-gray-500">{course.videos?.length || 0} Lessons</p>
                        </div>
                        
                        <div className="max-h-[600px] overflow-y-auto">
                            {course.videos && course.videos.map((video, idx) => (
                                <div 
                                    key={video._id || idx}
                                    onClick={() => handleVideoSelect(video)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex justify-between items-center
                                        ${activeVideo && activeVideo.youtubeUrl === video.youtubeUrl ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex items-start">
                                        <div className={`mt-1 mr-3 flex-shrink-0 text-sm ${video.isPreview || isEnrolled ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {video.isPreview || isEnrolled ? '▶️' : '🔒'}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-medium ${activeVideo && activeVideo.youtubeUrl === video.youtubeUrl ? 'text-blue-700' : 'text-gray-800'}`}>
                                                {idx + 1}. {video.title}
                                            </h4>
                                            {video.isPreview && !isEnrolled && (
                                                <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">Free Preview</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {video.duration || '00:00'}
                                    </div>
                                </div>
                            ))}
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
