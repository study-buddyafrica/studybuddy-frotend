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
  FaChevronDown,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { title: "Home", icon: <FaHome />, path: "/home" },
  { title: "FAQs", icon: <FaQuestionCircle />, path: "/faq" },
  {
    title: "Programs",
    icon: <FaGraduationCap />,
    dropdown: [
      {
        title: "Primary and Secondary",
        path: "/signup",
        state: { role: "student", education_level: "k-12" },
        icon: <FaGraduationCap />,
      },
      {
        title: "University and Higher Ed",
        path: "/signup",
        state: { role: "student", education_level: "university" },
        icon: <FaGraduationCap />,
      },
      {
        title: "Continuous Learning",
        path: "/signup",
        state: { role: "student", education_level: "continuous" },
        icon: <FaGraduationCap />,
      },
    ],
  },
  {
    title: "Sign Up",
    icon: <FaUserPlus />,
    dropdown: [
      {
        title: "Parent Account",
        path: "/signup",
        state: { role: "parent" },
        icon: <FaUsers />,
      },
      {
        title: "Student Account",
        path: "/signup",
        state: { role: "student" },
        icon: <FaGraduationCap />,
      },
      {
        title: "Teacher Account",
        path: "/signup",
        state: { role: "teacher" },
        icon: <FaChalkboardTeacher />,
      },
    ],
  },
];

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 700);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      } font-lilita`}>
      <div className="container mx-auto px-6 py-1">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/home"
            className="flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-[65px] w-auto"
            />
          </Link>

          {/* Desktop Nav — all items rendered uniformly */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() =>
                  item.dropdown && setOpenDropdown(item.title)
                }
                onMouseLeave={() => item.dropdown && setOpenDropdown(null)}>
                {!item.dropdown ? (
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#015575] hover:bg-[#01B0F1]/10 transition-all relative group">
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#01B0F1] transition-all duration-300 group-hover:w-full" />
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#015575] hover:bg-[#01B0F1]/10 transition-all focus:outline-none focus:ring-0">
                    {item.icon}
                    <span>{item.title}</span>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-200 ${
                        openDropdown === item.title ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}

                {item.dropdown && (
                  <AnimatePresence>
                    {openDropdown === item.title && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-0.5 w-56 bg-white rounded-xl shadow-2xl z-50 ">
                        <div className="p-2 space-y-1 font-josefin">
                          {item.dropdown.map((sub) => (
                            <Link
                              key={sub.title}
                              to={sub.path}
                              state={sub.state || undefined}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors">
                              {sub.icon}
                              <span>{sub.title}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}

            {/* Login */}
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 ml-2 rounded-full bg-gradient-to-r from-[#01B0F1] to-[#027fad] hover:from-[#027fad] hover:to-[#01B0F1] text-white shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-0">
              <FaSignInAlt className="text-lg shrink-0" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="text-2xl p-2.5 rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-0">
              {mobileMenuOpen ? (
                <FaTimes className="text-[#015575]" />
              ) : (
                <FaBars className="text-[#015575]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute w-full bg-white/95 backdrop-blur-lg shadow-xl">
            <div className="px-6 py-5">
              <ul className="flex flex-col space-y-5">
                {[
                  { title: "Home", icon: <FaHome />, path: "/home" },

                  { title: "FAQs", icon: <FaQuestionCircle />, path: "/faq" },
                ].map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 text-[#015575] hover:text-[#01B0F1] p-3 rounded-xl transition-colors">
                      {item.icon}
                      <span className="text-lg font-medium">{item.title}</span>
                    </Link>
                  </li>
                ))}

                <li>
                  <div className="rounded-2xl bg-[#f8fbff]/80">
                    <button
                      type="button"
                      onClick={() => setMobileProgramsOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-[#015575] transition-colors focus:outline-none focus:ring-0">
                      <div className="flex items-center gap-3">
                        <FaGraduationCap className="text-lg" />
                        <span className="text-lg font-medium">Programs</span>
                      </div>
                      <FaChevronDown
                        className={`text-lg transition-transform duration-200 ${
                          mobileProgramsOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileProgramsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6 px-4 pb-4 pt-2 border-t shadow-md border-[#e1f3ff]">
                          <Link
                            to="/signup"
                            state={{ role: "student", education_level: "k-12" }}
                            className="block text-[#015575] hover:text-[#01B0F1] transition-colors">
                            Primary and Secondary
                          </Link>
                          <Link
                            to="/signup"
                            state={{
                              role: "student",
                              education_level: "university",
                            }}
                            className="block text-[#015575] hover:text-[#01B0F1] transition-colors">
                            University and Higher Ed
                          </Link>
                          <Link
                            to="/signup"
                            state={{
                              role: "student",
                              education_level: "continuous",
                            }}
                            className="block text-[#015575] hover:text-[#01B0F1] transition-colors">
                            Continuous Learning
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
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
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors">
                      <FaUsers className="text-lg shrink-0" />
                      <span>Parent</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "student" }}
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors">
                      <FaGraduationCap className="text-lg shrink-0" />
                      <span>Student</span>
                    </Link>
                    <Link
                      to="/signup"
                      state={{ role: "teacher" }}
                      className="flex items-center gap-3 px-4 py-3 text-[#015575] hover:bg-[#01B0F1]/10 rounded-lg transition-colors">
                      <FaChalkboardTeacher className="text-lg shrink-0" />
                      <span>Teacher</span>
                    </Link>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-[#01B0F1] to-[#027fad] text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
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
