import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { FHOST } from '../constants/Functions.jsx';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Blog functionality not implemented in backend yet
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const [newBlog, setNewBlog] = useState({ title: '', author: '', excerpt: '', status: 'draft' });
  const [editingBlog, setEditingBlog] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
  };

  // Handle adding a new blog
  const handleAddBlog = async () => {
    if (!newBlog.title || !newBlog.author || !newBlog.excerpt) {
      alert('All fields are required.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (editingBlog) {
        await axios.put(`${FHOST}/admin/blogs/${editingBlog.id}`, newBlog, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      } else {
        await axios.post(`${FHOST}/admin/blogs`, newBlog, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      }
      const res = await axios.get(`${FHOST}/admin/blogs`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).catch(() => null);
      setBlogs(Array.isArray(res?.data?.blogs) ? res.data.blogs : []);
      setEditingBlog(null);
    } catch (_) {}

    setNewBlog({ title: '', author: '', excerpt: '', status: 'draft' });
  };

  // Handle editing a blog
  const handleEditBlog = (blog) => {
    setNewBlog(blog);
    setEditingBlog(blog);
  };

  // Handle deleting a blog
  const handleDeleteBlog = async (id) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      await axios.delete(`${FHOST}/admin/blogs/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setBlogs(blogs.filter((blog) => blog.id !== id));
    } catch (_) {
      setBlogs(blogs.filter((blog) => blog.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Blog functionality not implemented message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Blog Management Not Available
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Blog functionality has not been implemented in the backend yet. This feature will be available in a future update.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 p-6">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : blogs.map((blog) => (
            <div key={blog.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{blog.excerpt}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>By {blog.author}</span>
                  <span className="mx-2">•</span>
                  <span>{blog.date}</span>
                  <span className="mx-2">•</span>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-4">
                <button onClick={() => handleEditBlog(blog)} className="text-blue-600 hover:text-blue-900">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
