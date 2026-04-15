import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

const FaqPage = () => {
  const faqData = [
    {
      question: "What is Studybuddy?",
      answer:
        "Studybuddy is an online platform that connects students with expert tutors for various subjects and study help.",
    },
    {
      question: "How do I book a tutor?",
      answer:
        "You can browse our tutor listings, select a tutor based on your needs, and book a session directly through their profile.",
    },
    {
      question: "What subjects do you offer tutoring in?",
      answer:
        "We offer tutoring in a wide range of subjects including Math, Science, English, History, and more.",
    },
    {
      question: "How much do tutors charge?",
      answer:
        "Our tutors set their own rates, but you can view pricing on their profiles before booking a session.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes, we offer a money-back guarantee if you are not satisfied with your session. Please refer to our terms for more details.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = faqData.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <FaQuestionCircle className="text-4xl text-[#01B0F1]" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#015575] font-lilita">
              Help Center
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-josefin max-w-2xl mx-auto">
            Find answers to common questions about StudyBuddy
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl outline-none border-2 border-[#01B0F1]/20 focus:border-[#01B0F1] focus:ring-0 font-josefin placeholder-gray-400"
              />
              <FaQuestionCircle className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* FAQ Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#01B0F1] to-[#015575]">
            <img
              src="/images/faq.png"
              alt="FAQ Illustration"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h2 className="text-3xl font-bold text-white font-lilita text-center">
                We're Here to Help You Succeed!
              </h2>
            </div>
          </motion.div>

          {/* FAQ List */}
          <div className="space-y-6">
            {filteredFaqs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleAnswer(index)}>
                  <h2 className="text-lg font-semibold text-[#015575] font-lilita pr-4">
                    {item.question}
                  </h2>
                  <motion.span
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    className="text-[#01B0F1]">
                    <FaChevronDown />
                  </motion.span>
                </div>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="px-6 pb-6 pt-2 border-t border-[#01B0F1]/10">
                        <p className="text-gray-600 font-josefin leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 font-josefin mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="bg-[#01B0F1] text-white px-8 py-3 rounded-xl font-lilita hover:bg-[#015575] transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
