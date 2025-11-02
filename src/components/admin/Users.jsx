import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { FHOST } from '../constants/Functions.jsx';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const res = await axios.get(`${FHOST}/admin/all-users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        if (res?.data?.success && Array.isArray(res.data.users)) {
          setUsers(res.data.users.map(u => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            type: u.role,
            status: u.is_active ? 'active' : 'inactive',
          })));
        } else {
          setUsers([]);
        }
      } catch (_) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleAddUser = () => {
    alert('Admin creation via UI is disabled. Please use backend admin tools.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      await axios.delete(`${FHOST}/admin/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (_) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      await axios.put(`${FHOST}/admin/users/${editingUser.id}`, editingUser, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
      setEditingUser(null);
    } catch (_) {
      setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
      setEditingUser(null);
    }
  };

  const handleChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const filteredUsers = users.filter(user => 
    (userType === 'all' || user.type === userType) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" 
            onClick={handleSearch}>
            Search
          </button>
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
          </select>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleAddUser}>
          Add User
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {error && <div className="px-6 py-3 text-sm text-red-600">{error}</div>}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id}>
                {editingUser?.id === user.id ? (
                  <>
                    <td className="px-6 py-4"><input name="name" value={editingUser.name} onChange={handleChange} className="border rounded p-1" /></td>
                    <td className="px-6 py-4"><input name="email" value={editingUser.email} onChange={handleChange} className="border rounded p-1" /></td>
                    <td className="px-6 py-4">
                      <select name="type" value={editingUser.type} onChange={handleChange} className="border rounded p-1">
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select name="status" value={editingUser.status} onChange={handleChange} className="border rounded p-1">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-green-600 hover:text-green-900 mr-2" onClick={handleSaveEdit}>Save</button>
                      <button className="text-gray-600 hover:text-gray-900" onClick={() => setEditingUser(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4" onClick={() => handleEdit(user)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(user.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
