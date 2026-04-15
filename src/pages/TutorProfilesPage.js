import React from "react";
import { FaGraduationCap, FaComments } from "react-icons/fa";
import { motion } from "framer-motion";

const TutorProfilesPage = () => {
  const tutors = [
    {
      id: 1,
      name: "Kwamboka Abigael",
      bio: "A passionate educator with over 10 years of experience teaching mathematics and science. Committed to helping students reach their full potential.",
      qualifications: [
        "M.Sc. in Mathematics",
        "Certified Science Teacher",
        "10+ Years Experience",
      ],
      subjects: ["Math", "Physics", "Chemistry"],
      rating: 4.5,
      reviews: [
        {
          student: "Alice",
          comment: "Great teacher, explains concepts clearly!",
        },
        { student: "Bob", comment: "Very patient and knowledgeable." },
        {
          student: "Charlie",
          comment: "Helped me improve my grades significantly.",
        },
      ],
      image: "images/teacher4.jpg",
    },
    {
      id: 2,
      name: "Peace Omondi",
      bio: "Specializing in languages, Peace brings 3 years of teaching experience and a unique approach to learning.",
      qualifications: [
        "B.A. in English Literature",
        "TESOL Certification",
        "3+ Years Experience",
      ],
      subjects: ["English", "Spanish", "French"],
      rating: 4.7,
      reviews: [
        {
          student: "David",
          comment: "A fantastic teacher who makes learning fun!",
        },
        {
          student: "Emma",
          comment: "Her lessons are engaging and well-structured.",
        },
      ],
      image: "images/teacher2.jpg",
    },
    {
      id: 3,
      name: "Kamau Mwangi",
      bio: "An experienced coding instructor who helps students build real-world projects with Python and JavaScript.",
      qualifications: [
        "B.S. in Computer Science",
        "Certified Web Developer",
        "8+ Years Experience",
      ],
      subjects: ["Programming", "Web Development", "Python"],
      rating: 4.8,
      reviews: [
        {
          student: "Michael",
          comment:
            "Samuel is an excellent tutor. His explanations are easy to follow!",
        },
        {
          student: "Sarah",
          comment: "I learned a lot from his programming tutorials.",
        },
      ],
      image: "images/teacher3.jpg",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] pt-24">
      {/* Header with Animated Gradient */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-[#015575] to-[#01B0F1] text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-lilita mb-4">
            Meet Our <span className="text-[#aadfff]">Expert Tutors</span>
          </h1>
          <p className="text-lg font-josefin max-w-2xl mx-auto">
            Connect with certified educators passionate about your success
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-8 max-w-3xl mx-auto bg-white/20 backdrop-blur-sm rounded-full p-2 flex gap-2">
            <input
              type="text"
              placeholder="Search tutors or subjects..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/80 px-6 focus:ring-0"
            />
            <button className="bg-white text-[#015575] px-8 py-3 rounded-full font-semibold hover:bg-[#e1f3ff] transition-all">
              Search
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Tutor Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tutors.map((tutor, index) => (
          <motion.div
            key={tutor.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border border-white/20">
            {/* Profile Header */}
            <div className="relative h-40 bg-gradient-to-r from-[#01B0F1]/10 to-[#015575]/10">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Tutor Content */}
            <div className="pt-16 px-6 pb-6 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#015575] font-lilita">
                  {tutor.name}
                </h2>
                <p className="text-sm text-gray-600 mt-2 font-josefin">
                  {tutor.bio}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                  <div className="text-xl font-bold text-[#015575] font-lilita">
                    {tutor.rating}
                  </div>
                  <div className="text-xs text-[#015575] font-josefin">
                    Rating
                  </div>
                </div>
                <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                  <div className="text-xl font-bold text-[#015575] font-lilita">
                    {tutor.subjects.length}+
                  </div>
                  <div className="text-xs text-[#015575] font-josefin">
                    Subjects
                  </div>
                </div>
                <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                  <div className="text-xl font-bold text-[#015575] font-lilita">
                    {tutor.qualifications.length}
                  </div>
                  <div className="text-xs text-[#015575] font-josefin">
                    Certs
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#015575] font-lilita">
                  <FaGraduationCap className="text-xl" />
                  <h3 className="text-lg font-semibold">Qualifications</h3>
                </div>
                <ul className="space-y-2 font-josefin text-gray-700">
                  {tutor.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-[#01B0F1] rounded-full" />
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#015575] font-lilita">
                  <FaComments className="text-xl" />
                  <h3 className="text-lg font-semibold">Student Feedback</h3>
                </div>
                <div className="space-y-3">
                  {tutor.reviews.map((review, i) => (
                    <div key={i} className="bg-[#01B0F1]/5 p-3 rounded-lg">
                      <p className="text-sm font-josefin text-gray-700">
                        "{review.comment}"
                      </p>
                      <p className="text-xs text-[#015575] mt-2 font-semibold">
                        - {review.student}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 rounded-xl font-lilita hover:shadow-md transition-all">
                Book a Session
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfilesPage;
