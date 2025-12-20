import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle, FaSearch, FaClock, FaArrowLeft } from 'react-icons/fa';

const Assessments = ({ userInfo }) => {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [viewingAssessment, setViewingAssessment] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    course: '',
    assessment_type: 'mcq',
    due_date: '',
    max_score: 100,
    questions: []
  });

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, [currentPage]);

  const fetchAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`${FHOST}/api/assessments/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, page_size: 10 },
      });

      const data = response.data;
      const assessmentsList = data.results || data || [];
      
      setAssessments(assessmentsList);
      setTotalPages(Math.ceil((data.count || assessmentsList.length || 0) / 10));
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError(`Failed to load assessments: ${err.response?.data?.detail || err.message}`);
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
      
      const coursesList = response.data.results || response.data || [];
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };



  const addQuestion = () => {
    const newQuestion = {
      text: '',
      order: newAssessment.questions.length + 1,
      points: 1,
      choices: [
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    };
    setNewAssessment({
      ...newAssessment,
      questions: [...newAssessment.questions, newQuestion]
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    setNewAssessment({
      ...newAssessment,
      questions: newAssessment.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    });
  };

  const updateChoice = (questionIndex, choiceIndex, field, value) => {
    setNewAssessment({
      ...newAssessment,
      questions: newAssessment.questions.map((q, qIndex) => 
        qIndex === questionIndex ? {
          ...q,
          choices: q.choices.map((c, cIndex) => 
            cIndex === choiceIndex ? { ...c, [field]: value } : c
          )
        } : q
      )
    });
  };

  const addChoice = (questionIndex) => {
    setNewAssessment({
      ...newAssessment,
      questions: newAssessment.questions.map((q, index) => 
        index === questionIndex ? {
          ...q,
          choices: [...q.choices, { 
            text: '', 
            is_correct: false 
          }]
        } : q
      )
    });
  };

  const removeQuestion = (questionIndex) => {
    setNewAssessment({
      ...newAssessment,
      questions: newAssessment.questions.filter((q, index) => index !== questionIndex)
    });
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    setNewAssessment({
      ...newAssessment,
      questions: newAssessment.questions.map((q, qIndex) => 
        qIndex === questionIndex ? {
          ...q,
          choices: q.choices.filter((c, cIndex) => cIndex !== choiceIndex)
        } : q
      )
    });
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${FHOST}/api/assessments/`, newAssessment, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Assessment created successfully!');
      setShowCreateModal(false);
      setNewAssessment({
        title: '',
        description: '',
        course: '',
        assessment_type: 'mcq',
        due_date: '',
        max_score: 100,
        questions: []
      });
      fetchAssessments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${FHOST}/api/assessments/${assessmentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Assessment deleted successfully!');
      fetchAssessments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (assessment) => {
    setViewingAssessment(assessment);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setViewingAssessment(null);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setNewAssessment({
      title: assessment.title || '',
      description: assessment.description || '',
      course: assessment.course || '',
      assessment_type: assessment.assessment_type || 'mcq',
      due_date: assessment.due_date ? new Date(assessment.due_date).toISOString().slice(0, 16) : '',
      max_score: assessment.max_score || 100,
      questions: assessment.questions ? assessment.questions.map(q => ({
        id: q.id,
        text: q.text || '',
        order: q.order || 1,
        points: q.points || 1,
        choices: q.choices ? q.choices.map(c => ({
          id: c.id,
          text: c.text || '',
          is_correct: c.is_correct || false
        })) : []
      })) : []
    });
    setShowEditModal(true);
  };

  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${FHOST}/api/assessments/${editingAssessment.id}/`, newAssessment, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Assessment updated successfully!');
      setShowEditModal(false);
      setEditingAssessment(null);
      setNewAssessment({
        title: '',
        description: '',
        course: '',
        assessment_type: 'mcq',
        due_date: '',
        max_score: 100,
        questions: []
      });
      fetchAssessments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assessment');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courses.find(c => c.id === assessment.course)?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If viewing assessment details
  if (currentView === 'detail' && viewingAssessment) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Assessment Details</h1>
            <p className="text-gray-600">Viewing: {viewingAssessment.title}</p>
          </div>
        </div>

        {/* Assessment Info */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#015575] mb-2">{viewingAssessment.title}</h2>
              <p className="text-gray-600 mb-4">{viewingAssessment.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Course:</strong> {courses.find(c => c.id === viewingAssessment.course)?.title || 'Unknown Course'}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Type:</strong> {viewingAssessment.assessment_type?.toUpperCase() || 'MCQ'}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Questions:</strong> {viewingAssessment.questions?.length || 0}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Max Score:</strong> {viewingAssessment.max_score || 100}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditAssessment(viewingAssessment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit />
                Edit
              </button>
              <button
                onClick={() => handleDeleteAssessment(viewingAssessment.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
          
          {viewingAssessment.due_date && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg w-fit">
              <FaClock />
              <span>Due: {new Date(viewingAssessment.due_date).toLocaleDateString()} at {new Date(viewingAssessment.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-[#015575] border-b pb-3 mb-6">Questions ({viewingAssessment.questions?.length || 0})</h3>
          
          {viewingAssessment.questions && viewingAssessment.questions.length > 0 ? (
            <div className="space-y-6">
              {viewingAssessment.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Question {qIndex + 1}
                    </h4>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">Points: {question.points || 1}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Order: {question.order || qIndex + 1}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-800 font-medium text-lg">{question.text}</p>
                  </div>
                  
                  {question.choices && question.choices.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Choices:</p>
                      {question.choices.map((choice, cIndex) => (
                        <div key={cIndex} className={`flex items-center gap-4 p-4 rounded-lg border ${
                          choice.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            choice.is_correct ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {choice.is_correct && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <span className={`flex-1 text-lg ${choice.is_correct ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                            {choice.text}
                          </span>
                          {choice.is_correct && (
                            <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaQuestionCircle className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No questions available for this assessment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
          <p className="text-gray-600">Create and manage assessments for your courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          Create Assessment
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search assessments..."
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

      {/* Assessments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
          <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No assessments found.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
          >
            <FaPlus />
            Create your first assessment
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-[#01B0F1]/10 p-3 rounded-lg">
                      <FaQuestionCircle className="text-[#01B0F1] text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{assessment.title}</h3>
                      <p className="text-gray-600 mb-3">{assessment.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          <strong>Course:</strong> {courses.find(c => c.id === assessment.course)?.title || 'Unknown Course'}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          <strong>Type:</strong> {assessment.assessment_type?.toUpperCase() || 'MCQ'}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          <strong>Questions:</strong> {assessment.questions?.length || 0}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          <strong>Max Score:</strong> {assessment.max_score || 100}
                        </span>
                      </div>
                      
                      {assessment.due_date && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg w-fit">
                          <FaClock />
                          <span>Due: {new Date(assessment.due_date).toLocaleDateString()} at {new Date(assessment.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewAssessment(assessment)}
                    className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4] transition-colors flex items-center gap-2"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditAssessment(assessment)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Assessment"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(assessment.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Assessment"
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

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">Create Assessment</h2>
              <form onSubmit={handleCreateAssessment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newAssessment.title}
                      onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                      required
                      placeholder="Assessment title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select
                      value={newAssessment.course}
                      onChange={(e) => setNewAssessment({ ...newAssessment, course: e.target.value })}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newAssessment.description}
                    onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    rows={3}
                    required
                    placeholder="Brief description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                    <select
                      value={newAssessment.assessment_type}
                      onChange={(e) => setNewAssessment({ ...newAssessment, assessment_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="essay">Essay</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={newAssessment.due_date}
                      onChange={(e) => setNewAssessment({ ...newAssessment, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                    <input
                      type="number"
                      value={newAssessment.max_score}
                      onChange={(e) => setNewAssessment({ ...newAssessment, max_score: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Questions</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-3 py-1 bg-[#01B0F1] text-white rounded text-sm hover:bg-[#0199d4]"
                      disabled={newAssessment.questions.length >= 20}
                    >
                      Add Question
                    </button>
                  </div>

                  {newAssessment.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Question {qIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                          rows={2}
                          required
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            value={question.order}
                            onChange={(e) => updateQuestion(qIndex, 'order', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">Choices</label>
                          <button
                            type="button"
                            onClick={() => addChoice(qIndex)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                          >
                            Add Choice
                          </button>
                        </div>
                        {question.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={choice.is_correct}
                              onChange={(e) => {
                                // Set all choices to false first, then set this one to true
                                const updatedChoices = question.choices.map(c => ({ ...c, is_correct: false }));
                                updatedChoices[cIndex] = { ...choice, is_correct: e.target.checked };
                                updateQuestion(qIndex, 'choices', updatedChoices);
                              }}
                              className="text-[#015575]"
                            />
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                              placeholder={`Choice ${cIndex + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeChoice(qIndex, cIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                              disabled={question.choices.length <= 2}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4">
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
                    {loading ? 'Creating...' : 'Create Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assessment Modal */}
      {showEditModal && editingAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-[#015575] mb-4">Edit Assessment</h2>
              <form onSubmit={handleUpdateAssessment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newAssessment.title}
                      onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                      required
                      placeholder="Assessment title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select
                      value={newAssessment.course}
                      onChange={(e) => setNewAssessment({ ...newAssessment, course: e.target.value })}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newAssessment.description}
                    onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    rows={3}
                    required
                    placeholder="Brief description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                    <select
                      value={newAssessment.assessment_type}
                      onChange={(e) => setNewAssessment({ ...newAssessment, assessment_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="essay">Essay</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={newAssessment.due_date}
                      onChange={(e) => setNewAssessment({ ...newAssessment, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                    <input
                      type="number"
                      value={newAssessment.max_score}
                      onChange={(e) => setNewAssessment({ ...newAssessment, max_score: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Questions</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-3 py-1 bg-[#01B0F1] text-white rounded text-sm hover:bg-[#0199d4]"
                      disabled={newAssessment.questions.length >= 20}
                    >
                      Add Question
                    </button>
                  </div>

                  {newAssessment.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Question {qIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                          rows={2}
                          required
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            value={question.order}
                            onChange={(e) => updateQuestion(qIndex, 'order', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">Choices</label>
                          <button
                            type="button"
                            onClick={() => addChoice(qIndex)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                          >
                            Add Choice
                          </button>
                        </div>
                        {question.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-edit-${qIndex}`}
                              checked={choice.is_correct}
                              onChange={(e) => {
                                // Set all choices to false first, then set this one to true
                                const updatedChoices = question.choices.map(c => ({ ...c, is_correct: false }));
                                updatedChoices[cIndex] = { ...choice, is_correct: e.target.checked };
                                updateQuestion(qIndex, 'choices', updatedChoices);
                              }}
                              className="text-[#015575]"
                            />
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#015575] focus:border-transparent"
                              placeholder={`Choice ${cIndex + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeChoice(qIndex, cIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                              disabled={question.choices.length <= 2}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAssessment(null);
                      setNewAssessment({
                        title: '',
                        description: '',
                        course: '',
                        assessment_type: 'mcq',
                        due_date: '',
                        max_score: 100,
                        questions: []
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#01415e] disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Assessment'}
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

export default Assessments;