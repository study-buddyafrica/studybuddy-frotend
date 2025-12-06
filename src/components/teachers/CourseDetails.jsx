import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaBook,
  FaFileAlt,
  FaPlus,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { FHOST } from "../constants/Functions";

const CourseDetails = ({ course, onBack, userInfo }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [revisionMaterials, setRevisionMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
    is_locked: false,
    topic: "",
    file: "",
  });

  useEffect(() => {
    if (activeTab === "topics") fetchTopics();
    else if (activeTab === "subtopics") fetchSubtopics();
    else if (activeTab === "materials") fetchRevisionMaterials();
  }, [activeTab, course.id]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${FHOST}/api/topics/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { course: course.id }
      });
      setTopics(response.data?.results || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${FHOST}/api/subtopics/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const courseSubtopics = (response.data?.results || []).filter(
        subtopic => topics.some(topic => topic.id === subtopic.topic)
      );
      setSubtopics(courseSubtopics);
    } catch (error) {
      console.error("Error fetching subtopics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${FHOST}/api/revision-materials/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { course: course.id }
      });
      setRevisionMaterials(response.data?.results || []);
    } catch (error) {
      console.error("Error fetching revision materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let payload = {};
      let url = "";

      if (modalType === "topic") {
        payload = {
          course: course.id,
          title: formData.title,
          description: formData.description,
          order: formData.order,
          is_locked: formData.is_locked,
        };
        url = `${FHOST}/api/topics/`;
      } else if (modalType === "subtopic") {
        payload = {
          topic: formData.topic,
          title: formData.title,
          content: formData.description,
          order: formData.order,
          is_locked: formData.is_locked,
        };
        url = `${FHOST}/api/subtopics/`;
      } else if (modalType === "material") {
        payload = {
          course: course.id,
          title: formData.title,
          description: formData.description,
          file: formData.file || undefined,
        };
        url = `${FHOST}/api/revision-materials/`;
      }

      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        order: 1,
        is_locked: false,
        topic: "",
        file: "",
      });

      if (modalType === "topic") fetchTopics();
      else if (modalType === "subtopic") fetchSubtopics();
      else if (modalType === "material") fetchRevisionMaterials();

    } catch (error) {
      console.error(`Error creating ${modalType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type, topicId = null) => {
    setModalType(type);
    if (type === "subtopic" && topicId) {
      setFormData(prev => ({ ...prev, topic: topicId }));
    }
    setShowCreateModal(true);
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "topics", name: "Topics" },
    { id: "subtopics", name: "Subtopics" },
    { id: "materials", name: "Revision Materials" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaArrowLeft />
                Back to Courses
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
                <p className="text-gray-600 text-sm">
                  {course.subject_name || (typeof course.subject === 'object' ? course.subject?.name : course.subject)} •
                  {typeof course.grade === 'object' ? course.grade?.level : course.grade} •
                  KES {course.price}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                course.is_active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {course.is_active !== false ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tabs */}
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

          {/* Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{course.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">
                      {course.subject_name || (typeof course.subject === 'object' ? course.subject?.name : course.subject)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-medium">
                      {typeof course.grade === 'object' ? course.grade?.level : course.grade}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-[#01B0F1]">KES {course.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      {course.is_active !== false ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {course.description || "No description provided."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Topics</h2>
                <button
                  onClick={() => openCreateModal("topic")}
                  className="flex items-center gap-2 bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPlus />
                  Add Topic
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
                  <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No topics created yet.</p>
                  <button
                    onClick={() => openCreateModal("topic")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
                  >
                    <FaPlus />
                    Create First Topic
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="bg-white rounded-xl shadow border border-gray-100 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
                          <p className="text-gray-600 mt-1">{topic.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {topic.is_locked ? (
                            <FaLock className="text-red-500" />
                          ) : (
                            <FaUnlock className="text-green-500" />
                          )}
                          <button
                            onClick={() => openCreateModal("subtopic", topic.id)}
                            className="text-[#01B0F1] hover:text-[#0199d4] text-sm"
                          >
                            Add Subtopic
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "subtopics" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Subtopics</h2>
                <button
                  onClick={() => openCreateModal("subtopic")}
                  className="flex items-center gap-2 bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPlus />
                  Add Subtopic
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
                </div>
              ) : subtopics.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
                  <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No subtopics created yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {subtopics.map((subtopic) => (
                    <div key={subtopic.id} className="bg-white rounded-xl shadow border border-gray-100 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{subtopic.title}</h3>
                          <p className="text-gray-600 mt-1">{subtopic.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {subtopic.is_locked ? (
                            <FaLock className="text-red-500" />
                          ) : (
                            <FaUnlock className="text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Revision Materials</h2>
                <button
                  onClick={() => openCreateModal("material")}
                  className="flex items-center gap-2 bg-[#01B0F1] hover:bg-[#0199d4] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPlus />
                  Add Material
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01B0F1]"></div>
                </div>
              ) : revisionMaterials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-200">
                  <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No revision materials uploaded yet.</p>
                  <button
                    onClick={() => openCreateModal("material")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4]"
                  >
                    <FaPlus />
                    Upload First Material
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {revisionMaterials.map((material) => (
                    <div key={material.id} className="bg-white rounded-xl shadow border border-gray-100 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{material.title}</h3>
                          <p className="text-gray-600 mt-1">{material.description}</p>
                          {material.file_url && (
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#01B0F1] hover:text-[#0199d4] text-sm mt-2 inline-block"
                            >
                              Download File
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add {modalType === "topic" ? "Topic" : modalType === "subtopic" ? "Subtopic" : "Revision Material"}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                        placeholder="Enter title"
                      />
                    </div>

                    {modalType === "subtopic" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                        <select
                          required
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                        >
                          <option value="">Select a topic</option>
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {topic.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {modalType === "subtopic" ? "Content *" : "Description"}
                      </label>
                      <textarea
                        rows={4}
                        required={modalType === "subtopic"}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                        placeholder={modalType === "subtopic" ? "Enter content" : "Enter description"}
                      />
                    </div>

                    {(modalType === "topic" || modalType === "subtopic") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                            placeholder="1"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_locked"
                            checked={formData.is_locked}
                            onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                            className="h-4 w-4 text-[#01B0F1] focus:ring-[#01B0F1]"
                          />
                          <label htmlFor="is_locked" className="text-sm text-gray-700">
                            Lock this {modalType} (requires completion of previous items)
                          </label>
                        </div>
                      </>
                    )}

                    {modalType === "material" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                        <input
                          type="text"
                          value={formData.file}
                          onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4] disabled:opacity-60"
                    >
                      {loading ? "Creating..." : `Create ${modalType === "topic" ? "Topic" : modalType === "subtopic" ? "Subtopic" : "Material"}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;