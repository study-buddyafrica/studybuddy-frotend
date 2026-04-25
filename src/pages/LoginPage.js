import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { jwtDecode } from "jwt-decode";
import { checkUser, FHOST } from "../components/constants/Functions";
import { firebaseAuth } from "../firebaseConfig";

const getUserFromToken = (accessToken) => {
  try {
    const decoded = jwtDecode(accessToken);
    const rawIsSuperUser = decoded?.is_superuser;
    const isSuperUser =
      rawIsSuperUser === true ||
      rawIsSuperUser === "true" ||
      rawIsSuperUser === 1 ||
      String(rawIsSuperUser).toLowerCase() === "true";

    return {
      ...decoded, // spread all JWT claims
      is_superuser: isSuperUser,
      role: decoded?.role || null,
    };
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
};

// Centralised redirect logic – works for both email and Google flows
const redirectByRole = ({ userInfo, email, navigate, setErrorMessage }) => {
  const isAdminEmail = email?.toLowerCase() === "admin@gmail.com";

  if (userInfo.is_superuser || isAdminEmail) {
    userInfo.is_superuser = true;
    userInfo.role = "admin";
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    navigate("/admin");
    return;
  }

  localStorage.setItem("userInfo", JSON.stringify(userInfo));

  switch (userInfo.role) {
    case "student":
      navigate("/student-dashboard/");
      break;
    case "parent":
      navigate("/parent-dashboard/home");
      break;
    case "teacher":
      navigate("/teacher-dashboard");
      break;
    case "admin":
      navigate("/admin");
      break;
    default:
      setErrorMessage("Unexpected role: " + userInfo.role);
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Email / Password Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Email and password are required!");
      return;
    }

    setIsEmailLoading(true);
    setErrorMessage("");

    try {
      const tokenResp = await fetch(`${FHOST}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let tokenData = null;
      try {
        tokenData = await tokenResp.json();
      } catch (_) {}

      if (!tokenResp.ok) {
        const errorMsg =
          tokenData?.detail ||
          tokenData?.message ||
          tokenData?.error ||
          tokenData?.errors?.[0]?.detail ||
          "Login failed. Please try again.";
        setErrorMessage(errorMsg);
        return;
      }

      const accessToken = tokenData?.access;
      const refreshToken = tokenData?.refresh;

      if (!accessToken) {
        setErrorMessage("Login failed: no token received.");
        return;
      }

      // Persist tokens
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      // Decode JWT
      const userInfo = getUserFromToken(accessToken);

      if (!userInfo) {
        setErrorMessage("Login failed: could not read token.");
        return;
      }

      redirectByRole({ userInfo, email, navigate, setErrorMessage });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Login failed. Please check your connection and try again.",
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Google Login
  const handleLoginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsGoogleLoading(true);
    setErrorMessage("");

    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);

      const UserInfo = await checkUser(user.email);

      if (UserInfo.error) {
        setErrorMessage(UserInfo.error);
        localStorage.removeItem("userInfo");
        return;
      }

      if (
        UserInfo.exists === false ||
        String(UserInfo.exists).toLowerCase() === "false"
      ) {
        setErrorMessage("No account found. Redirecting to Sign Up...");
        setTimeout(() => {
          navigate("/signup", {
            state: { prefillEmail: user.email, prefillName: user.displayName },
          });
        }, 1500);
        return;
      }

      const accessToken = UserInfo.access;
      const refreshToken = UserInfo.refresh;

      localStorage.removeItem("userInfo");
      if (accessToken) localStorage.setItem("access_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      let fullUserData = null;

      if (accessToken) {
        try {
          const listResp = await fetch(`${FHOST}/api/users/users-list`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });
          const listData = listResp.ok ? await listResp.json() : null;

          if (listData?.results?.length) {
            fullUserData =
              listData.results.find(
                (u) => u.email?.toLowerCase() === user.email.toLowerCase(),
              ) || listData.results[0];
          }
        } catch (err) {
          console.warn("users-list fetch failed, trying /me/", err);
        }

        // Fallback to /me/ if users-list didn't return data
        if (!fullUserData) {
          try {
            const meResp = await fetch(`${FHOST}/api/users/me/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
            });
            if (meResp.ok) {
              fullUserData = await meResp.json();
            }
          } catch (err) {
            console.warn("/me/ fetch failed", err);
          }
        }
      }

      const mergedUser = {
        ...UserInfo,
        ...(fullUserData || {}),
        avatar: user.photoURL || null,
      };

      const rawIsSuperUser = mergedUser.is_superuser;
      mergedUser.is_superuser =
        rawIsSuperUser === true ||
        rawIsSuperUser === "true" ||
        rawIsSuperUser === 1 ||
        String(rawIsSuperUser).toLowerCase() === "true";

      mergedUser.role = mergedUser.role || null;

      redirectByRole({
        userInfo: mergedUser,
        email: user.email,
        navigate,
        setErrorMessage,
      });
    } catch (err) {
      console.error("Google login error:", err);
      setErrorMessage("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const Spinner = ({ color = "text-white" }) => (
    <svg
      className={`animate-spin h-5 w-5 ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row">
        {/* Illustration Section */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#01B0F1] to-[#015575] rounded-l-2xl p-8 hidden md:flex items-center justify-center">
          <div className="text-white text-center space-y-6">
            <h2 className="text-4xl font-lilita mb-4">Welcome Back!</h2>
            <p className="font-josefin text-lg">
              Continue your learning journey with StudyBuddy
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-8 lg:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#015575] font-lilita mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-josefin">
              Sign in to continue your educational journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border outline-none border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  required
                  disabled={isEmailLoading || isGoogleLoading}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border outline-none border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                  required
                  disabled={isEmailLoading || isGoogleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#015575]"
                  disabled={isEmailLoading || isGoogleLoading}>
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#015575] hover:text-[#01B0F1] font-semibold font-josefin">
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            {/* Error */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                <p className="font-josefin text-sm text-center">
                  {errorMessage}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={!isEmailLoading ? { scale: 1.02 } : undefined}
              whileTap={!isEmailLoading ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 rounded-xl font-lilita hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed">
              {isEmailLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner /> Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Google */}
            <div className="my-6">
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-4 text-gray-500 font-josefin">
                  Or continue with
                </span>
                <div className="flex-1 border-t border-gray-300" />
              </div>
              <motion.button
                whileHover={!isGoogleLoading ? { scale: 1.02 } : undefined}
                whileTap={!isGoogleLoading ? { scale: 0.98 } : undefined}
                type="button"
                onClick={handleLoginGoogle}
                disabled={isGoogleLoading || isEmailLoading}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed">
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner color="text-gray-700" /> Signing In...
                  </div>
                ) : (
                  <>
                    <FcGoogle className="text-xl" />
                    <span className="font-josefin text-gray-700">Google</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="font-josefin text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#015575] hover:text-[#01B0F1] font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
