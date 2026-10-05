import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRocket,
  FaArrowLeft,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaArrowRight,
  FaClock,
  FaFileDownload,
  FaMobileAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { authStorage } from "../../services/authStorage";
import { onboardingService, getErrorMessage } from "../../services/onboardingService";

/**
 * Step 4 - TEACHER Dashboard Launch & Onboarding Complete
 * Matches Figma frame 39:2062:
 * - 100% Onboarding Completion progress indicator
 * - Amber-gold status banner: KYC Application Under Review (Est. 24-48 Hours)
 * - Hero welcome card personalized to teacher name
 * - 3 Teacher Studio Sandbox Access cards (Calendar, Whiteboard, Curriculum Builder)
 * - Payout & Verification Callout (M-PESA disbursement number)
 * - Sticky navigation action footer with canonical #003D55 navy button styling
 */
const Step4TeacherDashboardLaunch = ({
  registrationData = null,
  onBack = null,
}) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Retrieve saved KYC data (Step 2)
  const kycData = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("teacherKycData");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Retrieve saved Qualifications data (Step 3)
  const qualificationsData = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("teacherQualificationsData");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Resolve teacher name
  const teacherFullName =
    kycData?.fullName ||
    (registrationData?.first_name
      ? `${registrationData.first_name} ${registrationData.last_name || ""}`.trim()
      : "") ||
    "Educator";

  // Resolve M-PESA phone number
  const mpesaPhone =
    registrationData?.phone ||
    registrationData?.phone_number ||
    "+254 712 345 678";

  // Handle Launch CTA
  const handleLaunchDashboard = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setErrorMessage("");

    let targetUrl = "/teacher-dashboard";

    if (onboardingService.enabled) {
      try {
        const res = await onboardingService.complete();
        const resData = res?.data || {};
        if (resData.tokens?.access) {
          authStorage.setTokens(resData.tokens.access, resData.tokens.refresh);
        }
        if (resData.data?.user) {
          authStorage.setUserInfo(resData.data.user);
        }
        if (resData.data?.dashboard_url) {
          targetUrl = resData.data.dashboard_url;
        }
      } catch (err) {
        console.warn("Teacher complete onboarding API warning:", err);
        const msg = getErrorMessage(err, "Failed to complete onboarding on server.");
        if (err.response?.status !== 400) {
          setErrorMessage(msg);
          setIsLaunching(false);
          return;
        }
      }
    }

    try {
      localStorage.setItem(
        "teacherOnboardingComplete",
        JSON.stringify({
          completedAt: new Date().toISOString(),
          status: "under_review",
          kycData,
          qualificationsData,
        }),
      );
      sessionStorage.removeItem("pendingRegistration");
    } catch (err) {
      console.warn("Could not save teacher onboarding completion:", err);
    }

    // Smooth transition to Teacher Dashboard
    setTimeout(() => {
      navigate(targetUrl);
    }, 400);
  };

  // Download Application Summary stub
  const handleDownloadSummary = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between space-y-6 sm:space-y-8 animate-fadeIn">
      {errorMessage && (
        <AuthAlert
          variant="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      )}

      {/* Top Header Block */}
      <div className="space-y-6">
        {/* Progress & Status Banner Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-josefin">
            <span className="text-xs font-bold text-[#003D55] uppercase tracking-wider">
              Onboarding Completion
            </span>
            <span className="text-xs font-bold text-[#00658C]">
              100% Completed
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#D2ECFF] overflow-hidden">
            <div className="h-full rounded-full bg-[#00658C] transition-all duration-700 w-full" />
          </div>

          {/* Amber-Gold Review Status Banner */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
                <FaClock className="w-4 h-4" />
              </div>
              <div className="font-josefin">
                <p className="text-xs font-bold text-[#78350F] uppercase tracking-wider">
                  KYC Application Under Review
                </p>
                <p className="text-xs text-amber-900/80 hidden sm:block">
                  Your credentials and TSC documents are undergoing regulatory clearance.
                </p>
              </div>
            </div>

            <span className="text-xs font-josefin font-semibold text-[#92400E] bg-amber-100 px-3 py-1 rounded-full whitespace-nowrap">
              Est. 24–48 Hours
            </span>
          </div>
        </div>

        {/* Hero Celebration Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#01B0F1]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#003D55] flex items-center justify-center text-white shadow-md">
                <FaUserGraduate className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#2ABCFE] flex items-center justify-center text-white shadow-xs">
                <span className="text-xs font-bold">✓</span>
              </div>
            </div>

            <div className="space-y-2 font-josefin">
              <h1 className="text-2xl sm:text-3xl font-lilita text-[#001E2D] tracking-tight leading-snug">
                Application Submitted! Welcome to the Educator Network
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Mwalimu <strong className="text-slate-900 font-semibold">{teacherFullName}</strong>, your educator credentials and TSC documents have been securely received. While our compliance team verifies your certificates, your Teacher Studio Sandbox is unlocked!
              </p>
            </div>
          </div>
        </div>

        {/* 3 Sandbox Feature Cards */}
        <div className="space-y-3 font-josefin">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Teacher Studio Sandbox Access
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Calendar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#01B0F1] transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] flex items-center justify-center text-[#00658C]">
                  <FaCalendarAlt className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001E2D]">
                  Classroom Calendar &amp; Availability
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Configure recurring weekly slots for 1-on-1 tutoring and group revision.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003D55]">
                <span>Configure Slots</span>
                <FaArrowRight className="w-2.5 h-2.5 text-[#00658C]" />
              </div>
            </div>

            {/* Card 2: WebRTC Whiteboard */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#01B0F1] transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] flex items-center justify-center text-[#00658C]">
                  <FaChalkboardTeacher className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001E2D]">
                  Interactive WebRTC Whiteboard Test
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Preview the live virtual classroom with digital whiteboard, equations, and screen sharing.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003D55]">
                <span>Launch Sandbox Test</span>
                <FaArrowRight className="w-2.5 h-2.5 text-[#00658C]" />
              </div>
            </div>

            {/* Card 3: Curriculum Builder */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#01B0F1] transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] flex items-center justify-center text-[#00658C]">
                  <FaLayerGroup className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#001E2D]">
                  Course Curriculum Builder
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scaffold your CBC Grade 7-9 or KCSE revision modules ahead of launch.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003D55]">
                <span>Build Curriculum</span>
                <FaArrowRight className="w-2.5 h-2.5 text-[#00658C]" />
              </div>
            </div>
          </div>
        </div>

        {/* Payout & Verification Destination Callout */}
        <div className="bg-[#EAF5FF] border border-[#01B0F1]/30 rounded-xl p-5 flex items-start gap-4 font-josefin">
          <div className="w-10 h-10 rounded-xl bg-[#2ABCFE]/20 flex items-center justify-center text-[#00658C] shrink-0 mt-0.5">
            <FaMobileAlt className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-[#001E2D] uppercase tracking-wider">
              Payout &amp; Verification Destination
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Your profile will be published on the Student Marketplace once KYC approval is complete. M-PESA weekly payouts will be disbursed to <strong className="text-slate-900 font-semibold">{mpesaPhone}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Navigation Action Footer                                                  */}
      {/* ========================================================================= */}
      <div className="sticky bottom-0 bg-[#F8FAFC]/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-200/90 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 font-josefin mt-auto">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-3 sm:order-1"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back to Step 3</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleDownloadSummary}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center justify-center gap-2"
          >
            <FaFileDownload className="w-3.5 h-3.5 text-[#00658C]" />
            <span>Download Summary (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchDashboard}
            disabled={isLaunching}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-lilita text-base tracking-wide text-white bg-[#003D55] hover:bg-[#015575] hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLaunching ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Launching Studio...
              </span>
            ) : (
              <>
                <span>Launch Teacher Studio Dashboard</span>
                <FaRocket className="w-3.5 h-3.5 text-[#2ABCFE]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4TeacherDashboardLaunch;
