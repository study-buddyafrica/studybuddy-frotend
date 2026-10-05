/**
 * Onboarding API client — contracts from SBA-SAD-2026-006 §7 & PR #38 Handoff Report.
 * Target: Live Render Staging Backend (https://studybuddy-backend-6vya.onrender.com/api)
 */
import axios from "axios";
import { authStorage } from "./authStorage";

const getBaseUrl = () => {
  const rawBase = (
    process.env.REACT_APP_API_URL ||
    "https://studybuddy-backend-6vya.onrender.com/api"
  ).replace(/\/+$/, "");
  return rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
};

export const client = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  // Always keep baseURL dynamically in sync with getBaseUrl()
  config.baseURL = getBaseUrl();

  const token =
    typeof authStorage.getAccessToken === "function"
      ? authStorage.getAccessToken()
      : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Toggle when backend onboarding routes are live (Live per sprint directive) */
export const ONBOARDING_API_ENABLED = true;

/**
 * Normalizes curriculum selection to strict backend OpenAPI enum:
 * "CBC" | "8_4_4" | "IGCSE" | "OTHER"
 */
export const normalizeCurriculumType = (val) => {
  const v = String(val || "").trim().toUpperCase();
  if (v === "CBC") return "CBC";
  if (v === "844" || v === "8-4-4" || v === "8_4_4") return "8_4_4";
  if (v === "CAMBRIDGE" || v === "IGCSE") return "IGCSE";
  return "OTHER";
};

/**
 * Normalizes parent relationship to strict backend OpenAPI enum:
 * "Father" | "Mother" | "Guardian" | "Sponsor"
 */
export const normalizeRelationshipType = (val) => {
  const v = String(val || "").trim().toLowerCase();
  if (v === "father") return "Father";
  if (v === "mother") return "Mother";
  if (v === "sponsor") return "Sponsor";
  return "Guardian";
};

/**
 * Helper to extract standardized error messages from backend responses
 */
export const getErrorMessage = (error, fallback = "An unexpected error occurred.") => {
  if (!error) return fallback;
  const data = error.response?.data;
  if (!data) return error.message || fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return first.detail || first.message || fallback;
  }
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (typeof data === "string") return data;
  return fallback;
};

const auth = {
  /** POST /api/users/register/ — public account registration */
  register: (payload) => client.post("/users/register/", payload),

  /** POST /api/verify-email/request/ — request fresh OTP */
  requestOtp: (email) => client.post("/verify-email/request/", { email }),

  /** POST /api/verify-email/confirm/ — verify 6-digit OTP code */
  verifyOtp: (payload) => client.post("/verify-email/confirm/", payload),

  /** POST /api/token/request/ — obtain JWT pair using email & password */
  requestToken: async (email, password) => {
    const res = await client.post("/token/request/", { email, password });
    const access = res.data?.access;
    const refresh = res.data?.refresh;
    if (access) {
      authStorage.setTokens(access, refresh);
    }
    return res;
  },

  /** POST /api/token/refresh/ — refresh access token */
  refreshToken: (refresh) => client.post("/token/refresh/", { refresh }),
};

