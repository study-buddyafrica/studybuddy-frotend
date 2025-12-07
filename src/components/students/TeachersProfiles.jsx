import React, { useEffect, useState } from "react";
import { FaSearch, FaStar, FaTimes, FaFilter, FaGraduationCap, FaBookOpen, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";

const TeacherProfiles = ({userInfo, darkMode}) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    student_id: userInfo?.id,
  });
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");

  // Simple grade-to-subjects map. Adjust as needed.
  const gradeSubjects = {
    "1": ["English", "Mathematics", "Science"],
    "2": ["English", "Mathematics", "Science"],
    "3": ["English", "Mathematics", "Science"],
    "4": ["English", "Mathematics", "Science", "Social Studies"],
    "5": ["English", "Mathematics", "Science", "Social Studies"],
    "6": ["English", "Mathematics", "Science", "Social Studies"],
    "7": ["English", "Mathematics", "Science", "Social Studies"],
    "8": ["English", "Mathematics", "Science", "Social Studies"],
    "9": ["Mathematics", "English", "Biology", "Chemistry", "Physics", "History", "Geography", "Computer Studies"],
    "10": ["Mathematics", "English", "Biology", "Chemistry", "Physics", "History", "Geography", "Computer Studies"],
    "11": ["Mathematics", "English", "Biology", "Chemistry", "Physics", "History", "Geography", "Computer Studies"],
    "12": ["Mathematics", "English", "Biology", "Chemistry", "Physics", "History", "Geography", "Computer Studies"]
  };

  // Get student's grade/class from userInfo (currently not used for backend filtering)
  const studentGrade = userInfo?.grade || userInfo?.class || "All Grades";

  useEffect(() => {
    let isMounted = true;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const fetchWithRetry = async (attempts = 3, params = {}) => {
      const token = localStorage.getItem('access_token');
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      for (let i = 0; i < attempts; i++) {
        try {
          // New teachers list endpoint (paginated)
          return await axios.get(`${FHOST}/api/teachers/list`, { headers, params });
        } catch (err) {
          const status = err?.response?.status;
          const retryAfter = Number(err?.response?.headers?.['retry-after']);
          if (status === 429 && i < attempts - 1) {
            const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000 * Math.pow(2, i);
            await sleep(delay);
            continue;
          }
          throw err;
        }
      }
    };
    
    // Fetch teachers data from the backend
    const fetchTeachers = async () => {
      try {
        const params = {
          verification_status: "approved",
          subject: selectedSubject || undefined,
          search: searchTerm ? searchTerm.trim() : undefined,
        };
        const response = await fetchWithRetry(3, params);
        // New API returns: { count, next, previous, results: [...] }
        const results = response?.data?.results || [];

        if (isMounted && Array.isArray(results) && results.length > 0) {
          const formattedTeachers = results.map((teacher) => {
            // New list schema: id, full_name, bio, hourly_rate, subjects, is_verified
            const name = teacher.full_name || teacher.name || "Teacher";
            const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
            const hourlyRate = teacher.hourly_rate ? Number(teacher.hourly_rate) : 0;

            return {
              id: teacher.id,
              name,
              bio: teacher.bio || "",
              subjects,
              is_verified: teacher.is_verified,
              // Map to fields used in UI
              profile_picture: teacher.profile_picture || 'https://via.placeholder.com/150',
              registered_on: teacher.registered_on
                ? new Date(teacher.registered_on).toLocaleDateString()
                : 'Not Registered',
              rating: teacher.rating || 4.5,
              totalStudents: teacher.totalStudents || 0,
              experience: teacher.experience || '5+ years',
              cost: hourlyRate,
              grade: teacher.grade || null,
              current_school: teacher.current_school || null,
              availability: teacher.availability || [
                {
                  date: '2024-11-27',
                  time: '9:00 AM - 11:00 AM',
                  isAvailable: true,
                },
                {
                  date: '2024-11-27',
                  time: '3:00 PM - 5:00 PM',
                  isAvailable: true,
                },
              ],
            };
          });

          setTeachers(formattedTeachers);
          setError(null);
        } else {
          setTeachers([]);
          setError('No teachers found.');
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setTeachers([]);
        setError('Failed to fetch teachers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
    return () => { isMounted = false; };
  }, [studentGrade, selectedSubject, searchTerm]);

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleBack = () => {
    setSelectedTeacher(null);
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };

  const handleTimeChange = (e) => {
    setFormData({ ...formData, time: e.target.value });
  };

  useEffect(() => {
    const fetchVideos = async () => {
      if (!selectedTeacher) return;
      try {
        const res = await axios.get(`${FHOST}/lessons/api/videos/teacher/${selectedTeacher.id}`);
        if (res.status === 200 && Array.isArray(res.data?.videos)) {
          setVideos(res.data.videos);
        } else {
          setVideos([]);
        }
      } catch (e) {
        setVideos([]);
      }
    };
    const fetchCourses = async () => {
      if (!selectedTeacher) return;
      try {
        const res = await axios.get(`${FHOST}/api/courses/?teacher=${selectedTeacher.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (res.status === 200 && Array.isArray(res.data?.results)) {
          setCourses(res.data.results);
        } else {
          setCourses([]);
        }
      } catch (e) {
        setCourses([]);
      }
    };
    fetchVideos();
    fetchCourses();
  }, [selectedTeacher]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      alert("Please select both date and time.");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      // Convert date and time to ISO format for scheduled_start
      const scheduledStart = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      
      // Calculate duration_hours (default to 1 hour if not specified)
      const durationHours = 1; // You can make this configurable if needed

      // Get course ID if available (you may need to adjust this based on your data structure)
      const courseId = selectedTeacher.course_id || selectedTeacher.id || null;

      const bookingData = {
        teacher_id: selectedTeacher.id,
        scheduled_start: scheduledStart,
        duration_hours: durationHours,
        course: courseId,
      };

      const response = await axios.post(
        `${FHOST}/api/student/session-bookings/`,
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const booking = response.data;
        const cost = booking.cost || booking.amount || 0;
        const status = booking.status || 'pending';
        setSuccessMessage(
          `Session booked successfully! Cost: ${Math.abs(parseFloat(cost))}. Status: ${status}. Waiting for teacher confirmation.`
        );
        setIsScheduling(false);
        setFormData({ date: "", time: "", student_id: userInfo?.id });
        setSelectedTeacher(null); // Go back to teacher list
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        alert("Failed to book session. Try again.");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      "Error booking session. Please try again.";
      alert(errorMsg);
    }
  };

  // Filter teachers based on search, subject and grade (client-only)
  const effectiveGrade = selectedGrade || (studentGrade !== "All Grades" ? String(studentGrade) : "");
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.subjects || []).some(subject =>
        String(subject).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSubject =
      !selectedSubject ||
      (teacher.subjects || []).some(subject =>
        String(subject) === selectedSubject
      );

    // New list endpoint does not provide grade information for teachers,
    // so we don't filter by grade here to avoid hiding all teachers.
    const matchesGrade = true;

    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Get unique subjects for filter
  const allSubjects = [
    ...new Set(
      teachers.flatMap(teacher =>
        (teacher.subjects || []).map(subject => String(subject))
      )
    ),
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {successMessage && (
        <div className="p-4 mb-6 bg-green-500 text-white rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {!selectedTeacher && (
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Teachers for {studentGrade}
            </h1>
            <p className="text-lg text-gray-600">
              Find and connect with qualified teachers for your subjects
            </p>
          </div>

          {/* Grade and Subject Filters */}
          <div className="mb-6 space-y-4">
            {/* Grade Selector */}
            <div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm border ${selectedGrade === "" ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => { setSelectedGrade(""); setSelectedSubject(""); }}
                >
                  All Grades
                </button>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(g => (
                  <button
                    key={g}
                    className={`px-3 py-1 rounded-full text-sm border ${selectedGrade === g ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    onClick={() => { setSelectedGrade(g); setSelectedSubject(""); }}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects by Selected Grade (falls back to student's grade or all subjects) */}
            <div>
              <div className="flex flex-wrap gap-2">
                {(
                  (selectedGrade && gradeSubjects[selectedGrade]) ? gradeSubjects[selectedGrade] :
                  ((studentGrade !== 'All Grades' && gradeSubjects[String(studentGrade)]) ? gradeSubjects[String(studentGrade)] : allSubjects)
                ).map(subject => (
                  <button
                    key={subject}
                    className={`px-3 py-1 rounded-full text-sm border ${selectedSubject === subject ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300'}`}
                    onClick={() => setSelectedSubject(prev => prev === subject ? "" : subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Subject Dropdown (existing) */}
            <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white hover:bg-gray-50"
                onClick={() => handleTeacherClick(teacher)}
              >
                <div className="relative">
                  <img
                    src={teacher.profile_picture}
                    alt={teacher.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">
                    {teacher.current_school || 'School not set'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">Grade: {teacher.grade || 'Not set'}</p>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <FaBookOpen className="inline mr-1" />
                      {Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : teacher.subjects}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">
                      <FaGraduationCap className="inline mr-1" />
                      {teacher.experience}
                    </span>
                    <span className="text-sm text-gray-600">
                      Grade: {teacher.grade || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {teacher.cost?.toLocaleString() || 0}
                    </span>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No teachers found matching your criteria.</p>
              <p>Try adjusting your search or subject filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Teacher Detail View */}
      {selectedTeacher && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="rounded-xl shadow-lg bg-white">
            <div className="p-6">
              <button 
                onClick={handleBack} 
                className="mb-4 px-4 py-2 rounded-lg transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                ← Back to Teachers
              </button>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img 
                    src={selectedTeacher.profile_picture} 
                    alt={selectedTeacher.name} 
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      KES {selectedTeacher.cost?.toLocaleString() || 0}
                    </div>
                    <button 
                      onClick={() => setIsScheduling(true)} 
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Schedule Lesson
                    </button>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold mb-2">{selectedTeacher.name}</h2>
                  <p className="text-lg text-gray-600">
                    {selectedTeacher.current_school || 'School not set'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Grade: {selectedTeacher.grade || 'Not set'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">Subjects</h4>
                      <p>{Array.isArray(selectedTeacher.subjects) ? selectedTeacher.subjects.join(", ") : selectedTeacher.subjects}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">Experience</h4>
                      <p>{selectedTeacher.experience}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">School</h4>
                      <p>{selectedTeacher.current_school || 'Not set'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">Hourly Rate</h4>
                      <p>{selectedTeacher.cost?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-xl font-semibold mb-3">Courses</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-gray-500">No courses available from this teacher yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-lg border bg-gray-50 p-3">
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      <p className="text-sm text-gray-500">Grade: {course.grade}</p>
                      <p className="text-sm text-gray-500">Subject: {course.subject}</p>
                      <p className="text-sm font-bold text-blue-600">Price: {course.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {isScheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-xl shadow-2xl w-96 max-w-[90vw] bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Schedule Lesson</h2>
              <button 
                onClick={() => setIsScheduling(false)} 
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-gray-700">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className="w-full p-3 rounded-lg border bg-gray-50 border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">
                  Select Time:
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={handleTimeChange}
                  className="w-full p-3 rounded-lg border bg-gray-50 border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button 
                type="submit" 
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfiles;
