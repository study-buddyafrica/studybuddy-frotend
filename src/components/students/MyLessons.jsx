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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledLessons();
    fetchPendingPayments();
  }, []);

  const fetchScheduledLessons = async () => {
    try {
      const response = await axios.get(`${FHOST}/lessons/api/bookings/student/${userInfo?.id}`);
      if (Array.isArray(response.data)) {
        // Map bookings into the expected UI shape
        const mapped = response.data.map(b => ({
          id: b.id,
          teacher_name: b.teacher_name || b.teacher_id,
          subject: b.subject || 'Lesson',
          date: b.session_datetime,
          time: b.session_datetime,
          status: b.status,
          cost: b.cost,
          payment_status: b.status === 'accepted' ? 'pending' : 'n/a'
        }));
        setScheduledLessons(mapped);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      // No explicit pending endpoint; derive from bookings
      const response = await axios.get(`${FHOST}/lessons/api/bookings/student/${userInfo?.id}`);
      if (Array.isArray(response.data)) {
        const pending = response.data
          .filter(p => p.status === 'accepted')
          .map(p => ({
            id: p.id,
            teacher_name: p.teacher_name || p.teacher_id,
            subject: p.subject || 'Lesson',
            lesson_date: p.session_datetime,
            due_date: p.session_datetime,
            amount: p.cost,
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
              activeTab === "videoLessons"
                ? "bg-blue-800 shadow-lg"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={() => setActiveComponent("videoLessons")}
          >
            <FaBookOpen className="inline mr-2" />
            Video Lessons
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
        
        {activeTab === "videoLessons" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Video Lessons</h2>
            <p className="text-lg mb-6 text-gray-600">
              Browse through recorded video lessons to learn at your own pace.
            </p>
            <VideoLesson darkMode={darkMode} />
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