const onboarding = {
  /** GET /api/v1/onboarding/status/ — resume hydration and status check */
  status: () => client.get("/v1/onboarding/status/"),
  getStatus: () => client.get("/v1/onboarding/status/"),

  /**
   * PATCH /api/v1/onboarding/step-2/
   * Student JSON | Parent JSON | Teacher multipart (FormData)
   */
  step2: (data, { multipart = false } = {}) =>
    client.patch("/v1/onboarding/step-2/", data, {
      headers: multipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),
  submitStep2: (data, isMultipart = false) =>
    client.patch("/v1/onboarding/step-2/", data, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),

  /**
   * PATCH /api/v1/onboarding/step-3/
   * Student/Parent JSON | Teacher multipart
   */
  step3: (data, { multipart = false } = {}) =>
    client.patch("/v1/onboarding/step-3/", data, {
      headers: multipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),
  submitStep3: (data, isMultipart = false) =>
    client.patch("/v1/onboarding/step-3/", data, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    }),

  /**
   * POST /api/v1/onboarding/complete/
   * Final activation, returns refreshed JWT pair and user profile.
   */
  complete: async () => {
    const response = await client.post("/v1/onboarding/complete/", {});
    const data = response.data;
    if (data?.tokens) {
      authStorage.setTokens(data.tokens.access, data.tokens.refresh);
    }
    if (data?.data?.user) {
      authStorage.setUserInfo(data.data.user);
    } else if (data?.user) {
      authStorage.setUserInfo(data.user);
    }
    return response;
  },
  completeOnboarding: async () => {
    const response = await client.post("/v1/onboarding/complete/", {});
    const data = response.data;
    if (data?.tokens) {
      authStorage.setTokens(data.tokens.access, data.tokens.refresh);
    }
    if (data?.data?.user) {
      authStorage.setUserInfo(data.data.user);
    } else if (data?.user) {
      authStorage.setUserInfo(data.user);
    }
    return response;
  },
};

/**
 * Helpers to build payloads (SAD §7.3–7.4 & OpenAPI 3.0.3)
 */
export const onboardingPayloads = {
  studentStep2: ({
    curriculum_type,
    education_level_id = null,
    grade_id = null,
    school_name = "",
    gender = "",
  }) => ({
    curriculum_type: normalizeCurriculumType(curriculum_type),
    education_level_id: education_level_id || null,
    grade_id: grade_id || null,
    school_name: school_name ? school_name.trim().slice(0, 150) : "",
    gender: gender ? gender.trim().slice(0, 50) : "",
  }),

  studentStep3: ({
    target_subjects = [],
    primary_learning_goal = "",
    parent_phone_number = "",
  }) => ({
    target_subjects: Array.isArray(target_subjects) ? target_subjects : [],
    primary_learning_goal: primary_learning_goal
      ? primary_learning_goal.trim().slice(0, 255)
      : "",
    parent_phone_number: parent_phone_number
      ? parent_phone_number.trim().slice(0, 50)
      : "",
  }),

  parentStep2: ({
    child_identifier = "",
    relationship_type = "Guardian",
    child_name = "",
  }) => ({
    relationship_type: normalizeRelationshipType(relationship_type),
    child_identifier: (child_identifier || child_name || "").trim().slice(0, 150),
  }),

  parentStep3: ({
    mpesa_billing_phone = "",
    weekly_spend_limit_kes = "5000.00",
    notification_preferences = { sms_attendance: true, weekly_report: true },
  }) => ({
    mpesa_billing_phone: mpesa_billing_phone
      ? mpesa_billing_phone.trim().slice(0, 50)
      : "",
    weekly_spend_limit_kes: String(weekly_spend_limit_kes || "5000.00"),
    notification_preferences:
      typeof notification_preferences === "object"
        ? notification_preferences
        : { sms_attendance: true, weekly_report: true },
  }),

  /** Teacher step 2 — use FormData in the step UI */
  teacherStep2FormData: ({
    national_identity_number = "",
    tsc_number = "",
    experience = 0,
    national_identity_card = null, // File (<= 5MB)
    bio = "",
  }) => {
    const fd = new FormData();
    if (national_identity_number)
      fd.append(
        "national_identity_number",
        national_identity_number.trim().slice(0, 30),
      );
    if (tsc_number) fd.append("tsc_number", tsc_number.trim().slice(0, 50));
    if (experience != null) fd.append("experience", String(experience));
    if (bio) fd.append("bio", bio.trim());
    if (national_identity_card instanceof File)
      fd.append("national_identity_card", national_identity_card);
    return fd;
  },

  teacherStep3FormData: ({
    highest_qualification = "",
    institution_attended = "",
    curriculums_taught = [], // array
    hourly_rate_kes = 1200,
    bio = "",
    academic_certificate = null, // File (<= 5MB)
    subjects = [],
  }) => {
    const fd = new FormData();
    if (highest_qualification)
      fd.append(
        "highest_qualification",
        highest_qualification.trim().slice(0, 100),
      );
    if (institution_attended)
      fd.append(
        "institution_attended",
        institution_attended.trim().slice(0, 255),
      );
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
    if (bio) fd.append("bio", bio.trim());
    if (academic_certificate instanceof File)
      fd.append("academic_certificate", academic_certificate);
    if (Array.isArray(subjects) && subjects.length > 0) {
      fd.append("subjects", JSON.stringify(subjects));
    }
    return fd;
  },
};

export const onboardingService = {
  ...auth,
  ...onboarding,
  enabled: ONBOARDING_API_ENABLED,
  normalizeCurriculumType,
  normalizeRelationshipType,
  getErrorMessage,
  payloads: onboardingPayloads,
};

export default onboardingService;
