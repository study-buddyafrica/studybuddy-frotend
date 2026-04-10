import React, { Suspense, lazy } from "react";
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

// Layouts
import MainLayout from "./components/layouts/MainLayout";
import BlankLayout from "./components/layouts/BlankLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import StudentLayout from "./components/layout/StudentLayout";
import MyWallet from "./components/students/MyWallet";
import MyLessons from "./components/students/MyLessons";
import TeacherProfiles from "./components/students/TeachersProfiles";

import StudentsHome from "./components/students/studentsHome";

// Teachers components
import TeacherLessons from "./components/teachers/MyLessons";
import TeacherLiveclass from "./components/teachers/Liveclass";
import TeacherAccount from "./components/teachers/MyAccount";
import TeacherUpcomingClasses from "./components/teachers/UpcomingClasses";
import TeacherScheduler from "./components/teachers/Scheduler";
import TeacherWallet from "./components/teachers/mywallet";

//Cookie Consent
import CookieConsent from "./components/CookieConsent";
import TeacherLayout from "./components/layout/TeacherLayout";
import UpcomingClasses from "./components/teachers/UpcomingClasses";

// Lazy-loaded Pages
const TutorProfilesPage = lazy(() => import("./pages/TutorProfilesPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const TestimonialPage = lazy(() => import("./pages/TestimonialPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const MeetTheTeamPage = lazy(() => import("./pages/MeetTheTeamPage"));
const LiveChatPage = lazy(() => import("./pages/LiveChatPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const StudentSignUpPage = lazy(() => import("./pages/StudentSignUpPage"));
const ParentSignUpPage = lazy(() => import("./pages/UniversalSignUpPage"));
const TeacherSignUpPage = lazy(() => import("./pages/TeacherSignUpPage"));
const VerificationCodePage = lazy(() => import("./pages/VerificationCodePage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const ChildrenSafetyGuidelines = lazy(
  () => import("./pages/Children-Safety-Guidelines"),
);
const TermsAndConditions = lazy(() => import("./pages/Terms-and-Conditions"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));

// Not Found Page
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded Dashboards
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard"));
const ParentDashboard = lazy(() => import("./components/ParentDashboard"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route Component - checks authentication and is_superuser
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is superuser (admin)
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      // Only allow access if is_superuser is explicitly true
      if (user.is_superuser !== true) {
        // Redirect non-admin users to their appropriate dashboard
        const role = user.role;
        if (role === "teacher") return <Navigate to="/teacher-dashboard" />;
        if (role === "student") return <Navigate to="/student-dashboard/" />;
        if (role === "parent") return <Navigate to="/parent-dashboard/home" />;
        return <Navigate to="/login" />;
      }
    } catch (e) {
      console.error("Error parsing userInfo:", e);
      return <Navigate to="/login" />;
    }
  } else {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <CookieConsent />
      <ToastContainer />
      <Suspense
        fallback={
          <div className="text-center text-blue-500">
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff]">
              <div className="relative flex flex-col items-center justify-center space-y-6">
                {/* Animated Circles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative h-24 w-24">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 border-4 border-blue-300 rounded-full animate-ping"></div>
                  <div className="absolute inset-8 border-4 border-blue-400 rounded-full"></div>
                </motion.div>

                {/* Animated Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-[#015575] font-lilita">
                    Loading
                  </span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [-5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="text-2xl text-[#01B0F1]">
                        .
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Floating Particles */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-[#01B0F1]/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#015575]/20 rounded-full blur-xl animate-float-delayed"></div>
              </div>
            </div>
          </div>
        }>
        <Routes>
          {/* Public Routes wrapped with MainLayout */}
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
                {" "}
                <Route
                  path="/confirm-email/:token"
                  element={
                    <MainLayout>
                      <ConfirmEmail />
                    </MainLayout>
                  }
                />
                <CookiesPolicy />
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
            }>
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

          {/* 404 Not Found Page wrapped with BlankLayout */}
          <Route
            path="*"
            element={
              <BlankLayout>
                <NotFound />
              </BlankLayout>
            }
          />

          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }></Route>

          <Route
            path="/teacher-dashboard/*"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }></Route>

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

          {/* Additional Features */}
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

          {/* Pages without Navbar/Footer */}
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
            path="/student-signup"
            element={
              <BlankLayout>
                <StudentSignUpPage />
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
            path="/teacher-signup"
            element={
              <BlankLayout>
                <TeacherSignUpPage />
              </BlankLayout>
            }
          />
          <Route
            path="/verify-code"
            element={
              <BlankLayout>
                <VerificationCodePage />
              </BlankLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
