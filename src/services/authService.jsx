

import axios from "axios";
import { mockUsers } from "./mockData";
import { FHOST } from "../components/constants/Functions";

const API_SERVICE_URL = `${FHOST}/auth`;

// 🧩 Toggle mock mode ON/OFF
const USE_MOCK = true; // change to false when backend is ready

export const authService = {
  // Login function to authenticate user
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

    // 🌐 Real API call
    try {
      const response = await axios.post(
        `${API_SERVICE_URL}/login`,
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );

      const data = await response.data;
      console.log("Login Successful (real API):", data);

      let access_token = data["auth"]["access_token"];
      let refresh_token = data["auth"]["refresh_token"];

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      return response;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
};
