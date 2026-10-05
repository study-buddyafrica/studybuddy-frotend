import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import Step1AccountOtp from "./Step1AccountOtp";
import Step2AcademicProfile from "./Step2AcademicProfile";
import Step3SubjectsGoals from "./Step3SubjectsGoals";
import Step4DashboardLaunch from "./Step4DashboardLaunch";
import Step1TeacherAccountOtp from "./Step1TeacherAccountOtp";
import Step2TeacherProfile from "./Step2TeacherProfile";
import Step3TeacherQualifications from "./Step3TeacherQualifications";
import Step4TeacherDashboardLaunch from "./Step4TeacherDashboardLaunch";
import Step1ParentAccountOtp from "./Step1ParentAccountOtp";
import Step2ParentLearnerDetails from "./Step2ParentLearnerDetails";
import Step3ParentCurriculumGoals from "./Step3ParentCurriculumGoals";
import Step4ParentDashboardLaunch from "./Step4ParentDashboardLaunch";
import { FaGraduationCap } from "react-icons/fa";
import { authStorage } from "../../services/authStorage";
import { onboardingService } from "../../services/onboardingService";
import { getDashboardPath, stepNumberFromOnboardingStep } from "../../utils/onboardingRoutes";

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

  // Determine active role: URL path (/onboarding/:role) > query param (?role=) > location state > registration data > session storage > student default
  const pathRole = location.pathname.startsWith("/onboarding/")
    ? location.pathname.replace("/onboarding/", "").split("/")[0]
    : null;
  const roleParam = searchParams.get("role");
  const role = (
    pathRole ||
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
      : role === "parent"
        ? "parent.guardian@studybuddy.africa"
        : "amara.kamau@student.ke");

  const phone =
    location.state?.phone ||
    registrationData?.phone ||
    registrationData?.phone_number ||
    (role === "teacher" || role === "parent" ? "+254 712 345 678" : "");

  // Keep URL in sync with step and role
