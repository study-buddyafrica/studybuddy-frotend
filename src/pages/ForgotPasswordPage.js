import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { FHOST } from "../components/constants/Functions";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [informationalMessage, setInformationalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setInformationalMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${FHOST}/api/password/reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(
          responseData.message ||
            `Failed to send code: ${response.status} ${response.statusText}`,
        );
        setLoading(false);
        return;
      } else {
        setInformationalMessage("Verification code sent to your email!");
        setStep(2);
      }
    } catch (error) {
      setErrorMessage(
        "Failed to send code. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setInformationalMessage("");

    if (!code || code.length < 4) {
      setErrorMessage("Please enter a valid verification code");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${FHOST}/api/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: code,
          new_password: newPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(
          responseData.message ||
            `Password reset failed: ${response.status} ${response.statusText}`,
        );
        setLoading(false);
        return;
      }

      if (response.status === 200 || response.status === 201) {
        setInformationalMessage(
          "Password reset successful! Redirecting to login...",
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setErrorMessage(
        "Password reset failed. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#01B0F1]/10 mb-4">
            <FaLock className="h-8 w-8 text-[#01B0F1]" />
          </div>
          <h1 className="text-3xl font-bold text-[#015575] font-lilita mb-2">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className="text-gray-600 font-josefin">
            {step === 1
              ? "Enter your email to receive a verification code"
              : `We've sent a code to ${email}`}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border outline-none border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent font-josefin"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </motion.div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                <p className="font-josefin text-sm">{errorMessage}</p>
              </motion.div>
            )}

            {informationalMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl">
                <p className="font-josefin text-sm">{informationalMessage}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 rounded-xl font-lilita hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  Sending Code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </motion.button>
          </form>
        )}

        {/* Step 2: Code and Password Reset */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Verification Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2 font-josefin">
                Verification Code
              </label>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={handleCodeInput}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent font-mono text-center text-2xl tracking-widest font-josefin"
                  required
                  autoFocus
                  disabled={loading}
                />
              </motion.div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2 font-josefin">
                New Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent font-josefin"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#015575]"
                    disabled={loading}>
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2 font-josefin">
                Confirm New Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent font-josefin"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#015575]"
                    disabled={loading}>
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </motion.div>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                <p className="font-josefin text-sm">{errorMessage}</p>
              </motion.div>
            )}

            {informationalMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl">
                <p className="font-josefin text-sm">{informationalMessage}</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : undefined}
                whileTap={!loading ? { scale: 0.98 } : undefined}
                type="button"
                onClick={() => {
                  setStep(1);
                  setCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setErrorMessage("");
                  setInformationalMessage("");
                }}
                disabled={loading}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-lilita hover:bg-gray-50 transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                Back
              </motion.button>
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : undefined}
                whileTap={!loading ? { scale: 0.98 } : undefined}
                type="submit"
                disabled={loading || !code || !newPassword || !confirmPassword}
                className="flex-1 bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 rounded-xl font-lilita hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </div>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="font-josefin text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[#015575] hover:text-[#01B0F1] font-semibold">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
