import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FHOST } from '../components/constants/Functions';

const TeacherSignUpPage = () => {
  const [informationalMessage, setInformationalMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('All fields are required!');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      setConfirmPassword(''); // Clear the confirmPassword field to avoid confusion
      return;
    }

    try {
      let role = "teacher";
      const response = await fetch(`${FHOST}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (response.status === 409) {
        setErrorMessage('Email already exists. Please login or use a different email.');
        return;
      }

      if (response.status === 201) {
        const data = await response.json();
        setInformationalMessage('Signup successful. Redirecting to login page...');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrorMessage('Signup failed. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Teacher Signup</h1>
        <form className="space-y-4" onSubmit={handleSignup}>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />} {/* Emoji for visibility */}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />} {/* Emoji for visibility */}
            </button>
          </div>
          

          {/* Error and Information Messages */}
          {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
          {informationalMessage && <p className="text-green-500 text-sm mb-4">{informationalMessage}</p>}
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Social Media Signup Icons */}
        <div class="flex items-center justify-center my-4">
          <div class="flex-1 border-t border-grey"></div>
          <span class="mx-4">Or</span>
          <div class="flex-1 border-t border-grey"></div>
        </div>
        <div className="mt-1">
          <button className="flex items-center justify-center gap-3 bg-blue-950 p-2 rounded-lg w-full">
            <FcGoogle className="text-3xl" />
            <span className="text-white text-lg">Signup with Google</span>
          </button>
        </div>

        {/* Redirect to Login Page */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignUpPage;
