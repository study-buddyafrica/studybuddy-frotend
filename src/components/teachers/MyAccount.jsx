import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const MyAccount = () => {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    tscNumber: "",
    institution: "",
    subject: "",
    grade: "",
    gender: "",
    aboutMe: "",
  });

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(UserInfo);
  }, []);

  const toggleProfileForm = () => setShowProfileForm(!showProfileForm);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Require user id before attempting upload
    if (!userInfo?.id) {
      setErrorMessage("User not loaded. Please wait and try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Basic client-side validations
    const isImage = file.type?.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024; // 5MB
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

    // Resize/compress image to WebP to reduce server processing errors
    const compressToWebP = (inputFile, maxSize = 1024) => new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const { width, height } = img;
          let targetW = width;
          let targetH = height;
          if (width > height && width > maxSize) {
            targetW = maxSize;
            targetH = Math.round((height / width) * maxSize);
          } else if (height >= width && height > maxSize) {
            targetH = maxSize;
            targetW = Math.round((width / height) * maxSize);
          }
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetW, targetH);
          canvas.toBlob(
            (blob) => {
              resolve(blob || inputFile);
            },
            'image/webp',
            0.85
          );
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(inputFile);
    });

    const webpBlob = await compressToWebP(file);
    const uploadFile = new File([webpBlob], 'profile.webp', { type: 'image/webp' });

    const body = new FormData();
    body.append("profilePhoto", uploadFile);

    try {
      const response = await axios.post(
        `${FHOST}/auth/update-profile-photo/${userInfo.id}`,
        body,
        {
          headers: {
            // Do not set Content-Type manually; let the browser set the boundary
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 200) {
        setProfilePhoto(URL.createObjectURL(uploadFile));
        setSuccessMessage("Profile photo updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage("Failed to update profile photo");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      const data = error?.response?.data;
      const details = typeof data === 'string' ? data : (data?.error || data?.message || data?.details);
      const msg = details || error?.message || "Failed to update profile photo";
      console.error("Error updating profile photo:", error);
      setErrorMessage(String(msg));
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${FHOST}/users/verify-account/${userInfo?.id}`,
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          id_number: formData.idNumber,
          tsc_number: formData.tscNumber,
          school: formData.institution,
          subject: formData.subject,
          grade: formData.grade,
          gender: formData.gender,
          bio: formData.aboutMe,
          profile_picture: profilePhoto || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 200) {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          idNumber: "",
          tscNumber: "",
          institution: "",
          subject: "",
          grade: "",
          gender: "",
          aboutMe: "",
        });
        setSuccessMessage("Submitted successfully! Waiting for verification.");
        
        // Set local flag for verification submitted (scoped to user)
        if (currentUserInfo?.id) {
          localStorage.setItem(`verification_submitted_${currentUserInfo.id}`, 'true');
        } else {
          localStorage.setItem('verification_submitted', 'true');
        }
        // Notify other components to refresh their verification banner state
        window.dispatchEvent(new Event('verification-status-changed'));
        
        // Update userInfo in localStorage to indicate pending
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        currentUserInfo.verification_status = 'pending';
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        setUserInfo(currentUserInfo);
        
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setErrorMessage("Verification submission failed");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-lilita text-[#015575] text-center mb-8">
          Account Verification
        </h1>

        {/* Status Messages */}
        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 text-green-700 rounded-xl">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#015575]/20">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
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
                  onChange={handlePhotoUpload}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
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

            <button
              onClick={toggleProfileForm}
              className="bg-[#015575] text-white px-6 py-2 rounded-xl hover:bg-[#01415e] transition flex items-center gap-2"
            >
              <span>{showProfileForm ? "Close Form" : "Start Verification"}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                {showProfileForm ? (
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                ) : (
                  <path 
                    fillRule="evenodd" 
                    d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" 
                    clipRule="evenodd" 
                  />
                )}
              </svg>
            </button>
          </div>

          {showProfileForm && (
            <div className="mt-8 space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#015575] mb-6">
                  Personal Information
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { label: "Full Name", name: "fullName" },
                    { label: "Email Address", name: "email", type: "email" },
                    { label: "Phone Number", name: "phone", type: "tel" },
                    { label: "ID Number", name: "idNumber" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#015575] mb-6">
                  Professional Information
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { label: "TSC Number", name: "tscNumber" },
                    { label: "Current Institution", name: "institution" },
                    { label: "Subject", name: "subject" },
                    { label: "Grade", name: "grade" },
                    {
                      label: "Gender",
                      name: "gender",
                      type: "select",
                      options: ["Male", "Female", "Other"],
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option.toLowerCase()}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#015575] mb-6">About Me</h3>
                <textarea
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent h-32"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition text-lg font-semibold"
              >
                Submit Verification Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;