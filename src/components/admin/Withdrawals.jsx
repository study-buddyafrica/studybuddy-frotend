import React, { useEffect, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";
import { Check, X, Search } from "lucide-react";

const Withdrawals = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${FHOST}/payments/withdrawals/pending`).catch(() => null);
        setItems(Array.isArray(res?.data?.withdrawals) ? res.data.withdrawals : []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = items.filter((w) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return String(w.teacher_name || w.teacher_email || w.teacher_id).toLowerCase().includes(q);
  });

  const approve = async (id) => {
    try {
      await axios.post(`${FHOST}/payments/withdrawals/${id}/approve`);
      setItems((prev) => prev.filter((w) => w.id !== id));
    } catch (_) {
      setItems((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const reject = async (id) => {
    try {
      await axios.post(`${FHOST}/payments/withdrawals/${id}/reject`);
      setItems((prev) => prev.filter((w) => w.id !== id));
    } catch (_) {
      setItems((prev) => prev.filter((w) => w.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Withdrawals</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="pl-9 pr-3 py-2 border rounded-lg" placeholder="Search teacher" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
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
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={4}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-6 py-4" colSpan={4}>No withdrawals</td></tr>
            ) : filtered.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.teacher_name || w.teacher_email || w.teacher_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ksh {(w.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.created_at || w.requested_at || Date.now()).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => approve(w.id)} className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"><Check className="h-4 w-4 mr-1"/>Approve</button>
                    <button onClick={() => reject(w.id)} className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"><X className="h-4 w-4 mr-1"/>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;


