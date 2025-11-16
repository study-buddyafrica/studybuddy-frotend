import React, { useEffect, useState } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const StudentLiveClass = ({userInfo}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [confirmedSessions, setConfirmedSessions] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [sessions, setSessions] = useState([]);
 
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Handle paginated response - students see sessions they booked
        const sessionsList = response.data?.results || response.data || [];
        setSessions(Array.isArray(sessionsList) ? sessionsList : []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };
    fetchSessions();
  }, []);

  const handleJoinClassClick = (session) => {
    setSelectedSession(session);
    setShowPaymentForm(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      // Get session_booking_id from the session
      // This should be available from the booking that created this session
      const sessionBookingId = selectedSession.session_booking_id || selectedSession.booking_id;
      
      if (!sessionBookingId) {
        alert('Session booking ID not found. Cannot join session.');
        return;
      }

      const response = await axios.post(
        `${FHOST}/api/student/live-session/${sessionBookingId}/join/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setConfirmedSessions((prev) => ({
          ...prev,
          [selectedSession.id]: true,
        }));
        setShowPaymentForm(false);
        alert('Successfully joined the live session!');
      }
    } catch (error) {
      console.error("Error joining session:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Failed to join session. Please try again.';
      alert(errorMsg);
    }
  };

  const toggleDescription = (id) => {
    setCollapsed((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="space-y-6">
        {sessions?.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={session.teacher?.profile_image || "https://via.placeholder.com/50"}
                    alt="Teacher"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{session.teacher?.name || "Unknown Teacher"}</h3>
                    <p className="text-gray-600 text-sm">{session.teacher?.school || "Unknown School"}</p>
                    <p className="text-gray-500 text-sm">{session.subject?.name || "Unknown Subject"}</p>
                  </div>
                </div>
                <span className="text-gray-600 font-semibold">Ksh: {session?.price || 0}</span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{session.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Scheduled Date: <strong>{session.scheduled_date?.split(" ")[0]}</strong>
                </p>
                <p className="text-gray-600 text-sm">
                  Scheduled Time: <strong>{session.scheduled_date?.split(" ")[1]}</strong>
                </p>
                <div className="text-gray-700 mt-2">
                  <p
                    className={`transition-all duration-300 ${
                      collapsed[session.id] ? "h-auto" : "h-20 overflow-hidden"
                    }`}
                  >
                    {session.description}
                  </p>
                  {session.description && session.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(session.id)}
                      className="bg-blue-600 w-fit text-white mt-2 flex items-center space-x-1 px-2 py-1 rounded-md"
                    >
                      <span>{collapsed[session.id] ? "Read Less" : "Read More"}</span>
                      {collapsed[session.id] ? <HiMinus /> : <HiPlus />}
                    </button>
                  )}
                </div>
              </div>

              {!confirmedSessions[session.id] ? (
                <button
                  onClick={() => handleJoinClassClick(session)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Join Class
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="p-2 bg-green-200 text-green-800 text-sm rounded-lg">
                    Confirmed! You can now join the session.
                  </div>
                  {session.student_meeting_link && (
                    <a 
                      href={session.student_meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                    >
                      Join Meeting
                    </a>
                  )}
                  {session.whiteboard_link && (
                    <a 
                      href={session.whiteboard_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center mt-2"
                    >
                      Open Whiteboard
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Loading sessions...</p>
        )}
      </div>

      {showPaymentForm && selectedSession && !confirmedSessions[selectedSession.id] && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to join <span className="text-blue-600">{selectedSession.title}</span>?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmJoin}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLiveClass;
