import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FHOST } from "../components/constants/Functions";

const VerificationCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [informationalMessage, setInformationalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setInformationalMessage("");

    if (!verificationCode || verificationCode.length < 4) {
      setErrorMessage("Please enter a valid verification code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${FHOST}/api/users/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          verification_code: verificationCode,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(
          responseData.message ||
            `Verification failed: ${response.status} ${response.statusText}`
        );
        setLoading(false);
        return;
      }

      if (response.status === 200 || response.status === 201) {
        setInformationalMessage(
          "Email verified successfully! Redirecting to login..."
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setErrorMessage(
        "Verification failed. Please check your connection and try again."
      );
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendLoading || !email) return;

    setResendLoading(true);
    setErrorMessage("");
    setInformationalMessage("");

    try {
      const response = await fetch(`${FHOST}/auth/resend-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(
          responseData.message || "Failed to resend verification code"
        );
      } else {
        setInformationalMessage("Verification code resent successfully!");
      }
    } catch (error) {
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e1f5fe] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#0288d1]/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#0288d1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#01579b] font-lilita mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 font-josefin">
            We've sent a verification code to
          </p>
          <p className="text-[#0288d1] font-semibold font-josefin">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 mb-2 font-josefin"
            >
              Enter Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              value={verificationCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0288d1] focus:border-[#0288d1] font-mono text-center text-2xl tracking-widest font-josefin"
              required
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 font-josefin text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Messages */}
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

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || verificationCode.length < 4}
            className={`w-full py-3 rounded-xl font-lilita text-base md:text-lg transition-all ${
              loading || verificationCode.length < 4
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-[#0288d1] to-[#01579b] text-white hover:shadow-lg hover:from-[#039be5] hover:to-[#0277bd]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 font-josefin mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-[#0288d1] hover:text-[#01579b] font-semibold font-josefin text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading ? "Sending..." : "Resend Verification Code"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-josefin">
            Wrong email?{" "}
            <Link
              to="/signup"
              className="text-[#0288d1] hover:text-[#01579b] font-semibold"
            >
              Go back to signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodePage;

