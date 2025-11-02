import React from 'react';


const PrivacyPolicy = () => {
  return (
    <>
     
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-josefin">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3 font-lilita">Privacy Policy</h1>
            <div className="h-1.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] w-24 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-gray-600">
              Effective Date: <span className="font-semibold">28/10/2025</span>
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-[#F0F7FF] p-6 rounded-xl mb-10 border-l-4 border-[#4F46E5]">
            <p className="text-lg leading-relaxed text-gray-700">
              Welcome to StudyBuddy Africa. Your trust is important to us. This Privacy Policy explains how we collect, use, share, and protect your personal data when you interact with our platform (website, mobile apps, and digital services). We comply with Google's Privacy Policy requirements for all integrated Google services.
            </p>
          </div>

          {/* Google Compliance Notice */}
          <div className="bg-[#FFFBEB] border-l-4 border-[#FBBF24] p-6 rounded-xl mb-10">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F59E0B] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold text-[#92400E] mb-2 font-lilita">Google Privacy Compliance</h3>
                <div className="mt-2 text-[#B45309]">
                  <p>StudyBuddy Africa integrates Google services including:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Google Sign-In authentication</li>
                    <li>Google Analytics for service improvement</li>
                    <li>Google Cloud Platform for data storage</li>
                  </ul>
                  <p className="mt-3">
                    We adhere to Google's API Services User Data Policy and Limited Use Requirements. 
                    We do not share Google user data with third parties except for essential service operation. 
                    <a 
                      href="https://policies.google.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4F46E5] hover:underline ml-1 font-semibold"
                    >
                      View Google's Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Who We Are */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">1. Who We Are</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-4">
                  StudyBuddy Africa ("we," "us," "our") is an edtech platform dedicated to delivering inclusive and accessible educational content for learners across Africa. Our mission is to bridge the digital learning divide using technology.
                </p>
                <div className="bg-[#F9FAFB] p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 font-lilita">Contact Details:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F46E5] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email: support@studybuddy.africa</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F46E5] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Phone: +254790624153</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F46E5] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Registered office: IHUB, Jahazi Building</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">2. Information We Collect</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-5">
                  We collect information to deliver better services to all our users. Unlike Google, we do not serve ads or collect data for advertising purposes.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      You Provide
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      {['Name', 'Email address', 'Phone number', 'Age and grade level', 'School information (optional)', 'Payment information (for premium)'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#4F46E5] mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Automatic
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      {['Device type and browser', 'Log data (IP address, etc.)', 'Learning activity', 'Cookies and similar technologies'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#4F46E5] mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Third Parties
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      {['Basic profile from Google Sign-In', 'Analytics data from Google', 'Only with your permission'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#4F46E5] mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">3. How We Use Your Information</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-5">
                  We use your data for educational purposes only and in compliance with Google's Limited Use Requirements for integrated services.
                </p>
                
                <div className="mt-5 bg-gradient-to-r from-[#F0F7FF] to-[#E0F2FE] p-6 rounded-xl border border-[#DBEAFE]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-[#4F46E5] mb-3 font-lilita">Primary Uses</h3>
                      <ul className="space-y-3 text-gray-600">
                        {[
                          "Provide and improve learning experiences",
                          "Personalize your study recommendations",
                          "Communicate platform updates"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start">
                            <div className="bg-[#4F46E5] rounded-full p-1 mr-3 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-[#4F46E5] mb-3 font-lilita">Compliance & Security</h3>
                      <ul className="space-y-3 text-gray-600">
                        {[
                          "Support analytics and performance tracking",
                          "Comply with legal obligations",
                          "Enhance platform security"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start">
                            <div className="bg-[#4F46E5] rounded-full p-1 mr-3 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white p-4 rounded-lg border border-[#DBEAFE] shadow-sm">
                    <p className="text-gray-700 font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      We do not sell your personal data or use it for advertising purposes
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Share Your Information */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">4. How We Share Your Information</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      With Consent
                    </h3>
                    <p className="text-gray-600">
                      When you join a school group or request mentorship
                    </p>
                  </div>
                  
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Service Providers
                    </h3>
                    <p className="text-gray-600">
                      Cloud storage or payment gateways (under strict contracts)
                    </p>
                  </div>
                  
                  <div className="bg-[#F0F7FF] p-5 rounded-lg border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-3 flex items-center font-lilita">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Legal Reasons
                    </h3>
                    <p className="text-gray-600">
                      When required by law or to protect our platform
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-5 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    We do not allow data brokers, advertisers, or unknown third parties to access your data
                  </p>
                </div>
              </div>
            </section>

            {/* Your Privacy Controls */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">5. Your Privacy Controls</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-6">
                  You have full control over your personal information. We provide easy-to-use tools to manage your privacy settings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 font-lilita">Account Controls</h3>
                    <ul className="space-y-4">
                      {[
                        {icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", text: "Update profile information anytime"},
                        {icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", text: "View your complete learning history"},
                        {icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", text: "Adjust notification preferences"}
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="bg-[#F0F7FF] rounded-lg p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                          </div>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 font-lilita">Data Management</h3>
                    <ul className="space-y-4">
                      {[
                        {icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", text: "Request data export in standard formats"},
                        {icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", text: "Request complete data deletion"},
                        {icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", text: "Opt-out of marketing communications"}
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="bg-[#F0F7FF] rounded-lg p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                          </div>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 bg-[#F0F7FF] rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    To exercise any of these rights, please contact our support team:
                  </p>
                  <a 
                    href="mailto:support@studybuddy.africa" 
                    className="inline-flex items-center bg-[#4F46E5] text-white px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors font-semibold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@studybuddy.africa
                  </a>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">6. Data Retention</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-6">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-gradient-to-br from-[#F0F7FF] to-[#E0F2FE] p-6 rounded-xl border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-4 font-lilita">Active Users</h3>
                    <p className="text-gray-600">
                      For active users, we retain data to support continuous learning and service improvement.
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-gradient-to-br from-[#F0F7FF] to-[#E0F2FE] p-6 rounded-xl border border-[#DBEAFE]">
                    <h3 className="font-semibold text-[#4F46E5] mb-4 font-lilita">Inactive Users</h3>
                    <p className="text-gray-600">
                      If your account remains inactive for 2 years, we will automatically anonymize or delete your personal data.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-5 bg-white rounded-xl border border-[#DBEAFE] shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 font-lilita">Your Control</h3>
                  <p className="text-gray-600">
                    You may request earlier deletion of your data at any time by contacting our support team. We will process deletion requests within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">7. Children's Privacy</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E0F2FE] rounded-xl p-6 border border-[#DBEAFE]">
                  <p className="text-gray-600 mb-4">
                    We are committed to protecting the privacy of children. Our platform is designed with minors in mind, avoiding exploitative features.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-5 rounded-lg border border-[#DBEAFE]">
                      <h3 className="font-semibold text-[#4F46E5] mb-3 font-lilita">Age Requirements</h3>
                      <p className="text-gray-600">
                        For users under 18, we require verifiable parental or guardian consent before collecting any personal information.
                      </p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-[#DBEAFE]">
                      <h3 className="font-semibold text-[#4F46E5] mb-3 font-lilita">Compliance</h3>
                      <p className="text-gray-600">
                        We comply with Kenya's Data Protection Act, GDPR Article 8, and COPPA regulations regarding children's data.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Parents or guardians can review their child's personal information, request deletion, or refuse further collection by contacting our support team.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Protect Your Data */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">8. How We Protect Your Data</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <p className="text-gray-600 mb-6">
                  Your data security is our top priority. We implement comprehensive technical and organizational measures to protect your information.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="bg-[#F0F7FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 font-lilita">Encryption</h3>
                    <p className="text-gray-600">
                      All data transmissions are encrypted using HTTPS/SSL protocols to prevent interception.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="bg-[#F0F7FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 font-lilita">Secure Infrastructure</h3>
                    <p className="text-gray-600">
                      Data is stored in secure cloud environments with enterprise-grade protection.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="bg-[#F0F7FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 font-lilita">Access Controls</h3>
                    <p className="text-gray-600">
                      Strict access controls and regular security audits ensure only authorized personnel access data.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 bg-[#F0F7FF] p-6 rounded-xl">
                  <p className="text-gray-700 mb-4">
                    We conduct regular security training for all staff and implement continuous monitoring to detect and prevent security incidents.
                  </p>
                  <p className="text-gray-700">
                    In the unlikely event of a data breach, we will notify affected users within 72 hours as required by law.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section className="group">
              <div className="flex items-start mb-4">
                <div className="w-2 h-12 bg-[#4F46E5] rounded-full mr-4 transform group-hover:scale-y-125 transition-all"></div>
                <h2 className="text-2xl font-bold text-gray-800 font-lilita">9. Changes to This Policy</h2>
              </div>
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-gray-600 mb-4">
                    We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, and other factors.
                  </p>
                  
                  <div className="flex items-start p-4 bg-[#F0F7FF] rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4F46E5] mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-700">
                      We will notify users via email or platform alerts at least 30 days before implementing major changes. The "Effective Date" at the top indicates when the latest revisions occurred.
                    </p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 font-semibold">
                      Last Updated: 28/10/2025
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-14 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-8 rounded-2xl text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-6 font-lilita">Contact Us</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <a href="mailto:support@studybuddy.africa" className="hover:underline">
                  support@studybuddy.africa
                </a>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>+254790624153</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span>IHUB, Jahazi Building</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} StudyBuddy Africa. All rights reserved.<br />
            Protecting Your Privacy, Ensuring Digital Safety
          </footer>
        </div>
      </div>
      
      <style jsx global>{`
        .font-lilita {
          font-family: 'Lilita One', cursive;
        }
        .font-josefin {
          font-family: 'Josefin Sans', sans-serif;
        }
      `}</style>
    </>
  );
};

export default PrivacyPolicy;