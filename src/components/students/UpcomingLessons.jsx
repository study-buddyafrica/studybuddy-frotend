import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';

const UpcomingLessons = ({ userInfo }) => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${FHOST}/lessons/api/bookings/student/${userInfo?.id}`);
        setBookings(response.data);
      } catch (error) {
        setError('Failed to fetch bookings.');
      }
    };

    fetchBookings();
  }, [userInfo?.id]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold text-center mb-6 text-gray-800">Upcoming Classes</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.length === 0 ? (
          <div className="col-span-3 text-center text-lg text-gray-500">
            No upcoming lessons.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-indigo-600">{booking.teacher_name}</h2>
                <p className="text-gray-500 mt-2">{booking.session_datetime}</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-700">Status: {booking.status}</p>
                  <p className="text-sm text-gray-700">Cost: Ksh {booking.cost}</p>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Booked At: {booking.booked_at}</p>
                </div>
              </div>
              <div className="px-6 py-3 bg-indigo-600 text-white rounded-b-lg flex justify-center text-center">
                 <p className="text-sm border-2 w-fit border-green-500 rounded-lg p-2 cursor-pointer">{booking.status}</p>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingLessons;