const goToStep = (stepNumber) => {
  setCurrentStep(stepNumber);
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("step", String(stepNumber));
  nextParams.delete("role"); // role is in the path
  setSearchParams(nextParams, { replace: true });

  const base = `/onboarding/${role === "teacher" || role === "parent" ? role : "student"}`;
  if (!location.pathname.startsWith(base)) {
    navigate(`${base}?step=${stepNumber}`, { replace: true });
  }
};

  // Hydration & Resume Guard (SAD SBA-SAD-2026-006 §7 & PR #38)
  useEffect(() => {
    let isMounted = true;

    const hydrateFromStatus = async () => {
      if (!authStorage.isAuthenticated() || !onboardingService.enabled) {
        return;
      }

      try {
        const res = await onboardingService.status();
        if (!isMounted) return;

        const data = res?.data?.data || res?.data || {};
        const isComplete =
          data.is_complete ||
          data.onboarding_completed ||
          data.onboarding_step === "completed";

        if (isComplete) {
          const dashboardUrl = data.dashboard_url || getDashboardPath(role);
          navigate(dashboardUrl, { replace: true });
          return;
        }

        // Hydrate draft data into sessionStorage if available (supports nested step keys or flat backend dictionary)
        if (data.draft_data && typeof data.draft_data === "object") {
          try {
            const draft = data.draft_data;
            const effectiveRole = (data.role || role || "student").toLowerCase();

            if (effectiveRole === "teacher") {
              const step2 = draft.step_2 || {
                fullName: draft.full_name || "",
                idNumber: draft.national_identity_number || "",
                tscNumber: draft.tsc_number || "",
                experienceYears:
                  draft.experience != null
                    ? `${draft.experience} yrs`
                    : "1–3 yrs",
                institution: draft.institution_attended || "",
                bio: draft.bio || "",
                national_identity_card_url:
                  draft.national_identity_card_url || null,
              };
              if (
                draft.step_2 ||
                draft.national_identity_number ||
                draft.tsc_number ||
                draft.experience != null
              ) {
                sessionStorage.setItem("teacherKycData", JSON.stringify(step2));
              }

              const step3 = draft.step_3 || {
                highestQualification:
                  draft.highest_qualification ||
                  "Bachelor of Education (B.Ed)",
                institution: draft.institution_attended || "",
                curriculums: Array.isArray(draft.curriculums_taught)
                  ? draft.curriculums_taught
                  : [],
                subjects: Array.isArray(draft.subjects) ? draft.subjects : [],
                hourlyRate: draft.hourly_rate || 1500,
                bio: draft.bio || "",
                academic_certificate_url:
                  draft.academic_certificate_url || null,
              };
              if (
                draft.step_3 ||
                draft.highest_qualification ||
                draft.curriculums_taught ||
                draft.hourly_rate != null
              ) {
                sessionStorage.setItem(
                  "teacherQualificationsData",
                  JSON.stringify(step3),
                );
              }
            } else if (effectiveRole === "parent") {
              const primaryChild =
                Array.isArray(draft.linked_children) &&
                draft.linked_children.length > 0
                  ? draft.linked_children[0]
                  : null;
              const childFullName = primaryChild
                ? `${primaryChild.first_name || ""} ${primaryChild.last_name || ""}`.trim() ||
                  primaryChild.email
                : "";

              const step2 = draft.step_2 || {
                primaryWard: primaryChild
                  ? {
                      fullName: childFullName,
                      academicStage: primaryChild.grade || "",
                      linkedEmail: primaryChild.email || null,
                      isAccountLinked: !!primaryChild.email,
                      childId: primaryChild.child_id,
                    }
                  : null,
                relationship: draft.relationship_type || "Guardian",
                linked_children: draft.linked_children || [],
              };
              if (draft.step_2 || draft.relationship_type || primaryChild) {
                sessionStorage.setItem("parentWardData", JSON.stringify(step2));
                if (primaryChild) {
                  sessionStorage.setItem(
                    "parentLearnerData",
                    JSON.stringify({
                      fullName: childFullName,
                      gradeStage: primaryChild.grade || "",
                      school: primaryChild.school || "",
                      avatarInitials:
                        childFullName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "SW",
                    }),
                  );
                }
              }

              const step3 = draft.step_3 || {
                mpesaBillingPhone: draft.mpesa_billing_phone || "",
                weeklySpendLimit:
                  draft.weekly_spend_limit_kes != null
                    ? String(draft.weekly_spend_limit_kes)
                    : "5000",
                notification_preferences:
                  draft.notification_preferences || {},
              };
              if (
                draft.step_3 ||
                draft.mpesa_billing_phone ||
                draft.weekly_spend_limit_kes != null
              ) {
                sessionStorage.setItem(
                  "parentCurriculumData",
                  JSON.stringify(step3),
                );
              }
            } else {
              // Student role (default)
              let curriculum = "cbc";
              if (draft.curriculum_type) {
                const ct = String(draft.curriculum_type).toUpperCase();
                if (ct === "8_4_4" || ct === "844") curriculum = "844";
                else if (ct === "IGCSE" || ct === "CAMBRIDGE")
                  curriculum = "cambridge";
                else curriculum = "cbc";
              }

              const step2 = draft.step_2 || {
                curriculum,
                gradeLevel:
                  draft.grade_name ||
                  draft.grade_id ||
                  "Junior Secondary - Grade 8 (JSS 2)",
                schoolName:
                  draft.school_name || "Nairobi Academy – Karen Campus",
                education_level_id: draft.education_level_id || null,
                grade_id: draft.grade_id || null,
                school_id: draft.school_id || null,
                gender: draft.gender || "",
              };
              if (
                draft.step_2 ||
                draft.curriculum_type ||
                draft.school_name ||
                draft.grade_name
              ) {
                sessionStorage.setItem(
                  "studentOnboardingStep2",
                  JSON.stringify(step2),
                );
              }

              const targetSubjects = Array.isArray(draft.target_subjects)
                ? draft.target_subjects
                : [];
              const step3 = draft.step_3 || {
                selectedSubjects: targetSubjects,
                selectedSubjectIds: [],
                primaryLearningGoal: draft.primary_learning_goal || "",
                parentPhone: draft.parent_phone_number || "",
                studyPace: "balanced",
                targetScore: "A",
              };
              if (
                draft.step_3 ||
                targetSubjects.length > 0 ||
                draft.primary_learning_goal
              ) {
                sessionStorage.setItem(
                  "studentOnboardingStep3",
                  JSON.stringify(step3),
                );
              }
            }
          } catch (e) {
            console.warn("Failed to persist draft data to sessionStorage:", e);
          }
        }

        // Determine resume step from current_step or resume_route
        const rawStep = data.current_step || data.onboarding_step;
        const targetStep = stepNumberFromOnboardingStep(rawStep);

        // If user arrived without explicit stepParam and backend indicates a more advanced step, route to it
        if (!stepParam && targetStep && targetStep !== currentStep) {
          goToStep(targetStep);
        } else if (data.resume_route && !stepParam) {
          navigate(data.resume_route, { replace: true });
        }
      } catch (err) {
        console.warn("Onboarding status check skipped or failed:", err);
      }
    };

    hydrateFromStatus();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {currentStep === 2 && (
            <Step2TeacherProfile
              registrationData={registrationData}
              onNext={handleStep2Success}
              onBack={() => goToStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3TeacherQualifications
              registrationData={registrationData}
              onNext={handleStep3Success}
              onBack={() => goToStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4TeacherDashboardLaunch
              registrationData={registrationData}
              onBack={() => goToStep(3)}
            />
          )}

          {currentStep > 4 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#01B0F1]/20 to-[#015575]/20 flex items-center justify-center text-[#015575] mx-auto mb-5">
                <FaGraduationCap className="text-3xl" />
              </div>
              <h2 className="text-2xl font-lilita text-slate-900 mb-2">
                Teacher Onboarding Complete
              </h2>
              <p className="text-slate-500 font-josefin text-sm mb-6">
                Your educator account is active. Click below to enter your Teacher Dashboard.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/teacher-dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003D55] text-white font-lilita text-base shadow-md hover:bg-[#015575] transition-all"
                >
                  Go to Teacher Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PARENT ONBOARDING FLOW                                                    */}
      {/* ========================================================================= */}
      {role === "parent" && (
        <>
          {currentStep === 1 && (
            <Step1ParentAccountOtp
              email={email}
              phone={phone}
              registrationData={registrationData}
              onVerificationSuccess={handleStep1Success}
            />
          )}

          {currentStep === 2 && (
            <Step2ParentLearnerDetails
              registrationData={registrationData}
              onNext={handleStep2Success}
              onBack={() => goToStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3ParentCurriculumGoals
              registrationData={registrationData}
              onNext={handleStep3Success}
              onBack={() => goToStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4ParentDashboardLaunch
              registrationData={registrationData}
              onBack={() => goToStep(3)}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* STUDENT ONBOARDING FLOW (DEFAULT)                                          */}
      {/* ========================================================================= */}
      {role !== "teacher" && role !== "parent" && (
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
