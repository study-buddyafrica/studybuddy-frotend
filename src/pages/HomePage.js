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
const faqs = [
  {
    q: "Is StudyBuddy Africa aligned to my national curriculum?",
    a: "Yes. Lessons are written and reviewed by verified educators against standards such as CBC, KCPE/KPSEA, KCSE, and other regional curricula we support.",
  },
  {
    q: "How are tutors verified?",
    a: "Educators submit credentials and teaching experience. Our team reviews profiles before they can teach or publish content on the platform.",
  },
  {
    q: "Will it work on a low-cost phone or a slow connection?",
    a: "The product is designed for mobile-first use and lighter data. Video lessons are kept short so they load and replay more easily on limited bandwidth.",
  },
  {
    q: "Can I start without paying?",
    a: "You can create a free account and explore. Some lessons and features may require a plan or wallet top-up depending on what you book.",
  },
  {
    q: "How do parents follow their child’s progress?",
    a: "Parent accounts can link to a child’s learning activity and see progress-style reports so you know where support is needed.",
  },
];

function HomePage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audienceTab, setAudienceTab] = useState("student");
  const [openFaq, setOpenFaq] = useState(null);


  return (
    <div className="homepage relative min-h-screen w-full overflow-hidden pt-20">
      {/* Enhanced Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f8fcff] to-[#eef7fc] pb-10 pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="font-lilita text-3xl font-bold leading-tight text-[#015575] sm:text-4xl lg:text-5xl">
              Empowering African learners with quality, verified education
            </h1>
            <p className="mt-4 max-w-lg font-josefin text-base text-[#4a6b7d] sm:text-lg">
              StudyBuddy Africa connects learners to curriculum-aligned lessons
              taught by certified teachers — with practice, progress tracking,
              and support that works on any phone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#01B0F1] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#015575]"
              >
                Start learning free
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                to="/tutors"
                className="inline-flex items-center rounded-full border border-[#015575]/20 bg-white px-6 py-3 text-sm font-semibold text-[#015575] hover:bg-[#f0f9ff]"
              >
                Meet our educators
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Free to start · No card required · Cancel anytime
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { n: "2,000+", l: "Active learners" },
                { n: "500+", l: "Verified educators" },
                { n: "150+", l: "Subjects & topics" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-white bg-white/80 p-3 shadow-sm"
                >
                  <div className="font-lilita text-lg text-[#015575]">
                    {s.n}
                  </div>
                  <div className="text-xs text-gray-500">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "CBC",
                "KCPE / KPSEA",
                "KCSE",
                "IGCSE / Cambridge",
                "WAEC",
                "NECTA",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#01B0F1]/20 bg-white px-3 py-1 text-xs font-medium text-[#015575]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <img
              src="/images/km.png"
              alt="Student learning"
              className="w-full object-contain drop-shadow-xl"
            />
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-6 px-4 text-sm text-[#4a6b7d]">
          {[
            "Curriculum-aligned content",
            "Certified, verified teachers",
            "Works on low-cost phones",
            "Light on data",
          ].map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <FaCheckCircle className="text-[#01B0F1]" /> {t}
            </span>
          ))}
        </div>
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
      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 w-full bg-[#f8fcff] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
            How it works
          </p>
          <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            Three steps from confusion to confidence
          </h2>
          <p className="mt-3 max-w-2xl font-josefin text-base text-[#4a6b7d]">
            A simple, predictable learning loop — so learners always know what
            to do next.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "Step 1",
                title: "Explore lessons",
                desc: "Browse subjects and topics, each written and reviewed by verified educators against national curriculum standards.",
                icon: (
                  <svg
                    className="h-6 w-6 text-[#01B0F1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                ),
              },
              {
                step: "Step 2",
                title: "Learn & practise",
                desc: "Watch short guided video lessons, work through quizzes, and download notes you can revise offline.",
                icon: (
                  <svg
                    className="h-6 w-6 text-[#01B0F1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                ),
              },
              {
                step: "Step 3",
                title: "Track progress",
                desc: "See performance reports per topic, spot weak areas early, and earn digital certificates as you advance.",
                icon: (
                  <svg
                    className="h-6 w-6 text-[#01B0F1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#01B0F1]/10">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#01B0F1]">
                  {item.step}
                </p>
                <h3 className="mt-1 font-lilita text-xl text-[#015575]">
                  {item.title}
                </h3>
                <p className="mt-2 font-josefin text-sm leading-relaxed text-[#4a6b7d]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Programs */}
      <section
        id="programs"
        className="scroll-mt-24 w-full bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
            Programs
          </p>
          <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            Learning tracks built around real education stages
          </h2>
          <p className="mt-3 max-w-2xl font-josefin text-base text-[#4a6b7d]">
            Pick the track that matches where you are. Each one has its own
            content, assessment style, and support model.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {learningTracks.map((track) => {
              const subtitle =
                track.education_level === "k-12"
                  ? "Grades 1–12"
                  : track.education_level === "university"
                    ? "Undergrad & postgrad"
                    : "Adult learners";
              const ctaLabel =
                track.education_level === "k-12"
                  ? "Explore K-12 track"
                  : track.education_level === "university"
                    ? "Explore University track"
                    : "Explore Continuous track";
              const bullets =
                track.education_level === "k-12"
                  ? [
                      "Exam prep & past-paper practice",
                      "Interactive quizzes per topic",
                      "Parent progress tracking",
                    ]
                  : track.education_level === "university"
                    ? [
                        "Specialist subject tutors",
                        "Research & thesis guidance",
                        "Collaborative study groups",
                      ]
                    : [
                        "Career upskilling paths",
                        "Expert-led short courses",
                        "Completion certificates",
                      ];
              return (
                <div
                  key={track.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#f8fcff] shadow-sm transition hover:shadow-md"
                >
                  <div className="h-36 overflow-hidden bg-[#e1f3ff]">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="h-full w-full object-cover opacity-90"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#01B0F1]">
                      {subtitle}
                    </p>
                    <h3 className="mt-1 font-lilita text-xl text-[#015575]">
                      {track.title}
                    </h3>
                    <ul className="mt-4 flex-1 space-y-2">
                      {bullets.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 font-josefin text-sm text-[#4a6b7d]"
                        >
                          <FaCheckCircle className="mt-0.5 shrink-0 text-xs text-[#01B0F1]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      state={{
                        role: track.role || "student",
                        education_level: track.education_level,
                      }}
                      className="mt-6 inline-flex items-center justify-center rounded-full border border-[#015575]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#015575] transition hover:border-[#01B0F1] hover:bg-[#01B0F1]/5"
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section
        id="who-its-for"
        className="scroll-mt-24 w-full bg-[#f8fcff] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
            Who it’s for
          </p>
          <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            One platform, three very different jobs to do
          </h2>
          <p className="mt-3 max-w-2xl font-josefin text-base text-[#4a6b7d]">
            Students, parents and educators each need different things from
            StudyBuddy. Choose your role to see what you get.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { key: "student", label: "Students" },
              { key: "parent", label: "Parents" },
              { key: "teacher", label: "Educators" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setAudienceTab(tab.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  audienceTab === tab.key
                    ? "bg-[#01B0F1] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-[#015575] hover:bg-[#e1f3ff]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2">
              <div>
                <h3 className="font-lilita text-2xl text-[#015575]">
                  {audienceTab === "student" &&
                    "Understand the topic, not just the answer"}
                  {audienceTab === "parent" &&
                    "See progress without nagging for updates"}
                  {audienceTab === "teacher" &&
                    "Teach, inspire, and earn — in one place"}
                </h3>
                <p className="mt-3 font-josefin text-sm leading-relaxed text-[#4a6b7d]">
                  {audienceTab === "student" &&
                    "Personalised lessons, one-to-one sessions with verified tutors, and practice that shows you exactly where you stand before exam day."}
                  {audienceTab === "parent" &&
                    "Follow your child’s subjects, lesson activity, and weak areas from one dashboard — with clear reports you can act on."}
                  {audienceTab === "teacher" &&
                    "Reach learners across levels, upload revision lessons, run live sessions, and grow your income with flexible scheduling."}
                </p>
                <ul className="mt-5 space-y-2">
                  {(audienceTab === "student"
                    ? [
                        "One-to-one lessons with certified tutors",
                        "Step-by-step solutions, not just answers",
                        "Real-time progress on every topic",
                        "Support available around the clock",
                      ]
                    : audienceTab === "parent"
                      ? [
                          "Child progress reports",
                          "Parent–teacher communication",
                          "Real-time tracking by subject",
                          "24/7 support when you need help",
                        ]
                      : [
                          "Flexible teaching schedule",
                          "Student progress tools",
                          "Competitive compensation",
                          "Professional development",
                        ]
                  ).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-josefin text-sm text-[#4a6b7d]"
                    >
                      <FaCheckCircle className="mt-0.5 shrink-0 text-xs text-[#01B0F1]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  state={{
                    role:
                      audienceTab === "teacher"
                        ? "teacher"
                        : audienceTab === "parent"
                          ? "parent"
                          : "student",
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#01B0F1] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#015575]"
                >
                  {audienceTab === "teacher"
                    ? "Become an educator"
                    : audienceTab === "parent"
                      ? "Create parent account"
                      : "Start learning free"}
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-xl bg-[#e1f3ff]">
                <img
                  src={
                    audienceTab === "teacher"
                      ? "/images/tut.jpg"
                      : audienceTab === "parent"
                        ? "/images/pare.jpg"
                        : "/images/kid.jpg"
                  }
                  alt=""
                  className="h-56 w-full object-cover sm:h-72"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified educators */}
      {/* Verified educators — centerpiece */}
      <section
        id="educators"
        className="scroll-mt-24 relative w-full overflow-hidden bg-gradient-to-b from-[#015575] to-[#027a9e] py-16 sm:py-20"
      >
        {/* soft pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 0, transparent 45%), radial-gradient(circle at 80% 70%, #01B0F1 0, transparent 40%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7dd3f0]">
                The heart of StudyBuddy
              </p>
              <h2 className="mt-2 font-lilita text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Real teachers from schools across Africa
              </h2>
              <p className="mt-3 font-josefin text-base text-white/85 sm:text-lg">
                Certified educators — not anonymous profiles. Classroom
                experience checked before they teach on StudyBuddy.
              </p>
            </div>
            <Link
              to="/tutors"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#015575] shadow-lg transition hover:bg-[#e1f3ff]"
            >
              Browse all educators
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher, index) => (
              <article
                key={index}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20 ring-1 ring-white/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Photo band */}
                <div className="relative h-44 overflow-hidden bg-[#e1f3ff] sm:h-48">
                  <img
                    src={teacher.imgSrc}
                    alt={teacher.name.trim()}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#01B0F1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    <FaCheckCircle className="text-[10px]" />
                    Verified
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-lilita text-xl text-white drop-shadow">
                      {teacher.name.trim()}
                    </h3>
                    <p className="truncate text-sm text-white/90">
                      {teacher.subject.trim()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="font-josefin text-sm text-[#4a6b7d]">
                    {teacher.school.trim()}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[#f0f9ff] px-2 py-2.5 text-center">
                      <p className="font-lilita text-base text-[#015575]">
                        {teacher.experience}+
                      </p>
                      <p className="text-[10px] font-medium text-gray-500">
                        Years
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f0f9ff] px-2 py-2.5 text-center">
                      <p className="inline-flex items-center justify-center gap-0.5 font-lilita text-base text-[#015575]">
                        <FaStar className="text-xs text-amber-400" />
                        {teacher.rating}
                      </p>
                      <p className="text-[10px] font-medium text-gray-500">
                        Rating
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f0f9ff] px-2 py-2.5 text-center">
                      <p className="font-lilita text-base text-[#015575]">
                        {teacher.students}+
                      </p>
                      <p className="text-[10px] font-medium text-gray-500">
                        Learners
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/tutors"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#015575] py-2.5 text-sm font-semibold text-white transition hover:bg-[#01B0F1]"
                  >
                    View profile
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 text-center font-josefin text-sm text-white/70">
            Teachers from primary, secondary and specialist subjects — ready for
            one-to-one and live classes.
          </p>
        </div>
      </section>

      {/* Video lessons */}
      <section
        id="lessons"
        className="scroll-mt-24 w-full bg-[#f8fcff] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
                Video lessons
              </p>
              <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
                Short, focused lessons made for real bandwidth
              </h2>
              <p className="mt-3 max-w-xl font-josefin text-base text-[#4a6b7d]">
                Lessons are produced exclusively for StudyBuddy learners and
                kept short so they load and replay on limited data.
              </p>
            </div>
            <Link
              to="/tutors"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#015575]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#015575] hover:border-[#01B0F1]"
            >
              Explore all lessons
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => {
                  setSelectedVideo(video);
                  setIsModalOpen(true);
                }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-[#e1f3ff]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#015575]">
                      <FaPlay className="ml-0.5" />
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-[#01B0F1]/10 px-2 py-0.5 font-medium text-[#015575]">
                      {video.category}
                    </span>
                    <span>{video.views} views</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-josefin text-base font-semibold text-[#015575]">
                    {video.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 font-josefin text-sm text-[#4a6b7d]">
                    {video.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 40 }}
                className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-6 top-6 z-50 rounded-full bg-black/50 p-2 text-white/80 hover:text-white"
                >
                  <FaTimes className="h-8 w-8" />
                </button>
                {selectedVideo && (
                  <div className="relative aspect-video">
                    <ReactPlayer
                      url={selectedVideo.url}
                      controls
                      playing
                      width="100%"
                      height="100%"
                      className="react-player"
                    />
                  </div>
                )}
                <div className="p-6 text-white">
                  <h3 className="font-lilita text-2xl">
                    {selectedVideo?.title}
                  </h3>
                  <p className="mt-2 font-josefin text-sm text-gray-300">
                    {selectedVideo?.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="scroll-mt-24 w-full bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
            Trusted by teachers
          </p>
          <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            Trusted by teachers. Loved by students.
          </h2>
          <p className="mt-3 max-w-2xl font-josefin text-base text-[#4a6b7d]">
            StudyBuddy Africa works with schools, education organisations and
            community programmes to keep learning accessible and credible.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((t, index) => {
              const short =
                t.message.length > 220
                  ? `${t.message.slice(0, 220).trim()}…`
                  : t.message;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-[#f8fcff] p-6 shadow-sm"
                >
                  <p className="font-josefin text-sm leading-relaxed text-[#4a6b7d]">
                    “{short}”
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                    <img
                      src={t.imgSrc}
                      alt={t.name}
                      className="h-11 w-11 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-lilita text-base text-[#015575]">
                        {t.name.trim()}
                      </p>
                      <p className="font-josefin text-xs text-gray-500">
                        {t.role.trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs — single column (no big white gap above footer) */}
      <section
        id="faqs"
        className="scroll-mt-24 w-full bg-[#f8fcff] py-12 sm:py-14"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#01B0F1]">
            FAQs
          </p>
          <h2 className="mt-2 font-lilita text-3xl font-bold text-[#015575] sm:text-4xl">
            Questions learners and parents ask first
          </h2>
          <p className="mt-3 font-josefin text-base text-[#4a6b7d]">
            If something isn’t covered here, support can help from inside the
            app.
          </p>
          <Link
            to="/faq"
            className="mt-4 inline-flex text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
          >
            View all FAQs →
          </Link>

          <div className="mt-8 space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-josefin text-sm font-semibold text-[#015575] sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#01B0F1]/10 text-[#01B0F1] transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-50 px-5 pb-4 pt-1">
                      <p className="font-josefin text-sm leading-relaxed text-[#4a6b7d]">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
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
