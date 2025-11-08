import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";
import { Search } from "lucide-react";

const ParentsAdmin = () => {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        // Fetch parents using the new user endpoint with role filter
        const res = await axios.get(`${FHOST}/api/users/users-list?role=parent`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        
        if (res?.data?.results && Array.isArray(res.data.results)) {
          setParents(res.data.results.map(p => ({
            id: p.id,
            full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username,
            username: p.username,
            email: p.email,
            num_students: p.num_students ?? (Array.isArray(p.students) ? p.students.length : p.children_count || 0),
            balance: p.balance || 0,
          })));
        } else {
          setParents([]);
        }
      } catch (err) {
        console.error('Failed to fetch parents:', err);
        setParents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parents.map((p) => ({
      ...p,
      num_students: p.num_students ?? (Array.isArray(p.students) ? p.students.length : p.children_count || 0),
    })).filter((p) => !q || String(p.full_name || p.username || p.email || "").toLowerCase().includes(q));
  }, [parents, search]);

  const totalParentBalance = filtered.reduce((sum, p) => sum + (p.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-medium text-gray-900">Parents</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="pl-9 pr-3 py-2 border rounded-lg" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total Parents: <span className="font-semibold text-gray-900">{filtered.length}</span></div>
        <div className="text-sm text-gray-600">Total Balance: <span className="font-semibold text-gray-900">Ksh {totalParentBalance.toLocaleString()}</span></div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={4}>Loading...</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.full_name || p.username}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.num_students}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ksh {(p.balance || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentsAdmin;


