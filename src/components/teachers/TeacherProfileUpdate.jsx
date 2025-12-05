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
  const [subjectInput, setSubjectInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
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

  const parseListInput = (value) =>
    value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  // Helper function to get name from ID using available lists
  const getSubjectNameById = (id) => {
    if (!id) return "";
    const subject = availableSubjects.find(s => s.id === id || s.name === id);
    return subject?.name || subject?.subject || id;
  };

  const getGradeNameById = (id) => {
    if (!id) return "";
    const grade = availableGrades.find(g => g.id === id || g.level === id || g.name === id);
    return grade?.level || grade?.name || id;
  };

  // Helper to resolve IDs to names for display
  const resolveSubjectNames = (subjects) => {
    if (!subjects || !Array.isArray(subjects)) return [];
    return subjects.map(s => {
      if (typeof s === 'object') return s.name || s.subject || s.id;
      return getSubjectNameById(s);
    });
  };

  const resolveGradeNames = (grades) => {
    if (!grades || !Array.isArray(grades)) return [];
    return grades.map(g => {
      if (typeof g === 'object') return g.level || g.name || g.id;
      return getGradeNameById(g);
    });
  };

  const createSubject = async (name) => {
    try {
      const response = await axios.post(`${FHOST}/api/subjects/`, {
        name: name.trim(),
        description: ""
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.id;
    } catch (error) {
      console.error("Error creating subject:", error);
      // If creation fails (maybe already exists), try to find existing
      try {
        let allSubjects = [];
        let nextUrl = `${FHOST}/api/subjects/`;

        while (nextUrl) {
          const getResponse = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (getResponse.data && getResponse.data.results) {
            allSubjects = allSubjects.concat(getResponse.data.results);
          }
          nextUrl = getResponse.data.next;
        }

        const existing = allSubjects.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
        if (existing) return existing.id;
      } catch (getError) {
        console.error("Error finding existing subject:", getError);
      }
      return null;
    }
  };

  const createGrade = async (level) => {
    try {
      const response = await axios.post(`${FHOST}/api/grades/`, {
        level: level.trim()
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.id;
    } catch (error) {
      console.error("Error creating grade:", error);
      // If creation fails (maybe already exists), try to find existing
      try {
        let allGrades = [];
        let nextUrl = `${FHOST}/api/grades/`;

        while (nextUrl) {
          const getResponse = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (getResponse.data && getResponse.data.results) {
            allGrades = allGrades.concat(getResponse.data.results);
          }
          nextUrl = getResponse.data.next;
        }

        const existing = allGrades.find(g => g.level.toLowerCase() === level.trim().toLowerCase());
        if (existing) return existing.id;
      } catch (getError) {
        console.error("Error finding existing grade:", getError);
      }
      return null;
    }
  };

  const fetchSubjects = async () => {
    try {
      let allSubjects = [];
      let nextUrl = `${FHOST}/api/subjects/`;

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data && response.data.results) {
          allSubjects = allSubjects.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }

      setAvailableSubjects(allSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/`;

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data && response.data.results) {
          allGrades = allGrades.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }

      setAvailableGrades(allGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    hourly_rate: "",
    subject: "",
    grade: "",
    experience: "",
    birth_date: "",
    academic_certificate: null,
    teacher_license_number: "",
    teacher_license_certificate: null,
    national_identity_number: "",
    gender: "",
    cv: null,
  });

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (UserInfo) {
      setUserInfo(UserInfo);
      // Fetch subjects and grades first, then fetch profile
      const initializeData = async () => {
        await Promise.all([fetchSubjects(), fetchGrades()]);
        // Now fetch profile after subjects and grades are loaded
        fetchProfile();
      };
      initializeData();
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
        // Get raw subjects and grades (could be IDs or objects)
        const rawSubjects = response.data.subjects || [];
        const rawGrades = response.data.grade || [];

        // Resolve to names for display
        const resolvedSubjects = resolveSubjectNames(rawSubjects);
        const resolvedGrades = resolveGradeNames(rawGrades);

        setFormData({
          bio: response.data.bio || "",
          phone: response.data.phone || "",
          hourly_rate: response.data.hourly_rate || "",
          subject: resolvedSubjects[0] || "",
          grade: resolvedGrades[0] || "",
          experience: response.data.experience || "",
          birth_date: response.data.birth_date || "",
          academic_certificate: null,
          teacher_license_number: response.data.teacher_license_number || response.data.tsc_number || "",
          teacher_license_certificate: null,
          national_identity_number: response.data.national_identity_number || response.data.id_number || "",
          gender: response.data.gender || "",
          cv: null,
        });
        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }
        // Set subject and grade inputs based on resolved names
        setSubjectInput(resolvedSubjects[0] || "");
        setGradeInput(resolvedGrades[0] || "");
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

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubjectInput(value);
    setFormData((prev) => ({
      ...prev,
      subject: value,
    }));
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setGradeInput(value);
    setFormData((prev) => ({
      ...prev,
      grade: value,
    }));
  };

  const handleCvChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, cv: file });
    }
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
      setFormData({ ...formData, teacher_license_certificate: file });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validate that subject and grade are provided
      if (!formData.subject.trim()) {
        setErrorMessage("Please specify a subject.");
        setTimeout(() => setErrorMessage(""), 5000);
        setLoading(false);
        return;
      }

      if (!formData.grade.trim()) {
        setErrorMessage("Please specify a grade.");
        setTimeout(() => setErrorMessage(""), 5000);
        setLoading(false);
        return;
      }

      // Create subject and get ID
      let subjectId = null;
      if (formData.subject.trim()) {
        subjectId = await createSubject(formData.subject.trim());
        if (!subjectId) {
          setErrorMessage("Failed to create or find the specified subject.");
          setTimeout(() => setErrorMessage(""), 5000);
          setLoading(false);
          return;
        }
      }

      // Create grade and get ID
      let gradeId = null;
      if (formData.grade.trim()) {
        gradeId = await createGrade(formData.grade.trim());
        if (!gradeId) {
          setErrorMessage("Failed to create or find the specified grade.");
          setTimeout(() => setErrorMessage(""), 5000);
          setLoading(false);
          return;
        }
      }

      const formDataToSend = new FormData();

      if (formData.bio) formDataToSend.append("bio", formData.bio);
      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (formData.hourly_rate) formDataToSend.append("hourly_rate", formData.hourly_rate);
      if (formData.experience) formDataToSend.append("experience", formData.experience);
      if (formData.birth_date) formDataToSend.append("birth_date", formData.birth_date);
      if (formData.teacher_license_number) formDataToSend.append("teacher_license_number", formData.teacher_license_number);
      if (formData.national_identity_number) formDataToSend.append("national_identity_number", formData.national_identity_number);
      if (formData.gender) formDataToSend.append("gender", formData.gender);

      // Send subject and grade IDs
      if (subjectId) {
        formDataToSend.append("subjects", subjectId);
      }

      if (gradeId) {
        formDataToSend.append("grade", gradeId);
      }
      
      if (profilePhoto) {
        formDataToSend.append("profile_picture", profilePhoto);
      }
      
      if (formData.academic_certificate) {
        formDataToSend.append("academic_certificate", formData.academic_certificate);
      }

      if (formData.teacher_license_certificate) {
        formDataToSend.append("teacher_license_certificate", formData.teacher_license_certificate);
      }

      if (formData.cv) {
        formDataToSend.append("cv", formData.cv);
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
        const updatedUserInfo = {
          ...currentUserInfo,
          ...updatedProfile,
          subject: formData.subject,
          grade: formData.grade
        };
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher License Number</label>
                <input
                  type="text"
                  name="teacher_license_number"
                  value={formData.teacher_license_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter teacher license number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National Identity Number</label>
                <input
                  type="text"
                  name="national_identity_number"
                  value={formData.national_identity_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="Enter national identity number"
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
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Subject</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter the subject you teach.
            </p>
            <input
              type="text"
              value={subjectInput}
              onChange={handleSubjectChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              placeholder="e.g. Mathematics"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              The system will create the subject if it doesn't exist.
            </p>
          </div>

          {/* Grades */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Grade</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter the grade you teach.
            </p>
            <input
              type="text"
              value={gradeInput}
              onChange={handleGradeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              placeholder="e.g. Grade 6"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              The system will create the grade if it doesn't exist.
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

          {/* Teacher License Certificate */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Teacher License Certificate</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleTscCertificateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* CV Upload */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">CV/Resume</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload your CV or resume document.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCvChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
            </p>
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

