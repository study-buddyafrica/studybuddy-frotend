import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRocket,
  FaArrowLeft,
  // FaShieldAlt, // 'FaShieldAlt' is declared but its value is never read.
  FaGraduationCap,
  FaBook,
  FaChartLine,
  // FaWifi, // 'FaWifi' is declared but its value is never read.
  FaCheckCircle,
} from "react-icons/fa";

/**
 * Step4DashboardLaunch: Final step of student onboarding.
 * References Figma Frame 7:94 (Step 4 - Dashboard Launch & Onboarding Complete).
 * Displays synthesized profile, regional cohort community banner, and launches student dashboard.
 */
const Step4DashboardLaunch = ({ onBack = null }) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);

  // Retrieve saved onboarding data from earlier steps
  // const step1Data = (() => {
  //   try {
  //     const stored = sessionStorage.getItem("studentOnboardingStep1");
  //     return stored ? JSON.parse(stored) : null;
  //   } catch (e) {
  //     return null;
  //   }
  // })(); // 'step1Data' is declared but its value is never read.

  const step2Data = (() => {
    try {
      const stored = sessionStorage.getItem("studentOnboardingStep2");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })();

  const step3Data = (() => {
    try {
      const stored = sessionStorage.getItem("studentOnboardingStep3");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })();

  // Resolve curriculum, grade, and subject counts
  const curriculum = step2Data?.curriculum || "cbc";
  const gradeLevel = step2Data?.gradeLevel || "Junior Secondary - Grade 8 (JSS 2)";
  const schoolName = step2Data?.schoolName || "Nairobi Academy";
  const subjectCount = step3Data?.selectedSubjectIds?.length || 4;
  const studyPace = step3Data?.studyPace || "balanced";
  const targetScore = step3Data?.targetScore || "A";

  // Syllabus accreditation badge
  const accreditation = useMemo(() => {
    if (curriculum === "844") {
      return {
        label: "KNEC 2024 Approved",
        system: "8-4-4 KCSE Candidate Track",
      };
    }
    if (curriculum === "cambridge") {
      return {
        label: "Cambridge Assessment Aligned",
        system: "Cambridge IGCSE Curriculum",
      };
    }
    return {
      label: "KICD 2024 Approved",
      system: "CBC Junior Secondary Curriculum",
    };
  }, [curriculum]);

  // Handle Launch CTA
  const handleLaunchDashboard = () => {
    setIsLaunching(true);

    // Save final completion flag in localStorage
    try {
      localStorage.setItem(
        "onboardingComplete",
        JSON.stringify({
          completedAt: new Date().toISOString(),
          curriculum,
          gradeLevel,
          subjectCount,
          studyPace,
          targetScore,
        }),
      );
      // Clean up temporary staged registration
      sessionStorage.removeItem("pendingRegistration");
    } catch (err) {
      console.warn("Could not save onboarding completion:", err);
    }

    // Smooth transition into Student Dashboard
    setTimeout(() => {
      navigate("/student-dashboard");
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-4">
      {/* ========================================================================= */}
      {/* Hero Announcement Block                                                   */}
      {/* ========================================================================= */}
      <div className="bg-[#EAF5FF] rounded-3xl p-6 sm:p-10 border border-[#01B0F1]/20 shadow-sm relative overflow-hidden">
        {/* Ambient Cyan Glows */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#01B0F1]/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full bg-[#C6E7FF]/40 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Text Block */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#00658C] text-xs font-lilita tracking-wide shadow-sm">
              <FaRocket className="w-3.5 h-3.5 text-[#01B0F1]" />
              <span>AI Tutor Activation & Launch</span>
            </div>

            <h1 className="font-lilita text-3xl sm:text-4xl text-slate-900 tracking-wide leading-tight">
              Your personalized <br className="hidden sm:inline" />
              StudyBuddy is ready!
            </h1>

            <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed">
              We have synthesized your <strong className="text-slate-800 font-semibold">{gradeLevel}</strong> syllabus,
              selected <strong className="text-slate-800 font-semibold">{subjectCount} active subjects</strong>,
              and calibrated your AI Tutor pacing for top exam performance.
            </p>
          </div>

          {/* Quick Launch Readiness Gauge */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 shrink-0 self-start lg:self-auto">
            {/* 100% SVG Circle */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2ABCFE]"
                  strokeDasharray="100, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-lilita text-sm text-[#003D55]">
                100%
              </span>
            </div>

            <div className="font-josefin">
              <p className="text-[10px] font-lilita text-slate-400 tracking-wider uppercase">
                CALIBRATION
              </p>
              <p className="font-lilita text-sm text-slate-900 tracking-wide mt-0.5">
                Curriculum Synced
              </p>
              <p className="text-[11px] font-semibold text-[#00658C] mt-0.5">
                {accreditation.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Synthesized Configuration Summary Cards                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Curriculum & Grade */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center shrink-0">
            <FaGraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-josefin text-xs text-slate-500 font-medium">Curriculum Track</p>
            <p className="font-lilita text-sm text-slate-900 tracking-wide truncate mt-0.5">
              {gradeLevel}
            </p>
            <p className="font-josefin text-[11px] text-[#00658C] truncate mt-0.5">
              {schoolName}
            </p>
          </div>
        </div>

        {/* Card 2: Enrolled Subjects */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#01B0F1] flex items-center justify-center shrink-0">
            <FaBook className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-josefin text-xs text-slate-500 font-medium">Active Subjects</p>
            <p className="font-lilita text-sm text-slate-900 tracking-wide mt-0.5">
              {subjectCount} Core & Electives
            </p>
            <p className="font-josefin text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <FaCheckCircle className="w-3 h-3" />
              Syllabus Ready
            </p>
          </div>
        </div>

        {/* Card 3: Study Target & Pacing */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center shrink-0">
            <FaChartLine className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-josefin text-xs text-slate-500 font-medium">AI Pacing Target</p>
            <p className="font-lilita text-sm text-slate-900 tracking-wide capitalize mt-0.5">
              {studyPace} Pace
            </p>
            <p className="font-josefin text-[11px] text-slate-600 mt-0.5">
              {studyPace === "intensive"
                ? "18+ hrs / week"
                : studyPace === "light"
                  ? "5–7 hrs / week"
                  : "10–14 hrs / week"}
            </p>
          </div>
        </div>

        {/* Card 4: Term Goal */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFDCC0] text-[#8C4300] flex items-center justify-center shrink-0">
            <span className="font-lilita text-base">🎯</span>
          </div>
          <div className="min-w-0">
            <p className="font-josefin text-xs text-slate-500 font-medium">Target Exam Grade</p>
            <p className="font-lilita text-sm text-slate-900 tracking-wide mt-0.5">
              {targetScore === "A"
                ? "Grade A (80%+)"
                : targetScore === "B"
                  ? "Grade B (70–79%)"
                  : "Pass / Foundations"}
            </p>
            <p className="font-josefin text-[11px] text-[#00658C] mt-0.5">
              Calibrated Hints
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Student Community & Regional Cohort Banner                                */}
      {/* ========================================================================= */}
      <div className="bg-[#003D55] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient background accent */}
        <div
          className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-[#01B0F1]/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="space-y-2 max-w-xl relative z-10">
          <p className="font-lilita text-xs text-[#81CFFF] tracking-wider uppercase">
            REGIONAL COHORT CONNECTED
          </p>

          <h2 className="font-lilita text-xl sm:text-2xl text-white tracking-wide leading-snug">
            You are joining 4,280 students in Nairobi studying {gradeLevel} this term.
          </h2>

          <p className="font-josefin text-xs sm:text-sm text-[#91CEF3] leading-relaxed">
            Collaborate on tricky problems, share revision notes, and compare weekly study streaks in a
            moderated, safe educational network.
          </p>
        </div>

        {/* Community Avatars & Active Status */}
        <div className="flex items-center gap-3.5 shrink-0 relative z-10 self-start md:self-auto font-josefin">
          <div className="flex -space-x-3 overflow-hidden">
            <img
              src="/images/std1.jpeg"
              alt="Cohort student"
              className="inline-block h-10 w-10 rounded-full ring-2 ring-[#003D55] object-cover shadow-sm"
            />
            <img
              src="/images/std2.jpeg"
              alt="Cohort student"
              className="inline-block h-10 w-10 rounded-full ring-2 ring-[#003D55] object-cover shadow-sm"
            />
            <img
              src="/images/std3.jpeg"
              alt="Cohort student"
              className="inline-block h-10 w-10 rounded-full ring-2 ring-[#003D55] object-cover shadow-sm"
            />
          </div>

          <div>
            <p className="font-lilita text-xs text-white tracking-wide">
              Active Now
            </p>
            <p className="text-[11px] text-[#81CFFF]">
              928 online today
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Footer Actions & Launch CTAs                                              */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 font-josefin">
        <button
          type="button"
          onClick={onBack}
          disabled={isLaunching}
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-2 sm:order-1 disabled:opacity-50"
        >
          <FaArrowLeft className="w-3 h-3" />
          Back: Subjects & Goals
        </button>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleLaunchDashboard}
            disabled={isLaunching}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-lilita text-base sm:text-lg tracking-wide text-white bg-[#003D55] hover:bg-[#015575] hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75"
          >
            {isLaunching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Launching Workspace...</span>
              </>
            ) : (
              <>
                <span>Launch My StudyBuddy Dashboard</span>
                <FaRocket className="w-4 h-4 text-[#2ABCFE]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Trust Note & Compliance Statement                                         */}
      {/* ========================================================================= */}
      {/* <div className="space-y-1.5 pt-2 text-center font-josefin text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5">
            <FaShieldAlt className="w-3.5 h-3.5 text-emerald-600" />
            Encrypted & COPPA / Kenya Data Protection Act Compliant
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <FaWifi className="w-3.5 h-3.5 text-[#00658C]" />
            Free offline revision sync available in app
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          StudyBuddy Africa is certified by Regional EdTech Standards and tuned specifically for {accreditation.system}.
        </p>
      </div> */}
    </div>
  );
};

export default Step4DashboardLaunch;
