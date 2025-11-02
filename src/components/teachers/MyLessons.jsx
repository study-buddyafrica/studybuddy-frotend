import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { 
  FaEdit, 
  FaChevronDown, 
  FaChevronUp, 
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaSearch,
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaBookOpen,
  FaVideo,
  FaTimes as FaTimesIcon
} from 'react-icons/fa';
import { FHOST } from '../constants/Functions';

const MyLessons = ({userInfo}) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [lessonRequests, setLessonRequests] = useState([]);
  const [lessonActivity, setLessonActivity] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state for creating new lesson
  const [newLesson, setNewLesson] = useState({
    title: '',
    subject: '',
    grade: '',
    date: '',
    time: '',
    duration: '60',
    max_students: 10,
    description: '',
    lesson_type: 'online'
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const lessonTypes = ['online', 'in-person', 'hybrid'];

  useEffect(() => {
    fetchData();
  }, [userInfo?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Preview videos
      try {
        const videosResponse = await axios.get(`${FHOST}/lessons/api/preview_videos`);
        if (videosResponse.data?.videos) {
          const teacherVideos = videosResponse.data.videos.filter(v => v.teacher_id === userInfo?.id);
          setVideos(teacherVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error fetching preview videos:', err);
        setVideos([]);
      }

      // Upcoming lessons for this teacher
      try {
        const lessonsResponse = await axios.get(`${FHOST}/lessons/api/live-sessions/${userInfo?.id}`);
        const raw = lessonsResponse.data;
        const normalized = Array.isArray(raw)
          ? raw.map(s => ({
              id: s.id,
              title: s.title,
              subject: s.subject?.name || '',
              grade: '',
              date: s.scheduled_date,
              time: '',
              duration: s.basic_info?.duration || '',
              status: 'scheduled',
              current_students: 0,
              max_students: 0,
            }))
          : [];
        setUpcomingLessons(normalized);
      } catch (err) {
        if (err?.response?.status === 404) {
          setUpcomingLessons([]);
        } else {
          console.error('Error fetching teacher live sessions:', err);
        }
      }

      // Lesson requests
      try {
        const requestsResponse = await axios.get(`${FHOST}/lessons/api/bookings/teacher/${userInfo?.id}`);
        const list = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
        const pending = list.filter(b => b.status === 'pending');
        setLessonRequests(pending);
      } catch (err) {
        if (err?.response?.status === 404) {
          setLessonRequests([]);
        } else {
          console.error('Error fetching lesson requests:', err);
        }
      }

      // Lesson activity (accepted/confirmed)
      try {
        const activityResponse = await axios.get(`${FHOST}/lessons/api/bookings/teacher/${userInfo?.id}`);
        const list = Array.isArray(activityResponse.data) ? activityResponse.data : [];
        const activity = list.filter(b => ['accepted', 'confirmed', 'completed'].includes((b.status || '').toLowerCase()));
        setLessonActivity(activity);
      } catch (err) {
        if (err?.response?.status === 404) {
          setLessonActivity([]);
        } else {
          console.error('Error fetching lesson activity:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        topic: newLesson.title,
        agenda: newLesson.description,
        duration: parseInt(newLesson.duration || '60', 10),
        start_time: newLesson.date && newLesson.time ? `${newLesson.date}T${newLesson.time}:00Z` : undefined,
        subject_id: null
      };
      const response = await axios.post(`${FHOST}/lessons/meetings/${userInfo?.id}`, payload);
      
      if (response.status === 201) {
        setSuccessMessage('Lesson created successfully!');
        setShowCreateLessonModal(false);
        setNewLesson({
          title: '',
          subject: '',
          grade: '',
          date: '',
          time: '',
          duration: '60',
          max_students: 10,
          description: '',
          lesson_type: 'online'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      setErrorMessage('Failed to create lesson. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
    const res = await axios.post(`${FHOST}/lessons/teacher/booking-response`, { booking_id: requestId, teacher_id: userInfo?.id, action: "accept" });
    if (res.status === 200) {
      toast.success("Lesson request accepted!");
      fetchData();
    }

    } catch (error) {
      console.error('Error accepting request:', error);
      setErrorMessage('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axios.post(`${FHOST}/lessons/teacher/booking-response`, { booking_id: requestId, teacher_id: userInfo?.id, action: 'decline' });
      if (response.status === 200) {
        setSuccessMessage('Lesson request rejected.');
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setErrorMessage('Failed to reject request. Please try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleDescription = (id) => {
    setExpandedVideo((prev) => (prev === id ? null : id));
  };

  // Filter videos based on the search query
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery) ||
      (video.description && video.description.toLowerCase().includes(searchQuery))
  );

  const tabs = [
    { id: 'videos', name: 'My Videos', icon: <FaVideo /> },
    { id: 'upcoming', name: 'Upcoming Lessons', icon: <FaCalendarAlt /> },
    { id: 'requests', name: 'Lesson Requests', icon: <FaBookOpen /> },
    { id: 'activity', name: 'Lesson Activity', icon: <FaEye /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Lessons</h1>
          <p className="text-gray-600">Manage your lesson content and schedule</p>
        </div>
        {activeTab === 'upcoming' && (
          <button
            onClick={() => setShowCreateLessonModal(true)}
            className="bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Create Lesson
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#01B0F1] text-[#01B0F1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
            />
          </div>
          
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((video) => (
              <div key={video.id} className="p-4 bg-white rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <div className="relative w-full pb-[56.25%] bg-gray-200 rounded overflow-hidden">
                  <video
                    src={`${video.video_url}`}
                    controls
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => toggleDescription(video.id)}
                    className="text-[#01B0F1] text-sm flex items-center w-fit"
                  >
                    {expandedVideo === video.id ? (
                      <>
                        <FaChevronUp className="mr-2" /> Hide Description
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-2" /> Show Description
                      </>
                    )}
                  </button>
                  <button className="text-green-800 text-sm flex items-center w-fit">
                    <FaEdit className="mr-2" />
                  </button>
                </div>
                {expandedVideo === video.id && (
                  <p className="mt-2 text-gray-700">{video.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingLessons.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No upcoming lessons</h3>
              <p className="text-gray-500 mt-2">Create your first lesson to get started</p>
              <button
                onClick={() => setShowCreateLessonModal(true)}
                className="mt-4 bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors"
              >
                Create Lesson
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaBookOpen />
                          {lesson.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUser />
                          Grade {lesson.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(lesson.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {lesson.time} ({lesson.duration} min)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {lesson.current_students}/{lesson.max_students} students
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lesson.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {lessonRequests.length === 0 ? (
            <div className="text-center py-12">
              <FaBookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No lesson requests</h3>
              <p className="text-gray-500 mt-2">Students will appear here when they request lessons</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {lessonRequests.map((request) => (
                <div key={request.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{request.student_name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaBookOpen />
                          {request.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUser />
                          Grade {request.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(request.requested_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {request.requested_time} ({request.duration} min)
                        </span>
                      </div>
                      {request.message && (
                        <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        <FaCheck />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        <FaTimes />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          {lessonActivity.length === 0 ? (
            <div className="text-center py-12">
              <FaEye className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No lesson activity</h3>
              <p className="text-gray-500 mt-2">Your lesson history will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {lessonActivity.map((activity) => (
                <div key={activity.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{activity.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {activity.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUser />
                          {activity.students_attended} students attended
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Create New Lesson</h2>
              <button
                onClick={() => setShowCreateLessonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesIcon className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLesson} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Enter lesson title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    required
                    value={newLesson.subject}
                    onChange={(e) => setNewLesson({...newLesson, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select
                    required
                    value={newLesson.grade}
                    onChange={(e) => setNewLesson({...newLesson, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type *</label>
                  <select
                    required
                    value={newLesson.lesson_type}
                    onChange={(e) => setNewLesson({...newLesson, lesson_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  >
                    {lessonTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newLesson.date}
                    onChange={(e) => setNewLesson({...newLesson, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={newLesson.time}
                    onChange={(e) => setNewLesson({...newLesson, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="180"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={newLesson.max_students}
                    onChange={(e) => setNewLesson({...newLesson, max_students: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  placeholder="Describe what this lesson will cover"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateLessonModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default MyLessons;
