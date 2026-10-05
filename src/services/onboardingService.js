/**
 * Onboarding API client — contracts from SBA-SAD-2026-006 §7.
 * Wire real calls when Victor ships endpoints; until then these are the canonical shapes.
 *
 * Base: /api/v1 (confirm with backend if production is /api/ without v1)
 */
import axios from "axios";
import { FHOST } from "../components/constants/Functions";
import { authStorage } from "./authStorage";

const client = axios.create({
  baseURL: FHOST,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken?.() || authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Toggle when backend onboarding routes are live */
export const ONBOARDING_API_ENABLED = false;

const auth = {
  /** POST /api/v1/auth/register/ — public */
  register: (payload) => client.post("/api/v1/auth/register/", payload),
  // payload: { first_name, last_name, email, password, confirm_password, role }

  /** POST /api/v1/auth/verify-otp/ — public */
  verifyOtp: (payload) => client.post("/api/v1/auth/verify-otp/", payload),
  // payload: { email, code } → tokens + user.onboarding_step
};

const onboarding = {
  /** GET /api/v1/onboarding/status/ — resume hydration */
  status: () => client.get("/api/v1/onboarding/status/"),

  /**
   * PATCH /api/v1/onboarding/step-2/
   * Student JSON | Parent JSON | Teacher multipart (FormData)
   */
  step2: (data, { multipart = false } = {}) =>
    client.patch("/api/v1/onboarding/step-2/", data, {
      headers: multipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),

  /**
   * PATCH /api/v1/onboarding/step-3/
   * Student/Parent JSON | Teacher multipart
   */
  step3: (data, { multipart = false } = {}) =>
    client.patch("/api/v1/onboarding/step-3/", data, {
      headers: multipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),

  /** POST /api/v1/onboarding/complete/ */
  complete: () => client.post("/api/v1/onboarding/complete/", {}),
};

/**
 * Helpers to build payloads (SAD §7.3–7.4) — call from step components later.
 */
export const onboardingPayloads = {
  studentStep2: ({
    curriculum_type,
    education_level_id,
    grade_id,
    school_name,
    gender,
  }) => ({
    curriculum_type,
    education_level_id,
    grade_id,
    school_name,
    gender,
  }),

  studentStep3: ({
    target_subjects,
    primary_learning_goal,
    parent_phone_number,
  }) => ({
    target_subjects,
    primary_learning_goal,
    parent_phone_number,
  }),

  parentStep2: ({ child_name, child_identifier, relationship_type }) => ({
    child_name,
    child_identifier,
    relationship_type,
  }),

  parentStep3: ({
    mpesa_billing_phone,
    weekly_spend_limit_kes,
    notification_preferences,
  }) => ({
    mpesa_billing_phone,
    weekly_spend_limit_kes,
    notification_preferences,
  }),

  /** Teacher step 2 — use FormData in the step UI */
  teacherStep2FormData: ({
    national_identity_number,
    tsc_number,
    experience,
    national_identity_card, // File
  }) => {
    const fd = new FormData();
    if (national_identity_number)
      fd.append("national_identity_number", national_identity_number);
    if (tsc_number) fd.append("tsc_number", tsc_number);
    if (experience != null) fd.append("experience", String(experience));
    if (national_identity_card)
      fd.append("national_identity_card", national_identity_card);
    return fd;
  },

  teacherStep3FormData: ({
    highest_qualification,
    institution_attended,
    curriculums_taught, // array → JSON string or repeated keys per backend
    hourly_rate_kes,
    bio,
    academic_certificate, // File
  }) => {
    const fd = new FormData();
    if (highest_qualification)
      fd.append("highest_qualification", highest_qualification);
    if (institution_attended)
      fd.append("institution_attended", institution_attended);
    if (curriculums_taught != null) {
      fd.append(
        "curriculums_taught",
        typeof curriculums_taught === "string"
          ? curriculums_taught
          : JSON.stringify(curriculums_taught),
      );
    }
    if (hourly_rate_kes != null)
      fd.append("hourly_rate_kes", String(hourly_rate_kes));
    if (bio) fd.append("bio", bio);
    if (academic_certificate)
      fd.append("academic_certificate", academic_certificate);
    return fd;
  },
};

export const onboardingService = {
  ...auth,
  ...onboarding,
  enabled: ONBOARDING_API_ENABLED,
};

export default onboardingService;
