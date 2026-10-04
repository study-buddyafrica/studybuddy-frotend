import React, { useState, useEffect } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { authStorage } from "../../services/authStorage";

/** Reject old Daily mock links; only real meeting URLs. */
const isUsableMeetingUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase();
  if (u.includes("mock.daily") || u.includes("daily.co")) return false;
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

const LiveClass = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [meetingDetails, setMeetingDetails] = useState({
    session_booking_id: "",
    topic: "",
    agenda: "",
    start_time: "",
    duration: 45,
    timezone: "UTC",
  });
  const [bookings, setBookings] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = authStorage.getAccessToken();
        if (!token) return;

        const response = await axios.get(`${FHOST}/api/booked-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        const allBookings = Array.isArray(data?.results) ? data.results : [];

        const availableBookings = allBookings.filter(
          (booking) => booking.is_allowed && !booking.attended,
        );
        setBookings(availableBookings);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        const sessions = Array.isArray(data?.results) ? data.results : [];
        setLiveSessions(sessions);
      } catch (err) {
        console.error("Error fetching live sessions:", err);
        setLiveSessions([]);
      }
    };

    fetchLiveSessions();
  }, []);

  const handleUpdateLiveSession = async (sessionId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        throw new Error("You are not authenticated. Please login again.");
      }

      const response = await axios.patch(
        `${FHOST}/api/teacher/live-session/update/${sessionId}/`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setLiveSessions((prevSessions) =>
          prevSessions.map((s) => (s.id === sessionId ? response.data : s)),
        );
        alert("Session marked as attended successfully!");
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const details =
        typeof data === "string"
          ? data
          : data?.error || data?.message || data?.details;
      const msg =
        details ||
        (status ? `Request failed with status ${status}` : err?.message) ||
        "Error marking session as attended.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const openJitsi = async () => {
    const token = authStorage.getAccessToken();
    const res = await axios.get(`${FHOST}/api/jitsi/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const link = res.data?.link;
    if (!link) throw new Error("No meeting link returned.");
    window.open(link, "_blank", "noopener,noreferrer");
    return link;
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

      const payload = {
        session_booking_id: meetingDetails.session_booking_id,
        title: meetingDetails.topic,
        description: meetingDetails.agenda,
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

        let meetLink = getMeetingUrl(data);
        let studentLink = isUsableMeetingUrl(data?.student_meeting_link)
          ? data.student_meeting_link
          : meetLink;
        const whiteboardLink = data?.whiteboard_link || null;

        // Mock Daily or missing link → generate Jitsi
        if (!meetLink) {
          try {
            const jitsiRes = await axios.get(`${FHOST}/api/jitsi/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            meetLink = jitsiRes.data?.link || null;
            studentLink = meetLink;
          } catch (jitsiErr) {
            console.warn("Jitsi fallback failed:", jitsiErr);
          }
        }

        setMeetingData({
          id: data?.id || null,
          session_booking_id: meetingDetails.session_booking_id,
          meetLink,
          studentLink,
          whiteboardLink,
          title: data?.title || meetingDetails.topic,
          description: data?.description || meetingDetails.agenda,
          startedAt: data?.started_at || null,
          endedAt: data?.ended_at || null,
        });
        setShowPopup(true);

        setMeetingDetails({
          session_booking_id: "",
          topic: "",
          agenda: "",
          start_time: "",
          duration: 45,
          timezone: "UTC",
        });

        const refreshResponse = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const refreshData = refreshResponse.data;
        const sessions = Array.isArray(refreshData?.results)
          ? refreshData.results
          : [];
        setLiveSessions(sessions);

        const refreshBookingsResponse = await axios.get(
          `${FHOST}/api/booked-sessions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const refreshBookingsData = refreshBookingsResponse.data;
        const allBookings = Array.isArray(refreshBookingsData?.results)
          ? refreshBookingsData.results
          : [];
        const availableBookings = allBookings.filter(
          (booking) => booking.is_allowed && !booking.attended,
        );
        setBookings(availableBookings);
      } else {
        setError("Unexpected response from server while creating meeting.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      let details =
        typeof data === "string"
          ? data
          : data?.error ||
            data?.message ||
            data?.details ||
            data?.non_field_errors ||
            (Array.isArray(data) ? data.join(" ") : null);

      if (Array.isArray(details)) details = details.join(" ");

      const text = String(details || err?.message || "");
      if (text.toLowerCase().includes("already exists")) {
        setError(
          "A live session for this booking already exists. Open My Live Sessions to join.",
        );
      } else {
        const msg =
          details ||
          (status ? `Request failed with status ${status}` : err?.message) ||
          "Error creating meeting. Please check your inputs.";
        setError(String(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-josefin p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-8 text-center text-3xl font-lilita text-[#015575]">
          Live Classes Management
        </h1>

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
            Create one on one session
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
            My Live Sessions
          </button>
        </div>

        {activeTab === "create" && (
          <div>
            <h2 className="mb-6 text-center text-2xl font-lilita text-[#015575]">
              Schedule New Class
            </h2>

            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Booking Session <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetingDetails.session_booking_id}
                  onChange={(e) =>
                    setMeetingDetails({
                      ...meetingDetails,
                      session_booking_id: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#015575]"
                  required
                >
                  <option value="">Choose a booking session</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      Course {booking.course} -{" "}
                      {new Date(booking.scheduled_start).toLocaleString()} -{" "}
                      {booking.status}
                    </option>
                  ))}
                </select>
                {bookings.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No accepted or confirmed bookings available. Please accept a
                    booking request first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class Topic
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#015575]"
                  placeholder="Enter class topic"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class Description
                </label>
                <textarea
                  value={meetingDetails.agenda}
                  onChange={(e) =>
                    setMeetingDetails({
                      ...meetingDetails,
                      agenda: e.target.value,
                    })
                  }
                  className="h-32 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#015575]"
                  placeholder="Describe the class content"
                  required
                />
              </div>

              {meetingDetails.session_booking_id && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> The session time and duration will be
                    determined by the selected booking.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateMeeting}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#015575] py-3 text-white transition hover:bg-[#01415e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Create Live Session
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 rounded-xl bg-red-100 p-3 text-center text-red-700">
                  {error}
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === "sessions" && (
          <div>
            <h2 className="mb-6 text-center text-2xl font-lilita text-[#015575]">
              My Live Sessions
            </h2>
            {liveSessions.length === 0 ? (
              <p className="text-center text-gray-500">
                No live sessions found.
              </p>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => {
                  const usableLink = isUsableMeetingUrl(
                    session.teacher_meeting_link,
                  )
                    ? session.teacher_meeting_link
                    : isUsableMeetingUrl(session.student_meeting_link)
                      ? session.student_meeting_link
                      : null;

                  return (
                    <div
                      key={session.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-[#015575]">
                          {session.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLiveSession(session.id, {
                              session_booking_id: session.id,
                              title: session.title,
                              description: session.description,
                            })
                          }
                          className="rounded-lg bg-[#015575] px-3 py-1 text-sm text-white transition hover:bg-[#01415e]"
                          disabled={loading}
                        >
                          Mark as Attended
                        </button>
                      </div>
                      <p className="mb-2 text-gray-600">
                        {session.description}
                      </p>
                      <div className="mb-2 flex gap-2">
                        {usableLink ? (
                          <a
                            href={usableLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600"
                          >
                            Join class
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await openJitsi();
                              } catch (_) {
                                alert("Could not generate a meeting link.");
                              }
                            }}
                            className="inline-block rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600"
                          >
                            Generate & join
                          </button>
                        )}
                        {session.whiteboard_link && (
                          <a
                            href={session.whiteboard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
                          >
                            Open Whiteboard
                          </a>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <p>
                          Started:{" "}
                          {session.started_at
                            ? new Date(session.started_at).toLocaleString()
                            : "Not started"}
                        </p>
                        <p>
                          Ended:{" "}
                          {session.ended_at
                            ? new Date(session.ended_at).toLocaleString()
                            : "Not ended"}
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

      {showPopup && meetingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircleIcon className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-semibold text-[#015575]">
                Live Session Created!
              </h2>
              <p className="mb-6 text-gray-600">
                Open the meeting below (Jitsi). Students should use the same
                class link from their dashboard when the backend saves it on the
                session.
              </p>

              {meetingData.meetLink && (
                <div className="mb-4 w-full space-y-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <label className="mb-2 block text-left text-xs font-medium text-gray-500">
                      Teacher Meeting Link:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={meetingData.meetLink}
                        readOnly
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#015575]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(meetingData.meetLink);
                          alert("Link copied to clipboard!");
                        }}
                        className="rounded-lg bg-[#015575] px-3 py-2 text-sm text-white transition hover:bg-[#01415e]"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {meetingData.studentLink && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <label className="mb-2 block text-left text-xs font-medium text-gray-500">
                        Student Meeting Link:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={meetingData.studentLink}
                          readOnly
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#015575]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              meetingData.studentLink,
                            );
                            alert("Link copied to clipboard!");
                          }}
                          className="rounded-lg bg-[#015575] px-3 py-2 text-sm text-white transition hover:bg-[#01415e]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {meetingData.whiteboardLink && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <label className="mb-2 block text-left text-xs font-medium text-gray-500">
                        Whiteboard Link:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={meetingData.whiteboardLink}
                          readOnly
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#015575]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              meetingData.whiteboardLink,
                            );
                            alert("Link copied to clipboard!");
                          }}
                          className="rounded-lg bg-[#015575] px-3 py-2 text-sm text-white transition hover:bg-[#01415e]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    const url = meetingData.meetLink || meetingData.studentLink;
                    if (url && isUsableMeetingUrl(url)) {
                      window.open(url, "_blank", "noopener,noreferrer");
                      return;
                    }
                    try {
                      await openJitsi();
                    } catch (_) {
                      alert(
                        "No meeting URL returned. Check create response or GET /api/jitsi/.",
                      );
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#015575] py-2 text-white transition hover:bg-[#01415e]"
                >
                  Join Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setMeetingData(null);
                  }}
                  className="w-full rounded-xl bg-gray-200 py-2 text-gray-700 transition hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClass;
