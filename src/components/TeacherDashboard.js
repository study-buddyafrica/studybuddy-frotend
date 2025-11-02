import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaChalkboardTeacher,
  FaCog,
  FaSignOutAlt,
  FaCameraRetro,
  FaTimes,
  FaWallet,
  FaUserCircle,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaVideo,
  FaUsers,
  FaBook,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaBars
} from "react-icons/fa";
import { FHOST } from "./constants/Functions";
import MyLessons from "./teachers/MyLessons";
import MyStudents from "./teachers/MyStudents";
import Liveclass from "./teachers/Liveclass";
import MyAccount from "./teachers/MyAccount";
import UpcomingClasses from "./teachers/UpcomingClasses";
import VideoEditor from "./teachers/VideoEditor";
import Scheduler from "./teachers/Scheduler";
import { useLocation, useNavigate } from "react-router-dom";
import MyWallet from "./teachers/mywallet";
import DashboardHeader from "./layout/DashboardHeader";

const TeacherDashboard = () => {
  const [isLive, setIsLive] = useState(false);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveSessions, setLiveSessions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshState = () => {
      const userData = JSON.parse(localStorage.getItem("userInfo"));
      if (!userData) {
        navigate("/");
        return;
      }
      setUserInfo(userData);

      // Remove legacy global flag to avoid false hides
      if (localStorage.getItem('verification_submitted')) {
        localStorage.removeItem('verification_submitted');
      }

      // Check per-user flag only
      const submitted = localStorage.getItem(`verification_submitted_${userData.id}`) === 'true';
      if (userData.role === 'teacher' && !submitted) {
        setShowVerificationNotice(true);
      } else {
        setShowVerificationNotice(false);
      }

      // Generate random avatar
      const seed = userData.full_name || userData.username || userData.email?.split('@')[0] || 'Teacher';
      const randomAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
      setAvatarUrl(randomAvatar);
    };

    refreshState();
    // Listen for verification status updates from MyAccount
    const onVerificationChange = () => refreshState();
    window.addEventListener('verification-status-changed', onVerificationChange);
    return () => window.removeEventListener('verification-status-changed', onVerificationChange);
  }, [navigate]);

  const handleLogout = () => {
    // Clear user-scoped verification flag on logout to avoid leakage across users
    try {
      const prev = JSON.parse(localStorage.getItem('userInfo'));
      if (prev?.id) {
        localStorage.removeItem(`verification_submitted_${prev.id}`);
      }
    } catch (e) {}
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    navigate("/");
  };

  const handleVideoUpload = (event) => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setVideoPreview(previewURL);
      setVideoFile(file);
    } else {
      setVideoPreview(null);
    }
  };

  const handleGoLive = () => {
    setIsLive(true);
    setActiveComponent("liveclass");
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !videoTitle.trim()) {
      alert("Please provide a title and select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", videoTitle);
    if (videoDescription.trim()) formData.append("description", videoDescription);

    setUploading(true);
    try {
      const response = await axios.post(
        `${FHOST}/lessons/api/upload-video/${userInfo?.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Video uploaded successfully!");
        setIsModalOpen(false);
        setVideoFile(null);
        setVideoTitle("");
        setVideoDescription("");
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview("");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload the video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const response = await axios.get(
          `${FHOST}/lessons/api/live-sessions/${userInfo?.id}`
        );
        setLiveSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load live sessions. Please try again later.");
        setLoading(false);
      }
    };
    
    if (userInfo?.id) {
      fetchLiveSessions();
    }
  }, [userInfo?.id]);

  const stats = [
    { title: "Total Students", value: "0", change: "+0%", icon: <FaUsers className="text-xl" /> },
    { title: "Lessons Completed", value: "0", change: "+0%", icon: <FaBook className="text-xl" /> },
    { title: "Live Sessions", value: "0", change: "+0%", icon: <FaVideo className="text-xl" /> },
    { title: "Earnings", value: "$0", change: "+0%", icon: <FaWallet className="text-xl" /> }
  ];

  // Sync UI with URL path
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "");
    const base = "/teacher-dashboard";
    let section = path.startsWith(base) ? path.slice(base.length) : "";
    if (section.startsWith("/")) section = section.slice(1);
    switch (section) {
      case "":
        setActiveComponent("dashboard");
        break;
      case "students":
        setActiveComponent("students");
        break;
      case "lessons":
        setActiveComponent("lessons");
        break;
      case "liveclasses":
        setActiveComponent("liveclass");
        break;
      case "schedule":
        setActiveComponent("schedule");
        break;
      case "videoeditor":
        setActiveComponent("videoeditor");
        break;
      case "mywallet":
        setActiveComponent("mywallet");
        break;
      case "myaccount":
        setActiveComponent("myaccount");
        break;
      case "upcomingclasses":
        setActiveComponent("upcomingclasses");
        break;
      default:
        setActiveComponent("dashboard");
    }
  }, [location.pathname]);

  // Close sidebar on mobile and navigate
  const handleMenuItemClick = (component) => {
    switch (component) {
      case "dashboard":
        navigate("/teacher-dashboard");
        break;
      case "students":
        navigate("/teacher-dashboard/students");
        break;
      case "lessons":
        navigate("/teacher-dashboard/lessons");
        break;
      case "liveclass":
        navigate("/teacher-dashboard/liveclasses");
        break;
      case "schedule":
        navigate("/teacher-dashboard/schedule");
        break;
      case "videoeditor":
        navigate("/teacher-dashboard/videoeditor");
        break;
      case "mywallet":
        navigate("/teacher-dashboard/mywallet");
        break;
      case "myaccount":
        navigate("/teacher-dashboard/myaccount");
        break;
      case "upcomingclasses":
        navigate("/teacher-dashboard/upcomingclasses");
        break;
      default:
        navigate("/teacher-dashboard");
    }
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Get display name from email
  const getDisplayName = () => {
    if (!userInfo) return "Teacher";
    const name = userInfo.full_name || userInfo.username || userInfo.email;
    return name.split('@')[0] || name;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-josefin">
            {/* Sidebar */}
      <div
        className={`fixed lg:relative z-30 inset-y-0 left-0 w-64 bg-sky-500 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center border-b border-white/30">
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-lilita text-white">{getDisplayName()}</h2>
              <p className="text-amber-100 text-sm">Teacher</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-white"
            >
              <FaTimes />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-8">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleMenuItemClick("dashboard")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "dashboard" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaHome className="mr-3" />
                  Dashboard
                  {activeComponent === "dashboard" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("students")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "students" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaUsers className="mr-3" />
                  My Students
                  {activeComponent === "students" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("lessons")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "lessons" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaChalkboardTeacher className="mr-3" />
                  My Lessons
                  {activeComponent === "lessons" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("mywallet")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "mywallet" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaWallet className="mr-3" />
                  My Wallet
                  {activeComponent === "mywallet" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("liveclass")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "liveclass" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaVideo className="mr-3" />
                  Live Classes
                  {activeComponent === "liveclass" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("schedule")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "schedule" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaCalendarAlt className="mr-3" />
                  Schedule
                  {activeComponent === "schedule" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("videoeditor")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "videoeditor" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaCameraRetro className="mr-3" />
                  Video Editor
                  {activeComponent === "videoeditor" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("myaccount")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "myaccount" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaUserCircle className="mr-3" />
                  My Account
                  {activeComponent === "myaccount" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          title="StudyBuddy Africa"
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notificationCount={notificationCount}
          onViewProfile={() => handleMenuItemClick("myaccount")}
        />
        
        {/* Verification Notice Banner */}
        {showVerificationNotice && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Your account is not verified. Please complete verification in My Account before continuing.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => handleMenuItemClick("myaccount")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Verify Account
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            {activeComponent === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-[#01B0F1]">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-[#01B0F1]/10 text-[#01B0F1] mr-4">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs md:text-sm">{stat.title}</p>
                          <div className="flex items-baseline">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                            <span className="ml-2 text-xs md:text-sm text-green-500">{stat.change}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Go Live Card */}
                  <div 
                    className="bg-gradient-to-r from-[#027FAD] to-[#015575] rounded-xl shadow-lg text-white p-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={handleGoLive}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-white/20 p-3 rounded-full mr-4">
                        <FaVideo className="text-xl" />
                      </div>
                      <h2 className="text-xl font-lilita">Go Live</h2>
                    </div>
                    <p className="mb-6 text-blue-100">Start a live session with your students now</p>
                    <button className="bg-white text-[#015575] py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-gray-100 transition text-sm md:text-base">
                      Start Live Session
                    </button>
                  </div>
                  
                  {/* Schedule Card */}
                  <div 
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                    onClick={() => handleMenuItemClick("schedule")}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-[#01B0F1]/10 p-3 rounded-full mr-4 text-[#01B0F1]">
                        <FaCalendarAlt className="text-xl" />
                      </div>
                      <h2 className="text-xl font-lilita text-gray-800">My Schedule</h2>
                    </div>
                    <p className="mb-6 text-gray-600">Manage your upcoming classes and availability</p>
                    <button className="bg-[#01B0F1] text-white py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-[#0199d4] transition text-sm md:text-base">
                      View Calendar
                    </button>
                  </div>
                  
                  {/* Upload Video Card */}
                  <div 
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-[#01B0F1]/10 p-3 rounded-full mr-4 text-[#01B0F1]">
                        <FaCameraRetro className="text-xl" />
                      </div>
                      <h2 className="text-xl font-lilita text-gray-800">Upload Content</h2>
                    </div>
                    <p className="mb-6 text-gray-600">Upload videos or materials for your students</p>
                    <button className="bg-[#01B0F1] text-white py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-[#0199d4] transition text-sm md:text-base">
                      Upload Now
                    </button>
                  </div>
                </div>
                
                {/* Upcoming Classes */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="border-b border-gray-200 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-lilita text-gray-800 flex items-center">
                      <FaCalendarAlt className="mr-2 text-[#01B0F1]" />
                      Upcoming Classes
                    </h2>
                  </div>
                  <div className="p-4 md:p-6">
                    {liveSessions.length === 0 ? (
                      <div className="text-center py-8 md:py-12">
                        <div className="bg-gray-100 p-4 md:p-6 rounded-xl inline-block">
                          <FaCalendarAlt className="text-3xl md:text-4xl text-gray-400 mx-auto mb-4" />
                          <h3 className="text-base md:text-lg font-semibold text-gray-700">No upcoming classes</h3>
                          <p className="text-gray-500 mt-2 text-sm md:text-base">Schedule your next class to get started</p>
                          <button 
                            onClick={() => handleMenuItemClick("schedule")}
                            className="mt-3 md:mt-4 bg-[#01B0F1] text-white py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-[#0199d4] transition text-sm md:text-base"
                          >
                            Schedule Class
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {liveSessions.slice(0, 5).map((session, index) => (
                          <li key={index} className="py-3 md:py-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                                {session.subject?.name || "General Class"}
                              </h3>
                              <p className="text-gray-600 text-xs md:text-sm">Grade {session.grade || "All"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800 text-sm md:text-base">{session.scheduled_date}</p>
                              <p className="text-xs md:text-sm text-gray-500">{session.duration || "60 min"}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {liveSessions.length > 0 && (
                    <div className="border-t border-gray-200 p-3 text-center">
                      <button 
                        onClick={() => handleMenuItemClick("upcomingclasses")}
                        className="text-[#01B0F1] font-semibold hover:text-[#015575] transition-colors text-sm md:text-base"
                      >
                        View All Classes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Component Renderers */}
            {activeComponent === "lessons" && <MyLessons userInfo={userInfo} />}
            {activeComponent === "students" && <MyStudents userInfo={userInfo} />}
            {activeComponent === "liveclass" && <Liveclass userInfo={userInfo} />}
            {activeComponent === "mywallet" && <MyWallet userInfo={userInfo} />}
            {activeComponent === "myaccount" && <MyAccount />}
            {activeComponent === "videoeditor" && <VideoEditor />}
            {activeComponent === "schedule" && <Scheduler userInfo={userInfo} />}
            {activeComponent === "upcomingclasses" && <UpcomingClasses liveSessions={liveSessions} />}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t py-3 px-4 text-center text-gray-500 text-xs md:text-sm">
          <p>© {new Date().getFullYear()} StudyBuddy Africa Teacher Dashboard. All rights reserved.</p>
        </footer>
      </div>

      {/* Video Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h2 className="text-xl md:text-2xl font-lilita text-[#015575]">Upload Video</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6">
              {/* Form Section */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#01B0F1] text-sm md:text-base"
                    placeholder="Enter video title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Description</label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#01B0F1] h-24 md:h-32 text-sm md:text-base"
                    placeholder="Describe your video content"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Select Video</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#01B0F1] transition-colors relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FaCameraRetro className="text-3xl md:text-4xl text-[#01B0F1] mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-sm md:text-base">Click to upload video</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">MP4, AVI, MOV files up to 2GB</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="bg-gradient-to-r from-[#01B0F1] to-[#027FAD] text-white py-2 px-6 md:py-3 md:px-8 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-70 text-sm md:text-base"
                  >
                    {uploading ? "Uploading..." : "Upload Video"}
                  </button>
                </div>
              </div>
              
              {/* Preview Section */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Video Preview</h3>
                {videoPreview ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full object-contain"
                      src={videoPreview}
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 p-4">
                    <FaCameraRetro className="text-4xl md:text-5xl mb-3 md:mb-4" />
                    <p className="text-sm md:text-base">Video preview will appear here</p>
                  </div>
                )}
                
                {videoTitle && (
                  <div className="mt-4 md:mt-6">
                    <h4 className="font-semibold text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Title</h4>
                    <p className="text-gray-800 text-sm md:text-base">{videoTitle}</p>
                  </div>
                )}
                
                {videoDescription && (
                  <div className="mt-3 md:mt-4">
                    <h4 className="font-semibold text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Description</h4>
                    <p className="text-gray-600 text-sm md:text-base">{videoDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;