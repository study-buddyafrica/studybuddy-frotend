import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizeRole } from "../utils/onboardingRoutes";

/**
 * Legacy /verify-code → canonical onboarding step 1
 */
const VerificationCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = normalizeRole(
      location.state?.role ||
        location.state?.registrationData?.role ||
        sessionStorage.getItem("userRole") ||
        "student",
    );
    navigate(`/onboarding/${role}?step=1`, {
      replace: true,
      state: location.state,
    });
  }, [navigate, location.state]);

  return null;
};

export default VerificationCodePage;
