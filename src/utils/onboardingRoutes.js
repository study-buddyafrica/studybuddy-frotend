/**
 * Map backend onboarding_step → frontend path (SAD SBA-SAD-2026-006).
 */

export const ONBOARDING_STEPS = {
  PENDING_OTP: "pending_otp",
  STEP_2: "step_2_profile",
  STEP_3: "step_3_academic_kyc",
  STEP_4: "step_4_launch",
  COMPLETED: "completed",
};

export function normalizeRole(role) {
  const r = String(role || "student").toLowerCase();
  if (r === "teacher" || r === "parent" || r === "student") return r;
  return "student";
}

/** @returns {string} path like /onboarding/student?step=2 */
export function getOnboardingPath(role, stepNumber = 2) {
  const r = normalizeRole(role);
  const step = Math.min(4, Math.max(1, Number(stepNumber) || 2));
  return `/onboarding/${r}?step=${step}`;
}

/** Map API enum → step number 1–4 */
export function stepNumberFromOnboardingStep(onboardingStep) {
  switch (String(onboardingStep || "").toLowerCase()) {
    case ONBOARDING_STEPS.PENDING_OTP:
      return 1;
    case ONBOARDING_STEPS.STEP_2:
      return 2;
    case ONBOARDING_STEPS.STEP_3:
      return 3;
    case ONBOARDING_STEPS.STEP_4:
      return 4;
    case ONBOARDING_STEPS.COMPLETED:
      return 4;
    default:
      return 2;
  }
}

/**
 * Where to send user after login / OTP / guard.
 * @param {{ role?: string, onboarding_step?: string, is_superuser?: boolean }} user
 */
export function getPostAuthRedirect(user) {
  if (!user) return "/login";

  if (user.is_superuser === true || user.role === "admin") {
    return "/admin";
  }

  const role = normalizeRole(user.role);
  const step = String(user.onboarding_step || "").toLowerCase();

  // Legacy users with no claim → allow dashboard
  if (!step) {
    return getDashboardPath(role);
  }

  if (step === ONBOARDING_STEPS.COMPLETED) {
    return getDashboardPath(role);
  }

  if (step === ONBOARDING_STEPS.PENDING_OTP) {
    return "/verify-code";
  }

  return getOnboardingPath(role, stepNumberFromOnboardingStep(step));
}

export function getDashboardPath(role) {
  switch (normalizeRole(role)) {
    case "teacher":
      return "/teacher-dashboard";
    case "parent":
      return "/parent-dashboard/home";
    default:
      return "/student-dashboard/";
  }
}

export function isOnboardingComplete(user) {
  if (!user) return false;
  const step = String(user.onboarding_step || "").toLowerCase();
  // Missing claim = legacy session, treat as complete for guard
  if (!step) return true;
  return step === ONBOARDING_STEPS.COMPLETED;
}

export function readStoredUser() {
  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
