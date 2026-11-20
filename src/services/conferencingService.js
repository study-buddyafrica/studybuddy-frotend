/**
 * Conferencing control plane — SBA-SAD-2026-004 endpoints.
 * Media plane: Jitsi / 8x8 (not Daily.co embeds).
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
  return {
    live_session_id: data.live_session_id || data.id || null,
    room_url:
      data.room_url ||
      data.teacher_meeting_link ||
      data.student_meeting_link ||
      data.meeting_link ||
      data.link ||
      null,
    token: data.token || data.jwt || null,
    domain: data.domain || data.jitsi_domain || null,
    jaas_room_name: data.jaas_room_name || data.room_name || null,
    whiteboard_link: data.whiteboard_link || data.whiteboard_url || null,
    is_preview: Boolean(data.is_preview),
    preview_seconds: data.preview_seconds ?? data.preview_duration_seconds,
    raw: data,
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
  const res = await client.post(
    `${PREFIX}/${liveSessionId}/whiteboard/`,
    payload,
  );
  return res.data;
}

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
  complete: completeSession,
};

export default conferencingService;
