import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import Step1AccountOtp from "./Step1AccountOtp";
import Step2AcademicProfile from "./Step2AcademicProfile";
import Step3SubjectsGoals from "./Step3SubjectsGoals";

/**
 * OnboardingWizard: Master container for the 4-step student onboarding experience.
 * Manages steps, state persistence, and seamless transitions.
 */
const OnboardingWizard = ({ initialStep = 1 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Read step from URL param if available (?step=1, ?step=2)
  const stepParam = parseInt(searchParams.get("step"), 10);
  const [currentStep, setCurrentStep] = useState(
    stepParam >= 1 && stepParam <= 4 ? stepParam : initialStep,
  );

  // Retrieve staged registration data (from /signup)
  const [registrationData] = useState(() => {
    if (location.state?.registrationData) {
      return location.state.registrationData;
    }
    const stored = sessionStorage.getItem("pendingRegistration");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const email =
    location.state?.email ||
    registrationData?.email ||
    "amara.kamau@student.ke";

  // Keep URL in sync with step
  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    setSearchParams({ step: stepNumber });
  };

  const handleStep1Success = () => {
    goToStep(2);
  };

  const handleStep2Success = () => {
    goToStep(3);
  };

  const handleStep3Success = () => {
    goToStep(4);
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onStepClick={(step) => {
        // Only allow clicking completed or previous steps
        if (step <= currentStep) {
          goToStep(step);
        }
      }}
      onSaveAndExit={() => {
        navigate("/");
      }}
    >
      {currentStep === 1 && (
        <Step1AccountOtp
          email={email}
          registrationData={registrationData}
          onVerificationSuccess={handleStep1Success}
        />
      )}

      {currentStep === 2 && (
        <Step2AcademicProfile
          onNext={handleStep2Success}
          onBack={() => goToStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3SubjectsGoals
          onNext={handleStep3Success}
          onBack={() => goToStep(2)}
        />
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D2ECFF] text-[#00658C] flex items-center justify-center mx-auto text-2xl font-lilita">
            🎉
          </div>
          <h2 className="text-2xl font-lilita text-slate-900 tracking-wide">
            Step 4: Launch Student Dashboard
          </h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm font-josefin">
            Celebration screen & instant student workspace initialization.
          </p>
          <div className="pt-4 flex justify-center gap-3 font-josefin">
            <button
              onClick={() => goToStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Step 3
            </button>
            <button
              onClick={() => navigate("/dashboard/student")}
              className="px-6 py-2.5 rounded-xl bg-[#003D55] text-white text-sm font-bold hover:bg-[#015575] transition-all shadow-md"
            >
              Launch Dashboard Now 🚀
            </button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default OnboardingWizard;
