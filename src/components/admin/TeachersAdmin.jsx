import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        // Fetch teachers using the new user endpoint with role filter
        const tRes = await axios.get(`${FHOST}/api/users/users-list?role=teacher`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        
        if (tRes?.data?.results && Array.isArray(tRes.data.results)) {
          // Map teachers from the response - verification_status should be in the user data
          const teachersWithDetails = tRes.data.results.map((teacher) => {
            // Try to get verification_status from teacher profile or user data
            const verificationStatus = teacher.verification_status || teacher.teacher_profile?.verification_status || 'pending';
            return {
              id: teacher.id,
              full_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username,
              username: teacher.username,
              email: teacher.email,
              verified: verificationStatus === 'approved',
              verification_status: verificationStatus,
              grade: teacher.grade || teacher.teacher_profile?.grade || [],
              grades: teacher.grade || teacher.teacher_profile?.grade || [],
              balance: teacher.balance || teacher.teacher_profile?.balance || 0,
            };
          });
          setTeachers(teachersWithDetails);
        } else {
          setTeachers([]);
        }
        // Backend does not expose a pending withdrawals listing; leave empty for now
        setWithdrawals([]);
        
        // Fetch subjects and grades for display
        fetchSubjects();
        fetchGrades();
      } catch (e) {
        console.error("Failed to load teachers:", e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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

  const fetchTeacherDetails = async (teacherId) => {
    setLoadingDetails(true);
    setSelectedTeacher(teacherId);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        alert("No authentication token found. Please log in again.");
        setLoadingDetails(false);
        return;
      }

      let teacherData = null;
      let errorMessage = null;

      // Try to fetch from teachers endpoint first (for admin viewing other teachers)
      try {
        const teacherResponse = await axios.get(`${FHOST}/api/teachers/${teacherId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (teacherResponse.data) {
          teacherData = teacherResponse.data;
        }
      } catch (err) {
        console.error("Error fetching from /api/teachers/:", err);
        errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message;
        
        // If that fails, try fetching from users endpoint
        try {
          const userResponse = await axios.get(`${FHOST}/api/users/users-list?role=teacher`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userResponse.data?.results) {
            const teacher = userResponse.data.results.find(t => t.id === teacherId || String(t.id) === String(teacherId));
            if (teacher) {
              teacherData = teacher;
            }
          }
        } catch (err2) {
          console.error("Error fetching from users-list:", err2);
          if (!errorMessage) {
            errorMessage = err2.response?.data?.detail || err2.response?.data?.message || err2.message;
          }
        }
      }
      
      if (teacherData) {
        // Merge teacher profile data if it exists in a nested structure
        const mergedData = {
          ...teacherData,
          ...(teacherData.teacher_profile || {}),
          // Ensure we have user info
          email: teacherData.email || teacherData.user?.email,
          first_name: teacherData.first_name || teacherData.user?.first_name,
          last_name: teacherData.last_name || teacherData.user?.last_name,
        };
        setTeacherDetails(mergedData);
      } else {
        const msg = errorMessage || "Teacher not found or you don't have permission to view this teacher's details.";
        alert(msg);
        setSelectedTeacher(null);
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      "Failed to load teacher details. Please try again.";
      alert(errorMsg);
      setSelectedTeacher(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const checkRequiredFields = (teacherData) => {
    const requiredFields = [
      'tsc_number', 'tsc_number_certificate', 'academic_certificate', 'experience',
      'subjects', 'id_number', 'hourly_rate', 'bio', 'phone', 'profile_picture',
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

  const approveTeacherVerification = async (teacherId, teacherData = null) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // If teacherData not provided, fetch it
      let dataToUse = teacherData;
      if (!dataToUse) {
        // Try to fetch from teachers endpoint first (for admin viewing other teachers)
        try {
          const teacherResponse = await axios.get(`${FHOST}/api/teachers/${teacherId}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
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
        `${FHOST}/api/teachers/${teacherId}/verify_teacher/`,
        {
          tsc_number: dataToUse.tsc_number,
          tsc_number_certificate: dataToUse.tsc_number_certificate,
          academic_certificate: dataToUse.academic_certificate,
          experience: dataToUse.experience,
          subjects: dataToUse.subjects,
          id_number: dataToUse.id_number,
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
      setTeachers(teachers.map(t =>
        t.id === teacherId
          ? { ...t, verified: true, verification_status: 'approved' }
          : t
      ));
      
      // Close modal if open
      if (selectedTeacher === teacherId) {
        setSelectedTeacher(null);
        setTeacherDetails(null);
      }
      
      alert('Teacher verification approved successfully! Status changed to approved.');
      
      // Refresh the teachers list to get updated data
      const tRes = await axios.get(`${FHOST}/api/users/users-list?role=teacher`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => null);
      
      if (tRes?.data?.results && Array.isArray(tRes.data.results)) {
        const teachersWithDetails = tRes.data.results.map((teacher) => {
          const verificationStatus = teacher.verification_status || teacher.teacher_profile?.verification_status || 'pending';
          return {
            id: teacher.id,
            full_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username,
            username: teacher.username,
            email: teacher.email,
            verified: verificationStatus === 'approved',
            verification_status: verificationStatus,
            grade: teacher.grade || teacher.teacher_profile?.grade || [],
            grades: teacher.grade || teacher.teacher_profile?.grade || [],
            balance: teacher.balance || teacher.teacher_profile?.balance || 0,
          };
        });
        setTeachers(teachersWithDetails);
      }
    } catch (err) {
      console.error('Failed to approve teacher verification:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to approve teacher verification. Please try again.';
      alert(errorMsg);
    }
  };

  const rejectTeacherVerification = async (teacherId, teacherData = null) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // If teacherData not provided, fetch it
      let dataToUse = teacherData;
      if (!dataToUse) {
        // Try to fetch from teachers endpoint first (for admin viewing other teachers)
        try {
          const teacherResponse = await axios.get(`${FHOST}/api/teachers/${teacherId}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
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
        `${FHOST}/api/teachers/${teacherId}/unverify_teacher/`,
        {
          tsc_number: dataToUse.tsc_number,
          tsc_number_certificate: dataToUse.tsc_number_certificate,
          academic_certificate: dataToUse.academic_certificate,
          experience: dataToUse.experience,
          subjects: dataToUse.subjects,
          id_number: dataToUse.id_number,
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
      setTeachers(teachers.map(t =>
        t.id === teacherId
          ? { ...t, verified: false, verification_status: 'rejected' }
          : t
      ));
      
      // Close modal if open
      if (selectedTeacher === teacherId) {
        setSelectedTeacher(null);
        setTeacherDetails(null);
      }
      
      alert('Teacher verification rejected. Status changed to rejected.');
      
      // Refresh the teachers list to get updated data
      const tRes = await axios.get(`${FHOST}/api/users/users-list?role=teacher`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => null);
      
      if (tRes?.data?.results && Array.isArray(tRes.data.results)) {
        const teachersWithDetails = tRes.data.results.map((teacher) => {
          const verificationStatus = teacher.verification_status || teacher.teacher_profile?.verification_status || 'pending';
          return {
            id: teacher.id,
            full_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username,
            username: teacher.username,
            email: teacher.email,
            verified: verificationStatus === 'approved',
            verification_status: verificationStatus,
            grade: teacher.grade || teacher.teacher_profile?.grade || [],
            grades: teacher.grade || teacher.teacher_profile?.grade || [],
            balance: teacher.balance || teacher.teacher_profile?.balance || 0,
          };
        });
        setTeachers(teachersWithDetails);
      }
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={6}>Loading...</td></tr>
            ) : (
              filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.full_name || t.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(t.grades || [t.grade]).filter(Boolean).join(", ") || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Ksh {(t.balance || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      t.verification_status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : t.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t.verification_status === 'approved' ? 'Approved' : t.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => fetchTeacherDetails(t.id)} 
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        <Eye className="h-4 w-4 mr-1"/>View Details
                      </button>
                      {t.verification_status !== 'approved' && (
                        <>
                          <button 
                            onClick={() => approveTeacherVerification(t.id)} 
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            <Check className="h-4 w-4 mr-1"/>Approve
                          </button>
                          {t.verification_status === 'pending' && (
                            <button 
                              onClick={() => rejectTeacherVerification(t.id)} 
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
                  {/* Check Required Fields */}
                  {(() => {
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
                  })()}

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
                      <p className="text-sm text-gray-900">{teacherDetails.email || teacherDetails.user?.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-sm text-gray-900">
                        {teacherDetails.first_name || teacherDetails.user?.first_name || ''} {teacherDetails.last_name || teacherDetails.user?.last_name || ''}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900">{teacherDetails.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <p className="text-sm text-gray-900">{teacherDetails.id_number || '-'}</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">TSC Number</label>
                      <p className="text-sm text-gray-900">{teacherDetails.tsc_number || '-'}</p>
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
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        teacherDetails.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {teacherDetails.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
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
                                {grade?.name || gradeId}
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
                          <label className="block text-xs text-gray-600 mb-1">TSC Certificate</label>
                          {teacherDetails.tsc_number_certificate ? (
                            <a 
                              href={teacherDetails.tsc_number_certificate} 
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
                      </div>
                    </div>
                  </div>

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
                    {teacherDetails.is_verified !== true && (
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


