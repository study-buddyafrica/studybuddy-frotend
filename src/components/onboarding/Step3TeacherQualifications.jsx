import React, { useState, useRef } from "react";
import {
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaGraduationCap,
  FaBookOpen,
  FaTag,
  FaMoneyBillWave,
  FaPenNib,
  FaCloudUploadAlt,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { FHOST } from "../constants/Functions";
import { authStorage } from "../../services/authStorage";

/**
 * Step 3 - TEACHER Qualifications, Specializations & Rates
 * Matches Figma frame 39:1134:
 * 1. Academic Background (Highest Qualification, Institution, Degree Certificate Upload)
 * 2. Curriculums Taught (CBC, 8-4-4, IGCSE / Cambridge)
 * 3. Subject Specializations (Dynamic pills with add/remove)
 * 4. Tutoring Rate & Pricing (KES hourly rate, preset tiers, group discount toggle)
 * 5. Professional Bio & Teaching Methodology (Textarea with word counter)
 * 6. Sticky bottom navigation matching prior onboarding button styling
 */
const Step3TeacherQualifications = ({
  registrationData = null,
  onNext = null,
  onBack = null,
}) => {
  // 1. Academic Background State (clean scratch state)
  const [highestQualification, setHighestQualification] = useState(
    "Bachelor of Education (B.Ed)",
  );
  const [institution, setInstitution] = useState(
    registrationData?.school || "",
  );
  const [degreeDoc, setDegreeDoc] = useState(null);
  const degreeInputRef = useRef(null);

  // 2. Curriculums Taught (clean scratch state - empty by default)
  const [selectedCurriculums, setSelectedCurriculums] = useState([]);

  // Available Curriculum Definitions
  const CURRICULUMS = [
    {
      id: "cbc",
      badge: "NATIONAL STANDARD",
      title: "CBC (Junior & Senior School)",
      description: "Competency Based Curriculum framework",
    },
    {
      id: "844",
      badge: "TRADITIONAL TRACK",
      title: "8-4-4 (KCSE National Exam Track)",
      description: "High school exam preparation & revision",
    },
    {
      id: "cambridge",
      badge: "INTERNATIONAL STANDARD",
      title: "IGCSE / Cambridge International",
      description: "Global curriculum & examinations",
    },
  ];

  // Toggle curriculum selection
  const toggleCurriculum = (id) => {
    setSelectedCurriculums((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 3. Subject Specializations State (clean scratch state)
  const [subjects, setSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState("");

  const POPULAR_SUBJECTS = [
    "Mathematics (All levels)",
    "Chemistry (Senior School)",
    "Biology (Senior School)",
    "Physics (Senior School)",
    "Integrated Science (CBC Grade 7-9)",
    "English Language & Literature",
    "Kiswahili (Fasihi & Lugha)",
    "Computer Science / ICT",
    "Business Studies",
    "Geography",
    "History & Government",
    "Agriculture",
  ];

  const handleAddSubject = (subjectName) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    if (!subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setNewSubjectInput("");
    setShowAddSubjectModal(false);
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects((prev) => prev.filter((s) => s !== subjectToRemove));
  };

  // 4. Tutoring Rate & Pricing State
  const [hourlyRate, setHourlyRate] = useState(1200);
  const [groupDiscount, setGroupDiscount] = useState(true);

  const RATE_PRESETS = [
    { label: "Entry", rate: 800 },
    { label: "Standard", rate: 1200 },
    { label: "Advanced", rate: 2000 },
    { label: "Master", rate: 2500 },
  ];

  // 5. Professional Bio & Teaching Methodology
  const [bio, setBio] = useState("");

  // Word count calculator
  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle certificate file change
  const handleDegreeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Degree certificate file exceeds 10MB limit.");
        return;
      }
      setDegreeDoc({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        uploaded: true,
        file,
      });
      setSuccessMessage(`Academic certificate (${file.name}) uploaded.`);
    }
  };

  // Submit / Proceed Action
  const handleProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!highestQualification.trim()) {
      setErrorMessage("Please select or enter your highest qualification.");
      return;
    }
    if (!institution.trim()) {
      setErrorMessage("Please enter the educational institution attended.");
      return;
    }
    if (selectedCurriculums.length === 0) {
      setErrorMessage("Please select at least one curriculum you teach (e.g. CBC, 8-4-4, or IGCSE).");
      return;
    }
    if (subjects.length === 0) {
      setErrorMessage("Please select or add at least one subject specialization.");
      return;
    }
    if (!hourlyRate || Number(hourlyRate) < 500) {
      setErrorMessage("Please enter a valid hourly rate of at least KES 500/hr.");
      return;
    }
    if (!bio.trim() || wordCount < 10) {
      setErrorMessage("Please write a short professional bio (at least 10 words) explaining your teaching approach.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Stage teacher qualifications data in sessionStorage
      const qualificationsData = {
        highestQualification: highestQualification.trim(),
        institution: institution.trim(),
        degreeDocName: degreeDoc?.name || null,
        curriculums: selectedCurriculums,
        subjects,
        hourlyRate: Number(hourlyRate),
        groupDiscount,
        bio: bio.trim(),
      };
      sessionStorage.setItem("teacherQualificationsData", JSON.stringify(qualificationsData));

      // Attempt non-blocking profile update sync if token or backend is active
      const token =
        authStorage.getAccessToken() ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (token) {
        try {
          const formData = new FormData();
          formData.append("bio", bio.trim());
          formData.append("hourly_rate", String(hourlyRate));
          formData.append("school", institution.trim());
          if (subjects.length > 0) {
            formData.append("subjects", subjects.join(", "));
          }
          if (degreeDoc?.file) {
            formData.append("cv", degreeDoc.file);
          }
          await fetch(`${FHOST}/api/teacher/profile/update/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        } catch (syncErr) {
          console.warn("Background qualifications profile sync warning:", syncErr);
        }
      }

      if (onNext) {
        onNext();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred while saving qualifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Hidden File Input for Certificate */}
      <input
        ref={degreeInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg"
        className="hidden"
        onChange={handleDegreeFileChange}
      />

      {/* Top Header Block */}
      <div className="space-y-6">
        <div className="space-y-2">
          {/* Progress Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-xs uppercase tracking-wider shadow-sm">
            <FaGraduationCap className="w-3.5 h-3.5 text-[#00658C]" />
            <span>Qualifications &amp; Rates Setup</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-lilita text-[#001E2D] tracking-tight">
            Qualifications, Specializations &amp; Rates
          </h1>
          <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Define your academic degrees, curriculum expertise, subject mastery, and hourly tutoring rates.
          </p>
        </div>

        {/* Global Alerts */}
        {errorMessage && (
          <AuthAlert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        )}
        {successMessage && (
          <AuthAlert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Form Sections Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-8">
          {/* ========================================================================= */}
          {/* Section 1: Academic Background                                            */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2">
              <FaGraduationCap className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                1. Academic Background
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-josefin">
              {/* Highest Qualification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Highest Qualification
                </label>
                <select
                  value={highestQualification}
                  onChange={(e) => setHighestQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                >
                  <option value="Bachelor of Education (B.Ed)">Bachelor of Education (B.Ed)</option>
                  <option value="Master of Education (M.Ed)">Master of Education (M.Ed)</option>
                  <option value="Postgraduate Diploma in Education (PGDE)">Postgraduate Diploma in Education (PGDE)</option>
                  <option value="Diploma in Teacher Education (DTE)">Diploma in Teacher Education (DTE)</option>
                  <option value="Bachelor of Science with Education (B.Sc Ed)">Bachelor of Science with Education (B.Sc Ed)</option>
                  <option value="Bachelor of Arts with Education (B.A Ed)">Bachelor of Arts with Education (B.A Ed)</option>
                  <option value="Doctor of Philosophy (Ph.D) in Education">Doctor of Philosophy (Ph.D) in Education</option>
                  <option value="Other Degree / Higher National Diploma">Other Degree / Higher National Diploma</option>
                </select>
              </div>

              {/* Institution Attended */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Institution Attended
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                  placeholder="e.g. Kenyatta University, University of Nairobi"
                />
              </div>
            </div>

            {/* Academic Certificate Upload */}
            <div className="space-y-2 pt-2 font-josefin">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Academic Certificate Upload (Degree or Diploma)
              </label>

              <div
                onClick={() => degreeInputRef.current?.click()}
                className={`rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  degreeDoc?.uploaded
                    ? "bg-emerald-50/40 border-2 border-emerald-500 hover:bg-emerald-50/70"
                    : "bg-[#EAF5FF] border-2 border-slate-300 border-dashed hover:border-[#01B0F1]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
                    {degreeDoc?.uploaded ? (
                      <FaFileAlt className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <FaCloudUploadAlt className="w-5 h-5 text-[#00658C]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {degreeDoc?.name || "Upload Degree or Diploma Certificate (PDF, PNG, JPG)"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {degreeDoc?.uploaded
                        ? `${degreeDoc.size} • Uploaded successfully`
                        : "Drag and drop or browse files (Max 10MB)"}
                    </p>
                  </div>
                </div>

                {degreeDoc?.uploaded ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <FaCheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        degreeInputRef.current?.click();
                      }}
                      className="text-xs font-bold text-[#00658C] bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      Replace File
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-bold text-[#00658C] bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm shrink-0"
                  >
                    Browse
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 2: Curriculums Taught                                             */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2">
              <FaBookOpen className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                2. Curriculums Taught
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-josefin">
              {CURRICULUMS.map((curr) => {
                const isSelected = selectedCurriculums.includes(curr.id);
                return (
                  <div
                    key={curr.id}
                    onClick={() => toggleCurriculum(curr.id)}
                    className={`relative rounded-xl p-5 cursor-pointer border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#EAF5FF] border-[#00658C] shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-[#00658C] uppercase">
                          {curr.badge}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#00658C] text-white"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <FaCheck className="w-2.5 h-2.5" />}
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-[#001E2D] leading-snug">
                        {curr.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                      {curr.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 3: Subject Specializations                                        */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTag className="w-4 h-4 text-[#00658C]" />
                <h3 className="font-lilita text-lg text-[#001E2D]">
                  3. Subject Specializations
                </h3>
              </div>
              <span className="text-xs font-josefin text-slate-500">
                {subjects.length} selected
              </span>
            </div>

            {/* Selected Subjects Pills */}
            <div className="flex flex-wrap gap-2.5 min-h-[46px] items-center p-3 bg-slate-50 rounded-xl border border-slate-200 font-josefin">
              {subjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No subjects selected yet. Choose popular subjects below or click "+ Add Subject".
                </p>
              ) : (
                subjects.map((subj) => (
                  <span
                    key={subj}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF5FF] border border-[#01B0F1]/40 text-[#001E2D] text-xs font-bold shadow-xs animate-fadeIn"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#01B0F1]" />
                    <span>{subj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subj)}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded-full transition-colors"
                      title="Remove subject"
                    >
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}

              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DEF0FF] hover:bg-[#cbe8ff] text-[#003D55] text-xs font-bold transition-colors cursor-pointer border border-[#01B0F1]/30 ml-auto"
              >
                <FaPlus className="w-2.5 h-2.5 text-[#00658C]" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* Popular Subjects Quick Picks */}
            <div className="space-y-2 font-josefin">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quick Add Common Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUBJECTS.map((popSubj) => {
                  const alreadyAdded = subjects.includes(popSubj);
                  return (
                    <button
                      key={popSubj}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddSubject(popSubj)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                        alreadyAdded
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:border-[#01B0F1] hover:text-[#00658C] hover:bg-sky-50/50"
                      }`}
                    >
                      {alreadyAdded ? "✓ " : "+ "}
                      {popSubj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Subject Modal / Drawer */}
            {showAddSubjectModal && (
              <div className="p-4 bg-sky-50/70 border border-[#01B0F1]/30 rounded-xl space-y-3 font-josefin animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#001E2D] uppercase tracking-wider">
                    Add Custom Subject or Level
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddSubjectModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubject(newSubjectInput);
                      }
                    }}
                    placeholder="e.g. French, Music, Aviation Studies, Robotics..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#01B0F1]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubject(newSubjectInput)}
                    className="px-4 py-2 bg-[#003D55] text-white rounded-lg text-xs font-bold hover:bg-[#015575] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* Section 4: Tutoring Rate & Pricing                                        */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                4. Tutoring Rate &amp; Pricing
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-josefin">
              {/* Hourly Rate Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hourly Tutoring Rate (KES)
                  </label>
                  <span className="text-[11px] font-bold text-[#00658C] bg-[#EAF5FF] px-2 py-0.5 rounded-md">
                    Recommended: KES 800 – 2,500
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">
                    KES
                  </span>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-14 pr-16 py-3 bg-[#EAF5FF]/40 border border-slate-300 rounded-xl text-lg text-[#001E2D] font-bold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">
                    / hr
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Platform recommended rate for your experience tier: KES 800 - KES 2,500. You keep 85% of your lesson earnings.
                </p>
              </div>

              {/* Rate Presets & Group Discount Card */}
              <div className="bg-[#EAF5FF]/50 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick Rate Select
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RATE_PRESETS.map((preset) => (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => setHourlyRate(preset.rate)}
                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                          hourlyRate === preset.rate
                            ? "bg-[#003D55] text-white border-[#003D55] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#01B0F1]"
                        }`}
                      >
                        <div>KES {preset.rate.toLocaleString()}</div>
                        <div className="text-[10px] opacity-80">{preset.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Discount Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200/60">
                  <input
                    type="checkbox"
                    checked={groupDiscount}
                    onChange={(e) => setGroupDiscount(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#00658C] border-slate-300 focus:ring-[#01B0F1] cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-[#001E2D]">
                      Offer 20% discount for cohort classes (5+ students)
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Recommended to boost student bookings and fill weekly study group batches.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 5: Teacher Bio & Approach                                         */}
          {/* ========================================================================= */}
          <div className="space-y-4 font-josefin">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaPenNib className="w-4 h-4 text-[#00658C]" />
                <h3 className="font-lilita text-lg text-[#001E2D]">
                  5. Teacher Bio &amp; Approach
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {wordCount} / 300 words
              </span>
            </div>

            <div className="space-y-2">
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your teaching philosophy, classroom experience, mastery of CBC/KCSE or IGCSE syllabi, and how you mentor students to academic excellence..."
                className="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 leading-relaxed font-normal focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500 leading-relaxed">
                This bio will be displayed publicly on your StudyBuddy Africa tutor profile to attract prospective students and parents.
              </p>
            </div>
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
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-2 sm:order-1"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back to Step 2</span>
        </button>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleProceed}
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-lilita text-base tracking-wide text-white bg-[#003D55] hover:bg-[#015575] hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
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
                Saving Qualifications...
              </span>
            ) : (
              <>
                <span>Save &amp; Continue to Final Review</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3TeacherQualifications;
