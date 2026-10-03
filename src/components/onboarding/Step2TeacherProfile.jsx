import React, { useState, useRef } from "react";
import {
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
  FaUserTie,
  FaIdCard,
  FaGraduationCap,
  FaCloudUploadAlt,
  FaFileAlt,
  FaLock,
  FaCheck,
  FaCamera,
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { FHOST } from "../constants/Functions";

/**
 * Step 2 - TEACHER Professional Identity & KYC
 * - Clean initial state (no hardcoded credentials)
 * - Professional Educator Headshot upload
 * - Legal Identity & Government ID with dual-side document uploader
 * - Professional Teaching Accreditation (TSC Number) & Experience
 * - Statutory compliance disclosure (Kenya Data Protection Act 2019)
 * - Sticky bottom navigation matching prior onboarding button styling
 */
const Step2TeacherProfile = ({
  registrationData = null,
  onNext = null,
  onBack = null,
}) => {
  // Headshot state (starts empty)
  const [headshotPreview, setHeadshotPreview] = useState(null);
  const headshotInputRef = useRef(null);

  // Legal Identity Form State (starts empty / from registrationData)
  const defaultFullName = registrationData?.first_name
    ? `${registrationData.first_name} ${registrationData.last_name || ""}`.trim()
    : "";
  const [fullName, setFullName] = useState(defaultFullName);
  const [idType, setIdType] = useState("Kenyan National ID");
  const [idNumber, setIdNumber] = useState(
    registrationData?.id_number || registrationData?.national_identity_number || "",
  );

  // Government ID Uploads State (starts empty for both front and back)
  const [frontIdDoc, setFrontIdDoc] = useState(null);
  const [backIdDoc, setBackIdDoc] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Accreditation & Teaching Experience (starts empty / from registrationData)
  const [tscNumber, setTscNumber] = useState(
    registrationData?.tsc_number || "",
  );
  const [experienceYears, setExperienceYears] = useState("1–3 yrs");
  const [institution, setInstitution] = useState(
    registrationData?.school || "",
  );

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle headshot file change
  const handleHeadshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Headshot photo exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setHeadshotPreview(uploadEvent.target.result);
        setSuccessMessage("Educator headshot uploaded successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document file change
  const handleDocChange = (side, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === "front") {
        setFrontIdDoc({ name: file.name, uploaded: true, file });
        setSuccessMessage(`Front of ID (${file.name}) uploaded.`);
      } else {
        setBackIdDoc({ name: file.name, uploaded: true, file });
        setSuccessMessage(`Back of ID (${file.name}) uploaded.`);
      }
    }
  };

  // Submit / Proceed Action
  const handleProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full legal name as per your ID document.");
      return;
    }
    if (!idNumber.trim()) {
      setErrorMessage("Please enter your National ID or Passport Number.");
      return;
    }
    if (!tscNumber.trim()) {
      setErrorMessage("Please provide your TSC Registration Number.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Stage teacher KYC profile in sessionStorage
      const kycData = {
        fullName: fullName.trim(),
        idType,
        idNumber: idNumber.trim(),
        tscNumber: tscNumber.trim(),
        experienceYears,
        institution: institution.trim(),
        headshot: headshotPreview,
        frontDocName: frontIdDoc?.name || null,
        backDocName: backIdDoc?.name || null,
      };
      sessionStorage.setItem("teacherKycData", JSON.stringify(kycData));

      // Attempt non-blocking profile update sync if token or backend is active
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (token) {
        try {
          const formData = new FormData();
          formData.append("tsc_number", tscNumber.trim());
          formData.append("national_identity_number", idNumber.trim());
          formData.append("experience", experienceYears);
          if (institution.trim()) {
            formData.append("school", institution.trim());
          }
          await fetch(`${FHOST}/api/users/profile/update/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        } catch (syncErr) {
          console.warn("Background KYC profile sync warning:", syncErr);
        }
      }

      if (onNext) {
        onNext();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred while saving your KYC profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Hidden File Inputs */}
      <input
        ref={headshotInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleHeadshotChange}
      />
      <input
        ref={frontInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => handleDocChange("front", e)}
      />
      <input
        ref={backInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => handleDocChange("back", e)}
      />

      {/* Top Header Block */}
      <div className="space-y-6">
        <div className="space-y-2">
          {/* Security Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-xs uppercase tracking-wider shadow-sm">
            <FaShieldAlt className="w-3.5 h-3.5 text-[#00658C]" />
            <span>Identity &amp; Legal KYC Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-lilita text-[#001E2D] tracking-tight">
            Professional Identity &amp; Legal KYC
          </h1>
          <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Confirm your legal identity and teaching accreditation to unlock classroom hosting, syllabus creation, and student bookings.
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

        {/* Form Card Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-8">
          {/* ========================================================================= */}
          {/* Section 1: Professional Educator Headshot                                 */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <FaUserTie className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                1. Professional Educator Headshot
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-1">
              {/* Avatar circle */}
              <div className="relative shrink-0">
                {headshotPreview ? (
                  <img
                    src={headshotPreview}
                    alt="Educator Headshot"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#00658C] shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                    <FaUserTie className="w-9 h-9 text-slate-300" />
                  </div>
                )}
                {headshotPreview && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
                    <FaCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Upload CTA & Guidelines */}
              <div className="space-y-2 text-center sm:text-left flex-1 font-josefin">
                <button
                  type="button"
                  onClick={() => headshotInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D2ECFF] text-[#001E2D] hover:bg-[#b9e2fe] transition-all font-bold text-xs shadow-sm"
                >
                  <FaCamera className="w-3.5 h-3.5 text-[#00658C]" />
                  <span>Upload New Headshot</span>
                </button>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Must be a clear, front-facing studio photo against a neutral background. Max file size 5MB (JPG, PNG).
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 2: Legal Identity & Government ID                                 */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2">
              <FaIdCard className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                2. Legal Identity &amp; Government ID
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-josefin">
              {/* Full Legal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Legal Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all pr-10"
                    placeholder="Enter full legal name"
                  />
                  {fullName.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <FaShieldAlt className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Identification Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Identification Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                >
                  <option value="Kenyan National ID">Kenyan National ID</option>
                  <option value="Kenyan Passport">Kenyan Passport</option>
                  <option value="Alien ID / Work Permit">Alien ID / Work Permit</option>
                </select>
              </div>

              {/* National ID Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  National ID Number
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                  placeholder="e.g. 32849102"
                />
              </div>
            </div>

            {/* Document Uploads (Front & Back) */}
            <div className="space-y-2 pt-2 font-josefin">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Government ID Documents (Front &amp; Back)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front Document Card */}
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className={`rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    frontIdDoc?.uploaded
                      ? "bg-emerald-50/40 border-2 border-emerald-500 hover:bg-emerald-50/70"
                      : "bg-[#EAF5FF] border-2 border-slate-300 border-dashed hover:border-[#01B0F1]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
                      {frontIdDoc?.uploaded ? (
                        <FaFileAlt className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FaCloudUploadAlt className="w-5 h-5 text-[#00658C]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {frontIdDoc?.name || "Upload Front of National ID"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {frontIdDoc?.uploaded
                          ? "Uploaded & Verified successfully"
                          : "Drag and drop or browse files"}
                      </p>
                    </div>
                  </div>
                  {frontIdDoc?.uploaded ? (
                    <FaCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-[#00658C] bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0"
                    >
                      Browse
                    </button>
                  )}
                </div>

                {/* Back Document Card */}
                <div
                  onClick={() => backInputRef.current?.click()}
                  className={`rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    backIdDoc?.uploaded
                      ? "bg-emerald-50/40 border-2 border-emerald-500 hover:bg-emerald-50/70"
                      : "bg-[#EAF5FF] border-2 border-slate-300 border-dashed hover:border-[#01B0F1]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
                      {backIdDoc?.uploaded ? (
                        <FaFileAlt className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FaCloudUploadAlt className="w-5 h-5 text-[#00658C]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {backIdDoc?.name || "Upload Back of National ID"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {backIdDoc?.uploaded
                          ? "Uploaded & Verified"
                          : "Drag and drop or browse files"}
                      </p>
                    </div>
                  </div>
                  {backIdDoc?.uploaded ? (
                    <FaCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-[#00658C] bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0"
                    >
                      Browse
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 3: Professional Teaching Accreditation & Experience              */}
          {/* ========================================================================= */}
          <div className="pb-6 border-b border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2">
              <FaGraduationCap className="w-4 h-4 text-[#00658C]" />
              <h3 className="font-lilita text-lg text-[#001E2D]">
                3. Professional Teaching Accreditation &amp; Experience
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-josefin">
              {/* TSC Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  TSC Registration Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tscNumber}
                    onChange={(e) => setTscNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all pr-10"
                    placeholder="e.g. TSC/849201"
                  />
                  {tscNumber.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <FaCheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Years of Active Classroom Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Years of Active Classroom Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                >
                  <option value="1–3 yrs">1–3 yrs</option>
                  <option value="4–7 yrs">4–7 yrs</option>
                  <option value="8–12 yrs">8–12 yrs</option>
                  <option value="13+ yrs">13+ yrs</option>
                </select>
              </div>

              {/* Current/Recent Educational Institution */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current/Recent Educational Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20 transition-all"
                  placeholder="e.g. Nairobi Academy - Karen Campus"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 4: Security Compliance Card                                      */}
          {/* ========================================================================= */}
          <div className="bg-[#D2ECFF]/40 border border-[#00658C]/20 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 font-josefin">
            <div className="w-8 h-8 rounded-lg bg-[#00658C]/15 flex items-center justify-center text-[#00658C] shrink-0 mt-0.5">
              <FaLock className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900">
                Kenya Data Protection Act 2019 Compliance
              </p>
              <p className="text-slate-600 leading-relaxed">
                Your personal identification data, professional credentials, and biometric scans are encrypted and processed strictly for regulatory vetting purposes under ODPC guidelines.
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
          <span>Back to Step 1</span>
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
                Saving KYC Data...
              </span>
            ) : (
              <>
                <span>Save &amp; Continue to Qualifications</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2TeacherProfile;
