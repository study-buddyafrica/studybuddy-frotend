import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  FaArrowLeft,
  FaCamera,
  FaDesktop,
  FaExternalLinkAlt,
  FaMicrophone,
  FaPhoneSlash,
  FaShareAlt,
  FaVideoSlash,
} from "react-icons/fa";
import { authStorage } from "../../services/authStorage";
import {
  conferencingService,
  getErrorMessage as confErr,
} from "../../services/conferencingService";

/** Block only unusable / mock providers — allow 8x8 / real Jitsi hosts from backend */
const isUsableMeetingUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase();
  if (u.includes("mock.daily")) return false;
  if (u.includes("daily.co") && !u.includes("8x8")) return false;
  return true;
};

const getMeetingUrl = (data) => {
  const raw =
    data?.teacher_meeting_link ||
    data?.student_meeting_link ||
    data?.meeting_link ||
    data?.room_url ||
    data?.link ||
    null;
  return isUsableMeetingUrl(raw) ? raw : null;
};

const parseJitsiRoom = (url) => {
  try {
    const u = new URL(url);
    const domain = u.hostname || "8x8.vc";
    const roomName = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    const hash = u.hash || "";
    const jwtMatch = hash.match(/jwt=([^&]+)/i);
    const tokenFromHash = jwtMatch ? decodeURIComponent(jwtMatch[1]) : null;
    return {
      domain,
      roomName: roomName || null,
      tokenFromHash,
    };
  } catch {
    return { domain: "8x8.vc", roomName: null, tokenFromHash: null };
  }
};

