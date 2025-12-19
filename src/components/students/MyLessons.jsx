import React, { useState, useEffect } from "react";
import VideoLesson from "./VideoLessons";
import StudentLiveClass from "./StudentLiveClass";
import Forum from "./Forum";
import UpcomingLessons from "./UpcomingLessons";
import { FaCalendarAlt, FaCreditCard, FaClock, FaVideo, FaBookOpen, FaDollarSign, FaUsers } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";

const MyLessons = ({userInfo, darkMode}) => {
  const [activeTab, setActiveComponent] = useState("liveClasses");
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [courseSubTab, setCourseSubTab] = useState("enrolled");
  const [peerToPeerSessions, setPeerToPeerSessions] = useState([]);

  useEffect(() => {
    fetchScheduledLessons();
    fetchEnrolledCourses();
    fetchAvailableCourses();
    fetchPeerToPeerSessions();
  }, []);

  const fetchScheduledLessons = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token available');
        return;
      }

      // Try new endpoint first, fallback to old one
      let response;
      try {
        response = await axios.get(`${FHOST}/api/student/session-bookings/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (newError) {
        // Fallback to old endpoint
        response = await axios.get(`${FHOST}/api/student/session-bookings/${userInfo?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const bookingsList = response.data?.results || response.data || [];
      if (Array.isArray(bookingsList)) {
        // Map bookings into the expected UI shape
        const mapped = bookingsList.map(b => ({
          id: b.id,
          teacher_id: b.teacher_id,
          teacher_name: b.teacher_name || b.teacher_id,
          subject: b.subject || 'Lesson',
          date: b.scheduled_start || b.session_datetime,
          time: b.scheduled_start ? new Date(b.scheduled_start).toLocaleTimeString() : (b.session_datetime || ''),
          scheduled_start: b.scheduled_start,
          scheduled_end: b.scheduled_end,
          status: b.status,
          cost: Math.abs(parseFloat(b.cost || 0)),
          payment_status: b.status === 'accepted' || b.status === 'confirmed' ? 'pending' : 'n/a',
          is_allowed: b.is_allowed,
          attended: b.attended,
          duration_hours: b.duration_hours,
          course: b.course,
        }));
        setScheduledLessons(mapped);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setScheduledLessons([]);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${FHOST}/api/student/enrolled/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const coursesList = response.data?.results || response.data || [];
      if (Array.isArray(coursesList)) {
        setEnrolledCourses(coursesList);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const coursesList = response.data?.results || response.data || [];
      if (Array.isArray(coursesList)) {
        setAvailableCourses(coursesList);
      }
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeerToPeerSessions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

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
      console.error('Error fetching peer-to-peer sessions:', error);
      setPeerToPeerSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (lessonId, amount) => {
    try {
      const response = await axios.post(`${FHOST}/payments/pay_teacher`, {
        payer_id: userInfo?.id,
        teacher_id: scheduledLessons.find(l => l.id === lessonId)?.teacher_id,
        amount: amount
      });
      
      if (response.status === 200) {
        // Refresh data after successful payment
        fetchScheduledLessons();
        alert('Payment processed successfully!');
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
  };

  const handleRescheduleBooking = async (bookingId, booking) => {
    // This would open a modal/form to reschedule
    // For now, we'll show an alert - you can implement a proper modal later
    const newDate = prompt('Enter new date and time (YYYY-MM-DDTHH:MM format):');
    if (!newDate) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Booking rescheduled successfully!');
        fetchScheduledLessons();
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Failed to reschedule booking. Please try again.';
      alert(errorMsg);
    }
  };

  const handleMarkAttended = async (bookingId, booking) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const scheduledStart = booking.scheduled_start ? new Date(booking.scheduled_start).toISOString() : new Date().toISOString();
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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Booking marked as attended! Teacher payment has been processed.');
        fetchScheduledLessons();
      }
    } catch (error) {
      console.error('Error marking booking as attended:', error);
      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       error.response?.data?.detail ||
                       'Failed to mark as attended. Please try again.';
      alert(errorMsg);
    }
  };

  const handleJoinLiveSession = async (bookingId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get(
        `${FHOST}/api/student/live-session/${bookingId}/join/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Assuming the response contains a join_url or similar
        const joinUrl = response.data?.join_url || response.data?.url;
        if (joinUrl) {
          window.open(joinUrl, '_blank');
        } else {
          alert('Session join URL not available.');
        }
      }
    } catch (error) {
      console.error('Error joining live session:', error);
      const errorMsg = error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.response?.data?.detail ||
                        'Failed to join live session. Please try again.';
      alert(errorMsg);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await axios.post(
        `${FHOST}/api/courses/enrollments/`,
        { course_id: courseId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        alert('Enrolled successfully!');
        fetchEnrolledCourses();
        fetchAvailableCourses(); // Refresh available courses if needed
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorData = error.response?.data;
      let errorMsg = 'Failed to enroll in course. Please try again.';
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
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

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation Buttons */}
      <nav className="bg-white text-gray-800 py-4 px-6 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className={`px-6 py-2 rounded-lg transition-all text-white ${
              activeTab === "liveClasses"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("liveClasses")}
          >
            <FaVideo className="inline mr-2" />
            Live Classes
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all text-white ${
              activeTab === "enrolledCourses"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("enrolledCourses")}
          >
            <FaBookOpen className="inline mr-2" />
            My Courses
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all text-white ${
              activeTab === "peerToPeer"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("peerToPeer")}
          >
            <FaUsers className="inline mr-2" />
            Peer-to-Peer
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {activeTab === "liveClasses" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Live Classes</h2>
            <p className="text-lg mb-6 text-gray-600">
              Join live classes and interact with instructors in real-time.
            </p>
            <StudentLiveClass userInfo={userInfo} darkMode={darkMode} />
          </div>
        )}
        
        {activeTab === "enrolledCourses" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            <p className="text-lg mb-6 text-gray-600">
              Browse and enroll in courses, or access your enrolled courses.
            </p>

            {/* Sub-tabs */}
            <div className="flex gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg transition-all ${
                  courseSubTab === "browse"
                    ? "bg-blue-800 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setCourseSubTab("browse")}
              >
                Browse Courses
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-all ${
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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-2">No courses available</p>
                    <p>Check back later for new courses!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <p className="text-gray-600">{course.description}</p>
                            <p className="text-gray-600">
                              Teacher: {course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Subject: {course.subject?.name || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Grade: {course.grade?.level || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Country: {course.country || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Universal: {course.is_universal ? 'Yes' : 'No'}
                            </p>
                            <p className="text-gray-600">
                              Price: KES {course.price || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrolling}
                              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {enrolling ? 'Enrolling...' : 'Enroll'}
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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-2">No enrolled courses yet</p>
                    <p>Enroll in courses to start learning!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {enrolledCourses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="p-4 rounded-lg border-l-4 border-green-500 bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{enrollment.course_title}</h3>
                            <p className="text-gray-600">
                              Teacher: {enrollment.course?.teacher ? `${enrollment.course.teacher.first_name} ${enrollment.course.teacher.last_name}` : 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Subject: {enrollment.course?.subject?.name || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Grade: {enrollment.course?.grade?.level || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              Purchased: {new Date(enrollment.purchased_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              Price: KES {enrollment.course?.price || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {enrollment.is_active ? 'Active' : 'Inactive'}
                            </div>
                            <button
                              onClick={() => window.location.href = `/course/${enrollment.course.id}`}
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

        {activeTab === "peerToPeer" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Peer-to-Peer Sessions</h2>
            <p className="text-lg mb-6 text-gray-600">
              View and manage your peer-to-peer learning sessions.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : peerToPeerSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">No peer-to-peer sessions</p>
                <p>Schedule sessions to learn with peers!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {peerToPeerSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border-l-4 border-purple-500 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{session.title}</h3>
                        <p className="text-gray-600">{session.description}</p>
                        <p className="text-gray-600">
                          Teacher: {session.teacher || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          Started: {session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}
                        </p>
                        <p className="text-gray-600">
                          Ended: {session.ended_at ? new Date(session.ended_at).toLocaleString() : 'Not ended'}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        {session.student_meeting_link && (
                          <a
                            href={session.student_meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                          >
                            Join Session
                          </a>
                        )}
                        {session.whiteboard_link && (
                          <a
                            href={session.whiteboard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center"
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
      </div>
    </div>
  );
};

export default MyLessons;
