import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const FHOST = process.env.REACT_APP_API_URL;

export const checkUser = async (email) => {
  //  FIX: Pointing to the exact explicit route defined in config/urls.py
  const serverUrl = `${FHOST}/api/auth/check_user/`;

  try {
    const response = await axios.post(serverUrl, { email });

    const responseData = response.data;

    if (responseData !== null) {
      return responseData;
    }
    return { error: "User not found" };
  } catch (error) {
    console.error("Error checking email:", error);

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

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token, Please login again");

  const response = await axios.post(`${FHOST}/api/token/refresh/`, {
    refresh: refreshToken,
  });

  console.log("response", response);

  const newAccessToken = response.data.access;
  localStorage.setItem("access_token", newAccessToken);
  return newAccessToken;
};
