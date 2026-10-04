import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

const faqData = [
  {
    question: "What is StudyBuddy Africa?",
    answer:
      "An online platform that connects learners with verified educators for curriculum-aligned lessons, live classes, and practice.",
  },
  {
    question: "How do I book a tutor?",
    answer:
      "Browse educators, open a profile, and book a session. You’ll need an account to confirm the booking.",
  },
  {
    question: "What subjects do you offer?",
    answer:
      "Math, science, English, languages, exam prep, and more — depending on available verified teachers.",
  },
  {
    question: "How much do tutors charge?",
    answer:
      "Rates are set by educators and shown on their profiles before you book.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "If a session doesn’t meet expectations, contact support. Terms on our policies page apply.",
  },
  {
    question: "Will it work on a low-cost phone?",
    answer:
      "Yes. The product is mobile-first; short video lessons are designed for limited data.",
  },
];

const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqData.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-20">
      {/* Header band */}
      <section className="border-b border-[#01B0F1]/10 bg-white pb-10 pt-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#01B0F1]/10 text-[#01B0F1]">
            <FaQuestionCircle className="text-2xl" />
          </div>
          <h1 className="font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            Help center
          </h1>
          <p className="mt-2 font-josefin text-[#4a6b7d]">
            Short answers to common questions about StudyBuddy Africa.
          </p>
          <div className="relative mx-auto mt-8 max-w-lg">
            <input
              type="search"
              placeholder="Search questions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 font-josefin text-[#015575] outline-none focus:border-[#01B0F1] focus:ring-2 focus:ring-[#01B0F1]/20"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <p className="py-8 text-center font-josefin text-[#4a6b7d]">
              No matches. Try a different word.
            </p>
          ) : (
            filteredFaqs.map((item, index) => {
              const open = activeIndex === index;
              return (
                <motion.div
                  key={item.question}
                  layout
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-josefin text-sm font-semibold text-[#015575] sm:text-base">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#01B0F1]/10 text-[#01B0F1] transition ${
                        open ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown className="text-sm" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-gray-50 px-5 pb-4 pt-2 font-josefin text-sm leading-relaxed text-[#4a6b7d]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#015575] to-[#01B0F1] px-6 py-8 text-center text-white">
          <p className="font-josefin text-sm text-white/90">Still need help?</p>
          <p className="mt-1 font-lilita text-xl">We’re here for you</p>
          <Link
            to="/signup"
            className="mt-4 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#015575] hover:bg-[#e1f3ff]"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
