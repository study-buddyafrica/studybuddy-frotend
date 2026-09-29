import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaStar,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";

const tutors = [
  {
    id: 1,
    name: "Kwamboka Abigael",
    bio: "Mathematics & science · 10+ years in the classroom.",
    qualifications: [
      "M.Sc. in Mathematics",
      "Certified Science Teacher",
      "10+ Years Experience",
    ],
    subjects: ["Math", "Physics", "Chemistry"],
    rating: 4.5,
    school: "Verified educator",
    image: "/images/teacher4.jpg",
  },
  {
    id: 2,
    name: "Peace Omondi",
    bio: "Languages specialist · engaging, structured lessons.",
    qualifications: [
      "B.A. in English Literature",
      "TESOL Certification",
      "3+ Years Experience",
    ],
    subjects: ["English", "Spanish", "French"],
    rating: 4.7,
    school: "Verified educator",
    image: "/images/teacher2.jpg",
  },
  {
    id: 3,
    name: "Kamau Mwangi",
    bio: "Coding & web · real projects with Python & JavaScript.",
    qualifications: [
      "B.S. in Computer Science",
      "Certified Web Developer",
      "8+ Years Experience",
    ],
    subjects: ["Programming", "Web Development", "Python"],
    rating: 4.8,
    school: "Verified educator",
    image: "/images/teacher3.jpg",
  },
];

const TutorProfilesPage = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tutors;
    return tutors.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#015575] to-[#027a9e] pb-16 pt-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 40%, #fff 0, transparent 40%), radial-gradient(circle at 85% 20%, #01B0F1 0, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7dd3f0]">
            Educators
          </p>
          <h1 className="mt-2 font-lilita text-3xl font-bold sm:text-4xl lg:text-5xl">
            Meet verified teachers across Africa
          </h1>
          <p className="mt-3 max-w-xl font-josefin text-base text-white/85">
            Certified educators with real classroom experience — ready for
            one-to-one and live classes.
          </p>

          <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or subject…"
              className="w-full flex-1 rounded-full border-0 bg-white/15 px-5 py-3 font-josefin text-white placeholder-white/60 outline-none ring-1 ring-white/25 focus:bg-white/20 focus:ring-2 focus:ring-white/40"
            />
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#015575] shadow hover:bg-[#e1f3ff]"
            >
              Start learning
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <p className="py-16 text-center font-josefin text-[#4a6b7d]">
            No educators match “{query}”. Try another subject or name.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tutor, index) => (
              <motion.article
                key={tutor.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-[#e1f3ff]">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#01B0F1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    <FaCheckCircle className="text-[10px]" />
                    Verified
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="font-lilita text-xl text-white drop-shadow">
                      {tutor.name}
                    </h2>
                    <p className="flex items-center gap-1 text-sm text-white/90">
                      <FaStar className="text-xs text-amber-300" />
                      {tutor.rating} · {tutor.subjects.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="font-josefin text-sm text-[#4a6b7d]">
                    {tutor.bio}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#015575]">
                      <FaGraduationCap />
                      Qualifications
                    </p>
                    <ul className="space-y-1.5">
                      {tutor.qualifications.map((q) => (
                        <li
                          key={q}
                          className="flex items-start gap-2 font-josefin text-sm text-[#4a6b7d]"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#01B0F1]" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[#01B0F1]/10 px-2.5 py-0.5 text-xs font-medium text-[#015575]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/signup"
                    state={{ role: "student" }}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#015575] py-2.5 text-sm font-semibold text-white transition hover:bg-[#01B0F1]"
                  >
                    Book a session
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TutorProfilesPage;
