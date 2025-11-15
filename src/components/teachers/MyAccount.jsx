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
    hourlyRate: "",
    experience: "",
    birthDate: "",
    academicCertificate: null,
    tscCertificate: null,
    subjects: [],
    grades: [],
  });

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (UserInfo) {
      setUserInfo(UserInfo);
      // Pre-fill form with existing user data if available
      setFormData({
        fullName: UserInfo.full_name || "",
        email: UserInfo.email || "",
        phone: UserInfo.phone || "",
        idNumber: UserInfo.id_number || "",
        tscNumber: UserInfo.tsc_number || "",
        institution: UserInfo.school || UserInfo.institution || "",
        subject: UserInfo.subject || "",
        grade: UserInfo.grade || "",
        gender: UserInfo.gender || "",
        aboutMe: UserInfo.bio || UserInfo.about_me || "",
        hourlyRate: UserInfo.hourly_rate || "",
        experience: UserInfo.experience || "",
        birthDate: UserInfo.birth_date || "",
        academicCertificate: null,
        tscCertificate: null,
        subjects: UserInfo.subjects || [],
        grades: UserInfo.grades || [],
      });
      
      // Set profile photo preview if available
      if (UserInfo.profile_picture) {
        setProfilePhotoPreview(UserInfo.profile_picture);
      }
    }
  }, []);

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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleMultiSelect = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(id => id !== value)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!formData.fullName || !formData.email) {
      setErrorMessage("Full Name and Email are required fields.");
      setLoading(false);
      return;
    }

    if (!profilePhoto && !profilePhotoPreview) {
      setErrorMessage("Please upload a profile photo.");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append("full_name", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone || "");
      formDataToSend.append("id_number", formData.idNumber || "");
      formDataToSend.append("tsc_number", formData.tscNumber || "");
      formDataToSend.append("school", formData.institution || "");
      formDataToSend.append("gender", formData.gender || "");
      formDataToSend.append("bio", formData.aboutMe || "");
      formDataToSend.append("hourly_rate", formData.hourlyRate || "");
      formDataToSend.append("experience", formData.experience || "");
      formDataToSend.append("birth_date", formData.birthDate || "");

      // Add subjects and grades as arrays
      formData.subjects.forEach(subjectId => {
        formDataToSend.append("subjects", subjectId);
      });
      formData.grades.forEach(gradeId => {
        formDataToSend.append("grade", gradeId);
      });
      
      // Add profile photo if selected
      if (profilePhoto) {
        formDataToSend.append("profile_picture", profilePhoto);
      }

      // Add certificates if selected
      if (formData.academicCertificate) {
        formDataToSend.append("academic_certificate", formData.academicCertificate);
      }
      if (formData.tscCertificate) {
        formDataToSend.append("tsc_number_certificate", formData.tscCertificate);
      }

      const response = await axios.post(
        `${FHOST}/api/teachers/${userInfo?.id}/verify_teacher`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Verification submitted successfully! Your request is pending admin approval.");
        
        // Update userInfo in localStorage
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        currentUserInfo.verification_status = 'pending';
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        setUserInfo(currentUserInfo);
        
        // Notify other components to refresh
        window.dispatchEvent(new Event('verification-status-changed'));
        
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "Verification submission failed. Please try again.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
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
          Account Verification
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

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Profile Photo Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-[#015575] mb-4">
              Profile Photo <span className="text-red-500">*</span>
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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
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
                  name="idNumber"
                  value={formData.idNumber}
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
                  name="birthDate"
                  value={formData.birthDate}
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
                  name="hourlyRate"
                  value={formData.hourlyRate}
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
                  name="tscNumber"
                  value={formData.tscNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your TSC number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your institution"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter your subject"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter grade level"
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

          {/* Subjects and Grades */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Subjects & Grades</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects.join(', ')}
                  onChange={(e) => setFormData({...formData, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter subjects separated by commas"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grades</label>
                <input
                  type="text"
                  name="grades"
                  value={formData.grades.join(', ')}
                  onChange={(e) => setFormData({...formData, grades: e.target.value.split(',').map(g => g.trim()).filter(g => g)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter grades separated by commas"
                  disabled={loading}
                />
              </div>
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
                  name="academicCertificate"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TSC Certificate</label>
                <input
                  type="file"
                  name="tscCertificate"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">About Me</h3>
            <textarea
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent h-32"
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || userInfo.verification_status === 'approved'}
            className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : userInfo.verification_status === 'rejected' ? (
              'Resubmit Verification Request'
            ) : (
              'Submit Verification Request'
            )}
          </button>

          <p className="mt-4 text-sm text-gray-500 text-center font-josefin">
            Your verification request will be sent to the admin team for approval. You'll be notified once your account is verified.
          </p>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
