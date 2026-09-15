// src/services/authStorage.js
// Access token lives ONLY in memory.
// Refresh token lives in sessionStorage (dies when tab closes).
// localStorage is never used for tokens again.

let accessToken = null;

export const authStorage = {
  setTokens(access, refresh) {
    accessToken = access || null;

    if (refresh) {
      sessionStorage.setItem("refresh_token", refresh);
    } else {
      sessionStorage.removeItem("refresh_token");
    }

    // Clean up any leftover localStorage tokens so old code cannot resurrect them
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getAccessToken() {
    return accessToken;
  },

  getRefreshToken() {
    return sessionStorage.getItem("refresh_token");
  },

  // --- User Info Helpers ---
  getUserInfo() {
    try {
      const info = localStorage.getItem("userInfo");
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  },

  setUserInfo(info) {
    if (info) {
      localStorage.setItem("userInfo", JSON.stringify(info));
    } else {
      localStorage.removeItem("userInfo");
    }
  },

  // Complete cleanup on logout or auth failure
  clearTokens() {
    accessToken = null;
    sessionStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userInfo");
  },

  isAuthenticated() {
    return Boolean(accessToken);
  },

  hasStoredSession() {
    return Boolean(sessionStorage.getItem("refresh_token"));
  },
};
