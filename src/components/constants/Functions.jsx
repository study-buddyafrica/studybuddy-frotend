import axios from "axios";
// constants/Functions.jsx


//  BYPASS: Dynamic Environment Routing
// Automatically detects if the app is running locally or in production
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const FHOST = isLocal ? "http://localhost:8000" : "https://backend.studybuddy.africa";

export const checkUser = async (email) => {
    const serverUrl = `${FHOST}/auth/check_user`;
  
    try {
      const response = await axios.post(serverUrl, { email });
      const responseData = response.data;
  
      // If the response data is not null, return the response data
      if (responseData !== null) {
        return responseData;
      }
      return { error: 'User not found' };
      
    } catch (error) {
      console.error('Error checking email:', error);
  
      // Extract and return the server's error message
      if (error.response && error.response.data && error.response.data.message) {
        return { error: error.response.data.message };
      }
  
      return { error: 'An unknown error occurred' };
    }
  };
