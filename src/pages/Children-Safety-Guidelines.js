import React from "react";

const SafetyGuidelines = () => {
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
            Online Children's Safety Guidelines
          </h1>
          <div className="h-1.5 bg-[#02E9FB] w-24 mx-auto mb-6 rounded-full"></div>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 p-6 rounded-xl mb-12 border-l-4 border-[#02E9FB]">
          <p className="text-lg leading-relaxed text-gray-700 font-josefin">
            At StudyBuddy Africa, the safety and protection of children online is our top priority. 
            We adhere to the highest standards of digital safety in compliance with Kenyan legislation, 
            ensuring a secure learning environment for all young users.
          </p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-12">
          {[
            {
              title: "Protection from Harmful Content",
              laws: [
                "Section 18, Children Act, 2022: Protects children from harmful information, whether online or offline.",
                "Section 24, Computer Misuse and Cybercrimes Act, 2018: Criminalizes the creation, possession, or distribution of child pornography.",
              ],
              commitments: [
                "Use of automated filters and human moderation to ensure age-appropriate content.",
                "Prohibition of harmful content on forums and user-generated content areas.",
              ],
            },
            {
              title: "Personal Data Protection",
              laws: [
                "Section 25, Data Protection Act, 2019: Provides for the protection of personal data and the right to privacy.",
                "Section 30, Data Protection Act, 2019: Requires parental consent for processing children's data.",
              ],
              commitments: [
                "Obtain parental consent before collecting children’s data.",
                "Do not share children’s data with third parties.",
                "Use encryption and security measures to protect children’s personal data.",
              ],
            },
            {
              title: "Cyberbullying and Harassment Prevention",
              laws: [
                "Section 22, Computer Misuse and Cybercrimes Act, 2018: Criminalizes cyber harassment.",
                "Section 29, Kenya Information and Communications Act, 1998: Prohibits sending offensive messages.",
              ],
              commitments: [
                "Zero-tolerance policy on bullying and harassment.",
                "Accessible reporting system for cyberbullying cases.",
                "Awareness campaigns on cyberbullying risks and safety tips.",
              ],
            },
            {
              title: "Parental Control and Supervision",
              laws: ["Cybersecurity and Protection of Children Online Guidelines: Recommends parental control tools."],
              commitments: [
                "Tools for parents to monitor children’s activity and restrict content.",
                "Educational resources for parents on online safety.",
              ],
            },
            {
              title: "Prohibition of Child Exploitation and Abuse",
              laws: [
                "Section 13, Children Act, 2022: Protects children from exploitation and abuse.",
                "Section 164, Penal Code: Prohibits exposing minors to indecent materials.",
              ],
              commitments: [
                "Monitor communications to detect and prevent grooming.",
                "Investigate and report exploitation cases to law enforcement.",
              ],
            },
            {
              title: "Cybersecurity and Data Breach Prevention",
              laws: [
                "National Cybersecurity Strategy (2022): Emphasizes the protection of vulnerable groups, including children.",
                "Data Protection Act, 2019: Provides a framework for secure handling of personal data.",
              ],
              commitments: [
                "Use encryption and secure servers to protect user data.",
                "Regular security audits and vulnerability assessments.",
                "Immediate notification in case of data breaches.",
              ],
            },
            {
              title: "Reporting Mechanism and Legal Recourse",
              laws: ["Children Act, 2022: Provides children the right to report abuse or exploitation."],
              commitments: [
                "Dedicated 'Report Abuse' button for easy reporting.",
                "Collaborate with legal authorities to address any illegal activities affecting children.",
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2 font-lilita">
                  Applicable Law:
                </h3>
                <ul className="space-y-3 mb-6">
                  {section.laws.map((law, i) => (
                    <li key={i} className="flex items-start text-gray-600 font-josefin">
                      <span className="text-[#02E9FB] mr-2">▹</span>
                      {law}
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-gray-700 mb-2 font-lilita">
                  Our Commitment:
                </h3>
                <ul className="space-y-3">
                  {section.commitments.map((commitment, i) => (
                    <li key={i} className="flex items-start text-gray-600 font-josefin">
                      <span className="text-[#02E9FB] mr-2">•</span>
                      {commitment}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-14 bg-gradient-to-r from-[#02E9FB] to-blue-400 p-8 rounded-2xl text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-6 font-lilita">Contact Our Safety Team</h2>
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
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>[Insert Contact Number]</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              <span>[Insert Address]</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-grey-200 to-blue-400 mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm font-josefin">
          © {new Date().getFullYear()} StudyBuddy Africa. All rights reserved.<br />
          Committed to Safe Digital Learning Environments
        </footer>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
