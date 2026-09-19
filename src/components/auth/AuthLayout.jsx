import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheck,
  FaUser,
  FaGraduationCap,
  FaEnvelope,
  FaRocket,
  FaStar,
  FaCheckCircle,
  FaQuoteLeft,
} from "react-icons/fa";
import { AUTH_CYAN, AUTH_NAVY } from "./authTheme";

/**
 * Onboarding step definitions for the dynamic left-pane stepper.
 */
const ONBOARDING_STEPS = [
  {
    number: 1,
    title: "Account Info",
    description: "Name, email & secure password",
    icon: FaUser,
  },
  {
    number: 2,
    title: "Role & Curriculum",
    description: "Learner, educator, or parent tracks",
    icon: FaGraduationCap,
  },
  {
    number: 3,
    title: "Email Verification",
    description: "Confirm identity with 6-digit OTP",
    icon: FaEnvelope,
  },
  {
    number: 4,
    title: "Welcome to Dashboard",
    description: "Instant access to personalized learning",
    icon: FaRocket,
  },
];

/**
 * AuthLayout: Modern 45/55 Responsive Split Layout for StudyBuddy Africa.
 *
 * Left Pane (40–45% Desktop): Dynamic brand hero with brand gradient, logo,
 * inspirational hero copy (on /login) or interactive 4-step vertical stepper (on /signup & /verify-code).
 * Stacks neatly as a top banner on mobile devices (md:hidden).
 *
 * Right Pane (55–60% Desktop): Spacious, centered white form container with generous breathing room.
 */
