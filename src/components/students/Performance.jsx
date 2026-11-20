import React, { useState, useEffect } from "react";
import { FaStar, FaChartLine, FaGraduationCap, FaBookOpen, FaClock, FaFlag, FaThumbsUp, FaThumbsDown, FaUserGraduate } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";
import { formatSubjects, normalizeSubjectList } from "../../utils/subjectUtils";

const Performance = ({ userInfo, darkMode }) => {
  const [activeTab, setActiveTab] = useState("academic");
  const [teachers, setTeachers] = useState([]);
  const [academicData, setAcademicData] = useState({
    subjects: [],
    overallProgress: 0,
    totalStudyTime: 0,
    completedLessons: 0,
    averageRating: 0
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: "",
    teacher_id: null
  });
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
    teacher_id: null
  });
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchAcademicData();
  }, []);

  const fetchTeachers = async () => {
    try {
      // First, get completed lessons for the student
      const lessonsResponse = await axios.get(`${FHOST}/lessons/api/completed-lessons/${userInfo?.id}`);
      
      if (lessonsResponse.data.success) {
        const completedLessons = lessonsResponse.data.lessons || [];
        
        // Extract unique teacher IDs from completed lessons
        const teacherIds = [...new Set(completedLessons.map(lesson => lesson.teacher_id))];
        
        if (teacherIds.length > 0) {
          // Fetch teacher details for those IDs
          const teachersResponse = await axios.get(`${FHOST}/users/api/teachers-by-ids`, {
            params: { teacher_ids: teacherIds }
          });
          
          if (teachersResponse.data.success) {
            // Combine teacher data with lesson data and ratings
            const teachersWithData = teachersResponse.data.teachers.map(teacher => {
              const teacherLessons = completedLessons.filter(lesson => lesson.teacher_id === teacher.id);
              const totalLessons = teacherLessons.length;
              const totalHours = teacherLessons.reduce((sum, lesson) => sum + (lesson.duration || 1), 0);
              
              return {
                ...teacher,
                subjects: normalizeSubjectList(teacher.subjects),
                totalLessons,
                totalHours,
                lastLessonDate: teacherLessons.length > 0 ? 
                  new Date(Math.max(...teacherLessons.map(l => new Date(l.date)))) : null
              };
            });
            
            setTeachers(teachersWithData);
          }
        } else {
          setTeachers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const response = await axios.get(`${FHOST}/performance/api/student-performance/${userInfo?.id}`);
      if (response.data.success) {
        setAcademicData(response.data.performance);
      }
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${FHOST}/ratings/api/submit-rating`, {
        teacher_id: ratingForm.teacher_id,
        student_id: userInfo?.id,
        rating: ratingForm.rating,
        comment: ratingForm.comment
      });
      
      if (response.data.success) {
        alert('Rating submitted successfully!');
        setRatingForm({ rating: 5, comment: "", teacher_id: null });
        setShowRatingModal(false);
        setSelectedTeacher(null);
        fetchTeachers(); // Refresh to show updated ratings
      }
    } catch (error) {
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${FHOST}/reports/api/submit-report`, {
        teacher_id: reportForm.teacher_id,
        student_id: userInfo?.id,
        reason: reportForm.reason,
        description: reportForm.description
      });
      
      if (response.data.success) {
        alert('Report submitted successfully! We will review this issue.');
        setReportForm({ reason: "", description: "", teacher_id: null });
        setShowReportModal(false);
        setSelectedTeacher(null);
      }
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    }
  };

  const openRatingModal = (teacher) => {
    setSelectedTeacher(teacher);
    setRatingForm({ ...ratingForm, teacher_id: teacher.id });
    setShowRatingModal(true);
  };

  const openReportModal = (teacher) => {
    setSelectedTeacher(teacher);
    setReportForm({ ...reportForm, teacher_id: teacher.id });
    setShowReportModal(true);
  };

  const closeModals = () => {
    setShowRatingModal(false);
    setShowReportModal(false);
    setSelectedTeacher(null);
    setRatingForm({ rating: 5, comment: "", teacher_id: null });
    setReportForm({ reason: "", description: "", teacher_id: null });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-josefin text-slate-700">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-lilita text-2xl text-[#015575] sm:text-3xl">Performance & Teacher Feedback</h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Track your academic progress and provide feedback to teachers you've worked with
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("academic")}
                className={`flex-1 rounded-xl px-4 py-2 transition-all ${
                  activeTab === "academic"
                    ? "bg-[#015575] text-white shadow-sm"
                    : "bg-[#eaf6fc] text-[#015575] hover:bg-[#cdeafd]"
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Academic Performance
              </button>
              <button
                onClick={() => setActiveTab("teachers")}
                className={`flex-1 rounded-xl px-4 py-2 transition-all ${
                  activeTab === "teachers"
                    ? "bg-[#015575] text-white shadow-sm"
                    : "bg-[#eaf6fc] text-[#015575] hover:bg-[#cdeafd]"
                }`}
              >
                <FaGraduationCap className="inline mr-2" />
                Rate & Report Teachers
              </button>
            </div>
          </nav>
        </div>

        {/* Academic Performance Tab */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="p-6 rounded-xl shadow-lg bg-white">
              <h2 className="text-2xl font-bold mb-6">Overall Academic Progress</h2>
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="3"
                      strokeDasharray={`${academicData.overallProgress}, 100`}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#01B0F1" />
                        <stop offset="100%" stopColor="#015575" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{academicData.overallProgress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="rounded-xl border border-[#cdeafd] bg-[#f2f9fe] p-6 shadow-sm">
                  <div className="text-3xl font-bold text-blue-700 mb-2">{academicData.completedLessons || 0}</div>
                  <div className="text-sm font-medium text-blue-600">Lessons Completed</div>
                </div>
                <div className="rounded-xl border border-[#cdeafd] bg-[#f2f9fe] p-6 shadow-sm">
                  <div className="mb-2 text-3xl font-bold text-[#015575]">{academicData.totalStudyTime || 0}h</div>
                  <div className="text-sm font-medium text-[#015575]">Total Study Time</div>
                </div>
                <div className="rounded-xl border border-[#cdeafd] bg-[#f2f9fe] p-6 shadow-sm">
                  <div className="mb-2 text-3xl font-bold text-[#015575]">{academicData.averageRating || 0}★</div>
                  <div className="text-sm font-medium text-[#015575]">Avg. Teacher Rating</div>
                </div>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="p-6 rounded-xl shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-4">Subject Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {academicData.subjects.map((subject) => {
                  const colorScheme = {
                    bg: "from-[#f2f9fe] to-[#eaf6fc]",
                    border: "border-[#cdeafd]",
                    text: "text-[#015575]",
                    progress: "bg-[#01B0F1]",
                  };

                  return (
                    <div
                      key={subject.name}
                      className={`p-5 rounded-xl bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} shadow-lg transition-all hover:shadow-xl hover:scale-105`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className={`text-lg font-bold ${colorScheme.text}`}>{subject.name}</h4>
                        <span className={`px-3 py-1 rounded-full font-bold bg-white ${colorScheme.text} shadow-sm`}>
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-3 mb-4 shadow-inner">
                        <div
                          className={`h-3 rounded-full ${colorScheme.progress} shadow-sm`}
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-white/40 rounded-lg">
                          <div className={`font-bold ${colorScheme.text}`}>{subject.tests}</div>
                          <div className="text-xs opacity-75">tests</div>
                        </div>
                        <div className="text-center p-2 bg-white/40 rounded-lg">
                          <div className={`font-bold ${colorScheme.text}`}>{subject.assignments}</div>
                          <div className="text-xs opacity-75">assignments</div>
                        </div>
                        <div className="text-center p-2 bg-white/40 rounded-lg">
                          <div className={`font-bold ${colorScheme.text}`}>{subject.lastScore}%</div>
                          <div className="text-xs opacity-75">last score</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Rate & Report Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl shadow-lg bg-white">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Rate & Report Teachers</h2>
              <p className="text-lg mb-6 text-gray-600">
                Provide feedback and ratings for teachers you've worked with
              </p>
              
              {teachers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaUserGraduate className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p className="text-xl mb-2">No teachers to rate yet</p>
                  <p>Complete some lessons with teachers to rate and review them</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map((teacher) => (
                    <div 
                      key={teacher.id} 
                      className="p-4 rounded-lg border bg-gray-50 border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center mb-3">
                        <img 
                          src={teacher.profilePicture || 'https://via.placeholder.com/50'} 
                          alt={teacher.name} 
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <h4 className="font-semibold">{teacher.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatSubjects(teacher.subjects, "Multiple Subjects")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3 space-y-2">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-500 mr-1" />
                          <span className="font-semibold">{teacher.rating || "No rating"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaBookOpen className="mr-1" />
                          <span>{teacher.totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="mr-1" />
                          <span>{teacher.totalHours}h total</span>
                        </div>
                        {teacher.lastLessonDate && (
                          <div className="text-xs text-gray-400">
                            Last lesson: {teacher.lastLessonDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => openRatingModal(teacher)}
                          className="flex-1 rounded-xl border border-[#015575] bg-[#015575] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:border-[#01415e] hover:bg-[#01415e]"
                        >
                          <FaThumbsUp className="inline mr-2 text-lg" />
                          Rate Teacher
                        </button>
                        <button
                          onClick={() => openReportModal(teacher)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg border-2 border-red-400 hover:border-red-500"
                        >
                          <FaFlag className="inline mr-2 text-lg" />
                          Report Issue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-xl shadow-2xl w-96 max-w-[90vw] bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Rate {selectedTeacher.name}</h3>
              <button 
                onClick={closeModals} 
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Rating:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                      className={`text-2xl ${ratingForm.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Comment (optional):</label>
                <textarea
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                  className="w-full p-2 rounded border bg-gray-50 border-gray-300"
                  rows="3"
                  placeholder="Share your experience with this teacher..."
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Rating
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-xl shadow-2xl w-96 max-w-[90vw] bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Report {selectedTeacher.name}</h3>
              <button 
                onClick={closeModals} 
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Reason:</label>
                <select
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                  className="w-full p-2 rounded border bg-gray-50 border-gray-300"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate_behavior">Inappropriate Behavior</option>
                  <option value="poor_teaching">Poor Teaching Quality</option>
                  <option value="unprofessional">Unprofessional Conduct</option>
                  <option value="scheduling_issues">Scheduling Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Description:</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full p-2 rounded border bg-gray-50 border-gray-300"
                  rows="3"
                  placeholder="Please provide details about the issue..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
