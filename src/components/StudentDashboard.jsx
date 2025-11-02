import React, { useState, useEffect } from "react";
import {
  FaCamera,
  FaChalkboardTeacher,
  FaHome,
  FaUserCircle,
  FaVideo,
  FaWallet,
  FaChartLine,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaSun,
  FaMoon,
  FaBookOpen,
  FaGraduationCap,
  FaCalendarAlt,
} from "react-icons/fa";
import MyWallet from "./students/MyWallet";
import MyLessons from "./students/MyLessons";
import TeacherProfiles from "./students/TeachersProfiles";
import VideoApp from "./students/VideoApp";
import StudentsHome from "./students/studentsHome";
import Performance from "./students/Performance";
import axios from "axios";
import { FHOST } from "./constants/Functions";
import DashboardHeader from "./layout/DashboardHeader";

const DashboardHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
 const [activeComponent, setActiveComponent] = useState("dashboard");
  const [profilePhoto, setProfilePhoto] = useState(
    "https://via.placeholder.com/150"
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    const searchParams = new URLSearchParams(window.location.search);
    const studentIdFromQuery = searchParams.get("student_id");
    const studentIdFromStorage = localStorage.getItem("view_as_student_id");

    const initializeDarkMode = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    };

    const initializeFromImpersonation = async (studentId) => {
      try {
        // Try to fetch student profile if endpoint allows unauthenticated access; otherwise fall back
        const response = await axios.get(`${FHOST}/users/student/${studentId}`).catch(() => null);
        const studentData = response?.data?.student || response?.data || null;
        const nameFromStorage = localStorage.getItem("view_as_student_name");
        const emailFromStorage = localStorage.getItem("view_as_student_email");
        const impersonatedUser = studentData ? {
          ...studentData,
          id: studentData.id || Number(studentId),
          username: studentData.username || studentData.full_name || nameFromStorage || `Student ${studentId}`,
          full_name: studentData.full_name || studentData.username || nameFromStorage || `Student ${studentId}`,
          email: studentData.email || emailFromStorage || "",
          role: studentData.role || "student",
          impersonated: true,
        } : {
          id: Number(studentId),
          username: nameFromStorage || `Student ${studentId}`,
          full_name: nameFromStorage || `Student ${studentId}`,
          email: emailFromStorage || "",
          role: "student",
          impersonated: true,
        };
        setUserInfo(impersonatedUser);
      } catch (_err) {
        // Fall back to minimal impersonation context
        const nameFromStorage = localStorage.getItem("view_as_student_name");
        const emailFromStorage = localStorage.getItem("view_as_student_email");
        setUserInfo({ id: Number(studentId), username: nameFromStorage || `Student ${studentId}`, full_name: nameFromStorage || `Student ${studentId}`, email: emailFromStorage || "", role: "student", impersonated: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Impersonation path has priority over stored user
    const impersonationId = studentIdFromQuery || studentIdFromStorage;
    if (impersonationId) {
      initializeFromImpersonation(impersonationId).finally(initializeDarkMode);
      return;
    }

    // Fall back to authenticated user if available
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
      setIsLoading(false);
      initializeDarkMode();
      return;
    }

    // No auth and no impersonation -> require login
    window.location.href = "/login";
    initializeDarkMode();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setProfilePhoto(base64Image);

        const formData = new FormData();
        formData.append("profilePhoto", file);

        try {
          const response = await axios.post(
            `${FHOST}/auth/update-profile-photo/${userInfo?.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.status === 200) {
            setSuccessMessage("Profile photo updated successfully!");
            // Update local storage with new profile picture
            const updatedUserInfo = {
              ...userInfo,
              profile_picture: response.data.profilePictureUrl || base64Image,
            };
            localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            setUserInfo(updatedUserInfo);
            setTimeout(() => setSuccessMessage(""), 3000);
          } else {
            setErrorMessage(
              "Failed to update profile photo. Please try again."
            );
            setTimeout(() => setErrorMessage(""), 3000);
          }
        } catch (error) {
          setErrorMessage(
            "An error occurred while updating your profile photo."
          );
          setTimeout(() => setErrorMessage(""), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("view_as_student_id");
    localStorage.removeItem("view_as_student_name");
    localStorage.removeItem("view_as_student_email");
    window.location.href = "/";
  };

  const navigation = [
     {
      name: "Dashboard",
      key: "dashboard",
      icon: <FaHome className="text-lg" />,
    },
    {
      name: "Teachers Profile",
      key: "teachers",
      icon: <FaGraduationCap className="text-lg" />,
    },
    {
      name: "Payments",
      key: "mywallet",
      icon: <FaWallet className="text-lg" />,
    },
    {
      name: "Lessons",
      key: "lessons",
      icon: <FaBookOpen className="text-lg" />,
    },
    {
      name: "Video Feed",
      key: "videofeed",
      icon: <FaVideo className="text-lg" />,
    },
    {
      name: "Performance",
      key: "performance",
      icon: <FaChartLine className="text-lg" />,
    },
    {
      name: "History",
      key: "history",
      icon: <FaHistory className="text-lg" />,
    },

  ];

  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeComponent) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-sky-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-sky-500/10 text-sky-500 mr-4">
                    <FaBookOpen className="text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Active Lessons</p>
                    <div className="flex items-baseline">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">0</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-500 mr-4">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Completed Lessons</p>
                    <div className="flex items-baseline">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">0</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 mr-4">
                    <FaWallet className="text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Wallet Balance</p>
                    <div className="flex items-baseline">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">Ksh 0</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500 mr-4">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Upcoming Sessions</p>
                    <div className="flex items-baseline">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">0</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Book Lesson Card */}
              <div
                className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg text-white p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setActiveComponent("lessons")}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <FaBookOpen className="text-xl" />
                  </div>
                  <h2 className="text-xl font-lilita">Book a Lesson</h2>
                </div>
                <p className="mb-6 text-blue-100">Schedule your next learning session</p>
                <button className="bg-white text-sky-600 py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-gray-100 transition text-sm md:text-base">
                  Book Now
                </button>
              </div>

              {/* View Teachers Card */}
              <div
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                onClick={() => setActiveComponent("teachers")}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-sky-500/10 p-3 rounded-full mr-4 text-sky-500">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <h2 className="text-xl font-lilita text-gray-800">Browse Teachers</h2>
                </div>
                <p className="mb-6 text-gray-600">Find and connect with qualified tutors</p>
                <button className="bg-sky-500 text-white py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-sky-600 transition text-sm md:text-base">
                  View Teachers
                </button>
              </div>

              {/* Make Payment Card */}
              <div
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                onClick={() => setActiveComponent("mywallet")}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-green-500/10 p-3 rounded-full mr-4 text-green-500">
                    <FaWallet className="text-xl" />
                  </div>
                  <h2 className="text-xl font-lilita text-gray-800">Make Payment</h2>
                </div>
                <p className="mb-6 text-gray-600">Add funds to your wallet for lessons</p>
                <button className="bg-green-500 text-white py-2 px-4 md:px-6 rounded-lg font-bold hover:bg-green-600 transition text-sm md:text-base">
                  Add Funds
                </button>
              </div>
            </div>

            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Teachers */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-lilita text-gray-800 flex items-center">
                    <FaGraduationCap className="mr-2 text-sky-500" />
                    Recent Teachers
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="space-y-4 text-center text-gray-500 py-6">No recent teachers</div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveComponent("teachers")}
                      className="text-sky-500 font-semibold hover:text-sky-600 transition-colors text-sm md:text-base"
                    >
                      View All Teachers
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Lessons */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-lilita text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-sky-500" />
                    Upcoming Lessons
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="space-y-4 text-center text-gray-500 py-6">No upcoming lessons</div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveComponent("lessons")}
                      className="text-sky-500 font-semibold hover:text-sky-600 transition-colors text-sm md:text-base"
                    >
                      View All Lessons
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "mywallet":
        return <MyWallet userInfo={userInfo} darkMode={darkMode} />;
      case "lessons":
        return <MyLessons userInfo={userInfo} darkMode={darkMode} />;
      case "teachers":
        return <TeacherProfiles userInfo={userInfo} darkMode={darkMode} />;
      case "videofeed":
        return <VideoApp userInfo={userInfo} darkMode={darkMode} />;
      case "myaccount":
        return (
          <div className="max-w-4xl mx-auto">
            <div
              className="p-6 rounded-2xl shadow-lg bg-white transition-all duration-300"
            >
              <h2
                className="text-2xl font-bold mb-6 text-gray-800 font-lilita"
              >
                My Account
              </h2>

              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={userInfo?.profile_picture || profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <label
                    htmlFor="file-upload"
                    className="absolute bottom-2 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full text-white text-xl cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
                  >
                    <FaCamera />
                  </label>
                </div>

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg w-full max-w-md text-center">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg w-full max-w-md text-center">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-gray-50 border-gray-300 border text-gray-800"
                    value={userInfo?.username || ""}
                    disabled
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-lg bg-gray-50 border-gray-300 border text-gray-800"
                    value={userInfo?.email || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-gray-50 border-gray-300 border text-gray-800 min-h-[120px]"
                  placeholder="Tell us a little about yourself..."
                  defaultValue="Passionate student with a love for mathematics and science. Excited to learn and grow with my tutors!"
                />
              </div>

              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <p
                className="text-sm text-center text-gray-500"
              >
                Choose a square image for best results
              </p>
            </div>
          </div>
        );
      case "performance":
        return <Performance userInfo={userInfo} darkMode={darkMode} />;
      case "history":
        return (
          <div className="max-w-4xl mx-auto">
            <div
              className="p-6 rounded-2xl shadow-lg bg-white transition-all duration-300"
            >
              <h2
                className="text-2xl font-bold mb-6 text-gray-800 font-lilita"
              >
                Activity History
              </h2>
              <div className="py-10 text-center text-gray-500">
                No activity yet.
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            <div
              className="p-6 rounded-2xl shadow-lg flex justify-between items-center bg-white transition-all duration-300"
            >
              <span
                className={`flex items-center ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <FaUserCircle className="mr-3 text-indigo-500 text-xl" /> Edit
                Profile
              </span>
              <button
                onClick={() => setActiveComponent("myaccount")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Edit
              </button>
            </div>

            <div
              className="p-6 rounded-2xl shadow-lg flex justify-between items-center bg-white transition-all duration-300"
            >
              <span
                className={`flex items-center ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <div className="mr-3 flex items-center justify-center w-6 h-6">
                  <FaSun
                    className={`mr-2 ${
                      darkMode ? "text-amber-400" : "text-amber-500"
                    }`}
                  />
                  <FaMoon
                    className={`ml-2 ${
                      darkMode ? "text-indigo-400" : "text-indigo-500"
                    }`}
                  />
                </div>
                Dark Mode
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  darkMode ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="">
            <StudentsHome
              setActiveComponent={setActiveComponent}
              darkMode={darkMode}
            />
          </div>
        );
    }
  };

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } flex min-h-screen bg-gray-50 dark:bg-gray-900 font-josefin transition-colors duration-300`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-sky-500 shadow-xl`}
      >
        <div className="px-6 py-8 lg:py-12">
          <h2 className="text-2xl font-lilita text-white text-center mb-8">
            Student<span className="text-amber-100"> Dashboard</span>
          </h2>
          <nav className="mt-8 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveComponent(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-left ${
                  activeComponent === item.key
                    ? "bg-white/20 text-white"
                    : "text-indigo-100 dark:text-gray-300 hover:bg-white/10"
                }`}
              >
                <span className="w-6 h-6 mr-3 flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </button>
            ))}
            {/* My Account Button */}
            <button
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-left ${
                activeComponent === "myaccount"
                  ? "bg-white/20 text-white"
                  : "text-indigo-100 dark:text-gray-300 hover:bg-white/10"
              }`}
              onClick={() => {
                setActiveComponent("myaccount");
                setSidebarOpen(false);
              }}
            >
              <span className="w-6 h-6 mr-3 flex-shrink-0">
                <FaUserCircle />
              </span>
              <span className="truncate">My Account</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <DashboardHeader
          title={navigation.find((n) => n.key === activeComponent)?.name || "Dashboard"}
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          onViewProfile={() => setActiveComponent("myaccount")}
          onEditProfile={() => setActiveComponent("myaccount")}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8 space-y-6 transition-all duration-300">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardHome;
