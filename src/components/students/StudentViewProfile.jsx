import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaSchool,
  FaBullseye,
} from "react-icons/fa";

/**
 * Read-only student profile overview (SBA-SPEC-2026-007 §3.1.C).
 * Hydrated from GET /api/v1/onboarding/status/ via dashProfile.
 */
const StudentViewProfile = ({ userInfo, dashProfile }) => {
  const profile = dashProfile || userInfo?.profile || {};
  const fullName =
    [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(" ") ||
    userInfo?.full_name ||
    userInfo?.username ||
    "Student";

  const subjects = profile.target_subjects || profile.subjects || [];

  const Row = ({ label, value, icon: Icon }) => (
    <div>
      <p className="mb-1 font-josefin text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="flex items-center gap-2 font-josefin text-[#015575]">
        {Icon && <Icon className="shrink-0 text-[#01B0F1]" />}
        <span>{value || "—"}</span>
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-2 font-lilita text-2xl text-[#015575]">My account</h2>
        <p className="mb-6 font-josefin text-sm text-slate-500">
          Profile from onboarding (read-only). To update your core academic
          curriculum or institution, contact your school administrator or
          StudyBuddy support.
        </p>

        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#01B0F1]/15">
            <FaUser className="text-3xl text-[#015575]" />
          </div>
          <p className="mt-3 font-lilita text-xl text-[#015575]">{fullName}</p>
          {userInfo?.email && (
            <p className="mt-1 flex items-center gap-2 font-josefin text-sm text-slate-500">
              <FaEnvelope className="text-[#01B0F1]" />
              {userInfo.email}
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Verified
              </span>
            </p>
          )}
        </div>

        <div className="grid gap-6 rounded-xl bg-[#F8FAFC] p-6 sm:grid-cols-2">
          <Row label="Full name" value={fullName} icon={FaUser} />
          <Row
            label="Registered email"
            value={userInfo?.email}
            icon={FaEnvelope}
          />
          <Row
            label="Education system"
            value={profile.curriculum_type}
            icon={FaGraduationCap}
          />
          <Row
            label="Current grade / class"
            value={profile.grade_name}
            icon={FaGraduationCap}
          />
          <Row
            label="School / institution"
            value={profile.school_name}
            icon={FaSchool}
          />
          <Row
            label="Target exam year"
            value={profile.target_exam_year}
            icon={FaBullseye}
          />
          <div className="sm:col-span-2">
            <Row
              label="Primary study goal"
              value={profile.primary_learning_goal}
              icon={FaBullseye}
            />
          </div>
          {profile.study_pace && (
            <div className="sm:col-span-2">
              <Row label="Study pace" value={profile.study_pace} />
            </div>
          )}
          <div className="sm:col-span-2">
            <p className="mb-2 font-josefin text-xs font-medium uppercase tracking-wide text-slate-500">
              Focus subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.length === 0 ? (
                <span className="font-josefin text-sm text-slate-500">
                  None listed
                </span>
              ) : (
                subjects.map((s) => (
                  <span
                    key={typeof s === "string" ? s : s.id || s.name}
                    className="rounded-full bg-[#01B0F1]/10 px-3 py-1 font-josefin text-xs font-semibold text-[#015575]"
                  >
                    {typeof s === "string" ? s : s.name || s.subject}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentViewProfile;
