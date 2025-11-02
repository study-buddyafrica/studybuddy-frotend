import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaGraduationCap, 
  FaBookOpen,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import { FHOST } from '../constants/Functions';

const MyStudents = ({ userInfo }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form state for adding new student
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    grade: '',
    subject: '',
    parent_name: '',
    parent_phone: '',
    address: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [userInfo?.id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${FHOST}/users/teacher-student`, {
        params: { teacher_id: userInfo?.id }
      });
      const list = Array.isArray(response.data?.students) ? response.data.students : [];
      setStudents(list);
    } catch (error) {
      setErrorMessage('Unable to load students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMessage('Teachers cannot register students. Please ask a parent to register the student.');
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        await axios.delete(`${FHOST}/users/api/remove-student/${studentId}`);
        setSuccessMessage('Student removed successfully!');
        fetchStudents();
      } catch (error) {
        console.error('Error removing student:', error);
        setErrorMessage('Failed to remove student. Please try again.');
      }
    }
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
          <p className="text-gray-600">Manage your students</p>
        </div>
        {/* Teacher cannot add students; hide Add button */}
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-[#01B0F1]">{students.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {students.reduce((sum, student) => sum + (student.total_lessons || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Lessons</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01B0F1] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No students found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first student'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade & Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#01B0F1] flex items-center justify-center text-white font-semibold">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                      <div className="text-sm text-gray-500">{student.parent_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Grade {student.grade}</div>
                      <div className="text-sm text-gray-500">{student.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.total_lessons || 0} lessons</div>
                      <div className="text-sm text-gray-500">
                        Last: {student.last_lesson ? new Date(student.last_lesson).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowViewModal(true);
                          }}
                          className="text-[#01B0F1] hover:text-[#0199d4]"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal removed; teachers cannot register students */}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Student Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-[#01B0F1] flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2 text-[#01B0F1]" />
                    Personal Information
                  </h4>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-800">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Grade</label>
                    <p className="text-gray-800">Grade {selectedStudent.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject</label>
                    <p className="text-gray-800">{selectedStudent.subject}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2 text-[#01B0F1]" />
                    Parent Information
                  </h4>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parent Name</label>
                    <p className="text-gray-800">{selectedStudent.parent_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parent Phone</label>
                    <p className="text-gray-800">{selectedStudent.parent_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-800">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBookOpen className="mr-2 text-[#01B0F1]" />
                  Academic Progress
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-[#01B0F1]">{selectedStudent.total_lessons || 0}</div>
                    <div className="text-sm text-gray-600">Total Lessons</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Last Lesson</div>
                    <div className="text-sm font-medium text-gray-800">
                      {selectedStudent.last_lesson ? new Date(selectedStudent.last_lesson).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
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

export default MyStudents;
