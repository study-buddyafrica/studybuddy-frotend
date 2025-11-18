import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const ParentProfileUpdate = ({ userInfo }) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    birth_date: "",
  });

  useEffect(() => {
    if (userInfo?.id) {
      fetchProfile();
    }
  }, [userInfo]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${FHOST}/api/parent/profile/update/${userInfo.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data) {
        setProfileData(response.data);
        setFormData({
          birth_date: response.data.birth_date || "",
        });
        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }
      }
    } catch (error) {
      // 404 means profile doesn't exist yet - that's fine, we'll create it on submit
      if (error.response?.status === 404) {
        console.log("Profile not found - will be created on first update");
        // Don't set error, just start with empty form
      } else {
        console.error("Error fetching profile:", error);
      }
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = file.type?.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) {
      setErrorMessage("Please select a valid image file.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (file.size > maxBytes) {
      setErrorMessage("Image is too large. Max size is 5MB.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const previewURL = URL.createObjectURL(file);
    setProfilePhotoPreview(previewURL);
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

    try {
      // Get and refresh token if needed
      let token = localStorage.getItem("access_token");
      if (!token) {
        setErrorMessage("No authentication token found. Please login again.");
        setTimeout(() => setErrorMessage(""), 5000);
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Append all required fields according to API spec
      if (formData.birth_date) {
        formDataToSend.append("birth_date", formData.birth_date);
      }
      
      // Append profile picture if provided
      if (profilePhoto) {
        formDataToSend.append("profile_picture", profilePhoto);
      }
      
      console.log("Submitting parent profile data:", {
        birth_date: formData.birth_date,
        hasPhoto: !!profilePhoto
      });

      // Try POST first to create profile (if it doesn't exist)
      // Then try PUT (upsert - create or update)
      // Finally try PATCH (update only)
      let response;
      
      // Strategy 1: Try POST to create new profile
      try {
        response = await axios.post(
          `${FHOST}/api/parent/profile/`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Parent profile created successfully via POST");
      } catch (postError) {
        console.log("POST failed, trying PUT:", postError.response?.status, postError.response?.data);
        
        // Strategy 2: Try PUT (should create if not exists, update if exists)
        try {
          response = await axios.put(
            `${FHOST}/api/parent/profile/update/${userInfo.id}/`,
            formDataToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Parent profile updated/created successfully via PUT");
        } catch (putError) {
          console.log("PUT failed, trying PATCH:", putError.response?.status, putError.response?.data);
          
          // Strategy 3: Try PATCH (update only - if profile exists)
          try {
            response = await axios.patch(
              `${FHOST}/api/parent/profile/update/${userInfo.id}/`,
              formDataToSend,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("Parent profile updated successfully via PATCH");
          } catch (patchError) {
            console.error("All methods failed for parent profile:", {
              POST: { status: postError.response?.status, data: postError.response?.data },
              PUT: { status: putError.response?.status, data: putError.response?.data },
              PATCH: { status: patchError.response?.status, data: patchError.response?.data }
            });
            
            // All methods failed - provide helpful error message
            const errorData = patchError.response?.data || putError.response?.data || postError.response?.data;
            const errorDetail = errorData?.detail || errorData?.message || errorData?.error;
            
            if (patchError.response?.status === 404 && putError.response?.status === 404 && postError.response?.status === 404) {
              throw new Error(
                errorDetail || 
                "Profile endpoint not found. Please ensure the profile API endpoint is configured correctly."
              );
            } else {
              throw new Error(
                errorDetail || 
                "Failed to update profile. Please check your connection and try again."
              );
            }
          }
        }
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Profile updated successfully!");
        
        const updatedProfile = response.data;
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        const updatedUserInfo = { ...currentUserInfo, ...updatedProfile };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        window.dispatchEvent(new Event('profile-updated'));
        
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      "Profile update failed. Please try again.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
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

        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 text-green-700 rounded-xl border border-green-300">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-xl border border-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-[#015575] mb-4">
              Profile Photo
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#015575]/20">
                  {profilePhotoPreview ? (
                    <img 
                      src={profilePhotoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Add Photo</span>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Personal Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParentProfileUpdate;

