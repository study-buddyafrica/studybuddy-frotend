import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaCookie } from "react-icons/fa";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(null);

  useEffect(() => {
    const consentStatus = localStorage.getItem("cookieConsent");
    console.log("Stored Consent Status:", consentStatus);

    if (consentStatus === "accepted" || consentStatus === "declined") {
      setHasConsented(consentStatus); // Set state to reflect stored consent
    } else {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3s if no consent is found
    }
  }, []);

  const handleConsent = (accepted) => {
    const status = accepted ? "accepted" : "declined";
    localStorage.setItem("cookieConsent", status);
    setHasConsented(status);
    setIsVisible(false);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && hasConsented === null && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto max-w-md bg-gradient-to-br from-blue-100 to-purple-100 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20 z-50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaCookie className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Cookie Preferences
              </h3>
            </div>
            <button
              onClick={() => handleConsent(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6 font-josefin">
            We use cookies to enhance your experience. By continuing to visit
            this site, you agree to our use of cookies.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleConsent(true)}
              className="px-5 py-2.5  rounded-full transition-all duration-300 bg-gradient-to-r from-[#01B0F1] to-[#015575] hover:from-[#015575] hover:to-[#01B0F1] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Accept All
            </button>
            <button
              onClick={() => handleConsent(false)}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
