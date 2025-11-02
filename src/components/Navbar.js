import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaQuestionCircle,
  FaUserPlus,
  FaSignInAlt,
  FaUsers,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 700);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu if clicking outside of nav
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className={`fixed w-full z-50 transition-all duration-0 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff]"
      } font-lilita`}
    >
      <div className="container mx-auto px-6 py-1">
        <div className="flex items-center justify-between">
          {/* Logo with hover effect */}
          <Link
            to="/home"
            className="flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-[65px] w-auto"
            />
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <ul className="flex space-x-12">
              {[
                { title: "Home", icon: <FaHome />, path: "/home" },
                {
                  title: "Tutors",
                  icon: <FaChalkboardTeacher />,
                  path: "/tutors",
                },
                { title: "FAQs", icon: <FaQuestionCircle />, path: "/faq" },
              ].map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className={`flex items-center text-lg gap-2 group ${
                      scrolled ? "text-[#015575]" : "text-[#015575]"
                    } relative transition-colors`}
                  >
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#01B0F1] transition-all duration-300 group-hover:w-full"></span>
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Enhanced Auth Buttons */}
            <div className="flex items-center gap-6 font-josefin">
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all ${
                    scrolled
                      ? "text-[#015575] hover:bg-[#01B0F1]/10"
                      : "text-[#015575] hover:bg-white/20"
                  }`}
                >
                  <FaUserPlus className="text-lg shrink-0" />
                  <span>Sign Up</span>
                </button>

                {/* Enhanced Dropdown */}
                <div className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-100/50">
                  <div className="p-2 space-y-1">
                    <Link
                      to="/signup"
                      state={{ role: "parent" }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaUsers className="text-lg shrink-0" />
                      <span>Parent Account</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "student" }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaGraduationCap className="text-lg shrink-0" />
                      <span>Student Account</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "teacher" }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaChalkboardTeacher className="text-lg shrink-0" />
                      <span>Teacher Account</span>
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all ${
                  scrolled
                    ? "bg-gradient-to-r from-[#01B0F1] to-[#027fad] hover:from-[#027fad] hover:to-[#01B0F1] text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-[#01B0F1] to-[#027fad] text-white shadow-lg hover:shadow-xl"
                }`}
              >
                <FaSignInAlt className="text-lg shrink-0" />
                <span>Login</span>
              </Link>
            </div>
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="text-2xl p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-200"
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-[#015575]" />
              ) : (
                <FaBars className="text-[#015575]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute w-full bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-100/50"
          >
            <div className="px-6 py-5">
              <ul className="flex flex-col space-y-5">
                {[
                  { title: "Home", icon: <FaHome />, path: "/home" },
                  {
                    title: "Tutors",
                    icon: <FaChalkboardTeacher />,
                    path: "/tutor",
                  },
                  { title: "FAQs", icon: <FaQuestionCircle />, path: "/faq" },
                ].map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 text-[#015575] hover:text-[#01B0F1] p-3 rounded-xl transition-colors"
                    >
                      {item.icon}
                      <span className="text-lg font-medium">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#015575] px-3">
                    Create Account
                  </h4>
                  <div className="space-y-2">
                    <Link
                      to="/signup"
                      state={{ role: "parent" }}
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaUsers className="text-lg shrink-0" />
                      <span>Parent</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "student" }}
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaGraduationCap className="text-lg shrink-0" />
                      <span>Student</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "teacher" }}
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors"
                    >
                      <FaChalkboardTeacher className="text-lg shrink-0" />
                      <span>Teacher</span>
                    </Link>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-[#01B0F1] to-[#027fad] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <FaSignInAlt className="text-lg" />
                  <span className="font-medium">Login to Account</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
