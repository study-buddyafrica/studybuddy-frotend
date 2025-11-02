import React, { useEffect, useState } from "react";
import { DollarSign, Send } from "lucide-react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const res = await axios.get(`${FHOST}/admin/financial-stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        
        // For now, we'll use the financial stats endpoint
        // You may need to create a separate transactions endpoint
        if (res?.data?.success) {
          // Create mock transactions based on financial stats
          const stats = res.data.financial_stats;
          const mockTransactions = [
            {
              id: 1,
              date: new Date().toISOString().split('T')[0],
              amount: stats.platform_revenue,
              type: 'payment',
              status: 'completed',
              user: 'Platform Revenue',
              description: 'Total platform revenue',
              recipient: '',
            },
            {
              id: 2,
              date: new Date().toISOString().split('T')[0],
              amount: stats.total_balances,
              type: 'payment',
              status: 'completed',
              user: 'Total Balances',
              description: 'Total wallet balances',
              recipient: '',
            }
          ];
          setTransactions(mockTransactions);
        } else {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  // Calculate Revenue, Payouts & Profit
  const totalRevenue = transactions
    .filter((t) => t.type === "payment")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPayouts = transactions
    .filter((t) => t.type === "payout")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalProfit = totalRevenue - totalPayouts;

  // Handle payout (mark transaction as completed)
  const handlePayout = (id) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "completed" } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Payouts</h3>
              <p className="text-2xl font-semibold text-gray-900">${totalPayouts.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
              <p className="text-2xl font-semibold text-gray-900">${totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={6}>Loading...</td></tr>
            ) : transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.type === "payout" && transaction.status === "pending" && (
                    <button
                      onClick={() => handlePayout(transaction.id)}
                      className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Transfer
                    </button>
                  )}
                  {transaction.type === "payment" && (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
