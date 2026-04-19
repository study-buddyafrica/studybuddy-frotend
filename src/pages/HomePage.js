import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaQuoteRight,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaBookOpen,
  FaStar,
  FaUniversity,
  FaClock,
  FaYoutube,
  FaEye,
  FaCalendarAlt,
  FaTimes,
  FaPlay,
} from "react-icons/fa";
import "animate.css";
import ReactPlayer from "react-player";
import { BookOpenIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

import student1 from "../images/student-1.jpg";
import student2 from "../images/student-2.jpg";
import student3 from "../images/student-3.jpg";

const users = [
  {
    title: "Educator",
    role: "teacher",
    path: "/signup",
    image: "/images/tut.jpg",
    icon: FaChalkboardTeacher,
    description: "Empower students across Africa with your expertise",
    features: [
      "Flexible teaching schedule",
      "Student progress tracking",
      "Competitive compensation",
      "Professional development",
    ],
  },
  {
    title: "K-12 Student",
    education_level: "k-12",
    role: "student",
    path: "/signup",
    image: "/images/kid.jpg",
    icon: FaUserGraduate,
    description: "Unlock your potential with personalized learning experiences",
    features: [
      "One on One Lessons",
      "Expert tutors",
      "24/7 support",
      "Real-time progress tracking",
      "Educational video content",
    ],
  },
  {
    title: "Parent",
    role: "parent",
    path: "/signup",
    image: "/images/pare.jpg",
    icon: FaUserGraduate,
    description: "Monitor your child's academic progress and growth",
    features: [
      "Child report",
      "Parent-teacher communication",
      "Real-time progress tracking",
      "24/7 support",
    ],
  },
  {
    title: "University Scholar",
    education_level: "university",
    role: "student",
    path: "/signup",
    image: "/images/student2.png",
    icon: FaUserGraduate,
    description:
      "Access advanced resources and expert guidance for your academic journey",
    features: [
      "Access specialized tutors",
      "Collaborate on complex topics",
      "Master your degree",
    ],
  },
  {
    title: "Lifelong Learner",
    education_level: "continuous",
    role: "student",
    path: "/signup",
    image: "/images/student.jpg",
    icon: FaUserGraduate,
    description: " Expand your horizons with expert-led continuous learning",
    features: [
      "Upskill for your career",
      "Learn a new hobby with expert-led continuous learning.",
    ],
  },
];
const teachers = [
  {
    name: " Vincent makaya ",
    subject: " Mathematics and Integrated science ",
    school: " Lower kihara school",
    Experience: "15yr",
    imgSrc: "/images/vin.jpeg",
    experience: 15,
    rating: 4.9,
    students: 200,
    subjects: 2,
  },
  {
    name: "Mary Wanjiku",
    subject: "Mathematics",
    school: " Green Valley Secondary School",
    Experience: "7yr",
    imgSrc: "/images/teacher4.jpg",
    experience: 7,
    rating: 4.5,
    students: 100,
    subjects: 1,
  },
  {
    name: "Kamau Mwangi",
    subject: "Computer Tutor",
    school: "High School",
    grade: "All Grades",
    imgSrc: "/images/teacher3.jpg",
    experience: 8,
    rating: 4.9,
    students: 70,
    subjects: 1,
  },
];

const tutorials = [
  {
    id: 1,
    title: "Mathematics Basics",
    description: "Finding square root of numbers",
    thumbnail: "/images/math.jpg",
    url: "/videos/square.mp4",
    duration: "1:30",
    views: "2.5K",
    category: "Mathematics",
    date: "2025-03-15",
    difficulty: "Intermediate",
  },
  {
    id: 2,
    title: "English activities",
    description: "Reading sounds for kids",
    thumbnail: "/images/sound.jpg",
    url: "/videos/sound.mp4",
    duration: "1:00",
    views: "1.5K",
    category: "English",
    date: "2025-03-15",
    difficulty: "Intermediate",
  },
  {
    id: 3,
    title: "Play group",
    description: "Mastering tenses and sentence structures",
    thumbnail: "/images/snd.jpg",
    url: "/videos/snd.mp4",
    duration: "2:00",
    views: "3.2K",
    category: "English",
    date: "2025-01-17",
    difficulty: "Intermediate",
  },
];

const testimonials = [
  {
    name: "Vincent makaya",
    role: "mathematics and integrated science teacher",
    message:
      "As a mathematics and integrated science educator study buddy has offered me an opportunity to interact with all sorts of learners in different levels and different learning set ups. It provides a comprehensive and extensive range of science and mathematics materials covering various levels and topics. Am able to engage with learners through video lessons which enables us not only to get immediate feed backs but also break complex concepts into manageable chunks. The platform provides ample practice opportunities with step step solutions to help students navigate and focus on learning. This online platform is an excellent resource for both mathematics and  science  students and teachers. I recommend it to anyone who values quality and interesting learning.",
    imgSrc: "/images/vin.jpeg",
  },
  {
    name: "Mary Wanjiku",
    role: " Mathematics Teacher( Green Valley Secondary School)",
    message:
      "As a Mathematics teacher, StudyBuddy Africa has opened up an exciting way for me to reach students who need extra support. I’ve been able to upload revision lessons and interact with learners preparing for their KCSE exams, even while at home.This long holiday, I’m earning extra income while helping students strengthen their weak areas through online tutoring and recorded lessons. StudyBuddy Africa makes it easy to teach, inspire, and earn — all in one place.",
    imgSrc: "/images/maria.jpg",
  },
];

const learningTracks = [
  {
    id: 1,
    title: "K-12 & High School",
    role: "student",
    image: "/images/high-school.jpeg",
    education_level: "k-12",
    features: [
      "Curriculum-aligned lessons",
      "Exam prep",
      "parent tracking",
      "interactive quizzes",
      "video content for all subjects",
    ],
  },
  {
    id: 2,
    title: "University & Higher Ed",
    role: "student",
    image: "/images/university.png",
    education_level: "university",
    features: [
      "Advanced tutoring",
      "research assistance",
      "course mastery for undergrads and postgrads",
      "collaborative study groups",
      "expert guidance for thesis and projects",
    ],
  },
  {
    id: 3,
    title: "Continuous Learning",
    role: "student",
    image: "/images/continuous.jpg",
    education_level: "continuous",
    features: [
      "Advanced tutoring",
      "research assistance",
      "Skill-building",
      "professional development",
      "certifications for adult learners",
    ],
  },
];

const images = [student1, student2, student3];

function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-0 sm:pt-[78px]">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex flex-col sm:flex-row items-center justify-center w-full pt-28 sm:pt-0 pb-6 sm:pb-10 overflow-hidden bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff]     ">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Blobs */}
          <div className="absolute w-[800px] h-[800px] -top-48 -left-48 bg-[#01b0f11a] rounded-full blur-3xl opacity-40 animate-blob1"></div>
          <div className="absolute w-[700px] h-[700px] -bottom-64 -right-64 bg-[#0155751a] rounded-full blur-3xl opacity-40 animate-blob2"></div>

          {/* Geometric Patterns */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="pattern-dots pattern-blue-500 pattern-opacity-20 pattern-size-6 w-full h-full"></div>
          </div>
        </div>

        {/* Left Content */}
        <motion.div
          className="flex flex-col items-start justify-center w-full sm:w-1/2 px-8 sm:px-16 relative z-10 gap-y-6 sm:gap-y-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}>
          <div className="space-y-6 lg:space-y-8 max-w-2xl">
            <motion.h1
              className="text-2xl md:text-4xl font-bold text-[#015575] font-lilita leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              Empowering African Learners with Quality, Verified Education
            </motion.h1>

            <motion.p
              className="text-xl text-[#4a6b7d] font-josefin leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}>
              StudyBuddy Africa connects learners to curriculum-aligned lessons
              taught by certified teachers
            </motion.p>

            {/* CTA & Stats */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  to="/signup"
                  className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-josefin font-bold text-white rounded-full transition-all duration-300 bg-gradient-to-r from-[#01B0F1] to-[#015575] hover:from-[#015575] hover:to-[#01B0F1] group shadow-lg hover:shadow-xl">
                  <span className="relative z-10">Start Learning Free</span>
                  <span className="ml-3 relative z-10">
                    <FaArrowRight className="inline-block transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                </Link>

                <div className="flex items-center space-x-2 text-[#4a6b7d]">
                  <div className="flex -space-x-3">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-10 h-10 rounded-full border-2 border-white"
                        alt={`Student ${i + 1}`}
                      />
                    ))}
                  </div>
                  <span className="font-josefin">Join 50k+ students</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                {[
                  { number: "2000+", label: "Active Students" },
                  { number: "98%", label: "Success Rate" },
                  { number: "500+", label: "Expert Tutors" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white p-4 rounded-xl shadow-sm border border-[#01B0F1]/10"
                    whileHover={{ y: -5 }}>
                    <div className="text-2xl font-bold text-[#01B0F1] font-lilita">
                      {stat.number}
                    </div>
                    <div className="text-sm text-[#4a6b7d] font-josefin">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View All Button */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex justify-center mt-12">
                <Link
                  to="/tutors"
                  className="inline-flex items-center gap-3 bg-[#015575] text-white px-8 py-4 rounded-full font-josefin hover:bg-[#01B0F1] hover:shadow-xl transition-all duration-300 group">
                  <span>Meet Our Instructors</span>
                  <FaUsers className="transform group-hover:scale-1.2 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          className="w-full sm:w-1/2 h-[600px] relative flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="relative w-full h-full max-w-2xl">
            {/* Main Image */}
            <motion.img
              src="/images/km.png"
              alt="StudyBuddy students"
              className="absolute z-10 w-full h-full object-contain drop-shadow-2xl"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 animate-float1">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-[#01B0F1]/10">
                <BookOpenIcon className="w-8 h-8 text-[#01B0F1]" />
              </div>
            </div>

            <div className="absolute bottom-20 right-20 animate-float2">
              <div className="bg-[#01B0F1] p-3 rounded-full shadow-lg">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      {/*
    <section className="relative bg-[#f8fcff] w-full flex flex-col items-center justify-center py-10 px-4 sm:px-8 pb-12">
    
      <h2 className="text-4xl font-bold font-lilita text-[#015575] mb-12 mt-5">
        Our Features
      </h2>
      <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
        
        {[
          {
            icon: <FaRobot className="text-6xl text-[#01B0F1]" />,
            title: "AI Powered Learning",
            desc: "Smart algorithms for personalized learning experiences.",
          },
          {
            icon: <FaClipboardList className="text-6xl text-[#01B0F1]" />,
            title: "Child Report",
            desc: "Comprehensive insights into your child's learning progress.",
          },
          {
            icon: <FaVideo className="text-6xl text-[#01B0F1]" />,
            title: "Live Videos",
            desc: "Interactive live lessons for an engaging learning experience.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card bg-white shadow-lg p-8 rounded-lg text-center flex flex-col items-center w-full sm:w-[300px] transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3, duration: 0.8 }}
          >
            {feature.icon}
            <h3 className="text-2xl font-semibold font-lilita text-gray-500 mt-4">
              {feature.title}
            </h3>
            <p className="text-gray-600 font-josefin mt-2">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
*/}

      <section className="relative w-full bg-gradient-to-br from-[#f8fcff] to-[#e6f7ff] py-16 sm:py-24 px-4 sm:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-48 h-48 bg-[#01B0F1]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#015575]/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#01B0F1]/5 to-[#015575]/5"></div>
        </div>

        {/* About Us Section */}
        <section className="relative w-full py-20 lg:py-28 bg-gradient-to-br from-[#f8fcff] to-[#e6f7ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Heading */}
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[#015575] mb-4 font-lilita relative inline-block">
                About Us
                <span className="absolute bottom-0 left-1/2 w-3/4 h-1 bg-[#027fad] transform -translate-x-1/2 translate-y-2 rounded-full"></span>
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto font-josefin">
                Built by Educators, Designed for Learners
              </p>
            </div>

            {/* Content Container */}
            <div className="flex flex-col lg:flex-row items-center gap-12 xl:gap-16">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="relative rounded-2xl overflow-hidden shadow-xl transform group-hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src="/images/std3.jpeg"
                    alt="Students learning"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#027fad33] to-[#01557533] mix-blend-multiply"></div>
                </div>
                <div className="absolute -bottom-4 -right-4 hidden lg:block">
                  <div className="bg-[#027fad] p-4 rounded-xl shadow-lg">
                    <span className="text-white font-josefin font-bold text-2xl">
                      1500+
                    </span>
                    <p className="text-white text-sm mt-1">Happy Students</p>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8">
                <div className="space-y-4 lg:space-y-6">
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-josefin">
                    At{" "}
                    <span className="text-[#027fad] font-bold">
                      StudyBuddy Africa
                    </span>{" "}
                    we believe every student deserves access to trustworthy,
                    high-quality digital education. Our platform is designed and
                    reviewed by experienced teachers and curriculum specialists
                    to ensure that every lesson is accurate, practical, and
                    aligned with national education standards.
                  </p>
                  <div className="pl-4 border-l-4 border-[#015575]">
                    <p className="text-gray-600 italic font-josefin">
                      "Whether you're revising for exams or exploring new
                      subjects, StudyBuddy gives you the tools, structure, and
                      support you need to succeed — anytime, anywhere. "
                    </p>
                  </div>
                  <div className="text-lg lg:text-xl text-gray-600 leading-relaxed font-josefin space-y-4">
                    <h3 className="text-2xl font-semibold text-[#015575] mb-2">
                      How StudyBuddy Works
                    </h3>
                    <div className="space-y-3">
                      <p>
                        <span className="font-bold">1️⃣ Explore Lessons —</span>{" "}
                        Browse topics across subjects, each created and reviewed
                        by verified educators.
                      </p>
                      <p>
                        <span className="font-bold">2️⃣ Learn & Practice —</span>{" "}
                        Watch guided video lessons, take quizzes, and access
                        downloadable notes.
                      </p>
                      <p>
                        <span className="font-bold">
                          3️⃣ Track Your Progress —
                        </span>{" "}
                        Get performance reports and earn digital certificates as
                        you learn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#015575] p-2 rounded-lg mr-3">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <span className="font-josefin font-semibold text-gray-700">
                      Custom Lessons
                    </span>
                  </div>
                  <div className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#027fad] p-2 rounded-lg mr-3">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-josefin font-semibold text-gray-700">
                      Expert Tutors
                    </span>
                  </div>
                </div>

                <Link
                  to="/tutors"
                  className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-[#015575] to-[#027fad] hover:from-[#027fad] hover:to-[#015575] transition-all duration-300 shadow-lg hover:shadow-xl font-josefin">
                  Learn Smart Today
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Learning tracks section */}
        <section className="py-16 w-full mb-32">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-[#015575] mb-8 text-center font-lilita">
                Learning Tracks
              </h1>
              <h2 className="text-xl text-gray-600 mb-8 text-center font-josefin">
                Discover our comprehensive learning tracks designed to help you
                achieve your educational goals.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 ">
              {learningTracks.map((track, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  key={track.id}
                  className="bg-[#f7fdff] px-6 group py-4 rounded-xl shadow-xl hover:shadow-4xl hover:scale-105 cursor-pointer transition-all duration-500">
                  <div className=" group">
                    <div className="pt-2 pb-4 flex justify-center ">
                      <div className="w-48 h-48 border-4 border-[#01B0F1] shadow-lg transform transition-transform duration-300 hover:scale-105 rounded-2xl overflow-hidden">
                        <img
                          src={track.image}
                          alt={track.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#015575] mb-4 font-lilita text-center">
                      {track.title}
                    </h3>
                    <ul className="space-y-2 pb-4">
                      {track.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 p-1 rounded-full">
                          <FaCheckCircle className="text-[#01B0F1] flex-shrink-0" />
                          <span className="text-gray-600 font-josefin capitalize">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-start mt-4 mb-4 font-josefin">
                    <Link
                      to="/signup"
                      state={{
                        role: track.role,
                        education_level: track.education_level,
                      }}>
                      <button
                        to="/signup"
                        className="inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 px-6 rounded-xl font-josefin hover:shadow-lg transition-all duration-300 hover:gap-3">
                        Join Now
                        <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#015575] mb-4 font-lilita">
              Transform Education as a<br />
              <span className="bg-gradient-to-r from-[#01B0F1] to-[#015575] bg-clip-text text-transparent">
                StudyBuddy Member
              </span>
            </h2>
            <p className="text-lg text-gray-600 font-josefin max-w-2xl mx-auto">
              Join Africa's fastest-growing educational community and make real
              impact
            </p>
          </motion.div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {users.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ delay: index * 0.15 }}
                className="relative group perspective-1000">
                <Link
                  state={{ role: user.role }}
                  to={user.path}
                  className="block h-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 pb-12 overflow-hidden border border-white/20 transform-style-preserve-3d">
                  {/* 3D Effect Layer */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-[#01B0F1]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Image Container */}
                  <div className="relative z-10 mx-auto w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transform group-hover:-translate-y-4 transition-transform duration-300">
                    <img
                      src={user.image}
                      alt={user.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#01B0F1] text-white px-6 py-2 rounded-full font-josefin text-sm font-bold shadow-md flex items-center gap-2">
                      <user.icon className="w-5 h-5" />
                      {user.role}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-12 text-center space-y-4">
                    <h3 className="text-2xl font-bold text-[#015575] font-lilita">
                      {user.title}
                    </h3>
                    <p className="text-gray-600 font-josefin leading-relaxed line-clamp-3">
                      {user.description}
                    </p>

                    {/* Features List */}
                    <ul className="mt-6 space-y-2 text-left font-josefin text-gray-600">
                      {user.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheckCircle className="text-[#01B0F1] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-start mt-4 font-josefin">
                    <button
                      to="/signup"
                      className="inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 px-6 rounded-xl font-josefin hover:shadow-lg transition-all duration-300 hover:gap-3">
                      Join Now
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "50K+", label: "Active Members" },
              { value: "98%", label: "Success Rate" },
              { value: "150+", label: "Subjects" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
                <div className="text-3xl font-bold text-[#01B0F1] font-lilita">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-josefin">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="relative w-full py-20 px-4 sm:px-8 bg-gradient-to-br from-[#f8fcff] to-[#e1f3ff] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="pattern-dots pattern-blue-500 pattern-size-6 pattern-opacity-20" />
          </div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-[#01B0F1]/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#015575] mb-4 font-lilita">
              Learn from<span className="text-[#01B0F1]">Verified Experts</span>
            </h2>
            <p className="text-lg text-gray-600 font-josefin max-w-2xl mx-auto">
              Every StudyBuddy instructor is a certified teacher, subject
              expert, or examiner with years of classroom experience.
            </p>
          </motion.div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {teachers.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group">
                <div className="h-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 overflow-hidden border border-white/20">
                  {/* Image with floating effect */}
                  <div className="relative z-10 -mt-12 mx-auto w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transform group-hover:-translate-y-3 transition-transform duration-500">
                    <img
                      src={teacher.imgSrc}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Experience badge */}
                    <div className="absolute bottom-2 right-2 bg-[#01B0F1] text-white px-3 py-1 rounded-full text-sm font-josefin flex items-center gap-1">
                      <FaStar className="text-yellow-300" />
                      <span>{teacher.experience}+ years</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-8 text-center space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#015575] font-lilita">
                        {teacher.name}
                      </h3>
                      <p className="text-gray-500 font-josefin mt-1">
                        {teacher.subject} Specialist
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                        <div className="text-xl font-bold text-[#015575] font-lilita">
                          {teacher.experience}
                        </div>
                        <div className="text-sm text-gray-600 font-josefin">
                          Experience
                        </div>
                      </div>
                      <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                        <div className="text-xl font-bold text-[#015575] font-lilita">
                          {teacher.rating}
                        </div>
                        <div className="text-sm text-gray-600 font-josefin">
                          Rating
                        </div>
                      </div>
                      <div className="bg-[#01B0F1]/10 p-3 rounded-xl">
                        <div className="text-xl font-bold text-[#015575] font-lilita">
                          {teacher.students}+
                        </div>
                        <div className="text-sm text-gray-600 font-josefin">
                          Students
                        </div>
                      </div>
                    </div>

                    {/* School & Subjects */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-center text-gray-600 font-josefin">
                        <FaUniversity className="text-[#01B0F1]" />
                        <span>{teacher.school}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-gray-600 font-josefin">
                        <FaBookOpen className="text-[#01B0F1]" />
                        <span>{teacher.subjects} Subjects</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to="/tutors"
                      className="inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white py-3 px-6 rounded-xl font-josefin hover:shadow-lg transition-all duration-300 hover:gap-3">
                      View Profile
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#01B0F1]/30 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12">
            <Link
              to="/tutors"
              className="inline-flex items-center gap-3 bg-[#015575] text-white px-8 py-4 rounded-full font-josefin hover:bg-[#01B0F1] hover:shadow-xl transition-all duration-300 group">
              <span>Explore All Educators</span>
              <FaUsers className="transform group-hover:scale-1.2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tutorials Section */}
      <section className="relative w-full py-20 px-4 sm:px-8 bg-gradient-to-br from-[#f0f9ff] to-[#e1f3ff]">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#015575] mb-4 font-lilita">
              Video <span className="text-[#01B0F1]">Tutorials</span>
            </h2>
            <p className="text-lg text-gray-600 font-josefin max-w-2xl mx-auto">
              Master concepts with our curated collection of expert-led video
              lessons which are hosted on our platform and created exclusively
              for StudyBuddy learners
            </p>
          </motion.div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {tutorials.map((video) => (
              <motion.div
                key={video.id}
                className="group relative bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => {
                  setSelectedVideo(video);
                  setIsModalOpen(true);
                }}>
                <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                  {/* Thumbnail with overlay */}
                  <div className="relative h-full w-full">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Video Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 bg-[#01B0F1] px-3 py-1 rounded-full text-sm">
                          <FaClock className="text-xs" />
                          {video.duration}
                        </span>
                        <span className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-sm">
                          <FaEye className="text-xs" />
                          {video.views} views
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold font-josefin line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <FaPlay className="text-3xl text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Video Details */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#01B0F1]/10 text-[#015575] rounded-full text-sm font-josefin">
                      {video.category}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm font-josefin">
                      {video.date}
                    </span>
                  </div>
                  <p className="text-gray-600 font-josefin line-clamp-3">
                    {video.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12">
            <Link
              to="/tutors"
              className="inline-flex items-center gap-3 bg-[#015575] text-white px-8 py-4 rounded-full font-josefin hover:bg-[#01B0F1] hover:shadow-xl transition-all duration-300 group">
              <span>Explore All Tutorials</span>
              <FaYoutube className="transform group-hover:scale-125 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Enhanced Video Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setIsModalOpen(false)}>
              <motion.div
                initial={{ scale: 0.95, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 50 }}
                className="relative bg-black rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 z-50 text-white/80 hover:text-white transition-colors bg-black/50 p-2 rounded-full">
                  <FaTimes className="w-8 h-8" />
                </button>

                {/* Video Player */}
                {selectedVideo && (
                  <div className="relative aspect-video">
                    <ReactPlayer
                      url={selectedVideo.url}
                      controls
                      playing
                      width="100%"
                      height="100%"
                      light={false}
                      playIcon={<FaPlay className="text-4xl text-white" />}
                      config={{
                        youtube: {
                          playerVars: {
                            showinfo: 1,
                            modestbranding: 1,
                            rel: 0,
                          },
                        },
                        file: {
                          attributes: {
                            controlsList: "nodownload",
                            disablePictureInPicture: true,
                          },
                        },
                      }}
                      className="react-player"
                    />
                  </div>
                )}

                {/* Video Info */}
                <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-3xl font-bold text-white mb-4 font-lilita">
                      {selectedVideo?.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-300 font-josefin">
                      <span className="flex items-center gap-2">
                        <FaCalendarAlt />
                        {selectedVideo?.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaClock />
                        {selectedVideo?.duration}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaEye />
                        {selectedVideo?.views} views
                      </span>
                    </div>
                    <p className="mt-4 text-gray-200 font-josefin">
                      {selectedVideo?.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full py-20 px-4 sm:px-8 bg-gradient-to-br from-[#f8fcff] to-[#e6f7ff]">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <h2 className="text-4xl font-bold text-[#015575] mb-6 text-center font-lilita">
            Trusted by Teachers. Loved by Students.
          </h2>

          {/* Body Copy */}
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 mb-16 font-josefin leading-relaxed">
            StudyBuddy Africa partners with schools, education organizations,
            and community programs to make learning accessible and credible.{" "}
            <br className="hidden sm:block" />
            Join thousands of learners already using StudyBuddy to improve their
            grades, build confidence, and prepare for their future.
          </p>

          {/* Testimonials Title */}
          <h3 className="text-3xl font-bold text-[#015575] mb-12 text-center font-lilita">
            Testimonials
          </h3>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#01B0F1] to-[#015575] rounded-t-2xl" />

                  <div className="flex flex-col items-center">
                    {/* Quote Icon */}
                    <div className="text-[#01B0F1] mb-4">
                      <svg
                        className="w-12 h-12 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-lg text-gray-700 mb-6 text-center leading-relaxed font-josefin italic">
                      "{testimonial.message}"
                    </p>

                    {/* User Profile */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={testimonial.imgSrc}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full border-4 border-[#01B0F1]/20 object-cover"
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-[#01B0F1]/50 animate-ping" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-bold font-lilita text-[#015575]">
                          {testimonial.name}
                        </h4>
                        <p className="text-[#01B0F1] font-semibold font-josefin">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FaQuoteRight className="w-16 h-16 text-[#015575]" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Animation Keyframes and Bubble Styles */}
      <style>{`
        @keyframes blob1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(100px, -50px) scale(1.1); }
}

@keyframes blob2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-80px, 70px) scale(1.1); }
}

@keyframes float1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(25px); }
}

.animate-blob1 { animation: blob1 25s infinite; }
.animate-blob2 { animation: blob2 30s infinite; }
.animate-float1 { animation: float1 8s ease-in-out infinite; }
.animate-float2 { animation: float2 10s ease-in-out infinite; }

      `}</style>
    </div>
  );
}

export default HomePage;
