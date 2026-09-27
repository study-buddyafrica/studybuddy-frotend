import axios from "axios";
import { FHOST } from "./Functions";
import { authStorage } from "../../services/authStorage";
import { authService } from "../../services/authService";

const apiClient = axios.create({
  baseURL: FHOST,
});

const attachInterceptors = (client) => {
  // Attach access token from memory
  client.interceptors.request.use(
    (config) => {
      const token = authStorage.getAccessToken();
      if (token && !config.headers.Authorization && !config.url?.includes("/api/token/refresh/")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // On 401 → try one silent refresh, then retry. If refresh fails → reject.
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/token/refresh/") &&
        !originalRequest.url?.includes("/api/token/request/") &&
        !originalRequest.url?.includes("/api/login/")
      ) {
        originalRequest._retry = true;

        try {
          // Attempt silent refresh
          const newAccessToken = await authService.refreshToken();

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

// Attach to both apiClient and default axios instance used across the app
attachInterceptors(apiClient);
attachInterceptors(axios);

export default apiClient;
