import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { jwtDecode } from "jwt-decode";
import { checkUser, FHOST } from "../components/constants/Functions";
import { firebaseAuth } from "../firebaseConfig";
import { authStorage } from "../services/authStorage"; // ← added
import {
  AuthLayout,
  AuthInput,
  AuthPasswordInput,
  AuthAlert,
  authLinkClass,
} from "../components/auth";

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
      ...decoded,
      is_superuser: isSuperUser,
      role: decoded?.role || null,
    };
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
};

// Centralised redirect – no more hardcoded admin@gmail.com
const redirectByRole = ({ userInfo, navigate, setErrorMessage }) => {
  // Keep userInfo in localStorage for now (non-token data)
  const safeUserInfo = { ...userInfo };
  delete safeUserInfo.access;
  delete safeUserInfo.refresh;
  delete safeUserInfo.access_token;
  delete safeUserInfo.refresh_token;
  localStorage.setItem("userInfo", JSON.stringify(safeUserInfo));

  if (userInfo.is_superuser || userInfo.role === "admin") {
    navigate("/admin");
    return;
  }

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
    default:
      setErrorMessage("Unexpected role: " + (userInfo.role || "unknown"));
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

      // ← changed: use authStorage instead of localStorage
      authStorage.setTokens(accessToken, refreshToken);

      const userInfo = getUserFromToken(accessToken);

      if (!userInfo) {
        setErrorMessage("Login failed: could not read token.");
        return;
      }

      redirectByRole({ userInfo, navigate, setErrorMessage });
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

      // ← changed
      authStorage.setTokens(accessToken, refreshToken);

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
      viewBox="0 0 24 24"
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
  );

  return (
    <AuthLayout
      mode="login"
      title="Welcome Back"
      subtitle="Sign in to continue your educational journey"
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 font-josefin">
            Email Address
          </label>
          <AuthInput
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FaEnvelope className="w-4 h-4" aria-hidden="true" />}
            required
            autoComplete="email"
            disabled={isEmailLoading || isGoogleLoading}
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider font-josefin">
              Password
            </label>
            <Link
              to="/forgot-password"
              className={`text-xs font-josefin font-semibold ${authLinkClass}`}
            >
              Forgot Password?
            </Link>
          </div>
          <AuthPasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FaLock className="w-4 h-4" aria-hidden="true" />}
            required
            autoComplete="current-password"
            disabled={isEmailLoading || isGoogleLoading}
          />
        </motion.div>

        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <AuthAlert
              message={errorMessage}
              variant="error"
              onDismiss={() => setErrorMessage("")}
              onRetry={
                /connection|network|timeout|try again/i.test(errorMessage)
                  ? () => setErrorMessage("")
                  : undefined
              }
            />
          </motion.div>
        )}

        <motion.button
          whileHover={!isEmailLoading ? { scale: 1.01 } : undefined}
          whileTap={!isEmailLoading ? { scale: 0.99 } : undefined}
          type="submit"
          disabled={isEmailLoading || isGoogleLoading}
          className="w-full bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3.5 rounded-xl font-lilita text-base tracking-wide hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {isEmailLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner /> Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </motion.button>

        <div className="pt-2">
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-xs uppercase tracking-wider text-gray-400 font-josefin font-semibold">
              Or continue with
            </span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <motion.button
            whileHover={!isGoogleLoading ? { scale: 1.01 } : undefined}
            whileTap={!isGoogleLoading ? { scale: 0.99 } : undefined}
            type="button"
            onClick={handleLoginGoogle}
            disabled={isGoogleLoading || isEmailLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 bg-white hover:bg-gray-50/80 rounded-xl transition-colors disabled:opacity-75 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center gap-2 font-josefin">
                <Spinner color="text-gray-700" /> Authenticating with Google...
              </div>
            ) : (
              <>
                <FcGoogle className="text-xl" />
                <span className="font-josefin font-semibold text-gray-700 text-sm">
                  Continue with Google
                </span>
              </>
            )}
          </motion.button>
        </div>

        <div className="pt-4 text-center border-t border-gray-100">
          <p className="font-josefin text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className={`${authLinkClass} font-semibold underline underline-offset-2`}>
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
