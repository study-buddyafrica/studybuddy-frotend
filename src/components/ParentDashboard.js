import React, { useState, useEffect, useCallback } from "react";
import {
  FaHome,
  FaUserCircle,
  FaWallet,
  FaSignOutAlt,
  FaUsers,
  FaChild,
  FaPlus,
  FaCalendarCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import { FHOST } from "./constants/Functions";
import DashboardHeader from "./layout/DashboardHeader";
import { authStorage } from "../services/authStorage";
import { authService } from "../services/authService";
import { getUserDashboardData } from "../services/onboardingService";

/** Flip to true when Week 5 payments go live */
const PAYMENTS_ENABLED = false;

const formatKes = (n) =>
  `KES ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ParentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashProfile, setDashProfile] = useState(null);
  const [dashWallet, setDashWallet] = useState({
    balance: "0.00",
    currency: "KES",
  });
  const [learners, setLearners] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDepositNotice, setShowDepositNotice] = useState(false);
  const [showAddLearnerHint, setShowAddLearnerHint] = useState(false);

  const loadWardFallback = () => {
    try {
      const raw = sessionStorage.getItem("parentWardData");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.children && Array.isArray(parsed.children))
        return parsed.children;
      if (parsed?.linked_children) return parsed.linked_children;
      return [];
    } catch {
      return [];
    }
  };

  const normalizeLearners = (profile, statusRaw) => {
    const fromProfile =
      profile?.linked_children ||
      profile?.children ||
      profile?.wards ||
      statusRaw?.data?.linked_children ||
      statusRaw?.linked_children ||
      [];
    if (Array.isArray(fromProfile) && fromProfile.length > 0) {
      return fromProfile.map((c, i) => ({
        id: c.id || c.profile_id || `ward-${i}`,
        name:
          c.full_name ||
          c.name ||
          [c.first_name, c.last_name].filter(Boolean).join(" ") ||
          "Learner",
        grade: c.grade_name || c.grade || c.level || "—",
        curriculum: c.curriculum_type || c.curriculum || "—",
        school: c.school_name || c.school || "",
        attended_this_week: c.attended_this_week ?? c.attendance_count ?? null,
      }));
    }
    return loadWardFallback().map((c, i) => ({
      id: c.id || `local-${i}`,
      name:
        c.full_name ||
        c.name ||
        [c.first_name, c.last_name].filter(Boolean).join(" ") ||
        "Learner",
      grade: c.grade_name || c.grade || "—",
      curriculum: c.curriculum_type || c.curriculum || "—",
      school: c.school_name || c.school || "",
      attended_this_week: c.attended_this_week ?? null,
    }));
  };

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
          authStorage.setUserInfo?.({
            ...(authStorage.getUserInfo?.() || {}),
            ...dash.user,
          });
        }
        setDashProfile(dash.profile);
        setDashWallet(dash.wallet || { balance: "0.00", currency: "KES" });
        setLearners(normalizeLearners(dash.profile, dash.raw));
      } else {
        setLearners(normalizeLearners(null, null));
      }

      // Optional dedicated children endpoint if available
      try {
        const t =
          authStorage.getAccessToken() ||
          (await authService.refreshToken().catch(() => null));
        if (t) {
          const res = await axios.get(`${FHOST}/api/parent/children/`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          const list =
            res.data?.results || res.data?.children || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setLearners(
              list.map((c, i) => ({
                id: c.id || c.profile_id || `api-${i}`,
                name:
                  c.full_name ||
                  c.name ||
                  [c.first_name, c.last_name].filter(Boolean).join(" ") ||
                  "Learner",
                grade: c.grade_name || c.grade || "—",
                curriculum: c.curriculum_type || c.curriculum || "—",
                school: c.school_name || c.school || "",
                attended_this_week:
                  c.attended_this_week ?? c.attendance_count ?? null,
              })),
            );
          }
        }
      } catch {
        /* keep status / sessionStorage learners */
      }
    } catch (err) {
      console.warn("Parent dashboard hydration failed:", err);
      setLearners(normalizeLearners(null, null));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored =
      authStorage.getUserInfo?.() ||
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
    sessionStorage.removeItem("parentWardData");
    window.location.href = "/";
  };

  const onDepositClick = () => {
    if (!PAYMENTS_ENABLED) {
      setShowDepositNotice(true);
      return;
    }
    // Week 5: wire Paystack / POST /api/wallet/deposit/ here
  };

  const firstName =
    userInfo?.first_name ||
    userInfo?.full_name?.split?.(" ")?.[0] ||
    userInfo?.username ||
    "Parent";

  const walletLabel = formatKes(dashWallet?.balance);

  const renderHub = () => (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="font-josefin text-sm font-semibold uppercase tracking-wide text-[#01B0F1]">
          Parent portal
        </p>
        <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
          Welcome, {firstName}
        </h1>
        <p className="mt-2 max-w-2xl font-josefin text-sm text-slate-600">
          One place for linked learners, family wallet, and this week’s
          attendance snapshot.
        </p>
        {profileLoading && (
          <p className="mt-2 font-josefin text-sm text-slate-400">
            Loading your family profile…
          </p>
        )}
      </div>

      {/* Wallet + quick stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border-l-4 border-[#015575] bg-white p-5 shadow-sm md:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-josefin text-xs text-gray-500">
                Family shared wallet
              </p>
              <h3 className="mt-1 font-lilita text-2xl text-[#015575]">
                {walletLabel}
              </h3>
            </div>
            <div className="rounded-lg bg-[#015575]/10 p-3 text-[#015575]">
              <FaWallet className="text-xl" />
            </div>
          </div>
          <button
            type="button"
            onClick={onDepositClick}
            className={`mt-4 w-full rounded-lg px-4 py-2.5 font-josefin text-sm font-semibold transition ${
              PAYMENTS_ENABLED
                ? "bg-[#015575] text-white hover:bg-[#01B0F1]"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {PAYMENTS_ENABLED ? "Deposit via M-Pesa" : "Deposit (opens Week 5)"}
          </button>
        </div>

        <div className="rounded-xl border-l-4 border-[#01B0F1] bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-lg bg-[#01B0F1]/10 p-3 text-[#01B0F1]">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="font-josefin text-xs text-gray-500">
                Linked learners
              </p>
              <h3 className="font-lilita text-2xl text-[#015575]">
                {learners.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-lg bg-emerald-500/10 p-3 text-emerald-600">
              <FaCalendarCheck className="text-xl" />
            </div>
            <div>
              <p className="font-josefin text-xs text-gray-500">
                Attendance this week
              </p>
              <h3 className="font-lilita text-2xl text-[#015575]">
                {learners.some((l) => l.attended_this_week != null)
                  ? learners.reduce(
                      (sum, l) => sum + (Number(l.attended_this_week) || 0),
                      0,
                    )
                  : "—"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Learners grid — student linkage */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-lilita text-xl text-[#015575]">Your learners</h2>
          <button
            type="button"
            onClick={() => setShowAddLearnerHint(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#015575] px-3 py-2 font-josefin text-xs font-semibold text-white hover:bg-[#01B0F1]"
          >
            <FaPlus className="text-[10px]" />
            Link a student
          </button>
        </div>

        {profileLoading ? (
          <p className="font-josefin text-sm text-slate-400">
            Loading learners…
          </p>
        ) : learners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] px-4 py-10 text-center">
            <FaChild className="mx-auto mb-3 text-3xl text-slate-300" />
            <p className="font-josefin text-sm text-slate-600">
              No linked learners yet. Complete parent onboarding Step 2 or link
              a student when the ward API is available.
            </p>
            <button
              type="button"
              onClick={() => setShowAddLearnerHint(true)}
              className="mt-4 rounded-lg bg-[#01B0F1]/15 px-4 py-2 font-josefin text-sm font-semibold text-[#015575]"
            >
              How linking works
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learners.map((learner) => (
              <div
                key={learner.id}
                className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#015575] font-lilita text-sm text-white">
                    {(learner.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-lilita text-lg text-[#015575]">
                      {learner.name}
                    </p>
                    <p className="font-josefin text-xs text-slate-500">
                      {[learner.curriculum, learner.grade]
                        .filter((x) => x && x !== "—")
                        .join(" · ") || "Profile pending"}
                    </p>
                    {learner.school && (
                      <p className="mt-0.5 truncate font-josefin text-xs text-slate-400">
                        {learner.school}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-josefin text-xs text-slate-500">
                    This week
                  </span>
                  <span className="font-josefin text-xs font-semibold text-[#015575]">
                    {learner.attended_this_week != null
                      ? `${learner.attended_this_week} session(s)`
                      : "No attendance data"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* This-week snapshot */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-lilita text-xl text-[#015575]">
          This week at a glance
        </h2>
        <p className="font-josefin text-sm text-slate-600">
          Attendance and session history will fill in as learners join live
          classes. Wallet top-ups and lesson payments unlock in{" "}
          <strong>Week 5</strong> of the campaign.
        </p>
      </div>

      {/* Account summary (read-only) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-lilita text-xl text-[#015575]">
          Your account
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-josefin text-xs text-slate-500">Email</dt>
            <dd className="font-josefin text-sm font-medium text-[#015575]">
              {userInfo?.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="font-josefin text-xs text-slate-500">Role</dt>
            <dd className="font-josefin text-sm font-medium text-[#015575]">
              Parent
            </dd>
          </div>
        </dl>
        <p className="mt-4 font-josefin text-xs text-slate-500">
          Curriculum or ward changes: contact support — profile fields collected
          at onboarding are not edited here.
        </p>
      </div>
    </div>
  );

  if (isLoading || !userInfo) {
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
              Parent <span className="text-[#81CFFF]">Dashboard</span>
            </h2>
            <p className="mt-1 font-josefin text-[11px] uppercase tracking-wider text-white/50">
              Family control hub
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            <button
              type="button"
              className="flex w-full items-center rounded-xl bg-[#01B0F1] px-4 py-3 text-left font-josefin text-sm text-white shadow-lg shadow-[#01B0F1]/30"
            >
              <span className="mr-3 flex h-6 w-6 items-center justify-center">
                <FaHome />
              </span>
              Home hub
            </button>
            <button
              type="button"
              onClick={onDepositClick}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm text-[#B4C8DC] transition hover:bg-white/10 hover:text-white"
            >
              <span className="mr-3 flex h-6 w-6 items-center justify-center">
                <FaWallet />
              </span>
              Family wallet
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm text-[#B4C8DC] transition hover:bg-white/10 hover:text-white"
            >
              <span className="mr-3 flex h-6 w-6 items-center justify-center">
                <FaUserCircle />
              </span>
              Account
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
          title="Parent hub"
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          onViewProfile={() => {}}
          onEditProfile={() => {}}
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
          {renderHub()}
        </main>
      </div>

      {/* Week 5 deposit notice */}
      {showDepositNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <FaExclamationTriangle />
              <h3 className="font-lilita text-lg text-[#015575]">
                M-Pesa deposits — Week 5
              </h3>
            </div>
            <p className="font-josefin text-sm text-slate-600">
              Family wallet top-ups and lesson payments are disabled until Week
              5 of the campaign. Your balance shows as {walletLabel} for
              planning only.
            </p>
            <button
              type="button"
              onClick={() => setShowDepositNotice(false)}
              className="mt-5 w-full rounded-lg bg-[#015575] py-2.5 font-josefin text-sm font-semibold text-white hover:bg-[#01B0F1]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showAddLearnerHint && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-lilita text-lg text-[#015575]">
              Link a student
            </h3>
            <p className="mt-2 font-josefin text-sm text-slate-600">
              Learners added during parent onboarding appear here. Extra links
              will use the parent–child API when backend enables it. Until then,
              use onboarding Step 2 or support.
            </p>
            <button
              type="button"
              onClick={() => setShowAddLearnerHint(false)}
              className="mt-5 w-full rounded-lg bg-[#015575] py-2.5 font-josefin text-sm font-semibold text-white hover:bg-[#01B0F1]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
