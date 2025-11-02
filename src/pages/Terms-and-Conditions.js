import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header with Logo */}
        <div className="text-center mb-10">
          <img 
            src="/images/logo.png" 
            alt="StudyBuddy Africa Logo" 
            className="h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-lilita">
            Terms and Conditions
          </h1>
          <div className="h-1.5 bg-[#02E9FB] w-24 mx-auto mb-6 rounded-full"></div>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 p-6 rounded-xl mb-12 border-l-4 border-[#02E9FB]">
          <p className="text-lg leading-relaxed text-gray-700 font-josefin">
            Welcome to StudyBuddy Africa. These Terms and Conditions ("Terms") 
            govern your access and use of our platform, website, and mobile application. 
            By accessing our services, you agree to be bound by these Terms. If you do not 
            agree, please discontinue using our platform immediately.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-12">
          {[
            {
              title: "1. User Eligibility & Registration",
              content: [
                "You must be at least 13 years old to create an account. If under 18, parental or guardian consent is required.",
                "Accurate and complete registration information must be provided, and any false details may lead to account termination.",
                "Users are responsible for maintaining the confidentiality of their login credentials."
              ],
            },
            {
              title: "2. Acceptable Use Policy",
              content: [
                "You agree not to engage in any activity that violates laws, regulations, or ethical standards.",
                "Prohibited activities include: hacking, spamming, distributing harmful content, harassment, and infringement of intellectual property.",
                "Users must respect others' rights and avoid offensive or inappropriate behavior on the platform."
              ],
            },
            {
              title: "3. Intellectual Property Rights",
              content: [
                "All content, including text, graphics, and logos, is the intellectual property of StudyBuddy Africa and is protected under copyright law.",
                "Users may not reproduce, distribute, or modify platform content without prior authorization.",
                "Study materials may be used solely for personal, non-commercial purposes."
              ],
            },
            {
              title: "4. Privacy & Data Protection",
              content: [
                "User data is collected and processed in accordance with our Privacy Policy.",
                "We implement strict security measures to protect personal information.",
                "Parental consent is required before collecting or processing children's personal data."
              ],
            },
            {
              title: "5. Account Termination & Suspension",
              content: [
                "StudyBuddy Africa reserves the right to suspend or terminate accounts that violate these Terms.",
                "Accounts engaged in fraudulent, abusive, or illegal activities will be permanently banned.",
                "Users may request account deletion by contacting our support team."
              ],
            },
            {
              title: "6. Limitation of Liability",
              content: [
                "StudyBuddy Africa is not responsible for any damages resulting from service interruptions, data loss, or unauthorized account access.",
                "We provide educational materials 'as is' without guarantees of accuracy or reliability.",
                "Users assume full responsibility for their actions while using our platform."
              ],
            },
            {
              title: "7. Changes to Terms",
              content: [
                "We reserve the right to modify these Terms at any time.",
                "Users will be notified of significant changes via email or in-app notifications.",
                "Continued use of the platform after modifications constitutes acceptance of the revised Terms."
              ],
            },
            {
              title: "8. Governing Law & Dispute Resolution",
              content: [
                "These Terms are governed by the laws of Kenya.",
                "Any disputes will be resolved through negotiation, mediation, or arbitration before legal action.",
                "Users agree to submit to the jurisdiction of Kenyan courts for any unresolved disputes."
              ],
            },
          ].map((section, index) => (
            <section key={index} className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#02E9FB] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">
                  {section.title}
                </h2>
              </div>

              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-600 font-josefin">
                      <span className="text-[#02E9FB] mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-14 bg-gradient-to-r from-[#02E9FB] to-blue-400 p-8 rounded-2xl text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-6 font-lilita">Contact Us</h2>
          <div className="space-y-4 font-josefin">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <a href="mailto:support@studybuddy.africa" className="hover:underline">
                support@studybuddy.africa
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-grey-200 to-blue-400 mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm font-josefin">
          © {new Date().getFullYear()} StudyBuddy Africa. All rights reserved.<br />
          Committed to Quality Education & Safe Digital Learning
        </footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;
