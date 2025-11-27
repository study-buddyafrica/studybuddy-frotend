import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FHOST } from "../constants/Functions";

const MyWallet = ({userInfo}) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [topupHistory, setTopupHistory] = useState([]); // State to store deposit transactions
  const [expenditureHistory, setExpenditureHistory] = useState([]); // State to store withdrawal/expenditure transactions
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
      return;
    }

    try {
      setDepositLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const token = localStorage.getItem('access_token');
      if (!token) {
        setErrorMessage('Authentication required. Please login again.');
        setDepositLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const payload = {
        amount: parseFloat(depositAmount),
        payment_method: "mpesa",
      };

      const response = await axios.post(`${FHOST}/api/wallet/deposit/`, payload, { headers });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;

        // store deposit info
        setDepositInfo(data);
        setShowCheckoutModal(true);

        // close amount modal
        setShowPopup(false);

        // clear fields
        setDepositAmount('');

        fetchWalletData();
      }

    } catch (error) {
      console.error('Error initiating deposit:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to initiate deposit. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setDepositLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch wallet info
      const walletResponse = await axios.get(`${FHOST}/api/wallet/`, { headers });
      if (walletResponse.data?.results?.length > 0) {
        const wallet = walletResponse.data.results[0];
        setAmount(parseFloat(wallet.balance) || 0);
      }

      // Fetch transactions
      const transactionsResponse = await axios.get(`${FHOST}/api/transactions/`, { headers });
      const transactions = transactionsResponse.data?.results || [];
      
      // Filter transactions by type
      const deposits = transactions.filter(
        (transaction) => transaction.transaction_type === "deposit"
      );
      const withdrawals = transactions.filter(
        (transaction) => transaction.transaction_type === "withdrawal"
      );

      setTopupHistory(deposits);
      setExpenditureHistory(withdrawals);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchWalletData();
    }
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
          <p className="m-4">Balance: {amount.toFixed(2)}</p>
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
          <div className="mt-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : expenditureHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No expenditure data available yet.</p>
                <p className="text-sm mt-2">Your course purchases will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenditureHistory.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm text-gray-700">{transaction.description || "Expenditure"}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                    </div>
                    <span className="text-red-600 font-semibold">
                      -{transaction.amount_currency || ""} {parseFloat(transaction.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* History Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-up History */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Top-Up History</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : topupHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No top-up history available yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {topupHistory.map((transaction) => (
                <li
                  key={transaction.id}
                  className="py-2 flex justify-between text-gray-700"
                >
                  <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                  <span className="text-green-600 font-semibold">
                    +{transaction.amount_currency || ""} {parseFloat(transaction.amount || 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Expenditure History */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Expenditure History</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : expenditureHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No expenditure history available yet.</p>
              <p className="text-sm mt-2">Your course purchases will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {expenditureHistory.map((transaction) => (
                <li key={transaction.id} className="py-2 flex justify-between text-gray-700">
                  <div>
                    <span className="block">{new Date(transaction.timestamp).toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{transaction.description || "Expenditure"}</span>
                  </div>
                  <span className="text-red-600 font-semibold">
                    -{transaction.amount_currency || ""} {parseFloat(transaction.amount || 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Add Funds Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Deposit Funds</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount e.g. 500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                You'll receive an STK push on your registered M-Pesa number. Confirm on your phone to complete the deposit.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!depositLoading) {
                      setShowPopup(false);
                      setDepositAmount('');
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={depositLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {depositLoading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
{showCheckoutModal && depositInfo && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Deposit Initiated
        </h3>
        <button
          onClick={() => setShowCheckoutModal(false)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{depositInfo.message}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-800">Payment Details</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Amount:</strong> Ksh {depositInfo.amount_details.original_amount}</p>
            <p><strong>Fee:</strong> Ksh {depositInfo.amount_details.fee_amount}</p>
            <p><strong>Total to Pay:</strong> Ksh {depositInfo.amount_details.you_pay}</p>
            <p><strong>You Get:</strong> Ksh {depositInfo.amount_details.you_get}</p>
            <p><strong>Transaction ID:</strong> {depositInfo.transaction_id}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Click the button below to complete your payment. You'll receive an STK push on your M-Pesa number.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowCheckoutModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
        <button
          onClick={() => window.open(depositInfo.checkout_url, '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Complete Payment
        </button>
      </div>
    </div>
  </div>
)}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWallet;
