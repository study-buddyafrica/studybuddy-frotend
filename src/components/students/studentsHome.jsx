import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaBookReader, FaChalkboardTeacher, FaUserAlt } from 'react-icons/fa'; // For profile picture placeholder
import { FHOST } from '../constants/Functions';

const StudentsHome = ({setActiveComponent}) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [walletAmount, setWalletAmount] = useState(1200);
  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For handling the toggling of "View More"
  const [viewMoreTeachers, setViewMoreTeachers] = useState(false);
  const [viewMoreVideos, setViewMoreVideos] = useState(false);

  useEffect(() => {
    // Fetch teachers data from the backend
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${FHOST}/api/teachers/list`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const results = response.data?.results || [];

        const formattedTeachers = results.map((teacher) => ({
          id: teacher.id,
          full_name: teacher.full_name || 'Teacher',
          bio: teacher.bio || '',
          subjects: teacher.subjects || [],
          is_verified: teacher.is_verified,
          profilePicture: teacher.profile_picture || 'https://via.placeholder.com/50',
          rating: teacher.rating || 4.5,
          availability: teacher.availability || [
            { date: '2024-11-27', time: '9:00 AM - 11:00 AM', isAvailable: true },
            { date: '2024-11-27', time: '3:00 PM - 5:00 PM', isAvailable: true },
          ],
        }));

        setTeachers(formattedTeachers);
      } catch (err) {
        setError('An error occurred while fetching teachers data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${FHOST}/lessons/api/live-sessions`);
        setSessions(response.data);
      } catch (err) {
        setError('Error fetching sessions. Please try again.');
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    // Load videos from backend feed if needed; leaving empty by default
    setVideos([]);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleJoinClassClick = (session) => {
    setSelectedSession(session);
    setShowPaymentForm(true);
  };

  const handlePayment = (amount) => {
    if (walletAmount >= amount) {
      setWalletAmount(walletAmount - amount);
      setFormVisible(false);
      window.open(selectedClass.joinUrl, '_blank');
    } else {
      alert('Insufficient balance!');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50  text-white">
      {/* Wallet Card */}
      <div className="bg-blue-900 p-4 rounded-lg shadow-lg mb-6 md:w-full w-screen">
        <h3 className="text-xl mb-4">Your Wallet</h3>
        <div className='flex justify-between w-11/12 md:w-full'>
          <p className="text-lg">Amount: ${walletAmount}</p>
          <button className='p-2 text-black rounded-md bg-blue-100' onClick={() => setActiveComponent("mywallet")}>Add Funds</button>
        </div>
      </div>

      {/* Teachers Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Teachers</h3>
        <div className="w-full md:w-5/6 mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {teachers.slice(0, viewMoreTeachers ? teachers.length : 4).map((teacher, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform transform hover:scale-105 duration-300">
                <img
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-full mb-4 border-4 border-gray-200"
                />
                <h4 className="text-lg font-semibold text-gray-800 text-center">{teacher.name}</h4>
                <div className="flex items-center space-x-2 mt-2">
                  <FaChalkboardTeacher className="text-indigo-600" />
                  <p className="text-sm text-gray-600 text-center">{teacher.subjects.length} Subjects</p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <FaBookReader className="text-gray-600" />
                  <p className="text-sm text-gray-600 text-center">Subjects: <span className="font-semibold text-gray-800">{teacher.subjects.join(', ')}</span></p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setViewMoreTeachers(!viewMoreTeachers)} className="mt-4 text-indigo-600">
            {viewMoreTeachers ? 'View Less' : 'View More'}
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Videos</h3>
        <div className="overflow-auto gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 h-auto">
          {videos.slice(0, viewMoreVideos ? videos.length : 4).map((video, index) => (
            <div key={index} className="bg-white p-2 rounded-lg w-full h-80 flex flex-col items-center shadow-lg">
              <div className="w-full h-48 overflow-hidden rounded-lg mb-3 relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover absolute top-0 left-0"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">{video.title}</h4>
              <p className="text-sm text-gray-600 text-center line-clamp-2">{video.description}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setViewMoreVideos(!viewMoreVideos)} className="mt-4 text-indigo-600">
          {viewMoreVideos ? 'View Less' : 'View More'}
        </button>
      </div>

      {/* Classes List */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Zoom Classes</h3>
        <div className="overflow-x-auto w-full md:w-5/6 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
            {sessions?.map((session, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center shadow-xl transform hover:scale-102 transition-transform duration-300">
                <h4 className="text-xl font-medium text-gray-900 mb-2">{session?.name}</h4>
                <p className="text-sm text-gray-600">Subject: <span className="font-semibold text-gray-800">{session.subject?.name}</span></p>
                <p className="text-sm text-gray-600">Teacher: <span className="font-semibold text-gray-800">{session.teacher?.name}</span></p>
                <p className="text-sm text-gray-600">Topic: <span className="font-semibold text-gray-800">{session?.title}</span></p>
                <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-gray-800">${session.price}</span></p>
                <p className="text-sm text-gray-500 mt-2">Scheduled Date: <strong className="text-gray-700">{session.scheduled_date?.split(" ")[0]}</strong></p>
                <p className="text-sm text-gray-500">Scheduled Time: <strong className="text-gray-700">{session.scheduled_date?.split(" ")[1]}</strong></p>
                <button onClick={() => handleJoinClassClick(session)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none">
                  Join Class
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsHome;
