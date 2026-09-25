import React from "react"; // 'React' is declared but its value is never read.
import OnboardingWizard from "../components/onboarding/OnboardingWizard";

/**
 * VerificationCodePage: Mounts the 4-step student onboarding wizard at Step 1.
 */
const VerificationCodePage = () => {
  return <OnboardingWizard initialStep={1} />;
};

export default VerificationCodePage;