const AuthLayout = ({
  children,
  mode = "login", // "login" | "signup" | "verify" | "onboarding"
  activeStep = 1, // 1 to 4
  onStepClick = null,
  title,
  subtitle,
}) => {
  const isLoginMode = mode === "login";
  const currentStep = Math.max(1, Math.min(4, Number(activeStep) || 1));

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 text-slate-800 antialiased selection:bg-[#01B0F1]/20 selection:text-[#015575]">
      {/* ========================================================================= */}
      {/* Mobile Top Brand Banner (md:hidden)                                       */}
      {/* ========================================================================= */}
      <header className="md:hidden bg-gradient-to-r from-[#015575] via-[#01425c] to-[#01B0F1] text-white px-5 py-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            aria-label="StudyBuddy Africa Home"
          >
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>

          <span className="text-xs font-josefin text-cyan-200 tracking-wide font-medium">
            {isLoginMode ? "Learn. Teach. Excel." : `Step ${currentStep} of 4`}
          </span>
        </div>

        {/* Mobile Step Progress Indicator */}
        {!isLoginMode && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-josefin mb-1 text-white/90">
              <span className="font-semibold">
                {ONBOARDING_STEPS[currentStep - 1]?.title || "Onboarding"}
              </span>
              <span className="text-cyan-200">
                {Math.round((currentStep / 4) * 100)}% Complete
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {ONBOARDING_STEPS.map((step) => {
                const isCompleted = step.number < currentStep;
                const isActive = step.number === currentStep;
                return (
                  <div
                    key={step.number}
                    className={`rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#01B0F1]"
                        : isActive
                          ? "bg-white shadow-sm"
                          : "bg-white/20"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* Left Pane (40–45% Desktop Width) — Dynamic Brand Hero                      */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex md:w-[42%] lg:w-[40%] xl:w-[38%] min-h-screen bg-gradient-to-br from-[#015575] via-[#01425c] to-[#012f42] text-white p-8 lg:p-12 xl:p-14 flex-col justify-between relative overflow-hidden shadow-2xl z-10 shrink-0">
        {/* Ambient Decorative Background Shapes */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#01B0F1]/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#01B0F1]/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#015575]/40 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-50"
          aria-hidden="true"
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-[1.02]"
            aria-label="StudyBuddy Africa Home"
          >
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg group-hover:bg-white/15 transition-all">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-10 lg:h-11 w-auto object-contain drop-shadow"
              />
            </div>
          </Link>
        </div>

        {/* Dynamic Context: /login vs /signup & onboarding */}
        <div className="relative z-10 my-8 lg:my-auto py-4">
          {isLoginMode ? (
            /* ---------------- Login Hero Context ---------------- */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#01B0F1]/20 text-cyan-200 border border-[#01B0F1]/40 tracking-wider uppercase font-josefin">
                <span className="w-1.5 h-1.5 rounded-full bg-[#01B0F1] animate-pulse" />
                Learn. Teach. Excel.
              </div>

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-lilita text-white tracking-tight leading-[1.15]">
                Your place to learn, teach, and grow.
              </h1>

              <p className="font-josefin text-white/85 text-base lg:text-lg leading-relaxed max-w-md">
                Empowering students, parents, and educators across Africa with
                high-impact, curriculum-aligned interactive learning and peer
                collaboration.
              </p>

              {/* Clean Educational Vector Illustration */}
              <div className="pt-2">
                <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3.5 max-w-md shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#01B0F1]/20 text-[#01B0F1]">
                      <FaGraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-lilita text-sm text-white">
                        Curriculum-Aligned Learning
                      </p>
                      <p className="font-josefin text-xs text-white/70">
                        CBC, 8-4-4, University & Vocational tracks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#01B0F1]/20 text-[#01B0F1]">
                      <FaCheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-lilita text-sm text-white">
                        Verified African Educators
                      </p>
                      <p className="font-josefin text-xs text-white/70">
                        Top-rated subject matter experts and tutors
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#01B0F1]/20 text-[#01B0F1]">
                      <FaRocket className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-lilita text-sm text-white">
                        Interactive Collaboration
                      </p>
                      <p className="font-josefin text-xs text-white/70">
                        Live sessions, smart quizzes & peer study groups
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ---------------- Signup & Onboarding Vertical Stepper ---------------- */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#01B0F1]/20 text-cyan-200 border border-[#01B0F1]/40 tracking-wider uppercase font-josefin">
                  Onboarding Funnel
                </span>
                <h2 className="text-2xl lg:text-3xl font-lilita text-white mt-2 mb-1">
                  Your Journey to Academic Excellence
                </h2>
                <p className="font-josefin text-white/80 text-sm lg:text-base">
                  Complete these quick steps to set up your personalized workspace.
                </p>
              </div>

              {/* Vertical Stepper Container */}
              <nav aria-label="Signup Progress" className="space-y-0 pt-2">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const isCompleted = step.number < currentStep;
                  const isActive = step.number === currentStep;
                  const isUpcoming = step.number > currentStep;
                  const StepIcon = step.icon;
                  const isLast = idx === ONBOARDING_STEPS.length - 1;

                  return (
                    <div key={step.number} className="relative">
                      {/* Vertical Connector Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[19px] top-10 w-[2px] h-10 transition-colors duration-300 ${
                            isCompleted ? "bg-[#01B0F1]" : "bg-white/15"
                          }`}
                          aria-hidden="true"
                        />
                      )}

                      <div
                        onClick={() => {
                          if (onStepClick && (isCompleted || isActive)) {
                            onStepClick(step.number);
                          }
                        }}
                        className={`flex items-start gap-4 pb-7 transition-all ${
                          onStepClick && isCompleted ? "cursor-pointer group" : ""
                        }`}
                      >
                        {/* Step Bubble / Node */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center font-lilita text-sm shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/40"
                              : isActive
                                ? "bg-white text-[#015575] ring-4 ring-[#01B0F1] shadow-xl shadow-[#01B0F1]/50 scale-105"
                                : "bg-white/10 border border-white/20 text-white/40"
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheck className="w-4 h-4 text-white" />
                          ) : (
                            <StepIcon
                              className={`w-4 h-4 ${
                                isActive ? "text-[#015575]" : "text-white/50"
                              }`}
                            />
                          )}
                        </div>

                        {/* Step Labels */}
                        <div className="pt-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm lg:text-base font-lilita tracking-wide ${
                                isCompleted
                                  ? "text-white group-hover:text-cyan-200 transition-colors"
                                  : isActive
                                    ? "text-white font-bold"
                                    : "text-white/40"
                              }`}
                            >
                              {`Step ${step.number}: ${step.title}`}
                            </h3>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#01B0F1] text-white shadow-sm font-josefin uppercase tracking-wider">
                                Current
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-josefin text-xs mt-0.5 ${
                              isActive
                                ? "text-white/80"
                                : isCompleted
                                  ? "text-white/60"
                                  : "text-white/30"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </div>

        {/* Bottom: Social Proof / Community Trust Footnote */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-300 text-xs">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-josefin text-white/70">
              Trusted by 50,000+ African learners & educators
            </span>
          </div>
          <p className="font-josefin text-xs text-white/60 mt-1 italic flex items-center gap-1.5">
            <FaQuoteLeft className="w-2.5 h-2.5 opacity-50 shrink-0" />
            "StudyBuddy makes quality education truly accessible everywhere."
          </p>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Right Pane (55–60% Desktop Width) — Clean Form Container                   */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full md:w-[58%] lg:w-[60%] xl:w-[62%] min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8 md:p-10 lg:p-12 my-auto"
        >
          {/* Form Header (if provided) */}
          {(title || subtitle) && (
            <div className="text-center mb-6 sm:mb-8">
              {title && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#015575] font-lilita mb-2 tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600 font-josefin text-sm sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form Children */}
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AuthLayout;
