import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const MyAccount = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    id_number: "",
    tsc_number: "",
    gender: "",
    bio: "",
    hourly_rate: "",
    experience: "",
    birth_date: "",
    academic_certificate: null,
    tsc_number_certificate: null,
    subjects: [],
    grade: [],
  });

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (UserInfo) {
      setUserInfo(UserInfo);
      fetchProfile();
      fetchSubjects();
      fetchGrades();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data) {
        setFormData({
          phone: response.data.phone || "",
          id_number: response.data.id_number || "",
          tsc_number: response.data.tsc_number || "",
          gender: response.data.gender || "",
          bio: response.data.bio || "",
          hourly_rate: response.data.hourly_rate || "",
          experience: response.data.experience || "",
          birth_date: response.data.birth_date || "",
          academic_certificate: null,
          tsc_number_certificate: null,
          subjects: response.data.subjects || [],
          grade: response.data.grade || [],
        });
        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to localStorage data if API call fails
      const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (UserInfo) {
        setFormData({
          phone: UserInfo.phone || "",
          id_number: UserInfo.id_number || "",
          tsc_number: UserInfo.tsc_number || "",
          gender: UserInfo.gender || "",
          bio: UserInfo.bio || UserInfo.about_me || "",
          hourly_rate: UserInfo.hourly_rate || "",
          experience: UserInfo.experience || "",
          birth_date: UserInfo.birth_date || "",
          academic_certificate: null,
          tsc_number_certificate: null,
          subjects: UserInfo.subjects || [],
          grade: UserInfo.grade || UserInfo.grades || [],
        });
        if (UserInfo.profile_picture) {
          setProfilePhotoPreview(UserInfo.profile_picture);
        }
      }
    }
  };

  const fetchSubjects = async () => {
    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const { authService } = await import("../../services/authService");
            token = await authService.refreshToken();
          } catch (refreshError) {
            console.error("Could not refresh token for fetching subjects:", refreshError);
            return;
          }
        } else {
          console.error("No access token available for fetching subjects");
          return;
        }
      }

      let response;
      try {
        response = await axios.get(`${FHOST}/admin/get-subjects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (initialError) {
        // If 401 or 403, try to refresh token and retry
        if (initialError.response?.status === 401 || initialError.response?.status === 403) {
          try {
            const { authService } = await import("../../services/authService");
            const newToken = await authService.refreshToken();
            response = await axios.get(`${FHOST}/admin/get-subjects/`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            console.error("Error fetching subjects after token refresh:", refreshError);
            return;
          }
        } else {
          throw initialError;
        }
      }
      
      // Handle different possible response structures
      if (response.data?.classes) {
        setAvailableSubjects(response.data.classes);
      } else if (response.data?.subjects) {
        setAvailableSubjects(response.data.subjects);
      } else if (Array.isArray(response.data)) {
        setAvailableSubjects(response.data);
      } else {
        console.warn("Unexpected subjects response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const { authService } = await import("../../services/authService");
            token = await authService.refreshToken();
          } catch (refreshError) {
            console.error("Could not refresh token for fetching grades:", refreshError);
            return;
          }
        } else {
          console.error("No access token available for fetching grades");
          return;
        }
      }

      let response;
      try {
        response = await axios.get(`${FHOST}/admin/get-classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (initialError) {
        // If 401 or 403, try to refresh token and retry
        if (initialError.response?.status === 401 || initialError.response?.status === 403) {
          try {
            const { authService } = await import("../../services/authService");
            const newToken = await authService.refreshToken();
            response = await axios.get(`${FHOST}/admin/get-classes`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            console.error("Error fetching grades after token refresh:", refreshError);
            return;
          }
        } else {
          throw initialError;
        }
      }
      
      // Handle different possible response structures
      if (response.data?.classes) {
        setAvailableGrades(response.data.classes);
      } else if (response.data?.grades) {
        setAvailableGrades(response.data.grades);
      } else if (Array.isArray(response.data)) {
        setAvailableGrades(response.data);
      } else {
        console.warn("Unexpected grades response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

    // Set preview
    const previewURL = URL.createObjectURL(file);
    setProfilePhotoPreview(previewURL);
    setProfilePhoto(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCertificateChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, academic_certificate: file });
    }
  };

  const handleTscCertificateChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, tsc_number_certificate: file });
    }
  };

  const handleMultiSelect = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(id => id !== value)
    }));
  };

  // Helper function to extract error message from HTML error responses
  const extractErrorFromHTML = (htmlString) => {
    if (typeof htmlString !== 'string') {
      return null;
    }
    
    // Check if it's HTML (could be partial HTML too)
    if (!htmlString.includes('<!DOCTYPE html>') && !htmlString.includes('<html') && !htmlString.includes('<h1>')) {
      return null;
    }
    
    try {
      // Extract error title from <h1> tag (more flexible regex)
      const titleMatch = htmlString.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;
      
      // Extract exception value from <pre class="exception_value"> (more flexible)
      const exceptionMatch = htmlString.match(/<pre[^>]*class="exception_value"[^>]*>([^<]+)<\/pre>/i);
      const exception = exceptionMatch ? exceptionMatch[1].trim() : null;
      
      if (title || exception) {
        let errorMsg = '';
        if (title) {
          // Clean up title - remove "at /path" part and extra whitespace
          errorMsg = title.replace(/\s+at\s+.*$/, '').replace(/\s+/g, ' ').trim();
        }
        if (exception) {
          // Clean up the exception message
          const cleanException = exception
            .replace(/\[Errno \d+\]\s*/, '') // Remove errno
            .replace(/&#x27;/g, "'") // Decode HTML entities
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (errorMsg) {
            errorMsg += ': ' + cleanException;
          } else {
            errorMsg = cleanException;
          }
        }
        return errorMsg || null;
      }
    } catch (e) {
      console.error("Error parsing HTML error response:", e);
    }
    
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Check if token exists
    let token = localStorage.getItem("access_token");
    if (!token) {
      // Try to get refresh token and refresh
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { authService } = await import("../../services/authService");
          token = await authService.refreshToken();
        } catch (refreshError) {
          setErrorMessage("No authentication token found. Please log out and log back in.");
          setLoading(false);
          return;
        }
      } else {
        setErrorMessage("No authentication token found. Please log out and log back in.");
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields according to API endpoint - only send non-empty values
      if (formData.bio && formData.bio.trim()) {
        formDataToSend.append("bio", formData.bio.trim());
      }
      if (formData.phone && formData.phone.trim()) {
        formDataToSend.append("phone", formData.phone.trim());
      }
      if (formData.hourly_rate && formData.hourly_rate.toString().trim()) {
        formDataToSend.append("hourly_rate", formData.hourly_rate.toString().trim());
      }
      if (formData.experience && formData.experience.toString().trim()) {
        formDataToSend.append("experience", formData.experience.toString().trim());
      }
      if (formData.birth_date && formData.birth_date.trim()) {
        formDataToSend.append("birth_date", formData.birth_date.trim());
      }
      if (formData.tsc_number && formData.tsc_number.trim()) {
        formDataToSend.append("tsc_number", formData.tsc_number.trim());
      }
      if (formData.id_number && formData.id_number.trim()) {
        formDataToSend.append("id_number", formData.id_number.trim());
      }
      if (formData.gender && formData.gender.trim()) {
        formDataToSend.append("gender", formData.gender.trim());
      }

      // Add subjects and grades as arrays - only if they have values
      if (formData.subjects && Array.isArray(formData.subjects) && formData.subjects.length > 0) {
        formData.subjects.forEach(subjectId => {
          if (subjectId != null && subjectId !== '') {
            formDataToSend.append("subjects", subjectId);
          }
        });
      }
      if (formData.grade && Array.isArray(formData.grade) && formData.grade.length > 0) {
        formData.grade.forEach(gradeId => {
          if (gradeId != null && gradeId !== '') {
            formDataToSend.append("grade", gradeId);
          }
        });
      }
      
      // Add profile photo if selected
      if (profilePhoto && profilePhoto instanceof File) {
        formDataToSend.append("profile_picture", profilePhoto);
      }

      // Add certificates if selected
      if (formData.academic_certificate && formData.academic_certificate instanceof File) {
        formDataToSend.append("academic_certificate", formData.academic_certificate);
      }
      if (formData.tsc_number_certificate && formData.tsc_number_certificate instanceof File) {
        formDataToSend.append("tsc_number_certificate", formData.tsc_number_certificate);
      }

      // Log what we're sending (for debugging - remove in production)
      console.log("Sending profile update with fields:", {
        bio: formData.bio ? "present" : "missing",
        phone: formData.phone ? "present" : "missing",
        hourly_rate: formData.hourly_rate ? "present" : "missing",
        experience: formData.experience ? "present" : "missing",
        birth_date: formData.birth_date ? "present" : "missing",
        tsc_number: formData.tsc_number ? "present" : "missing",
        id_number: formData.id_number ? "present" : "missing",
        gender: formData.gender ? "present" : "missing",
        subjects_count: formData.subjects?.length || 0,
        grades_count: formData.grade?.length || 0,
        has_profile_photo: !!profilePhoto,
        has_academic_cert: !!formData.academic_certificate,
        has_tsc_cert: !!formData.tsc_number_certificate,
      });

      // Try the request, and if we get 401/403, refresh token and retry
      let response;
      try {
        response = await axios.patch(
          `${FHOST}/api/teacher/profile/update/`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (initialError) {
        // If 401 or 403, try to refresh token and retry
        if (initialError.response?.status === 401 || initialError.response?.status === 403) {
          try {
            const { authService } = await import("../../services/authService");
            const newToken = await authService.refreshToken();
            // Retry with new token
            response = await axios.patch(
              `${FHOST}/api/teacher/profile/update/`,
              formDataToSend,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
          } catch (refreshError) {
            // If refresh fails, throw the original error to be handled by the catch block below
            throw initialError;
          }
        } else {
          // For other errors, throw them
          throw initialError;
        }
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Profile updated successfully! Your profile has been submitted for verification. You will be notified once an admin reviews and approves your account.");
        
        // Update userInfo in localStorage
        const updatedProfile = response.data;
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        const updatedUserInfo = { ...currentUserInfo, ...updatedProfile };
        // Set verification status to pending if not already approved
        if (updatedUserInfo.verification_status !== 'approved') {
          updatedUserInfo.verification_status = 'pending';
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        
        // Notify other components to refresh
        window.dispatchEvent(new Event('profile-updated'));
        
        // Refresh profile data
        fetchProfile();
        
        setTimeout(() => setSuccessMessage(""), 10000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Check if it's an authentication error
      if (error.response?.status === 403) {
        const errorDetail = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.response?.data?.error ||
                           error.response?.data?.errors;
        setErrorMessage(
          `Access denied (403 Forbidden). ${errorDetail ? (typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)) : 'Your session may have expired. Please try logging out and logging back in.'}`
        );
      } else if (error.response?.status === 401) {
        setErrorMessage("Authentication failed. Please log out and log back in.");
      } else if (error.response?.status === 500) {
        // 500 Internal Server Error - show detailed error message
        let errorData = error.response?.data;
        let errorMsg = "Server error occurred while updating profile. ";
        
        // Check if HTML is in responseText (fallback)
        if (!errorData || (typeof errorData === 'object' && !errorData.detail && !errorData.message)) {
          const responseText = error.response?.request?.responseText;
          if (responseText && typeof responseText === 'string' && responseText.includes('<!DOCTYPE html>')) {
            errorData = responseText;
          }
        }
        
        // Handle case where axios might have tried to parse HTML as JSON
        if (errorData && typeof errorData === 'object' && errorData.toString) {
          const dataString = errorData.toString();
          if (dataString.includes('<!DOCTYPE html>') || dataString.includes('<h1>')) {
            errorData = dataString;
          }
        }
        
        if (errorData) {
          // Check if errorData is an HTML string
          if (typeof errorData === 'string' && (errorData.includes('<!DOCTYPE html>') || errorData.includes('<h1>'))) {
            const htmlError = extractErrorFromHTML(errorData);
            if (htmlError) {
              errorMsg += htmlError;
            } else {
              errorMsg += "A server configuration error occurred. Please contact support.";
            }
          } else if (typeof errorData === 'object') {
            // Try to extract meaningful error message from JSON
            if (errorData.detail) {
              errorMsg += typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
            } else if (errorData.message) {
              errorMsg += typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
            } else if (errorData.error) {
              errorMsg += typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
            } else if (errorData.errors) {
              errorMsg += typeof errorData.errors === 'string' ? errorData.errors : JSON.stringify(errorData.errors);
            } else {
              errorMsg += "An unexpected error occurred. Please contact support.";
            }
          } else if (typeof errorData === 'string') {
            // Try to extract from HTML string
            const extracted = extractErrorFromHTML(errorData);
            errorMsg += extracted || "An unexpected error occurred. Please contact support.";
          } else {
            errorMsg += "An unexpected error occurred. Please contact support.";
          }
        } else {
          errorMsg += "Please check the console for more details and contact support if the issue persists.";
        }
        
        setErrorMessage(errorMsg);
      } else if (error.response?.status === 400) {
        // 400 Bad Request - validation errors
        const errorData = error.response?.data;
        let errorMsg = "Validation error: ";
        
        if (errorData?.errors) {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMsg += fieldErrors;
        } else if (errorData?.detail) {
          errorMsg += typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData?.message) {
          errorMsg += typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
        } else {
          errorMsg += JSON.stringify(errorData);
        }
        
        setErrorMessage(errorMsg);
      } else {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.response?.data?.detail ||
                        error.response?.data?.errors ||
                        error.response?.data ||
                        "Profile update failed. Please try again.";
        setErrorMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
      setTimeout(() => setErrorMessage(""), 10000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    const status = userInfo.verification_status;
    if (!status || status === null) {
      return null;
    }
    
    if (status === 'pending') {
      return {
        type: 'info',
        message: 'Your verification request is pending admin approval. Please wait for the admin to review your submission.',
      };
    }
    if (status === 'approved') {
      return {
        type: 'success',
        message: 'Your account has been verified and approved! You can now access all features.',
      };
    }
    if (status === 'rejected') {
      return {
        type: 'error',
        message: 'Your verification was rejected. Please update your information and resubmit.',
      };
    }
    return null;
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-lilita text-[#015575] text-center mb-8">
          Update Profile
        </h1>

        {/* Status Messages */}
        {statusInfo && (
          <div className={`p-4 mb-6 rounded-xl ${
            statusInfo.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
            statusInfo.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
            'bg-blue-100 text-blue-700 border border-blue-300'
          }`}>
            <p className="font-josefin">{statusInfo.message}</p>
          </div>
        )}

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

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Profile Photo Section */}
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
              <p className="text-sm text-gray-500 text-center">
                Upload your profile photo (Max 5MB, JPG/PNG)
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">
              Personal Information
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your ID number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate
                </label>
                <input
                  type="text"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter hourly rate"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Years of experience"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">
              Professional Information
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TSC Number
                </label>
                <input
                  type="text"
                  name="tsc_number"
                  value={formData.tsc_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your TSC number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSubjects.map((subject) => (
                <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject.id)}
                    onChange={(e) => handleMultiSelect("subjects", subject.id, e.target.checked)}
                    className="h-5 w-5 text-[#015575] focus:ring-[#015575]"
                    disabled={loading}
                  />
                  <span className="text-gray-700">{subject.subject || subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Grades */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Grades</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableGrades.map((grade) => (
                <label key={grade.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.grade.includes(grade.id)}
                    onChange={(e) => handleMultiSelect("grade", grade.id, e.target.checked)}
                    className="h-5 w-5 text-[#015575] focus:ring-[#015575]"
                    disabled={loading}
                  />
                  <span className="text-gray-700">{grade.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Certificates</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Certificate</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleCertificateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TSC Certificate</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleTscCertificateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Bio</h3>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent h-32"
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
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

export default MyAccount;
