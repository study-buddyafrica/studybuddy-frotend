import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaRedo
} from "react-icons/fa";
import { AuthAlert } from "../auth";
import { FHOST, decodeJwtToken } from "../constants/Functions";
import { authStorage } from "../../services/authStorage";

/**
 * Step 1 - TEACHER Account & OTP Verification
 * Minimal, streamlined verification screen
 */
const Step1TeacherAccountOtp = ({
  email: initialEmail = "",
  phone: initialPhone = "",
  registrationData = null,
  onVerificationSuccess = null,
}) => {
  // Contact details state
  const [email, setEmail] = useState(
    initialEmail ||
      registrationData?.email ||
      "eli.muthoka@studybuddy.africa",
  );
  const [phone, setPhone] = useState(
    initialPhone ||
      registrationData?.phone ||
      registrationData?.phone_number ||
      "+254 712 345 678",
  );

  // Inline editing states for Email and Phone
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);

  // 6-digit OTP code state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [activeSlot, setActiveSlot] = useState(0);
  const inputRefs = useRef([]);

  // Timer states (14:52 expiry = 892 seconds, 45s resend cooldown)
  const [expirySeconds, setExpirySeconds] = useState(892);
  const [resendCooldown, setResendCooldown] = useState(45);

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

  // Countdown timer for resend cooldown
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

    // Handle full paste into one slot
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

  // Resend OTP Action
  const handleResendCode = async () => {
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
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccessMessage(`A fresh verification code was sent to ${email} and ${phone}.`);
        setResendCooldown(60);
        setExpirySeconds(892);
      } else {
        setErrorMessage(data?.detail || data?.message || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error when resending code. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  // Save edited email
  const handleSaveEmail = () => {
    if (tempEmail && tempEmail.includes("@")) {
      setEmail(tempEmail);
      setIsEditingEmail(false);
      setSuccessMessage("Educator email updated.");
      setResendCooldown(0);
    } else {
      setErrorMessage("Please enter a valid educator email address.");
    }
  };

  // Save edited phone
  const handleSavePhone = () => {
    if (tempPhone && tempPhone.length >= 10) {
      setPhone(tempPhone);
      setIsEditingPhone(false);
      setSuccessMessage("M-PESA payout phone updated.");
    } else {
      setErrorMessage("Please enter a valid Kenyan phone number (e.g. +254 7XX XXX XXX).");
    }
  };

  // Submit / Verify Action
  const handleVerifyAndProceed = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const fullCode = otpDigits.join("");
    if (fullCode.length < 4) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
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
        // Fallback for development/testing if test OTP is used
        if (process.env.NODE_ENV === "development" && (fullCode === "123456" || fullCode === "000000")) {
          console.info("[Dev Mode] Bypassing OTP check with test code:", fullCode);
        } else {
          const detailMsg =
            confirmData?.errors?.[0]?.detail ||
            confirmData?.detail ||
            confirmData?.message ||
            "Invalid or expired verification code. Please check and try again.";
          setErrorMessage(detailMsg);
          setLoading(false);
          return;
        }
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
          phone_number: phone.trim(),
          first_name: regData.first_name || "Mwalimu",
          last_name: regData.last_name || "Educator",
          username: regData.username || email.split("@")[0],
          password: regData.password,
          confirm_password: regData.confirm_password || regData.password,
          role: "teacher",
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
          console.warn("Teacher registration warning:", regErrData?.detail || regErrData?.message);
        } else {
          sessionStorage.setItem("userRegistered", "true");
        }

        // 3. Obtain JWT tokens and persist in authStorage (SAD §7 & Directives)
        try {
          const tokenRes = await fetch(`${FHOST}/api/token/request/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: email.trim(),
              password: regData.password,
            }),
          });
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            if (tokenData.access) {
              authStorage.setTokens(tokenData.access, tokenData.refresh);
              const decoded = decodeJwtToken(tokenData.access);
              const userObj = {
                email: email.trim(),
                role: "teacher",
                onboarding_step: "step_2_profile",
                ...(decoded || {}),
              };
              authStorage.setUserInfo(userObj);
              sessionStorage.setItem("userRole", "teacher");
            }
          }
        } catch (tokenErr) {
          console.warn("Teacher JWT acquisition warning in Step 1:", tokenErr);
        }
      }

      sessionStorage.setItem("teacherVerifiedEmail", email);
      sessionStorage.setItem("teacherVerifiedPhone", phone);

      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    } catch (err) {
      setErrorMessage("Network error during verification. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ========================================================================= */}
      {/* Top Step Status & Heading Block                                           */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="space-y-3">
          {/* Security Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEF0FF] text-[#00658C] font-josefin font-semibold text-xs uppercase tracking-wider shadow-sm">
            <FaShieldAlt className="w-3.5 h-3.5 text-[#00658C]" />
            <span>Official Educator Account Verification</span>
          </div>

          {/* Heading 1 */}
          <h1 className="text-3xl sm:text-4xl font-lilita text-[#001E2D] tracking-tight">
            Verify Your Educator Account
          </h1>

          {/* Subtitle */}
          <p className="font-josefin text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            We sent a 6-digit verification code to your registered email and phone number to secure your educator profile and lesson payouts.
          </p>
        </div>

        {/* Auth Alerts */}
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

        {/* ========================================================================= */}
        {/* Verification Card (M-PESA Payout Line + 6-Digit OTP)               */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          {/* Verification Target Cards (Email + M-PESA Phone) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Verification: Educator Email */}
            <div className="bg-[#EAF5FF] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 border border-[#01B0F1]/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-josefin font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    Verification Target &bull; Email
                  </p>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-[#01B0F1] rounded-lg focus:outline-none font-josefin w-full"
                      />
                      <button
                        type="button"
                        onClick={handleSaveEmail}
                        className="text-xs bg-[#00658C] text-white px-2.5 py-1 rounded-lg font-bold font-josefin"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="font-josefin font-bold text-slate-900 text-sm sm:text-base truncate mt-0.5">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-josefin shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="text-xs text-[#00658C] hover:text-[#013349] font-bold underline underline-offset-2"
                >
                  {isEditingEmail ? "Cancel" : "Change"}
                </button>
              </div>
            </div>

            {/* M-PESA Phone Payout Line */}
            <div className="bg-[#EAF5FF] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 border border-[#01B0F1]/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#00658C]/10 flex items-center justify-center text-[#00658C] shrink-0">
                  <FaPhoneAlt className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-josefin font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    M-PESA Payout Line
                  </p>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-[#01B0F1] rounded-lg focus:outline-none font-josefin w-full"
                      />
                      <button
                        type="button"
                        onClick={handleSavePhone}
                        className="text-xs bg-[#00658C] text-white px-2.5 py-1 rounded-lg font-bold font-josefin"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="font-josefin font-bold text-slate-900 text-sm sm:text-base truncate mt-0.5">
                      {phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-josefin shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className="text-xs text-[#00658C] hover:text-[#013349] font-bold underline underline-offset-2"
                >
                  {isEditingPhone ? "Cancel" : "Change"}
                </button>
              </div>
            </div>
          </div>

          {/* 6-Digit OTP Entry Area */}
          <div className="space-y-4 pt-2">
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
                  Resend Code in <strong className="text-slate-900">0:{String(resendCooldown).padStart(2, "0")}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
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
      </div>

      {/* ========================================================================= */}
      {/* Navigation Action Footer.                                                 */}
      {/* ========================================================================= */}
      <div className="sticky bottom-0 bg-[#F8FAFC]/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-200/90 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 font-josefin mt-auto">
        <Link
          to="/login"
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-2 sm:order-1"
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
                <span>Verify & Proceed to KYC</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1TeacherAccountOtp;
