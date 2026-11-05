/**
 * Conferencing API client — SBA-SAD-2026-004 §7 control plane.
 * Media plane: Jitsi in-app (not Daily Call Object).
 */
import axios from "axios";
import { authStorage } from "./authStorage";

const getBaseUrl = () => {
  const rawBase = (
    process.env.REACT_APP_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");
  return rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
};

export const client = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

client.interceptors.request.use((config) => {
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

/** Set false if OpenAPI has no /v1/conferencing/ yet */
export const CONFERENCING_API_ENABLED = true;

export const getErrorMessage = (
  error,
  fallback = "An unexpected error occurred.",
) => {
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

export const adaptSessionPayload = (body) => {
  const d = body?.data || body || {};
  return {
    live_session_id: d.live_session_id || d.id || null,
    room_name: d.room_name || null,
    room_url:
      d.room_url ||
      d.teacher_meeting_link ||
      d.student_meeting_link ||
      d.link ||
      null,
    token: d.token || null,
    is_owner: Boolean(d.is_owner),
    is_preview: Boolean(d.is_preview),
    duration_minutes: d.duration_minutes ?? 60,
    whiteboard_state: d.whiteboard_state ?? null,
    whiteboard_version: d.whiteboard_version ?? 1,
    whiteboard_link: d.whiteboard_link || null,
    expires_at: d.expires_at || null,
    settlement_status: d.settlement_status || null,
    raw: d,
  };
};

const PREFIX = "/v1/conferencing";

export async function initializeSession(sessionBookingId) {
  const res = await client.post(`${PREFIX}/initialize/`, {
    session_booking_id: sessionBookingId,
  });
  return adaptSessionPayload(res.data);
}

export async function joinSession(liveSessionId) {
  const res = await client.post(`${PREFIX}/${liveSessionId}/join/`, {});
  return adaptSessionPayload(res.data);
}

export async function sendHeartbeat(
  liveSessionId,
  { client_timestamp, media_state } = {},
) {
  const payload = {
    client_timestamp: client_timestamp || new Date().toISOString(),
    media_state: media_state || {
      audio_enabled: true,
      video_enabled: true,
    },
  };
  const res = await client.post(
    `${PREFIX}/${liveSessionId}/heartbeat/`,
    payload,
  );
  return res.data?.data || res.data;
}

export async function saveWhiteboard(liveSessionId, { version, elements }) {
  const res = await client.post(`${PREFIX}/${liveSessionId}/whiteboard/`, {
    version: version ?? 1,
    elements: elements || [],
  });
  return res.data;
}

export async function completeSession(liveSessionId) {
  const res = await client.post(`${PREFIX}/${liveSessionId}/complete/`, {});
  return res.data?.data || res.data;
}

export async function fetchLegacyJitsiLink() {
  const res = await client.get("/jitsi/");
  return res.data?.link || null;
}

export const conferencingService = {
  enabled: CONFERENCING_API_ENABLED,
  initialize: initializeSession,
  join: joinSession,
  heartbeat: sendHeartbeat,
  saveWhiteboard,
  complete: completeSession,
  fetchLegacyJitsiLink,
  adaptSessionPayload,
  getErrorMessage,
};

export default conferencingService;
