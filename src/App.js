import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "./components/constants/axiosConfig";

import MainLayout from "./components/layouts/MainLayout";
import BlankLayout from "./components/layouts/BlankLayout";
import AdminLayout from "./components/layout/AdminLayout";

import { authStorage } from "./services/authStorage";
import { authService } from "./services/authService";
import {
  getPostAuthRedirect,
  isOnboardingComplete,
  readStoredUser,
} from "./utils/onboardingRoutes";
import RoleSelection from "./components/RoleSelection";
import Scheduler from "./components/teachers/Scheduler";
import HomePage from "./pages/HomePage";

import Dashboard from "./components/admin/Dashboard";
import Users from "./components/admin/Users";
import Transactions from "./components/admin/Transactions";
import Blogs from "./components/admin/Blogs";
import Events from "./components/admin/Events";
import Tutors from "./components/admin/Tutors";
import AdminTeachers from "./components/admin/TeachersAdmin";
import AdminStudents from "./components/admin/StudentsAdmin";
import AdminParents from "./components/admin/ParentsAdmin";
import AdminWithdrawals from "./components/admin/Withdrawals";

import CookieConsent from "./components/CookieConsent";

const TutorProfilesPage = lazy(() => import("./pages/TutorProfilesPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const TestimonialPage = lazy(() => import("./pages/TestimonialPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const MeetTheTeamPage = lazy(() => import("./pages/MeetTheTeamPage"));
const LiveChatPage = lazy(() => import("./pages/LiveChatPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ParentSignUpPage = lazy(() => import("./pages/UniversalSignUpPage"));
const VerificationCodePage = lazy(() => import("./pages/VerificationCodePage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const ChildrenSafetyGuidelines = lazy(
  () => import("./pages/Children-Safety-Guidelines"),
);
const TermsAndConditions = lazy(() => import("./pages/Terms-and-Conditions"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard"));
const ParentDashboard = lazy(() => import("./components/ParentDashboard"));

const OnboardingWizard = lazy(
  () => import("./components/onboarding/OnboardingWizard"),
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authStorage.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = readStoredUser();
  if (user && !isOnboardingComplete(user)) {
    return <Navigate to={getPostAuthRedirect(user)} replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = authStorage.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      if (user.is_superuser !== true && user.role !== "admin") {
        const role = user.role;
        if (role === "teacher")
          return <Navigate to="/teacher-dashboard" replace />;
        if (role === "student")
          return <Navigate to="/student-dashboard/" replace />;
        if (role === "parent")
          return <Navigate to="/parent-dashboard/home" replace />;
        return <Navigate to="/login" replace />;
      }
    } catch (e) {
      console.error("Error parsing userInfo:", e);
      return <Navigate to="/login" replace />;
    }
  } else {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [isHydrating, setIsHydrating] = useState(
    Boolean(authStorage.getRefreshToken() && !authStorage.getAccessToken()),
  );

  useEffect(() => {
    if (authStorage.getRefreshToken() && !authStorage.getAccessToken()) {
      authService
        .refreshToken()
        .catch((err) => {
          console.warn("Startup session hydration failed:", err);
        })
        .finally(() => {
          setIsHydrating(false);
        });
    } else {
      setIsHydrating(false);
    }
  }, []);

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff]">
        <div className="relative flex flex-col items-center justify-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative h-24 w-24"
          >
            <div className="absolute inset-0 animate-pulse rounded-full border-4 border-blue-200" />
            <div className="absolute inset-2 rounded-full border-4 border-t-[#01B0F1] border-r-transparent border-b-transparent border-l-transparent" />
          </motion.div>
          <p className="animate-pulse font-medium text-gray-600">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <CookieConsent />
      <ToastContainer />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff]">
            <div className="relative flex flex-col items-center justify-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative h-24 w-24"
              >
                <div className="absolute inset-0 animate-pulse rounded-full border-4 border-blue-200" />
                <div className="absolute inset-4 animate-ping rounded-full border-4 border-blue-300" />
                <div className="absolute inset-8 rounded-full border-4 border-blue-400" />
              </motion.div>
              <span className="font-lilita text-2xl font-bold text-[#015575]">
                Loading...
              </span>
            </div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/home"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/tutors"
            element={
              <MainLayout>
                <TutorProfilesPage />
              </MainLayout>
            }
          />
          <Route
            path="/blog"
            element={
              <MainLayout>
                <BlogPage />
              </MainLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <MainLayout>
                <FAQPage />
              </MainLayout>
            }
          />
          <Route
            path="/testimonials"
            element={
              <MainLayout>
                <TestimonialPage />
              </MainLayout>
            }
          />
          <Route
            path="/pricing"
            element={
              <MainLayout>
                <PricingPage />
              </MainLayout>
            }
          />
          <Route
            path="/team"
            element={
              <MainLayout>
                <MeetTheTeamPage />
              </MainLayout>
            }
          />
          <Route
            path="/about-us"
            element={
              <MainLayout>
                <AboutUsPage />
              </MainLayout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <MainLayout>
                <PrivacyPolicy />
              </MainLayout>
            }
          />
          <Route
            path="/cookies-policy"
            element={
              <MainLayout>
                <CookiesPolicy />
              </MainLayout>
            }
          />
          <Route
            path="/confirm-email/:token"
            element={
              <MainLayout>
                <ConfirmEmail />
              </MainLayout>
            }
          />
          <Route
            path="/children-safety-guidelines"
            element={
              <MainLayout>
                <ChildrenSafetyGuidelines />
              </MainLayout>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <MainLayout>
                <TermsAndConditions />
              </MainLayout>
            }
          />
          <Route
            path="/role-selection"
            element={
              <MainLayout>
                <RoleSelection />
              </MainLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="parents" element={<AdminParents />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="events" element={<Events />} />
            <Route path="tutors" element={<Tutors />} />
          </Route>

          <Route
            path="/student-dashboard/*"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-dashboard/*"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-dashboard/home"
            element={
              <ProtectedRoute>
                <BlankLayout>
                  <ParentDashboard />
                </BlankLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/live-chat"
            element={
              <MainLayout>
                <LiveChatPage />
              </MainLayout>
            }
          />
          <Route
            path="/scheduler"
            element={
              <MainLayout>
                <Scheduler />
              </MainLayout>
            }
          />

          <Route
            path="/login"
            element={
              <BlankLayout>
                <LoginPage />
              </BlankLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <BlankLayout>
                <ForgotPasswordPage />
              </BlankLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <BlankLayout>
                <ParentSignUpPage />
              </BlankLayout>
            }
          />
          <Route
            path="/student-signup"
            element={<Navigate to="/signup" replace />}
          />
          <Route
            path="/teacher-signup"
            element={<Navigate to="/signup" replace />}
          />
          <Route
            path="/parent-signup"
            element={<Navigate to="/signup" replace />}
          />
          <Route
            path="/verify-code"
            element={
              <BlankLayout>
                <VerificationCodePage />
              </BlankLayout>
            }
          />

          {/* SAD: /onboarding/:role?step=n */}
          <Route
            path="/onboarding/:role"
            element={
              <BlankLayout>
                <OnboardingWizard />
              </BlankLayout>
            }
          />
          <Route
            path="/onboarding"
            element={<Navigate to="/onboarding/student?step=2" replace />}
          />

          <Route
            path="*"
            element={
              <BlankLayout>
                <NotFound />
              </BlankLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
