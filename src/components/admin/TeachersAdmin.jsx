import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";
import { Check, X, Search, Filter, BadgeDollarSign, Eye, FileText } from "lucide-react";

const gradeOptions = [
  "All",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const coerceArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && item !== "");
  }
  return [value].filter((item) => item !== undefined && item !== null && item !== "");
};

// Helper to get grade level name from ID
const getGradeLevelName = (gradeId, availableGrades) => {
  if (!gradeId) return "";
  const grade = availableGrades.find(g => g.id === gradeId || g.level === gradeId);
  return grade?.level || grade?.name || gradeId;
};

// Helper to get subject name from ID
const getSubjectName = (subjectId, availableSubjects) => {
  if (!subjectId) return "";
  const subject = availableSubjects.find(s => s.id === subjectId || s.subject === subjectId);
  return subject?.subject || subject?.name || subjectId;
};

const TeachersAdmin = () => {
  const [teachers, setTeachers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  const normalizeVerificationStatus = (profile = {}) => {
    const rawStatus =
      profile?.verification_status ??
      profile?.status ??
      profile?.review_status ??
      profile?.state ??
      (profile?.is_verified === true
        ? "approved"
        : profile?.is_verified === false &&
          (profile?.is_rejected || profile?.was_rejected)
        ? "rejected"
        : profile?.is_verified === false
        ? "pending"
        : null);

    if (!rawStatus) {
      return "pending";
    }

    const normalized = rawStatus.toString().toLowerCase();
    if (["rejected", "declined", "failed"].includes(normalized)) return "rejected";
    if (["approved", "verified", "complete"].includes(normalized)) return "approved";
    return "pending";
  };

  const buildTeacherFromUser = async (user, headers) => {
    let profile = null;
    let verification_status = "pending";

    if (user.profile_id) {
      try {
        const profileResponse = await axios.get(`${FHOST}/api/teachers/${user.profile_id}/`, { headers });
        profile = profileResponse.data;
        verification_status = normalizeVerificationStatus(profile);
      } catch (e) {
        console.error("Failed to fetch profile for", user.profile_id, e);
        verification_status = "not_started"; // or pending
      }
    } else {
      verification_status = "not_started";
    }

    const fullName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username || user.email || "Unnamed Teacher";

    const gradeList = profile ? coerceArray(profile.grade) : [];
    const subjectList = profile ? coerceArray(profile.subjects) : [];

    return {
      id: user.id,
      teacher_profile_id: user.profile_id || 'no_profile',
      user_id: user.id,
      full_name: fullName,
      username: user.username || fullName,
      email: user.email || "N/A",
      verified: verification_status === "approved",
      verification_status,
      grade: gradeList,
      grades: gradeList,
      subjects: subjectList,
      hourly_rate: profile?.hourly_rate || 0,
      bio: profile?.bio || "",
      balance: typeof profile?.balance === "number" ? profile.balance : 0,
      phone: profile?.phone || user.phone || "",
      is_verified: profile?.is_verified,
      raw_profile: {
        ...user,
        ...profile,
        verification_status,
        grade: gradeList,
        subjects: subjectList,
        balance: typeof profile?.balance === "number" ? profile.balance : 0,
        email: user.email || "N/A",
        phone: profile?.phone || user.phone || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: fullName,
      },
    };
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      // Fetch all teachers from users endpoint
      let allTeachers = [];
      let nextUrl = `${FHOST}/api/users/users-list/?role=teacher`;

      while (nextUrl) {
        const response = await axios.get(nextUrl, { headers });
        const data = response.data;
        allTeachers = allTeachers.concat(data.results || []);
        nextUrl = data.next;
      }

      const teachersWithDetails = await Promise.all(allTeachers.map(user => buildTeacherFromUser(user, headers)));
      setTeachers(teachersWithDetails);
      setWithdrawals([]);
    } catch (e) {
      console.error("Failed to load teachers:", e);
      setError("Failed to load data");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchSubjects();
    fetchGrades();
  }, [fetchAll]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await axios.get(`${FHOST}/admin/get-subjects/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.data?.classes) {
        setAvailableSubjects(response.data.classes);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await axios.get(`${FHOST}/admin/get-classes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.data?.classes) {
        setAvailableGrades(response.data.classes);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const hydrateTeacherDetails = (data) => {
    if (!data) return null;

    // Use the actual verification_status from the API, don't derive it
    const verificationStatus = data.verification_status ||
                              (data.is_verified === true ? "approved" :
                               data.is_verified === false ? "rejected" : "pending");

    return {
      ...data,
      email: data.email || "",
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone: data.phone || "",
      grade: coerceArray(data.grade || data.grades),
      subjects: coerceArray(data.subjects),
      verification_status: verificationStatus, // Use the real status
    };
  };

  const fetchTeacherDetails = async (teacherId, fallbackProfile = null) => {
    if (!teacherId) {
      alert("Teacher not found.");
      return;
    }
    setLoadingDetails(true);
    setSelectedTeacher(teacherId);

    // Find the teacher data from our list
    const teacherData = fallbackProfile ||
      teachers.find((t) => (t.teacher_profile_id || t.id) === teacherId)?.raw_profile;

    if (teacherId === 'no_profile') {
      // No teacher profile, just show the fallback data
      if (teacherData) {
        setTeacherDetails(hydrateTeacherDetails(teacherData));
      }
      setLoadingDetails(false);
      return;
    }

    if (teacherData) {
      setTeacherDetails(hydrateTeacherDetails(teacherData));
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        alert("No authentication token found. Please log in again.");
        setLoadingDetails(false);
        return;
      }

      // Get teacher details using teacher profile ID
      const teacherResponse = await axios.get(`${FHOST}/api/teachers/${teacherId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (teacherResponse.data) {
        // Use the actual verification status from the API
        const processedData = {
          ...teacherResponse.data,
          verification_status: teacherResponse.data.verification_status, // Keep the real status
        };
        setTeacherDetails(hydrateTeacherDetails(processedData));
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      const errorMsg = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to load teacher details.";
      alert(errorMsg);
      setSelectedTeacher(null);
      setTeacherDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const checkRequiredFields = (teacherData) => {
    const requiredFields = [
      'teacher_license_number', 'teacher_license_certificate', 'academic_certificate', 'experience',
      'subjects', 'national_identity_number', 'national_identity_card', 'hourly_rate', 'bio', 'phone', 'profile_picture',
      'birth_date', 'gender', 'grade'
    ];
    const missingFields = requiredFields.filter(field => {
      if (Array.isArray(teacherData[field])) {
        return !teacherData[field] || teacherData[field].length === 0;
      }
      return !teacherData[field];
    });
    return { missingFields, allFieldsPresent: missingFields.length === 0 };
  };

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesSearch = !q ||
        String(t.full_name || t.username || t.email || "").toLowerCase().includes(q);
      const matchesGrade = grade === "All" || (t.grade === grade || (t.grades || []).includes(grade));
      return matchesSearch && matchesGrade;
    });
  }, [teachers, search, grade]);

  const approveWithdrawal = async (withdrawalId) => {
    // Not supported by backend yet
    setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
  };

  const rejectWithdrawal = async (withdrawalId) => {
    setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
  };

  const approveTeacherVerification = async (teacherProfileId, teacherData = null) => {
    if (!teacherProfileId || teacherProfileId === 'no_profile') {
      alert("Teacher profile missing. Cannot approve until profile is created.");
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      // If teacherData not provided, fetch it
      let dataToUse = teacherData;
      if (!dataToUse) {
        // Try to fetch from teachers endpoint first (for admin viewing other teachers)
        try {
          const teacherResponse = await axios.get(
            `${FHOST}/api/teachers/${teacherProfileId}/`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );
          dataToUse = teacherResponse.data;
        } catch (err) {
          // If that fails, try the teacher profile endpoint
          try {
            const profileResponse = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (profileResponse.data) {
              dataToUse = profileResponse.data;
            }
          } catch (err2) {
            throw new Error("Failed to fetch teacher data");
          }
        }
      }

      // Check if all required fields exist - APPROVE only if all fields are NOT empty
      const { missingFields, allFieldsPresent } = checkRequiredFields(dataToUse);
      if (!allFieldsPresent) {
        alert(`Cannot approve teacher. Missing required fields: ${missingFields.join(', ')}\n\nPlease ensure all fields are filled before approving.`);
        return;
      }

      if (!window.confirm('Are you sure you want to approve this teacher\'s verification?')) return;

      // Verify teacher with all required fields
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${FHOST}/api/teachers/${teacherProfileId}/verify_teacher/`,
        {
          teacher_license_number: dataToUse.teacher_license_number,
          teacher_license_certificate: dataToUse.teacher_license_certificate,
          academic_certificate: dataToUse.academic_certificate,
          experience: dataToUse.experience,
          subjects: dataToUse.subjects,
          national_identity_number: dataToUse.national_identity_number,
          national_identity_card: dataToUse.national_identity_card,
          hourly_rate: dataToUse.hourly_rate,
          bio: dataToUse.bio,
          phone: dataToUse.phone,
          profile_picture: dataToUse.profile_picture,
          birth_date: dataToUse.birth_date,
          gender: dataToUse.gender,
          grade: dataToUse.grade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update teacher in list with approved status
      setTeachers((prev) =>
        prev.map((t) =>
          t.teacher_profile_id === teacherProfileId
            ? { ...t, verified: true, verification_status: "approved" }
            : t
        )
      );
      
      // Close modal if open
      if (selectedTeacher === teacherProfileId) {
        setSelectedTeacher(null);
        setTeacherDetails(null);
      }
      
      alert('Teacher verification approved successfully! Status changed to approved.');
      await fetchAll();
    } catch (err) {
      console.error('Failed to approve teacher verification:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to approve teacher verification. Please try again.';
      alert(errorMsg);
    }
  };

  const rejectTeacherVerification = async (teacherProfileId, teacherData = null) => {
    if (!teacherProfileId || teacherProfileId === 'no_profile') {
      alert("Teacher profile missing. Cannot reject until profile is created.");
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      // If teacherData not provided, fetch it
      let dataToUse = teacherData;
      if (!dataToUse) {
        // Try to fetch from teachers endpoint first (for admin viewing other teachers)
        try {
          const teacherResponse = await axios.get(
            `${FHOST}/api/teachers/${teacherProfileId}/`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );
          dataToUse = teacherResponse.data;
        } catch (err) {
          // If that fails, try the teacher profile endpoint
          try {
            const profileResponse = await axios.get(`${FHOST}/api/teacher/profile/update/`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (profileResponse.data) {
              dataToUse = profileResponse.data;
            }
          } catch (err2) {
            throw new Error("Failed to fetch teacher data");
          }
        }
      }

      // Check if required fields are null/empty - REJECT if fields are null
      const { missingFields, allFieldsPresent } = checkRequiredFields(dataToUse);
      if (allFieldsPresent) {
        const confirmReject = window.confirm(
          'All required fields are present. Are you sure you want to reject this teacher\'s verification?'
        );
        if (!confirmReject) return;
      } else {
        // Fields are null/empty - this is a valid reason to reject
        if (!window.confirm(`Teacher has missing required fields: ${missingFields.join(', ')}\n\nDo you want to reject this teacher's verification?`)) return;
      }

      // Unverify/reject teacher
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${FHOST}/api/teachers/${teacherProfileId}/unverify_teacher/`,
        {
          teacher_license_number: dataToUse.teacher_license_number,
          teacher_license_certificate: dataToUse.teacher_license_certificate,
          academic_certificate: dataToUse.academic_certificate,
          experience: dataToUse.experience,
          subjects: dataToUse.subjects,
          national_identity_number: dataToUse.national_identity_number,
          national_identity_card: dataToUse.national_identity_card,
          hourly_rate: dataToUse.hourly_rate,
          bio: dataToUse.bio,
          phone: dataToUse.phone,
          profile_picture: dataToUse.profile_picture,
          birth_date: dataToUse.birth_date,
          gender: dataToUse.gender,
          grade: dataToUse.grade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update teacher in list with rejected status
      setTeachers((prev) =>
        prev.map((t) =>
          t.teacher_profile_id === teacherProfileId
            ? { ...t, verified: false, verification_status: "rejected" }
            : t
        )
      );
      
      // Close modal if open
      if (selectedTeacher === teacherProfileId) {
        setSelectedTeacher(null);
        setTeacherDetails(null);
      }
      
      alert('Teacher verification rejected. Status changed to rejected.');
      await fetchAll();
    } catch (err) {
      console.error('Failed to reject teacher verification:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to reject teacher verification. Please try again.';
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-medium text-gray-900">Teachers</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 border rounded-lg"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-9 pr-3 py-2 border rounded-lg"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={7}>Loading...</td></tr>
            ) : (
              filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.full_name || t.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(t.subjects || []).filter(Boolean).map(s => getSubjectName(s, availableSubjects)).join(", ") || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(t.grades || [t.grade]).filter(Boolean).map(g => getGradeLevelName(g, availableGrades)).join(", ") || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Ksh {(t.balance || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      t.verification_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : t.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : t.verification_status === 'not_started'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t.verification_status === 'approved' ? 'Approved' :
                       t.verification_status === 'rejected' ? 'Rejected' :
                       t.verification_status === 'not_started' ? 'Not Started' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => fetchTeacherDetails(t.teacher_profile_id || t.id, t.raw_profile)} 
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        <Eye className="h-4 w-4 mr-1"/>View Details
                      </button>
                      {t.verification_status !== 'approved' && (
                        <>
                          <button 
                            onClick={() => approveTeacherVerification(t.teacher_profile_id || t.id, t.raw_profile)} 
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            <Check className="h-4 w-4 mr-1"/>Approve
                          </button>
                          {t.verification_status === 'pending' && (
                            <button 
                              onClick={() => rejectTeacherVerification(t.teacher_profile_id || t.id, t.raw_profile)} 
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              <X className="h-4 w-4 mr-1"/>Reject
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center"><BadgeDollarSign className="h-5 w-5 mr-2"/>Pending Withdrawals</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr><td className="px-6 py-4" colSpan={4}>No pending withdrawals</td></tr>
            ) : withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.teacher_name || w.teacher_email || w.teacher_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ksh {(w.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.created_at || w.requested_at || Date.now()).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => approveWithdrawal(w.id)} className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"><Check className="h-4 w-4 mr-1"/>Approve</button>
                    <button onClick={() => rejectWithdrawal(w.id)} className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"><X className="h-4 w-4 mr-1"/>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Teacher Details</h3>
              <button
                onClick={() => {
                  setSelectedTeacher(null);
                  setTeacherDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-8">Loading teacher details...</div>
              ) : teacherDetails ? (
                <>
                  {/* Check teacher status */}
                  {teacherDetails.verification_status === 'not_started' ? (
                    <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span className="font-semibold text-blue-800">
                          This teacher has registered but has not yet created their teaching profile.
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        They need to complete their profile information before they can be approved for teaching.
                      </p>
                    </div>
                  ) : (
                    /* Check Required Fields */
                    (() => {
                      const { missingFields, allFieldsPresent } = checkRequiredFields(teacherDetails);
                      return (
                        <div className={`mb-6 p-4 rounded-lg ${
                          allFieldsPresent
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {allFieldsPresent ? (
                              <>
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-800">All required fields are present. Ready for approval.</span>
                              </>
                            ) : (
                              <>
                                <X className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-800">
                                  Missing required fields: {missingFields.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {teacherDetails.verification_status === 'not_started' ? (
                    /* Show basic info for teachers who haven't started */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{teacherDetails.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <p className="text-sm text-gray-900">
                          {teacherDetails.first_name || ''} {teacherDetails.last_name || ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-sm text-gray-900">{teacherDetails.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Started
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Profile Status</h4>
                          <p className="text-sm text-gray-600">
                            This teacher has registered as a teacher but has not yet completed their teaching profile.
                            They need to fill out their professional information, upload required certificates, and provide details about their teaching experience before they can be approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Show full profile for teachers who have started */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profile Picture */}
                      {teacherDetails.profile_picture && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                          <img
                            src={teacherDetails.profile_picture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                      )}

                      {/* Personal Information */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{teacherDetails.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <p className="text-sm text-gray-900">
                          {teacherDetails.first_name || ''} {teacherDetails.last_name || ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-sm text-gray-900">{teacherDetails.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">National Identity Number</label>
                        <p className="text-sm text-gray-900">{teacherDetails.national_identity_number || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                        <p className="text-sm text-gray-900">{teacherDetails.birth_date || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-sm text-gray-900">{teacherDetails.gender || '-'}</p>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher License Number</label>
                        <p className="text-sm text-gray-900">{teacherDetails.teacher_license_number || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                        <p className="text-sm text-gray-900">{teacherDetails.experience || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                        <p className="text-sm text-gray-900">{teacherDetails.hourly_rate ? `Ksh ${teacherDetails.hourly_rate}` : '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                        {(() => {
                          const status = (teacherDetails.verification_status || (teacherDetails.is_verified ? 'approved' : 'pending')).toLowerCase();
                          const statusLabel =
                            status === 'approved'
                              ? 'Approved'
                              : status === 'rejected'
                              ? 'Rejected'
                              : 'Pending';
                          const colorClass =
                            status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800';
                          return (
                            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${colorClass}`}>
                              {statusLabel}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Subjects */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                        <div className="flex flex-wrap gap-2">
                          {teacherDetails.subjects && teacherDetails.subjects.length > 0 ? (
                            teacherDetails.subjects.map((subjectId) => {
                              const subject = availableSubjects.find(s => s.id === subjectId);
                              return (
                                <span key={subjectId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {subject?.subject || subject?.name || subjectId}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-gray-500">No subjects selected</span>
                          )}
                        </div>
                      </div>

                      {/* Grades */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grades</label>
                        <div className="flex flex-wrap gap-2">
                          {teacherDetails.grade && teacherDetails.grade.length > 0 ? (
                            teacherDetails.grade.map((gradeId) => {
                              const grade = availableGrades.find(g => g.id === gradeId);
                              return (
                                <span key={gradeId} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                  {grade?.level || grade?.name || gradeId}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-gray-500">No grades selected</span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {teacherDetails.bio || 'No bio provided'}
                        </p>
                      </div>

                      {/* Certificates */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certificates</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Academic Certificate</label>
                            {teacherDetails.academic_certificate ? (
                              <a
                                href={teacherDetails.academic_certificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View Certificate
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">Not provided</span>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Teacher License Certificate</label>
                            {teacherDetails.teacher_license_certificate ? (
                              <a
                                href={teacherDetails.teacher_license_certificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View Certificate
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">Not provided</span>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">National Identity Card</label>
                            {teacherDetails.national_identity_card ? (
                              <a
                                href={teacherDetails.national_identity_card}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View Document
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">Not provided</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        setSelectedTeacher(null);
                        setTeacherDetails(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {teacherDetails.verification_status === 'not_started' ? (
                      <div className="text-sm text-gray-600">
                        Teacher must complete their profile before verification actions can be taken.
                      </div>
                    ) : teacherDetails.is_verified !== true && (
                      <>
                        <button
                          onClick={() => {
                            const { allFieldsPresent } = checkRequiredFields(teacherDetails);
                            if (allFieldsPresent) {
                              approveTeacherVerification(selectedTeacher, teacherDetails);
                            } else {
                              alert('Cannot approve. Please ensure all required fields are filled.');
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Verification
                        </button>
                        <button
                          onClick={() => rejectTeacherVerification(selectedTeacher, teacherDetails)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Verification
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">Failed to load teacher details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersAdmin;


