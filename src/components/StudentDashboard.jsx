import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserCircle,
  FaWallet,
  FaChartLine,
  FaHistory,
  FaSignOutAlt,
  FaBookOpen,
  FaGraduationCap,
  FaCalendarAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import MyWallet from "./students/MyWallet";
import MyLessons from "./students/MyLessons";
import TeacherProfiles from "./students/TeachersProfiles";
import VideoApp from "./students/VideoApp";
import StudentsHome from "./students/studentsHome";
import Performance from "./students/Performance";
import StudentViewProfile from "./students/StudentViewProfile";
import axios from "axios";
import { FHOST } from "./constants/Functions";
import DashboardHeader from "./layout/DashboardHeader";
import { authStorage } from "../services/authStorage";
import { authService } from "../services/authService";
import { getUserDashboardData } from "../services/onboardingService";

const DashboardHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [dashProfile, setDashProfile] = useState(null);
  const [dashWallet, setDashWallet] = useState({
    balance: "0.00",
    currency: "KES",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const getProfileId = (user) => {
    if (user?.profile_id) return user.profile_id;
    if (user?.id) return user.id;
    try {
      const token = authStorage.getAccessToken();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.profile_id || payload.user_id || user?.id;
      }
    } catch (error) {
      console.error("Error extracting profile_id from token:", error);
    }
    return user?.id;
  };

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    const searchParams = new URLSearchParams(window.location.search);
    const studentIdFromQuery = searchParams.get("student_id");
    const studentIdFromStorage = localStorage.getItem("view_as_student_id");

    const initializeDarkMode = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setDarkMode(prefersDark);
    };

    const initializeFromImpersonation = async (studentId) => {
      try {
        const response = await axios
          .get(`${FHOST}/users/student/${studentId}`)
          .catch(() => null);
        const studentData = response?.data?.student || response?.data || null;
        const nameFromStorage = localStorage.getItem("view_as_student_name");
        const emailFromStorage = localStorage.getItem("view_as_student_email");
        const impersonatedUser = studentData
          ? {
              ...studentData,
              id: studentData.id || Number(studentId),
              username:
                studentData.username ||
                studentData.full_name ||
                nameFromStorage ||
                `Student ${studentId}`,
              full_name:
                studentData.full_name ||
                studentData.username ||
                nameFromStorage ||
                `Student ${studentId}`,
              email: studentData.email || emailFromStorage || "",
              role: studentData.role || "student",
              impersonated: true,
            }
          : {
              id: Number(studentId),
              username: nameFromStorage || `Student ${studentId}`,
              full_name: nameFromStorage || `Student ${studentId}`,
              email: emailFromStorage || "",
              role: "student",
              impersonated: true,
            };
        setUserInfo(impersonatedUser);
      } catch {
        const nameFromStorage = localStorage.getItem("view_as_student_name");
        const emailFromStorage = localStorage.getItem("view_as_student_email");
        setUserInfo({
          id: Number(studentId),
          username: nameFromStorage || `Student ${studentId}`,
          full_name: nameFromStorage || `Student ${studentId}`,
          email: emailFromStorage || "",
          role: "student",
          impersonated: true,
        });
      } finally {
        setIsLoading(false);
        setProfileLoading(false);
      }
    };

    const hydrateDashboard = async () => {
      setProfileLoading(true);
      try {
        let token = authStorage.getAccessToken();
        if (!token && authStorage.getRefreshToken()) {
          try {
            token = await authService.refreshToken();
          } catch {
            /* ignore */
          }
        }
        const dash = await getUserDashboardData();
        if (dash.ok) {
          if (dash.user) {
            setUserInfo((prev) => ({
              ...(prev || {}),
              ...dash.user,
              profile: dash.profile,
            }));
          }
          setDashProfile(dash.profile);
          setDashWallet(dash.wallet || { balance: "0.00", currency: "KES" });
        }
      } catch (err) {
        console.warn("Dashboard hydration failed:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    const impersonationId = studentIdFromQuery || studentIdFromStorage;
    if (impersonationId) {
      initializeFromImpersonation(impersonationId).finally(initializeDarkMode);
      return;
    }

    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
      setIsLoading(false);
      initializeDarkMode();
      hydrateDashboard();
      return;
    }

    window.location.href = "/login";
    initializeDarkMode();
  }, []);

  useEffect(() => {
    const onProfileUpdate = () => {
      const updatedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (updatedUserInfo) {
        setUserInfo(updatedUserInfo);
      }
    };
    window.addEventListener("profile-updated", onProfileUpdate);
    return () => window.removeEventListener("profile-updated", onProfileUpdate);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    authStorage.clearTokens();
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

  const formatKes = (n) =>
    `KES ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#01B0F1]" />
        </div>
      );
    }

    switch (activeComponent) {
      case "dashboard": {
        const firstName =
          userInfo?.first_name ||
          userInfo?.full_name?.split?.(" ")?.[0] ||
          userInfo?.username ||
          "Student";
        const curriculum = dashProfile?.curriculum_type || "";
        const grade = dashProfile?.grade_name || "";
        const school = dashProfile?.school_name || "";
        const subjects = dashProfile?.target_subjects || [];
        const walletLabel = formatKes(dashWallet?.balance);

        return (
          <div className="space-y-6">
            {/* Greeting — SBA-SPEC-2026-007 §3.1.A */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="font-josefin text-sm font-semibold uppercase tracking-wide text-[#01B0F1]">
                Student portal
              </p>
              <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
                Welcome back, {firstName}!
              </h1>
              {(curriculum || grade) && (
                <p className="mt-2 inline-flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#01B0F1]/10 px-3 py-1 font-josefin text-xs font-semibold text-[#015575]">
                    {[curriculum, grade].filter(Boolean).join(" · ")}
                  </span>
                  {school && (
                    <span className="font-josefin text-sm text-slate-500">
                      {school}
                    </span>
                  )}
                </p>
              )}
              {profileLoading && (
                <p className="mt-2 font-josefin text-sm text-slate-400">
                  Loading your profile…
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {[
                {
                  label: "Active Lessons",
                  value: "0",
                  icon: <FaBookOpen className="text-xl" />,
                  accent: "border-[#01B0F1]",
                  bg: "bg-[#01B0F1]/10 text-[#01B0F1]",
                },
                {
                  label: "Completed Lessons",
                  value: "0",
                  icon: <FaGraduationCap className="text-xl" />,
                  accent: "border-emerald-500",
                  bg: "bg-emerald-500/10 text-emerald-600",
                },
                {
                  label: "Wallet Balance",
                  value: walletLabel,
                  icon: <FaWallet className="text-xl" />,
                  accent: "border-[#015575]",
                  bg: "bg-[#015575]/10 text-[#015575]",
                },
                {
                  label: "Upcoming Sessions",
                  value: "0",
                  icon: <FaCalendarAlt className="text-xl" />,
                  accent: "border-violet-500",
                  bg: "bg-violet-500/10 text-violet-600",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-xl border-l-4 bg-white p-4 shadow-sm md:p-6 ${card.accent}`}
                >
                  <div className="flex items-center">
                    <div className={`mr-4 rounded-lg p-3 ${card.bg}`}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="font-josefin text-xs text-gray-500 md:text-sm">
                        {card.label}
                      </p>
                      <h3 className="font-lilita text-xl text-[#015575] md:text-2xl">
                        {card.value}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Focus subjects — §3.1.B */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-lilita text-xl text-[#015575]">
                Your focus subjects
              </h2>
              {profileLoading ? (
                <p className="font-josefin text-sm text-slate-400">
                  Loading subjects…
                </p>
              ) : subjects.length === 0 ? (
                <p className="font-josefin text-sm text-slate-500">
                  No subjects on file yet. They appear here after onboarding
                  Step 3.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((sub) => {
                    const label =
                      typeof sub === "string"
                        ? sub
                        : sub.name || sub.subject || String(sub);
                    return (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"
                      >
                        <p className="font-lilita text-lg text-[#015575]">
                          {label}
                        </p>
                        <p className="mt-1 font-josefin text-xs text-slate-500">
                          0% completed · AI diagnostic ready
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveComponent("lessons")}
                          className="mt-3 rounded-lg bg-[#015575] px-3 py-1.5 font-josefin text-xs font-semibold text-white hover:bg-[#01B0F1]"
                        >
                          Explore topics
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick actions — payments gated until Week 5 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
              <div
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] p-6 text-white shadow-lg transition hover:shadow-xl"
                onClick={() => setActiveComponent("lessons")}
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-white/20 p-3">
                    <FaBookOpen className="text-xl" />
                  </div>
                  <h2 className="font-lilita text-xl">Book a lesson</h2>
                </div>
                <p className="mb-6 text-white/90">
                  Schedule your next learning session
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#015575] hover:bg-gray-100 md:px-6"
                >
                  Book now
                </button>
              </div>

              <div
                className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                onClick={() => setActiveComponent("teachers")}
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-[#01B0F1]/10 p-3 text-[#01B0F1]">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <h2 className="font-lilita text-xl text-[#015575]">
                    Browse teachers
                  </h2>
                </div>
                <p className="mb-6 text-gray-600">
                  Find and connect with qualified tutors
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-[#01B0F1] px-4 py-2 text-sm font-bold text-white hover:bg-[#015575] md:px-6"
                >
                  View teachers
                </button>
              </div>

              <div
                className="cursor-pointer rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 transition hover:shadow-sm"
                onClick={() => setActiveComponent("mywallet")}
                title="M-Pesa deposits launch in Week 5"
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-slate-200/80 p-3 text-slate-600">
                    <FaWallet className="text-xl" />
                  </div>
                  <h2 className="font-lilita text-xl text-[#015575]">Wallet</h2>
                </div>
                <p className="mb-2 font-josefin text-sm text-gray-600">
                  Balance {walletLabel}. Deposits open in Week 5 of the
                  campaign.
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-600 md:px-6"
                >
                  View wallet (pay later)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4 md:p-6">
                  <h2 className="flex items-center font-lilita text-lg text-[#015575] md:text-xl">
                    <FaGraduationCap className="mr-2 text-[#01B0F1]" />
                    Recent teachers
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="py-6 text-center font-josefin text-gray-500">
                    No recent teachers
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveComponent("teachers")}
                      className="font-josefin text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
                    >
                      View all teachers
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4 md:p-6">
                  <h2 className="flex items-center font-lilita text-lg text-[#015575] md:text-xl">
                    <FaCalendarAlt className="mr-2 text-[#01B0F1]" />
                    Upcoming lessons
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="py-6 text-center font-josefin text-gray-500">
                    No upcoming lessons
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveComponent("lessons")}
                      className="font-josefin text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
                    >
                      View all lessons
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "mywallet":
        return <MyWallet userInfo={userInfo} darkMode={darkMode} />;

      case "lessons":
        return (
          <MyLessons
            userInfo={userInfo}
            darkMode={darkMode}
            onEnterRoom={() => setFocusMode(true)}
            onLeaveRoom={() => setFocusMode(false)}
          />
        );

      case "teachers":
        return <TeacherProfiles userInfo={userInfo} darkMode={darkMode} />;

      case "videofeed":
        return <VideoApp userInfo={userInfo} darkMode={darkMode} />;

      case "profileupdate":
      case "myaccount":
        return (
          <StudentViewProfile userInfo={userInfo} dashProfile={dashProfile} />
        );

      case "performance":
        return <Performance userInfo={userInfo} darkMode={darkMode} />;

      case "history":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-lilita text-2xl text-[#015575]">
                Activity history
              </h2>
              <div className="py-10 text-center font-josefin text-gray-500">
                No activity yet.
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="flex items-center font-josefin text-gray-800">
                <FaUserCircle className="mr-3 text-xl text-[#01B0F1]" />
                My account
              </span>
              <button
                type="button"
                onClick={() => setActiveComponent("myaccount")}
                className="rounded-lg bg-gradient-to-r from-[#01B0F1] to-[#015575] px-4 py-2 text-white"
              >
                View
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="flex items-center font-josefin text-gray-800">
                <FaSun className="mr-2 text-amber-500" />
                <FaMoon className="mr-3 text-[#015575]" />
                Dark mode
              </span>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-[#015575]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );

      default:
        return (
          <StudentsHome
            setActiveComponent={setActiveComponent}
            darkMode={darkMode}
          />
        );
    }
  };

  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#01B0F1]" />
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } flex min-h-screen bg-[#F8FAFC] font-josefin transition-colors duration-300`}
    >
      <aside
        className={`fixed inset-y-0 z-50 w-[280px] transform bg-[#013349] shadow-2xl transition-transform duration-300 ease-in-out ${
          focusMode
            ? "-translate-x-full pointer-events-none"
            : sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#01B0F1]/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-24 h-48 w-48 rounded-full bg-[#01B0F1]/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col px-5 py-8 lg:py-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
              <img
                src="/images/logo.png"
                alt="StudyBuddy"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h2 className="font-lilita text-xl text-white">
              Student <span className="text-[#81CFFF]">Dashboard</span>
            </h2>
            <p className="mt-1 font-josefin text-[11px] uppercase tracking-wider text-white/50">
              Learning portal
            </p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = activeComponent === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveComponent(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm transition-all ${
                    active
                      ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/30"
                      : "text-[#B4C8DC] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              className={`flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm transition-all ${
                activeComponent === "myaccount" ||
                activeComponent === "profileupdate"
                  ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/30"
                  : "text-[#B4C8DC] hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => {
                setActiveComponent("myaccount");
                setSidebarOpen(false);
              }}
            >
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center">
                <FaUserCircle />
              </span>
              <span className="truncate">My Account</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-josefin text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <FaSignOutAlt />
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div
        className={`flex flex-1 flex-col ${
          focusMode ? "lg:pl-0" : "lg:pl-[280px]"
        }`}
      >
        {!focusMode && (
          <DashboardHeader
            title={
              navigation.find((n) => n.key === activeComponent)?.name ||
              (activeComponent === "myaccount" ||
              activeComponent === "profileupdate"
                ? "My Account"
                : "Dashboard")
            }
            userInfo={userInfo}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(true)}
            onViewProfile={() => setActiveComponent("myaccount")}
            onEditProfile={() => setActiveComponent("myaccount")}
          />
        )}
        <main
          className={
            focusMode
              ? "flex-1 overflow-hidden bg-[#F8FAFC] p-0"
              : "flex-1 space-y-6 overflow-y-auto bg-[#F8FAFC] p-4 transition-all duration-300 md:p-6 lg:p-8"
          }
        >
          {successMessage && (
            <div className="rounded-lg bg-emerald-50 px-4 py-2 font-josefin text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 px-4 py-2 font-josefin text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardHome;
