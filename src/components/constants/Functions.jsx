import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const FHOST = process.env.REACT_APP_API_URL || "";
console.log("API URL:", FHOST);

export const checkUser = async (email) => {
  const serverUrl = `${FHOST}/auth/check_user`;

  try {
    const response = await axios.post(serverUrl, { email });
    const responseData = response.data;

    // If the response data is not null, return the response data
    if (responseData !== null) {
      return responseData;
    }
    return { error: "User not found" };
  } catch (error) {
    console.error("Error checking email:", error);

    // Extract and return the server's error message
    if (error.response && error.response.data && error.response.data.message) {
      return { error: error.response.data.message };
    }

    return { error: "An unknown error occurred" };
  }
};

export const decodeJwtToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    console.log(decoded);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};
