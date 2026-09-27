import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaCamera,
  FaDesktop,
  FaExternalLinkAlt,
  FaMicrophone,
  FaPaperPlane,
  FaPhoneSlash,
  FaRegClock,
  FaRedo,
  FaShareAlt,
  FaUsers,
  FaVideoSlash,
} from "react-icons/fa";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import { authStorage } from "../../services/authStorage";
import { authService } from "../../services/authService";

const getSessionStatus = (session) => {
  const now = Date.now();
  const start = session.started_at
    ? new Date(session.started_at).getTime()
    : null;
  const end = session.ended_at ? new Date(session.ended_at).getTime() : null;

  if (session.status === "ended" || (end && end <= now)) return "ended";
  if (
    session.status === "live" ||
    (start && start <= now && (!end || end > now))
  ) {
    return "live";
  }
  return "upcoming";
};

const formatSessionDate = (value) => {
  if (!value) return "Time to be confirmed";
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getDurationLabel = (session) => {
  if (session.duration_minutes) return `${session.duration_minutes} min`;
  if (session.duration_hours) {
    const hours = Number(session.duration_hours);
    if (hours === 1) return "60 min";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours} hr`;
  }
  if (session.started_at && session.ended_at) {
    const mins = Math.round(
      (new Date(session.ended_at) - new Date(session.started_at)) / 60000,
    );
    if (mins > 0) return `${mins} min`;
  }
  return null;
};

const getSubjectLabel = (session) =>
  session.subject_name ||
  session.subject?.name ||
  session.subject ||
  session.course_subject ||
  session.course?.subject?.name ||
  "CLASS";

const getTeacherLabel = (session) =>
  session.teacher_name ||
  session.teacher?.full_name ||
  (session.teacher?.first_name
    ? `${session.teacher.first_name} ${session.teacher.last_name || ""}`.trim()
    : null) ||
  session.instructor_name ||
  null;

const getJoinCount = (session) =>
  session.join_count ??
  session.participants_count ??
  session.attendees_count ??
  session.student_count ??
  null;

const isUsableMeetingUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase();
  if (u.includes("mock.daily") || u.includes("daily.co")) return false;
  return true;
};

const getMeetingUrlFromSession = (session) => {
  const raw =
    session?.student_meeting_link ||
    session?.teacher_meeting_link ||
    session?.meeting_link ||
    null;
  return isUsableMeetingUrl(raw) ? raw : null;
};

const parseJitsiRoom = (url) => {
  try {
    const u = new URL(url);
    const roomName = u.pathname.replace(/^\//, "").split("/")[0];
    return { domain: u.hostname || "meet.jit.si", roomName: roomName || null };
  } catch {
    return { domain: "meet.jit.si", roomName: null };
  }
};

const loadJitsiScript = () =>
  new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[data-jitsi-external-api="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.dataset.jitsiExternalApi = "true";
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

const statusBadge = (status) => {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        LIVE NOW
      </span>
    );
  }
  if (status === "ended") {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        ENDED
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
      UPCOMING
    </span>
  );
};

const StudentLiveClass = ({ onEnterRoom, onLeaveRoom }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [jitsiReady, setJitsiReady] = useState(false);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const disposeJitsi = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (_) {}
      jitsiApiRef.current = null;
    }
    if (jitsiContainerRef.current) {
      jitsiContainerRef.current.innerHTML = "";
    }
    setJitsiReady(false);
  };

  useEffect(() => {
    if (!meetingUrl || view !== "room") return undefined;

    let cancelled = false;

    const start = async () => {
      setMeetingLoading(true);
      setJitsiReady(false);
      try {
        await loadJitsiScript();
        if (cancelled || !jitsiContainerRef.current) return;

        const { domain, roomName } = parseJitsiRoom(meetingUrl);
        if (!roomName || !window.JitsiMeetExternalAPI) {
          setError("Could not start in-app meeting. Use Open in new tab.");
          return;
        }

        disposeJitsi();

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            toolbarButtons: [],
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
          // Optional: set a cleaner display name if you have the user
          // userInfo: { displayName: "Student" },
        });

        jitsiApiRef.current = api;
        setJitsiReady(true);

        api.addListener("audioMuteStatusChanged", ({ muted }) => {
          setMicOn(!muted);
        });
        api.addListener("videoMuteStatusChanged", ({ muted }) => {
          setCameraOn(!muted);
        });
        api.addListener("readyToClose", () => {
          disposeJitsi();
        });

        // Jitsi chat → your UI
        api.addListener("incomingMessage", (message) => {
          const author = message.nick || message.from || "Participant";
          const text = message.message || message.text || "";
          if (!text) return;

          // Skip if it looks like our own optimistic message (simple heuristic)
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (
              last &&
              last.author === "You" &&
              last.text === text &&
              Date.now() - new Date(last.at).getTime() < 2000
            ) {
              return prev;
            }
            return [
              ...prev,
              {
                id: `${Date.now()}-${author}`,
                author,
                text,
                at: new Date().toISOString(),
              },
            ];
          });
        });
      } catch (err) {
        console.error("Jitsi External API failed:", err);
        if (!cancelled) {
          setError(
            "In-app meeting controls failed. Use “Open in new tab” for the call.",
          );
        }
      } finally {
        if (!cancelled) setMeetingLoading(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      disposeJitsi();
    };
  }, [meetingUrl, view]);

  const loadSessions = async () => {
    setLoading(true);
    setError("");

    let token = authStorage.getAccessToken();
    if (!token && authStorage.getRefreshToken()) {
      try {
        token = await authService.refreshToken();
      } catch (refreshError) {
        console.error("Unable to refresh token:", refreshError);
      }
    }
    if (!token) {
      setError(
        "Your session has expired. Please sign in again to view classes.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${FHOST}/api/live-sessions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessionsList = response.data?.results || response.data || [];
      const nextSessions = Array.isArray(sessionsList) ? sessionsList : [];
      setSessions(nextSessions);
      setSelectedSession((current) =>
        current
          ? nextSessions.find((session) => session.id === current.id) || null
          : null,
      );
    } catch (requestError) {
      console.error("Error fetching sessions:", requestError);
      setError(
        requestError.response?.data?.detail ||
          "We could not load your classes. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const groupedSessions = useMemo(() => {
    return sessions.reduce(
      (groups, session) => {
        groups[getSessionStatus(session)].push(session);
        return groups;
      },
      { live: [], upcoming: [], ended: [] },
    );
  }, [sessions, currentTime]);

  const resolveMeetingUrl = async (session) => {
    const existing = getMeetingUrlFromSession(session);
    if (existing) return existing;

    const token = authStorage.getAccessToken();
    const response = await axios.get(`${FHOST}/api/jitsi/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const link = response.data?.link || null;
    return isUsableMeetingUrl(link) ? link : null;
  };

  const openRoom = async (session, shouldJoinCall = true) => {
    setError("");
    setSelectedSession(session);
    setView("room");
    setMeetingUrl(null);
    disposeJitsi();
    onEnterRoom?.();

    setChatMessages([
      {
        id: "sys-1",
        author: "StudyBuddy",
        text: "Use the footer mic, camera and share buttons. If public Jitsi asks for a moderator, open the meeting in a new tab and log in once.",
        at: new Date().toISOString(),
      },
    ]);

    if (!shouldJoinCall) return;

    try {
      setMeetingLoading(true);
      const link = await resolveMeetingUrl(session);
      if (link) {
        setMeetingUrl(link);
      } else {
        setError(
          "No meeting link for this class yet. Ask your teacher to start the session.",
        );
        setMeetingLoading(false);
      }
    } catch (err) {
      console.error("Meeting link failed:", err);
      setError(
        err.response?.data?.detail || "Could not start the meeting. Try again.",
      );
      setMeetingLoading(false);
    }
  };

  const leaveRoom = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand("hangup");
      } catch (_) {}
    }
    disposeJitsi();
    setView("list");
    setMeetingUrl(null);
    setMeetingLoading(false);
    setShareOn(false);
    onLeaveRoom?.();
  };

  const toggleMic = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleAudio");
    } else {
      setMicOn((v) => !v);
    }
  };

  const toggleCamera = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleVideo");
    } else {
      setCameraOn((v) => !v);
    }
  };

  const toggleShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleShareScreen");
      setShareOn((v) => !v);
    } else {
      setShareOn((v) => !v);
    }
  };

  const handleMarkAttended = async (session) => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      await axios.patch(
        `${FHOST}/api/student/session-bookings/${session.id}/`,
        { attended: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSessions((previous) =>
        previous.map((item) =>
          item.id === session.id ? { ...item, attended: true } : item,
        ),
      );
      setSelectedSession((previous) =>
        previous && previous.id === session.id
          ? { ...previous, attended: true }
          : previous,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "We could not update attendance. Please try again.",
      );
    }
  };

  const sendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    // Send through Jitsi when available
    if (jitsiApiRef.current && jitsiReady) {
      try {
        jitsiApiRef.current.executeCommand("sendChatMessage", text);
      } catch (err) {
        console.error("Jitsi sendChatMessage failed:", err);
      }
    }

    // Optimistic local update so the UI feels instant
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        author: "You",
        text,
        at: new Date().toISOString(),
      },
    ]);
    setChatInput("");
  };

  const renderSessionCard = (session) => {
    const status = getSessionStatus(session);
    const canOpen = status !== "ended";
    const duration = getDurationLabel(session);
    const teacher = getTeacherLabel(session);
    const joinCount = getJoinCount(session);
    const subject = getSubjectLabel(session);
    const metaParts = [
      formatSessionDate(session.started_at),
      duration,
      teacher,
    ].filter(Boolean);

    return (
      <div
        key={session.id}
        className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#01B0F1]">
              {subject}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {session.title || "Live class"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {metaParts.join(" · ")}
            </p>
            {joinCount != null && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <FaUsers className="text-gray-400" />
                {joinCount} joining
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {statusBadge(status)}
            {status === "ended" ? (
              <button
                type="button"
                onClick={() => openRoom(session, false)}
                className="text-sm font-semibold text-[#015575] hover:underline"
              >
                View recap →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openRoom(session, true)}
                disabled={!canOpen}
                className={`text-sm font-semibold ${
                  canOpen ? "text-[#015575] hover:underline" : "text-gray-400"
                }`}
              >
                Open class →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (view === "room" && selectedSession) {
    const status = getSessionStatus(selectedSession);
    const teacher = getTeacherLabel(selectedSession);
    const subject = getSubjectLabel(selectedSession);
    const joinCount = getJoinCount(selectedSession);

    return (
      <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f7f8fa]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={leaveRoom}
              className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#01B0F1]">
                  {subject}
                </span>
                {statusBadge(status)}
              </div>
              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                {selectedSession.title || "Live class"}
              </h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <FaRegClock />
                  {formatSessionDate(selectedSession.started_at)}
                </span>
                {getDurationLabel(selectedSession) && (
                  <span>· {getDurationLabel(selectedSession)}</span>
                )}
                {joinCount != null && (
                  <span className="inline-flex items-center gap-1">
                    · <FaUsers className="text-gray-400" /> {joinCount} joining
                  </span>
                )}
                {teacher && <span>· {teacher}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={leaveRoom}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
          >
            <FaPhoneSlash /> Leave class
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex min-h-0 flex-col overflow-hidden p-2 sm:p-3">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f7fc] text-[#01B0F1]">
                    <FaDesktop />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Shared whiteboard
                    </p>
                    <p className="text-xs text-gray-500">
                      Live with everyone in class
                    </p>
                  </div>
                </div>
                {selectedSession.whiteboard_link && (
                  <a
                    href={selectedSession.whiteboard_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Open full
                  </a>
                )}
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
                {selectedSession.whiteboard_link ? (
                  <iframe
                    title={`${selectedSession.title || "Class"} whiteboard`}
                    src={selectedSession.whiteboard_link}
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-gray-500">
                    <FaDesktop className="text-3xl text-gray-300" />
                    <p className="mt-3 font-medium text-gray-700">
                      No whiteboard link yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden border-t border-gray-200 bg-white lg:border-l lg:border-t-0">
            <div className="relative shrink-0 bg-[#0f2744] px-3 pb-3 pt-3 text-white">
              <div className="relative min-h-[220px] w-full overflow-hidden rounded-xl bg-black/40 aspect-video sm:min-h-[260px]">
                {meetingLoading && !jitsiReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-sm text-blue-100">
                    Starting meeting…
                  </div>
                )}
                {meetingUrl ? (
                  <div
                    ref={jitsiContainerRef}
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 px-3 text-center text-sm text-blue-100">
                    <p>No meeting link yet</p>
                    <p className="text-xs text-blue-200/80">
                      Whiteboard still works on the left
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 px-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {teacher || "Teacher"}
                  </p>
                  <p className="text-[11px] text-blue-200">
                    {meetingLoading && !jitsiReady
                      ? "Connecting…"
                      : jitsiReady
                        ? "Use footer for mic · camera · share"
                        : meetingUrl
                          ? "Meeting link ready"
                          : "Waiting for meeting"}
                  </p>
                </div>
                {meetingUrl && (
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/25"
                    title="If public Jitsi asks for a moderator, open here and log in"
                  >
                    <FaExternalLinkAlt className="text-[10px]" />
                    Open in new tab
                  </a>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="text-[#01B0F1]">💬</span> Class chat
              </p>
              {joinCount != null && (
                <p className="text-xs text-gray-500">{joinCount} people</p>
              )}
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
              {chatMessages.map((msg) => (
                <div key={msg.id}>
                  <p className="mb-1 text-xs font-semibold text-gray-700">
                    {msg.author}
                  </p>
                  <div
                    className={`inline-block max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.author === "You"
                        ? "bg-[#e8f7fc] text-gray-800"
                        : "bg-[#eef2ff] text-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendChat}
              className="flex shrink-0 gap-2 border-t border-gray-100 p-3"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message the class..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#01B0F1] focus:bg-white focus:ring-1 focus:ring-[#01B0F1]"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#015575] text-white hover:bg-[#01415e]"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <p className="hidden items-center gap-2 text-sm text-emerald-600 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {jitsiReady
              ? "Controls linked to call"
              : meetingUrl
                ? "Meeting ready"
                : "In classroom"}
          </p>

          <div className="mx-auto flex items-center gap-2 sm:mx-0">
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                micOn
                  ? "border-gray-200 bg-gray-50 text-gray-700"
                  : "border-red-500 bg-red-500 text-white"
              }`}
              aria-label="Microphone"
              title="Toggle microphone"
            >
              <FaMicrophone />
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                cameraOn
                  ? "border-gray-200 bg-gray-50 text-gray-700"
                  : "border-red-500 bg-red-500 text-white"
              }`}
              aria-label="Camera"
              title="Toggle camera"
            >
              {cameraOn ? <FaCamera /> : <FaVideoSlash />}
            </button>
            <button
              type="button"
              onClick={toggleShare}
              className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                shareOn
                  ? "border-[#01B0F1] bg-[#01B0F1] text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
              aria-label="Share screen"
              title="Toggle screen share"
            >
              <FaShareAlt />
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              aria-label="Leave"
              title="Leave class"
            >
              <FaPhoneSlash />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!selectedSession.attended && status !== "upcoming" && (
              <button
                type="button"
                onClick={() => handleMarkAttended(selectedSession)}
                className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                Mark attended
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-0 bg-transparent">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#01B0F1]">
            StudyBuddy · Learning room
          </p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My classes
          </h1>
          <p className="mt-1 text-gray-500">
            Tap a class to open the live call, chat and whiteboard.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSessions}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <FaRedo /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadSessions}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#01B0F1]" />
          <p className="mt-4 text-gray-600">Loading your classes...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <FaBookOpen className="mx-auto text-4xl text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No classes yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Once a teacher schedules a class for you, it will appear here with
            its meeting and whiteboard links.
          </p>
        </div>
      ) : (
        <section className="mx-auto max-w-3xl space-y-8">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <FaCalendarAlt className="text-gray-400" />
              Happening now
            </h2>
            <div className="space-y-3">
              {groupedSessions.live.length ? (
                groupedSessions.live.map(renderSessionCard)
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                  No live classes right now.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <FaCalendarAlt className="text-gray-400" />
              Upcoming
            </h2>
            <div className="space-y-3">
              {groupedSessions.upcoming.length ? (
                groupedSessions.upcoming.map(renderSessionCard)
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                  No upcoming classes.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <FaCalendarAlt className="text-gray-400" />
              Past sessions
            </h2>
            <div className="space-y-3">
              {groupedSessions.ended.length ? (
                groupedSessions.ended.map(renderSessionCard)
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                  No past sessions yet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentLiveClass;
