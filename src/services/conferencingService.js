/**
 * Conferencing control plane — SBA-SAD-2026-004 endpoints.
 * Media plane: Jitsi / 8x8 (not Daily.co embeds).
 */
import axios from "axios";
import { authStorage } from "./authStorage";

const getBaseUrl = () => {
  const rawBase = (
    process.env.REACT_APP_API_URL ||
    (typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/api`
      : "/api")
  ).replace(/\/+$/, "");
  return rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
};

const PREFIX = "/v1/conferencing";

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

/** Flip false if backend routes are down */
export const CONFERENCING_API_ENABLED = true;

export const getErrorMessage = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  if (data.message) return String(data.message);
  if (Array.isArray(data.errors) && data.errors[0]?.detail) {
    return data.errors[0].detail;
  }
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
};

export function adaptSessionPayload(data = {}) {
  const d = data?.data || data || {};
  return {
    live_session_id: d.live_session_id || d.id || null,
    session_id: d.session_id || d.booking_id || null,
    room_name: d.room_name || d.jaas_room_name || null,
    jaas_room_name: d.jaas_room_name || d.room_name || null,
    room_url:
      d.room_url ||
      d.teacher_meeting_link ||
      d.student_meeting_link ||
      d.meeting_link ||
      d.link ||
      null,
    student_meeting_link: d.student_meeting_link || null,
    teacher_meeting_link: d.teacher_meeting_link || null,
    token: d.token || d.jwt || null,
    jwt: d.jwt || d.token || null,
    domain: d.domain || d.jitsi_domain || "8x8.vc",
    subject: d.subject || d.course_title || "Live Class",
    whiteboard_link: d.whiteboard_link || d.whiteboard_url || null,
    whiteboard: d.whiteboard || null,
    is_preview: Boolean(d.is_preview),
    preview_seconds: d.preview_seconds ?? d.preview_duration_seconds,
    raw: d,
  };
}

export async function initializeSession(sessionBookingId, extra = {}) {
  const body = {
    session_booking_id: sessionBookingId,
    ...(extra.title ? { title: extra.title } : {}),
    ...(extra.description ? { description: extra.description } : {}),
  };
  const res = await client.post(`${PREFIX}/initialize/`, body);
  return adaptSessionPayload(res.data);
}

export async function joinSession(liveSessionId, extra = {}) {
  const res = await client.post(`${PREFIX}/${liveSessionId}/join/`, extra);
  return adaptSessionPayload(res.data);
}

export async function sendHeartbeat(liveSessionId, mediaState = {}) {
  const res = await client.post(`${PREFIX}/${liveSessionId}/heartbeat/`, {
    media_state: mediaState,
  });
  return res.data;
}

export async function saveWhiteboardSnapshot(liveSessionId, payload = {}) {
  const body = payload?.snapshot !== undefined ? payload : { snapshot: payload };
  const res = await client.post(
    `${PREFIX}/${liveSessionId}/whiteboard/`,
    body,
  );
  return res.data;
}

export const saveWhiteboard = saveWhiteboardSnapshot;

export async function completeSession(liveSessionId, payload = {}) {
  const res = await client.post(
    `${PREFIX}/${liveSessionId}/complete/`,
    payload,
  );
  return res.data;
}

export const conferencingService = {
  enabled: CONFERENCING_API_ENABLED,
  initialize: initializeSession,
  join: joinSession,
  heartbeat: sendHeartbeat,
  whiteboard: saveWhiteboardSnapshot,
  saveWhiteboard: saveWhiteboardSnapshot,
  complete: completeSession,
};

export default conferencingService;
