import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST, refreshAccessToken } from "../constants/Functions";
// Import the smart phone input
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const MyAccount = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  // Consolidate form data
  const [formData, setFormData] = useState({
    phone: "",
    national_identity_number: "",
    teacher_license_number: "",
    gender: "",
    bio: "",
    hourly_rate: "",
    experience: "",
    birth_date: "",
    national_identity_card: null, // Mapped to: Identity Verification
    cv: null, // Mapped to: Professional Documents
    subjectInput: "",
    gradeInput: "",
    grade_id: "",
  });

  // --- Utility functions (Unchanged) ---
  const getSubjectNameById = (id) => {
    if (!id) return "";
    const subject = availableSubjects.find((s) => s.id === id || s.name === id);
    return subject?.name || subject?.subject || id;
  };

  const getGradeNameById = (id) => {
    if (!id) return "";
    const grade = availableGrades.find(
      (g) => g.id === id || g.level === id || g.name === id,
    );
    return grade?.level || grade?.name || id;
  };

  const resolveSubjectNames = (subjects) => {
    if (!subjects || !Array.isArray(subjects)) return [];
    return subjects.map((s) => {
      if (typeof s === "object") return s.name || s.subject || s.id;
      return getSubjectNameById(s);
    });
  };

  const resolveGradeNames = (grades) => {
    if (!grades || !Array.isArray(grades)) return [];
    return grades.map((g) => {
      if (typeof g === "object") return g.level || g.name || g.id;
      return getGradeNameById(g);
    });
  };

  const createSubject = async (name, token) => {
    try {
      const response = await axios.post(
        `${FHOST}/api/subjects/`,
        {
          name: name.trim(),
          description: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data.id;
    } catch (error) {
      try {
        let allSubjects = [];
        let nextUrl = `${FHOST}/api/subjects/?page_size=100`;
        while (nextUrl) {
          const getResponse = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (getResponse.data && getResponse.data.results) {
            allSubjects = allSubjects.concat(getResponse.data.results);
          }
          nextUrl = getResponse.data.next;
        }
        const existing = allSubjects.find(
          (s) => s.name.toLowerCase() === name.trim().toLowerCase(),
        );
        if (existing) return existing.id;
      } catch (getError) {
        console.error("Error finding existing subject:", getError);
      }
      return null;
    }
  };

  const findGradeByName = async (level) => {
    try {
      const token = await refreshAccessToken();
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/?page=1&page_size=100`;
      while (nextUrl) {
        const getResponse = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (getResponse.data && getResponse.data.results) {
          allGrades = allGrades.concat(getResponse.data.results);
        }
        nextUrl = getResponse.data.next;
      }
      const existing = allGrades.find(
        (g) => g.level.toLowerCase() === level.trim().toLowerCase(),
      );
      return existing?.id || null;
    } catch (getError) {
      return null;
    }
  };

  useEffect(() => {
    const UserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (UserInfo) {
      setUserInfo(UserInfo);
      const initializeData = async () => {
        await Promise.all([fetchSubjects(), fetchGrades()]);
        fetchProfile();
      };
      initializeData();
    }
  }, []);

  useEffect(() => {
    if (availableSubjects.length > 0 || availableGrades.length > 0) {
      const currentUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (currentUserInfo) {
        const rawSubjects = currentUserInfo.subjects || [];
        const rawGrades = currentUserInfo.grade || currentUserInfo.grades || [];
        const resolvedSubjects = resolveSubjectNames(rawSubjects);
        const resolvedGrades = resolveGradeNames(rawGrades);

        let gradeValue = "";
        let gradeIdValue = "";
        if (resolvedGrades[0]) {
          const matchingGrade = availableGrades.find((g) => {
            const gradeName = g.level || g.name || g.id;
            return (
              gradeName === resolvedGrades[0] ||
              g.id === resolvedGrades[0] ||
              String(g.id) === String(resolvedGrades[0])
            );
          });
          if (matchingGrade) {
            gradeValue =
              matchingGrade.level || matchingGrade.name || matchingGrade.id;
            gradeIdValue = matchingGrade.id;
          } else {
            gradeValue = resolvedGrades[0];
          }
        }

        setFormData((prev) => ({
          ...prev,
          subjectInput: resolvedSubjects[0] || prev.subjectInput,
          gradeInput: gradeValue || prev.gradeInput,
          grade_id: gradeIdValue || prev.grade_id,
        }));
      }
    }
  }, [availableSubjects, availableGrades]);

  const fetchProfile = async (gradesList = null) => {
    const token = await refreshAccessToken();
    try {
      const currentUserInfo =
        JSON.parse(localStorage.getItem("userInfo")) || {};
      const profileId = currentUserInfo.teacher_profile_id;

      let response;
      if (profileId) {
        response = await axios.get(`${FHOST}/api/teachers/${profileId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.data) {
        const rawSubjects = response.data.subjects || [];
        const rawGrades = response.data.grade || [];
        const resolvedSubjects = resolveSubjectNames(rawSubjects);
        const resolvedGrades = resolveGradeNames(rawGrades);
        const gradesToUse = gradesList || availableGrades;

        let gradeValue = "";
        let gradeIdValue = "";
        if (resolvedGrades[0] && gradesToUse.length > 0) {
          const matchingGrade = gradesToUse.find((g) => {
            const gradeName = g.level || g.name || g.id;
            return (
              gradeName === resolvedGrades[0] ||
              g.id === resolvedGrades[0] ||
              String(g.id) === String(resolvedGrades[0])
            );
          });
          if (matchingGrade) {
            gradeValue =
              matchingGrade.level || matchingGrade.name || matchingGrade.id;
            gradeIdValue = matchingGrade.id;
          } else {
            gradeValue = resolvedGrades[0];
          }
        } else if (resolvedGrades[0]) {
          gradeValue = resolvedGrades[0];
        }

        setFormData({
          phone: response.data.phone || "",
          national_identity_number:
            response.data.national_identity_number ||
            response.data.id_number ||
            "",
          teacher_license_number:
            response.data.teacher_license_number ||
            response.data.tsc_number ||
            "",
          gender: response.data.gender || "",
          bio: response.data.bio || "",
          hourly_rate: response.data.hourly_rate || "",
          experience: response.data.experience || "",
          birth_date: response.data.birth_date || "",
          national_identity_card: null,
          cv: null,
          subjectInput: resolvedSubjects[0] || "",
          gradeInput: gradeValue,
          grade_id: gradeIdValue,
        });

        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }

        const derivedStatus =
          response.data.verification_status ||
          (response.data.is_verified
            ? "approved"
            : response.data.is_rejected
              ? "rejected"
              : "pending");

        setUserInfo((prev) => {
          const merged = {
            ...(prev || {}),
            ...response.data,
            verification_status: derivedStatus,
            teacher_profile_id: response.data.id || prev?.teacher_profile_id,
          };
          localStorage.setItem("userInfo", JSON.stringify(merged));
          return merged;
        });

        window.dispatchEvent(new Event("verification-status-changed"));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = await refreshAccessToken();
      let allSubjects = [];
      let nextUrl = `${FHOST}/api/subjects/?page_size=100`;
      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const token = await refreshAccessToken();
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/?page=1&page_size=100`;
      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.results) {
          allGrades = allGrades.concat(response.data.results);
        }
        nextUrl = response.data.next;
      }
      if (allGrades.length === 0) {
        allGrades = [
          { id: "824bf1f9-e196-4087-aa8d-954f406b8aba", level: "Grade 1" },
          { id: "fc6d6e0f-5b53-4d13-b1c8-004f70093eb4", level: "Grade 2" },
          { id: "70768a4a-5ee4-44fb-b9ac-bfd82ed1ff38", level: "University" },
        ];
      }
      setAvailableGrades(allGrades);
    } catch (error) {
      setAvailableGrades([
        { id: "824bf1f9-e196-4087-aa8d-954f406b8aba", level: "Grade 1" },
        { id: "fc6d6e0f-5b53-4d13-b1c8-004f70093eb4", level: "Grade 2" },
        { id: "70768a4a-5ee4-44fb-b9ac-bfd82ed1ff38", level: "University" },
      ]);
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
    setFormData((prev) => ({ ...prev, subjectInput: value }));
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    const selectedGrade = availableGrades.find(
      (g) => g.id === value || (g.level || g.name || g.id) === value,
    );
    setFormData((prev) => ({
      ...prev,
      gradeInput: selectedGrade?.level || value,
      grade_id: value,
    }));
  };

  // Only two consolidated document handlers remain
  const handleIdentityVerificationChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, national_identity_card: file });
    }
  };

  const handleProfessionalDocumentsChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, cv: file });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await refreshAccessToken();

      if (!token || typeof token !== "string") {
        setErrorMessage("Session expired. Please log in again.");
        return;
      }

      if (!formData.subjectInput.trim() || !formData.gradeInput.trim()) {
        setErrorMessage("Please specify both subject and grade.");
        setTimeout(() => setErrorMessage(""), 5000);
        setLoading(false);
        return;
      }

      let subjectId = await createSubject(formData.subjectInput.trim(), token);
      let gradeId = formData.grade_id;

      if (!gradeId && formData.gradeInput.trim()) {
        const selectedGrade = availableGrades.find(
          (g) => (g.level || g.name || g.id) === formData.gradeInput.trim(),
        );
        if (selectedGrade) gradeId = selectedGrade.id;
      }

      const formDataToSend = new FormData();

      if (formData.bio?.trim())
        formDataToSend.append("bio", formData.bio.trim());

      // Clean phone number (from React-Phone-Number-Input it's already +254...)
      if (formData.phone?.trim())
        formDataToSend.append("phone", formData.phone.trim());

      // Ensure numeric hourly rate
      if (formData.hourly_rate?.toString().trim()) {
        formDataToSend.append(
          "hourly_rate",
          formData.hourly_rate.toString().trim(),
        );
      }

      if (formData.experience?.toString().trim())
        formDataToSend.append(
          "experience",
          formData.experience.toString().trim(),
        );
      if (formData.birth_date?.trim())
        formDataToSend.append("birth_date", formData.birth_date.trim());
      if (formData.teacher_license_number?.trim())
        formDataToSend.append(
          "teacher_license_number",
          formData.teacher_license_number.trim(),
        );
      if (formData.national_identity_number?.trim())
        formDataToSend.append(
          "national_identity_number",
          formData.national_identity_number.trim(),
        );
      if (formData.gender?.trim())
        formDataToSend.append("gender", formData.gender.trim());

      if (subjectId) formDataToSend.append("subjects", subjectId);
      if (gradeId) formDataToSend.append("grade", gradeId);

      if (profilePhoto && profilePhoto instanceof File)
        formDataToSend.append("profile_picture", profilePhoto);

      // Append the consolidated documents
      if (
        formData.national_identity_card &&
        formData.national_identity_card instanceof File
      ) {
        formDataToSend.append(
          "national_identity_card",
          formData.national_identity_card,
        );
      }
      if (formData.cv && formData.cv instanceof File) {
        formDataToSend.append("cv", formData.cv);
      }

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
          },
        );
      } catch (initialError) {
        throw initialError;
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Profile updated successfully!");
        fetchProfile();
        setTimeout(() => setSuccessMessage(""), 10000);
      }
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Profile update failed. Check the fields and try again.",
      );
      setTimeout(() => setErrorMessage(""), 10000);
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = (() => {
    const status = userInfo.verification_status;
    if (!status) return null;
    if (status === "pending")
      return { type: "info", message: "Verification pending approval." };
    if (status === "approved")
      return { type: "success", message: "Account verified!" };
    if (status === "rejected")
      return {
        type: "error",
        message: "Verification rejected. Please update your info.",
      };
    return null;
  })();

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-lilita text-[#015575] text-center mb-8">
          Update Profile
        </h1>

        {statusInfo && (
          <div
            className={`p-4 mb-6 rounded-xl ${
              statusInfo.type === "success"
                ? "bg-green-100 text-green-700 border-green-300"
                : statusInfo.type === "error"
                  ? "bg-red-100 text-red-700 border-red-300"
                  : "bg-blue-100 text-blue-700 border-blue-300"
            }`}>
            <p className="font-josefin">{statusInfo.message}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-[#015575] mb-4">
              Profile Photo (Required)
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  international
                  defaultCountry="KE"
                  value={formData.phone}
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#015575] focus-within:border-transparent bg-white [&_input]:outline-none [&_input]:border-none [&_input]:bg-transparent [&_input]:w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (KES)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  min="1"
                  step="any"
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                  placeholder="e.g., 500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National Identity Number
                </label>
                <input
                  type="text"
                  name="national_identity_number"
                  value={formData.national_identity_number}
                  onChange={handleInputChange}
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
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
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
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
                  className="w-full px-4 outline-none py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
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
                  Teacher License Number
                </label>
                <input
                  type="text"
                  name="teacher_license_number"
                  value={formData.teacher_license_number}
                  onChange={handleInputChange}
                  className="w-full px-4 outline-none py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
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
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
                  disabled={loading}>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subjectInput}
                  onChange={handleSubjectChange}
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
                  placeholder="e.g. Mathematics"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade_id || formData.gradeInput}
                  onChange={handleGradeChange}
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
                  disabled={loading}>
                  <option value="">Select a grade</option>
                  {availableGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Consolidated Documents */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">
              Documents & Verification
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Verification (National ID / Passport)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleIdentityVerificationChange}
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Documents (Academic Cert / License / CV)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleProfessionalDocumentsChange}
                  className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
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
              className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] h-32"
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
          </div>

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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#015575] text-white py-3 rounded-xl hover:bg-[#01415e] transition text-lg font-semibold disabled:opacity-50">
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
