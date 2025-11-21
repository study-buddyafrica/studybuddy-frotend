import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";

const TeacherProfileUpdate = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "number") return item.toString();
          if (item && typeof item === "object") {
            return (
              item.name ||
              item.subject ||
              item.title ||
              item.label ||
              item.value ||
              item.id ||
              ""
            ).toString();
          }
          return "";
        })
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === "number") {
      return [value.toString()];
    }
    return [];
  };

  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    hourly_rate: "",
    subjects: [],
    grade: [],
    experience: "",
    birth_date: "",
    academic_certificate: null,
    tsc_number: "",
    tsc_number_certificate: null,
    id_number: "",
    gender: "",
  });
  const [subjectInput, setSubjectInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (UserInfo) {
      setUserInfo(UserInfo);
      fetchProfile();
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
        setProfileData(response.data);
        setFormData({
          bio: response.data.bio || "",
          phone: response.data.phone || "",
          hourly_rate: response.data.hourly_rate || "",
          subjects: normalizeList(response.data.subjects),
          grade: normalizeList(response.data.grade),
          experience: response.data.experience || "",
          birth_date: response.data.birth_date || "",
          academic_certificate: null,
          tsc_number: response.data.tsc_number || "",
          tsc_number_certificate: null,
          id_number: response.data.id_number || "",
          gender: response.data.gender || "",
        });
        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }
        setSubjectInput(normalizeList(response.data.subjects).join(", "));
        setGradeInput(normalizeList(response.data.grade).join(", "));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  const parseListInput = (value) =>
    value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubjectInputChange = (value) => {
    setSubjectInput(value);
    setFormData((prev) => ({
      ...prev,
      subjects: parseListInput(value),
    }));
  };

  const handleGradeInputChange = (value) => {
    setGradeInput(value);
    setFormData((prev) => ({
      ...prev,
      grade: parseListInput(value),
    }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();
      
      if (formData.bio) formDataToSend.append("bio", formData.bio);
      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (formData.hourly_rate) formDataToSend.append("hourly_rate", formData.hourly_rate);
      if (formData.experience) formDataToSend.append("experience", formData.experience);
      if (formData.birth_date) formDataToSend.append("birth_date", formData.birth_date);
      if (formData.tsc_number) formDataToSend.append("tsc_number", formData.tsc_number);
      if (formData.id_number) formDataToSend.append("id_number", formData.id_number);
      if (formData.gender) formDataToSend.append("gender", formData.gender);
      
      formData.subjects.forEach(subjectValue => {
        formDataToSend.append("subjects", subjectValue);
      });
      
      formData.grade.forEach(gradeValue => {
        formDataToSend.append("grade", gradeValue);
      });
      
      if (profilePhoto) {
        formDataToSend.append("profile_picture", profilePhoto);
      }
      
      if (formData.academic_certificate) {
        formDataToSend.append("academic_certificate", formData.academic_certificate);
      }

      if (formData.tsc_number_certificate) {
        formDataToSend.append("tsc_number_certificate", formData.tsc_number_certificate);
      }

      const response = await axios.patch(
        `${FHOST}/api/teacher/profile/update/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Profile updated successfully!");
        
        // Update userInfo in localStorage
        const updatedProfile = response.data;
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        const updatedUserInfo = { ...currentUserInfo, ...updatedProfile };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        
        // Notify other components
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

          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Basic Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TSC Number</label>
                <input
                  type="text"
                  name="tsc_number"
                  value={formData.tsc_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter TSC number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter ID number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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
            <p className="text-sm text-gray-600 mb-3">
              Enter the subject IDs or names separated by commas or new lines.
            </p>
            <textarea
              value={subjectInput}
              onChange={(e) => handleSubjectInputChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent min-h-[100px]"
              placeholder="e.g. Mathematics, English, Biology"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              The backend will store these values exactly as entered.
            </p>
          </div>

          {/* Grades */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Grades</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter the grade IDs or labels separated by commas or new lines.
            </p>
            <textarea
              value={gradeInput}
              onChange={(e) => handleGradeInputChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent min-h-[100px]"
              placeholder="e.g. Grade 6, Grade 7, Grade 8"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              These values are sent to the server as arrays, matching the required payload.
            </p>
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

          {/* Academic Certificate */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Academic Certificate</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleCertificateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* TSC Certificate */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">TSC Certificate</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleTscCertificateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
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

export default TeacherProfileUpdate;

