import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaBookOpen,
  FaUsers,
  FaTimes,
} from "react-icons/fa";

const Scheduler = ({ userInfo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTab, setActiveTab] = useState("availability");
  const [availableTimes, setAvailableTimes] = useState({});
  const [filteredTimes, setFilteredTimes] = useState([]);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [plannedLessons, setPlannedLessons] = useState([]);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [peerToPeerSessions, setPeerToPeerSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreatePeerModal, setShowCreatePeerModal] = useState(false);
  const [newPeerSession, setNewPeerSession] = useState({
    course: "",
    teacher: "",
    title: "",
    description: "",
    started_at: "",
    duration_hours: 1,
  });
  const [editingSession, setEditingSession] = useState(null);

  // Form state for adding new lesson
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    subject: "",
    grade: "",
    price: "",
    code: "",
    cover_image: "",
    topics: "",
    is_active: true,
    country: "Kenya",
    is_universal: false,
  });

  const lessonTypes = ["online", "in-person", "hybrid"];

  // Days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate days for the current month
  const generateDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Include padding for the start of the month
    const startPadding = startOfWeek(start);
    while (startPadding < start) {
      days.unshift(new Date(startPadding));
      startPadding.setDate(startPadding.getDate() + 1);
    }
    return days;
  };

  // Fetch available times and planned lessons from the backend
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch available times
      try {
        const timesResponse = await axios.get(
          `${FHOST}/lessons/api/get-available-times/${userInfo?.id || 9}`,
        );
        if (timesResponse.status === 200 && Array.isArray(timesResponse.data)) {
          const data = timesResponse.data;
          const timesByDate = {};

          data.forEach((timeSlot) => {
            const { date, start_time, end_time } = timeSlot;
            if (!timesByDate[date]) {
              timesByDate[date] = [];
            }
            timesByDate[date].push({ start_time, end_time });
          });

          setAvailableTimes(timesByDate);
        } else {
          setAvailableTimes({});
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setAvailableTimes({});
        } else {
          console.error("Error fetching available times:", err);
        }
      }

      // Fetch planned lessons
      try {
        const lessonsResponse = await axios.get(
          `${FHOST}/lessons/api/teacher-planned-lessons/${userInfo?.id}`,
        );
        // Server currently returns an array or 404
        if (Array.isArray(lessonsResponse.data)) {
          setPlannedLessons(lessonsResponse.data);
        } else if (
          lessonsResponse.data?.success &&
          Array.isArray(lessonsResponse.data.lessons)
        ) {
          setPlannedLessons(lessonsResponse.data.lessons);
        } else {
          setPlannedLessons([]);
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setPlannedLessons([]);
        } else {
          console.error("Error fetching planned lessons:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects and grades on mount
  useEffect(() => {
    fetchSubjects();
    fetchGrades();
  }, []);

  // Call fetchData when the component mounts
  useEffect(() => {
    fetchData();
    fetchPeerToPeerSessions();
    fetchCourses();
  }, [userInfo?.id]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${FHOST}/api/peer-to-peer-sessions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sessionsList = response.data?.results || response.data || [];
      if (Array.isArray(sessionsList)) {
        setPeerToPeerSessions(sessionsList);
      }
    } catch (error) {
      console.error("Error fetching peer-to-peer sessions:", error);
      setPeerToPeerSessions([]);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    const dateKey = format(day, "yyyy-MM-dd");
    const filtered = availableTimes[dateKey] || [];
    setFilteredTimes(filtered);
  };

  const addTimeRange = async () => {
    const { start, end } = timeRange;

    if (!start || !end) {
      setErrorMessage("Please select both start and end times.");
      return;
    }
    if (start >= end) {
      setErrorMessage("Start time must be earlier than end time.");
      return;
    }

    const dateKey = format(selectedDay, "yyyy-MM-dd");
    const startTimestamp = `${dateKey} ${start}:00`;
    const endTimestamp = `${dateKey} ${end}:00`;

    const payload = {
      date: dateKey,
      start: startTimestamp,
      end: endTimestamp,
    };

    try {
      const response = await axios.post(
        `${FHOST}/lessons/api/submit-time-range/${userInfo?.id || 9}`,
        payload,
      );

      if (response.status === 200) {
        setSuccessMessage("Time range added successfully!");

        const updatedAvailableTimes = { ...availableTimes };
        if (!updatedAvailableTimes[dateKey]) {
          updatedAvailableTimes[dateKey] = [];
        }
        updatedAvailableTimes[dateKey].push({
          start_time: start,
          end_time: end,
        });

        setAvailableTimes(updatedAvailableTimes);
        const filtered = updatedAvailableTimes[dateKey] || [];
        setFilteredTimes(filtered);
        setTimeRange({ start: "", end: "" });
        setShowAddTimeModal(false);
      }
    } catch (error) {
      console.error("Error submitting time range:", error);
      setErrorMessage("Failed to add time range. Please try again.");
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      let allSubjects = [];
      let nextUrl = `${FHOST}/api/subjects/`;

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data && response.data.results) {
          allSubjects = allSubjects.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }

      console.log("Fetched subjects:", allSubjects);
      setAvailableSubjects(allSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchGrades = async () => {
    setLoadingGrades(true);
    try {
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/`;

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data && response.data.results) {
          allGrades = allGrades.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }

      console.log("Fetched grades:", allGrades);
      setAvailableGrades(allGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const teacherIdentifier =
        userInfo?.teacher_profile_id ||
        userInfo?.teacher_profile?.id ||
        userInfo?.id;

      const payload = {
        title: newLesson.title.trim(),
        description: newLesson.description.trim(),
        subject: newLesson.subject,
        grade: newLesson.grade,
        price: newLesson.price || "0",
        is_active: newLesson.is_active,
        code: newLesson.code || undefined,
        cover_image: newLesson.cover_image || undefined,
        topics: newLesson.topics,
        teacher: teacherIdentifier,
        country: newLesson.country,
        is_universal: newLesson.is_universal,
      };

      const response = await axios.post(`${FHOST}/api/courses/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Course created successfully!");
        setShowLessonModal(false);
        setNewLesson({
          title: "",
          description: "",
          subject: "",
          grade: "",
          price: "",
          code: "",
          cover_image: "",
          topics: "",
          is_active: true,
          country: "Kenya",
          is_universal: false,
        });
        fetchData();
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to create course. Please try again.";
      console.error("Error creating course:", error);
      setErrorMessage(errorMsg);
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1),
    );
    setSelectedDay(null);
  };

  const handleCreatePeerSession = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You are not authenticated. Please login again.");
      }

      const teacherIdentifier =
        userInfo?.teacher_profile_id ||
        userInfo?.teacher_profile?.id ||
        userInfo?.id;

      const payload = {
        course: newPeerSession.course,
        teacher: teacherIdentifier,
        title: newPeerSession.title,
        description: newPeerSession.description,
        started_at: newPeerSession.started_at,
        duration_hours: newPeerSession.duration_hours,
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
        setSuccessMessage("Peer-to-peer session created successfully!");
        setShowCreatePeerModal(false);
        const teacherIdentifier =
          userInfo?.teacher_profile_id ||
          userInfo?.teacher_profile?.id ||
          userInfo?.id;

        setNewPeerSession({
          course: "",
          teacher: teacherIdentifier,
          title: "",
          description: "",
          started_at: "",
          duration_hours: 1,
        });
        fetchPeerToPeerSessions();
      } else {
        setErrorMessage("Unexpected response from server.");
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
        "Error creating peer-to-peer session. Please check your inputs.";
      setErrorMessage(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePeerSession = async (sessionId, updateData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You are not authenticated. Please login again.");
      }

      const response = await axios.patch(
        `${FHOST}/api/peer-to-peer-sessions/${sessionId}/`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setPeerToPeerSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? response.data : s)),
        );
        setSuccessMessage("Session updated successfully!");
        setEditingSession(null);
      } else {
        setErrorMessage("Unexpected response from server.");
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
        "Error updating session.";
      setErrorMessage(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeerSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You are not authenticated. Please login again.");
      }

      const response = await axios.delete(
        `${FHOST}/api/peer-to-peer-sessions/${sessionId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 204 || response.status === 200) {
        setPeerToPeerSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setSuccessMessage("Session deleted successfully!");
      } else {
        setErrorMessage("Unexpected response from server.");
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
        "Error deleting session.";
      setErrorMessage(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const getDayClasses = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const hasAvailability =
      availableTimes[dateKey] && availableTimes[dateKey].length > 0;
    const hasLessons = plannedLessons.some(
      (lesson) => format(new Date(lesson.date), "yyyy-MM-dd") === dateKey,
    );
    const isSelected = selectedDay && isSameDay(day, selectedDay);

    let baseClasses = "p-4 rounded text-sm font-medium transition-colors";

    if (isSelected) {
      baseClasses += " bg-[#01B0F1] text-white";
    } else if (hasLessons) {
      baseClasses += " bg-green-100 text-green-800 hover:bg-green-200";
    } else if (hasAvailability) {
      baseClasses += " bg-blue-100 text-blue-800 hover:bg-blue-200";
    } else {
      baseClasses += " bg-gray-200 hover:bg-gray-300";
    }

    return baseClasses;
  };

  const tabs = [
    { id: "availability", name: "Manage Availability", icon: <FaClock /> },
    { id: "peerToPeer", name: "Peer-to-Peer", icon: <FaUsers /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Schedule Management
          </h1>
          <p className="text-gray-600">
            Manage your availability and peer-to-peer sessions
          </p>
        </div>
        {activeTab === "peerToPeer" && (
          <button
            onClick={() => setShowCreatePeerModal(true)}
            className="bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <FaPlus />
            Create Session
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-[#01B0F1] text-[#01B0F1]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => changeMonth("prev")}
              className="bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors">
              Previous
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => changeMonth("next")}
              className="bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors">
              Next
            </button>
          </div>

          {/* Days of the Week */}
          <div className="grid grid-cols-7 gap-2 text-center text-gray-700 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="font-semibold p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {generateDays().map((day, index) => (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                className={getDayClasses(day)}>
                <div className="text-center">
                  <div className="font-medium">{format(day, "d")}</div>
                  <div className="text-xs mt-1">
                    {availableTimes[format(day, "yyyy-MM-dd")]?.length > 0 && (
                      <span className="text-blue-600">●</span>
                    )}
                    {plannedLessons.some(
                      (lesson) =>
                        format(new Date(lesson.date), "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd"),
                    ) && <span className="text-green-600">●</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Day & Time Management */}
          {selectedDay && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {format(selectedDay, "EEEE, MMMM d, yyyy")}
                </h3>
                <button
                  onClick={() => setShowAddTimeModal(true)}
                  className="bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors flex items-center gap-2">
                  <FaPlus />
                  Add Availability
                </button>
              </div>

              {/* Available Times */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Available Time Ranges:
                </h4>
                {filteredTimes.length === 0 ? (
                  <p className="text-gray-500">
                    No availability set for this day
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {filteredTimes.map((time, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">
                          {time.start_time} - {time.end_time}
                        </span>
                        <button className="text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Planned Lessons for this day */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">
                  Planned Lessons:
                </h4>
                {plannedLessons.filter(
                  (lesson) =>
                    format(new Date(lesson.date), "yyyy-MM-dd") ===
                    format(selectedDay, "yyyy-MM-dd"),
                ).length === 0 ? (
                  <p className="text-gray-500">
                    No lessons planned for this day
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {plannedLessons
                      .filter(
                        (lesson) =>
                          format(new Date(lesson.date), "yyyy-MM-dd") ===
                          format(selectedDay, "yyyy-MM-dd"),
                      )
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium text-green-800">
                              {lesson.title}
                            </div>
                            <div className="text-sm text-green-600">
                              {lesson.start_time} - {lesson.end_time} •{" "}
                              {lesson.subject} • Grade {lesson.grade}
                            </div>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lesson.status === "scheduled"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {lesson.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "peerToPeer" && (
        <div className="space-y-4">
          {peerToPeerSessions.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                No peer-to-peer sessions
              </h3>
              <p className="text-gray-500 mt-2">
                Create your first peer-to-peer session
              </p>
              <button
                onClick={() => setShowCreatePeerModal(true)}
                className="mt-4 bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors">
                Create Session
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {peerToPeerSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {session.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {session.description}
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePeerSession(session.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        disabled={loading}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {session.teacher_meeting_link && (
                      <a
                        href={session.teacher_meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">
                        Join Meeting
                      </a>
                    )}
                    {session.whiteboard_link && (
                      <a
                        href={session.whiteboard_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                        Open Whiteboard
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "lessons" && (
        <div className="space-y-4">
          {plannedLessons.length === 0 ? (
            <div className="text-center py-12">
              <FaBookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                No courses created yet
              </h3>
              <p className="text-gray-500 mt-2">
                Create your first course to get started
              </p>
              <button
                onClick={() => setShowLessonModal(true)}
                className="mt-4 bg-[#01B0F1] text-white px-4 py-2 rounded-lg hover:bg-[#0199d4] transition-colors">
                Create Course
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plannedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaBookOpen />
                          {lesson.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers />
                          Grade {lesson.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(lesson.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {lesson.start_time} - {lesson.end_time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {lesson.current_students}/{lesson.max_students} students
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lesson.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {lesson.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Time Modal */}
      {showAddTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Add Availability
              </h2>
              <button
                onClick={() => setShowAddTimeModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTimeRange();
              }}
              className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={timeRange.start}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, start: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={timeRange.end}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, end: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTimeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]">
                  Add Time Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Course
              </h2>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLesson.title}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={newLesson.subject}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    disabled={loadingSubjects}>
                    <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name || subject.subject || subject.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade *
                  </label>
                  <select
                    required
                    value={newLesson.grade}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    disabled={loadingGrades}>
                    <option value="">Select a grade</option>
                    {availableGrades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.level || grade.name || grade.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    value={newLesson.price}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newLesson.code}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Optional code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={newLesson.cover_image}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        cover_image: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newLesson.country}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, country: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="e.g. Kenya"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topics (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={newLesson.topics}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, topics: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder={`Topic 1
Topic 2
Topic 3`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={newLesson.description}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Describe the course content..."
                  />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="course-active"
                    checked={newLesson.is_active}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        is_active: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-[#01B0F1] focus:ring-[#01B0F1]"
                  />
                  <label
                    htmlFor="course-active"
                    className="text-sm text-gray-700">
                    Course is active and visible to students
                  </label>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="course-universal"
                    checked={newLesson.is_universal}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        is_universal: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-[#01B0F1] focus:ring-[#01B0F1]"
                  />
                  <label
                    htmlFor="course-universal"
                    className="text-sm text-gray-700">
                    Course is universal (available in all countries)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Peer Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">
                Edit Session
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updateData = {
                    title: formData.get("title"),
                    description: formData.get("description"),
                    started_at: formData.get("started_at"),
                    duration_hours: parseInt(formData.get("duration_hours")),
                  };
                  handleUpdatePeerSession(editingSession.id, updateData);
                }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    name="title"
                    defaultValue={editingSession.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingSession.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    name="started_at"
                    type="datetime-local"
                    defaultValue={
                      editingSession.started_at
                        ? new Date(editingSession.started_at)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    name="duration_hours"
                    type="number"
                    defaultValue={editingSession.duration_hours || 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    min="1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] disabled:opacity-50">
                    {loading ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Peer Session Modal */}
      {showCreatePeerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">
                Create Peer Session
              </h2>
              <form onSubmit={handleCreatePeerSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    value={newPeerSession.course}
                    onChange={(e) =>
                      setNewPeerSession({
                        ...newPeerSession,
                        course: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent">
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} -{" "}
                        {course.subject?.name || course.subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPeerSession.title}
                    onChange={(e) =>
                      setNewPeerSession({
                        ...newPeerSession,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    placeholder="Session title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPeerSession.description}
                    onChange={(e) =>
                      setNewPeerSession({
                        ...newPeerSession,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent h-24"
                    placeholder="Describe the session"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newPeerSession.started_at}
                    onChange={(e) =>
                      setNewPeerSession({
                        ...newPeerSession,
                        started_at: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={newPeerSession.duration_hours}
                    onChange={(e) =>
                      setNewPeerSession({
                        ...newPeerSession,
                        duration_hours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreatePeerModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] disabled:opacity-50">
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Scheduler;
