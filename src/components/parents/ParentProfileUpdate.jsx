import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST, refreshAccessToken } from "../constants/Functions";

const toDateInputValue = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const ParentProfileUpdate = ({ userInfo }) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const getInitialFormData = () => {
    const stored = JSON.parse(localStorage.getItem("userInfo")) || {};
    return {
      full_name:
        stored.full_name || userInfo?.full_name || userInfo?.username || "",
      birth_date: toDateInputValue(stored.birth_date || ""),
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo")) || {};
    if (stored.profile_picture) {
      setProfilePhotoPreview(stored.profile_picture);
    }
  }, []);

  useEffect(() => {
    if (userInfo?.id) {
      setFormData((prev) => ({
        ...prev,
        full_name: userInfo?.full_name || userInfo?.username || "",
      }));
      fetchProfile();
    }
  }, [userInfo?.id, userInfo?.full_name, userInfo?.username]);

  const fetchProfile = async () => {
    let token;
    try {
      token = await refreshAccessToken();
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/";
      return;
    }
    try {
      const response = await axios.get(`${FHOST}/api/parent/profile/update/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setProfileData(response.data);

        // Populate form with saved profile data
        setFormData({
          full_name:
            response.data.full_name ||
            userInfo?.full_name ||
            userInfo?.username ||
            "",
          birth_date: toDateInputValue(response.data.birth_date) || "",
        });

        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }

        // Keep localStorage in sync with API data
        const currentUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (currentUserInfo) {
          const updatedUserInfo = {
            ...currentUserInfo,
            full_name: response.data.full_name || currentUserInfo.full_name,
            profile_picture:
              response.data.profile_picture || currentUserInfo.profile_picture,
            birth_date: response.data.birth_date || currentUserInfo.birth_date,
          };
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          window.dispatchEvent(new Event("profile-updated"));
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Profile not found - will be created on first update");
      } else {
        console.error("Error fetching profile:", error);
      }
    }
  };

  // Shared function to handle post-save actions
  const handleSaveSuccess = async (token) => {
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 10000);

    try {
      const updatedProfileResponse = await axios.get(
        `${FHOST}/api/parent/profile/update/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (updatedProfileResponse.data) {
        setProfileData(updatedProfileResponse.data);

        const currentUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        const updatedUserInfo = {
          ...currentUserInfo,
          full_name:
            updatedProfileResponse.data.full_name ||
            formData.full_name ||
            currentUserInfo.full_name,
          profile_picture: updatedProfileResponse.data.profile_picture,
          birth_date:
            toDateInputValue(updatedProfileResponse.data.birth_date) || "",
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        // Notify parent dashboard to update avatar and profile state
        window.dispatchEvent(new Event("profile-updated"));

        setFormData({
          full_name:
            updatedProfileResponse.data.full_name ||
            formData.full_name ||
            currentUserInfo.full_name ||
            currentUserInfo.username ||
            "",
          birth_date:
            toDateInputValue(updatedProfileResponse.data.birth_date) || "",
        });

        if (updatedProfileResponse.data.profile_picture) {
          setProfilePhotoPreview(updatedProfileResponse.data.profile_picture);
        }
      }
    } catch (fetchError) {
      // The save succeeded even if the re-fetch fails
      // Fallback: persist what we submitted
      console.error("Error re-fetching updated profile:", fetchError);
      const currentUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      const updatedUserInfo = {
        ...currentUserInfo,
        full_name: formData.full_name || currentUserInfo.full_name,
        birth_date: formData.birth_date || currentUserInfo.birth_date,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      window.dispatchEvent(new Event("profile-updated"));
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = file.type?.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) {
      setErrorMessage("Please select a valid image file.");
      setTimeout(() => setErrorMessage(""), 10000);
      return;
    }
    if (file.size > maxBytes) {
      setErrorMessage("Image is too large. Max size is 5MB.");
      setTimeout(() => setErrorMessage(""), 10000);
      return;
    }

    setProfilePhotoPreview(URL.createObjectURL(file));
    setProfilePhoto(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    let token;
    try {
      token = await refreshAccessToken();
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/";
      return;
    }

    if (!token) {
      setErrorMessage("No authentication token found. Please login again.");
      setTimeout(() => setErrorMessage(""), 8000);
      setLoading(false);
      return;
    }

    // Build FormData - full_name MUST be included
    const formDataToSend = new FormData();
    formDataToSend.append("full_name", formData.full_name);
    if (formData.birth_date) {
      formDataToSend.append("birth_date", formData.birth_date);
    }
    if (profilePhoto) {
      formDataToSend.append("profile_picture", profilePhoto);
    }

    const requestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };

    try {
      // post
      try {
        await axios.post(
          `${FHOST}/api/parent/profile/update/`,
          formDataToSend,
          requestConfig,
        );
        console.log("Profile created via POST");
        await handleSaveSuccess(token);
        return;
      } catch (postError) {
        console.log("POST failed:", postError.response?.status);
      }

      // PUT
      try {
        await axios.put(
          `${FHOST}/api/parent/profile/update/`,
          formDataToSend,
          requestConfig,
        );
        console.log("Profile updated via PUT");
        await handleSaveSuccess(token);
        return;
      } catch (putError) {
        console.log("PUT failed:", putError.response?.status);
      }

      // PATCH
      try {
        await axios.patch(
          `${FHOST}/api/parent/profile/update/`,
          formDataToSend,
          requestConfig,
        );
        console.log("Profile updated via PATCH");
        await handleSaveSuccess(token);
        return;
      } catch (patchError) {
        console.log("PATCH failed:", patchError.response?.status);
        // All three methods failed — throw to outer catch
        const errorData = patchError.response?.data;
        const errorDetail =
          errorData?.detail || errorData?.message || errorData?.error;
        throw new Error(
          errorDetail || "Failed to update profile. Please try again.",
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Profile update failed. Please try again.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 10000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-lilita text-[#015575] text-center mb-8">
          Update Profile
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-[#015575] mb-4">
              Profile Photo
            </label>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#015575]/20">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Add Photo</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#015575] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-[#01415e] transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={loading}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">
              Personal Information
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {userInfo?.full_name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Pre-filled from your registration details
                  </p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Profile"
            )}
          </button>
        </form>

        {/* Toast Notifications */}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="ml-2 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="ml-2 hover:opacity-75">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentProfileUpdate;
