
import axios from "axios";
import { mockUsers } from "./mockData";
import { FHOST } from "../components/constants/Functions";

const API_SERVICE_URL = `${FHOST}/auth`;

// 🧩 Toggle mock mode ON/OFF
const USE_MOCK = false; // change to false when backend is ready

export const authService = {
  // Login function to authenticate user using new token endpoint
  login: async (email, password, rememberMe = false) => {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Simulate real backend structure
      const response = {
        status: 200,
        data: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_superuser: user.is_superuser === true,
            auth: user.auth,
          },
        },
      };

      // Save tokens
      localStorage.setItem("access_token", user.auth.access_token);
      localStorage.setItem("refresh_token", user.auth.refresh_token);

      console.log("Mock login successful:", user);
      return response;
    }

    // 🌐 Real API call - using new token endpoint
    try {
      const response = await axios.post(
        `${FHOST}/api/token/request/`,
        {
          email: email,
          password: password,
        }
      );

      const data = await response.data;
      console.log("Login Successful (real API):", data);

      let access_token = data["access"];
      let refresh_token = data["refresh"];

      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Refresh access token using refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      // Try standard JWT refresh format first (refresh field)
      let response;
      try {
        response = await axios.post(
          `${FHOST}/api/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );
      } catch (firstError) {
        // If that fails, try with "access" field (as per some API specs)
        if (firstError.response?.status === 400) {
          response = await axios.post(
            `${FHOST}/api/token/refresh/`,
            {
              access: refreshToken,
            }
          );
        } else {
          throw firstError;
        }
      }

      const data = await response.data;
      const newAccessToken = data["access"];

      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
      }

      throw new Error("No access token in refresh response");
    } catch (error) {
      console.error("Token refresh failed:", error.response?.data || error.message);
      // Don't clear tokens - let the user stay logged in
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userInfo");
  },

  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
};
