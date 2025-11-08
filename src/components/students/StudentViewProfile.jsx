import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions";
import { FaEdit, FaUser, FaEnvelope, FaCalendarAlt, FaPhone, FaGraduationCap, FaSchool, FaBook } from "react-icons/fa";

const StudentViewProfile = ({ userInfo, onEditProfile }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSchools, setAvailableSchools] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchGrades();
    fetchSchools();
    fetchSubjects();
  }, [userInfo]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${FHOST}/api/student/profile/update/${userInfo.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 404) {
        setError("Profile not found. Please update your profile first.");
      } else {
        setError("Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${FHOST}/admin/get-classes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data?.classes) {
        setAvailableGrades(response.data.classes);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${FHOST}/api/schools/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data?.results) {
        setAvailableSchools(response.data.results || []);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${FHOST}/admin/get-subjects/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.data?.classes) {
        setAvailableSubjects(response.data.classes);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const getGradeName = (gradeId) => {
    const grade = availableGrades.find(g => g.id === gradeId);
    return grade?.name || gradeId || "Not set";
  };

  const getSchoolName = (schoolId) => {
    const school = availableSchools.find(s => s.id === schoolId);
    return school?.name || schoolId || "Not set";
  };

  const getSubjectNames = (subjectIds) => {
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) return "None";
    return subjectIds.map(subjectId => {
      const subject = availableSubjects.find(s => s.id === subjectId);
      return subject?.subject || subject?.name || subjectId;
    }).join(", ");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl shadow-lg bg-white">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl shadow-lg bg-white">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Update Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-6 rounded-2xl shadow-lg bg-white transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-lilita">
            My Profile
          </h2>
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 p-1 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
              {profileData?.profile_picture ? (
                <img
                  src={profileData.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Birth Date
                </label>
                <div className="flex items-center text-gray-800">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  {profileData?.birth_date ? new Date(profileData.birth_date).toLocaleDateString() : "Not set"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contact Name
                </label>
                <div className="flex items-center text-gray-800">
                  <FaUser className="mr-2 text-gray-400" />
                  {profileData?.contact_name || "Not set"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Guardian Contact
                </label>
                <div className="flex items-center text-gray-800">
                  <FaPhone className="mr-2 text-gray-400" />
                  {profileData?.guardian_contact || "Not set"}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-500" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Grade
                </label>
                <div className="flex items-center text-gray-800">
                  <FaGraduationCap className="mr-2 text-gray-400" />
                  {getGradeName(profileData?.grade)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  School
                </label>
                <div className="flex items-center text-gray-800">
                  <FaSchool className="mr-2 text-gray-400" />
                  {getSchoolName(profileData?.school)}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaBook className="mr-2 text-blue-500" />
              Subjects
            </h3>
            <div className="text-gray-800">
              {getSubjectNames(profileData?.subjects)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentViewProfile;

