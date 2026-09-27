import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import Step1AccountOtp from "./Step1AccountOtp";
import Step2AcademicProfile from "./Step2AcademicProfile";
import Step3SubjectsGoals from "./Step3SubjectsGoals";
import Step4DashboardLaunch from "./Step4DashboardLaunch";
import Step1TeacherAccountOtp from "./Step1TeacherAccountOtp";
import { FaGraduationCap, FaArrowLeft } from "react-icons/fa";

/**
 * OnboardingWizard: Master container for role-based onboarding (Student, Teacher, Parent).
 * Manages steps, role detection, state persistence, and seamless transitions.
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

  // Sync step if URL search param changes
  useEffect(() => {
    if (stepParam >= 1 && stepParam <= 4 && stepParam !== currentStep) {
      setCurrentStep(stepParam);
    }
  }, [stepParam, currentStep]);

  // Retrieve staged registration data (from /signup or session storage)
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

  // Determine active role: URL query param > location state > registration data > session storage > student default
  const roleParam = searchParams.get("role");
  const role = (
    roleParam ||
    location.state?.role ||
    registrationData?.role ||
    sessionStorage.getItem("userRole") ||
    "student"
  ).toLowerCase();

  const email =
    location.state?.email ||
    registrationData?.email ||
    (role === "teacher"
      ? "eli.muthoka@studybuddy.africa"
      : "amara.kamau@student.ke");

  const phone =
    location.state?.phone ||
    registrationData?.phone ||
    registrationData?.phone_number ||
    (role === "teacher" ? "+254 712 345 678" : "");

  // Keep URL in sync with step and role
  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("step", stepNumber);
    if (role && role !== "student") {
      nextParams.set("role", role);
    }
    setSearchParams(nextParams);
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
      role={role}
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
      {/* ========================================================================= */}
      {/* TEACHER ONBOARDING FLOW                                                    */}
      {/* ========================================================================= */}
      {role === "teacher" && (
        <>
          {currentStep === 1 && (
            <Step1TeacherAccountOtp
              email={email}
              phone={phone}
              registrationData={registrationData}
              onVerificationSuccess={handleStep1Success}
            />
          )}

          {currentStep >= 2 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#01B0F1]/20 to-[#015575]/20 flex items-center justify-center text-[#015575] mx-auto mb-5">
                <FaGraduationCap className="text-3xl" />
              </div>
              <h2 className="text-2xl font-lilita text-slate-900 mb-2">
                Teacher Step {currentStep} In Progress
              </h2>
              <p className="text-slate-500 font-josefin text-sm mb-6">
                Step {currentStep} (Professional Identity &amp; KYC Verification) is currently being connected to the KYC engine.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(currentStep - 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-josefin font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  <FaArrowLeft className="text-xs" /> Back to Step {currentStep - 1}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* STUDENT ONBOARDING FLOW (DEFAULT)                                          */}
      {/* ========================================================================= */}
      {role !== "teacher" && (
        <>
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
            <Step4DashboardLaunch onBack={() => goToStep(3)} />
          )}
        </>
      )}
    </OnboardingLayout>
  );
};

export default OnboardingWizard;
