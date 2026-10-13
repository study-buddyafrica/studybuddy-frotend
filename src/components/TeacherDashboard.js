import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaCameraRetro,
  FaTimes,
  FaWallet,
  FaCalendarAlt,
  FaVideo,
  FaUsers,
  FaBook,
  FaChevronRight,
  FaClipboardList,
  FaUserCircle,
} from "react-icons/fa";
import { FHOST } from "./constants/Functions";
import MyLessons from "./teachers/MyLessons";
import Liveclass from "./teachers/Liveclass";
import MyAccount from "./teachers/MyAccount";
import TeacherProfileUpdate from "./teachers/TeacherProfileUpdate";
import UpcomingClasses from "./teachers/UpcomingClasses";
import Scheduler from "./teachers/Scheduler";
import StudentLeads from "./teachers/StudentLeads";
import RevisionMaterials from "./teachers/RevisionMaterials";
import Assessments from "./teachers/Assessments";
import { useLocation, useNavigate } from "react-router-dom";
import MyWallet from "./teachers/mywallet";
import DashboardHeader from "./layout/DashboardHeader";
import { authStorage } from "../services/authStorage";

const TeacherDashboard = () => {
  const [isLive, setIsLive] = useState(false);
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
  const [videoPreview, setVideoPreview] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeTeacherStatus = (record, fallbackStatus = null) => {
    if (!record) return fallbackStatus || null;
    if (record.verification_status) return record.verification_status;
    if (record.is_verified === true) return "approved";
    if (record.is_rejected === true || record.status === "rejected")
      return "rejected";
    return fallbackStatus || "pending";
  };

  const fetchSubjects = async () => {
    try {
      let allSubjects = [];
      let nextUrl = `${FHOST}/api/subjects/`;
      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${authStorage.getAccessToken()}`,
          },
        });
        if (response.data?.results) {
          allSubjects = allSubjects.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }
      setAvailableSubjects(allSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/`;
      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${authStorage.getAccessToken()}`,
          },
        });
        if (response.data?.results) {
          allGrades = allGrades.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }
      setAvailableGrades(allGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchTeacherRecord = async (token, userData) => {
    if (!token || !userData) return null;
    const profileId =
      userData.teacher_profile_id || userData?.teacher_profile?.id;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (profileId) {
        const res = await axios.get(`${FHOST}/api/teachers/${profileId}/`, {
          headers,
        });
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch teacher by profile id", err);
    }

    try {
      const res = await axios.get(`${FHOST}/api/teachers/`, { headers });
      const results = res.data?.results || res.data || [];
      if (Array.isArray(results)) {
        return (
          results.find((teacher) => {
            if (!teacher) return false;
            const teacherUserId =
              typeof teacher.user === "object"
                ? teacher.user?.id
                : teacher.user;
            if (!teacherUserId) return false;
            return (
              String(teacherUserId) === String(userData.id || userData.user_id)
            );
          }) || null
        );
      }
    } catch (err) {
      console.error("Failed to fetch teacher list:", err);
    }
    return null;
  };

  useEffect(() => {
    const refreshState = async () => {
      const userData = JSON.parse(localStorage.getItem("userInfo"));
      if (!userData) {
        navigate("/");
        return;
      }
      if (!userData.id && userData.user_id) {
        userData.id = userData.user_id;
      }
      setUserInfo(userData);

      try {
        const profileResponse = await axios.get(
          `${FHOST}/api/teacher/profile/update/`,
          {
            headers: {
              Authorization: `Bearer ${authStorage.getAccessToken()}`,
            },
          },
        );
        if (profileResponse.data) setProfileData(profileResponse.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      let finalStatus = userData.verification_status || null;
      try {
        const token = authStorage.getAccessToken();
        if (token) {
          const teacherRecord = await fetchTeacherRecord(token, userData);
          if (teacherRecord) {
            const normalizedStatus = normalizeTeacherStatus(
              teacherRecord,
              finalStatus,
            );
            finalStatus = normalizedStatus;
            setVerificationStatus(normalizedStatus);
            const updatedUserInfo = {
              ...userData,
              teacher_profile_id:
                teacherRecord.id || userData.teacher_profile_id,
              teacher_profile: teacherRecord,
              verification_status: normalizedStatus,
              is_verified: teacherRecord.is_verified,
            };
            localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            setUserInfo(updatedUserInfo);
            if (userData.verification_status !== normalizedStatus) {
              window.dispatchEvent(new Event("verification-status-changed"));
            }
          } else {
            setVerificationStatus(finalStatus);
          }
        } else {
          setVerificationStatus(finalStatus);
        }
      } catch (error) {
        console.error("Error fetching verification status:", error);
        setVerificationStatus(finalStatus);
      }

      const allowTestingAccess = localStorage.getItem("dev_mode") === "true";

      if (finalStatus === "approved" || allowTestingAccess) {
        setIsBlocked(false);
        setShowVerificationNotice(false);
        setShowWelcomeModal(false);
      } else if (finalStatus === "pending") {
        setIsBlocked(false);
        setShowVerificationNotice(true);
        setShowWelcomeModal(false);
      } else if (!finalStatus || finalStatus === null) {
        setIsBlocked(true);
        setShowVerificationNotice(true);
        setShowWelcomeModal(true);
      } else if (finalStatus === "rejected") {
        setIsBlocked(true);
        setShowVerificationNotice(true);
        setShowWelcomeModal(false);
      } else {
        setIsBlocked(false);
        setShowVerificationNotice(true);
        setShowWelcomeModal(false);
      }

      const seed =
        userData.full_name ||
        userData.username ||
        userData.email?.split("@")[0] ||
        "Teacher";
      setAvatarUrl(
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`,
      );
    };

    refreshState();
    const onVerificationChange = () => refreshState();
    window.addEventListener(
      "verification-status-changed",
      onVerificationChange,
    );
    const onProfileUpdate = () => {
      refreshState();
      const updated = JSON.parse(localStorage.getItem("userInfo"));
      if (updated) setUserInfo(updated);
    };
    window.addEventListener("profile-updated", onProfileUpdate);

    return () => {
      window.removeEventListener(
        "verification-status-changed",
        onVerificationChange,
      );
      window.removeEventListener("profile-updated", onProfileUpdate);
    };
  }, [navigate]);

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
  }, []);

  const handleLogout = () => {
    try {
      const prev = JSON.parse(localStorage.getItem("userInfo"));
      if (prev?.id || prev?.user_id) {
        localStorage.removeItem(
          `verification_submitted_${prev.id || prev.user_id}`,
        );
      }
    } catch {
      /* ignore */
    }
    authStorage.clearTokens();
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    navigate("/");
  };

  const handleVideoUpload = (event) => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    const file = event.target.files[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
      setVideoFile(file);
    } else {
      setVideoPreview(null);
    }
  };

  const handleGoLive = () => {
    setIsLive(true);
    handleMenuItemClick("liveclass");
  };

  const handleSubmit = async () => {
    if (!videoFile || !videoTitle.trim()) {
      alert("Please provide a title and select a video file.");
      return;
    }
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", videoTitle);
    if (videoDescription.trim())
      formData.append("description", videoDescription);

    setUploading(true);
    try {
      const response = await axios.post(
        `${FHOST}/lessons/api/upload-video/${userInfo?.id || userInfo?.user_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (response.status === 200 || response.status === 201) {
        alert("Video uploaded successfully!");
        setIsModalOpen(false);
        setVideoFile(null);
        setVideoTitle("");
        setVideoDescription("");
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview(null);
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
        const token = authStorage.getAccessToken();
        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }
        const response = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.results && Array.isArray(response.data.results)) {
          setLiveSessions(response.data.results);
        } else if (Array.isArray(response.data)) {
          setLiveSessions(response.data);
        } else {
          setLiveSessions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching live sessions:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            const { authService } = await import("../services/authService");
            const newToken = await authService.refreshToken();
            const retryResponse = await axios.get(
              `${FHOST}/api/live-sessions/`,
              { headers: { Authorization: `Bearer ${newToken}` } },
            );
            if (
              retryResponse.data?.results &&
              Array.isArray(retryResponse.data.results)
            ) {
              setLiveSessions(retryResponse.data.results);
            } else if (Array.isArray(retryResponse.data)) {
              setLiveSessions(retryResponse.data);
            } else {
              setLiveSessions([]);
            }
            setLoading(false);
            return;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
        setError("Failed to load live sessions. Please try again later.");
        setLoading(false);
      }
    };

    if (userInfo?.id || userInfo?.user_id) {
      fetchLiveSessions();
    }
  }, [userInfo?.id, userInfo?.user_id]);

  const stats = [
    {
      title: "Total Students",
      value: "0",
      change: "+0%",
      icon: <FaUsers className="text-xl" />,
    },
    {
      title: "Lessons Completed",
      value: "0",
      change: "+0%",
      icon: <FaBook className="text-xl" />,
    },
    {
      title: "Live Sessions",
      value: "0",
      change: "+0%",
      icon: <FaVideo className="text-xl" />,
    },
    {
      title: "Earnings",
      value: "KES 0",
      change: "+0%",
      icon: <FaWallet className="text-xl" />,
    },
  ];

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "");
    const base = "/teacher-dashboard";
    let section = path.startsWith(base) ? path.slice(base.length) : "";
    if (section.startsWith("/")) section = section.slice(1);

    const map = {
      "": "dashboard",
      students: "students",
      lessons: "lessons",
      liveclasses: "liveclass",
      schedule: "schedule",
      videoeditor: "videoeditor",
      mywallet: "mywallet",
      myaccount: "myaccount",
      studentleads: "studentleads",
      upcomingclasses: "upcomingclasses",
      revisionmaterials: "revisionmaterials",
      assessments: "assessments",
    };
    setActiveComponent(map[section] || "dashboard");
  }, [location.pathname]);

  const handleMenuItemClick = (component) => {
    const allowTestingAccess = localStorage.getItem("dev_mode") === "true";
    if (isBlocked && component !== "myaccount" && !allowTestingAccess) {
      setShowWelcomeModal(true);
      return;
    }
    const routes = {
      dashboard: "/teacher-dashboard",
      students: "/teacher-dashboard/students",
      lessons: "/teacher-dashboard/lessons",
      liveclass: "/teacher-dashboard/liveclasses",
      schedule: "/teacher-dashboard/schedule",
      videoeditor: "/teacher-dashboard/videoeditor",
      mywallet: "/teacher-dashboard/mywallet",
      myaccount: "/teacher-dashboard/myaccount",
      studentleads: "/teacher-dashboard/studentleads",
      upcomingclasses: "/teacher-dashboard/upcomingclasses",
      revisionmaterials: "/teacher-dashboard/revisionmaterials",
      assessments: "/teacher-dashboard/assessments",
    };
    navigate(routes[component] || "/teacher-dashboard");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const getDisplayName = () => {
    if (!userInfo) return "Teacher";
    const name = userInfo.full_name || userInfo.first_name || userInfo.email;
    if (!name) return "Teacher";
    return name.split("@")[0] || name;
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: FaHome },
    { key: "lessons", label: "My Lessons", icon: FaChalkboardTeacher },
    { key: "mywallet", label: "My Wallet", icon: FaWallet },
    { key: "liveclass", label: "Live Classes", icon: FaVideo },
    { key: "schedule", label: "Schedule", icon: FaCalendarAlt },
    { key: "studentleads", label: "Student Leads", icon: FaUsers },
    { key: "revisionmaterials", label: "Revision Materials", icon: FaBook },
    { key: "assessments", label: "Assessments", icon: FaClipboardList },
    { key: "myaccount", label: "My Account", icon: FaUserCircle },
  ];

  const allowTestingAccess = localStorage.getItem("dev_mode") === "true";
  const canAccess = !isBlocked || allowTestingAccess;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-josefin">
      {/* Sidebar — onboarding tokens */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[280px] transform bg-[#013349] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#01B0F1]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-white/15 px-5 py-6">
            <div className="shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-12 w-12 rounded-xl border-2 border-white/30 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <FaUserCircle className="text-2xl text-white/70" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-lilita text-lg text-white">
                {getDisplayName()}
              </h2>
              <p className="font-josefin text-xs uppercase tracking-wider text-[#81CFFF]">
                Teacher
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-white/80 lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = activeComponent === item.key;
                const Icon = item.icon;
                const disabled =
                  isBlocked && item.key !== "myaccount" && !allowTestingAccess;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleMenuItemClick(item.key)}
                      disabled={disabled}
                      className={`flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm transition-all ${
                        active
                          ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/30"
                          : "text-[#B4C8DC] hover:bg-white/10 hover:text-white"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <Icon className="mr-3 shrink-0 text-base" />
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <FaChevronRight className="ml-auto text-xs opacity-80" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/15 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-josefin text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <FaSignOutAlt />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-[280px]">
        <DashboardHeader
          title={
            navItems.find((n) => n.key === activeComponent)?.label ||
            "Dashboard"
          }
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          onViewProfile={() => handleMenuItemClick("myaccount")}
          onEditProfile={() => handleMenuItemClick("myaccount")}
        />

        {showVerificationNotice && verificationStatus !== "approved" && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 md:mx-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p
                className={`flex-1 font-josefin text-sm ${
                  verificationStatus === "pending"
                    ? "text-blue-700"
                    : verificationStatus === "rejected"
                      ? "text-red-700"
                      : "text-amber-800"
                }`}
              >
                {verificationStatus === "pending"
                  ? "Your verification is pending admin approval."
                  : verificationStatus === "rejected"
                    ? "Your verification was rejected. Please update and resubmit."
                    : "Your account is not verified. Complete verification in My Account."}
              </p>
              <button
                type="button"
                onClick={() => handleMenuItemClick("myaccount")}
                className="shrink-0 rounded-lg bg-[#015575] px-4 py-2 font-josefin text-sm font-medium text-white hover:bg-[#01B0F1]"
              >
                {verificationStatus === "rejected"
                  ? "Resubmit"
                  : "Verify account"}
              </button>
            </div>
          </div>
        )}

        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#01B0F1]/10">
                  <FaChalkboardTeacher className="h-10 w-10 text-[#01B0F1]" />
                </div>
                <h2 className="mb-4 font-lilita text-3xl text-[#015575]">
                  Welcome to StudyBuddy!
                </h2>
                <p className="mb-6 font-josefin text-lg text-gray-600">
                  Before you can start teaching, we need to verify your account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowWelcomeModal(false);
                    handleMenuItemClick("myaccount");
                  }}
                  className="rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] px-8 py-3 font-lilita text-white hover:shadow-lg"
                >
                  Start verification
                </button>
              </div>
            </div>
          </div>
        )}

        {isBlocked &&
          activeComponent !== "myaccount" &&
          !allowTestingAccess && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
              <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
                <FaChalkboardTeacher className="mx-auto mb-4 h-16 w-16 text-[#01B0F1]" />
                <h3 className="mb-4 font-lilita text-2xl text-[#015575]">
                  Account verification required
                </h3>
                <p className="mb-6 font-josefin text-gray-600">
                  {verificationStatus === "pending"
                    ? "Verification is pending admin approval."
                    : verificationStatus === "rejected"
                      ? "Verification was rejected. Please update and resubmit."
                      : "Please complete account verification to access the dashboard."}
                </p>
                <button
                  type="button"
                  onClick={() => handleMenuItemClick("myaccount")}
                  className="rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] px-6 py-3 font-lilita text-white"
                >
                  {verificationStatus === "rejected"
                    ? "Resubmit verification"
                    : "Go to verification"}
                </button>
              </div>
            </div>
          )}

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 md:p-6 lg:p-8">
            {activeComponent === "dashboard" && (
              <div className="space-y-6">
                {isBlocked && !allowTestingAccess ? (
                  <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                    <FaChalkboardTeacher className="mx-auto mb-4 h-20 w-20 text-[#01B0F1]" />
                    <h2 className="mb-4 font-lilita text-2xl text-[#015575]">
                      Welcome, {getDisplayName()}!
                    </h2>
                    <p className="mb-6 font-josefin text-gray-600">
                      {verificationStatus === "pending"
                        ? "Your account verification is pending admin approval."
                        : verificationStatus === "rejected"
                          ? "Your account verification was rejected. Please update and resubmit."
                          : "Please complete verification to use dashboard features."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleMenuItemClick("myaccount")}
                      className="rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] px-8 py-3 font-lilita text-white"
                    >
                      {verificationStatus === "rejected"
                        ? "Resubmit verification"
                        : "Complete verification"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                      {stats.map((stat) => (
                        <div
                          key={stat.title}
                          className="rounded-xl border-l-4 border-[#01B0F1] bg-white p-4 shadow-sm md:p-6"
                        >
                          <div className="flex items-center">
                            <div className="mr-4 rounded-lg bg-[#01B0F1]/10 p-3 text-[#01B0F1]">
                              {stat.icon}
                            </div>
                            <div>
                              <p className="font-josefin text-xs text-gray-500 md:text-sm">
                                {stat.title}
                              </p>
                              <h3 className="font-lilita text-xl text-[#015575] md:text-2xl">
                                {stat.value}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
                      <div
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] p-6 text-white shadow-lg transition hover:shadow-xl"
                        onClick={handleGoLive}
                      >
                        <div className="mb-4 flex items-center">
                          <div className="mr-4 rounded-full bg-white/20 p-3">
                            <FaVideo className="text-xl" />
                          </div>
                          <h2 className="font-lilita text-xl">Go Live</h2>
                        </div>
                        <p className="mb-6 text-white/90">
                          Start a live session with your students
                        </p>
                        <button
                          type="button"
                          className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#015575]"
                        >
                          Start live session
                        </button>
                      </div>

                      <div
                        className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        onClick={() => handleMenuItemClick("schedule")}
                      >
                        <div className="mb-4 flex items-center">
                          <div className="mr-4 rounded-full bg-[#01B0F1]/10 p-3 text-[#01B0F1]">
                            <FaCalendarAlt className="text-xl" />
                          </div>
                          <h2 className="font-lilita text-xl text-[#015575]">
                            My Schedule
                          </h2>
                        </div>
                        <p className="mb-6 text-gray-600">
                          Manage classes and availability
                        </p>
                        <button
                          type="button"
                          className="rounded-lg bg-[#01B0F1] px-4 py-2 text-sm font-bold text-white"
                        >
                          View calendar
                        </button>
                      </div>

                      <div
                        className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <div className="mb-4 flex items-center">
                          <div className="mr-4 rounded-full bg-[#01B0F1]/10 p-3 text-[#01B0F1]">
                            <FaCameraRetro className="text-xl" />
                          </div>
                          <h2 className="font-lilita text-xl text-[#015575]">
                            Upload content
                          </h2>
                        </div>
                        <p className="mb-6 text-gray-600">
                          Upload videos or materials for students
                        </p>
                        <button
                          type="button"
                          className="rounded-lg bg-[#01B0F1] px-4 py-2 text-sm font-bold text-white"
                        >
                          Upload now
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                      <div className="border-b border-gray-100 p-4 md:p-6">
                        <h2 className="flex items-center font-lilita text-lg text-[#015575] md:text-xl">
                          <FaCalendarAlt className="mr-2 text-[#01B0F1]" />
                          Upcoming classes
                        </h2>
                      </div>
                      <div className="p-4 md:p-6">
                        {loading ? (
                          <p className="py-8 text-center font-josefin text-gray-500">
                            Loading…
                          </p>
                        ) : liveSessions.length === 0 ? (
                          <div className="py-10 text-center">
                            <FaCalendarAlt className="mx-auto mb-3 text-4xl text-gray-300" />
                            <h3 className="font-lilita text-lg text-[#015575]">
                              No upcoming classes
                            </h3>
                            <p className="mt-1 font-josefin text-sm text-gray-500">
                              Schedule your next class to get started
                            </p>
                            <button
                              type="button"
                              onClick={() => handleMenuItemClick("schedule")}
                              className="mt-4 rounded-lg bg-[#01B0F1] px-6 py-2 font-bold text-white"
                            >
                              Schedule class
                            </button>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {liveSessions.slice(0, 5).map((session, index) => (
                              <li
                                key={session.id || index}
                                className="flex items-center justify-between py-3"
                              >
                                <div>
                                  <h3 className="font-josefin font-semibold text-[#015575]">
                                    {session.title ||
                                      session.subject?.name ||
                                      "Class"}
                                  </h3>
                                  <p className="font-josefin text-xs text-gray-500">
                                    {session.started_at
                                      ? new Date(
                                          session.started_at,
                                        ).toLocaleString()
                                      : session.scheduled_date || "TBC"}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {liveSessions.length > 0 && (
                        <div className="border-t border-gray-100 p-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleMenuItemClick("upcomingclasses")
                            }
                            className="font-josefin text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
                          >
                            View all classes
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {!canAccess && activeComponent !== "myaccount" ? (
              <div className="py-12 text-center">
                <p className="font-josefin text-gray-500">
                  Please verify your account to access this section.
                </p>
              </div>
            ) : (
              <>
                {activeComponent === "lessons" && (
                  <MyLessons userInfo={userInfo} />
                )}
                {activeComponent === "liveclass" && (
                  <Liveclass userInfo={userInfo} />
                )}
                {activeComponent === "mywallet" && (
                  <MyWallet userInfo={userInfo} />
                )}
                {activeComponent === "schedule" && (
                  <Scheduler userInfo={userInfo} />
                )}
                {activeComponent === "studentleads" && (
                  <StudentLeads userInfo={userInfo} />
                )}
                {activeComponent === "upcomingclasses" && (
                  <UpcomingClasses liveSessions={liveSessions} />
                )}
                {activeComponent === "revisionmaterials" && (
                  <RevisionMaterials userInfo={userInfo} />
                )}
                {activeComponent === "assessments" && (
                  <Assessments userInfo={userInfo} />
                )}
                {activeComponent === "profileupdate" && (
                  <TeacherProfileUpdate />
                )}
                {activeComponent === "myaccount" && <MyAccount />}
              </>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-100 bg-white py-3 text-center font-josefin text-xs text-gray-500">
          © {new Date().getFullYear()} StudyBuddy Africa · Teacher Dashboard
        </footer>
      </div>

      {/* Upload modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4 md:p-6">
              <h2 className="font-lilita text-xl text-[#015575] md:text-2xl">
                Upload video
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-josefin text-sm font-semibold text-gray-700">
                    Video title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#01B0F1]"
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-josefin text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="h-28 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#01B0F1]"
                    placeholder="Describe your video"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-josefin text-sm font-semibold text-gray-700">
                    Select video
                  </label>
                  <div className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#01B0F1]">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <FaCameraRetro className="mx-auto mb-2 text-3xl text-[#01B0F1]" />
                    <p className="font-josefin text-sm text-gray-600">
                      Click to upload (MP4, AVI, MOV)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="rounded-lg bg-gradient-to-r from-[#01B0F1] to-[#015575] px-6 py-2 font-bold text-white disabled:opacity-70"
                  >
                    {uploading ? "Uploading…" : "Upload video"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="mb-3 font-josefin font-semibold text-gray-800">
                  Preview
                </h3>
                {videoPreview ? (
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <video
                      controls
                      className="h-full w-full object-contain"
                      src={videoPreview}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-gray-500">
                    <FaCameraRetro className="mb-2 text-4xl" />
                    <p className="font-josefin text-sm">Preview appears here</p>
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
