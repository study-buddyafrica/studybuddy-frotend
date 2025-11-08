import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";
import { Search, Filter } from "lucide-react";

const gradeOptions = [
  "All",
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
];

const StudentsAdmin = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        // Fetch students using the new user endpoint with role filter
        const res = await axios.get(`${FHOST}/api/users/users-list?role=student`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        
        if (res?.data?.results && Array.isArray(res.data.results)) {
          setStudents(res.data.results.map(s => ({
            id: s.id,
            full_name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username,
            username: s.username,
            email: s.email,
            grade: s.grade || '-',
            balance: s.balance || 0,
          })));
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !q || String(s.full_name || s.username || s.email || "").toLowerCase().includes(q);
      const matchesGrade = grade === "All" || s.grade === grade;
      return matchesSearch && matchesGrade;
    });
  }, [students, search, grade]);

  const totalBalance = filtered.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-medium text-gray-900">Students</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="pl-9 pr-3 py-2 border rounded-lg" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select className="pl-9 pr-3 py-2 border rounded-lg" value={grade} onChange={(e) => setGrade(e.target.value)}>
              {gradeOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total Students: <span className="font-semibold text-gray-900">{filtered.length}</span></div>
        <div className="text-sm text-gray-600">Total Balance: <span className="font-semibold text-gray-900">Ksh {totalBalance.toLocaleString()}</span></div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={4}>Loading...</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.full_name || s.username}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.grade || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ksh {(s.balance || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsAdmin;


