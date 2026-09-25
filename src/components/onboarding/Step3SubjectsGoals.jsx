import React, { useState, useMemo } from "react";
import {
  FaCheck,
  FaSearch,
  FaTimes,
  FaPlus,
  FaCalculator,
  FaFlask,
  FaBookOpen,
  FaGlobeAfrica,
  FaLeaf,
  FaCogs,
  FaCoffee,
  FaChartLine,
  FaBolt,
  FaArrowLeft,
  FaArrowRight,
  FaLightbulb,
  FaBullseye,
} from "react-icons/fa";

/**
 * Step3SubjectsGoals: Subjects, Learning Goals & AI Tutor Pacing.
 * References Figma Frame 7:66 (Step 3 - Subjects, Goals & Guardian Link).
 * Styled with platform brand fonts (Lilita & Josefin) and minimal, elegant layout.
 */
const Step3SubjectsGoals = ({
  onNext = null,
  onBack = null,
  initialData = null,
}) => {
  // Retrieve saved Step 2 data to dynamically adapt syllabus & subject pool
  const step2Data = (() => {
    try {
      const stored = sessionStorage.getItem("studentOnboardingStep2");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })();

  // Retrieve saved Step 3 data if previously entered
  const savedData = (() => {
    try {
      const stored = sessionStorage.getItem("studentOnboardingStep3");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })();

  const curriculum = step2Data?.curriculum || "cbc";
  const gradeLevel = step2Data?.gradeLevel || "Junior Secondary - Grade 8 (JSS 2)";

  // Compute dynamic syllabus header info
  const syllabusInfo = useMemo(() => {
    if (curriculum === "844") {
      return {
        title: `Target Syllabus: 8-4-4 Secondary System (${gradeLevel})`,
        alignment: "KNEC Aligned",
        note: "3 core subjects locked • Electives can be modified anytime",
      };
    }
    if (curriculum === "cambridge") {
      return {
        title: `Target Syllabus: Cambridge International (${gradeLevel})`,
        alignment: "Cambridge Assessment Aligned",
        note: "3 core subjects locked • Electives can be modified anytime",
      };
    }
    return {
      title: `Target Syllabus: CBC Junior Secondary (${gradeLevel})`,
      alignment: "Kenya KICD Aligned",
      note: "3 core subjects locked • Electives can be modified anytime",
    };
  }, [curriculum, gradeLevel]);

  // Subject catalogs mapped by curriculum
  const defaultSubjects = useMemo(() => {
    if (curriculum === "844") {
      return [
        {
          id: "math_844",
          name: "Mathematics (Alt A)",
          description: "Calculus, Geometry, Trigonometry, Commercial Arithmetic, and Statistics.",
          meta: "16 KCSE Units",
          status: "AI Diagnostic Ready",
          badge: "Core • High Priority",
          isCore: true,
          icon: FaCalculator,
        },
        {
          id: "eng_844",
          name: "English & Literature",
          description: "Grammar, Imaginative Writing, Set Books (Fathers of Nations, The Samaritan).",
          meta: "Essays & Poetry",
          status: "Active",
          badge: "Core",
          isCore: true,
          icon: FaBookOpen,
        },
        {
          id: "kisw_844",
          name: "Kiswahili (Fasihi & Lugha)",
          description: "Sarufi, Insha, Ushairi, na uchambuzi wa tamthilia na riwaya teule.",
          meta: "12 Moduli",
          status: "Active",
          badge: "Core",
          isCore: true,
          icon: FaBookOpen,
        },
        {
          id: "bio_844",
          name: "Biology",
          description: "Cell physiology, Ecology, Reproduction, Genetics, and practical mock papers.",
          meta: "8 Practical Modules",
          status: "Active",
          badge: "Elective",
          isCore: false,
          icon: FaFlask,
        },
        {
          id: "chem_844",
          name: "Chemistry",
          description: "Periodic table, Mole concept, Organic chemistry, and volumetric analysis.",
          meta: "10 Lab Strands",
          status: "Not enrolled",
          badge: "Elective",
          isCore: false,
          icon: FaFlask,
        },
        {
          id: "phy_844",
          name: "Physics",
          description: "Mechanics, Waves, Electricity & Magnetism, and thermal physics.",
          meta: "7 Practical Strands",
          status: "Not enrolled",
          badge: "Elective",
          isCore: false,
          icon: FaCogs,
        },
      ];
    }

    if (curriculum === "cambridge") {
      return [
        {
          id: "math_igcse",
          name: "Extended Mathematics (0580)",
          description: "Algebra, Coordinate Geometry, Vectors, Trigonometry, and Statistics.",
          meta: "14 Core Topics",
          status: "AI Diagnostic Ready",
          badge: "Core • High Priority",
          isCore: true,
          icon: FaCalculator,
        },
        {
          id: "eng_igcse",
          name: "First Language English (0500)",
          description: "Comprehension, directed writing, text analysis, and argumentative essays.",
          meta: "Past Paper Drills",
          status: "Active",
          badge: "Core",
          isCore: true,
          icon: FaBookOpen,
        },
        {
          id: "sci_igcse",
          name: "Coordinated Sciences (0654)",
          description: "Integrated Biology, Chemistry, and Physics modules tailored for Cambridge.",
          meta: "18 Lab Modules",
          status: "Active",
          badge: "Core",
          isCore: true,
          icon: FaFlask,
        },
        {
          id: "gp_igcse",
          name: "Global Perspectives",
          description: "Critical analysis of global issues, demographic shifts, and sustainability.",
          meta: "Individual Reports",
          status: "Active",
          badge: "Elective",
          isCore: false,
          icon: FaGlobeAfrica,
        },
        {
          id: "econ_igcse",
          name: "Economics (0455)",
          description: "Basic economic problem, resource allocation, and international trade.",
          meta: "Case Studies",
          status: "Not enrolled",
          badge: "Elective",
          isCore: false,
          icon: FaLeaf,
        },
        {
          id: "cs_igcse",
          name: "Computer Science (0478)",
          description: "Algorithms, Python problem solving, Boolean logic, and cybersecurity.",
          meta: "Coding Labs",
          status: "Not enrolled",
          badge: "Elective",
          isCore: false,
          icon: FaCogs,
        },
      ];
    }

    // Default: CBC (Junior Secondary)
    return [
      {
        id: "math_cbc",
        name: "Mathematics (CBC JSS)",
        description: "Numbers, Algebra, Geometry, Data Handling, and Ratio-proportion strands.",
        meta: "14 Strands Available",
        status: "AI Diagnostic Ready",
        badge: "Core • High Priority",
        isCore: true,
        icon: FaCalculator,
      },
      {
        id: "science_cbc",
        name: "Integrated Science",
        description: "Biology fundamentals, Chemistry properties of matter, Physics mechanics.",
        meta: "12 Practical Modules",
        status: "Active",
        badge: "Core",
        isCore: true,
        icon: FaFlask,
      },
      {
        id: "english_cbc",
        name: "English & Literature",
        description: "Grammar mechanics, Composition craft, prescribed Set Books analysis, and East African literature.",
        meta: "Essays & Comprehension",
        status: "Active",
        badge: "Core",
        isCore: true,
        icon: FaBookOpen,
      },
      {
        id: "social_cbc",
        name: "Social Studies & CRE",
        description: "Kenyan History & Constitution, Physical Geography of Eastern Africa, and ethics.",
        meta: "Atlas & Field Studies",
        status: "Active",
        badge: "Elective",
        isCore: false,
        icon: FaGlobeAfrica,
      },
      {
        id: "agri_cbc",
        name: "Agriculture & Nutrition",
        description: "Crop production methods, livestock management, poultry farming, and food security.",
        meta: "Practical Projects",
        status: "Not enrolled",
        badge: "Elective",
        isCore: false,
        icon: FaLeaf,
      },
      {
        id: "tech_cbc",
        name: "Pre-Technical Studies",
        description: "Computing fundamentals, Digital literacy, Technical drawing foundations, and entrepreneurship.",
        meta: "Digital Strand",
        status: "Not enrolled",
        badge: "Elective",
        isCore: false,
        icon: FaCogs,
      },
    ];
  }, [curriculum]);

  // Selected subjects state
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(() => {
    if (savedData?.selectedSubjectIds) return savedData.selectedSubjectIds;
    if (initialData?.selectedSubjectIds) return initialData.selectedSubjectIds;
    // Default: 3 core + 1 elective (e.g. math, science, english, social)
    return defaultSubjects.slice(0, 4).map((s) => s.id);
  });

  const toggleSubject = (subjectId, isCore) => {
    // Core subjects remain selected by default as per CBC/school standards
    if (isCore) return;

    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
    }
  };

  // Focus topic tags
  const initialAvailableTopics = useMemo(() => [
    "LinearEquations",
    "PhotosynthesisAndCells",
    "FractionsAndPercentages",
    "KenyanConstitution",
    "AlgebraicExpressions",
    "CellDivision",
    "EssayComposition",
    "SoilErosionControl",
    "ComputerHardware",
    "MicroOrganisms",
    "WeatherPatterns",
    "GeometricConstructions",
    "IndicesAndLogarithms",
    "ChemicalBonding",
    "ElectricCurrents",
  ], []);

  const [selectedTopics, setSelectedTopics] = useState(() => {
    if (savedData?.selectedTopics) return savedData.selectedTopics;
    if (initialData?.selectedTopics) return initialData.selectedTopics;
    return [
      "LinearEquations",
      "PhotosynthesisAndCells",
      "FractionsAndPercentages",
      "KenyanConstitution",
    ];
  });

  const [topicSearch, setTopicSearch] = useState("");

  const filteredTopics = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    if (!q) return initialAvailableTopics;
    return initialAvailableTopics.filter((t) => t.toLowerCase().includes(q));
  }, [initialAvailableTopics, topicSearch]);

  const addTopic = (topic) => {
    if (selectedTopics.length >= 8) return;
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const removeTopic = (topic) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topic));
  };

  // Weekly study pacing: "light" | "balanced" | "intensive"
  const [studyPace, setStudyPace] = useState(
    savedData?.studyPace || initialData?.studyPace || "balanced",
  );

  // Target exam score: "A" | "B" | "Pass"
  const [targetScore, setTargetScore] = useState(
    savedData?.targetScore || initialData?.targetScore || "A",
  );

  // Form submission / Proceed to Step 4
  const handleProceed = (e) => {
    if (e) e.preventDefault();

    const step3Payload = {
      selectedSubjectIds,
      selectedSubjects: defaultSubjects.filter((s) => selectedSubjectIds.includes(s.id)),
      selectedTopics,
      studyPace,
      targetScore,
      updatedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("studentOnboardingStep3", JSON.stringify(step3Payload));
    } catch (err) {
      console.warn("Could not save step 3 to sessionStorage:", err);
    }

    if (onNext) {
      onNext(step3Payload);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ========================================================================= */}
      {/* Hero Header Area                                                          */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DEF0FF] text-[#00658C] text-xs font-lilita tracking-wide">
          <FaBullseye className="w-3.5 h-3.5" />
          <span>Syllabus Tailoring & Goal Setting</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-lilita text-slate-900 tracking-wide">
          Select your core subjects & study goals
        </h1>

        <p className="font-josefin text-slate-600 text-sm sm:text-base max-w-2xl">
          Choose the subjects you want to master for your {gradeLevel} exams and set your weekly
          study hours to personalize AI study schedules.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Live Track Banner / Context Note                                          */}
      {/* ========================================================================= */}
      <div className="bg-[#EAF5FF] rounded-2xl p-4 sm:p-5 border border-[#01B0F1]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2ABCFE]/20 text-[#00658C] flex items-center justify-center shrink-0">
            <FaBookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-lilita text-slate-900 text-sm tracking-wide">
                {syllabusInfo.title}
              </span>
              <span className="bg-[#C6E7FF] text-[#003D55] text-[10px] font-bold px-2 py-0.5 rounded-full font-josefin">
                {syllabusInfo.alignment}
              </span>
            </div>
            <p className="font-josefin text-xs text-slate-600 mt-0.5">
              {syllabusInfo.note}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-josefin">
          <span className="text-xs text-slate-600 font-semibold">Selected:</span>
          <span className="bg-[#DEF0FF] text-[#001E2D] font-bold px-3 py-1 rounded-lg text-xs font-lilita tracking-wide border border-[#01B0F1]/30">
            {selectedSubjectIds.length} Subjects Active
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 01: Subject Selection Grid                                        */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <p className="font-lilita text-xs text-[#00658C] tracking-wider uppercase">
              01. SUBJECT ALLOCATION
            </p>
            <h2 className="font-lilita text-xl sm:text-2xl text-slate-900 tracking-wide">
              Choose Your Core & Elective Subjects
            </h2>
          </div>
          <p className="font-josefin text-xs text-slate-500">
            Click any elective card to toggle enrollment in your AI syllabus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultSubjects.map((subject) => {
            const isSelected = selectedSubjectIds.includes(subject.id);
            const Icon = subject.icon;

            return (
              <div
                key={subject.id}
                onClick={() => toggleSubject(subject.id, subject.isCore)}
                className={`relative rounded-2xl p-5 transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#EAF5FF] border-2 border-[#2ABCFE] shadow-md shadow-[#2ABCFE]/10"
                    : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Badge + Checkbox */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#2ABCFE]/20 text-[#00658C]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-josefin ${
                          subject.badge.includes("High Priority")
                            ? "bg-[#FFDCC0] text-[#2D1600]"
                            : subject.isCore
                              ? "bg-[#C6E7FF] text-[#003D55]"
                              : "bg-[#DEF0FF] text-slate-700"
                        }`}
                      >
                        {subject.badge}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#2ABCFE] text-white shadow-sm"
                            : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <FaCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-lilita text-base text-slate-900 tracking-wide mb-1">
                    {subject.name}
                  </h3>
                  <p className="font-josefin text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-200/60 font-josefin text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {subject.meta}
                  </span>
                  <span
                    className={`font-bold ${
                      isSelected ? "text-[#00658C]" : "text-slate-400 font-semibold"
                    }`}
                  >
                    {isSelected ? "Active" : "Not enrolled"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 02: Focus Topic Tags                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-lilita text-xs text-[#00658C] tracking-wider uppercase">
              02. FOCUS TOPIC TAGS
            </p>
            <h2 className="font-lilita text-xl sm:text-2xl text-slate-900 tracking-wide mt-0.5">
              Select Topics You Need Most Help With
            </h2>
            <p className="font-josefin text-xs text-slate-600 mt-1">
              Our AI Tutor will prioritize drills and quiz explanations for these selected areas.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search syllabus topics..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#EAF5FF] border border-slate-300 text-xs font-josefin text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#01B0F1] focus:ring-1 focus:ring-[#01B0F1]"
            />
          </div>
        </div>

        {/* Selected Topics Pill Container */}
        <div>
          <p className="font-josefin text-xs font-bold text-slate-700 mb-2">
            Priority Topics ({selectedTopics.length}/8 selected):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => removeTopic(topic)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00658C] text-white text-xs font-josefin font-semibold hover:bg-[#004B68] transition-all shadow-sm group"
              >
                <span>#{topic}</span>
                <FaTimes className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100" />
              </button>
            ))}
            {selectedTopics.length === 0 && (
              <span className="font-josefin text-xs text-slate-400 italic">
                No priority topics selected. Choose from below:
              </span>
            )}
          </div>
        </div>

        {/* Available Topics Pool */}
        <div>
          <p className="font-josefin text-xs text-slate-500 mb-2">
            Available Syllabus Topics:
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredTopics
              .filter((topic) => !selectedTopics.includes(topic))
              .map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => addTopic(topic)}
                  disabled={selectedTopics.length >= 8}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF5FF] text-slate-700 text-xs font-josefin font-medium hover:bg-[#DEF0FF] hover:text-[#00658C] border border-[#01B0F1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>#{topic}</span>
                  <FaPlus className="w-2.5 h-2.5 text-[#00658C]" />
                </button>
              ))}
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 font-josefin text-xs text-slate-600">
          <FaLightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Tip: You can add up to 8 priority topics for targeted AI flashcard revision and diagnostic drills.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 03: Study Target & Pacing                                         */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div>
          <p className="font-lilita text-xs text-[#00658C] tracking-wider uppercase">
            03. WEEKLY COMMITMENT & EXAM GOAL
          </p>
          <h2 className="font-lilita text-xl sm:text-2xl text-slate-900 tracking-wide mt-0.5">
            Weekly Study Target & AI Tutor Pacing
          </h2>
          <p className="font-josefin text-xs text-slate-600 mt-1">
            Determine how aggressively your daily study plan and quiz drills are scheduled.
          </p>
        </div>

        {/* Pacing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Light Pace */}
          <div
            onClick={() => setStudyPace("light")}
            className={`relative rounded-2xl p-6 transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
              studyPace === "light"
                ? "bg-[#EAF5FF] border-2 border-[#2ABCFE] shadow-md shadow-[#2ABCFE]/10"
                : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center">
                  <FaCoffee className="w-5 h-5" />
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    studyPace === "light"
                      ? "bg-[#2ABCFE] text-white"
                      : "border border-slate-300"
                  }`}
                >
                  {studyPace === "light" && <FaCheck className="w-2.5 h-2.5" />}
                </div>
              </div>

              <h3 className="font-lilita text-base text-slate-900 tracking-wide">
                Light Pace
              </h3>

              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="font-lilita text-2xl text-slate-900">5–7</span>
                <span className="font-josefin text-xs text-slate-500 font-semibold">
                  hrs / week
                </span>
              </div>

              <p className="font-josefin text-xs text-slate-600 leading-relaxed">
                ~1 hr / day. Ideal for homework support and steady concept maintenance without exam stress.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200/60 font-josefin text-[11px] font-semibold text-[#00658C]">
              • 2 mini-quizzes / week
            </div>
          </div>

          {/* Balanced Pace (Recommended) */}
          <div
            onClick={() => setStudyPace("balanced")}
            className={`relative rounded-2xl p-6 transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
              studyPace === "balanced"
                ? "bg-[#EAF5FF] border-2 border-[#2ABCFE] shadow-md shadow-[#2ABCFE]/10"
                : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            {/* Recommended Pill Badge */}
            <div className="absolute -top-3 right-6 bg-[#2ABCFE] text-white text-[10px] font-lilita tracking-wider uppercase px-3 py-0.5 rounded-full shadow-sm">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2ABCFE]/20 text-[#00658C] flex items-center justify-center">
                  <FaChartLine className="w-5 h-5" />
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    studyPace === "balanced"
                      ? "bg-[#2ABCFE] text-white"
                      : "border border-slate-300"
                  }`}
                >
                  {studyPace === "balanced" && <FaCheck className="w-2.5 h-2.5" />}
                </div>
              </div>

              <h3 className="font-lilita text-base text-slate-900 tracking-wide">
                Balanced Pace
              </h3>

              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="font-lilita text-2xl text-[#00658C]">10–14</span>
                <span className="font-josefin text-xs text-slate-500 font-semibold">
                  hrs / week
                </span>
              </div>

              <p className="font-josefin text-xs text-slate-600 leading-relaxed">
                ~2 hrs / day. Recommended for top performance and mastering foundational strands.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200/60 font-josefin text-[11px] font-bold text-[#00658C]">
              • Daily 15-min AI flashcards + 4 quizzes / week
            </div>
          </div>

          {/* Intensive Prep */}
          <div
            onClick={() => setStudyPace("intensive")}
            className={`relative rounded-2xl p-6 transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
              studyPace === "intensive"
                ? "bg-[#EAF5FF] border-2 border-[#2ABCFE] shadow-md shadow-[#2ABCFE]/10"
                : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFDCC0] text-[#8C4300] flex items-center justify-center">
                  <FaBolt className="w-5 h-5" />
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    studyPace === "intensive"
                      ? "bg-[#2ABCFE] text-white"
                      : "border border-slate-300"
                  }`}
                >
                  {studyPace === "intensive" && <FaCheck className="w-2.5 h-2.5" />}
                </div>
              </div>

              <h3 className="font-lilita text-base text-slate-900 tracking-wide">
                Intensive Prep
              </h3>

              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="font-lilita text-2xl text-slate-900">18+</span>
                <span className="font-josefin text-xs text-slate-500 font-semibold">
                  hrs / week
                </span>
              </div>

              <p className="font-josefin text-xs text-slate-600 leading-relaxed">
                ~3 hrs / day. Complete revision sprint, timed national paper simulations, and mock tournaments.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200/60 font-josefin text-[11px] font-semibold text-[#8C4300]">
              • Daily diagnostic drills & full mock exams
            </div>
          </div>
        </div>

        {/* Target Exam Score Selector Card */}
        <div className="bg-[#EAF5FF] rounded-2xl p-5 sm:p-6 border border-[#01B0F1]/20 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div>
            <p className="font-lilita text-xs text-[#00658C] uppercase tracking-wider">
              TARGET EXAM SCORE
            </p>
            <h4 className="font-lilita text-base sm:text-lg text-slate-900 tracking-wide mt-0.5">
              What target grade are you aiming for this term?
            </h4>
            <p className="font-josefin text-xs text-slate-600 mt-1 max-w-md">
              AI questions calibrate their difficulty and step-by-step hints to your grade goal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "A", label: "Grade A / Distinction (80%+)" },
              { key: "B", label: "Grade B / High Merit (70–79%)" },
              { key: "Pass", label: "Pass / Reinforce Basics" },
            ].map((grade) => {
              const isSelected = targetScore === grade.key;
              return (
                <button
                  key={grade.key}
                  type="button"
                  onClick={() => setTargetScore(grade.key)}
                  className={`px-4 py-2.5 rounded-xl font-josefin text-xs font-bold transition-all shadow-sm ${
                    isSelected
                      ? "bg-[#003D55] text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {grade.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Tutor AI Optimization Card (Social Proof & Performance)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center font-lilita text-lg shrink-0">
            🤖
          </div>
          <div>
            <p className="font-lilita text-xs text-[#00658C] uppercase tracking-wider">
              TUTOR AI OPTIMIZATION
            </p>
            <p className="font-josefin text-xs text-slate-800 mt-0.5 leading-relaxed">
              Students on the{" "}
              <strong className="text-[#00658C] font-bold">
                {studyPace === "intensive"
                  ? "Intensive Prep"
                  : studyPace === "light"
                    ? "Light Pace"
                    : "Balanced Pace"}
              </strong>{" "}
              recorded an average score increase of{" "}
              <strong className="text-slate-900 font-bold">22% in Mathematics</strong> within 6
              weeks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto font-josefin">
          <div className="text-right">
            <p className="font-lilita text-xs text-slate-900 tracking-wide">
              KCSE & CBC Predictor
            </p>
            <p className="text-[11px] text-slate-500">
              Calibrated for 2025/2026
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#DEF0FF] text-[#00658C] flex items-center justify-center">
            <FaChartLine className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Navigation Action Footer                                                  */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 font-josefin">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors order-2 sm:order-1"
        >
          <FaArrowLeft className="w-3 h-3" />
          Previous: Academic Profile
        </button>

        <div className="w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-lilita text-base tracking-wide text-white bg-[#003D55] hover:bg-[#015575] hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next Step: Dashboard Launch</span>
            <FaArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compliance Note */}
      <p className="text-center font-josefin text-[11px] text-slate-500 pb-2">
        Study targets adapt automatically based on your weekly quiz scores and teacher feedback.
      </p>
    </div>
  );
};

export default Step3SubjectsGoals;
