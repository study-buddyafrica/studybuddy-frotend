import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaClock,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaGraduationCap,
  FaUserFriends,
  FaInfoCircle,
  FaRedo,
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { FHOST } from "../constants/Functions";

/**
 * Step1AccountOtp: Clean, minimal Step 1 matching the login/signup font styles (Lilita & Josefin)
 * and streamlined as requested.
 */
const Step1AccountOtp = ({
  email: initialEmail = "",
  registrationData = null,
  onVerificationSuccess = null,
}) => {
  const navigate = useNavigate();

  // Email context
  const [email, setEmail] = useState(
    initialEmail || registrationData?.email || "amara.kamau@student.ke",
  );
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  // 6-digit OTP code state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [activeSlot, setActiveSlot] = useState(0);
  const inputRefs = useRef([]);

  // Account Type Selection: "student" (Self-Registration) or "parent_comanaged"
  const [accountType, setAccountType] = useState("student");
  const [nemisUpi, setNemisUpi] = useState("NEMIS-84920-K");
  const [whatsappDigests, setWhatsappDigests] = useState(true);

  // Timer states (14:55 expiry = 895 seconds, 42s resend cooldown)
  const [expirySeconds, setExpirySeconds] = useState(895);
  const [resendCooldown, setResendCooldown] = useState(42);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer for expiry
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [expirySeconds]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // OTP Input Handlers
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");

    // Handle multi-character paste into one slot
    if (cleanVal.length > 1) {
      handlePasteCode(cleanVal);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal ? cleanVal.slice(-1) : "";
    setOtpDigits(updated);

    // Auto-advance to next input if filled
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveSlot(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveSlot(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveSlot(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveSlot(index + 1);
    }
  };

  const handlePasteCode = (pastedText) => {
    const numeric = pastedText.replace(/[^0-9]/g, "").slice(0, 6);
    if (!numeric) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = numeric[i] || "";
    }
    setOtpDigits(updated);
    const nextSlot = Math.min(numeric.length, 5);
    inputRefs.current[nextSlot]?.focus();
    setActiveSlot(nextSlot);
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${FHOST}/api/verify-email/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccessMessage("A fresh 6-digit verification code was sent to your email!");
        setResendCooldown(60);
        setExpirySeconds(895);
      } else {
        setErrorMessage(data?.detail || data?.message || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error when resending code. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  // Submit / Verify Action
  const handleVerifyAndProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const fullCode = otpDigits.join("");
    if (fullCode.length < 4) {
      setErrorMessage("Please enter the complete verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Confirm OTP code with Django backend
      const confirmResponse = await fetch(`${FHOST}/api/verify-email/confirm/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode.trim(),
        }),
      });

      let confirmData = {};
      try {
        confirmData = await confirmResponse.json();
      } catch (parseErr) {
        confirmData = { error: "Failed to parse confirmation response" };
      }

      if (!confirmResponse.ok) {
        const detailMsg =
          confirmData?.errors?.[0]?.detail ||
          confirmData?.detail ||
          confirmData?.message ||
          "Invalid or expired verification code. Please check and try again.";
        setErrorMessage(detailMsg);
        setLoading(false);
        return;
      }

      // 2. Complete User Registration if credentials exist in sessionStorage
      let regData = registrationData;
      if (!regData) {
        const stored = sessionStorage.getItem("pendingRegistration");
        if (stored) {
          try {
            regData = JSON.parse(stored);
          } catch (err) {}
        }
      }

      if (regData && regData.password) {
        const registerPayload = {
          email: email.trim(),
          first_name: regData.first_name || email.split("@")[0],
          last_name: regData.last_name || regData.first_name || "Student",
          username: regData.username || email.split("@")[0],
          password: regData.password,
          confirm_password: regData.confirm_password || regData.password,
          role: regData.role || "student",
          education_level_id: regData.education_level || null,
        };

        const regResponse = await fetch(`${FHOST}/api/users/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(registerPayload),
        });

        if (!regResponse.ok) {
          const regErrData = await regResponse.json().catch(() => ({}));
          const errMsg =
            regErrData?.detail ||
            regErrData?.message ||
            "Account verification succeeded, but profile creation encountered an issue.";
          console.warn("Registration warning:", errMsg);
        } else {
          sessionStorage.setItem("userRegistered", "true");
        }
      }

      // Save Onboarding Stage Data
      const studentOnboardingData = {
        email: email.trim(),
        accountType: accountType,
        nemisUpi: accountType === "student" ? nemisUpi.trim() : null,
        whatsappDigests: accountType === "parent_comanaged" ? whatsappDigests : false,
        verifiedAt: new Date().toISOString(),
      };
      sessionStorage.setItem("studentOnboardingStep1", JSON.stringify(studentOnboardingData));

      setSuccessMessage("Identity verified successfully! Moving to Academic Profile...");
      setLoading(false);

      setTimeout(() => {
        if (onVerificationSuccess) {
          onVerificationSuccess(studentOnboardingData);
        } else {
          navigate("/onboarding?step=2");
        }
      }, 1000);
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage("Verification failed. Please check your network connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" data-node-id="7:2">
      {/* ========================================================================= */}
      {/* Top Step Status & Heading Block                                           */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-xs uppercase tracking-wider shadow-sm">
          <FaShieldAlt className="w-3.5 h-3.5 text-[#00658C]" />
          <span>Identity & Student Account Verification</span>
        </div>

        {/* Heading 1 */}
        <h1 className="text-3xl sm:text-4xl font-lilita text-[#001E2D] tracking-tight">
          Verify your email & student identity
        </h1>

        {/* Subtitle */}
        <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          We’ve sent a 6-digit verification code to your registered email address to secure your StudyBuddy Africa learning account.
        </p>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <AuthAlert
          message={errorMessage}
          variant="error"
          onDismiss={() => setErrorMessage("")}
          onRetry={/network|connection|try again/i.test(errorMessage) ? handleVerifyAndProceed : undefined}
        />
      )}

      {successMessage && (
        <AuthAlert
          message={successMessage}
          variant="success"
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ========================================================================= */}
      {/* Section 1: Email Verification Card                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        {/* Verification Target Banner */}
        <div className="bg-[#EAF5FF] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#01B0F1]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
              <FaEnvelope className="w-4 h-4" />
            </div>
            <div>
              <p className="font-josefin font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Verification Target
              </p>
              {isEditingEmail ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="px-2.5 py-1 text-sm bg-white border border-[#01B0F1] rounded-lg focus:outline-none font-josefin"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(tempEmail);
                      setIsEditingEmail(false);
                      setResendCooldown(0);
                    }}
                    className="text-xs bg-[#00658C] text-white px-2.5 py-1 rounded-lg font-bold font-josefin"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="font-josefin font-bold text-slate-900 text-sm sm:text-base">
                  {email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto font-josefin">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#DEF0FF] text-[#00658C] font-semibold text-[11px]">
              <FaCheck className="w-2.5 h-2.5" />
              {email.endsWith(".ke") ? "Student Domain" : "Verified Account"}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              className="text-xs text-[#00658C] hover:text-[#013349] font-bold underline underline-offset-2"
            >
              {isEditingEmail ? "Cancel" : "Change email"}
            </button>
          </div>
        </div>

        {/* 6-Digit OTP Entry Area */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <label className="font-josefin font-bold text-xs text-slate-700 tracking-wider uppercase">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-josefin">
              <FaClock className="w-3 h-3 text-[#00658C]" />
              <span>Expires in</span>
              <span className="font-bold text-[#00658C]">
                {formatTimer(expirySeconds)}
              </span>
            </div>
          </div>

          {/* 6 Individual Code Boxes */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 max-w-md">
            {otpDigits.map((digit, index) => {
              const isActive = activeSlot === index;
              return (
                <div key={index} className="relative flex-1">
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setActiveSlot(index)}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handlePasteCode(e.clipboardData.getData("text"));
                    }}
                    className={`w-full h-14 sm:h-16 text-center font-lilita text-2xl sm:text-3xl rounded-xl transition-all outline-none ${
                      digit
                        ? "bg-[#EAF5FF] text-[#001E2D] border-2 border-[#00658C]/40 shadow-inner"
                        : isActive
                          ? "bg-white text-slate-900 border-2 border-[#01B0F1] ring-4 ring-[#01B0F1]/20 shadow-md"
                          : "bg-slate-50 text-slate-400 border border-slate-300 hover:border-slate-400"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#2ABCFE] rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Resend Option */}
          <div className="pt-2 text-xs text-slate-600 font-josefin">
            Didn’t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-slate-500 font-medium">
                Resend via Email in <strong className="text-slate-900">0:{String(resendCooldown).padStart(2, "0")}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-bold text-[#00658C] hover:underline inline-flex items-center gap-1"
              >
                <FaRedo className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                Resend Code Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Section 2: Confirm Student Account Type & National ID / NEMIS             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-lilita text-[#001E2D] tracking-wide">
            2. Confirm Student Account Type & National ID / NEMIS
          </h2>
          <p className="font-josefin text-sm text-slate-600">
            Ensures official curriculum alignment, national benchmark syncing, and parent oversight options.
          </p>
        </div>

        {/* 2 Selectable Account Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Student Self-Registration */}
          <div
            onClick={() => setAccountType("student")}
            className={`cursor-pointer rounded-2xl p-5 transition-all relative ${
              accountType === "student"
                ? "bg-white border-2 border-[#2ABCFE] shadow-md ring-4 ring-[#2ABCFE]/15"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2ABCFE]/20 text-[#00658C] flex items-center justify-center">
                <FaGraduationCap className="w-5 h-5" />
              </div>
              {accountType === "student" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2ABCFE] text-white text-[11px] font-bold font-josefin">
                  <FaCheck className="w-2.5 h-2.5" />
                  Selected
                </span>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
              )}
            </div>

            <h3 className="font-lilita text-slate-900 text-lg tracking-wide">
              Student Self-Registration
            </h3>
            <p className="font-josefin text-xs text-slate-500 mt-1 leading-relaxed">
              For Junior Secondary (Grade 7-9) and Senior Secondary (Form 1-4) learners with student identification.
            </p>

            {/* Embedded NEMIS UPI field */}
            <div className="mt-4 bg-[#EAF5FF] rounded-xl p-3.5 space-y-2 border border-[#01B0F1]/20">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 tracking-wider uppercase font-josefin">
                <span>NEMIS UPI / Learner Assessment Number</span>
                <FaInfoCircle className="w-3 h-3 text-[#00658C]" />
              </div>
              <input
                type="text"
                value={nemisUpi}
                onChange={(e) => setNemisUpi(e.target.value)}
                placeholder="e.g. NEMIS-84920-K"
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:border-[#01B0F1] font-josefin"
              />
              <p className="text-[11px] text-slate-500 font-josefin">
                Found on your KICD report card, school ID badge, or KNEC register.
              </p>
            </div>
          </div>

          {/* Card B: Parent / Guardian Co-Managed Account */}
          <div
            onClick={() => setAccountType("parent_comanaged")}
            className={`cursor-pointer rounded-2xl p-5 transition-all relative ${
              accountType === "parent_comanaged"
                ? "bg-white border-2 border-[#2ABCFE] shadow-md ring-4 ring-[#2ABCFE]/15"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center">
                <FaUserFriends className="w-5 h-5" />
              </div>
              {accountType === "parent_comanaged" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2ABCFE] text-white text-[11px] font-bold font-josefin">
                  <FaCheck className="w-2.5 h-2.5" />
                  Selected
                </span>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
              )}
            </div>

            <h3 className="font-lilita text-slate-900 text-lg tracking-wide">
              Parent / Guardian Co-Managed Account
            </h3>
            <p className="font-josefin text-xs text-slate-500 mt-1 leading-relaxed">
              Includes weekly WhatsApp progress reports, study milestone alerts, and mock exam grade summaries.
            </p>

            {/* Embedded Weekly Digests Toggle */}
            <div className="mt-4 bg-[#EAF5FF] rounded-xl p-3.5 space-y-2 border border-[#01B0F1]/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-josefin">
                  Weekly WhatsApp digests
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWhatsappDigests(!whatsappDigests);
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    whatsappDigests ? "bg-[#2ABCFE]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      whatsappDigests ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-josefin">
                Instant mobile sync via Safaricom M-Pesa / Airtel Money linked mobile lines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Navigation Action Footer                                                  */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
        <Link
          to="/signup"
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors font-josefin order-2 sm:order-1"
        >
          <FaArrowLeft className="w-3 h-3" />
          Back to Login / Sign Up
        </Link>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleVerifyAndProceed}
            disabled={loading || otpDigits.join("").length < 4}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-lilita text-base tracking-wide text-white flex items-center justify-center gap-2 transition-all shadow-md ${
              loading || otpDigits.join("").length < 4
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#003D55] hover:bg-[#015575] hover:shadow-lg cursor-pointer"
            }`}
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
                Verifying Code...
              </span>
            ) : (
              <>
                <span>Verify & Proceed</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1AccountOtp;
