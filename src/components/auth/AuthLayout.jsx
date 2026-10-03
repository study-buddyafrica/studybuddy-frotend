import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaArrowLeft,
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
 */
const AuthLayout = ({
  children,
  mode = "login", // "login" | "signup" | "verify" | "onboarding"
  activeStep = 1, // 1 to 4
  onStepClick = null,
  title,
  subtitle,
}) => {
  const navigate = useNavigate();
  const isLoginMode = mode === "login";
  const isSignupMode = mode === "signup";
  const isSimpleHero = isLoginMode || isSignupMode;
  const isStepperMode = !isSimpleHero;
  const currentStep = Math.max(1, Math.min(4, Number(activeStep) || 1));

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-800 antialiased selection:bg-[#01B0F1]/20 selection:text-[#015575] md:flex-row">
      {/* ========================================================================= */}
      {/* Mobile Top Brand Banner (md:hidden)                                       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#015575] via-[#01425c] to-[#01B0F1] px-5 py-4 text-white shadow-md md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-josefin text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/20"
          >
            <FaArrowLeft className="text-[10px]" />
            Back
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
            aria-label="StudyBuddy Africa Home"
          >
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>

          <span className="max-w-[5.5rem] text-right font-josefin text-[10px] font-medium tracking-wide text-cyan-200 sm:max-w-none sm:text-xs">
            {isLoginMode
              ? "Learn. Teach. Excel."
              : isSignupMode
                ? "Join StudyBuddy"
                : `Step ${currentStep} of 4`}
          </span>
        </div>

        {isStepperMode && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between font-josefin text-xs text-white/90">
              <span className="font-semibold">
                {ONBOARDING_STEPS[currentStep - 1]?.title || "Onboarding"}
              </span>
              <span className="text-cyan-200">
                {Math.round((currentStep / 4) * 100)}% Complete
              </span>
            </div>
            <div className="grid h-1.5 w-full grid-cols-4 gap-1.5">
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
      {/* Left Pane — Brand Hero                                                    */}
      {/* ========================================================================= */}
      <aside className="relative z-10 hidden min-h-screen shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#015575] via-[#01425c] to-[#012f42] p-8 text-white shadow-2xl md:flex md:w-[42%] lg:w-[40%] lg:p-12 xl:w-[38%] xl:p-14">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#01B0F1]/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#01B0F1]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-[#015575]/40 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] opacity-50 [background-size:20px_20px]"
          aria-hidden="true"
        />

        {/* Top: Back (above logo) + Brand Logo */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex w-fit items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-2 font-josefin text-sm font-medium text-white/95 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <FaArrowLeft className="text-xs opacity-90" />
          Back
        </button>
        <div className="relative z-10">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 transition-transform hover:scale-[1.02]"
            aria-label="StudyBuddy Africa Home"
          >
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 shadow-lg backdrop-blur-md transition-all group-hover:bg-white/15">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-10 w-auto object-contain drop-shadow lg:h-11"
              />
            </div>
          </Link>
        </div>

        {/* Dynamic Context */}
        <div className="relative z-10 my-8 py-4 lg:my-auto">
          {isSimpleHero ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#01B0F1]/40 bg-[#01B0F1]/20 px-3.5 py-1 font-josefin text-xs font-semibold uppercase tracking-wider text-cyan-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#01B0F1]" />
                {isLoginMode ? "Learn. Teach. Excel." : "Start Your Journey"}
              </div>

              <h1 className="font-lilita text-3xl leading-[1.15] tracking-tight text-white lg:text-4xl xl:text-5xl">
                {isLoginMode
                  ? "Your place to learn, teach, and grow."
                  : "Join Africa's leading collaborative learning network."}
              </h1>

              <p className="max-w-md font-josefin text-base leading-relaxed text-white/85 lg:text-lg">
                {isLoginMode
                  ? "Empowering students, parents, and educators across Africa with high-impact, curriculum-aligned interactive learning and peer collaboration."
                  : "Connect with certified African educators, master your national syllabus, and collaborate with thousands of ambitious learners."}
              </p>

              <div className="pt-2">
                <div className="max-w-md space-y-3.5 rounded-2xl border border-white/15 bg-white/5 p-5 shadow-inner backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#01B0F1]/20 p-2 text-[#01B0F1]">
                      <FaGraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-lilita text-sm text-white">
                        Curriculum-Aligned Learning
                      </p>
                      <p className="font-josefin text-xs text-white/70">
                        CBC, 8-4-4, Cambridge & IGCSE tracks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#01B0F1]/20 p-2 text-[#01B0F1]">
                      <FaCheckCircle className="h-5 w-5" />
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
                    <div className="rounded-xl bg-[#01B0F1]/20 p-2 text-[#01B0F1]">
                      <FaRocket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-lilita text-sm text-white">
                        Interactive Live Classrooms
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
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#01B0F1]/40 bg-[#01B0F1]/20 px-3.5 py-1 font-josefin text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Onboarding Funnel
                </span>
                <h2 className="mb-1 mt-2 font-lilita text-2xl text-white lg:text-3xl">
                  Your Journey to Academic Excellence
                </h2>
                <p className="font-josefin text-sm text-white/80 lg:text-base">
                  Complete these quick steps to set up your personalized
                  workspace.
                </p>
              </div>

              <nav aria-label="Signup Progress" className="space-y-0 pt-2">
                {ONBOARDING_STEPS.map((step, idx) => {
                  const isCompleted = step.number < currentStep;
                  const isActive = step.number === currentStep;
                  const StepIcon = step.icon;
                  const isLast = idx === ONBOARDING_STEPS.length - 1;

                  return (
                    <div key={step.number} className="relative">
                      {!isLast && (
                        <div
                          className={`absolute left-[19px] top-10 h-10 w-[2px] transition-colors duration-300 ${
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
                          onStepClick && isCompleted
                            ? "group cursor-pointer"
                            : ""
                        }`}
                      >
                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-lilita text-sm transition-all duration-300 ${
                            isCompleted
                              ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/40"
                              : isActive
                                ? "scale-105 bg-white text-[#015575] shadow-xl shadow-[#01B0F1]/50 ring-4 ring-[#01B0F1]"
                                : "border border-white/20 bg-white/10 text-white/40"
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheck className="h-4 w-4 text-white" />
                          ) : (
                            <StepIcon
                              className={`h-4 w-4 ${
                                isActive ? "text-[#015575]" : "text-white/50"
                              }`}
                            />
                          )}
                        </div>

                        <div className="min-w-0 pt-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-lilita text-sm tracking-wide lg:text-base ${
                                isCompleted
                                  ? "text-white transition-colors group-hover:text-cyan-200"
                                  : isActive
                                    ? "font-bold text-white"
                                    : "text-white/40"
                              }`}
                            >
                              {`Step ${step.number}: ${step.title}`}
                            </h3>
                            {isActive && (
                              <span className="rounded-full bg-[#01B0F1] px-2 py-0.5 font-josefin text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                                Current
                              </span>
                            )}
                          </div>
                          <p
                            className={`mt-0.5 font-josefin text-xs ${
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

        <div className="relative z-10 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-xs text-amber-300">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="font-josefin text-xs text-white/70">
              Trusted by 50,000+ African learners & educators
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 font-josefin text-xs italic text-white/60">
            <FaQuoteLeft className="h-2.5 w-2.5 shrink-0 opacity-50" />
            &quot;StudyBuddy makes quality education truly accessible
            everywhere.&quot;
          </p>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Right Pane — Form                                                         */}
      {/* ========================================================================= */}
      <main className="flex min-h-screen w-full flex-1 items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-4 sm:p-6 md:w-[58%] md:p-8 lg:w-[60%] lg:p-12 xl:w-[62%] xl:p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="my-auto w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8 md:p-10 lg:p-12"
        >
          {(title || subtitle) && (
            <div className="mb-6 text-center sm:mb-8">
              {title && (
                <h2 className="mb-2 font-lilita text-2xl font-bold tracking-tight text-[#015575] sm:text-3xl lg:text-4xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="font-josefin text-sm text-gray-600 sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AuthLayout;
