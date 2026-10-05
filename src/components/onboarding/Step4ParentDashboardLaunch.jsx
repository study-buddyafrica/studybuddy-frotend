import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRocket,
  FaArrowLeft,
  FaArrowRight,
  FaWallet,
  FaCheckCircle,
  FaRegCircle,
  FaCreditCard,
  FaShieldAlt,
  FaBell,
  FaWhatsapp,
  FaEnvelope,
  FaCommentDots,
  FaStar,
  FaTimes,
  FaMobileAlt,
  FaSpinner,
} from "react-icons/fa";
import { authStorage } from "../../services/authStorage";
import { onboardingService, getErrorMessage } from "../../services/onboardingService";

/**
 * Step 4 - PARENT Family Wallet & Portal Launch
 */
const Step4ParentDashboardLaunch = ({
  registrationData = null,
  onBack = null,
}) => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Retrieve saved onboarding data from session storage with robust fallbacks
  // ---------------------------------------------------------------------------
  const parentRegistrationData = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("parentRegistrationData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const learnerData = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("parentLearnerData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const curriculumData = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("parentCurriculumData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Guardian details
  const guardianName =
    parentRegistrationData?.fullName ||
    (registrationData?.first_name
      ? `${registrationData.first_name} ${registrationData.last_name || ""}`.trim()
      : "") ||
    registrationData?.full_name ||
    "Eli Keli";

  const guardianPhone =
    parentRegistrationData?.phone ||
    registrationData?.phone ||
    registrationData?.phone_number ||
    "+254 712 345 678";

  // Learner details
  const learnerFullName = learnerData?.fullName || "Amani Baraza Kimani";
  const learnerSchool = learnerData?.school || "Makini School, Nairobi";
  const learnerGrade =
    learnerData?.gradeStage || "Grade 7 CBC (Junior Secondary)";
  const learnerInitials = learnerData?.avatarInitials || "AB";

  // Curriculum details
  const focusSubjects =
    curriculumData?.focusSubjects && curriculumData.focusSubjects.length > 0
      ? curriculumData.focusSubjects
      : [
          "Mathematics",
          "Integrated Science",
          "English Language",
          "Coding & Robotics",
        ];

  const sessionsPerWeek = curriculumData?.sessionsPerWeek || 3;
  const deliveryModeText =
    curriculumData?.deliveryMode === "in-person"
      ? "Physical In-Person Home Visits"
      : curriculumData?.deliveryMode === "hybrid"
        ? "Hybrid Flexible Model"
        : "Online 1-on-1 Interactive";

  // ---------------------------------------------------------------------------
  // Component State
  // ---------------------------------------------------------------------------
  // Pre-funding package selection: "starter" | "family_focus" | "monthly" | "custom"
  const [selectedPackage, setSelectedPackage] = useState("family_focus");
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [appliedCustomAmount, setAppliedCustomAmount] = useState(null);

  // Payment method: "mpesa" | "card"
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  // Guardian alert toggles
  const [alerts, setAlerts] = useState({
    whatsapp: true,
    email: true,
    sms: true,
  });

  const toggleAlert = (key) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pre-funding packages definition
  const packages = useMemo(() => [
    {
      id: "starter",
      title: "Starter",
      amount: 1000,
      description: "1 live lesson + 7 days AI practice credits for your learner.",
    },
    {
      id: "family_focus",
      title: "Family Focus",
      amount: 2500,
      description: "Most Popular: 3 live sessions + full AI homework helper access.",
      recommended: true,
    },
    {
      id: "monthly",
      title: "Monthly Plan",
      amount: 5000,
      description: "6 live lessons + monthly comprehensive CBC competency audit.",
    },
  ], []);

  // Resolve current active amount
  const currentAmount = useMemo(() => {
    if (selectedPackage === "custom") {
      return appliedCustomAmount || 2500;
    }
    const found = packages.find((p) => p.id === selectedPackage);
    return found ? found.amount : 2500;
  }, [selectedPackage, appliedCustomAmount, packages]); // React Hook useMemo has a missing dependency: 'packages'. Either include it or remove the dependency array.

  // Handle custom amount application
  const handleApplyCustom = (e) => {
    if (e) e.preventDefault();
    const val = parseInt(customAmountInput.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(val) && val >= 500) {
      setAppliedCustomAmount(val);
      setSelectedPackage("custom");
      setSuccessBanner(`Custom pre-funding amount set to KES ${val.toLocaleString()}`);
    } else {
      setErrorBanner("Minimum custom funding amount is KES 500.");
    }
  };

  // ---------------------------------------------------------------------------
  // STK Push / Payment Processing State
  // ---------------------------------------------------------------------------
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStkModal, setShowStkModal] = useState(false);
  const [stkState, setStkState] = useState("prompt"); // "prompt" | "authorizing" | "confirmed"
  const [successBanner, setSuccessBanner] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

  const completeBackendOnboarding = async () => {
    let targetUrl = "/parent-dashboard/home";
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
        console.warn("Parent complete onboarding API warning:", err);
        const msg = getErrorMessage(err, "Failed to complete onboarding on server.");
        if (err.response?.status !== 400) {
          setErrorBanner(msg);
        }
      }
    }
    return targetUrl;
  };

  // Direct skip to dashboard
  const handleSkipToDashboard = async () => {
    setIsProcessing(true);
    const targetUrl = await completeBackendOnboarding();
    try {
      localStorage.setItem(
        "parentOnboardingComplete",
        JSON.stringify({
          completedAt: new Date().toISOString(),
          walletFunded: false,
          amountFunded: 0,
          alerts,
          learnerData,
          curriculumData,
        })
      );
      sessionStorage.removeItem("pendingRegistration");
    } catch (err) {
      console.warn("Could not write onboarding completion:", err);
    }
    setIsProcessing(false);
    navigate(targetUrl);
  };

  // Launch Funding Flow
  const handleLaunchPayment = () => {
    setErrorBanner("");
    setSuccessBanner("");

    if (paymentMethod === "mpesa") {
      setShowStkModal(true);
      setStkState("prompt");
    } else {
      // Simulate Paystack Card Flow
      setIsProcessing(true);
      setTimeout(() => {
        saveAndRedirect(currentAmount);
      }, 1500);
    }
  };

  // Authorize simulated STK push
  const handleConfirmStkPush = () => {
    setStkState("authorizing");
    setTimeout(() => {
      setStkState("confirmed");
      setTimeout(() => {
        saveAndRedirect(currentAmount);
      }, 1200);
    }, 2000);
  };

  const saveAndRedirect = async (amount) => {
    setIsProcessing(true);
    const targetUrl = await completeBackendOnboarding();
    try {
      localStorage.setItem(
        "parentOnboardingComplete",
        JSON.stringify({
          completedAt: new Date().toISOString(),
          walletFunded: true,
          amountFunded: amount,
          paymentMethod,
          alerts,
          learnerData,
          curriculumData,
        })
      );
      sessionStorage.removeItem("pendingRegistration");
    } catch (err) {
      console.warn("Could not save parent completion:", err);
    }
    setIsProcessing(false);
    navigate(targetUrl);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Header Block */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5FF] border border-[#01B0F1]/20 text-[#00658C] text-xs font-josefin font-bold">
          <FaRocket className="text-xs text-[#01B0F1]" />
          <span>FINAL STEP &bull; FAMILY WALLET &amp; LAUNCH</span>
        </div>

        <h1 className="font-lilita text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
          Fund Your Family Wallet &amp; Activate Your Portal
        </h1>

        <p className="font-josefin text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Pre-fund your secure Family Shared Wallet to seamlessly book 1-on-1 sessions, unlock AI homework practice for your learner, and activate your parent oversight dashboard.
        </p>
      </div>

      {/* Status Banners */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-josefin font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner("")}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-josefin font-semibold flex items-center justify-between">
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={() => setErrorBanner("")}
            className="text-rose-600 hover:text-rose-800 p-1"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ===================================================================== */}
        {/* LEFT COLUMN: Family Wallet, Packages, Payment & Notification Alerts   */}
        {/* ===================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Family Shared Wallet & Pre-Funding */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7 space-y-6">
            {/* Primary Guardian Wallet Status Header */}
            <div className="bg-[#EAF5FF]/60 border border-[#01B0F1]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#003D55] text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  <FaWallet />
                </div>
                <div>
                  <span className="text-[10px] font-josefin font-bold uppercase tracking-wider text-slate-500 block">
                    Primary Guardian Wallet
                  </span>
                  <p className="font-lilita text-xl sm:text-2xl text-slate-900 tracking-tight mt-0.5">
                    KES 0.00
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-josefin font-semibold text-slate-700">
                  Account: <strong>{guardianName}</strong>
                </span>
              </div>
            </div>

            {/* Select Pre-Funding Package */}
            <div className="space-y-3">
              <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                Select Pre-Funding Package
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        setAppliedCustomAmount(null);
                      }}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#00658C] bg-[#F4FAFF] shadow-xs ring-2 ring-[#00658C]/10"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {/* Recommended Pill */}
                      {pkg.recommended && (
                        <div className="absolute -top-2.5 left-4">
                          <span className="bg-[#00658C] text-white text-[9px] font-josefin font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            Recommended
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-josefin font-bold text-slate-800">
                            {pkg.title}
                          </span>
                          {isSelected ? (
                            <FaCheckCircle className="text-[#00658C] text-sm" />
                          ) : (
                            <FaRegCircle className="text-slate-300 text-sm" />
                          )}
                        </div>

                        <p className="font-lilita text-xl sm:text-2xl text-slate-900 tracking-tight">
                          KES {pkg.amount.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-[11px] font-josefin text-slate-500 mt-2.5 leading-snug">
                        {pkg.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Input Bar */}
              <form onSubmit={handleApplyCustom} className="mt-3">
                <div
                  className={`flex items-center rounded-xl border transition-all ${
                    selectedPackage === "custom"
                      ? "border-[#00658C] ring-2 ring-[#00658C]/10 bg-[#F4FAFF]"
                      : "border-slate-200 bg-slate-50/50 focus-within:border-slate-400"
                  }`}
                >
                  <span className="font-lilita text-xs text-slate-600 pl-3.5 pr-2 select-none">
                    KES
                  </span>
                  <input
                    type="text"
                    value={customAmountInput}
                    onChange={(e) => setCustomAmountInput(e.target.value)}
                    placeholder="Or enter custom amount (min KES 500)"
                    className="flex-1 py-2.5 text-xs font-josefin text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="mr-1.5 px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-josefin font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>

            {/* Select Instant Payment Method */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-josefin font-bold text-slate-700 uppercase tracking-wider">
                Select Instant Payment Method
              </label>

              <div className="space-y-3">
                {/* 1. M-PESA Express */}
                <div
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    paymentMethod === "mpesa"
                      ? "border-[#01B0F1] bg-[#F4FAFF] shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* M-PESA Logo Badge */}
                    <div className="w-11 h-10 rounded-xl bg-[#00A859] text-white font-black text-[10px] tracking-tight flex items-center justify-center shrink-0 shadow-xs">
                      M-PESA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-lilita text-sm text-slate-900">
                          M-PESA Express (STK Push)
                        </h4>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-josefin font-bold px-2 py-0.5 rounded-full">
                          Instant 0% Fee
                        </span>
                      </div>
                      <p className="text-[11px] font-josefin text-slate-500 mt-0.5">
                        Prompt will be sent directly to your phone screen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {guardianPhone}
                    </span>
                    {paymentMethod === "mpesa" ? (
                      <FaCheckCircle className="text-[#01B0F1] text-base shrink-0" />
                    ) : (
                      <FaRegCircle className="text-slate-300 text-base shrink-0" />
                    )}
                  </div>
                </div>

                {/* 2. Visa / Mastercard / Debit Cards */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    paymentMethod === "card"
                      ? "border-[#01B0F1] bg-[#F4FAFF] shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg shrink-0">
                      <FaCreditCard />
                    </div>
                    <div>
                      <h4 className="font-lilita text-sm text-slate-900">
                        Visa / Mastercard / Debit Cards
                      </h4>
                      <p className="text-[11px] font-josefin text-slate-500 mt-0.5">
                        Processed securely via Paystack PCI-DSS Layer
                      </p>
                    </div>
                  </div>

                  <div>
                    {paymentMethod === "card" ? (
                      <FaCheckCircle className="text-[#01B0F1] text-base shrink-0" />
                    ) : (
                      <FaRegCircle className="text-slate-300 text-base shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 100% Escrow Protected Banner */}
            <div className="bg-[#EAF5FF]/80 border border-[#01B0F1]/20 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <FaShieldAlt className="text-[#00658C] text-lg shrink-0" />
              <p className="font-josefin text-xs text-slate-700 leading-snug">
                <strong>100% Escrow Protected:</strong> Funds remain securely in your control until session completion is approved by you.
              </p>
            </div>
          </div>

          {/* Card 2: Guardian Alerts & Progress Insights */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-lilita text-base sm:text-lg text-slate-900">
                  Guardian Alerts &amp; Progress Insights
                </h3>
                <p className="font-josefin text-xs text-slate-500 mt-0.5">
                  Stay engaged with real-time updates regarding your learner's academic trajectory.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EAF5FF] text-[#00658C] flex items-center justify-center text-sm shrink-0">
                <FaBell />
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* WhatsApp Alerts */}
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shrink-0">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h5 className="font-lilita text-xs sm:text-sm text-slate-900">
                      WhatsApp Instant Progress Reports
                    </h5>
                    <p className="font-josefin text-[11px] text-slate-500 leading-tight mt-0.5">
                      Real-time alerts when homework is submitted or test scores are ready ({guardianPhone}).
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleAlert("whatsapp")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    alerts.whatsapp ? "bg-[#003D55]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      alerts.whatsapp ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Email Digest */}
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00658C] flex items-center justify-center text-base shrink-0">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h5 className="font-lilita text-xs sm:text-sm text-slate-900">
                      Weekly CBC Strands &amp; Competency Email Digest
                    </h5>
                    <p className="font-josefin text-[11px] text-slate-500 leading-tight mt-0.5">
                      Comprehensive breakdown of strengths and areas for improvement sent every Sunday.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleAlert("email")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    alerts.email ? "bg-[#003D55]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      alerts.email ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* SMS Reminders */}
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shrink-0">
                    <FaCommentDots />
                  </div>
                  <div>
                    <h5 className="font-lilita text-xs sm:text-sm text-slate-900">
                      SMS Session Reminders
                    </h5>
                    <p className="font-josefin text-[11px] text-slate-500 leading-tight mt-0.5">
                      30-minute reminder text before scheduled live classroom sessions.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleAlert("sms")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    alerts.sms ? "bg-[#003D55]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      alerts.sms ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (STICKY): Enrolment Overview & Instant Activation        */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Card 1: ENROLMENT OVERVIEW */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-josefin font-bold text-slate-500 uppercase tracking-wider">
                Enrolment Overview
              </span>
              <span className="bg-[#EAF5FF] text-[#00658C] font-josefin font-bold text-[10px] px-2.5 py-1 rounded-full">
                Ready to Launch
              </span>
            </div>

            {/* Learner Capsule */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-[#003D55] text-white font-lilita text-sm flex items-center justify-center shrink-0 shadow-xs">
                {learnerInitials}
              </div>
              <div className="min-w-0">
                <h4 className="font-lilita text-sm sm:text-base text-slate-900 leading-tight">
                  {learnerFullName}
                </h4>
                <p className="font-josefin text-xs text-slate-500 leading-tight mt-0.5">
                  {learnerGrade}
                </p>
                <p className="font-josefin text-[11px] text-[#00658C] font-semibold mt-0.5">
                  {learnerSchool}
                </p>
              </div>
            </div>

            {/* Selected Focus Subjects */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-josefin font-bold uppercase tracking-wider text-slate-500 block">
                Selected Curriculums
              </span>
              <div className="flex flex-wrap gap-1.5">
                {focusSubjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="bg-[#EAF5FF] text-[#00658C] font-josefin font-bold text-[11px] px-2.5 py-1 rounded-lg"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Session Specs Box */}
            <div className="bg-[#EAF5FF]/60 border border-[#01B0F1]/20 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-josefin">
                <span className="text-slate-500">Session Rhythm</span>
                <span className="font-bold text-slate-800">
                  {sessionsPerWeek} Sessions / week
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-josefin">
                <span className="text-slate-500">Delivery Mode</span>
                <span className="font-bold text-slate-800">
                  {deliveryModeText}
                </span>
              </div>
            </div>

            {/* Features Bullet List */}
            <div className="space-y-2.5 pt-1 text-xs font-josefin text-slate-700">
              <div className="flex items-start gap-2.5">
                <FaCheckCircle className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>Instant Match with Top 5% CBC Vetted Tutors</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FaCheckCircle className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>Unlimited 24/7 AI Homework Practice</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FaCheckCircle className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>Parent Live Progress &amp; Attendance Dashboard</span>
              </div>
            </div>
          </div>

          {/* Card 2: INSTANT ACTIVATION Dark Card */}
          <div className="bg-[#003D55] text-white rounded-3xl p-5 sm:p-6 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-xs font-josefin font-black tracking-wider text-[#01B0F1] uppercase">
              <div className="w-5 h-5 rounded-full bg-[#01B0F1]/20 flex items-center justify-center text-[10px]">
                <FaStar />
              </div>
              <span>Instant Activation</span>
            </div>

            <p className="text-xs font-josefin text-slate-200 leading-relaxed">
              Completing your initial pre-funding instantly launches your Parent Dashboard and books your learner's initial diagnostic session.
            </p>

            <p className="text-[10px] font-josefin text-slate-400 pt-3 border-t border-white/10">
              Cancel or refund anytime within 14 days with zero penalties.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION NAVIGATION BUTTONS                                                 */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-josefin font-semibold transition-all cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Goals &amp; Curriculums</span>
        </button>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleSkipToDashboard}
            className="text-xs font-josefin font-bold text-slate-600 hover:text-slate-900 px-3 py-2 cursor-pointer transition-colors"
          >
            Skip Funding &amp; Go to Dashboard
          </button>

          <button
            type="button"
            onClick={handleLaunchPayment}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-[#003D55] hover:bg-[#015575] text-white font-lilita text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Fund &amp; Launch Parent Dashboard</span>
                <FaArrowRight className="text-xs text-[#01B0F1]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULATED M-PESA STK PUSH MODAL                                           */}
      {/* ========================================================================= */}
      {showStkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-8 rounded-lg bg-[#00A859] text-white font-black text-[10px] flex items-center justify-center">
                  M-PESA
                </div>
                <h3 className="font-lilita text-slate-900 text-base sm:text-lg">
                  STK Push Pre-Funding
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            {stkState === "prompt" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F4FAFF] border border-[#01B0F1]/30 text-center space-y-1">
                  <span className="text-[10px] font-josefin font-bold uppercase tracking-wider text-slate-500">
                    Amount to Pre-Fund
                  </span>
                  <p className="font-lilita text-2xl text-[#003D55]">
                    KES {currentAmount.toLocaleString()}
                  </p>
                  <p className="text-xs font-josefin text-slate-600">
                    Destination: <strong>StudyBuddy Escrow Trust</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <FaMobileAlt className="text-[#00A859] text-xl shrink-0" />
                  <div className="text-xs font-josefin text-slate-700">
                    Prompt sent to <strong>{guardianPhone}</strong>. Check your phone and enter your M-PESA PIN to authorize.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStkModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-josefin font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStkPush}
                    className="px-6 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#00924c] text-white text-xs font-lilita shadow-sm"
                  >
                    Authorize Demo PIN
                  </button>
                </div>
              </div>
            )}

            {stkState === "authorizing" && (
              <div className="py-8 text-center space-y-4">
                <FaSpinner className="animate-spin text-3xl text-[#00A859] mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-lilita text-slate-900 text-base">
                    Awaiting PIN Authorization...
                  </h4>
                  <p className="text-xs font-josefin text-slate-500">
                    Please approve the prompt on your mobile screen.
                  </p>
                </div>
              </div>
            )}

            {stkState === "confirmed" && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto animate-bounce">
                  <FaCheckCircle />
                </div>
                <div className="space-y-1">
                  <h4 className="font-lilita text-slate-900 text-lg">
                    Pre-Funding Confirmed!
                  </h4>
                  <p className="text-xs font-josefin text-slate-600">
                    KES {currentAmount.toLocaleString()} has been deposited into your Family Shared Wallet. Launching Parent Portal...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4ParentDashboardLaunch;
