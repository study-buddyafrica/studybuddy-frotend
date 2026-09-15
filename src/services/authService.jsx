import axios from "axios";
import { mockUsers } from "./mockData";
import { FHOST } from "../components/constants/Functions";
import { authStorage } from "./authStorage";

const USE_MOCK = false;

export const authService = {
  login: async (email, password) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const user = mockUsers.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Use the new storage instead of localStorage
      authStorage.setTokens(user.auth.access_token, user.auth.refresh_token);

      return {
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
    }

    // Real API
    try {
      const response = await axios.post(`${FHOST}/api/token/request/`, {
        email,
        password,
      });

      const data = response.data;
      const access = data.access || data["access"];
      const refresh = data.refresh || data["refresh"];

      if (!access) {
        throw new Error("No access token received");
      }

      // Store tokens correctly
      authStorage.setTokens(access, refresh);

      return response;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  },

  refreshToken: async () => {
    const refreshToken = authStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(`${FHOST}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access || response.data["access"];

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      // Update only the access token in memory (keep the same refresh)
      authStorage.setTokens(newAccessToken, refreshToken);

      return newAccessToken;
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error.response?.data || error.message,
      );
      authStorage.clearTokens(); // force clean state on failure
      throw error;
    }
  },

  logout: () => {
    authStorage.clearTokens();
    localStorage.removeItem("userInfo"); // still clear userInfo for now
  },

  getAccessToken: () => authStorage.getAccessToken(),
  getRefreshToken: () => authStorage.getRefreshToken(),
  isAuthenticated: () => authStorage.isAuthenticated(),
};
