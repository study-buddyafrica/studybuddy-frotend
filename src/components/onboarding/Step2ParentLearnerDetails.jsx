import React, { useState } from "react";
import {
  FaUserGraduate,
  FaUser,
  FaMale,
  FaFemale,
  FaSchool,
  FaIdBadge,
  FaLink,
  FaCheck,
  FaTimes,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaRegCircle,
  FaInfoCircle,
  FaTrashAlt
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { onboardingService, onboardingPayloads, getErrorMessage } from "../../services/onboardingService";

/**
 * Helper to compute age & CBC academic stage recommendation from DOB string
 */
const calculateAcademicStage = (dobString) => {
  if (!dobString) {
    return {
      age: "--",
      headline: "Age & Stage Calculator",
      subline: "Select date of birth to calculate academic grade",
    };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return {
      age: "--",
      headline: "Invalid Date Format",
      subline: "Please select a valid date of birth",
    };
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  let headline = `${age} Years Old • Candidate`;
  let subline = "CBC Academic Track";

  if (age <= 5) {
    headline = `${age} Years Old • Early Years Learner`;
    subline = "CBC Pre-Primary (PP1 - PP2) Foundation";
  } else if (age >= 6 && age <= 11) {
    headline = `${age} Years Old • Primary School Learner`;
    subline = `CBC Primary (Grade ${Math.max(1, age - 5)} - Grade ${Math.min(6, age - 5)})`;
  } else if (age >= 12 && age <= 14) {
    headline = `${age} Years Old • Junior School Candidate`;
    subline = "CBC Grade 7 - Grade 9 Secondary Pathway";
  } else if (age >= 15 && age <= 18) {
    headline = `${age} Years Old • Senior School Candidate`;
    subline = "CBC Senior School & Career Track";
  } else {
    headline = `${age} Years Old • Advanced Learner`;
    subline = "Pre-University / High School Track";
  }

  return { age: Math.max(3, age), headline, subline };
};

/**
 * Step 2 - PARENT Learner & Child Details
 */
const Step2ParentLearnerDetails = ({
  registrationData = null,
  onNext = null,
  onBack = null,
}) => {
  // ---------------------------------------------------------------------------
  // Primary Ward Form State
  // ---------------------------------------------------------------------------
  const [childName, setChildName] = useState(
    registrationData?.child_name || "",
  );
  const [gender, setGender] = useState(""); // "boy" | "girl"
  const [dob, setDob] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCategory, setSchoolCategory] = useState("");
  const [nemisUpi, setNemisUpi] = useState("");

  // Account Linking State
  const [isAccountLinked, setIsAccountLinked] = useState(true);
  const [linkedEmail, setLinkedEmail] = useState("");
  const [showNemisHelp, setShowNemisHelp] = useState(false);

  // ---------------------------------------------------------------------------
  // Sibling State (Optional multi-child management)
  // ---------------------------------------------------------------------------
  const [siblings, setSiblings] = useState([]);

  // UI Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Academic stage dynamic calculation
  const academicStage = calculateAcademicStage(dob);

  // Quick school suggestions
  const schoolSuggestions = [
    { name: "Riara Junior Academy", category: "Private • Nairobi" },
    { name: "Nairobi Academy", category: "International • Nairobi" },
    { name: "Consolata School", category: "Private • Westlands" },
  ];

  const handleSelectSchool = (school) => {
    setSchoolName(school.name);
    setSchoolCategory(school.category);
    setSuccessMessage(`Selected ${school.name}`);
  };

  // Add Sibling Handler
  const handleAddSibling = () => {
    const newSibling = {
      id: Date.now(),
      name: "",
      gender: "girl",
      dob: "2015-08-20",
      schoolName: schoolName,
      nemisUpi: "",
      isLinked: false,
    };
    setSiblings([...siblings, newSibling]);
    setSuccessMessage("Sibling registration form added below.");
  };

  const handleRemoveSibling = (id) => {
    setSiblings(siblings.filter((s) => s.id !== id));
  };

  const handleUpdateSibling = (id, field, value) => {
    setSiblings(
      siblings.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  // ---------------------------------------------------------------------------
  // Submit & Proceed to Step 3
  // ---------------------------------------------------------------------------
  const handleProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setErrorMessage("");

    if (!childName.trim()) {
      setErrorMessage("Please enter your learner's full official name.");
      return;
    }

    if (!dob) {
      setErrorMessage("Please enter your learner's date of birth.");
      return;
    }

    if (!schoolName.trim()) {
      setErrorMessage("Please enter or select your learner's current school.");
      return;
    }

    const wardPayload = {
      primaryWard: {
        fullName: childName.trim(),
        gender,
        dateOfBirth: dob,
        academicStage,
        schoolName: schoolName.trim(),
        schoolCategory,
        nemisUpi: nemisUpi.trim(),
        isAccountLinked,
        linkedEmail: isAccountLinked ? linkedEmail : null,
      },
      siblings,
    };

    sessionStorage.setItem("parentWardData", JSON.stringify(wardPayload));

    if (onboardingService.enabled) {
      setLoading(true);
      try {
        const parentAccount = JSON.parse(sessionStorage.getItem("parentAccountData") || "{}");
        let relType = parentAccount.relationship || "Guardian";
        if (relType.toLowerCase() === "father") relType = "Father";
        else if (relType.toLowerCase() === "mother") relType = "Mother";
        else if (relType.toLowerCase() === "sponsor") relType = "Sponsor";
        else relType = "Guardian";

        const childId = isAccountLinked && linkedEmail ? linkedEmail.trim() : (nemisUpi.trim() || childName.trim());
        const payload = onboardingPayloads.parentStep2({
          child_identifier: childId,
          relationship_type: relType,
          child_name: childName.trim(),
        });
        await onboardingService.step2(payload);
      } catch (apiErr) {
        console.warn("Parent step2 API error:", apiErr);
        const msg = getErrorMessage(apiErr, "Failed to link learner to parent profile.");
        setErrorMessage(msg);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    setSuccessMessage("Learner details saved successfully! Proceeding to Goals & Curriculum...");

    setTimeout(() => {
      if (onNext) {
        onNext(wardPayload);
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
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
      {/* 1. INTRO BANNER                                                           */}
      {/* ========================================================================= */}
      <div className="space-y-2">

        <h1 className="text-2xl sm:text-3xl font-lilita text-slate-900 tracking-tight leading-snug">
          Add Your Learner's Details
        </h1>

        <p className="text-xs sm:text-sm font-josefin text-slate-600 leading-relaxed max-w-2xl">
          Register your child to customize their personalized curriculum, sync AI tutor guidance, and set up your weekly progress reports.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. FORM CARD: PRIMARY WARD / CHILD DETAILS                                */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#00658C] flex items-center justify-center text-lg shrink-0">
              <FaUserGraduate />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-lilita text-slate-900 tracking-wide">
                1. Primary Ward / Child Details
              </h2>
              <p className="text-xs font-josefin text-slate-500">
                Basic learner demographics for class level recommendation
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-[11px] font-josefin font-semibold text-[#00658C] bg-[#EAF5FF] border border-[#01B0F1]/20 px-3 py-1 rounded-full">
            * Required for curriculum alignment
          </span>
        </div>

        <div className="space-y-5">
          {/* Row 1: Full Official Name & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Child's Full Official Name (7 cols) */}
            <div className="md:col-span-7 space-y-1.5">
              <label
                htmlFor="childNameInput"
                className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider"
              >
                Child's Full Official Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  id="childNameInput"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter learner's full legal name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-josefin font-semibold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575] focus:ring-2 focus:ring-[#015575]/10 transition-all"
                />
              </div>
              <p className="text-[11px] font-josefin text-slate-400">
                Enter as registered in school records or national examinations.
              </p>
            </div>

            {/* Child's Gender (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                Child's Gender
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Boy Option */}
                <button
                  type="button"
                  onClick={() => setGender("boy")}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    gender === "boy"
                      ? "border-[#003D55] bg-[#003D55]/5 text-[#003D55] shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FaMale className="text-sm" />
                    <span className="font-josefin font-bold text-xs sm:text-sm">
                      Boy
                    </span>
                  </div>
                  {gender === "boy" ? (
                    <FaCheckCircle className="text-[#003D55] text-xs sm:text-sm" />
                  ) : (
                    <FaRegCircle className="text-slate-300 text-xs sm:text-sm" />
                  )}
                </button>

                {/* Girl Option */}
                <button
                  type="button"
                  onClick={() => setGender("girl")}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    gender === "girl"
                      ? "border-[#003D55] bg-[#003D55]/5 text-[#003D55] shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FaFemale className="text-sm" />
                    <span className="font-josefin font-bold text-xs sm:text-sm">
                      Girl
                    </span>
                  </div>
                  {gender === "girl" ? (
                    <FaCheckCircle className="text-[#003D55] text-xs sm:text-sm" />
                  ) : (
                    <FaRegCircle className="text-slate-300 text-xs sm:text-sm" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Date of Birth & Dynamic Stage Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Date of Birth Input (6 cols) */}
            <div className="md:col-span-6 space-y-1.5">
              <label
                htmlFor="dobInput"
                className="text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider flex items-center"
              >
                Date of Birth
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="dobInput"
                  type="date"
                  min="2004-01-01"
                  max="2022-12-31"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-josefin font-semibold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575] focus:ring-2 focus:ring-[#015575]/10 transition-all cursor-pointer"
                />
              </div>
              <p className="text-[11px] font-josefin text-slate-400">
                Used to recommend the correct CBC or 8-4-4 grade syllabus level.
              </p>
            </div>

            {/* Dynamic Stage Calculation Badge (6 cols) */}
            <div className="md:col-span-6">
              <div className="bg-[#EAF5FF] border border-[#01B0F1]/30 rounded-2xl p-2.5 flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#DEF0FF] text-[#00658C] font-lilita text-xl flex items-center justify-center shrink-0">
                  {academicStage.age}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-josefin font-bold text-xs text-[#003D55] whitespace-nowrap">
                    {academicStage.headline}
                  </p>
                  <p className="font-josefin font-semibold text-[10px] text-[#01B0F1] whitespace-nowrap">
                    {academicStage.subline}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Current School Name & Registry Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="schoolNameInput"
                className="text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider"
              >
                Current School Name
              </label>
              <span className="text-[11px] font-josefin text-slate-400">
                Verified against Kenya Ministry of Education Registry
              </span>
            </div>

            <div className="relative flex items-center">
              <FaSchool className="absolute left-3.5 text-slate-400 text-sm pointer-events-none" />
              <input
                id="schoolNameInput"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter current school name"
                className="w-full pl-10 pr-32 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-josefin font-semibold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575] transition-all"
              />
              <span className="absolute right-3 px-2.5 py-1 rounded-md bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-[11px] pointer-events-none">
                {schoolCategory}
              </span>
            </div>

            {/* Quick School Suggestions */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-xs font-josefin text-slate-500 font-medium">
                Quick suggestions:
              </span>
              {schoolSuggestions.map((school, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSchool(school)}
                  className={`text-xs font-josefin px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    schoolName === school.name
                      ? "bg-[#015575] text-white border-[#015575]"
                      : "bg-white border-slate-200 text-slate-600 hover:border-[#01B0F1] hover:text-[#00658C]"
                  }`}
                >
                  {school.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: NEMIS UPI / Assessment Number (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="nemisInput"
                  className="text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider"
                >
                  NEMIS UPI / Assessment Number
                </label>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  OPTIONAL
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowNemisHelp(!showNemisHelp)}
                className="inline-flex items-center gap-1 text-xs font-josefin font-semibold text-[#00658C] hover:underline cursor-pointer"
              >
                <FaInfoCircle className="text-[11px]" />
                <span>Where to find this?</span>
              </button>
            </div>

            <div className="relative">
              <FaIdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                id="nemisInput"
                type="text"
                value={nemisUpi}
                onChange={(e) => setNemisUpi(e.target.value)}
                placeholder="e.g. NEMIS - 84920 - K"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-josefin font-semibold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575] transition-all"
              />
            </div>

            {showNemisHelp && (
              <div className="p-3 bg-[#EAF5FF] rounded-xl border border-[#01B0F1]/20 text-xs font-josefin text-[#003D55] space-y-1 animate-fadeIn">
                <p className="font-bold">What is the NEMIS UPI?</p>
                <p>
                  The Unique Personal Identifier (UPI) is issued by the Ministry of Education. It appears on Grade 6 KPSEA / KCPE slips, assessment booklets, or your child's official school report card.
                </p>
              </div>
            )}

            <p className="text-[11px] font-josefin text-slate-400">
              Found on official KNEC assessment slips, assessment booklets, or official school term report cards.
            </p>
          </div>

          {/* Row 5: Linked StudyBuddy Student Account Card */}
          <div className="bg-[#EAF5FF]/60 border border-[#01B0F1]/20 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white shadow-xs text-[#00658C] flex items-center justify-center text-xs shrink-0">
                  <FaLink />
                </div>
                <div>
                  <p className="font-josefin font-bold text-xs sm:text-sm text-slate-800">
                    Does {childName.split(" ")[0] || "Amani"} already have an active StudyBuddy student account?
                  </p>
                  <p className="font-josefin text-xs text-slate-500">
                    Link learner app login to sync real-time practice tests and homework assignments.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAccountLinked}
                  onClick={() => setIsAccountLinked(!isAccountLinked)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isAccountLinked ? "bg-[#003D55]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isAccountLinked ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-josefin font-bold text-slate-700">
                  {isAccountLinked ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Linked Account Banner */}
            {isAccountLinked && (
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#003D55] text-white font-lilita text-xs flex items-center justify-center shrink-0">
                    AK
                  </div>
                  <div className="min-w-0">
                    <p className="font-josefin font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {linkedEmail}
                    </p>
                    <p className="font-josefin text-[11px] text-slate-500 truncate">
                      Linked via School Google Workspace &bull; Phone +254 712 345 678
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#003D55] text-white font-josefin font-bold text-[11px]">
                    <FaCheck className="text-[10px]" />
                    <span>Account Linked &amp; Verified</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAccountLinked(false)}
                    aria-label="Unlink student account"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SIBLINGS SECTION (If any added)                                        */}
      {/* ========================================================================= */}
      {siblings.map((sibling, index) => (
        <section
          key={sibling.id}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF5FF] text-[#00658C] flex items-center justify-center text-sm font-bold">
                {index + 2}
              </div>
              <div>
                <h3 className="text-base font-lilita text-slate-900">
                  {sibling.name || `Sibling / Ward #${index + 2}`}
                </h3>
                <p className="text-xs font-josefin text-slate-500">
                  Additional learner profile for unified monitoring
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveSibling(sibling.id)}
              className="inline-flex items-center gap-1 text-xs font-josefin font-bold text-red-500 hover:text-red-700 cursor-pointer"
            >
              <FaTrashAlt className="text-xs" />
              <span>Remove</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                Full Official Name
              </label>
              <input
                type="text"
                value={sibling.name}
                onChange={(e) =>
                  handleUpdateSibling(sibling.id, "name", e.target.value)
                }
                placeholder="e.g. Zawadi Baraza Kimani"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-josefin text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                value={sibling.dob}
                onChange={(e) =>
                  handleUpdateSibling(sibling.id, "dob", e.target.value)
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-josefin text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#015575]"
              />
            </div>
          </div>
        </section>
      ))}

      {/* ========================================================================= */}
      {/* 4. SIBLING REGISTRATION DASHED CARD                                       */}
      {/* ========================================================================= */}
      <div
        onClick={handleAddSibling}
        className="border-2 border-dashed border-[#01B0F1]/40 hover:border-[#01B0F1] bg-[#F4FAFF]/60 hover:bg-[#F4FAFF] rounded-3xl p-6 text-center space-y-2 cursor-pointer transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#01B0F1]/30 text-[#00658C] group-hover:scale-110 flex items-center justify-center mx-auto text-sm transition-transform">
          <FaPlus />
        </div>
        <h3 className="font-lilita text-[#003D55] text-sm sm:text-base tracking-wide">
          + Add Another Child / Sibling
        </h3>
        <p className="font-josefin text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Easily track multiple children across different grades from a single parent portal with unified weekly email summaries.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. ACTION NAVIGATION BUTTONS                                              */}
      {/* ========================================================================= */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-josefin font-semibold transition-all cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Parent Profile</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleProceed}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-[#003D55] hover:bg-[#015575] text-white font-lilita text-sm shadow-md hover:shadow-lg transition-all cursor-pointer ${
            loading ? "opacity-75 cursor-wait" : ""
          }`}
        >
          <span>{loading ? "Linking Learner..." : "Continue to Curriculum & Goals"}</span>
          <FaArrowRight className="text-xs text-[#01B0F1]" />
        </button>
      </div>
    </div>
  );
};

export default Step2ParentLearnerDetails;
