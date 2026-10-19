import React, { useState, useEffect, useCallback } from "react";
import {
  FaHome,
  FaUserCircle,
  FaWallet,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaVideo,
  FaCalendarAlt,
  FaBookOpen,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";
import { FHOST } from "./constants/Functions";
import DashboardHeader from "./layout/DashboardHeader";
import { authStorage } from "../services/authStorage";
import { authService } from "../services/authService";
import { getUserDashboardData } from "../services/onboardingService";
import LiveClass from "./teachers/Liveclass";
import Scheduler from "./teachers/Scheduler";
import MyLessons from "./teachers/MyLessons";
import MyWallet from "./teachers/mywallet";

/** Clamp display rate to product policy KES 50–800 */
const clampRate = (value) => {
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.min(800, Math.max(50, n));
};

const formatKes = (n) => {
  if (n == null || n === "") return "KES —";
  return `KES ${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatKesMoney = (n) =>
  `KES ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashProfile, setDashProfile] = useState(null);
  const [dashWallet, setDashWallet] = useState({
    balance: "0.00",
    currency: "KES",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isVerified = Boolean(
    dashProfile?.is_verified === true ||
    dashProfile?.verification_status === "approved" ||
    dashProfile?.verification_status === "verified" ||
    userInfo?.is_verified === true ||
    userInfo?.verification_status === "approved",
  );

  const subjectsRaw =
    dashProfile?.subjects ||
    dashProfile?.curriculums_taught ||
    dashProfile?.target_subjects ||
    userInfo?.subjects ||
    [];
  const subjects = (Array.isArray(subjectsRaw) ? subjectsRaw : [subjectsRaw])
    .map((s) =>
      typeof s === "string" ? s : s?.name || s?.subject || String(s || ""),
    )
    .filter(Boolean)
    .slice(0, 3);

  const hourlyRate = clampRate(
    dashProfile?.hourly_rate ??
      dashProfile?.rate ??
      userInfo?.hourly_rate ??
      null,
  );

  const hydrate = useCallback(async () => {
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

      // Optional teacher me endpoint for KYC flags
      try {
        const t = authStorage.getAccessToken();
        if (t) {
          const res = await axios.get(`${FHOST}/api/me/teacher/`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          const p = res.data || {};
          setDashProfile((prev) => ({ ...(prev || {}), ...p }));
          if (p.is_verified != null || p.verification_status) {
            setUserInfo((prev) =>
              prev
                ? {
                    ...prev,
                    is_verified: p.is_verified ?? prev.is_verified,
                    verification_status:
                      p.verification_status ?? prev.verification_status,
                  }
                : prev,
            );
          }
        }
      } catch {
        /* status payload is enough */
      }
    } catch (err) {
      console.warn("Teacher dashboard hydration failed:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored =
      (typeof authStorage.getUserInfo === "function" &&
        authStorage.getUserInfo()) ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("userInfo") || "null");
        } catch {
          return null;
        }
      })();

    if (
      !stored &&
      !authStorage.isAuthenticated?.() &&
      !authStorage.getRefreshToken?.()
    ) {
      window.location.href = "/login";
      return;
    }

    if (stored) setUserInfo(stored);
    setIsLoading(false);
    hydrate();
  }, [hydrate]);

  const handleLogout = () => {
    authStorage.clearTokens();
    window.location.href = "/";
  };

  const navigation = [
    {
      name: "Dashboard",
      key: "dashboard",
      icon: <FaHome className="text-lg" />,
    },
    {
      name: "My Lessons",
      key: "lessons",
      icon: <FaBookOpen className="text-lg" />,
    },
    {
      name: "Live Classes",
      key: "live",
      icon: <FaVideo className="text-lg" />,
    },
    {
      name: "Schedule",
      key: "schedule",
      icon: <FaCalendarAlt className="text-lg" />,
    },
    {
      name: "Wallet",
      key: "wallet",
      icon: <FaWallet className="text-lg" />,
    },
  ];

  const firstName =
    userInfo?.first_name ||
    userInfo?.full_name?.split?.(" ")?.[0] ||
    userInfo?.username ||
    "Teacher";

  const renderDashboardHome = () => (
    <div className="space-y-6">
      {/* KYC banner — SBA-SPEC-2026-007 Phase 4 */}
      {!isVerified && (
        <div
          className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-lilita text-base text-amber-900">
                Verification pending
              </p>
              <p className="font-josefin text-sm text-amber-800/90">
                Your KYC documents are under review. You can explore the portal;
                some teaching actions may stay limited until an admin approves
                you.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-amber-200/80 px-3 py-1 font-josefin text-xs font-semibold text-amber-900">
            Awaiting review
          </span>
        </div>
      )}

      {isVerified && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <FaCheckCircle className="text-emerald-600" />
          <p className="font-josefin text-sm font-medium text-emerald-800">
            Verified educator — you are cleared to teach on StudyBuddy.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="font-josefin text-sm font-semibold uppercase tracking-wide text-[#01B0F1]">
          Teacher portal
        </p>
        <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        {profileLoading ? (
          <p className="mt-2 font-josefin text-sm text-slate-400">
            Loading your profile…
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {subjects.length > 0 ? (
              subjects.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[#01B0F1]/10 px-3 py-1 font-josefin text-xs font-semibold text-[#015575]"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="font-josefin text-sm text-slate-500">
                No subjects on file yet (max 3 after onboarding).
              </span>
            )}
            {hourlyRate != null && (
              <span className="rounded-full bg-[#015575]/10 px-3 py-1 font-josefin text-xs font-semibold text-[#015575]">
                {formatKes(hourlyRate)}/hr
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Wallet balance",
            value: formatKesMoney(dashWallet?.balance),
            icon: <FaWallet className="text-xl" />,
            accent: "border-[#015575]",
            bg: "bg-[#015575]/10 text-[#015575]",
          },
          {
            label: "Hourly rate",
            value: hourlyRate != null ? `${formatKes(hourlyRate)}/hr` : "—",
            icon: <FaChalkboardTeacher className="text-xl" />,
            accent: "border-[#01B0F1]",
            bg: "bg-[#01B0F1]/10 text-[#01B0F1]",
          },
          {
            label: "Subjects (max 3)",
            value: String(subjects.length),
            icon: <FaBookOpen className="text-xl" />,
            accent: "border-violet-500",
            bg: "bg-violet-500/10 text-violet-600",
          },
          {
            label: "Students / leads",
            value: "—",
            icon: <FaUsers className="text-xl" />,
            accent: "border-emerald-500",
            bg: "bg-emerald-500/10 text-emerald-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border-l-4 bg-white p-4 shadow-sm md:p-5 ${card.accent}`}
          >
            <div className="flex items-center">
              <div className={`mr-3 rounded-lg p-3 ${card.bg}`}>
                {card.icon}
              </div>
              <div>
                <p className="font-josefin text-xs text-gray-500">
                  {card.label}
                </p>
                <h3 className="font-lilita text-xl text-[#015575]">
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveComponent("live")}
          className="rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] p-6 text-left text-white shadow-lg transition hover:shadow-xl"
        >
          <FaVideo className="mb-3 text-2xl opacity-90" />
          <h2 className="font-lilita text-xl">Live classes</h2>
          <p className="mt-1 font-josefin text-sm text-white/90">
            Create or join a session
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveComponent("schedule")}
          className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <FaCalendarAlt className="mb-3 text-2xl text-[#01B0F1]" />
          <h2 className="font-lilita text-xl text-[#015575]">Schedule</h2>
          <p className="mt-1 font-josefin text-sm text-gray-600">
            Availability and bookings
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveComponent("wallet")}
          className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <FaWallet className="mb-3 text-2xl text-[#015575]" />
          <h2 className="font-lilita text-xl text-[#015575]">Wallet</h2>
          <p className="mt-1 font-josefin text-sm text-gray-600">
            Balance {formatKesMoney(dashWallet?.balance)} · payouts after
            verification
          </p>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-lilita text-xl text-[#015575]">My account</h2>
        <p className="font-josefin text-sm text-slate-600">
          Professional identity and rates were collected during onboarding.
          Contact support to change curriculum or KYC documents — this portal
          does not re-open those forms.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-josefin text-xs text-slate-500">Email</dt>
            <dd className="font-josefin text-sm font-medium text-[#015575]">
              {userInfo?.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="font-josefin text-xs text-slate-500">Status</dt>
            <dd className="font-josefin text-sm font-medium text-[#015575]">
              {isVerified ? "Verified" : "Pending verification"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  const renderActive = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#01B0F1]" />
        </div>
      );
    }

    switch (activeComponent) {
      case "dashboard":
        return renderDashboardHome();
      case "lessons":
        return <MyLessons userInfo={userInfo} />;
      case "live":
        return <LiveClass userInfo={userInfo} />;
      case "schedule":
        return <Scheduler userInfo={userInfo} />;
      case "wallet":
        return <MyWallet userInfo={userInfo} />;
      case "account":
        return renderDashboardHome();
      default:
        return renderDashboardHome();
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
    <div className="flex min-h-screen bg-[#F8FAFC] font-josefin">
      <aside
        className={`fixed inset-y-0 z-50 w-[280px] transform bg-[#013349] shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#01B0F1]/15 blur-3xl"
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
              Teacher <span className="text-[#81CFFF]">Dashboard</span>
            </h2>
            <p className="mt-1 font-josefin text-[11px] uppercase tracking-wider text-white/50">
              Educator portal
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
              onClick={() => {
                setActiveComponent("account");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm transition-all ${
                activeComponent === "account"
                  ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/30"
                  : "text-[#B4C8DC] hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="mr-3 flex h-6 w-6 items-center justify-center">
                <FaUserCircle />
              </span>
              My Account
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

      <div className="flex flex-1 flex-col lg:pl-[280px]">
        <DashboardHeader
          title={
            navigation.find((n) => n.key === activeComponent)?.name ||
            (activeComponent === "account" ? "My Account" : "Dashboard")
          }
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          onViewProfile={() => setActiveComponent("account")}
          onEditProfile={() => setActiveComponent("account")}
        />
        <main className="flex-1 space-y-6 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
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
          {renderActive()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
