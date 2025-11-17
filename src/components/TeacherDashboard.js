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
import TeacherProfileUpdate from "./teachers/TeacherProfileUpdate";
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshState = async () => {
      const userData = JSON.parse(localStorage.getItem("userInfo"));
      if (!userData) {
        navigate("/");
        return;
      }
      setUserInfo(userData);

      // Fetch profile data (optional, not blocking)
      try {
        const profileResponse = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (profileResponse.data) {
          setProfileData(profileResponse.data);
        }
      } catch (error) {
        // Profile fetch failed, but don't block access
        console.error("Error fetching profile:", error);
      }

      // Fetch latest user data from backend to get verification status
      let finalStatus = userData.verification_status;
      try {
        const response = await axios.get(`${FHOST}/users/teacher/${userData.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data) {
          const latestUserData = response.data;
          finalStatus = latestUserData.verification_status || userData.verification_status;
          setVerificationStatus(finalStatus);
          
          // Update localStorage with latest data
          const updatedUserInfo = { ...userData, ...latestUserData };
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          setUserInfo(updatedUserInfo);
        }
      } catch (error) {
        // Fallback to localStorage data if API call fails
        finalStatus = userData.verification_status;
        setVerificationStatus(finalStatus);
      }
      
      // Allow bypass for testing in development (set 'dev_mode' to 'true' in localStorage to bypass)
      const allowTestingAccess = localStorage.getItem('dev_mode') === 'true';
      
      // Flow: 
      // - If status is null/undefined: Profile not submitted yet - block access
      // - If status is 'pending': Profile submitted, waiting for admin - allow access but show notice
      // - If status is 'approved': Fully verified - full access
      // - If status is 'rejected': Profile rejected - allow access but show resubmit notice
      
      if (finalStatus === 'approved' || allowTestingAccess) {
        // Verified - full access
        setIsBlocked(false);
        setShowVerificationNotice(false);
        setShowWelcomeModal(false);
      } else if (finalStatus === 'pending') {
        // Profile submitted, waiting for admin approval - allow access but show notice
        setIsBlocked(false); // Don't block access
        setShowVerificationNotice(true); // Show notice that verification is pending
        setShowWelcomeModal(false);
      } else if (!finalStatus || finalStatus === null) {
        // Profile not submitted yet - block access and show welcome modal
        setIsBlocked(true);
        setShowVerificationNotice(true);
        setShowWelcomeModal(true);
      } else if (finalStatus === 'rejected') {
        // Profile rejected - allow access but show resubmit notice
        setIsBlocked(false); // Don't block access
        setShowVerificationNotice(true);
        setShowWelcomeModal(false);
      } else {
        // Unknown status - allow access but show notice
        setIsBlocked(false);
        setShowVerificationNotice(true);
        setShowWelcomeModal(false);
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
    
    // Listen for profile updates
    const onProfileUpdate = () => {
      refreshState();
      // Also update userInfo from localStorage
      const updatedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (updatedUserInfo) {
        setUserInfo(updatedUserInfo);
      }
    };
    window.addEventListener('profile-updated', onProfileUpdate);
    
    return () => {
      window.removeEventListener('verification-status-changed', onVerificationChange);
      window.removeEventListener('profile-updated', onProfileUpdate);
    };
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
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${FHOST}/api/live-sessions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Handle paginated response structure
        // Teachers see sessions they are teaching (filtered by backend)
        if (response.data?.results && Array.isArray(response.data.results)) {
          setLiveSessions(response.data.results);
        } else if (Array.isArray(response.data)) {
          // Fallback if response is directly an array
          setLiveSessions(response.data);
        } else {
          setLiveSessions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching live sessions:', err);
        // Try to refresh token if 401/403
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            const { authService } = await import("../services/authService");
            const newToken = await authService.refreshToken();
            // Retry with new token
            const retryResponse = await axios.get(
              `${FHOST}/api/live-sessions/`,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
            if (retryResponse.data?.results && Array.isArray(retryResponse.data.results)) {
              setLiveSessions(retryResponse.data.results);
            } else if (Array.isArray(retryResponse.data)) {
              setLiveSessions(retryResponse.data);
            } else {
              setLiveSessions([]);
            }
            setLoading(false);
            return;
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
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
    // Allow testing access (set 'dev_mode' to 'true' in localStorage to bypass verification)
    const allowTestingAccess = localStorage.getItem('dev_mode') === 'true';
    
    // Block navigation to any page except myaccount if not verified (unless testing)
   if (
   isBlocked &&
   component !== "myaccount" &&
   !allowTestingAccess
 ) {
  setShowWelcomeModal(true);
  return;
}
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
            {/* Sidebar - Fixed position */}
      <div
        className={`fixed z-30 inset-y-0 left-0 w-64 bg-sky-500 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
        style={{ height: '100vh', overflowY: 'auto' }}
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
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "dashboard" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60" : ""}`}
                >
                  <FaHome className="mr-3" />
                  Dashboard
                  {activeComponent === "dashboard" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("students")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "students" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaUsers className="mr-3" />
                  My Students
                  {activeComponent === "students" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("lessons")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "lessons" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaChalkboardTeacher className="mr-3" />
                  My Lessons
                  {activeComponent === "lessons" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("mywallet")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "mywallet" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaWallet className="mr-3" />
                  My Wallet
                  {activeComponent === "mywallet" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("liveclass")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "liveclass" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaVideo className="mr-3" />
                  Live Classes
                  {activeComponent === "liveclass" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("schedule")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "schedule" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaCalendarAlt className="mr-3" />
                  Schedule
                  {activeComponent === "schedule" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("videoeditor")}
                  disabled={isBlocked}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "videoeditor" ? "bg-white/20 shadow-md" : "hover:bg-white/10"} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <FaCameraRetro className="mr-3" />
                  Video Editor
                  {activeComponent === "videoeditor" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("profileupdate")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "profileupdate" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaUserCircle className="mr-3" />
                  Update Profile
                  {activeComponent === "profileupdate" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleMenuItemClick("myaccount")}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${activeComponent === "myaccount" ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}
                >
                  <FaCog className="mr-3" />
                  My Account
                  {activeComponent === "myaccount" && <FaChevronRight className="ml-auto" />}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content - Add margin for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <DashboardHeader
          title="StudyBuddy Africa"
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notificationCount={notificationCount}
          onViewProfile={() => handleMenuItemClick("myaccount")}
          onEditProfile={() => handleMenuItemClick("profileupdate")}
        />
        
        {/* Verification Notice Banner */}
        {showVerificationNotice && (
          <div className={`border-l-4 p-4 mb-4 ${
            verificationStatus === 'pending' 
              ? 'bg-blue-100 border-blue-500' 
              : verificationStatus === 'rejected'
              ? 'bg-red-100 border-red-500'
              : 'bg-yellow-100 border-yellow-500'
          }`}>
            <div className="flex items-center">
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  verificationStatus === 'pending'
                    ? 'text-blue-700'
                    : verificationStatus === 'rejected'
                    ? 'text-red-700'
                    : 'text-yellow-700'
                }`}>
                  {verificationStatus === 'pending' 
                    ? 'Your verification is pending admin approval. Please wait for approval before continuing.'
                    : verificationStatus === 'rejected'
                    ? 'Your verification was rejected. Please update your information and resubmit.'
                    : 'Your account is not verified. Please complete verification in My Account before continuing.'}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => handleMenuItemClick("myaccount")}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    verificationStatus === 'pending'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : verificationStatus === 'rejected'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {verificationStatus === 'rejected' ? 'Resubmit Verification' : 'Verify Account'}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Welcome Modal for Verification */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#01B0F1]/10 mb-6">
                  <FaChalkboardTeacher className="h-10 w-10 text-[#01B0F1]" />
                </div>
                <h2 className="text-3xl font-lilita text-[#015575] mb-4">
                  Welcome to StudyBuddy!
                </h2>
                <p className="text-gray-600 font-josefin text-lg mb-6">
                  Before you can start teaching, we need to verify your account.
                </p>
                <p className="text-gray-700 font-josefin mb-8">
                  Please complete your account verification by providing your profile photo and details.
                  Your verification request will be sent to our admin team for approval.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowWelcomeModal(false);
                      handleMenuItemClick("myaccount");
                    }}
                    className="bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white px-8 py-3 rounded-xl font-lilita hover:shadow-lg transition-all"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Block Overlay - Prevents access to dashboard features (unless testing) */}
        {(() => {
          const allowTestingAccess = localStorage.getItem('dev_mode') === 'true';
          return isBlocked && activeComponent !== "myaccount" && !allowTestingAccess ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
                <FaChalkboardTeacher className="h-16 w-16 text-[#01B0F1] mx-auto mb-4" />
                <h3 className="text-2xl font-lilita text-[#015575] mb-4">
                  Account Verification Required
                </h3>
                <p className="text-gray-600 font-josefin mb-6">
                  {verificationStatus === 'pending'
                    ? 'Your account verification is pending admin approval. You\'ll be able to access all features once approved.'
                    : 'Please complete your account verification to access the dashboard features.'}
                </p>
                <button
                  onClick={() => handleMenuItemClick("myaccount")}
                  className="bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white px-6 py-3 rounded-xl font-lilita hover:shadow-lg transition-all"
                >
                  {verificationStatus === 'rejected' ? 'Resubmit Verification' : 'Go to Verification'}
                </button>
              </div>
            </div>
          ) : null;
        })()}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            {activeComponent === "dashboard" && (
              <div className="space-y-6">
                {/* Block dashboard content if not verified (unless testing) */}
                         {(() => {
                           const allowTestingAccess = localStorage.getItem('dev_mode') === 'true';
                           return isBlocked && !allowTestingAccess ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <FaChalkboardTeacher className="h-20 w-20 text-[#01B0F1] mx-auto mb-4" />
                      <h2 className="text-2xl font-lilita text-[#015575] mb-4">
                        Welcome, {getDisplayName()}!
                      </h2>
                      <p className="text-gray-600 font-josefin mb-6">
                        {verificationStatus === 'pending'
                          ? 'Your account verification is pending admin approval. You\'ll receive a notification once your account is approved.'
                          : 'Please complete your account verification to start using the dashboard features.'}
                      </p>
                      <button
                        onClick={() => handleMenuItemClick("myaccount")}
                        className="bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white px-8 py-3 rounded-xl font-lilita hover:shadow-lg transition-all"
                      >
                        {verificationStatus === 'rejected' ? 'Resubmit Verification' : 'Complete Verification'}
                      </button>
                    </div>
                  ) : (
                    <>
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
                    </>
                  );
                })()}
              </div>
            )}
            
            {/* Component Renderers */}
            {(() => {
              const allowTestingAccess = localStorage.getItem('dev_mode') === 'true';
              const canAccess = !isBlocked || allowTestingAccess;

              if (!canAccess && activeComponent !== "myaccount") {
                return (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-josefin">Please verify your account to access this section.</p>
                  </div>
                );
              }
              
              return (
                <>
                  {activeComponent === "lessons" && <MyLessons userInfo={userInfo} />}
                  {activeComponent === "students" && <MyStudents userInfo={userInfo} />}
                  {activeComponent === "liveclass" && <Liveclass userInfo={userInfo} />}
                  {activeComponent === "mywallet" && <MyWallet userInfo={userInfo} />}
                  {activeComponent === "videoeditor" && <VideoEditor />}
                  {activeComponent === "schedule" && <Scheduler userInfo={userInfo} />}
                  {activeComponent === "upcomingclasses" && <UpcomingClasses liveSessions={liveSessions} />}
                  {activeComponent === "profileupdate" && <TeacherProfileUpdate />}
                  {activeComponent === "myaccount" && <MyAccount />}
                </>
              );
            })()}
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