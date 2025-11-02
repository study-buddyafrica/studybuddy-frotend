import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LiveClass = ({ userInfo }) => {
  const [meetingDetails, setMeetingDetails] = useState({
    topic: '',
    agenda: '',
    start_time: '',
    duration: 45,
    timezone: 'UTC',
    class_id: '',
    subject_id: '',
    grade: '',
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${FHOST}/admin/get-classes`);
        const list = Array.isArray(response.data?.classes) ? response.data.classes : [];
        setClasses(list);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClasses([]);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (meetingDetails.class_id) {
      const fetchSubjects = async () => {
        try {
          const response = await axios.get(`${FHOST}/admin/get-subjects/${meetingDetails.class_id}`);
          const list = Array.isArray(response.data?.classes) ? response.data.classes : [];
          // normalize to {id, name}
          setSubjects(list.map(s => ({ id: s.id, name: s.subject })));
          // clear previous selection if not in new list
          if (!list.find(s => String(s.id) === String(meetingDetails.subject_id))) {
            setMeetingDetails(prev => ({ ...prev, subject_id: '' }));
          }
        } catch (err) {
          console.error('Error fetching subjects:', err);
          setSubjects([]);
          setMeetingDetails(prev => ({ ...prev, subject_id: '' }));
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
      setMeetingDetails(prev => ({ ...prev, subject_id: '' }));
    }
  }, [meetingDetails.class_id]);

  const handleCreateMeeting = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic validation before request
      if (!meetingDetails.topic.trim()) throw new Error('Please enter a class topic.');
      if (!meetingDetails.agenda.trim()) throw new Error('Please enter a class description.');
      if (!meetingDetails.start_time) throw new Error('Please select a start time.');
      if (!meetingDetails.duration || Number(meetingDetails.duration) <= 0) throw new Error('Please enter a valid duration.');

      // Convert datetime-local (YYYY-MM-DDTHH:MM) to ISO format with Z (UTC)
      // Input format: "2024-11-23T12:00" (from datetime-local input, local timezone)
      // Output format: "2024-11-23T12:00:00Z" (ISO format with UTC timezone)
      let isoStartTime = '';
      if (meetingDetails.start_time) {
        const timeStr = meetingDetails.start_time.trim();
        if (timeStr.includes('Z')) {
          // Already in ISO format with Z
          isoStartTime = timeStr;
        } else {
          // Parse as local date and convert to UTC ISO string
          try {
            // datetime-local input is in local timezone
            const localDate = new Date(timeStr);
            if (!isNaN(localDate.getTime())) {
              // Convert to ISO string (automatically converts to UTC and adds Z)
              isoStartTime = localDate.toISOString();
            } else {
              // Fallback: if parsing fails, try to add seconds and Z
              isoStartTime = timeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
                ? `${timeStr}:00Z`
                : timeStr;
            }
          } catch {
            // Final fallback
            isoStartTime = timeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
              ? `${timeStr}:00Z`
              : timeStr;
          }
        }
      }

      const payload = {
        topic: meetingDetails.topic,
        agenda: meetingDetails.agenda,
        duration: parseInt(meetingDetails.duration, 10) || 45,
        start_time: isoStartTime,
        timezone: meetingDetails.timezone || 'UTC',
        subject_id: meetingDetails.subject_id || null,
      };

      const response = await axios.post(
        `${FHOST}/lessons/meetings/${userInfo?.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.status === 201) {
        const data = response.data;
        setMeetingData({
          eventId: data?.google_meet_details?.event_id || null,
          meetLink: data?.google_meet_details?.google_meet_link || data?.db_entry?.google_meet_link || null,
          sessionId: data?.db_entry?.session_id || null,
          title: data?.db_entry?.title || meetingDetails.topic,
        });
        setShowPopup(true);
        
        // Reset form after successful creation
        setMeetingDetails({
          topic: '',
          agenda: '',
          start_time: '',
          duration: 45,
          timezone: 'UTC',
          class_id: '',
          subject_id: '',
          grade: '',
        });
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
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-lilita text-[#015575] mb-8 text-center">
          Schedule New Class
        </h1>

        <form className="space-y-6">
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

          {/* Class Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={meetingDetails.class_id}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, class_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                required
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            {subjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject
                </label>
                <div className="space-y-2">
                  {subjects.map((sub) => (
                    <label 
                      key={sub.id}
                      className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-[#f0f8ff] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="subject"
                        value={sub.id}
                        checked={String(meetingDetails.subject_id) === String(sub.id)}
                        onChange={(e) => setMeetingDetails({ ...meetingDetails, subject_id: e.target.value })}
                        className="h-5 w-5 text-[#015575] focus:ring-[#015575]"
                      />
                      <span className="text-gray-700">{sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={meetingDetails.grade}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, grade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              >
                <option value="">Choose grade (optional)</option>
                {['1','2','3','4','5','6','7','8','9','10','11','12'].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={meetingDetails.start_time}
                  onChange={(e) => setMeetingDetails({ ...meetingDetails, start_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  required
                />
                <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (mins)
              </label>
              <input
                type="number"
                value={meetingDetails.duration}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, duration: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                required
              />
            </div>

          </div>

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
                Create Google Meet
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

      {/* Success Modal */}
      {showPopup && meetingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-[#015575] mb-2">
                Google Meet Created!
              </h2>
              <p className="mb-6 text-gray-600">
                Your meeting has been successfully created and scheduled.
              </p>
              
              {meetingData.meetLink && (
                <div className="w-full bg-gray-50 rounded-xl p-4 mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2 text-left">
                    Google Meet Link:
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