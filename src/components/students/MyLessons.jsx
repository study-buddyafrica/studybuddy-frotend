import React, { useState, useEffect } from "react";
import VideoLesson from "./VideoLessons";
import StudentLiveClass from "./StudentLiveClass";
import Forum from "./Forum";
import UpcomingLessons from "./UpcomingLessons";
import { FaCalendarAlt, FaCreditCard, FaClock, FaVideo, FaBookOpen, FaDollarSign, FaUsers, FaPlus } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";
import { authStorage } from "../../services/authStorage";


const isUsableMeetingUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase();
  if (u.includes("mock.daily") || u.includes("daily.co")) return false;
  return true;
};

const openJitsiMeeting = async () => {
  const token = authStorage.getAccessToken();
  const res = await axios.get(`${FHOST}/api/jitsi/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (res.data?.link) {
    window.open(res.data.link, "_blank", "noopener,noreferrer");
  } else {
    alert("No meeting link returned.");
  }
};

const MyLessons = ({ userInfo, darkMode, onEnterRoom, onLeaveRoom }) => {
  const [activeTab, setActiveComponent] = useState("liveClasses");
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [courseSubTab, setCourseSubTab] = useState("enrolled");
  const [peerToPeerSessions, setPeerToPeerSessions] = useState([]);
  const [selectedEnrolledCourse, setSelectedEnrolledCourse] = useState(null);
  const [showCourseDetailsTab, setShowCourseDetailsTab] = useState(false);
  const [showCreatePeerToPeerModal, setShowCreatePeerToPeerModal] =
    useState(false);
  const [roomFocus, setRoomFocus] = useState(false);
  const [newPeerToPeer, setNewPeerToPeer] = useState({
    title: "",
    description: "",
    course: "",
    started_at: "",
    duration_hours: "",
  });

  useEffect(() => {
    fetchScheduledLessons();
    fetchEnrolledCourses();
    fetchAvailableCourses();
    fetchCourses();
    fetchPeerToPeerSessions();
  }, []);

  const fetchScheduledLessons = async () => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        console.error("No access token available");
        return;
      }

      let response;
      try {
        response = await axios.get(`${FHOST}/api/student/session-bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (newError) {
        response = await axios.get(
          `${FHOST}/api/student/session-bookings/${userInfo?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      const bookingsList = response.data?.results || response.data || [];
      if (Array.isArray(bookingsList)) {
        // Map bookings into the expected UI shape
        const mapped = bookingsList.map((b) => ({
          id: b.id,
          teacher_id: b.teacher_id,
          teacher_name: b.teacher_name || b.teacher_id,
          subject: b.subject || "Lesson",
          date: b.scheduled_start || b.session_datetime,
          time: b.scheduled_start
            ? new Date(b.scheduled_start).toLocaleTimeString()
            : b.session_datetime || "",
          scheduled_start: b.scheduled_start,
          scheduled_end: b.scheduled_end,
          status: b.status,
          cost: Math.abs(parseFloat(b.cost || 0)),
          payment_status:
            b.status === "accepted" || b.status === "confirmed"
              ? "pending"
              : "n/a",
          is_allowed: b.is_allowed,
          attended: b.attended,
          duration_hours: b.duration_hours,
          course: b.course,
        }));
        setScheduledLessons(mapped);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setScheduledLessons([]);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${FHOST}/api/student/enrolled/courses/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const coursesList = response.data?.results || response.data || [];
      if (Array.isArray(coursesList)) {
        setEnrolledCourses(coursesList);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) return;

      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesList = response.data?.results || response.data || [];
      if (Array.isArray(coursesList)) {
        setAvailableCourses(coursesList);
      }
    } catch (error) {
      console.error("Error fetching available courses:", error);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) return;

      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesList = response.data?.results || response.data || [];
      if (Array.isArray(coursesList)) {
        setCourses(coursesList);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const fetchPeerToPeerSessions = async () => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) return;

      const response = await axios.get(`${FHOST}/api/peer-to-peer-sessions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sessionsList = response.data?.results || response.data || [];
      if (Array.isArray(sessionsList)) {
        setPeerToPeerSessions(sessionsList);
      }
    } catch (error) {
      console.error("Error fetching peer-to-peer sessions:", error);
      setPeerToPeerSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (lessonId, amount) => {
    try {
      const response = await axios.post(`${FHOST}/payments/pay_teacher`, {
        payer_id: userInfo?.id,
        teacher_id: scheduledLessons.find((l) => l.id === lessonId)?.teacher_id,
        amount: amount,
      });

      if (response.status === 200) {
        // Refresh data after successful payment
        fetchScheduledLessons();
        alert("Payment processed successfully!");
      }
    } catch (error) {
      alert("Payment failed. Please try again.");
    }
  };

  const handleRescheduleBooking = async (bookingId, booking) => {
    const newDate = prompt(
      "Enter new date and time (YYYY-MM-DDTHH:MM format):",
    );
    if (!newDate) return;

    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const scheduledStart = new Date(newDate).toISOString();
      const durationHours = booking.duration_hours || 1;

      const payload = {
        teacher_id: booking.teacher_id,
        scheduled_start: scheduledStart,
        duration_hours: durationHours,
        course: booking.course,
      };

      const response = await axios.patch(
        `${FHOST}/api/student/session-bookings/${bookingId}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert("Booking rescheduled successfully!");
        fetchScheduledLessons();
      }
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to reschedule booking. Please try again.";
      alert(errorMsg);
    }
  };

  const handleMarkAttended = async (bookingId, booking) => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const scheduledStart = booking.scheduled_start
        ? new Date(booking.scheduled_start).toISOString()
        : new Date().toISOString();
      const durationHours = booking.duration_hours || 1;

      const payload = {
        teacher_id: booking.teacher_id,
        scheduled_start: scheduledStart,
        duration_hours: durationHours,
        course: booking.course,
      };

      const response = await axios.patch(
        `${FHOST}/api/student/session-bookings/${bookingId}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert(
          "Booking marked as attended! Teacher payment has been processed.",
        );
        fetchScheduledLessons();
      }
    } catch (error) {
      console.error("Error marking booking as attended:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to mark as attended. Please try again.";
      alert(errorMsg);
    }
  };

  const handleJoinLiveSession = async (bookingId) => {
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
      if (!bookingId) {
        alert("Missing session booking id.");
        return;
      }

      // Open in-app Live Classes (Jitsi + whiteboard live in StudentLiveClass)
      setActiveComponent("liveClasses");
    } catch (error) {
      console.error("Error opening live classes:", error);
      alert("Could not open live classes. Please try again.");
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(true);
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const response = await axios.post(
        `${FHOST}/api/courses/enrollments/`,
        { course_id: courseId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        alert("Enrolled successfully!");
        fetchEnrolledCourses();
        fetchAvailableCourses(); // Refresh available courses if needed
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      const errorData = error.response?.data;
      let errorMsg = "Failed to enroll in course. Please try again.";
      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        errorMsg = errorData.errors[0].detail;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.error) {
        errorMsg = errorData.error;
      } else if (errorData?.detail) {
        errorMsg = errorData.detail;
      }
      alert(errorMsg);
    } finally {
      setEnrolling(false);
    }
  };

  const handleAccessCourse = async (enrollmentId) => {
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${FHOST}/api/student/enrolled/course/${enrollmentId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedEnrolledCourse(response.data);
      setShowCourseDetailsTab(true);
      setActiveComponent("courseDetails");
    } catch (error) {
      console.error("Error fetching enrolled course:", error);
      alert("Failed to access course. Please try again.");
    }
  };

  const handleCreatePeerToPeer = async (event) => {
    event.preventDefault();
    try {
      const token = authStorage.getAccessToken(); // ← changed
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      let startedAt = newPeerToPeer.started_at;
      if (startedAt && startedAt.length === 16) {
        startedAt += ":00";
      }

      const payload = {
        title: newPeerToPeer.title.trim(),
        description: newPeerToPeer.description.trim(),
        course: newPeerToPeer.course,
        started_at: startedAt,
        duration_hours: parseInt(newPeerToPeer.duration_hours),
      };

      const response = await axios.post(
        `${FHOST}/api/peer-to-peer-sessions/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        alert("Peer-to-peer session created successfully!");
        setShowCreatePeerToPeerModal(false);
        setNewPeerToPeer({
          title: "",
          description: "",
          course: "",
          started_at: "",
          duration_hours: "",
        });
        fetchPeerToPeerSessions();
      }
    } catch (error) {
      console.error("Error creating peer-to-peer session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  return (
    <div
      className={
        roomFocus
          ? "h-full min-h-0 overflow-hidden bg-white text-gray-800"
          : "min-h-screen bg-white text-gray-800"
      }
    >
      {/* Navigation Buttons */}
      {!roomFocus && (
        <nav className="mb-6 rounded-lg bg-white px-6 py-4 text-gray-800 shadow-lg">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className={`rounded-lg px-6 py-2 text-white transition-all ${
                activeTab === "liveClasses"
                  ? "bg-blue-800 shadow-lg"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={() => setActiveComponent("liveClasses")}
            >
              <FaVideo className="mr-2 inline" />
              Live Classes
            </button>
            <button
              className={`rounded-lg px-6 py-2 text-white transition-all ${
                activeTab === "enrolledCourses"
                  ? "bg-blue-800 shadow-lg"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={() => setActiveComponent("enrolledCourses")}
            >
              <FaBookOpen className="mr-2 inline" />
              My Courses
            </button>
            <button
              className={`rounded-lg px-6 py-2 text-white transition-all ${
                activeTab === "peerToPeer"
                  ? "bg-blue-800 shadow-lg"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={() => setActiveComponent("peerToPeer")}
            >
              <FaUsers className="mr-2 inline" />
              Peer-to-Peer
            </button>
            {showCourseDetailsTab && (
              <button
                className={`rounded-lg px-6 py-2 text-white transition-all ${
                  activeTab === "courseDetails"
                    ? "bg-blue-800 shadow-lg"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
                onClick={() => setActiveComponent("courseDetails")}
              >
                <FaBookOpen className="mr-2 inline" />
                Course Details
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Content */}
      <div
        className={
          roomFocus
            ? "h-full min-h-0 overflow-hidden p-0"
            : "rounded-lg bg-white p-6 shadow-lg"
        }
      >
        {activeTab === "liveClasses" && (
          <div className={roomFocus ? "h-full min-h-0 overflow-hidden" : ""}>
            <StudentLiveClass
              userInfo={userInfo}
              darkMode={darkMode}
              onEnterRoom={() => {
                setRoomFocus(true);
                onEnterRoom?.();
              }}
              onLeaveRoom={() => {
                setRoomFocus(false);
                onLeaveRoom?.();
              }}
            />
          </div>
        )}

        {activeTab === "enrolledCourses" && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">My Courses</h2>
            <p className="mb-6 text-lg text-gray-600">
              Browse and enroll in courses, or access your enrolled courses.
            </p>

            <div className="mb-6 flex gap-4">
              <button
                className={`rounded-lg px-4 py-2 transition-all ${
                  courseSubTab === "browse"
                    ? "bg-blue-800 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setCourseSubTab("browse")}
              >
                Browse Courses
              </button>
              <button
                className={`rounded-lg px-4 py-2 transition-all ${
                  courseSubTab === "enrolled"
                    ? "bg-blue-800 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setCourseSubTab("enrolled")}
              >
                Enrolled Courses
              </button>
            </div>

            {courseSubTab === "browse" && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <p className="mb-2 text-xl">No courses available</p>
                    <p>Check back later for new courses!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {course.title}
                            </h3>
                            <p className="text-gray-600">
                              {course.description}
                            </p>
                            <p className="text-gray-600">
                              Teacher:{" "}
                              {course.teacher
                                ? `${course.teacher.first_name} ${course.teacher.last_name}`
                                : "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Subject: {course.subject?.name || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Grade: {course.grade?.level || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Country: {course.country || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Universal: {course.is_universal ? "Yes" : "No"}
                            </p>
                            <p className="text-gray-600">
                              Price: KES {course.price || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrolling}
                              className="mt-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                            >
                              {enrolling ? "Enrolling..." : "Enroll"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {courseSubTab === "enrolled" && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <p className="mb-2 text-xl">No enrolled courses yet</p>
                    <p>Enroll in courses to start learning!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {enrolledCourses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="rounded-lg border-l-4 border-green-500 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {enrollment.course_title}
                            </h3>
                            <p className="text-gray-600">
                              Teacher:{" "}
                              {enrollment.course?.teacher
                                ? `${enrollment.course.teacher.first_name} ${enrollment.course.teacher.last_name}`
                                : "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Subject:{" "}
                              {enrollment.course?.subject?.name || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Grade: {enrollment.course?.grade?.level || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Purchased:{" "}
                              {new Date(
                                enrollment.purchased_at,
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              Price: KES {enrollment.course?.price || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {enrollment.is_active ? "Active" : "Inactive"}
                            </div>
                            <button
                              onClick={() => handleAccessCourse(enrollment.id)}
                              className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                            >
                              Access Course
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "courseDetails" && selectedEnrolledCourse && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedEnrolledCourse.course_title}
                </h2>
                <p className="text-lg text-gray-600">
                  Course details and topics.
                </p>
              </div>
              <button
                onClick={() => setActiveComponent("enrolledCourses")}
                className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Back to Courses
              </button>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <p className="mb-4 text-gray-600">
                {selectedEnrolledCourse.description}
              </p>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <p>
                  <strong>Teacher:</strong>{" "}
                  {selectedEnrolledCourse.course?.teacher
                    ? `${selectedEnrolledCourse.course.teacher.first_name} ${selectedEnrolledCourse.course.teacher.last_name}`
                    : "N/A"}
                </p>
                <p>
                  <strong>Subject:</strong>{" "}
                  {selectedEnrolledCourse.course?.subject?.name || "N/A"}
                </p>
                <p>
                  <strong>Grade:</strong>{" "}
                  {selectedEnrolledCourse.course?.grade?.level || "N/A"}
                </p>
                <p>
                  <strong>Price:</strong> KES{" "}
                  {selectedEnrolledCourse.course?.price || "N/A"}
                </p>
                <p>
                  <strong>Purchased:</strong>{" "}
                  {new Date(
                    selectedEnrolledCourse.purchased_at,
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedEnrolledCourse.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="mb-4">
                <h4 className="mb-2 text-lg font-semibold">Topics</h4>
                {selectedEnrolledCourse.course?.topics &&
                selectedEnrolledCourse.course.topics.length > 0 ? (
                  <ul className="list-inside list-disc">
                    {selectedEnrolledCourse.course.topics.map(
                      (topic, index) => (
                        <li key={topic.id || index} className="mb-2">
                          <strong>{topic.title}</strong>: {topic.description}
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <ul className="ml-4 mt-1 list-inside list-disc">
                              {topic.subtopics.map((subtopic, subIndex) => (
                                <li key={subtopic.id || subIndex}>
                                  <strong>{subtopic.title}</strong>:{" "}
                                  {subtopic.content}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-600">No topics available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "peerToPeer" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Peer-to-Peer Sessions</h2>
                <p className="text-lg text-gray-600">
                  View and manage your peer-to-peer learning sessions.
                </p>
              </div>
              <button
                onClick={() => setShowCreatePeerToPeerModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <FaPlus />
                Create Session
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
              </div>
            ) : peerToPeerSessions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="mb-2 text-xl">No peer-to-peer sessions</p>
                <p>Schedule sessions to learn with peers!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {peerToPeerSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border-l-4 border-purple-500 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {session.title}
                        </h3>
                        <p className="text-gray-600">{session.description}</p>
                        <p className="text-gray-600">
                          Teacher: {session.teacher || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Started:{" "}
                          {session.started_at
                            ? new Date(session.started_at).toLocaleString()
                            : "Not started"}
                        </p>
                        <p className="text-gray-600">
                          Ended:{" "}
                          {session.ended_at
                            ? new Date(session.ended_at).toLocaleString()
                            : "Not ended"}
                        </p>
                      </div>
                      <div className="space-y-2 text-right">
                        {isUsableMeetingUrl(session.student_meeting_link) ||
                        isUsableMeetingUrl(session.teacher_meeting_link) ? (
                          <a
                            href={
                              isUsableMeetingUrl(session.student_meeting_link)
                                ? session.student_meeting_link
                                : session.teacher_meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
                          >
                            Join Session
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await openJitsiMeeting();
                              } catch (_) {
                                alert("Could not generate a meeting link.");
                              }
                            }}
                            className="block w-full rounded-lg bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
                          >
                            Generate & join
                          </button>
                        )}
                        {session.whiteboard_link && (
                          <a
                            href={session.whiteboard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg bg-purple-500 px-4 py-2 text-center text-white hover:bg-purple-600"
                          >
                            Open Whiteboard
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCreatePeerToPeerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Create Peer-to-Peer Session
                </h2>
                <button
                  onClick={() => setShowCreatePeerToPeerModal(false)}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreatePeerToPeer} className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPeerToPeer.title}
                    onChange={(e) =>
                      setNewPeerToPeer({
                        ...newPeerToPeer,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Session title"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newPeerToPeer.description}
                    onChange={(e) =>
                      setNewPeerToPeer({
                        ...newPeerToPeer,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the session..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Course *
                  </label>
                  <select
                    required
                    value={newPeerToPeer.course}
                    onChange={(e) =>
                      setNewPeerToPeer({
                        ...newPeerToPeer,
                        course: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newPeerToPeer.started_at}
                    onChange={(e) =>
                      setNewPeerToPeer({
                        ...newPeerToPeer,
                        started_at: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Duration Hours *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPeerToPeer.duration_hours}
                    onChange={(e) =>
                      setNewPeerToPeer({
                        ...newPeerToPeer,
                        duration_hours: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePeerToPeerModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLessons;
