import React, { useEffect, useState } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const StudentLiveClass = ({userInfo}) => {
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


  const handleMarkAttended = async (session) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await axios.patch(
        `${FHOST}/api/student/session-bookings/${session.id}/`,
        { attended: true },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the session in the list
        setSessions(prevSessions => prevSessions.map(s => s.id === session.id ? { ...s, attended: true } : s));
        alert('Session marked as attended successfully!');
      }
    } catch (error) {
      console.error("Error marking session as attended:", error);
      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       error.response?.data?.detail ||
                       'Failed to mark session as attended. Please try again.';
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

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{session.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Started: <strong>{session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}</strong>
                </p>
                <p className="text-gray-600 text-sm">
                  Ended: <strong>{session.ended_at ? new Date(session.ended_at).toLocaleString() : 'Not ended'}</strong>
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

              <div className="mt-4 space-y-2">
                {session.student_meeting_link && (
                  <a
                    href={session.student_meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                  >
                    Join Class
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
                <button
                  onClick={() => handleMarkAttended(session)}
                  className="block w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center mt-2"
                >
                  Mark as Attended
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading sessions...</p>
        )}
      </div>

    </div>
  );
};

export default StudentLiveClass;
