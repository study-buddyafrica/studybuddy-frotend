import React, { useEffect, useState } from "react";
import { Star, MapPin, Book, Clock, PlusCircle } from "lucide-react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    subjects: "",
    rating: "",
    location: "",
    experience: "",
    status: "active",
    availability: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const res = await axios.get(`${FHOST}/admin/teachers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        const list = Array.isArray(res?.data?.teachers) ? res.data.teachers : [];
        setTutors(list.map(t => ({
          id: t.id,
          name: t.full_name || t.username,
          subjects: t.subjects || t.subject_list || [],
          rating: t.rating || 0,
          location: t.location || "",
          experience: t.experience || "",
          status: t.status || (t.verified ? "active" : "pending"),
          availability: t.availability || "",
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update tutor
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setTutors(tutors.map((tutor) => (tutor.id === formData.id ? formData : tutor)));
    } else {
      setTutors([...tutors, { ...formData, id: Date.now(), subjects: formData.subjects.split(", ") }]);
    }
    setFormData({ id: null, name: "", subjects: "", rating: "", location: "", experience: "", status: "active", availability: "" });
    setIsEditing(false);
  };

  // Edit tutor
  const handleEdit = (tutor) => {
    setFormData({ ...tutor, subjects: tutor.subjects.join(", ") });
    setIsEditing(true);
  };

  // Delete tutor
  const handleDelete = (id) => {
    setTutors(tutors.filter((tutor) => tutor.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Tutors</h2>
      </div>

      {/* Form for adding/editing tutors */}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tutor Name" required className="w-full p-2 border rounded" />
        <input type="text" name="subjects" value={formData.subjects} onChange={handleChange} placeholder="Subjects (comma-separated)" required className="w-full p-2 border rounded" />
        <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating (0-5)" required className="w-full p-2 border rounded" />
        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required className="w-full p-2 border rounded" />
        <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience (e.g. 5 years)" required className="w-full p-2 border rounded" />
        <input type="text" name="availability" value={formData.availability} onChange={handleChange} placeholder="Availability (Full-time/Part-time)" required className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {isEditing ? "Update Tutor" : "Add Tutor"}
        </button>
      </form>

      {/* Tutors List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : tutors.map((tutor) => (
          <div key={tutor.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{tutor.name}</h3>
                <div className="mt-1 flex items-center">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">{tutor.rating}</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tutor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {tutor.status}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Book className="h-4 w-4 mr-2" />
                {tutor.subjects.join(", ")}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                {tutor.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {tutor.experience} experience
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="text-sm text-gray-500">{tutor.availability}</span>
              <div className="space-x-2">
                <button onClick={() => handleEdit(tutor)} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(tutor.id)} className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutors;
