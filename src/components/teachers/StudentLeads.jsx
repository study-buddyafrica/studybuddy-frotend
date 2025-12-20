import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSearch } from 'react-icons/fa';

const StudentLeads = ({ userInfo }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newLead, setNewLead] = useState({
    course: '',
    student_profile: '',
    is_a_lead: true,
  });

  useEffect(() => {
    fetchLeads();
    fetchCourses();
    fetchStudents();
  }, [currentPage]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${FHOST}/api/student-leads/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10 },
      });

      const data = response.data;
      setLeads(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load student leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${FHOST}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.results || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${FHOST}/api/users/users-list/?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = response.data.results || response.data || [];
      const studentUsers = allUsers.filter(user => user.role === 'student');
      setStudents(studentUsers);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${FHOST}/api/student-leads/`, newLead, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Student lead created successfully!');
      setShowCreateModal(false);
      setNewLead({ course: '', student_profile: '', is_a_lead: true });
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (leadId, updateData) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${FHOST}/api/student-leads/${leadId}/`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Lead updated successfully!');
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${FHOST}/api/student-leads/${leadId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Lead deleted successfully!');
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lead');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.student_profile?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Leads</h1>
          <p className="text-gray-600">Manage student leads for your courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          Create Lead
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Leads List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
          <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No student leads found.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
          >
            <FaPlus />
            Create your first lead
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {courses.find(c => c.id === lead.course)?.title || lead.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(() => {
                        const student = students.find(s => s.profile_id === lead.student_profile);
                        return student ? `${student.first_name} ${student.last_name} (${student.email})` : lead.student_profile;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        lead.is_a_lead ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.is_a_lead ? 'Active Lead' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">Create Student Lead</h2>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={newLead.course}
                    onChange={(e) => setNewLead({ ...newLead, course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={newLead.student_profile}
                    onChange={(e) => setNewLead({ ...newLead, student_profile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.profile_id}>
                        {student.first_name} {student.last_name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLead.is_a_lead}
                    onChange={(e) => setNewLead({ ...newLead, is_a_lead: e.target.checked })}
                    className="h-4 w-4 text-[#015575] focus:ring-[#015575]"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mark as active lead</label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">Edit Lead</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updateData = {
                  course: formData.get('course'),
                  student_profile: formData.get('student_profile'),
                  is_a_lead: formData.get('is_a_lead') === 'on',
                };
                handleUpdateLead(editingLead.id, updateData);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    name="course"
                    defaultValue={editingLead.course}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    name="student_profile"
                    defaultValue={editingLead.student_profile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.profile_id}>
                        {student.first_name} {student.last_name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_a_lead"
                    defaultChecked={editingLead.is_a_lead}
                    className="h-4 w-4 text-[#015575] focus:ring-[#015575]"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mark as active lead</label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] disabled:opacity-50"
                  >
                    Update Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeads;