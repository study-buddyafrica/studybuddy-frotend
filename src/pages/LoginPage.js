import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { checkUser, FHOST } from "../components/constants/Functions";
import { firebaseAuth } from "../firebaseConfig";
import { authService } from "../services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Email and password are required!");
      return;
    }

    setIsEmailLoading(true);
    setErrorMessage("");

    try {
      // Use new token endpoint (Django requires trailing slash)
      const tokenResp = await fetch(`${FHOST}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Robust parse: try json, else text
      let tokenRaw = await tokenResp.text();
      let tokenData = null;
      try {
        tokenData = tokenRaw ? JSON.parse(tokenRaw) : null;
      } catch (_) {
        tokenData = null;
      }

      if (!tokenResp.ok) {
        console.log("Error Message:", tokenData.errors[0].detail);
        const errorMsg =
          tokenData?.detail ||
          tokenData?.message ||
          tokenData?.error ||
          tokenData.errors[0].detail;
        setErrorMessage(errorMsg);
        setIsEmailLoading(false);
        return;
      }

      if (tokenResp.status === 200) {
        // Store tokens
        const accessToken = tokenData?.access;
        const refreshToken = tokenData?.refresh;

        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Fetch user info using the access token
        try {
          // Prefer user-list endpoint per your spec
          const userListResp = await fetch(`${FHOST}/api/users/users-list`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });
          let userListRaw = await userListResp.text();
          let userListData = null;
          try {
            userListData = userListRaw ? JSON.parse(userListRaw) : null;
          } catch (_) {
            userListData = null;
          }

          if (userListResp.ok && userListData?.results?.length) {
            const me = userListData.results[0];

            // STRICT CHECK: is_superuser must be explicitly true to be admin
            const rawIsSuperUser = me.is_superuser;
            const isSuperUser =
              rawIsSuperUser === true ||
              rawIsSuperUser === "true" ||
              rawIsSuperUser === 1 ||
              String(rawIsSuperUser).toLowerCase() === "true";

            // Additional check: if email is admin@gmail.com, treat as admin
            const isAdminEmail = email.toLowerCase() === "admin@gmail.com";

            if (isSuperUser || isAdminEmail) {
              me.is_superuser = true;
              me.role = "admin";
              localStorage.setItem("userInfo", JSON.stringify(me));
              navigate("/admin");
              return;
            }

            // Not a superuser, use role field
            me.is_superuser = false;
            const role = me?.role || null;
            me.role = role;

            localStorage.setItem("userInfo", JSON.stringify(me));

            switch (role) {
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
                setErrorMessage("Unexpected role " + role);
            }
          } else {
            // Fallback to /me/ if user-list not available
            const userResp = await fetch(`${FHOST}/api/users/me/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
            });
            const userOkRaw = await userResp.text();
            let userData = null;
            try {
              userData = userOkRaw ? JSON.parse(userOkRaw) : null;
            } catch (_) {
              userData = null;
            }
            if (userResp.ok && userData) {
              const rawIsSuperUser = userData.is_superuser;
              const isSuperUser =
                rawIsSuperUser === true ||
                rawIsSuperUser === "true" ||
                rawIsSuperUser === 1 ||
                String(rawIsSuperUser).toLowerCase() === "true";

              const isAdminEmail = email.toLowerCase() === "admin@gmail.com";

              if (isSuperUser || isAdminEmail) {
                userData.is_superuser = true;
                userData.role = "admin";
                localStorage.setItem("userInfo", JSON.stringify(userData));
                navigate("/admin");
                return;
              }

              userData.is_superuser = false;
              const role = userData?.role || null;
              userData.role = role;

              localStorage.setItem("userInfo", JSON.stringify(userData));

              switch (role) {
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
                  setErrorMessage("Unexpected role " + role);
              }
            } else {
              setErrorMessage(
                "Logged in but couldn't fetch user info. Please try again.",
              );
            }
          }
        } catch (userError) {
          console.error("Error fetching user info:", userError);
          setErrorMessage("Logged in but couldn't fetch user info.");
        }
      } else {
        setErrorMessage("Login Failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Login failed. Please check your connection and try again.",
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsGoogleLoading(true);
    setErrorMessage(""); // Clear old errors
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      const UserInfo = await checkUser(user.email);

      // Scenario 1: Actual Network/Server Error
      if (UserInfo.error) {
        setError(UserInfo.error);
        setErrorMessage(UserInfo.error);
        localStorage.removeItem("userInfo");
        setIsGoogleLoading(false);
        return;
      }

      // Scenario 2: User doesn't exist in Django yet
      if (
        UserInfo.exists === false ||
        String(UserInfo.exists).toLowerCase() === "false"
      ) {
        console.log("New Google User. Redirecting to Registration...");
        setErrorMessage("No account found. Redirecting to Sign Up...");

        setTimeout(() => {
          navigate("/signup", {
            state: {
              prefillEmail: user.email,
              prefillName: user.displayName,
            },
          });
        }, 1500);

        return;
      }

      // Scenario 3: User Exists! Proceed with Login
      localStorage.removeItem("userInfo");

      // Save backend tokens if provided by checkUser
      if (UserInfo.access)
        localStorage.setItem("access_token", UserInfo.access);
      if (UserInfo.refresh)
        localStorage.setItem("refresh_token", UserInfo.refresh);

      // STRICT CHECK: is_superuser must be explicitly true to be admin
      const rawIsSuperUser = UserInfo.is_superuser;
      const isSuperUser =
        rawIsSuperUser === true ||
        rawIsSuperUser === "true" ||
        rawIsSuperUser === 1 ||
        String(rawIsSuperUser).toLowerCase() === "true";

      // Additional check: if email is admin@gmail.com, treat as admin
      const isAdminEmail = user.email.toLowerCase() === "admin@gmail.com";

      console.log("Google Login - Raw user data:", UserInfo);
      console.log("Google Login - is_superuser check:", {
        raw: rawIsSuperUser,
        converted: isSuperUser,
        isAdminEmail,
      });

      // If user is superuser OR admin email, ALWAYS set as admin regardless of role field
      if (isSuperUser || isAdminEmail) {
        UserInfo.is_superuser = true;
        UserInfo.role = "admin";
        localStorage.setItem("userInfo", JSON.stringify(UserInfo));
        console.log(
          "Google Login - Admin user detected, redirecting to /admin",
        );
        navigate("/admin");
        return;
      }

      // Not a superuser, use role field
      UserInfo.is_superuser = false;
      const role = UserInfo?.role || null;
      UserInfo.role = role;
      localStorage.setItem("userInfo", JSON.stringify(UserInfo));

      switch (role) {
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
          setErrorMessage("Please complete your profile to continue.");
          navigate("/signup");
      }
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
        strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Error Message */}
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

            {/* Submit Button */}
            <motion.button
              whileHover={!isEmailLoading ? { scale: 1.02 } : undefined}
              whileTap={!isEmailLoading ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 rounded-xl font-lilita hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed">
              {isEmailLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Social Login */}
            <div className="my-6">
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 font-josefin">
                  Or continue with
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
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
                    <Spinner color="text-gray-700" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    <FcGoogle className="text-xl" />
                    <span className="font-josefin text-gray-700">Google</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Signup Links */}
            <div className="text-center space-y-4">
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
