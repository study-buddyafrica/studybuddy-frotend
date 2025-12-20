import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaDownload, FaSearch } from 'react-icons/fa';

const RevisionMaterials = ({ userInfo }) => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file: null,
    course: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchCourses();
  }, [currentPage]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${FHOST}/api/revision-materials/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, page_size: 10 },
      });

      const data = response.data;
      setMaterials(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load revision materials');
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

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', newMaterial.title);
      formData.append('description', newMaterial.description);
      if (newMaterial.file) {
        formData.append('file', newMaterial.file);
      }
      formData.append('course', newMaterial.course);

      const response = await axios.post(`${FHOST}/api/revision-materials/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Revision material created successfully!');
      setShowCreateModal(false);
      setNewMaterial({ title: '', description: '', file: null, course: '' });
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create material');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${FHOST}/api/revision-materials/${materialId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Material deleted successfully!');
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courses.find(c => c.id === material.course)?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revision Materials</h1>
          <p className="text-gray-600">Upload and manage revision materials for your courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          Upload Material
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search materials..."
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
      {(() => {
        if (success) {
          setTimeout(() => setSuccess(''), 3000);
          return null;
        }
        return null;
      })()}

      {/* Materials List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
          <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No revision materials found.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
          >
            <FaPlus />
            Upload your first material
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{material.title}</h3>
                  <p className="text-gray-600 mb-2">{material.description}</p>
                  <p className="text-sm text-gray-500">
                    Course: {courses.find(c => c.id === material.course)?.title || material.course}
                  </p>
                  {material.file_url && (
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaDownload />
                      Download File
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
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

      {/* Create Material Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">Upload Revision Material</h2>
              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                    placeholder="Material title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    rows={3}
                    required
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={newMaterial.course}
                    onChange={(e) => setNewMaterial({ ...newMaterial, course: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                  <input
                    type="file"
                    onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    required
                  />
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
                    {loading ? 'Uploading...' : 'Upload Material'}
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

export default RevisionMaterials;