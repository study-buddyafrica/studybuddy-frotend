import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaShieldAlt,
  FaStar,
  FaQuestionCircle,
  FaSignOutAlt,
  FaWhatsapp,
  FaGraduationCap,
  FaBook,
  FaRocket,
} from "react-icons/fa";

export const ONBOARDING_STEPS_CONFIG = [
  {
    number: 1,
    title: "Verification",
    subtitle: "Account & Email OTP",
    icon: FaShieldAlt,
  },
  {
    number: 2,
    title: "Academic Profile",
    subtitle: "Curriculum & Grade",
    icon: FaGraduationCap,
  },
  {
    number: 3,
    title: "Subjects & Goals",
    subtitle: "Tailored study syllabus",
    icon: FaBook,
  },
  {
    number: 4,
    title: "Dashboard Launch",
    subtitle: "Instant personalized access",
    icon: FaRocket,
  },
];

/**
 * OnboardingLayout: Streamlined container matching the StudyBuddy design tokens.
 * Uses font-lilita for headers/steps and font-josefin for body/labels.
 */
const OnboardingLayout = ({
  children,
  currentStep = 1,
  onStepClick = null,
  onSaveAndExit = null,
}) => {
  const navigate = useNavigate();
  const stepPercentage = Math.round((currentStep / 4) * 100);

  const handleDefaultSaveAndExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] text-slate-800 antialiased selection:bg-[#01B0F1]/20 selection:text-[#015575]">
      {/* ========================================================================= */}
      {/* Mobile Top Header (md:hidden)                                             */}
      {/* ========================================================================= */}
      <header className="md:hidden bg-gradient-to-r from-[#013349] via-[#01425c] to-[#015575] text-white px-5 py-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-josefin text-cyan-200 tracking-wider uppercase font-semibold">
              Step {currentStep} of 4 ({stepPercentage}%)
            </span>
            <button
              onClick={handleDefaultSaveAndExit}
              className="text-xs text-white/80 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-josefin"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Mobile Step Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-josefin mb-1 text-white/90">
            <span className="font-semibold">
              {ONBOARDING_STEPS_CONFIG[currentStep - 1]?.title || "Onboarding"}
            </span>
            <span className="text-cyan-200">
              {ONBOARDING_STEPS_CONFIG[currentStep - 1]?.subtitle}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
            {ONBOARDING_STEPS_CONFIG.map((step) => {
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
      </header>

      {/* ========================================================================= */}
      {/* Desktop Left Rail — 340–380px Sticky Anchor                              */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex md:w-[340px] lg:w-[360px] xl:w-[380px] bg-[#013349] text-white p-7 lg:p-9 flex-col justify-between relative overflow-hidden shadow-2xl z-20 shrink-0 min-h-screen">
        {/* Ambient Decorative Shapes */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#01B0F1]/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-[#01B0F1]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top: Brand Logo Only (matching Login/Signup layout) */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-[1.02]"
            aria-label="StudyBuddy Africa Home"
          >
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-md">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa Logo"
                className="h-9 w-auto object-contain drop-shadow"
              />
            </div>
          </Link>
        </div>

        {/* Middle: 4-Step Vertical Stepper */}
        <div className="relative z-10 my-8 py-2">
          <nav aria-label="Onboarding Progress" className="space-y-0">
            {ONBOARDING_STEPS_CONFIG.map((step, idx) => {
              const isCompleted = step.number < currentStep;
              const isActive = step.number === currentStep;
              const isLast = idx === ONBOARDING_STEPS_CONFIG.length - 1;

              return (
                <div key={step.number} className="relative">
                  {/* Vertical Connector Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[18px] top-9 w-[2px] h-10 transition-colors duration-300 ${
                        isCompleted ? "bg-[#01B0F1]" : "bg-white/20"
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  <div
                    onClick={() => {
                      if (onStepClick && isCompleted) {
                        onStepClick(step.number);
                      }
                    }}
                    className={`flex items-start gap-4 pb-7 transition-all ${
                      isCompleted ? "cursor-pointer group" : ""
                    }`}
                  >
                    {/* Step Node / Circle */}
                    <div
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-lilita text-sm shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/50 ring-4 ring-[#01B0F1]/30 scale-105"
                          : isCompleted
                            ? "bg-[#01B0F1] text-white shadow-md"
                            : "bg-white/10 border border-white/20 text-[#B4C8DC]"
                      }`}
                    >
                      {isCompleted ? (
                        <FaCheck className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span>{step.number}</span>
                      )}
                    </div>

                    {/* Step Labels */}
                    <div className="pt-0.5 min-w-0">
                      <p
                        className={`text-sm font-lilita tracking-wide leading-tight ${
                          isActive
                            ? "text-white"
                            : isCompleted
                              ? "text-white/90 group-hover:text-cyan-200 transition-colors"
                              : "text-[#B4C8DC]"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`font-josefin text-xs mt-0.5 leading-snug ${
                          isActive
                            ? "text-cyan-200"
                            : isCompleted
                              ? "text-[#8CA5BE]"
                              : "text-[#8CA5BE]/70"
                        }`}
                      >
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Social Proof Testimonial Card & Help Link */}
        <div className="relative z-10 space-y-4">
          <div className="backdrop-blur-md bg-white/5 border border-white/15 rounded-2xl p-4 space-y-2.5 shadow-inner">
            {/* Star Rating */}
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3 h-3 text-[#FFB800]" />
              ))}
              <span className="font-josefin font-bold text-xs text-white ml-1">
                4.9/5
              </span>
            </div>

            {/* Quote */}
            <p className="font-josefin text-xs text-[#C4E7FF] leading-relaxed">
              "StudyBuddy helped me prepare for my KCSE revision with pinpoint precision. Highly recommended!"
            </p>

            {/* Reviewer Portraits + Count */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  src="/images/std1.jpeg"
                  alt="Student reviewer"
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#003d55] object-cover"
                />
                <img
                  src="/images/std2.jpeg"
                  alt="Student reviewer"
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#003d55] object-cover"
                />
                <img
                  src="/images/std3.jpeg"
                  alt="Student reviewer"
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#003d55] object-cover"
                />
              </div>
              <span className="font-josefin font-semibold text-[11px] text-[#81CFFF]">
                45,000+ students
              </span>
            </div>
          </div>

          {/* Need Assistance Action */}
          <div className="flex items-center justify-between px-1 text-xs font-josefin">
            <span className="text-[#91CEF3]/80">
              Need assistance?
            </span>
            <a
              href="https://wa.me/254700000000?text=Hi%20StudyBuddy%2C%20I%20need%20help%20with%20onboarding"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#81CFFF] hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              Need Help?
            </a>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Right Focus Surface — Clean #F8FAFC Canvas with Top Bar                    */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex h-16 items-center justify-between px-8 lg:px-12 border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-10 font-josefin">
          {/* Left: Step Indicator & Mini Progress Bar */}
          <div className="flex items-center gap-5">
            <div>
              <p className="font-lilita text-[12px] text-[#00658C] tracking-wider uppercase leading-none">
                STEP {currentStep} OF 4
              </p>
              <p className="font-josefin font-semibold text-xs text-slate-600 mt-1 leading-none">
                {stepPercentage}% Completed
              </p>
            </div>
            <div className="w-36 h-2 bg-[#D2ECFF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2ABCFE] rounded-full transition-all duration-500"
                style={{ width: `${stepPercentage}%` }}
              />
            </div>
          </div>

          {/* Right: Global Actions (Help + Save & Exit) */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-josefin"
            >
              <FaQuestionCircle className="w-3.5 h-3.5 text-[#00658C]" />
              <span>Help</span>
            </a>

            <button
              type="button"
              onClick={handleDefaultSaveAndExit}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#003D55] text-white hover:bg-[#015575] transition-all shadow-sm font-josefin"
            >
              <FaSignOutAlt className="w-3 h-3" />
              <span>Save & Exit</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 md:px-10 lg:px-14 py-8 lg:py-10 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
