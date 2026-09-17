import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FHOST } from "../components/constants/Functions";
import {
  AuthAlert,
  OtpCodeInput,
  useResendCountdown,
  authLinkClass,
} from "../components/auth";

const VerificationCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location state or sessionStorage
  const [email, setEmail] = useState(location.state?.email || "");
  const [registrationData, setRegistrationData] = useState(
    location.state?.registrationData || null,
  );

  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [informationalMessage, setInformationalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResetKey, setResendResetKey] = useState(0);
  const { remaining, canResend, label: resendLabel } = useResendCountdown(
    60,
    resendResetKey,
  );

  // Get email and registration data from sessionStorage if not in location state
  useEffect(() => {
    if (!email) {
      const pendingReg = sessionStorage.getItem("pendingRegistration");
      if (pendingReg) {
        try {
          const data = JSON.parse(pendingReg);
          if (data.email) {
            setEmail(data.email);
            setRegistrationData(data);
            return;
          }
        } catch (e) {
          console.error("Error parsing pendingRegistration:", e);
        }
      }
      navigate("/signup");
    } else if (!registrationData) {
      // Email is in location state but registrationData might not be
      const pendingReg = sessionStorage.getItem("pendingRegistration");
      if (pendingReg) {
        try {
          const data = JSON.parse(pendingReg);
          setRegistrationData(data);
        } catch (e) {
          console.error("Error parsing pendingRegistration:", e);
        }
      }
    }
  }, [email, registrationData, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setInformationalMessage("");

    // Get email from state or sessionStorage
    let currentEmail = email;
    if (!currentEmail) {
      const pendingReg = sessionStorage.getItem("pendingRegistration");
      if (pendingReg) {
        try {
          const data = JSON.parse(pendingReg);
          currentEmail = data.email;
        } catch (e) {
          console.error("Error parsing pendingRegistration:", e);
        }
      }
    }

    if (!currentEmail) {
      setErrorMessage(
        "Email not found. Please start the signup process again.",
      );
      setTimeout(() => navigate("/signup"), 2000);
      return;
    }

    if (!verificationCode || verificationCode.length < 4) {
      setErrorMessage(
        "Please enter a valid verification code (at least 4 digits)",
      );
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify the code using POST method
      console.log("Verifying code for email:", currentEmail);
      console.log("Verification code (raw):", verificationCode);
      console.log("Verification code (type):", typeof verificationCode);

      // Clean and prepare the code - send as string (backend likely expects string)
      const codeTrimmed = verificationCode.trim();
      const codeToSend = codeTrimmed; // Keep as string

      console.log("Code to send:", codeToSend, "Type:", typeof codeToSend);

      const verifyResponse = await fetch(`${FHOST}/api/verify-email/confirm/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: currentEmail.trim(),
          code: codeToSend,
        }),
      });

      // Parse response - handle both JSON and text responses
      let verifyData = {};
      const contentType = verifyResponse.headers.get("content-type");
      try {
        if (contentType && contentType.includes("application/json")) {
          verifyData = await verifyResponse.json();
        } else {
          const responseText = await verifyResponse.text();
          console.error("Non-JSON response received:", responseText);
          verifyData = { error: responseText || "Unknown server error" };
        }
      } catch (parseError) {
        console.error("Failed to parse verification response:", parseError);
        verifyData = { error: "Failed to parse server response" };
      }

      if (!verifyResponse.ok) {
        console.error("Verification failed:", {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          data: verifyData,
          codeSent: codeToSend,
          emailSent: currentEmail,
        });

        let errorMsg = "Verification failed. ";
        if (verifyResponse.status === 400) {
          // Check for specific error details
          if (
            verifyData.errors &&
            Array.isArray(verifyData.errors) &&
            verifyData.errors.length > 0
          ) {
            // Extract error messages from the errors array
            const errorDetails = verifyData.errors
              .map((err) => {
                if (typeof err === "string") {
                  return err;
                } else if (err.detail) {
                  return err.detail;
                } else if (err.message) {
                  return err.message;
                } else if (err.msg) {
                  return err.msg;
                } else if (err.code) {
                  return err.code;
                } else {
                  // Try to extract from nested structure
                  const keys = Object.keys(err);
                  if (keys.length > 0) {
                    return keys
                      .map((key) => {
                        const value = err[key];
                        if (Array.isArray(value)) {
                          return `${key}: ${value.join(", ")}`;
                        } else if (typeof value === "string") {
                          return `${key}: ${value}`;
                        }
                        return `${key}: ${JSON.stringify(value)}`;
                      })
                      .join("; ");
                  }
                  return JSON.stringify(err);
                }
              })
              .filter((msg) => msg && msg.trim())
              .join("; ");

            errorMsg +=
              errorDetails ||
              "Invalid verification code. Please check and try again.";
          } else if (verifyData.detail) {
            errorMsg +=
              typeof verifyData.detail === "string"
                ? verifyData.detail
                : JSON.stringify(verifyData.detail);
          } else if (verifyData.message) {
            errorMsg +=
              typeof verifyData.message === "string"
                ? verifyData.message
                : JSON.stringify(verifyData.message);
          } else if (verifyData.error) {
            errorMsg +=
              typeof verifyData.error === "string"
                ? verifyData.error
                : JSON.stringify(verifyData.error);
          } else {
            // Log the full error data for debugging
            console.error("Full error data:", verifyData);
            errorMsg +=
              "Invalid verification code. Please check and try again. If the problem persists, try requesting a new code.";
          }
        } else if (verifyResponse.status === 404) {
          errorMsg +=
            "Verification code not found or expired. Please request a new code.";
        } else {
          errorMsg +=
            verifyData.detail ||
            verifyData.message ||
            verifyData.error ||
            `${verifyResponse.status} ${verifyResponse.statusText}`;
        }

        setErrorMessage(errorMsg);
        setLoading(false);
        return;
      }

      // Step 2: If verification successful, complete registration
      if (verifyResponse.status === 200 || verifyResponse.status === 201) {
        // Get registration data from location state or sessionStorage
        let regData = registrationData;
        if (!regData) {
          const storedData = sessionStorage.getItem("pendingRegistration");
          if (storedData) {
            try {
              regData = JSON.parse(storedData);
            } catch (e) {
              console.error("Error parsing stored registration data:", e);
            }
          }
        }

        if (regData && regData.email && regData.password) {
          try {
            // Use the same endpoint for all roles
            const registerEndpoint = "/api/users/register/";

            // Build the registration payload - all roles use the same format
            let registerPayload;

            // Check if we have first_name and last_name (from universal signup)
            if (regData.first_name && regData.last_name) {
              registerPayload = {
                email: regData.email || currentEmail,
                first_name: regData.first_name,
                last_name: regData.last_name,
                username:
                  regData.username || regData.email?.split("@")[0] || "",
                password: regData.password,
                confirm_password: regData.confirm_password || regData.password,
                role: regData.role,
                education_level_id: regData.education_level || "",
              };
            } else if (regData.name) {
              // Handle cases where we only have 'name' (split into first_name and last_name)
              const nameParts = regData.name.trim().split(/\s+/);
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              registerPayload = {
                email: regData.email || currentEmail,
                first_name: firstName,
                last_name: lastName || firstName, // Use first_name as fallback if no last name
                username:
                  regData.username ||
                  regData.email?.split("@")[0] ||
                  firstName.toLowerCase(),
                password: regData.password,
                confirm_password: regData.confirm_password || regData.password,
                role: regData.role,
                education_level_id: regData.education_level || "",
              };
            } else {
              // Fallback - create from email if no name data
              const emailPrefix = (regData.email || currentEmail).split("@")[0];
              registerPayload = {
                email: regData.email || currentEmail,
                first_name: emailPrefix,
                last_name: emailPrefix,
                username: regData.username || emailPrefix,
                password: regData.password,
                confirm_password: regData.confirm_password || regData.password,
                role: regData.role,
                education_level_id: regData.education_level || "",
              };
            }

            console.log("Registering user with payload:", {
              ...registerPayload,
              password: "[REDACTED]",
            });
            console.log("Using endpoint:", registerEndpoint);

            const registerResponse = await fetch(
              `${FHOST}${registerEndpoint}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(registerPayload),
              },
            );

            // Parse response - handle both JSON and text responses
            let registerData = {};
            let responseText = "";
            const registerContentType =
              registerResponse.headers.get("content-type");
            try {
              responseText = await registerResponse.text();
              if (
                registerContentType &&
                registerContentType.includes("application/json")
              ) {
                try {
                  registerData = JSON.parse(responseText);
                } catch (jsonError) {
                  // If JSON parsing fails, treat as HTML/text
                  registerData = { error: responseText };
                }
              } else {
                // Non-JSON response (likely HTML error page)
                registerData = {
                  error: responseText || "Unknown server error",
                };
              }
            } catch (parseError) {
              console.error(
                "Failed to parse registration response:",
                parseError,
              );
              registerData = {
                error: responseText || "Failed to parse server response",
              };
            }

            if (!registerResponse.ok) {
              console.error("Registration failed:", {
                status: registerResponse.status,
                statusText: registerResponse.statusText,
                data: registerData,
              });

              let errorMsg = "Registration failed. ";

              // Check if responseText or errorData contains HTML
              let errorDataStr =
                responseText ||
                (typeof registerData === "string" ? registerData : null) ||
                (typeof registerData === "object" && registerData.error
                  ? registerData.error
                  : null);

              if (
                errorDataStr &&
                typeof errorDataStr === "string" &&
                (errorDataStr.includes("<!DOCTYPE html>") ||
                  errorDataStr.includes("<h1>"))
              ) {
                // Extract error from HTML
                const titleMatch = errorDataStr.match(
                  /<h1[^>]*>([^<]+)<\/h1>/i,
                );
                const title = titleMatch
                  ? titleMatch[1]
                      .trim()
                      .replace(/\s+at\s+.*$/, "")
                      .replace(/\s*\(404\)\s*/, "")
                  : null;
                if (title) {
                  errorMsg += title;
                } else {
                  errorMsg += "Server error occurred. Please try again.";
                }
              } else if (registerResponse.status === 400) {
                // Handle validation errors
                if (registerData.errors) {
                  const fieldErrors = Object.entries(registerData.errors)
                    .map(
                      ([field, messages]) =>
                        `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
                    )
                    .join("; ");
                  errorMsg += fieldErrors;
                } else if (registerData.detail) {
                  errorMsg +=
                    typeof registerData.detail === "string"
                      ? registerData.detail
                      : JSON.stringify(registerData.detail);
                } else if (registerData.message) {
                  errorMsg +=
                    typeof registerData.message === "string"
                      ? registerData.message
                      : JSON.stringify(registerData.message);
                } else if (registerData.error) {
                  errorMsg +=
                    typeof registerData.error === "string"
                      ? registerData.error
                      : JSON.stringify(registerData.error);
                } else {
                  errorMsg +=
                    "Invalid registration data. Please check your information.";
                }
              } else if (registerResponse.status === 404) {
                errorMsg +=
                  "Registration endpoint not found. Please contact support.";
              } else {
                errorMsg +=
                  registerData.detail ||
                  registerData.message ||
                  registerData.error ||
                  `${registerResponse.status} ${registerResponse.statusText}`;
              }

              setErrorMessage(errorMsg);
              setLoading(false);
              return;
            }

            if (
              registerResponse.status === 201 ||
              registerResponse.status === 200
            ) {
              // Clear sessionStorage
              sessionStorage.removeItem("pendingRegistration");
              setInformationalMessage(
                "Email verified and account created successfully! Redirecting to login...",
              );
              setLoading(false);
              setTimeout(() => navigate("/login"), 2000);
              return;
            }
          } catch (regError) {
            console.error("Registration error:", regError);
            setErrorMessage(
              "Registration failed. Please try again. Error: " +
                (regError.message || "Unknown error"),
            );
            setLoading(false);
            return;
          }
        } else {
          // No registration data found - just verification was successful
          console.warn(
            "Verification successful but no registration data found",
          );
          setInformationalMessage(
            "Email verified successfully! Redirecting to login...",
          );
          setLoading(false);
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage(
        "Verification failed. Please check your connection and try again.",
      );
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendLoading) return;

    // Get email from state or sessionStorage
    let currentEmail = email;
    if (!currentEmail) {
      const pendingReg = sessionStorage.getItem("pendingRegistration");
      if (pendingReg) {
        try {
          const data = JSON.parse(pendingReg);
          currentEmail = data.email;
        } catch (e) {
          console.error("Error parsing pendingRegistration:", e);
        }
      }
    }

    if (!currentEmail) {
      setErrorMessage(
        "Email not found. Please start the signup process again.",
      );
      return;
    }

    setResendLoading(true);
    setErrorMessage("");
    setInformationalMessage("");

    try {
      const response = await fetch(`${FHOST}/api/verify-email/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: currentEmail }),
      });

      // Parse response - handle both JSON and text responses
      let responseData = {};
      const contentType = response.headers.get("content-type");
      try {
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          const responseText = await response.text();
          console.error("Non-JSON resend response:", responseText);
          responseData = { error: responseText || "Unknown server error" };
        }
      } catch (parseError) {
        console.error("Failed to parse resend response:", parseError);
        responseData = { error: "Failed to parse server response" };
      }

      if (!response.ok) {
        const errorMsg =
          responseData.detail ||
          responseData.message ||
          responseData.error ||
          "Failed to resend verification code";
        setErrorMessage(errorMsg);
      } else {
        setInformationalMessage(
          "Verification code resent successfully! Please check your email.",
        );
        setResendResetKey((k) => k + 1);
      }
    } catch (error) {
      console.error("Resend code error:", error);
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };


  // Get email for display
  const displayEmail =
    email ||
    (() => {
      const pendingReg = sessionStorage.getItem("pendingRegistration");
      if (pendingReg) {
        try {
          const data = JSON.parse(pendingReg);
          return data.email || "";
        } catch (e) {
          return "";
        }
      }
      return "";
    })();

  if (!displayEmail) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#01B0F1]/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#01B0F1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#015575] font-lilita mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 font-josefin">
            We've sent a verification code to
          </p>
          <p className="text-[#01B0F1] font-semibold font-josefin">
            {displayEmail}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label
              htmlFor="otp-0"
              className="block text-sm font-medium text-gray-700 mb-3 font-josefin text-center"
            >
              Enter Verification Code
            </label>
            <OtpCodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              length={6}
              disabled={loading}
              autoFocus
            />
            <p className="mt-3 text-xs text-gray-500 font-josefin text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {errorMessage && (
            <AuthAlert
              message={errorMessage}
              variant="error"
              onDismiss={() => setErrorMessage("")}
              onRetry={
                /connection|network|timeout|try again|failed/i.test(
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
            disabled={loading || verificationCode.length < 4}
            className={`w-full py-3 rounded-xl font-lilita text-base md:text-lg transition-all ${
              loading || verificationCode.length < 4
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 font-josefin mb-2">
              Didn't receive the code?
            </p>
            {!canResend && (
              <p
                className="text-sm font-josefin text-[#015575] tabular-nums mb-1"
                aria-live="polite"
              >
                Resend available in {remaining}s
              </p>
            )}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || !canResend}
              className={`${authLinkClass} font-josefin text-sm disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline`}
            >
              {resendLoading ? "Sending..." : resendLabel}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-josefin">
            Wrong email?{" "}
            <Link to="/signup" className={authLinkClass}>
              Go back to signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

};

export default VerificationCodePage;
