import React, { useEffect, useMemo, useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCamera,
  FaExternalLinkAlt,
  FaMicrophone,
  FaPhoneSlash,
  FaRegClock,
  FaRedo,
  FaShareAlt,
  FaVolumeUp,
  FaVideo,
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
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const StudentLiveClass = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [leftClass, setLeftClass] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    setError("");

    let token = authStorage.getAccessToken();
    if (!token && authStorage.getRefreshToken()) {
      try {
        token = await authService.refreshToken();
      } catch (refreshError) {
        console.error("Unable to refresh the class session:", refreshError);
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
  }, [sessions]);

  const selectSession = (session) => {
    setSelectedSession(session);
    setLeftClass(false);
    setIsJoining(false);
  };

  const joinClass = (session) => {
    if (!session.student_meeting_link) return;
    setSelectedSession(session);
    setLeftClass(false);
    setIsJoining(true);
    window.open(session.student_meeting_link, "_blank", "noopener,noreferrer");
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
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "We could not update attendance. Please try again.",
      );
    }
  };

  const renderSessionCard = (session) => {
    const status = getSessionStatus(session);
    const isSelected = selectedSession?.id === session.id;
    const canJoin = Boolean(session.student_meeting_link) && status !== "ended";

    return (
      <button
        key={session.id}
        type="button"
        onClick={() => selectSession(session)}
        className={`w-full rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
          isSelected
            ? "border-[#01B0F1] bg-[#f2fbff] shadow-sm"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">
              {session.title || "Live class"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {formatSessionDate(session.started_at)}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              status === "live"
                ? "bg-green-100 text-green-700"
                : status === "ended"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {status === "live" ? "Live now" : status}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          {session.description ||
            "Your teacher has not added a class description yet."}
        </p>
        <span
          className={`mt-3 inline-flex items-center gap-2 text-sm font-semibold ${canJoin ? "text-[#015575]" : "text-gray-400"}`}
        >
          <FaVideo />{" "}
          {canJoin
            ? "Join class"
            : status === "ended"
              ? "Class ended"
              : "Link pending"}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#01B0F1]">
              Learning room
            </p>
            <h1 className="text-2xl font-bold text-[#015575] sm:text-3xl">
              Your live classes
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Join a scheduled class, keep the whiteboard close, and leave when
              you are done.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <FaRedo /> Refresh classes
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
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#01B0F1]" />
            <p className="mt-4 text-gray-600">Loading your classes...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
            <section className="space-y-5">
              {groupedSessions.live.length > 0 && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Live now
                  </h2>
                  <div className="space-y-3">
                    {groupedSessions.live.map(renderSessionCard)}
                  </div>
                </div>
              )}
              <div>
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                  <FaCalendarAlt className="text-[#01B0F1]" />
                  Upcoming classes
                </h2>
                <div className="space-y-3">
                  {groupedSessions.upcoming.length ? (
                    groupedSessions.upcoming.map(renderSessionCard)
                  ) : (
                    <p className="rounded-xl bg-white p-4 text-sm text-gray-500">
                      No upcoming classes.
                    </p>
                  )}
                </div>
              </div>
              {groupedSessions.ended.length > 0 && (
                <details className="rounded-xl border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700">
                    Past classes ({groupedSessions.ended.length})
                  </summary>
                  <div className="mt-3 space-y-3">
                    {groupedSessions.ended.map(renderSessionCard)}
                  </div>
                </details>
              )}
            </section>

            <section className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
              {!selectedSession ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center text-gray-500">
                  <FaVideo className="text-4xl text-gray-300" />
                  <p className="mt-4 font-semibold text-gray-700">
                    Select a class to see the classroom
                  </p>
                  <p className="mt-1 text-sm">
                    Your meeting, whiteboard, and session controls will appear
                    here.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="border-b border-gray-200 p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          {getSessionStatus(selectedSession) === "live"
                            ? "Live classroom"
                            : "Scheduled classroom"}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-[#015575]">
                          {selectedSession.title || "Live class"}
                        </h2>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <FaRegClock />
                          {formatSessionDate(selectedSession.started_at)}
                        </p>
                      </div>
                      {getSessionStatus(selectedSession) !== "ended" &&
                        selectedSession.student_meeting_link &&
                        !leftClass && (
                          <button
                            type="button"
                            onClick={() => joinClass(selectedSession)}
                            disabled={isJoining}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#015575] px-4 py-2 text-sm font-semibold text-white hover:bg-[#01415e] disabled:opacity-60"
                          >
                            <FaVideo />{" "}
                            {isJoining ? "Meeting opened" : "Join class"}
                          </button>
                        )}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {selectedSession.description ||
                        "Your teacher has not added a description for this class."}
                    </p>
                  </div>

                  <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(250px,0.75fr)]">
                    <div className="rounded-xl bg-[#102a43] p-5 text-white">
                      <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
                        <FaVideo className="text-4xl text-[#8bdcf7]" />
                        <h3 className="mt-4 text-lg font-semibold">
                          {leftClass
                            ? "You left this classroom"
                            : "Meeting controls"}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-blue-100">
                          The meeting opens in a secure browser tab. Use these
                          controls to prepare locally, then use the meeting
                          provider controls for the live call.
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-white/20 pt-4">
                        <button
                          type="button"
                          onClick={() => setMicOn((value) => !value)}
                          aria-label={
                            micOn ? "Mute microphone" : "Unmute microphone"
                          }
                          className={`rounded-full p-3 ${micOn ? "bg-white/15" : "bg-red-500"}`}
                        >
                          <FaMicrophone />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCameraOn((value) => !value)}
                          aria-label={
                            cameraOn ? "Turn camera off" : "Turn camera on"
                          }
                          className={`rounded-full p-3 ${cameraOn ? "bg-white/15" : "bg-red-500"}`}
                        >
                          {cameraOn ? <FaCamera /> : <FaVideoSlash />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpeakerOn((value) => !value)}
                          aria-label={
                            speakerOn ? "Mute speakers" : "Unmute speakers"
                          }
                          className={`rounded-full p-3 ${speakerOn ? "bg-white/15" : "bg-red-500"}`}
                        >
                          <FaVolumeUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareOn((value) => !value)}
                          aria-label={shareOn ? "Stop sharing" : "Share screen"}
                          className={`rounded-full p-3 ${shareOn ? "bg-[#01B0F1]" : "bg-white/15"}`}
                        >
                          <FaShareAlt />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeftClass(true)}
                          aria-label="Leave classroom"
                          className="rounded-full bg-red-500 p-3 hover:bg-red-600"
                        >
                          <FaPhoneSlash />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-800">
                          Whiteboard
                        </h3>
                        {selectedSession.whiteboard_link && (
                          <FaExternalLinkAlt className="text-gray-400" />
                        )}
                      </div>
                      {selectedSession.whiteboard_link ? (
                        <>
                          <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                            <iframe
                              title={`${selectedSession.title || "Class"} whiteboard`}
                              src={selectedSession.whiteboard_link}
                              className="h-full w-full border-0"
                            />
                          </div>
                          <a
                            href={selectedSession.whiteboard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#015575] hover:underline"
                          >
                            <FaExternalLinkAlt /> Open in a new tab
                          </a>
                        </>
                      ) : (
                        <p className="mt-4 text-sm text-gray-500">
                          Your teacher has not shared a whiteboard for this
                          class.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500">
                      {selectedSession.attended
                        ? "Attendance recorded"
                        : "Remember to mark attendance after class."}
                    </span>
                    {!selectedSession.attended &&
                      getSessionStatus(selectedSession) !== "upcoming" && (
                        <button
                          type="button"
                          onClick={() => handleMarkAttended(selectedSession)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Mark attended
                        </button>
                      )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLiveClass;
