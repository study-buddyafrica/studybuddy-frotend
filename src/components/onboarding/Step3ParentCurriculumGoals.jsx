import React, { useState } from "react";
import {
  FaBook,
  FaGraduationCap,
  FaGlobe,
  FaCheckCircle,
  FaRegCircle,
  FaCheck,
  FaPlus,
  FaTimes,
  FaVideo,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaComments,
  FaStar,
  FaLightbulb,
  FaArrowLeft,
  FaArrowRight,
  FaUserFriends,
  FaAward,
  FaPhoneAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { onboardingService, onboardingPayloads, getErrorMessage } from "../../services/onboardingService";

/**
 * Step 3 - PARENT Academic Curriculum & Learning Goals
 * Figma Specification:
 * 1. Intro Banner with Parent Capsule & Child Info Pill
 * 2. Section 1: Select Educational Curriculum (CBC, 8-4-4, Cambridge, American/IB)
 * 3. Academic Grade Level & Target Focus Subjects (interactive multi-select + custom subject)
 * 4. Section 2: Primary Learning Support Goals (Exam prep, homework, remedial, STEM)
 * 5. Section 3: Tutoring & Session Preferences (Online, In-person, Hybrid + frequency + WhatsApp summary)
 * 6. Bottom Navigation (Back to Child Details, Save as Draft, Save & Continue to Wallet)
 */
const Step3ParentCurriculumGoals = ({
  registrationData = null,
  onNext = null,
  onBack = null,
}) => {
  // Retrieve primary learner info staged from Step 2
  const stagedWard = (() => {
    try {
      const stored = sessionStorage.getItem("parentWardData");
      return stored ? JSON.parse(stored)?.primaryWard : null;
    } catch {
      return null;
    }
  })();

  const learnerName = stagedWard?.fullName || "Amani Baraza Kimani";
  const learnerInitials = learnerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const schoolDisplay = stagedWard?.schoolName || "Makini School • Nairobi";

  // ---------------------------------------------------------------------------
  // State: Curriculum Selection
  // ---------------------------------------------------------------------------
  const [curriculum, setCurriculum] = useState(""); // "cbc" | "844" | "cambridge" | "ib"

  // Grade level
  const [gradeLevel, setGradeLevel] = useState("");

  // ---------------------------------------------------------------------------
  // State: Target Focus Subjects
  // ---------------------------------------------------------------------------
  const defaultSubjects = [
    "Mathematics",
    "Integrated Science",
    "English Language",
    "Coding & Robotics",
  ];
  const [selectedSubjects, setSelectedSubjects] = useState(defaultSubjects);

  const availableSubjects = [
    "Social Studies",
    "Kiswahili",
    "Creative Arts",
    "Agriculture & Nutrition",
    "Pre-Technical Studies",
    "French",
  ];

  // Custom subject input
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSubjectText, setCustomSubjectText] = useState("");

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleAddCustomSubject = (e) => {
    if (e) e.preventDefault();
    const clean = customSubjectText.trim();
    if (clean && !selectedSubjects.includes(clean)) {
      setSelectedSubjects([...selectedSubjects, clean]);
      setCustomSubjectText("");
      setShowCustomModal(false);
      setSuccessMessage(`Added custom subject: ${clean}`);
    }
  };

  // ---------------------------------------------------------------------------
  // State: Primary Learning Support Goals
  // ---------------------------------------------------------------------------
  const [goals, setGoals] = useState({
    examPrep: true,
    homeworkHelp: true,
    remedial: false,
    stemAcceleration: true,
  });

  const toggleGoal = (key) => {
    setGoals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------------------------------------------------------------------------
  // State: Delivery Mode & Frequency
  // ---------------------------------------------------------------------------
  const [deliveryMode, setDeliveryMode] = useState(""); // "online" | "in-person" | "hybrid"
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

  // Parent Account Data from Step 1 & Billing Preferences
  const parentAccount = (() => {
    try {
      const stored = sessionStorage.getItem("parentAccountData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [mpesaBillingPhone, setMpesaBillingPhone] = useState(
    parentAccount?.phone || registrationData?.phone_number || "+254712345678",
  );
  const [weeklySpendLimit, setWeeklySpendLimit] = useState("5000");

  // UI Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // Submission & Continuation
  // ---------------------------------------------------------------------------
  const handleProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setErrorMessage("");

    if (selectedSubjects.length === 0) {
      setErrorMessage("Please select at least one focus subject for tutoring.");
      return;
    }

    const phoneClean = mpesaBillingPhone.trim();
    const phonePattern = /^(?:\+254|0)[17]\d{8}$/;
    if (phoneClean && !phonePattern.test(phoneClean)) {
      setErrorMessage("Please enter a valid Safaricom M-Pesa phone number (e.g. +254712345678 or 0712345678).");
      return;
    }

    const payload = {
      curriculum,
      gradeLevel,
      focusSubjects: selectedSubjects,
      goals,
      deliveryMode,
      sessionsPerWeek,
      mpesaBillingPhone: phoneClean,
      weeklySpendLimit,
      updatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem("parentCurriculumData", JSON.stringify(payload));

    if (onboardingService.enabled) {
      setLoading(true);
      try {
        const apiPayload = onboardingPayloads.parentStep3({
          mpesa_billing_phone: phoneClean,
          weekly_spend_limit_kes: weeklySpendLimit,
          notification_preferences: {
            sms_attendance: true,
            weekly_report: true,
            whatsapp_summary: true,
          },
        });
        await onboardingService.step3(apiPayload);
      } catch (apiErr) {
        console.warn("Parent step3 API error:", apiErr);
        const msg = getErrorMessage(apiErr, "Failed to save parent billing & curriculum preferences.");
        setErrorMessage(msg);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    setSuccessMessage("Curriculum goals saved! Proceeding to Family Wallet & Launch...");

    setTimeout(() => {
      if (onNext) {
        onNext(payload);
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 pb-10">
      {/* Alert Messages */}
      {errorMessage && (
        <AuthAlert
          variant="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <AuthAlert
          variant="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & LEARNER CAPSULE CARD                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#015575]/10 text-[#015575] text-xs font-josefin font-bold w-fit">
            <FaUserFriends className="text-xs" />
            <span>PARENT &amp; GUARDIAN PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-lilita text-slate-900 tracking-tight leading-snug">
            Tailor Your Child's Learning Experience
          </h1>

          <p className="text-xs sm:text-sm font-josefin text-slate-600 leading-relaxed max-w-xl">
            Select your child's educational curriculum, grade level, and primary learning objectives to match them with verified tutors and personalized AI practice.
          </p>
        </div>

        {/* Learner Info Capsule (Right aligned) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 shadow-xs shrink-0 self-start md:self-center">
          <div className="w-10 h-10 rounded-xl bg-[#003D55] text-white font-lilita text-sm flex items-center justify-center shrink-0 shadow-xs">
            {learnerInitials}
          </div>
          <div className="min-w-0 pr-1">
            <p className="font-josefin font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 truncate">
              <span>{learnerName}</span>
              <FaCheckCircle className="text-[#01B0F1] text-xs shrink-0" />
            </p>
            <p className="font-josefin text-[11px] text-slate-500 truncate">
              {schoolDisplay}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#DEF0FF] text-[#00658C] text-[10px] font-josefin font-bold">
              Junior Secondary
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: SELECT EDUCATIONAL CURRICULUM                                */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#003D55] text-white text-xs font-lilita flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-lilita text-slate-900 tracking-wide">
                Select Educational Curriculum
              </h2>
              <p className="text-xs font-josefin text-slate-500">
                Aligned with Kenya KICD and international educational examination boards
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF0FF] text-[#00658C] text-xs font-josefin font-bold">
            <FaAward className="text-xs text-[#01B0F1]" />
            Accredited Syllabi
          </span>
        </div>

        {/* 4 Curriculum Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Kenyan CBC */}
          <div
            onClick={() => setCurriculum("cbc")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              curriculum === "cbc"
                ? "border-[#003D55] bg-white shadow-md ring-2 ring-[#003D55]/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                    curriculum === "cbc"
                      ? "bg-[#003D55] text-white"
                      : "bg-[#EAF5FF] text-[#00658C]"
                  }`}
                >
                  <FaBook />
                </div>
                {curriculum === "cbc" ? (
                  <FaCheckCircle className="text-[#003D55] text-base" />
                ) : (
                  <FaRegCircle className="text-slate-300 text-sm" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-josefin font-bold text-[#015575] uppercase tracking-wider block">
                  STANDARD KENYAN TRACK
                </span>
                <h3 className="font-lilita text-sm sm:text-base text-slate-900 mt-0.5">
                  Kenyan CBC
                </h3>
                <p className="text-[11px] font-josefin font-semibold text-slate-500">
                  Competency-Based Curriculum
                </p>
              </div>

              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Junior School &amp; Pre-technical pathways, continuous KPSEA assessment tracking, strand-by-strand competency mastery.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-josefin">
              <span
                className={`font-bold ${
                  curriculum === "cbc" ? "text-[#003D55]" : "text-slate-400"
                }`}
              >
                {curriculum === "cbc" ? "Active Selection" : "Select"}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Grades 1–9 ℹ</span>
            </div>
          </div>

          {/* 2. 8-4-4 National System */}
          <div
            onClick={() => setCurriculum("844")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              curriculum === "844"
                ? "border-[#003D55] bg-white shadow-md ring-2 ring-[#003D55]/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                    curriculum === "844"
                      ? "bg-[#003D55] text-white"
                      : "bg-[#EAF5FF] text-[#00658C]"
                  }`}
                >
                  <FaGraduationCap />
                </div>
                {curriculum === "844" ? (
                  <FaCheckCircle className="text-[#003D55] text-base" />
                ) : (
                  <FaRegCircle className="text-slate-300 text-sm" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-josefin font-bold text-slate-500 uppercase tracking-wider block">
                  NATIONAL EXAMINATION
                </span>
                <h3 className="font-lilita text-sm sm:text-base text-slate-900 mt-0.5">
                  8-4-4 National System
                </h3>
                <p className="text-[11px] font-josefin font-semibold text-slate-500">
                  KCPE &amp; KCSE Secondary
                </p>
              </div>

              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Traditional KCPE/KCSE preparation, intensive past paper drills, syllabus revision, and topical masterclasses.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-josefin">
              <span
                className={`font-bold ${
                  curriculum === "844" ? "text-[#003D55]" : "text-[#00658C]"
                }`}
              >
                {curriculum === "844" ? "Active Selection" : "Select"}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Form 1 - Form 4</span>
            </div>
          </div>

          {/* 3. Cambridge / IGCSE */}
          <div
            onClick={() => setCurriculum("cambridge")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              curriculum === "cambridge"
                ? "border-[#003D55] bg-white shadow-md ring-2 ring-[#003D55]/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                    curriculum === "cambridge"
                      ? "bg-[#003D55] text-white"
                      : "bg-[#EAF5FF] text-[#00658C]"
                  }`}
                >
                  <FaGlobe />
                </div>
                {curriculum === "cambridge" ? (
                  <FaCheckCircle className="text-[#003D55] text-base" />
                ) : (
                  <FaRegCircle className="text-slate-300 text-sm" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-josefin font-bold text-slate-500 uppercase tracking-wider block">
                  INTERNATIONAL BRITISH
                </span>
                <h3 className="font-lilita text-sm sm:text-base text-slate-900 mt-0.5">
                  Cambridge / IGCSE
                </h3>
                <p className="text-[11px] font-josefin font-semibold text-slate-500">
                  Checkpoint &amp; O/A-Levels
                </p>
              </div>

              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Checkpoint, O-Level &amp; A-Level curriculum with international past papers, marking schemes, and subject specialist tutors.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-josefin">
              <span
                className={`font-bold ${
                  curriculum === "cambridge" ? "text-[#003D55]" : "text-[#00658C]"
                }`}
              >
                {curriculum === "cambridge" ? "Active Selection" : "Select"}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Years 7–13</span>
            </div>
          </div>

          {/* 4. American / IB Diploma */}
          <div
            onClick={() => setCurriculum("ib")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              curriculum === "ib"
                ? "border-[#003D55] bg-white shadow-md ring-2 ring-[#003D55]/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                    curriculum === "ib"
                      ? "bg-[#003D55] text-white"
                      : "bg-[#EAF5FF] text-[#00658C]"
                  }`}
                >
                  <FaLayerGroup />
                </div>
                {curriculum === "ib" ? (
                  <FaCheckCircle className="text-[#003D55] text-base" />
                ) : (
                  <FaRegCircle className="text-slate-300 text-sm" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-josefin font-bold text-slate-500 uppercase tracking-wider block">
                  GLOBAL INQUIRY TRACK
                </span>
                <h3 className="font-lilita text-sm sm:text-base text-slate-900 mt-0.5">
                  American / IB Diploma
                </h3>
                <p className="text-[11px] font-josefin font-semibold text-slate-500">
                  PYP, MYP &amp; IB DP
                </p>
              </div>

              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Inquiry-based framework, internal assessments (IA), extended essay mentorship, and AP standardized test alignment.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-josefin">
              <span
                className={`font-bold ${
                  curriculum === "ib" ? "text-[#003D55]" : "text-[#00658C]"
                }`}
              >
                {curriculum === "ib" ? "Active Selection" : "Select"}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Kindergarten - DP2</span>
            </div>
          </div>
        </div>

        {/* Grade Level & Target Focus Subjects (Two-column container) */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Child's Academic Grade Level (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <label
              htmlFor="gradeSelect"
              className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider"
            >
              Child's Academic Grade Level
            </label>
            <div className="relative">
              <select
                id="gradeSelect"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-josefin font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575] cursor-pointer"
              >
                <option value="Junior Secondary School - Grade 7">
                  Junior Secondary School - Grade 7
                </option>
                <option value="Junior Secondary School - Grade 8">
                  Junior Secondary School - Grade 8
                </option>
                <option value="Junior Secondary School - Grade 9">
                  Junior Secondary School - Grade 9
                </option>
                <option value="Primary School - Grade 6 (KPSEA Candidate)">
                  Primary School - Grade 6 (KPSEA Candidate)
                </option>
                <option value="Primary School - Grade 5">Primary School - Grade 5</option>
                <option value="Primary School - Grade 4">Primary School - Grade 4</option>
                <option value="Senior School - Grade 10">Senior School - Grade 10</option>
              </select>
            </div>
            <p className="text-[11px] font-josefin text-slate-400 flex items-center gap-1">
              <span>📍</span>
              <span>Synced with registration record: {schoolDisplay}</span>
            </p>
          </div>

          {/* Right: Target Focus Subjects for Tutoring & AI Practice (8 cols) */}
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                  Target Focus Subjects for Tutoring &amp; AI Practice
                </label>
                <p className="text-[11px] font-josefin text-slate-500">
                  Choose the subjects where {learnerName.split(" ")[0] || "Amani"} requires structured tutoring and extra drills.
                </p>
              </div>

              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#DEF0FF] text-[#00658C] text-xs font-josefin font-bold shrink-0">
                {selectedSubjects.length} Subjects Selected
              </span>
            </div>

            {/* Subject Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Selected Subjects */}
              {selectedSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#003D55] text-white text-xs font-josefin font-semibold shadow-xs hover:bg-[#015575] transition-all cursor-pointer"
                >
                  <FaCheck className="text-[10px]" />
                  <span>{subject}</span>
                </button>
              ))}

              {/* Available Unselected Subjects */}
              {availableSubjects
                .filter((sub) => !selectedSubjects.includes(sub))
                .map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#01B0F1] hover:text-[#00658C] text-xs font-josefin font-semibold transition-all cursor-pointer"
                  >
                    <FaPlus className="text-[9px] text-slate-400" />
                    <span>{subject}</span>
                  </button>
                ))}
            </div>

            {/* Helper Guidance & Add Custom Subject Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs font-josefin">
              <p className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                <FaLightbulb className="text-amber-500 shrink-0 text-xs" />
                <span>Recommended: 3–5 core subjects for balanced weekly pacing without burnout.</span>
              </p>

              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="text-[#00658C] hover:text-[#013349] font-bold text-xs hover:underline cursor-pointer self-start sm:self-auto shrink-0"
              >
                Add Custom Subject +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: PRIMARY LEARNING SUPPORT GOALS                              */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#003D55] text-white text-xs font-lilita flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-lilita text-slate-900 tracking-wide">
                Primary Learning Support Goals
              </h2>
              <p className="text-xs font-josefin text-slate-500">
                Tell us what your learner needs support with most to calibrate tutor matching and AI drills
              </p>
            </div>
          </div>
        </div>

        {/* 2x2 Goal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Goal 1: Exam & Assessment Prep */}
          <div
            onClick={() => toggleGoal("examPrep")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              goals.examPrep
                ? "border-[#003D55] bg-[#EAF5FF]/30 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="pt-0.5">
              {goals.examPrep ? (
                <div className="w-5 h-5 rounded-md bg-[#003D55] text-white flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  Exam &amp; Assessment Preparation (KPSEA / KCSE)
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#DEF0FF] text-[#00658C] text-[10px] font-josefin font-bold shrink-0">
                  Top Priority
                </span>
              </div>
              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Targeted question drilling, timed mock tests, rubric calibration, and examiner-style revision notes for high-stakes tests.
              </p>
            </div>
          </div>

          {/* Goal 2: Daily Homework & Assignment Assistance */}
          <div
            onClick={() => toggleGoal("homeworkHelp")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              goals.homeworkHelp
                ? "border-[#003D55] bg-[#EAF5FF]/30 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="pt-0.5">
              {goals.homeworkHelp ? (
                <div className="w-5 h-5 rounded-md bg-[#003D55] text-white flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  Daily Homework &amp; Assignment Assistance
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#DEF0FF] text-[#00658C] text-[10px] font-josefin font-bold shrink-0">
                  Daily Routine
                </span>
              </div>
              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                After-school step-by-step guidance, concept breakdown without simply providing answers, fostering critical thinking.
              </p>
            </div>
          </div>

          {/* Goal 3: Remedial Support & Foundation Building */}
          <div
            onClick={() => toggleGoal("remedial")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              goals.remedial
                ? "border-[#003D55] bg-[#EAF5FF]/30 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="pt-0.5">
              {goals.remedial ? (
                <div className="w-5 h-5 rounded-md bg-[#003D55] text-white flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                Remedial Support &amp; Foundation Building
              </h3>
              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Diagnostic gap analysis to catch up on fundamental numeracy, reading literacy, or previous grade prerequisites.
              </p>
            </div>
          </div>

          {/* Goal 4: STEM, AI & Coding Acceleration */}
          <div
            onClick={() => toggleGoal("stemAcceleration")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              goals.stemAcceleration
                ? "border-[#003D55] bg-[#EAF5FF]/30 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="pt-0.5">
              {goals.stemAcceleration ? (
                <div className="w-5 h-5 rounded-md bg-[#003D55] text-white flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  STEM, AI &amp; Coding Acceleration
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#DEF0FF] text-[#00658C] text-[10px] font-josefin font-bold shrink-0">
                  Enrichment
                </span>
              </div>
              <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                Hands-on algorithmic thinking, Scratch/Python robotics programming, and science project mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: TUTORING & SESSION PREFERENCES                               */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#003D55] text-white text-xs font-lilita flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-lilita text-slate-900 tracking-wide">
                Tutoring &amp; Session Preferences
              </h2>
              <p className="text-xs font-josefin text-slate-500">
                Choose how and when your child learns best
              </p>
            </div>
          </div>
        </div>

        {/* Preferred Learning Delivery Mode */}
        <div className="space-y-2.5">
          <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
            Preferred Learning Delivery Mode
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Online 1-on-1 Interactive */}
            <div
              onClick={() => setDeliveryMode("online")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                deliveryMode === "online"
                  ? "border-[#003D55] bg-[#EAF5FF]/20 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      deliveryMode === "online"
                        ? "bg-[#003D55] text-white"
                        : "bg-[#EAF5FF] text-[#00658C]"
                    }`}
                  >
                    <FaVideo />
                  </div>
                  {deliveryMode === "online" ? (
                    <FaCheckCircle className="text-[#003D55] text-base" />
                  ) : (
                    <FaRegCircle className="text-slate-300 text-sm" />
                  )}
                </div>

                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  Online 1-on-1 Interactive
                </h3>
                <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                  Live WebRTC virtual classroom with collaborative whiteboards, screen sharing, and session replays.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-josefin">
                <span className="font-semibold text-slate-600">Zero commute</span>
                <span className="font-bold text-[#00658C]">Instant Tutor Match</span>
              </div>
            </div>

            {/* 2. Physical In-Person Home Visits */}
            <div
              onClick={() => setDeliveryMode("in-person")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                deliveryMode === "in-person"
                  ? "border-[#003D55] bg-[#EAF5FF]/20 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      deliveryMode === "in-person"
                        ? "bg-[#003D55] text-white"
                        : "bg-[#EAF5FF] text-[#00658C]"
                    }`}
                  >
                    <FaMapMarkerAlt />
                  </div>
                  {deliveryMode === "in-person" ? (
                    <FaCheckCircle className="text-[#003D55] text-base" />
                  ) : (
                    <FaRegCircle className="text-slate-300 text-sm" />
                  )}
                </div>

                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  Physical In-Person Home Visits
                </h3>
                <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                  Verified, background-checked elite tutors visiting your residence in Nairobi (Westlands, Kilimani, Karen &amp; environs).
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-josefin">
                <span className="font-semibold text-slate-600">Direct Supervision</span>
                <span className="font-bold text-[#00658C]">Police Clearance Cert</span>
              </div>
            </div>

            {/* 3. Hybrid Flexible Model */}
            <div
              onClick={() => setDeliveryMode("hybrid")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                deliveryMode === "hybrid"
                  ? "border-[#003D55] bg-[#EAF5FF]/20 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      deliveryMode === "hybrid"
                        ? "bg-[#003D55] text-white"
                        : "bg-[#EAF5FF] text-[#00658C]"
                    }`}
                  >
                    <FaLayerGroup />
                  </div>
                  {deliveryMode === "hybrid" ? (
                    <FaCheckCircle className="text-[#003D55] text-base" />
                  ) : (
                    <FaRegCircle className="text-slate-300 text-sm" />
                  )}
                </div>

                <h3 className="font-lilita text-xs sm:text-sm text-slate-900">
                  Hybrid Flexible Model
                </h3>
                <p className="text-xs font-josefin text-slate-600 leading-relaxed">
                  Online interactive sessions during school weekdays + weekend hands-on physical revision workshops.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-josefin">
                <span className="font-semibold text-slate-600">Balanced Routine</span>
                <span className="font-bold text-[#00658C]">Weekend Labs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Weekly Frequency & WhatsApp Summary Banner */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left: Target Weekly Frequency (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
              Target Weekly Tutoring Frequency
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSessionsPerWeek(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-josefin font-bold transition-all cursor-pointer ${
                    sessionsPerWeek === num
                      ? "bg-[#003D55] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {num} Session{num > 1 ? "s" : ""}
                </button>
              ))}
            </div>

            <p className="text-[11px] font-josefin text-slate-500 flex items-center gap-1.5 pt-1">
              <FaStar className="text-amber-500 text-xs shrink-0" />
              <span>
                <strong>Most Popular for Grade 7 CBC:</strong> 3 x 60-min sessions weekly covers Math, Science &amp; English.
              </span>
            </p>
          </div>

          {/* Right: Parent WhatsApp Summaries Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#EAF5FF]/80 border border-[#01B0F1]/20 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#00658C] text-white flex items-center justify-center text-sm shrink-0">
                <FaComments />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-josefin font-bold text-xs text-slate-900">
                    Parent WhatsApp Summaries
                  </p>
                  <span className="px-1.5 py-0.2 rounded bg-[#015575]/10 text-[#015575] text-[9px] font-bold">
                    INCLUDED
                  </span>
                </div>
                <p className="font-josefin text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Automated weekly tutor reports, KPSEA benchmark updates, and attendance alerts sent directly to +254 712 345 678.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BILLING & WALLET ALLOCATION PREFERENCES                                 */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center text-sm">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="font-lilita text-lg sm:text-xl text-slate-900 tracking-wide">
              4. M-Pesa Billing &amp; Weekly Budget
            </h2>
            <p className="font-josefin text-xs sm:text-sm text-slate-500">
              Set your M-Pesa payment phone and weekly spend limit for automated tutor and subscription settlements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block font-josefin text-xs font-semibold text-slate-700">
              M-Pesa Billing Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                <FaPhoneAlt />
              </span>
              <input
                type="text"
                value={mpesaBillingPhone}
                onChange={(e) => setMpesaBillingPhone(e.target.value)}
                placeholder="+254712345678"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-josefin text-slate-800 focus:outline-none focus:border-[#00658C]"
              />
            </div>
            <p className="font-josefin text-[10px] text-slate-400">
              Safaricom format: +254 7XX XXX XXX or 07XX XXX XXX
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-josefin text-xs font-semibold text-slate-700">
              Weekly Spend Limit (KES)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                KES
              </span>
              <input
                type="number"
                min="500"
                step="500"
                value={weeklySpendLimit}
                onChange={(e) => setWeeklySpendLimit(e.target.value)}
                placeholder="5000"
                className="w-full pl-20 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-josefin text-slate-800 focus:outline-none focus:border-[#00658C]"
              />
            </div>
            <p className="font-josefin text-[10px] text-slate-400">
              Maximum weekly spend threshold for tutoring sessions
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ACTION NAVIGATION BUTTONS                                              */}
      {/* ========================================================================= */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-josefin font-semibold transition-all cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Child Details</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSuccessMessage("Draft saved to browser storage.")}
            className="text-xs font-josefin font-bold text-slate-600 hover:text-slate-900 px-3 py-2 cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleProceed}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-[#003D55] hover:bg-[#015575] text-white font-lilita text-sm shadow-md hover:shadow-lg transition-all cursor-pointer ${
              loading ? "opacity-75 cursor-wait" : ""
            }`}
          >
            <span>{loading ? "Saving Goals & Budget..." : "Save & Continue to Wallet"}</span>
            <FaArrowRight className="text-xs text-[#01B0F1]" />
          </button>
        </div>
      </div>

      {/* Custom Subject Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-lilita text-slate-900 text-base">
                Add Custom Subject
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-xs font-josefin text-slate-500">
              Enter any elective, language, or specialized course you want tailored for your child.
            </p>
            <form onSubmit={handleAddCustomSubject} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={customSubjectText}
                onChange={(e) => setCustomSubjectText(e.target.value)}
                placeholder="e.g. Mandarin Chinese, Chess, Music"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-josefin text-slate-800 focus:outline-none focus:border-[#015575]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-josefin font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customSubjectText.trim()}
                  className="px-5 py-2 rounded-xl bg-[#003D55] text-white text-xs font-lilita disabled:opacity-50"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3ParentCurriculumGoals;
