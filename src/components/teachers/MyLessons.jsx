import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaBook,
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaSync,
  FaUsers,
  FaEye,
} from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import CourseDetails from "./CourseDetails";

const initialCourseState = {
  title: "",
  description: "",
  subject: "",
  grade: "",
  price: "",
  code: "",
  cover_image: "",
  topics: "",
  is_active: true,
  country: "Kenya", // Default to Kenya since the user is in Nairobi
  is_universal: false,
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "KES 0";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return `KES ${numeric.toLocaleString()}`;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};

const MyLessons = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState(initialCourseState);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchSubjects();
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.id]);

  const handleApiError = (message, error) => {
    console.error(message, error);
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = response.data?.results || response.data || [];
      const list = Array.isArray(payload) ? payload : [];
      setCourses(list);
      if (!selectedCourse && list.length) {
        setSelectedCourse(list[0]);
      }
    } catch (error) {
      handleApiError("Failed to load courses. Please try again.", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${FHOST}/api/courses/enrollments/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = response.data?.results || response.data || [];
      const list = Array.isArray(payload)
        ? payload.map((enrollment) => ({
            id: enrollment.id,
            course: enrollment.course,
            course_title: enrollment.course_title || enrollment.course?.title || "Untitled course",
            student: enrollment.student,
            purchased_at: enrollment.purchased_at,
            is_active: enrollment.is_active,
            transaction: enrollment.transaction,
            amount_paid: enrollment.amount_paid,
          }))
        : [];
      setEnrollments(list);
    } catch (error) {
      handleApiError("Failed to load enrollments. Please try again.", error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
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
      // If API fails, try to get from teacher profile
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo?.subjects) {
        const subjectsFromProfile = Array.isArray(userInfo.subjects) ? userInfo.subjects : [userInfo.subjects];
        setAvailableSubjects(subjectsFromProfile.map(s => typeof s === 'object' ? s : { id: s, name: s }));
      }
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchGrades = async () => {
    setLoadingGrades(true);
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
      // If API fails, try to get from teacher profile
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo?.grade || userInfo?.grades) {
        const gradesFromProfile = Array.isArray(userInfo.grade || userInfo.grades) ? (userInfo.grade || userInfo.grades) : [userInfo.grade || userInfo.grades];
        setAvailableGrades(gradesFromProfile.map(g => typeof g === 'object' ? g : { id: g, level: g }));
      }
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleRefresh = () => {
    fetchCourses();
    fetchEnrollments();
  };

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => {
      const subjectText = course.subject_name || (typeof course.subject === 'object' ? course.subject?.name : course.subject) || "";
      const gradeText = typeof course.grade === 'object' ? course.grade?.level : course.grade || "";
      return (
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        subjectText.toLowerCase().includes(query) ||
        gradeText.toLowerCase().includes(query) ||
        course.code?.toLowerCase().includes(query)
      );
    });
  }, [courseSearch, courses]);

  const handleCourseFieldChange = (field, value) => {
    setNewCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setSavingCourse(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        handleApiError("Authentication required. Please log in again.", new Error("No token"));
        setSavingCourse(false);
        return;
      }

      const teacherIdentifier =
        userInfo?.teacher_profile_id ||
        userInfo?.teacher_profile?.id ||
        userInfo?.id;

      const payload = {
        title: newCourse.title.trim(),
        description: newCourse.description.trim(),
        subject: newCourse.subject,
        grade: newCourse.grade,
        price: newCourse.price || "0",
        is_active: newCourse.is_active,
        code: newCourse.code || undefined,
        cover_image: newCourse.cover_image || undefined,
        topics: newCourse.topics,
        teacher: teacherIdentifier,
        country: newCourse.country,
        is_universal: newCourse.is_universal,
      };

      const response = await axios.post(`${FHOST}/api/courses/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Course created successfully!");
        setShowCreateCourseModal(false);
        setNewCourse(initialCourseState);
        fetchCourses();
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to create course. Please try again.";
      handleApiError(errorMsg, error);
    } finally {
      setSavingCourse(false);
    }
  };

  const tabs = [
    { id: "courses", name: "Courses" },
    { id: "enrollments", name: "Enrollments" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Lessons</h1>
          <p className="text-gray-600">Create and manage your courses and enrollments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FaSync className="animate-spin" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateCourseModal(true)}
            className="flex items-center gap-2 bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus />
            Create Course
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-[#01B0F1] text-[#01B0F1]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "courses" && !showCourseDetails && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, subject, grade or code..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="md:w-auto w-full flex items-center justify-center gap-2 border border-dashed border-[#01B0F1] text-[#01B0F1] px-4 py-2 rounded-lg hover:bg-[#01B0F1]/10 transition-colors"
            >
              <FaPlus />
              New Course
            </button>
          </div>

          {loadingCourses ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
              <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">You haven&apos;t created any courses yet.</p>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
              >
                <FaPlus />
                Create your first course
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`p-5 bg-white rounded-xl border shadow-sm transition transform hover:-translate-y-1 ${
                    selectedCourse?.id === course.id ? "border-[#01B0F1]" : "border-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">{course.title || "Untitled course"}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        course.is_active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description || "No description provided."}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaBook className="text-[#01B0F1]" /> {course.subject_name || (typeof course.subject === 'object' ? course.subject?.name : course.subject) || "Subject N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-[#01B0F1]" /> {typeof course.grade === 'object' ? course.grade?.level : course.grade || "Grade N/A"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-[#01B0F1]">
                      {formatCurrency(course.price)}
                    </div>
                    <div className="flex gap-2">
                      {course.code && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                          Code: {course.code}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseDetails(true);
                        }}
                        className="text-xs bg-[#01B0F1] text-white px-3 py-1 rounded-full hover:bg-[#0199d4] transition-colors flex items-center gap-1"
                      >
                        <FaEye className="text-xs" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {activeTab === "enrollments" && (
        <div className="space-y-4">
          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
              <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No enrollments yet. Purchases will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchased</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{enrollment.course_title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{enrollment.student || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <FaMoneyBillWave className="text-green-500" />
                          {formatCurrency(enrollment.amount_paid)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(enrollment.purchased_at)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            enrollment.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {enrollment.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{enrollment.transaction || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "courses" && showCourseDetails && selectedCourse && (
        <CourseDetails
          course={selectedCourse}
          onBack={() => setShowCourseDetails(false)}
          userInfo={userInfo}
        />
      )}

      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Create New Course</h2>
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.title}
                    onChange={(e) => handleCourseFieldChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    required
                    value={newCourse.subject}
                    onChange={(e) => handleCourseFieldChange("subject", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    disabled={loadingSubjects}
                  >
                    <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name || subject.subject || subject.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select
                    required
                    value={newCourse.grade}
                    onChange={(e) => handleCourseFieldChange("grade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    disabled={loadingGrades}
                  >
                    <option value="">Select a grade</option>
                    {availableGrades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.level || grade.name || grade.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => handleCourseFieldChange("price", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => handleCourseFieldChange("code", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Optional code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={newCourse.cover_image}
                    onChange={(e) => handleCourseFieldChange("cover_image", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newCourse.country}
                    onChange={(e) => handleCourseFieldChange("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="e.g. Kenya"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topics (one per line)</label>
                  <textarea
                    rows={3}
                    value={newCourse.topics}
                    onChange={(e) => handleCourseFieldChange("topics", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder={`Topic 1
Topic 2
Topic 3`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={newCourse.description}
                    onChange={(e) => handleCourseFieldChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Describe the course content..."
                  />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="course-active"
                    checked={newCourse.is_active}
                    onChange={(e) => handleCourseFieldChange("is_active", e.target.checked)}
                    className="h-4 w-4 text-[#01B0F1] focus:ring-[#01B0F1]"
                  />
                  <label htmlFor="course-active" className="text-sm text-gray-700">
                    Course is active and visible to students
                  </label>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="course-universal"
                    checked={newCourse.is_universal}
                    onChange={(e) => handleCourseFieldChange("is_universal", e.target.checked)}
                    className="h-4 w-4 text-[#01B0F1] focus:ring-[#01B0F1]"
                  />
                  <label htmlFor="course-universal" className="text-sm text-gray-700">
                    Course is universal (available in all countries)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={savingCourse}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4] disabled:opacity-60"
                >
                  {savingCourse ? "Saving..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default MyLessons;
