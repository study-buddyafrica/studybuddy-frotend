import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import Intasend from "../payments/Intasend";
import { FHOST } from "../constants/Functions";

const MyWallet = ({userInfo}) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [topupHistory, setTopupHistory] = useState([]); // State to store deposit transactions
  
  const [amount, setAmount] = useState(0);

    const fetchTransactionHistory = async () => {
      try {
        const response = await axios.get(
          `${FHOST}/payments/transactions/${userInfo?.id}`
        );
        const transactions = response.data.transactions || [];
        const balanceRes = await axios.get(`${FHOST}/payments/wallet/${userInfo?.id}`);
        const amount = balanceRes.data.balance || 0;
        setAmount(amount)
        // Filter transactions of type 'deposit' for top-up history
        const deposits = transactions.filter(
          (transaction) => transaction.transaction_type === "deposit"
        );

        setTopupHistory(deposits);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    };

  useEffect(() => {
    fetchTransactionHistory();
  }, [userInfo?.id]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-blue-600 text-white py-4 px-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-sm mt-1">Manage your funds and track your expenditures.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Funds Section */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Funds</h2>
          <p className="m-4">Balance: {amount}</p>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => setShowPopup(true)}
          >
            Add Funds
          </button>
        </section>

        {/* Monthly Expenditure Section */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Monthly Expenditure</h2>
          <p className="text-gray-600">Track your spending on courses this month:</p>
          <div className="mt-4 text-center text-gray-500 py-8">
            <p>No expenditure data available yet.</p>
            <p className="text-sm mt-2">Your course purchases will appear here.</p>
          </div>
        </section>
      </div>

      {/* History Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-up History */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Top-Up History</h2>
          <ul className="divide-y divide-gray-200">
            {topupHistory.map((transaction) => (
              <li
                key={transaction.id}
                className="py-2 flex justify-between text-gray-700"
              >
                <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                <span>Ksh:{transaction.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Expenditure History */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Expenditure History</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No expenditure history available yet.</p>
            <p className="text-sm mt-2">Your course purchases will appear here.</p>
          </div>
        </section>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white relative p-6 rounded-lg shadow-lg w-full max-w-md">
            <button
              className="p-1  w-fit bg-red-500 rounded-md text-white hover:text-gray-900 text-sm absolute top-4 right-4"
              onClick={() => setShowPopup(false)}
            >
              <FaTimes className="text-2xl font-semibold" />
            </button>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Funds</h2>
            <form className="space-y-4 hidden">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  placeholder="Amount in USD"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </form>
            <Intasend fetchTransactionHistory={fetchTransactionHistory} userInfo={userInfo}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWallet;
