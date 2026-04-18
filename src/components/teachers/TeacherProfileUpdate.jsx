import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const TeacherProfileUpdate = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  // Data structure mapped to your exact requirements
  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    hourly_rate: "",
    subject: "",
    grade: "",
    grade_id: "",
    experience: "",
    birth_date: "",
    teacher_license_number: "",
    national_identity_number: "",
    gender: "",
    national_identity_card: null,   // Holds the ID/Passport file
    professional_documents: null,   // Holds the combined Cert/License/CV file
  });

  const getSubjectNameById = (id) => {
    if (!id) return "";
    const subject = availableSubjects.find((s) => s.id === id || s.name === id);
    return subject?.name || subject?.subject || id;
  };

  const getGradeNameById = (id) => {
    if (!id) return "";
    const grade = availableGrades.find((g) => g.id === id);
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

  const createSubject = async (name) => {
    try {
      const response = await axios.post(
        `${FHOST}/api/subjects/`,
        { name: name.trim(), description: "" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.id;
    } catch (error) {
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
        const existing = allSubjects.find(
          (s) => s.name.toLowerCase() === name.trim().toLowerCase()
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
      let allGrades = [];
      let nextUrl = `${FHOST}/api/grades/?page=1&page_size=100`;
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
      const existing = allGrades.find(
        (g) => g.level.toLowerCase() === level.trim().toLowerCase()
      );
      return existing?.id || null;
    } catch (getError) {
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
      const token = localStorage.getItem("access_token");
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
          { id: "39f8db4e-b3b3-4558-be5a-ec986a907591", level: "Grade 3" },
          { id: "7f7eeeb1-3c84-47d8-85cf-e426c3cb2113", level: "Grade 4" },
          { id: "9a1f03be-82f2-4813-9158-952cb323a03f", level: "Grade 5" },
          { id: "7746e508-28f7-4040-9a2c-9abd087564e4", level: "Grade 6" },
          { id: "136479a9-a34e-458b-92c0-094f0faf0163", level: "Grade 7" },
          { id: "c0c81820-3b85-43b2-a86f-7193e33a5ce7", level: "Grade 8" },
          { id: "6e651414-242a-46fa-91b7-5a377a62f18a", level: "Grade 9" },
          { id: "8642c0cc-4055-4b93-bb26-40771925b1b2", level: "Grade 10" },
          { id: "600a3a4a-60e7-40c6-ba8a-39ce19c9b49b", level: "Grade 11" },
          { id: "0a9a87bc-2d6e-4e30-9f80-568cccfede16", level: "Grade 12" },
          { id: "fadbbecc-8cd1-44e9-90c2-c577fa6ad7eb", level: "College" },
          { id: "a2cac0a4-cf17-4211-97c3-df5dad51a947", level: "General" },
          { id: "d94b8c0d-1236-4481-8782-279418b7f376", level: "Professional" },
          { id: "70768a4a-5ee4-44fb-b9ac-bfd82ed1ff38", level: "University" },
        ];
      }
      setAvailableGrades(allGrades);
    } catch (error) {
      setAvailableGrades([
        { id: "824bf1f9-e196-4087-aa8d-954f406b8aba", level: "Grade 1" },
        { id: "fc6d6e0f-5b53-4d13-b1c8-004f70093eb4", level: "Grade 2" },
        { id: "39f8db4e-b3b3-4558-be5a-ec986a907591", level: "Grade 3" },
        { id: "7f7eeeb1-3c84-47d8-85cf-e426c3cb2113", level: "Grade 4" },
        { id: "9a1f03be-82f2-4813-9158-952cb323a03f", level: "Grade 5" },
        { id: "7746e508-28f7-4040-9a2c-9abd087564e4", level: "Grade 6" },
        { id: "136479a9-a34e-458b-92c0-094f0faf0163", level: "Grade 7" },
        { id: "c0c81820-3b85-43b2-a86f-7193e33a5ce7", level: "Grade 8" },
        { id: "6e651414-242a-46fa-91b7-5a377a62f18a", level: "Grade 9" },
        { id: "8642c0cc-4055-4b93-bb26-40771925b1b2", level: "Grade 10" },
        { id: "600a3a4a-60e7-40c6-ba8a-39ce19c9b49b", level: "Grade 11" },
        { id: "0a9a87bc-2d6e-4e30-9f80-568cccfede16", level: "Grade 12" },
        { id: "fadbbecc-8cd1-44e9-90c2-c577fa6ad7eb", level: "College" },
        { id: "a2cac0a4-cf17-4211-97c3-df5dad51a947", level: "General" },
        { id: "d94b8c0d-1236-4481-8782-279418b7f376", level: "Professional" },
        { id: "70768a4a-5ee4-44fb-b9ac-bfd82ed1ff38", level: "University" },
      ]);
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

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data) {
        const rawSubjects = response.data.subjects || [];
        const rawGrades = response.data.grade || [];

        const resolvedSubjects = resolveSubjectNames(rawSubjects);
        const resolvedGrades = resolveGradeNames(rawGrades);

        const gradeId =
          typeof rawGrades[0] === "object" ? rawGrades[0].id : rawGrades[0];
        const gradeName = resolvedGrades[0] || "";

        setFormData((prev) => ({
          ...prev,
          bio: response.data.bio || "",
          phone: response.data.phone || "",
          hourly_rate: response.data.hourly_rate || "",
          subject: resolvedSubjects[0] || "",
          grade: gradeName,
          grade_id: gradeId || "",
          experience: response.data.experience || "",
          birth_date: response.data.birth_date || "",
          teacher_license_number:
            response.data.teacher_license_number ||
            response.data.tsc_number ||
            "",
          national_identity_number:
            response.data.national_identity_number ||
            response.data.id_number ||
            "",
          gender: response.data.gender || "",
        }));

        if (response.data.profile_picture) {
          setProfilePhotoPreview(response.data.profile_picture);
        }
        setSubjectInput(resolvedSubjects[0] || "");
        setGradeInput(gradeName);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const isImage = file.type?.startsWith("image/");
    if (!isImage) return displayError("Please select a valid image file.");
    if (file.size > 5 * 1024 * 1024) return displayError("Image max size is 5MB.");
    
    setProfilePhotoPreview(URL.createObjectURL(file));
    setProfilePhoto(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
    setFormData({ ...formData, subject: e.target.value });
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    const selectedGrade = availableGrades.find(
      (g) => g.id === value || g.level === value
    );
    setGradeInput(value);
    setFormData({
      ...formData,
      grade: selectedGrade?.level || value,
      grade_id: value,
    });
  };

  // --- Consolidated File Handlers ---
  const handleIdentityDocChange = (event) => {
    const file = event.target.files[0];
    if (file) setFormData({ ...formData, national_identity_card: file });
  };

  const handleProfessionalDocsChange = (event) => {
    const file = event.target.files[0];
    if (file) setFormData({ ...formData, professional_documents: file });
  };

  const displayError = (msg) => {
    setErrorMessage(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setErrorMessage(""), 5000);
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!profilePhotoPreview && !profilePhoto) {
        return displayError("A professional profile photo is required to teach.");
      }
      if (!formData.phone) return displayError("Please provide a valid WhatsApp / Phone number.");
      if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
        return displayError("Hourly rate must be greater than zero.");
      }
      if (!formData.subject.trim()) return displayError("Please specify a subject.");
      if (!formData.grade.trim()) return displayError("Please specify a grade.");

      let subjectId = null;
      if (formData.subject.trim()) {
        subjectId = await createSubject(formData.subject.trim());
        if (!subjectId) return displayError("Failed to create or find the specified subject.");
      }

      let gradeId = formData.grade_id;
      if (!gradeId && formData.grade.trim()) {
        const selectedGrade = availableGrades.find(
          (g) => (g.level || g.name || g.id) === formData.grade.trim()
        );
        if (selectedGrade) gradeId = selectedGrade.id;
      }
      if (!gradeId && formData.grade.trim()) {
        gradeId = await findGradeByName(formData.grade.trim());
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
      if (subjectId) formDataToSend.append("subjects", subjectId);
      if (gradeId) formDataToSend.append("grade", gradeId);
      if (profilePhoto) formDataToSend.append("profile_picture", profilePhoto);

      // --- Append the consolidated files to Django ---
      if (formData.national_identity_card) {
        formDataToSend.append("national_identity_card", formData.national_identity_card);
      }
      if (formData.professional_documents) {
        // We map the combined professional doc to the CV database field
        formDataToSend.append("cv", formData.professional_documents);
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
        setSuccessMessage("Profile updated successfully! Awaiting verification.");
        window.scrollTo({ top: 0, behavior: "smooth" });

        const currentUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        const updatedUserInfo = {
          ...currentUserInfo,
          ...response.data,
          subject: formData.subject,
          grade: formData.grade,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);

        window.dispatchEvent(new Event("profile-updated"));
        window.dispatchEvent(new Event("verification-status-changed"));

        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      displayError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Profile update failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-lilita text-[#015575] text-center mb-8">
          Complete Teacher Profile
        </h1>

        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 text-green-700 rounded-xl border border-green-300 shadow-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-xl border border-red-300 shadow-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          
          <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <label className="block text-lg font-semibold text-[#015575] mb-2">
              Professional Photo <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#015575]/20 bg-white">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Upload Photo</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#015575] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-[#01415e] transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={loading} />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Basic Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* SMART PHONE INPUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp / Phone <span className="text-red-500">*</span>
                </label>
                <div className="bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#015575]">
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    defaultCountry="KE"
                    className="w-full px-4 py-3"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* SMART HOURLY RATE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium">KES</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]"
                    placeholder="0.00"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" disabled={loading} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" placeholder="Years of experience" disabled={loading} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher License Number</label>
                <input type="text" name="teacher_license_number" value={formData.teacher_license_number} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" placeholder="Enter license number" disabled={loading} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National Identity Number</label>
                <input type="text" name="national_identity_number" value={formData.national_identity_number} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" placeholder="Enter ID number" disabled={loading} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] bg-white" disabled={loading}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Subject <span className="text-red-500">*</span></h3>
            <input type="text" value={subjectInput} onChange={handleSubjectChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" placeholder="e.g. Mathematics" disabled={loading} required />
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Grade <span className="text-red-500">*</span></h3>
            <select value={gradeInput} onChange={handleGradeChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] bg-white mb-4" disabled={loading}>
              <option value="">Select a grade</option>
              {availableGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>{grade.level}</option>
              ))}
            </select>
            <input type="text" value={formData.grade} onChange={(e) => { setFormData({ ...formData, grade: e.target.value, grade_id: "" }); setGradeInput(e.target.value); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575]" placeholder="Enter custom grade name (e.g., Grade 6)" disabled={loading} />
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-6">Bio</h3>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] h-32" placeholder="Tell us about yourself..." disabled={loading} />
          </div>

          {/* CONSOLIDATED UPLOAD 1: ID / Passport */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-2">Identity Verification</h3>
            <label className="block text-sm font-medium text-gray-700 mb-4">National ID Card / Passport</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleIdentityDocChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] bg-white"
              disabled={loading}
            />
          </div>

          {/* CONSOLIDATED UPLOAD 2: Professional Documents */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-[#015575] mb-2">Professional Documents</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Cert / Teacher License / CV</label>
            <p className="text-xs text-gray-500 mb-4">Please combine these into a single PDF if possible, or upload your primary document.</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleProfessionalDocsChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] bg-white"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#015575] text-white py-4 rounded-xl hover:bg-[#01415e] transition text-lg font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Saving Profile..." : "Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileUpdate;