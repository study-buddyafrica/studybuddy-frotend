import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaUserTie,
} from "react-icons/fa";
import { FHOST } from "../components/constants/Functions";

const UniversalSignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [informationalMessage, setInformationalMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const roles = [
    {
      id: "parent",
      label: "Parent",
      icon: <FaUserFriends className="w-6 h-6" />,
    },
    {
      id: "teacher",
      label: "Teacher",
      icon: <FaChalkboardTeacher className="w-6 h-6" />,
    },
    {
      id: "student",
      label: "Student",
      icon: <FaUserGraduate className="w-6 h-6" />,
    },
  ];

  const roleToEndpoint = {
    parent: "/users/register-parent",
    teacher: "/users/register-teacher",
    student: "/users/self-onboard-student",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const evaluatePasswordStrength = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    setPasswordRequirements({
      length: isLongEnough,
      uppercase: hasUpper,
      lowercase: hasLower,
      number: hasNumber,
      special: hasSpecial,
    });

    return hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough
      ? "strong"
      : "weak";
  };

  useEffect(() => {
    if (formData.password.length > 0) {
      setPasswordStrength(evaluatePasswordStrength(formData.password));
    } else {
      setPasswordStrength("");
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [formData.password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setInformationalMessage("");

    if (passwordStrength !== "strong") {
      setErrorMessage("Password is too weak. Please meet all requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!formData.role) {
      setErrorMessage("Please select a role");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload - all roles now include full_name
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        confirm_password: formData.confirmPassword,
      };

      const endpoint = roleToEndpoint[formData.role];

      const response = await fetch(`${FHOST}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error && responseData.missing) {
          setErrorMessage(`Missing fields: ${responseData.missing.join(", ")}`);
        } else {
          setErrorMessage(
            responseData.message ||
              `Signup failed: ${response.status} ${response.statusText}`
          );
        }
        setLoading(false);
        return;
      }

      if (response.status === 201 || response.status === 200) {
        setInformationalMessage(
          "Signup successful. Please check your email for verification code..."
        );
        // Redirect to verification page with email
        setTimeout(() => {
          navigate("/verify-code", {
            state: { email: formData.email },
          });
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(
        "Signup failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = (strength) => {
    if (strength === "strong") return "Strong Password";
    return "Weak Password";
  };

  const getRoleTitle = () => {
    switch (formData.role) {
      case "parent":
        return "Empower Your Child's Learning";
      case "teacher":
        return "Inspire Future Generations";
      case "student":
        return "Unlock Your Potential";
      default:
        return "Join Our Learning Community";
    }
  };

  const getRoleDescription = () => {
    switch (formData.role) {
      case "parent":
        return "Take control of your child's education journey with personalized tracking and resources.";
      case "teacher":
        return "Share your knowledge, create engaging lessons, and connect with students worldwide.";
      case "student":
        return "Access personalized learning paths, interactive content, and expert guidance.";
      default:
        return "Become part of a vibrant community dedicated to lifelong learning.";
    }
  };

  // Update left panel content based on selected role or show default
  const displayRole = formData.role || "parent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e1f5fe] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Hidden on mobile */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-[#0288d1] to-[#01579b] p-8 flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white"></div>
            <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-white"></div>
            <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-3xl font-bold mb-4 font-lilita">
                {getRoleTitle()}
              </h2>
              <p className="text-white/90 mb-6 font-josefin">
                {getRoleDescription()}
              </p>

              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {displayRole === "parent" && (
                    <FaUserFriends className="w-8 h-8" />
                  )}
                  {displayRole === "teacher" && (
                    <FaChalkboardTeacher className="w-8 h-8" />
                  )}
                  {displayRole === "student" && (
                    <FaUserGraduate className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg font-lilita">Benefits</h3>
                  <ul className="text-sm mt-2 space-y-1 font-josefin">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                      Personalized learning experience
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                      Access to premium resources
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                      Connect with experts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="w-full md:w-3/5 p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#01579b] font-lilita mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 font-josefin">
              Join our community of learners and educators
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <FaUserTie className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] font-josefin"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] font-josefin"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] font-josefin appearance-none bg-white cursor-pointer"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] font-josefin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 md:top-3.5 text-gray-500 hover:text-[#01579b]"
                >
                  {showPassword ? (
                    <FaRegEyeSlash className="text-sm md:text-base" />
                  ) : (
                    <FaRegEye className="text-sm md:text-base" />
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] font-josefin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 md:top-3.5 text-gray-500 hover:text-[#01579b]"
                >
                  {showConfirmPassword ? (
                    <FaRegEyeSlash className="text-sm md:text-base" />
                  ) : (
                    <FaRegEye className="text-sm md:text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="bg-gray-50 p-3 md:p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-josefin font-medium text-gray-700 text-sm md:text-base">
                    Password Strength
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      passwordStrength === "strong"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2 md:mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      passwordStrength === "strong"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      inlineSize: passwordStrength === "strong" ? "100%" : "40%",
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.length
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.length
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      8+ characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.uppercase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.uppercase
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      Uppercase
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.lowercase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.lowercase
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      Lowercase
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.number
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.number
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      Number
                    </span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.special
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.special
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages and Submit Button */}
            <div className="space-y-3">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                  <p className="font-josefin text-sm">{errorMessage}</p>
                </div>
              )}

              {informationalMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl">
                  <p className="font-josefin text-sm">{informationalMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || passwordStrength !== "strong" || !formData.role}
                className={`w-full py-2.5 md:py-3.5 rounded-xl font-lilita text-base md:text-lg transition-all ${
                  loading || passwordStrength !== "strong" || !formData.role
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-[#0288d1] to-[#01579b] text-white hover:shadow-lg hover:from-[#039be5] hover:to-[#0277bd]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center text-sm md:text-base">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <p className="text-center font-josefin text-gray-600 mt-4 md:mt-6 text-sm md:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#0288d1] hover:text-[#01579b] font-semibold"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversalSignupPage;