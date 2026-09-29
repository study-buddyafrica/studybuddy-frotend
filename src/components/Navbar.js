import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { authStorage } from "../services/authStorage";

const programsDropdown = [
  {
    title: "Primary and Secondary",
    path: "/signup",
    state: { role: "student", education_level: "k-12" },
  },
  {
    title: "University and Higher Ed",
    path: "/signup",
    state: { role: "student", education_level: "university" },
  },
  {
    title: "Continuous Learning",
    path: "/signup",
    state: { role: "student", education_level: "continuous" },
  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    setIsAuthenticated(authStorage.isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname, location.hash]);

  // Scroll to section when landing on /home#...
  useEffect(() => {
    if (location.pathname !== "/home" && location.pathname !== "/") return;
    const id = location.hash?.replace("#", "");
    if (!id) return;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    authStorage.clearTokens();
    window.location.href = "/login";
  };

  /** Home sections: always go via /home#id so it works from any page */
  const goToHomeSection = (sectionId) => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    if (location.pathname === "/home" || location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `/home#${sectionId}`);
      } else {
        navigate(`/home#${sectionId}`);
      }
    } else {
      navigate(`/home#${sectionId}`);
    }
  };

  const linkClass =
    "text-base font-semibold text-[#015575]/90 hover:text-[#015575] transition-colors px-3 py-2.5";

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-[#f8fcff]/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/home" className="flex-shrink-0">
          <img
            src="/images/logo.png"
            alt="StudyBuddy"
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onClick={() => goToHomeSection("how-it-works")}
            className={linkClass}
          >
            How it works
          </button>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("programs")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              className={`${linkClass} inline-flex items-center gap-1.5`}
            >
              Programs
              <FaChevronDown className="text-xs opacity-60" />
            </button>
            <AnimatePresence>
              {openDropdown === "programs" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full z-50 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-lg"
                >
                  {programsDropdown.map((item) => (
                    <Link
                      key={item.title}
                      to={item.path}
                      state={item.state}
                      className="block px-4 py-3 text-base text-[#015575] hover:bg-[#01B0F1]/10"
                    >
                      {item.title}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Must match App.js route — change if your path is different */}
          <Link to="/tutors" className={linkClass}>
            Educators
          </Link>

          <button
            type="button"
            onClick={() => goToHomeSection("lessons")}
            className={linkClass}
          >
            Lessons
          </button>

          <Link to="/faq" className={linkClass}>
            FAQs
          </Link>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-base font-medium text-[#015575] hover:text-[#01B0F1]"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-base font-medium text-[#015575] hover:text-[#01B0F1]"
            >
              Log in
            </Link>
          )}
          <Link
            to="/signup"
            className="rounded-full bg-[#01B0F1] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#015575]"
          >
            Start learning free
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2.5 text-[#015575] lg:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <button
                type="button"
                onClick={() => goToHomeSection("how-it-works")}
                className="block w-full rounded-lg px-3 py-3 text-left text-base font-medium text-[#015575]"
              >
                How it works
              </button>
              <Link
                to="/tutors"
                className="block rounded-lg px-3 py-3 text-base font-medium text-[#015575]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Educators
              </Link>
              <button
                type="button"
                onClick={() => goToHomeSection("lessons")}
                className="block w-full rounded-lg px-3 py-3 text-left text-base font-medium text-[#015575]"
              >
                Lessons
              </button>
              <Link
                to="/faq"
                className="block rounded-lg px-3 py-3 text-base font-medium text-[#015575]"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQs
              </Link>

              <div className="border-t border-gray-100 pt-3">
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Programs
                </p>
                {programsDropdown.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    state={item.state}
                    className="block rounded-lg px-3 py-3 text-base text-[#015575]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-3 text-left text-base font-medium text-[#015575]"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-3 text-base font-medium text-[#015575]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
                <Link
                  to="/signup"
                  className="rounded-full bg-[#01B0F1] py-3.5 text-center text-base font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start learning free
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
