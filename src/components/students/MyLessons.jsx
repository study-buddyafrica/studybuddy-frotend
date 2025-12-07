import React, { useState, useEffect } from "react";
import VideoLesson from "./VideoLessons";
import StudentLiveClass from "./StudentLiveClass";
import Forum from "./Forum";
import UpcomingLessons from "./UpcomingLessons";
import { FaCalendarAlt, FaCreditCard, FaClock, FaVideo, FaBookOpen, FaDollarSign } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";

const MyLessons = ({userInfo, darkMode}) => {
  const [activeTab, setActiveComponent] = useState("liveClasses");
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledLessons();
    fetchPendingPayments();
    fetchEnrolledCourses();
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
        response = await axios.get(`${FHOST}/lessons/api/bookings/student/${userInfo?.id}`, {
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

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
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
        response = await axios.get(`${FHOST}/lessons/api/bookings/student/${userInfo?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const bookingsList = response.data?.results || response.data || [];
      if (Array.isArray(bookingsList)) {
        const pending = bookingsList
          .filter(p => p.status === 'accepted' || p.status === 'confirmed')
          .map(p => ({
            id: p.id,
            teacher_id: p.teacher_id,
            teacher_name: p.teacher_name || p.teacher_id,
            subject: p.subject || 'Lesson',
            lesson_date: p.scheduled_start || p.session_datetime,
            due_date: p.scheduled_end || p.scheduled_start || p.session_datetime,
            amount: Math.abs(parseFloat(p.cost || 0)),
            lesson_id: p.id,
          }));
        setPendingPayments(pending);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
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
        fetchPendingPayments();
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
        fetchPendingPayments();
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
        fetchPendingPayments();
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
              activeTab === "UpcomingClasses"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("UpcomingClasses")}
          >
            <FaClock className="inline mr-2" />
            Upcoming Classes
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all text-white ${
              activeTab === "scheduledLessons"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("scheduledLessons")}
          >
            <FaCalendarAlt className="inline mr-2" />
            Scheduled Lessons
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all text-white ${
              activeTab === "pendingPayments"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("pendingPayments")}
          >
            <FaCreditCard className="inline mr-2" />
            Pending Payments
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
            <h2 className="text-2xl font-bold mb-4">My Enrolled Courses</h2>
            <p className="text-lg mb-6 text-gray-600">
              View and access your enrolled courses.
            </p>

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
                          Teacher: {enrollment.course?.teacher || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          Subject: {enrollment.course?.subject || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          Grade: {enrollment.course?.grade || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          Purchased: {new Date(enrollment.purchased_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Amount Paid: {enrollment.amount_paid}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {enrollment.is_active ? 'Active' : 'Inactive'}
                        </div>
                        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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
        
        {activeTab === "UpcomingClasses" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Classes</h2>
            <UpcomingLessons userInfo={userInfo} darkMode={darkMode} />
          </div>
        )}

        {activeTab === "scheduledLessons" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Scheduled Lessons</h2>
            <p className="text-lg mb-6 text-gray-600">
              View and manage your scheduled lessons with teachers.
            </p>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : scheduledLessons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">No scheduled lessons yet</p>
                <p>Schedule a lesson with a teacher to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {scheduledLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{lesson.teacher_name}</h3>
                        <p className="text-gray-600">
                          Subject: {lesson.subject}
                        </p>
                        <p className="text-gray-600">
                          Date: {new Date(lesson.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Time: {lesson.time}
                        </p>
                        <p className="text-gray-600">
                          Status: <span className={`font-semibold ${
                            lesson.status === 'confirmed' ? 'text-green-600' :
                            lesson.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {lesson.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          KES {lesson.cost?.toLocaleString() || 0}
                        </div>
                        {lesson.status === 'confirmed' && lesson.payment_status === 'pending' && (
                          <button 
                            onClick={() => handlePayment(lesson.id, lesson.cost)}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <FaCreditCard className="inline mr-2" />
                            Pay Now
                          </button>
                        )}
                        {lesson.status === 'pending' && lesson.is_allowed && (
                          <button 
                            onClick={() => handleRescheduleBooking(lesson.id, lesson)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Reschedule
                          </button>
                        )}
                        {lesson.status === 'pending' && !lesson.attended && (
                          <button
                            onClick={() => handleMarkAttended(lesson.id, lesson)}
                            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                          >
                            Mark Attended
                          </button>
                        )}
                        {lesson.status === 'confirmed' && (
                          <button
                            onClick={() => handleJoinLiveSession(lesson.id)}
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Join Live Session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pendingPayments" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Payments</h2>
            <p className="text-lg mb-6 text-gray-600">
              Complete payments for approved lessons to confirm your bookings.
            </p>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">No pending payments</p>
                <p>All your lesson payments are up to date!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 rounded-lg border-l-4 border-yellow-500 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.teacher_name}</h3>
                        <p className="text-gray-600">
                          Lesson: {payment.subject} on {new Date(payment.lesson_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Due Date: {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          KES {payment.amount?.toLocaleString() || 0}
                        </div>
                        <button 
                          onClick={() => handlePayment(payment.lesson_id, payment.amount)}
                          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <FaCreditCard className="inline mr-2" />
                          Pay Now
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
    </div>
  );
};

export default MyLessons;
