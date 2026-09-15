import axios from "axios";
import { FHOST } from "./Functions";
import { authStorage } from "../../services/authStorage";
import { authService } from "../../services/authService";

const apiClient = axios.create({
  baseURL: FHOST,
});

// Attach access token from memory
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// On 401 → try one silent refresh, then retry. If refresh fails → clear and redirect.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt refresh
        const newAccessToken = await authService.refreshToken();

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clean everything and force login
        authStorage.clearTokens();
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