const loadJitsiScript = (domain = "8x8.vc") =>
  new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const host = domain || "8x8.vc";
    const src = `https://${host}/external_api.js`;
    const existing = document.querySelector(
      `script[src*="external_api.js"], script[data-jitsi-external-api="true"]`,
    );
    if (existing) {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () =>
          reject(new Error(`Failed to load conferencing script from ${host}`)),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.jitsiExternalApi = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load conferencing script from ${host}`));
    document.body.appendChild(script);
  });

const LiveClass = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [meetingDetails, setMeetingDetails] = useState({
    session_booking_id: "",
    topic: "",
    agenda: "",
  });
  const [bookings, setBookings] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // In-app room (teacher)
  const [view, setView] = useState("list"); // "list" | "room"
  const [roomSession, setRoomSession] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [meetingToken, setMeetingToken] = useState(null);
  const [meetingRoomName, setMeetingRoomName] = useState(null);
  const [meetingDomain, setMeetingDomain] = useState("8x8.vc");
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);

  const jitsiApiRef = useRef(null);
  const jitsiContainerRef = useRef(null);

  const disposeJitsi = useCallback(() => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (_) {
        /* ignore */
      }
      jitsiApiRef.current = null;
    }
    setJitsiReady(false);
  }, []);

  const leaveRoom = useCallback(() => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand("hangup");
      } catch (_) {
        /* ignore */
      }
    }
    disposeJitsi();
    setView("list");
    setRoomSession(null);
    setMeetingUrl(null);
    setMeetingToken(null);
    setMeetingRoomName(null);
    setMeetingDomain("8x8.vc");
    setMeetingLoading(false);
    setShareOn(false);
  }, [disposeJitsi]);

  const refreshLists = async (token) => {
    const refreshResponse = await axios.get(`${FHOST}/api/live-sessions/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessions = Array.isArray(refreshResponse.data?.results)
      ? refreshResponse.data.results
      : [];
    setLiveSessions(sessions);

    const refreshBookingsResponse = await axios.get(
      `${FHOST}/api/booked-sessions/`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const allBookings = Array.isArray(refreshBookingsResponse.data?.results)
      ? refreshBookingsResponse.data.results
      : [];
    setBookings(
      allBookings.filter((booking) => booking.is_allowed && !booking.attended),
    );
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = authStorage.getAccessToken();
        if (!token) return;
        const response = await axios.get(`${FHOST}/api/booked-sessions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allBookings = Array.isArray(response.data?.results)
          ? response.data.results
          : [];
        setBookings(
          allBookings.filter(
            (booking) => booking.is_allowed && !booking.attended,
          ),
        );
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const token = authStorage.getAccessToken();
        if (!token) return;
        const response = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessions = Array.isArray(response.data?.results)
          ? response.data.results
          : [];
        setLiveSessions(sessions);
      } catch (err) {
        console.error("Error fetching live sessions:", err);
        setLiveSessions([]);
      }
    };
    fetchLiveSessions();
  }, []);

  // 30-second automated whiteboard snapshot loop (GAP-FE-001)
  useEffect(() => {
    if (view !== "room" || !roomSession?.id) return undefined;

    const interval = setInterval(async () => {
      try {
        const sessionId = roomSession.id;
        const snapshotPayload = {
          snapshot: {
            timestamp: new Date().toISOString(),
            session_id: sessionId,
            whiteboard_link: roomSession.whiteboard_link || null,
          },
        };
        await conferencingService.whiteboard(sessionId, snapshotPayload);
      } catch (err) {
        console.warn("Whiteboard snapshot periodic save error:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [view, roomSession?.id, roomSession?.whiteboard_link]);

  // Mount Jitsi when room has a URL
  useEffect(() => {
    let cancelled = false;
    if (!meetingUrl || view !== "room") {
      return undefined;
    }

    const initJitsi = async () => {
      try {
        const parsed = parseJitsiRoom(meetingUrl);
        const domain = meetingDomain || parsed.domain || "8x8.vc";
        const roomName = meetingRoomName || parsed.roomName;
        const token = meetingToken || parsed.tokenFromHash;

        if (!roomName) {
          setMeetingLoading(false);
          setError("Invalid meeting link for this class.");
          return;
        }

        await loadJitsiScript(domain);
        if (cancelled || !jitsiContainerRef.current) return;

        disposeJitsi();

        const displayName =
          userInfo?.first_name ||
          userInfo?.full_name ||
          userInfo?.email ||
          "Teacher";

        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            startWithAudioMuted: !micOn,
            startWithVideoMuted: !cameraOn,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "hangup",
              "chat",
              "tileview",
            ],
          },
        };
        if (token) options.jwt = token;

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
        setJitsiReady(true);
        setMeetingLoading(false);

        api.addEventListener("audioMuteStatusChanged", ({ muted }) => {
          setMicOn(!muted);
        });
        api.addEventListener("videoMuteStatusChanged", ({ muted }) => {
          setCameraOn(!muted);
        });
        api.addEventListener("readyToClose", () => {
          if (!cancelled) leaveRoom();
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Teacher Jitsi init failed:", err);
          setMeetingLoading(false);
          setError(
            err.message ||
              "Could not start the in-app meeting. Try Open in new tab.",
          );
          disposeJitsi();
        }
      }
    };

    initJitsi();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingUrl, meetingToken, meetingRoomName, meetingDomain, view]);

  const openInAppRoom = async (session, preferredUrl) => {
    setError(null);
    setShowPopup(false);
    setRoomSession(session);
    setView("room");
    setMeetingUrl(null);
    setMeetingToken(null);
    setMeetingRoomName(null);
    setMeetingDomain("8x8.vc");
    disposeJitsi();
    setMeetingLoading(true);

    try {
      let url = preferredUrl || getMeetingUrl(session);
      let token = null;
      let domain = "8x8.vc";
      let roomName = null;
      let nextSession = session;

      if (conferencingService.enabled && session?.id) {
        try {
          const joined = await conferencingService.join(session.id);
          if (joined?.room_url && isUsableMeetingUrl(joined.room_url)) {
            url = joined.room_url;
            token = joined.token || null;
            domain = joined.domain || domain;
            roomName = joined.jaas_room_name || joined.room_name || null;
            if (joined.whiteboard_link) {
              nextSession = {
                ...session,
                whiteboard_link:
                  session.whiteboard_link || joined.whiteboard_link,
              };
              setRoomSession(nextSession);
            }
          }
        } catch (joinErr) {
          console.warn("Teacher join API fallback to stored link:", joinErr);
        }
      }

      if (!url || !isUsableMeetingUrl(url)) {
        throw new Error("No valid meeting link for this session.");
      }

      const parsed = parseJitsiRoom(url);
      if (!token) token = parsed.tokenFromHash;
      if (!roomName) roomName = parsed.roomName;
      domain = domain || parsed.domain || "8x8.vc";

      if (token && !url.includes("#jwt=")) {
        url = `${url}#jwt=${token}`;
      }

      setMeetingUrl(url);
      setMeetingToken(token);
      setMeetingRoomName(roomName);
      setMeetingDomain(domain);
    } catch (err) {
      setMeetingLoading(false);
      setError(confErr(err, err.message || "Could not open classroom."));
      setView("list");
    }
  };

  const handleEndClass = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      if (conferencingService.enabled) {
        const result = await conferencingService.complete(sessionId);
        const status = result?.settlement_status || "done";
        alert(result?.message || `Class ended. Settlement: ${status}`);
      } else {
        alert("Complete API not enabled yet.");
      }
      const token = authStorage.getAccessToken();
      if (token) await refreshLists(token);
      setShowPopup(false);
      setMeetingData(null);
      leaveRoom();
    } catch (err) {
      setError(confErr(err, "Could not end class."));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        throw new Error("You are not authenticated. Please login again.");
      }
      if (!meetingDetails.session_booking_id) {
        throw new Error("Please select a booking session.");
      }
      if (!meetingDetails.topic.trim()) {
        throw new Error("Please enter a class topic.");
      }
      if (!meetingDetails.agenda.trim()) {
        throw new Error("Please enter a class description.");
      }

      if (conferencingService.enabled) {
        try {
          const init = await conferencingService.initialize(
            meetingDetails.session_booking_id,
            {
              title: meetingDetails.topic.trim(),
              description: meetingDetails.agenda.trim(),
            },
          );
          let meetLink = init?.room_url;
          if (!isUsableMeetingUrl(meetLink)) {
            throw new Error(
              "Classroom initialization failed: no valid meeting URL returned.",
            );
          }
          if (init.token && !meetLink.includes("#jwt=")) {
            meetLink = `${meetLink}#jwt=${init.token}`;
          }
          const created = {
            id: init.live_session_id,
            session_booking_id: meetingDetails.session_booking_id,
            teacher_meeting_link: meetLink,
            meetLink,
            whiteboard_link: init.whiteboard_link,
            title: meetingDetails.topic.trim(),
            description: meetingDetails.agenda.trim(),
          };
          setMeetingData(created);
          setShowPopup(true);
          setMeetingDetails({
            session_booking_id: "",
            topic: "",
            agenda: "",
          });
          await refreshLists(token);
          setLoading(false);
          return;
        } catch (initErr) {
          throw new Error(
            confErr(initErr, "Failed to initialize live classroom."),
          );
        }
      }

      const payload = {
        session_booking_id: meetingDetails.session_booking_id,
        title: meetingDetails.topic.trim(),
        description: meetingDetails.agenda.trim(),
      };
      const response = await axios.post(
        `${FHOST}/api/teacher/live-session/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        const data = response.data;
        const meetLink = getMeetingUrl(data);
        if (!meetLink) {
          throw new Error(
            "Live session was created, but no valid meeting link was returned.",
          );
        }
        setMeetingData({
          id: data?.id || null,
          ...data,
          meetLink,
          title: data?.title || meetingDetails.topic,
          description: data?.description || meetingDetails.agenda,
        });
        setShowPopup(true);
        setMeetingDetails({
          session_booking_id: "",
          topic: "",
          agenda: "",
        });
        await refreshLists(token);
      }
    } catch (err) {
      const text = confErr(err, err?.message || "");
      if (String(text).toLowerCase().includes("already exists")) {
        setError(
          "A live session for this booking already exists. Open My Live Sessions to join.",
        );
      } else {
        setError(text || "Error creating meeting.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (jitsiApiRef.current) jitsiApiRef.current.executeCommand("toggleAudio");
    else setMicOn((v) => !v);
  };
  const toggleCamera = () => {
    if (jitsiApiRef.current) jitsiApiRef.current.executeCommand("toggleVideo");
    else setCameraOn((v) => !v);
  };
  const toggleShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleShareScreen");
      setShareOn((v) => !v);
    } else setShareOn((v) => !v);
  };

  // ——— In-app classroom (teacher) ———
  if (view === "room" && roomSession) {
    const wb = roomSession.whiteboard_link;
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f7f8fa] font-josefin">
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#01B0F1]">
                Teacher · Live class
              </p>
              <h1 className="truncate font-lilita text-lg text-[#015575] sm:text-xl">
                {roomSession.title || "Live class"}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {roomSession.id && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleEndClass(roomSession.id)}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                End class
              </button>
            )}
            <button
              type="button"
              onClick={leaveRoom}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FaPhoneSlash /> Leave room
            </button>
          </div>
        </header>

        {error && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
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
                      Visible to the class
                    </p>
                  </div>
                </div>
                {wb && (
                  <a
                    href={wb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Open full
                  </a>
                )}
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
                {wb ? (
                  <iframe
                    title="Whiteboard"
                    src={wb}
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-gray-500">
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
              <div className="relative aspect-video min-h-[220px] w-full overflow-hidden rounded-xl bg-black/40 sm:min-h-[260px]">
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
                  <div className="flex h-full items-center justify-center px-3 text-center text-sm text-blue-100">
                    {error || "No meeting link yet"}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 px-1">
                <p className="text-[11px] text-blue-200">
                  {jitsiReady
                    ? "Connected · use footer controls"
                    : meetingLoading
                      ? "Connecting…"
                      : "Meeting area"}
                </p>
                {meetingUrl && (
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-white/25"
                  >
                    <FaExternalLinkAlt className="text-[10px]" />
                    Open in new tab
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${
              micOn
                ? "border-gray-200 bg-gray-50 text-gray-700"
                : "border-red-500 bg-red-500 text-white"
            }`}
            aria-label="Microphone"
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
          >
            <FaShareAlt />
          </button>
          <button
            type="button"
            onClick={leaveRoom}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            aria-label="Leave"
          >
            <FaPhoneSlash />
          </button>
        </footer>
      </div>
    );
  }

  // ——— List / create UI ———
  return (
    <div className="min-h-full bg-[#F8FAFC] p-4 font-josefin sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
            Live classes
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a session from a booking, then open the classroom with video
            and whiteboard in one screen.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "create"
                  ? "border-b-2 border-[#015575] text-[#015575]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create one-on-one session
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "sessions"
                  ? "border-b-2 border-[#015575] text-[#015575]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My live sessions
            </button>
          </div>

          {activeTab === "create" && (
            <form className="space-y-6" onSubmit={handleCreateMeeting}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select booking session <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetingDetails.session_booking_id}
                  onChange={(e) =>
                    setMeetingDetails({
                      ...meetingDetails,
                      session_booking_id: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#015575]"
                  required
                >
                  <option value="">Choose a booking session</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {(booking.course_title ||
                        booking.course?.title ||
                        `Course ${booking.course}`) +
                        " · " +
                        (booking.scheduled_start
                          ? new Date(booking.scheduled_start).toLocaleString()
                          : "Time TBD") +
                        " · " +
                        (booking.status || "")}
                    </option>
                  ))}
                </select>
                {bookings.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No accepted bookings available.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={meetingDetails.topic}
                  onChange={(e) =>
                    setMeetingDetails({
                      ...meetingDetails,
                      topic: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#015575]"
                  placeholder="Enter class topic"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={meetingDetails.agenda}
                  onChange={(e) =>
                    setMeetingDetails({
                      ...meetingDetails,
                      agenda: e.target.value,
                    })
                  }
                  className="h-32 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#015575]"
                  placeholder="Describe the class content"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#015575] py-3 text-white hover:bg-[#01415e] disabled:opacity-50"
              >
                {loading ? (
                  "Creating…"
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Create live session
                  </>
                )}
              </button>
              {error && (
                <div className="rounded-xl bg-red-100 p-3 text-center text-red-700">
                  {error}
                </div>
              )}
            </form>
          )}

          {activeTab === "sessions" && (
            <div>
              {liveSessions.length === 0 ? (
                <p className="text-center text-gray-500">
                  No live sessions found.
                </p>
              ) : (
                <div className="space-y-4">
                  {liveSessions.map((session) => {
                    const usableLink = getMeetingUrl(session);
                    return (
                      <div
                        key={session.id}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-[#015575]">
                            {session.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleEndClass(session.id)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                            disabled={loading}
                          >
                            End class
                          </button>
                        </div>
                        <p className="mb-2 text-gray-600">
                          {session.description}
                        </p>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openInAppRoom(session, usableLink)}
                            className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                          >
                            Open classroom
                          </button>
                          {session.whiteboard_link && (
                            <a
                              href={session.whiteboard_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                            >
                              Whiteboard only
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>
                            Started:{" "}
                            {session.started_at
                              ? new Date(session.started_at).toLocaleString()
                              : "—"}
                          </p>
                          <p>
                            Ended:{" "}
                            {session.ended_at
                              ? new Date(session.ended_at).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPopup && meetingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center font-josefin">
            <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 font-lilita text-2xl text-[#015575]">
              Live session created
            </h2>
            <p className="mb-6 text-gray-600">
              Open the in-app classroom (video + whiteboard together). Students
              join from their dashboard.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openInAppRoom(meetingData, meetingData.meetLink)}
                className="w-full rounded-xl bg-[#015575] py-2 text-white hover:bg-[#01415e]"
              >
                Open classroom
              </button>
              {meetingData.id && (
                <button
                  type="button"
                  onClick={() => handleEndClass(meetingData.id)}
                  className="w-full rounded-xl bg-red-600 py-2 text-white hover:bg-red-700"
                >
                  End class
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  setMeetingData(null);
                }}
                className="w-full rounded-xl bg-gray-200 py-2 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClass;
