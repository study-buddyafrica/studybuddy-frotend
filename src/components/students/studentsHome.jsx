import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaBookReader,
  FaChalkboardTeacher,
  FaUserAlt,
  FaVideo,
  FaWallet,
} from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import { authStorage } from "../../services/authStorage";
import { formatSubjects, normalizeSubjectList } from "../../utils/subjectUtils";

const PAYMENTS_ENABLED = false;

const StudentsHome = ({ setActiveComponent, userInfo }) => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMoreTeachers, setViewMoreTeachers] = useState(false);
  const [viewMoreVideos, setViewMoreVideos] = useState(false);
  const [walletAmount, setWalletAmount] = useState(null);

  const formatKes = (n) =>
    `KES ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      const token = authStorage.getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      try {
        const teachersRes = await axios
          .get(`${FHOST}/api/teachers/list`, { headers })
          .catch(() => null);

        if (!cancelled && teachersRes?.data) {
          const results =
            teachersRes.data.results ||
            teachersRes.data.teachers ||
            (Array.isArray(teachersRes.data) ? teachersRes.data : []);

          setTeachers(
            results.map((teacher) => ({
              id: teacher.id,
              full_name:
                teacher.full_name ||
                [teacher.first_name, teacher.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                "Teacher",
              subjects: normalizeSubjectList(teacher.subjects),
              is_verified: teacher.is_verified,
              profilePicture:
                teacher.profile_picture || teacher.profile_photo || null,
            })),
          );
        }

        try {
          const sessionsRes = await axios.get(`${FHOST}/api/live-sessions/`, {
            headers,
          });
          if (!cancelled) {
            const list = sessionsRes.data?.results || sessionsRes.data || [];
            setSessions(Array.isArray(list) ? list : []);
          }
        } catch {
          if (!cancelled) setSessions([]);
        }

        if (token) {
          try {
            const walletRes = await axios.get(`${FHOST}/api/wallet/`, {
              headers,
            });
            const w = walletRes.data?.results?.[0];
            if (!cancelled && w) {
              setWalletAmount(parseFloat(w.balance) || 0);
            }
          } catch {
            if (!cancelled) setWalletAmount(null);
          }
        }

        if (!cancelled) setVideos([]);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load your home feed. Try again shortly.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-josefin text-slate-500">
        Loading your dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-josefin text-sm text-red-700">
        {error}
      </div>
    );
  }

  const firstName =
    userInfo?.first_name || userInfo?.full_name?.split?.(" ")?.[0] || "there";

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-josefin">
      <div>
        <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Teachers, classes, and learning tools in one place.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-[#015575] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <FaWallet className="text-lg" />
            </span>
            <div>
              <h2 className="font-lilita text-xl">Your wallet</h2>
              <p className="mt-0.5 text-sm text-white/85">
                {walletAmount != null
                  ? formatKes(walletAmount)
                  : "Balance loads when signed in"}
              </p>
              {!PAYMENTS_ENABLED && (
                <p className="mt-1 text-xs text-white/70">
                  M-Pesa top-ups launch in Week 5 · wallet is already
                  provisioned
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveComponent?.("mywallet")}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#015575] shadow-sm transition hover:bg-[#e8f7fc]"
          >
            Open wallet
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-lilita text-xl text-[#015575] sm:text-2xl">
              Teachers
            </h2>
            <p className="text-sm text-slate-500">
              Verified educators you can book from Find teachers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveComponent?.("teachers")}
            className="text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
          >
            Browse all
          </button>
        </div>

        {teachers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No teachers to show yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {teachers
                .slice(0, viewMoreTeachers ? teachers.length : 4)
                .map((teacher) => (
                  <article
                    key={teacher.id}
                    className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-[#01B0F1]/30 hover:shadow-md"
                  >
                    {teacher.profilePicture ? (
                      <img
                        src={teacher.profilePicture}
                        alt={teacher.full_name}
                        className="mb-3 h-16 w-16 rounded-full border-2 border-slate-100 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#01B0F1]/15">
                        <FaUserAlt className="text-xl text-[#015575]" />
                      </div>
                    )}
                    <h3 className="text-center font-josefin text-sm font-semibold text-[#015575] sm:text-base">
                      {teacher.full_name}
                    </h3>
                    {teacher.is_verified && (
                      <span className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Verified
                      </span>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <FaChalkboardTeacher className="text-[#01B0F1]" />
                      <span>
                        {normalizeSubjectList(teacher.subjects).length} subjects
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-center text-xs text-slate-600">
                      <FaBookReader className="mr-1 inline text-slate-400" />
                      {formatSubjects(teacher.subjects) || "Subjects TBD"}
                    </p>
                  </article>
                ))}
            </div>
            {teachers.length > 4 && (
              <button
                type="button"
                onClick={() => setViewMoreTeachers((v) => !v)}
                className="mt-4 text-sm font-semibold text-[#015575] hover:text-[#01B0F1]"
              >
                {viewMoreTeachers ? "View less" : "View more"}
              </button>
            )}
          </>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-lilita text-xl text-[#015575] sm:text-2xl">
            Learning videos
          </h2>
          <p className="text-sm text-slate-500">
            Short lessons when the library is available
          </p>
        </div>
        {videos.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-4 py-12 text-center shadow-sm">
            <FaVideo className="mb-3 text-3xl text-slate-300" />
            <p className="font-josefin text-sm text-slate-500">
              Video feed is empty for now. Check Video lessons from the sidebar.
            </p>
            <button
              type="button"
              onClick={() => setActiveComponent?.("videos")}
              className="mt-4 rounded-xl bg-[#015575] px-5 py-2 text-sm font-semibold text-white hover:bg-[#01415e]"
            >
              Open video lessons
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {videos
                .slice(0, viewMoreVideos ? videos.length : 4)
                .map((video, index) => (
                  <article
                    key={video.id || index}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="line-clamp-2 text-sm font-semibold text-[#015575]">
                        {video.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {video.description}
                      </p>
                    </div>
                  </article>
                ))}
            </div>
            {videos.length > 4 && (
              <button
                type="button"
                onClick={() => setViewMoreVideos((v) => !v)}
                className="mt-4 text-sm font-semibold text-[#015575]"
              >
                {viewMoreVideos ? "View less" : "View more"}
              </button>
            )}
          </>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-lilita text-xl text-[#015575] sm:text-2xl">
              Your live classes
            </h2>
            <p className="text-sm text-slate-500">
              Join from Lessons when a session is ready
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveComponent?.("lessons")}
            className="text-sm font-semibold text-[#01B0F1] hover:text-[#015575]"
          >
            Go to lessons
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No upcoming live sessions yet. Book a teacher or open Lessons.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, index) => {
              const price =
                session.price != null ? formatKes(session.price) : null;
              const when = session.started_at
                ? new Date(session.started_at).toLocaleString()
                : session.scheduled_date || "Time TBD";

              return (
                <article
                  key={session.id || index}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-josefin text-lg font-semibold text-[#015575]">
                    {session.title || session.name || "Live class"}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {(session.subject?.name || session.subject) && (
                      <p>
                        Subject:{" "}
                        <span className="font-semibold text-slate-800">
                          {session.subject?.name || session.subject}
                        </span>
                      </p>
                    )}
                    {(session.teacher?.name || session.teacher?.full_name) && (
                      <p>
                        Teacher:{" "}
                        <span className="font-semibold text-slate-800">
                          {session.teacher?.full_name || session.teacher?.name}
                        </span>
                      </p>
                    )}
                    {price && (
                      <p>
                        Amount:{" "}
                        <span className="font-semibold text-slate-800">
                          {price}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-slate-500">{when}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveComponent?.("lessons")}
                    className="mt-4 w-full rounded-xl bg-[#015575] py-2.5 text-sm font-semibold text-white hover:bg-[#01415e]"
                  >
                    Open in lessons
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentsHome;
