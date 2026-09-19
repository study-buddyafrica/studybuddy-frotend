import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaUserTie,
  FaEnvelope,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FHOST, checkUser } from "../components/constants/Functions";
import { firebaseAuth } from "../firebaseConfig";
import {
  AuthLayout,
  AuthInput,
  AuthPasswordInput,
  AuthAlert,
  authInputBaseClass,
  authLinkClass,
} from "../components/auth";

const UniversalSignupPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // CTO UPGRADE: Extract Google Data if the user was redirected from the Login Page
  const initialFirstName = state?.prefillName
    ? state.prefillName.split(" ")[0]
    : "";
  const initialLastName = state?.prefillName
    ? state.prefillName.split(" ").slice(1).join(" ")
    : "";
  const initialUsername = initialFirstName
    ? `${initialFirstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
    : "";

  const [formData, setFormData] = useState({
    first_name: initialFirstName,
    last_name: initialLastName,
    username: initialUsername,
    email: state?.prefillEmail || "", // Auto-fills the Google Email!
    role: state?.role || "",
    password: "",
    confirmPassword: "",
    education_level: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [informationalMessage, setInformationalMessage] = useState("");
  const [educationLevels, setEducationLevels] = useState([]);
  const [educationLevelIsLoading, setEducationLevelIsLoading] = useState(false);
  const [educationLevelError, setEducationLevelError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      setErrorMessage("Password is too weak. Please meet all requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!formData.role) {
      setErrorMessage("Please select a role.");
      return;
    }

    setLoading(true);
    try {
      // 1. Request the Verification Code (OTP) from Django
      const sendCodeResponse = await fetch(
        `${FHOST}/api/verify-email/request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      let sendCodeData = {};
      const contentType = sendCodeResponse.headers.get("content-type");
      try {
        if (contentType && contentType.includes("application/json")) {
          sendCodeData = await sendCodeResponse.json();
          console.log(sendCodeData);
        } else {
          const responseText = await sendCodeResponse.text();
          sendCodeData = { error: responseText || "Unknown server error" };
        }
      } catch (parseError) {
        sendCodeData = { error: "Failed to parse server response" };
      }

      // 2. Handle Errors (e.g., Email already exists, rate limit, validation errors)
      if (!sendCodeResponse.ok) {
        let errorMsg = "Failed to send verification code.";
        if (sendCodeData.errors && Array.isArray(sendCodeData.errors) && sendCodeData.errors.length > 0) {
          errorMsg = sendCodeData.errors[0]?.detail || sendCodeData.errors[0]?.message || String(sendCodeData.errors[0]);
        } else if (sendCodeData.detail) {
          errorMsg = sendCodeData.detail;
        } else if (sendCodeData.message) {
          errorMsg = sendCodeData.message;
        } else if (sendCodeData.email) {
          errorMsg = Array.isArray(sendCodeData.email) ? sendCodeData.email.join(" ") : String(sendCodeData.email);
        } else if (sendCodeData.error) {
          errorMsg = typeof sendCodeData.error === "string" ? sendCodeData.error : JSON.stringify(sendCodeData.error);
        }

        const lowerError = String(errorMsg).toLowerCase();
        if (lowerError.includes("email") && lowerError.includes("already exists")) {
          setErrorMessage("An account with this email already exists. Please log in or use another email.");
        } else {
          setErrorMessage(String(errorMsg));
        }
        setLoading(false);
        return;
      }

      // 3. Success! Save data temporarily and route to the OTP Verification page
      if (sendCodeResponse.status === 200 || sendCodeResponse.status === 201) {
        setInformationalMessage(
          "Verification code sent to your email! Redirecting...",
        );

        // Bundle the form data so the next page can submit the final registration
        const registrationData = {
          ...formData,
          confirm_password: formData.confirmPassword,
          role: formData.role,
        };
        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify(registrationData),
        );

        setTimeout(() => {
          navigate("/verify-code", {
            state: {
              email: formData.email,
              registrationData: registrationData,
            },
          });
        }, 1500);
      }

      setLoading(false);
    } catch (error) {
      console.error("Signup network error:", error);
      setErrorMessage(
        "Signup failed. Please check your connection and try again.",
      );
      setLoading(false);
    }
  };

  //learning levels for students
  async function fetchLearningLevels() {
    setEducationLevelIsLoading(true);
    setEducationLevelError("");
    try {
      const response = await fetch(`${FHOST}/api/education-levels/`);
      if (!response.ok) {
        throw new Error("Failed to fetch learning levels");
      }
      const data = await response.json();
      if (!data?.results?.length) throw new Error("No learning levels found");
      setEducationLevels(data.results);
      if (state?.education_level) {
        const match = data.results.find((level) =>
          level.name
            ?.toLowerCase()
            .includes(state.education_level.toLowerCase()),
        );
        if (match) {
          setFormData((prev) => ({ ...prev, education_level: match.id }));
        }
      }
    } catch (error) {
      console.error("Error fetching learning levels:", error);
      setEducationLevelError("Unable to load education levels.");
    } finally {
      setEducationLevelIsLoading(false);
    }
  }

  useEffect(() => {
    if (formData.role === "student") {
      fetchLearningLevels();
    } else {
      setEducationLevels([]);
      setFormData((prev) => ({ ...prev, education_level: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role, formData.education_level]);

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setIsGoogleLoading(true);
    setErrorMessage("");
    setInformationalMessage("");

    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      const userInfo = await checkUser(user.email);

      if (
        userInfo.exists === true ||
        String(userInfo.exists).toLowerCase() === "true"
      ) {
        setInformationalMessage(
          "An account with this Google email already exists. Redirecting to login...",
        );
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const nameParts = (user.displayName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const generatedUsername = firstName
        ? `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
        : "";

      setFormData((prev) => ({
        ...prev,
        first_name: firstName || prev.first_name,
        last_name: lastName || prev.last_name,
        email: user.email || prev.email,
        username: prev.username || generatedUsername,
      }));

      setInformationalMessage(
        "Google account connected! Please choose your role and password to complete registration.",
      );
    } catch (err) {
      console.error("Google sign-in error:", err);
      setErrorMessage(
        "Google authentication failed or was cancelled. Please try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getStrengthLabel = (strength) => {
    if (strength === "strong") return "Strong Password";
    return "Weak Password";
  };

  const activeStep = formData.role ? 2 : 1;

  return (
    <AuthLayout
      mode="signup"
      activeStep={activeStep}
      title="Create Your Account"
      subtitle="Join our community of learners and educators"
    >
      <div className="mb-5">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 bg-white hover:bg-gray-50/80 rounded-xl transition-colors disabled:opacity-75 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {isGoogleLoading ? (
            <span className="font-josefin text-sm text-gray-700">
              Connecting Google...
            </span>
          ) : (
            <>
              <FcGoogle className="text-xl" />
              <span className="font-josefin font-semibold text-gray-700 text-sm">
                Continue with Google
              </span>
            </>
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-4 text-xs uppercase tracking-wider text-gray-400 font-josefin font-semibold">
            Or register with email
          </span>
          <div className="flex-1 border-t border-gray-200" />
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <AuthInput
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                icon={<FaUserTie className="w-4 h-4" aria-hidden="true" />}
                autoComplete="given-name"
                required
              />
              <AuthInput
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                icon={<FaUserTie className="w-4 h-4" aria-hidden="true" />}
                autoComplete="family-name"
                required
              />
            </div>

            {/* Email */}
            <AuthInput
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              icon={<FaEnvelope className="w-4 h-4" aria-hidden="true" />}
              autoComplete="email"
              required
            />

            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Role Selection */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
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
                  className={`${authInputBaseClass} pl-11 pr-10 py-3 appearance-none cursor-pointer`}
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

              {/* Education Level — only shown for students */}
              {formData.role === "student" && (
                <div className="relative w-full">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
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
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    disabled={educationLevelIsLoading || !!educationLevelError}
                    className={`${authInputBaseClass} pl-4 pr-10 py-3 appearance-none cursor-pointer`}
                    required
                  >
                    <option value="">
                      {educationLevelIsLoading
                        ? "Loading..."
                        : educationLevelError
                          ? "Error loading levels"
                          : "Select Education Level"}
                    </option>
                    {educationLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Username */}
            <AuthInput
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              icon={<FaUser className="w-4 h-4" aria-hidden="true" />}
              autoComplete="username"
              required
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <AuthPasswordInput
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                icon={<FaLock className="w-4 h-4" aria-hidden="true" />}
                autoComplete="new-password"
                required
              />
              <AuthPasswordInput
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                icon={<FaLock className="w-4 h-4" aria-hidden="true" />}
                revealLabel="Show confirm password"
                hideLabel="Hide confirm password"
                autoComplete="new-password"
                required
              />
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
                    }`}>
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
                      inlineSize:
                        passwordStrength === "strong" ? "100%" : "40%",
                    }}></div>
                </div>

                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.length
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.length
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}>
                      8+ characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.uppercase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.uppercase
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}>
                      Uppercase
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.lowercase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.lowercase
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}>
                      Lowercase
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.number
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.number
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        passwordRequirements.special
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></span>
                    <span
                      className={`text-xs ${
                        passwordRequirements.special
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}>
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages and Submit Button */}
            <div className="space-y-3">
              {errorMessage && (
                <AuthAlert
                  message={errorMessage}
                  variant="error"
                  onDismiss={() => setErrorMessage("")}
                  onRetry={
                    /connection|network|timeout|try again|failed to send/i.test(
                      errorMessage,
                    )
                      ? () => setErrorMessage("")
                      : undefined
                  }
                />
              )}

              {informationalMessage && (
                <AuthAlert
                  message={informationalMessage}
                  variant="success"
                  onDismiss={() => setInformationalMessage("")}
                  action={null}
                />
              )}

              <button
                type="submit"
                disabled={
                  loading || passwordStrength !== "strong" || !formData.role
                }
                className={`w-full py-2.5 md:py-3.5 rounded-xl font-lilita text-base md:text-lg transition-all ${
                  loading || passwordStrength !== "strong" || !formData.role
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white hover:shadow-lg hover:from-[#01B0F1] hover:to-[#015575]"
                }`}>
                {loading ? (
                  <span className="flex items-center justify-center text-sm md:text-base">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <p className="text-center font-josefin text-gray-600 mt-5 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className={`${authLinkClass} font-semibold underline underline-offset-2`}
            >
              Log in here
            </Link>
          </p>
    </AuthLayout>
  );
};

export default UniversalSignupPage;
