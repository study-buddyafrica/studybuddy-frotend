import React, { useState } from "react";
import {
  FaCheck,
  FaGraduationCap,
  FaBook,
  FaGlobe,
  FaSchool,
  FaUsers,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";

/**
 * Step2AcademicProfile: Academic Curriculum & Level configuration.
 * References Figma Frame 7:30 (Step 2 - Academic Curriculum & Level).
 * Styled with platform brand fonts (Lilita & Josefin) and minimal layout.
 */
const Step2AcademicProfile = ({
  onNext = null,
  onBack = null,
  initialData = null,
}) => {
  // Retrieve saved Step 2 data if previously entered
  const savedData = (() => {
    try {
      const stored = sessionStorage.getItem("studentOnboardingStep2");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })();

  // Curriculum selection: "cbc" | "844" | "cambridge"
  const [curriculum, setCurriculum] = useState(
    initialData?.curriculum || savedData?.curriculum || "cbc",
  );

  // Sub-tier for CBC: "primary" | "junior" | "senior"
  const [cbcTier, setCbcTier] = useState(
    initialData?.cbcTier || savedData?.cbcTier || "junior",
  );

  // Grade / Class level
  const [gradeLevel, setGradeLevel] = useState(
    initialData?.gradeLevel ||
      savedData?.gradeLevel ||
      "Junior Secondary - Grade 8 (JSS 2)",
  );

  // Target National Exam Year
  const [targetExamYear, setTargetExamYear] = useState(
    initialData?.targetExamYear || savedData?.targetExamYear || "2025",
  );

  // School name (optional)
  const [schoolName, setSchoolName] = useState(
    initialData?.schoolName || savedData?.schoolName || "Nairobi Academy – Karen Campus",
  );

  // Study Group Auto-Enrollment toggle
  const [autoEnrollGroup, setAutoEnrollGroup] = useState(
    initialData?.autoEnrollGroup !== undefined
      ? initialData.autoEnrollGroup
      : savedData?.autoEnrollGroup !== undefined
        ? savedData.autoEnrollGroup
        : true,
  );

  // Dynamic Grade Options based on selected Curriculum & Tier
  const getGradeOptions = () => {
    if (curriculum === "cbc") {
      if (cbcTier === "primary") {
        return [
          "CBC Grade 4",
          "CBC Grade 5",
          "CBC Grade 6 (KPSEA Candidate)",
        ];
      }
      if (cbcTier === "senior") {
        return [
          "Senior School - Grade 10",
          "Senior School - Grade 11",
          "Senior School - Grade 12 (National Assessment)",
        ];
      }
      // Junior Secondary (Default)
      return [
        "Junior Secondary - Grade 7 (JSS 1)",
        "Junior Secondary - Grade 8 (JSS 2)",
        "Junior Secondary - Grade 9 (KJSEA Candidate)",
      ];
    }

    if (curriculum === "844") {
      return [
        "Class 7 (Primary)",
        "Class 8 (KCPE Revision)",
        "Secondary - Form 1",
        "Secondary - Form 2",
        "Secondary - Form 3",
        "Secondary - Form 4 (KCSE Candidate)",
      ];
    }

    // Cambridge / International
    return [
      "Year 7 (Key Stage 3)",
      "Year 8 (Key Stage 3)",
      "Year 9 (Checkpoint)",
      "Year 10 (IGCSE Foundation)",
      "Year 11 (IGCSE Candidate)",
      "Year 12 (AS-Level)",
      "Year 13 (A-Level Candidate)",
    ];
  };

  const handleCurriculumSelect = (selectedKey) => {
    setCurriculum(selectedKey);
    if (selectedKey === "cbc") {
      setGradeLevel("Junior Secondary - Grade 8 (JSS 2)");
    } else if (selectedKey === "844") {
      setGradeLevel("Secondary - Form 4 (KCSE Candidate)");
    } else {
      setGradeLevel("Year 11 (IGCSE Candidate)");
    }
  };

  const handleCbcTierSelect = (tierKey) => {
    setCbcTier(tierKey);
    if (tierKey === "primary") {
      setGradeLevel("CBC Grade 6 (KPSEA Candidate)");
    } else if (tierKey === "senior") {
      setGradeLevel("Senior School - Grade 10");
    } else {
      setGradeLevel("Junior Secondary - Grade 8 (JSS 2)");
    }
  };

  const handleProceed = (e) => {
    if (e) e.preventDefault();

    const step2Payload = {
      curriculum,
      cbcTier: curriculum === "cbc" ? cbcTier : null,
      gradeLevel,
      targetExamYear,
      schoolName: schoolName.trim(),
      autoEnrollGroup,
    };

    sessionStorage.setItem("studentOnboardingStep2", JSON.stringify(step2Payload));

    if (onNext) {
      onNext(step2Payload);
    }
  };

  const popularSchools = [
    "Alliance High",
    "Kenya High",
    "Moi Girls Eldoret",
    "Mang'u High",
    "Nairobi School",
  ];

  return (
    <div className="space-y-8 animate-fadeIn" data-node-id="7:30">
      {/* ========================================================================= */}
      {/* Top Heading Block                                                         */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-xs uppercase tracking-wider shadow-sm">
          <FaGraduationCap className="w-3.5 h-3.5 text-[#00658C]" />
          <span>Academic Personalization Engine</span>
        </div>

        {/* Heading 1 */}
        <h1 className="text-3xl sm:text-4xl font-lilita text-[#001E2D] tracking-tight">
          Tell us about your academic curriculum
        </h1>

        {/* Subtitle */}
        <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          Select your active curriculum so StudyBuddy Africa can customize notes, past revision papers, and AI quizzes according to your national syllabus.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Section 1: Choose Your Syllabus (3 Selectable Cards)                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-josefin font-bold text-xs text-slate-700 tracking-wider uppercase">
            1. Choose Your National or International Syllabus
          </label>
          <span className="font-josefin text-xs text-[#00658C]">
            You can modify this later in profile settings
          </span>
        </div>

        {/* 3 Curriculum Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Kenyan CBC */}
          <div
            onClick={() => handleCurriculumSelect("cbc")}
            className={`cursor-pointer rounded-2xl p-5 transition-all flex flex-col justify-between relative ${
              curriculum === "cbc"
                ? "bg-white border-2 border-[#01B0F1] shadow-md ring-4 ring-[#01B0F1]/15"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center">
                  <FaGraduationCap className="w-5 h-5" />
                </div>
                {curriculum === "cbc" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#01B0F1] text-white text-[11px] font-bold font-josefin">
                    <FaCheck className="w-2.5 h-2.5" />
                    Selected
                  </span>
                )}
              </div>

              <h3 className="font-lilita text-slate-900 text-lg tracking-wide">
                Kenyan CBC
              </h3>
              <p className="font-josefin text-xs text-slate-500 mt-1 leading-relaxed">
                Competency Based Curriculum with strand-by-strand assessments, projects & formative grading.
              </p>
            </div>

            {/* Sub-tier Pills (Only for CBC) */}
            <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
              <span className="font-josefin font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
                Select Tier:
              </span>
              <div className="flex flex-col gap-1.5 font-josefin">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCbcTierSelect("primary");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    curriculum === "cbc" && cbcTier === "primary"
                      ? "bg-[#003D55] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Primary (Grades 1–6)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCbcTierSelect("junior");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    curriculum === "cbc" && cbcTier === "junior"
                      ? "bg-[#003D55] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Junior Secondary (7–9)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCbcTierSelect("senior");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    curriculum === "cbc" && cbcTier === "senior"
                      ? "bg-[#003D55] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Senior School (10–12)
                </button>
              </div>
            </div>
          </div>

          {/* Card B: 8-4-4 System */}
          <div
            onClick={() => handleCurriculumSelect("844")}
            className={`cursor-pointer rounded-2xl p-5 transition-all flex flex-col justify-between relative ${
              curriculum === "844"
                ? "bg-white border-2 border-[#01B0F1] shadow-md ring-4 ring-[#01B0F1]/15"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <FaBook className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold font-josefin">
                  National Exam Focus
                </span>
              </div>

              <h3 className="font-lilita text-slate-900 text-lg tracking-wide">
                8–4–4 System
              </h3>
              <p className="font-josefin text-xs text-slate-500 mt-1 leading-relaxed">
                KCSE syllabus, KNEC past papers, marking schemes, and topic-by-topic breakdowns for Form 1 through Form 4.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-josefin font-semibold text-slate-500">
              <span>Form 1 – Form 4</span>
              <FaArrowRight className="w-3 h-3 text-[#01B0F1]" />
            </div>
          </div>

          {/* Card C: Cambridge & IGCSE */}
          <div
            onClick={() => handleCurriculumSelect("cambridge")}
            className={`cursor-pointer rounded-2xl p-5 transition-all flex flex-col justify-between relative ${
              curriculum === "cambridge"
                ? "bg-white border-2 border-[#01B0F1] shadow-md ring-4 ring-[#01B0F1]/15"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center">
                  <FaGlobe className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#DEF0FF] text-[#00658C] text-[10px] font-bold font-josefin">
                  International
                </span>
              </div>

              <h3 className="font-lilita text-slate-900 text-lg tracking-wide">
                Cambridge & IGCSE
              </h3>
              <p className="font-josefin text-xs text-slate-500 mt-1 leading-relaxed">
                Edexcel & Cambridge International curriculum, Checkpoint, O-Level & A-Level revision modules.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-josefin font-semibold text-slate-500">
              <span>Years 7 – 13</span>
              <FaArrowRight className="w-3 h-3 text-[#01B0F1]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Section 2: Class, Institution & Target Year                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <h2 className="font-lilita text-xl sm:text-2xl text-[#001E2D] tracking-wide">
          2. Class, Institution & Target Year
        </h2>

        {/* Row: Grade Level & Target National Exam Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Current Class / Grade Level */}
          <div className="space-y-2">
            <label className="font-josefin font-bold text-xs text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              <span>Current Class / Grade Level</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl font-josefin text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:bg-white appearance-none cursor-pointer"
              >
                {getGradeOptions().map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <FaChevronDown className="w-3 h-3" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-josefin">
              Coursework and mock assessments will match this specific grade standard.
            </p>
          </div>

          {/* Target National Exam Year */}
          <div className="space-y-2">
            <label className="font-josefin font-bold text-xs text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              <FaCalendarAlt className="w-3 h-3 text-[#00658C]" />
              <span>Target National Exam Year</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { year: "2024", label: "Immediate" },
                { year: "2025", label: "Selected" },
                { year: "2026+", label: "Future" },
              ].map((item) => {
                const isSelected = targetExamYear === item.year;
                return (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => setTargetExamYear(item.year)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all font-josefin ${
                      isSelected
                        ? "bg-[#DEF0FF] border-[#01B0F1] shadow-sm ring-2 ring-[#01B0F1]/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`font-lilita text-base block ${
                        isSelected ? "text-[#00658C]" : "text-slate-700"
                      }`}
                    >
                      {item.year}
                    </span>
                    <span
                      className={`text-[10px] font-semibold block uppercase ${
                        isSelected ? "text-[#00658C]" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "Selected" : item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-josefin">
              SBA creates a custom countdown pacing calendar for your exam timetable.
            </p>
          </div>
        </div>

        {/* School or Institution Name */}
        <div className="space-y-2 pt-2">
          <label className="font-josefin font-bold text-xs text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
            <FaSchool className="w-3.5 h-3.5 text-[#00658C]" />
            <span>School or Institution Name (Optional)</span>
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="e.g. Alliance High School, Nairobi"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-josefin text-sm text-slate-900 focus:outline-none focus:border-[#01B0F1] focus:bg-white"
          />

          {/* Popular Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-josefin text-xs">
            <span className="text-slate-400">Popular suggestions:</span>
            {popularSchools.map((school) => (
              <button
                key={school}
                type="button"
                onClick={() => setSchoolName(school)}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-[#DEF0FF] hover:text-[#00658C] text-slate-600 transition-colors text-[11px]"
              >
                {school}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Study Group Auto-Enrollment Card */}
        <div className="bg-[#EAF5FF] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-[#01B0F1]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00658C]/10 text-[#00658C] flex items-center justify-center shrink-0">
              <FaUsers className="w-5 h-5" />
            </div>
            <div>
              <p className="font-lilita text-slate-900 text-sm sm:text-base tracking-wide">
                Curriculum Study Group Auto-Enrollment
              </p>
              <p className="font-josefin text-xs text-slate-600 mt-0.5">
                Over 1,420 Grade 8 CBC students are currently active in discussion channels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAutoEnrollGroup(!autoEnrollGroup)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              autoEnrollGroup ? "bg-[#01B0F1]" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                autoEnrollGroup ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Navigation Action Footer                                                  */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 font-josefin">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-2 sm:order-1"
        >
          <FaArrowLeft className="w-3 h-3" />
          Previous Step
        </button>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-lilita text-base tracking-wide text-white bg-[#003D55] hover:bg-[#015575] hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next Step: Subjects & Goals</span>
            <FaArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2AcademicProfile;
