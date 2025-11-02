import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role); // Store the selected role

    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    } else if (role === 'parent') {
      navigate('/parent-dashboard');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Choose Your Role
        </h1>
        
        <div className="space-y-4 text-center">
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          >
            Teacher Dashboard
          </button>

          <button
            onClick={() => handleRoleSelect('parent')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
          >
            Parent Dashboard
          </button>

          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
