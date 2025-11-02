import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Utility function to set a cookie
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

// Utility function to get a cookie value
const getCookie = (name) => {
  const nameEq = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEq) === 0) return c.substring(nameEq.length, c.length);
  }
  return '';
};

const Cookies = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });

  // Check if cookies are accepted already
  useEffect(() => {
    if (!getCookie('cookiesAccepted')) {
      setShowBanner(true);
    }
  }, []);

  // Handle user cookie consent
  const handleAcceptCookies = async () => {
    setCookie('cookiesAccepted', 'true', 365);
    setShowBanner(false);

    // Fetch user info from an API
    try {
      const response = await axios.get('/api/user-info');
      const { name, email } = response.data;
      setUserInfo({ name, email });

      // Store user info in cookies (optional, depends on your requirements)
      setCookie('userInfo', JSON.stringify({ name, email }), 365);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleRejectCookies = () => {
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg z-50">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline">
            <p className="text-sm sm:text-lg">
              We use cookies to enhance your experience on our website. By accepting, you consent to the use of cookies.
            </p>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex space-x-4">
              <button
                onClick={handleRejectCookies}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptCookies}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {userInfo.name && userInfo.email && (
        <div className="fixed top-0 right-0 bg-white text-black p-4 m-4 border border-gray-300 rounded-md shadow-md">
          <h2 className="font-semibold text-lg">User Info:</h2>
          <p className="text-sm">Name: {userInfo.name}</p>
          <p className="text-sm">Email: {userInfo.email}</p>
        </div>
      )}
    </>
  );
};

export default Cookies;