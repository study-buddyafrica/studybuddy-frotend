import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LiveClass = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [useBooking, setUseBooking] = useState(true);
  const [meetingDetails, setMeetingDetails] = useState({
    session_booking_id: '',
    topic: '',
    agenda: '',
    start_time: '',
    duration: 45,
    timezone: 'UTC',
  });
  const [bookings, setBookings] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleCode, setGoogleCode] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await axios.get(`${FHOST}/api/booked-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle paginated response
        const data = response.data;
        const allBookings = Array.isArray(data?.results) ? data.results : [];

        // Filter for bookings that are allowed and not attended yet
        const availableBookings = allBookings.filter(
          booking => booking.is_allowed && !booking.attended
        );
        setBookings(availableBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle paginated response
        const data = response.data;
        const sessions = Array.isArray(data?.results) ? data.results : [];
        setLiveSessions(sessions);
      } catch (err) {
        console.error('Error fetching live sessions:', err);
        setLiveSessions([]);
      }
    };
    fetchLiveSessions();
  }, []);

  const handleGoogleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('You are not authenticated. Please login again.');
      }

      if (!googleCode.trim()) {
        throw new Error('Please enter the authorization code.');
      }

      const response = await axios.post(
        `${FHOST}/api/teacher/google/connect/`,
        { code: googleCode },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setGoogleConnected(true);
        setGoogleCode('');
        alert('Google account connected successfully!');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const details = typeof data === 'string'
        ? data
        : (data?.error || data?.message || data?.details);
      const msg = details
        || (status ? `Request failed with status ${status}` : err?.message)
        || 'Error connecting Google account.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLiveSession = async (sessionId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('You are not authenticated. Please login again.');
      }

      const response = await axios.patch(
        `${FHOST}/api/teacher/live-session/update/${sessionId}/`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the specific session in the list
        setLiveSessions(prevSessions => prevSessions.map(s => s.id === sessionId ? response.data : s));
        alert('Session marked as attended successfully!');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const details = typeof data === 'string'
        ? data
        : (data?.error || data?.message || data?.details);
      const msg = details
        || (status ? `Request failed with status ${status}` : err?.message)
        || 'Error marking session as attended.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('You are not authenticated. Please login again.');
      }

      // Basic validation before request
      if (!meetingDetails.session_booking_id) throw new Error('Please select a booking session.');
      if (!meetingDetails.topic.trim()) throw new Error('Please enter a class topic.');
      if (!meetingDetails.agenda.trim()) throw new Error('Please enter a class description.');

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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const data = response.data;
        setMeetingData({
          id: data?.id || null,
          session_booking_id: meetingDetails.session_booking_id,
          meetLink: data?.meeting_link || data?.teacher_meeting_link || null,
          studentLink: data?.student_meeting_link || null,
          whiteboardLink: data?.whiteboard_link || null,
          title: data?.title || meetingDetails.topic,
          description: data?.description || meetingDetails.agenda,
          startedAt: data?.started_at || null,
          endedAt: data?.ended_at || null,
        });
        setShowPopup(true);

        // Reset form after successful creation
        setMeetingDetails({
          session_booking_id: '',
          topic: '',
          agenda: '',
          start_time: '',
          duration: 45,
          timezone: 'UTC',
        });

        // Refresh live sessions
        const refreshResponse = await axios.get(`${FHOST}/api/live-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const refreshData = refreshResponse.data;
        const sessions = Array.isArray(refreshData?.results) ? refreshData.results : [];
        setLiveSessions(sessions);

        // Refresh bookings to remove the used one
        const refreshBookingsResponse = await axios.get(`${FHOST}/api/booked-sessions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const refreshBookingsData = refreshBookingsResponse.data;
        const allBookings = Array.isArray(refreshBookingsData?.results) ? refreshBookingsData.results : [];
        const availableBookings = allBookings.filter(
          booking => booking.is_allowed && !booking.attended
        );
        setBookings(availableBookings);
      } else {
        setError('Unexpected response from server while creating meeting.');
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const details = typeof data === 'string'
        ? data
        : (data?.error || data?.message || data?.details);
      const msg = details
        || (status ? `Request failed with status ${status}` : err?.message)
        || 'Error creating meeting. Please check your inputs.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-josefin p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-lilita text-[#015575] mb-8 text-center">
          Live Classes Management
        </h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-b-2 border-[#015575] text-[#015575]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Live Session
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'sessions'
                ? 'border-b-2 border-[#015575] text-[#015575]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Live Sessions
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'google'
                ? 'border-b-2 border-[#015575] text-[#015575]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Google Connect
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <div>
            <h2 className="text-2xl font-lilita text-[#015575] mb-6 text-center">
              Schedule New Class
            </h2>

        <form className="space-y-6">
          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Booking Session <span className="text-red-500">*</span>
            </label>
            <select
              value={meetingDetails.session_booking_id}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, session_booking_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              required
            >
              <option value="">Choose a booking session</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  Course {booking.course} - {new Date(booking.scheduled_start).toLocaleString()} - {booking.status}
                </option>
              ))}
            </select>
            {bookings.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No accepted or confirmed bookings available. Please accept a booking request first.
              </p>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Topic
            </label>
            <input
              type="text"
              value={meetingDetails.topic}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, topic: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              placeholder="Enter class topic"
              required
            />
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Description
            </label>
            <textarea
              value={meetingDetails.agenda}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, agenda: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent h-32"
              placeholder="Describe the class content"
              required
            />
          </div>


          {/* Note: Time and duration are now determined by the booking session */}
          {meetingDetails.session_booking_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> The session time and duration will be determined by the selected booking.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleCreateMeeting}
            disabled={loading}
            className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}
        </form>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h2 className="text-2xl font-lilita text-[#015575] mb-6 text-center">
              My Live Sessions
            </h2>
            {liveSessions.length === 0 ? (
              <p className="text-center text-gray-500">No live sessions found.</p>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-[#015575]">{session.title}</h3>
                      <button
                        onClick={() => handleUpdateLiveSession(session.id, { session_booking_id: session.id, title: session.title, description: session.description })}
                        className="px-3 py-1 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] transition text-sm"
                        disabled={loading}
                      >
                        Mark as Attended
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">{session.description}</p>
                    <div className="flex gap-2 mb-2">
                      {session.teacher_meeting_link && (
                        <a
                          href={session.teacher_meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Join Meeting
                        </a>
                      )}
                      {session.whiteboard_link && (
                        <a
                          href={session.whiteboard_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Open Whiteboard
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Started: {session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}</p>
                      <p>Ended: {session.ended_at ? new Date(session.ended_at).toLocaleString() : 'Not ended'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'google' && (
          <div>
            <h2 className="text-2xl font-lilita text-[#015575] mb-6 text-center">
              Connect Google Account
            </h2>
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-4 text-center">
                Connect your Google account to enable automatic Google Meet link generation for live sessions.
              </p>
              {googleConnected ? (
                <div className="text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Google account connected successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorization Code
                    </label>
                    <input
                      type="text"
                      value={googleCode}
                      onChange={(e) => setGoogleCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                      placeholder="Enter the authorization code from Google"
                    />
                  </div>
                  <button
                    onClick={handleGoogleConnect}
                    disabled={loading || !googleCode.trim()}
                    className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Connect Google Account
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showPopup && meetingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-[#015575] mb-2">
                Live Session Created!
              </h2>
              <p className="mb-6 text-gray-600">
                Your live session has been successfully created. Google Meet links have been generated.
              </p>
              
              {meetingData.meetLink && (
                <div className="w-full space-y-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2 text-left">
                      Teacher Meeting Link:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={meetingData.meetLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#015575] font-medium bg-white"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(meetingData.meetLink);
                          alert('Link copied to clipboard!');
                        }}
                        className="px-3 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] transition text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {meetingData.studentLink && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2 text-left">
                        Student Meeting Link:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={meetingData.studentLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#015575] font-medium bg-white"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(meetingData.studentLink);
                            alert('Link copied to clipboard!');
                          }}
                          className="px-3 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] transition text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {meetingData.whiteboardLink && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2 text-left">
                        Whiteboard Link:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={meetingData.whiteboardLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#015575] font-medium bg-white"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(meetingData.whiteboardLink);
                            alert('Link copied to clipboard!');
                          }}
                          className="px-3 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] transition text-sm"
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
                  onClick={() => {
                    if (meetingData.meetLink) {
                      window.open(meetingData.meetLink, '_blank');
                    }
                  }}
                  className="w-full bg-[#015575] text-white py-2 rounded-xl hover:bg-[#01415e] transition flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Join Meeting
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setMeetingData(null);
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
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
