import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";
import { Check, X, Search, Filter, BadgeDollarSign } from "lucide-react";

const gradeOptions = [
  "All",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const TeachersAdmin = () => {
  const [teachers, setTeachers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const tRes = await axios.get(`${FHOST}/users/teachers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        setTeachers(Array.isArray(tRes?.data?.teachers) ? tRes.data.teachers : []);
        // Backend does not expose a pending withdrawals listing; leave empty for now
        setWithdrawals([]);
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesSearch = !q ||
        String(t.full_name || t.username || t.email || "").toLowerCase().includes(q);
      const matchesGrade = grade === "All" || (t.grade === grade || (t.grades || []).includes(grade));
      return matchesSearch && matchesGrade;
    });
  }, [teachers, search, grade]);

  const approveWithdrawal = async (withdrawalId) => {
    // Not supported by backend yet
    setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
  };

  const rejectWithdrawal = async (withdrawalId) => {
    setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-medium text-gray-900">Teachers</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 border rounded-lg"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-9 pr-3 py-2 border rounded-lg"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
            ) : (
              filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.full_name || t.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(t.grades || [t.grade]).filter(Boolean).join(", ")}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Ksh {(t.balance || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${t.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.verified ? 'Verified' : 'Pending'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center"><BadgeDollarSign className="h-5 w-5 mr-2"/>Pending Withdrawals</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr><td className="px-6 py-4" colSpan={4}>No pending withdrawals</td></tr>
            ) : withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.teacher_name || w.teacher_email || w.teacher_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ksh {(w.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.created_at || w.requested_at || Date.now()).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => approveWithdrawal(w.id)} className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"><Check className="h-4 w-4 mr-1"/>Approve</button>
                    <button onClick={() => rejectWithdrawal(w.id)} className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"><X className="h-4 w-4 mr-1"/>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default TeachersAdmin;


