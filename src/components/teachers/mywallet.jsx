import React, { useState, useEffect } from "react";
import axios from "axios";
import Intasend from "../payments/Intasend";
import { FHOST } from "../constants/Functions";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import { 
  FaMoneyBillWave, 
  FaMobileAlt, 
  FaChartLine, 
  FaDownload, 
  FaEye,
  FaTimes
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MyWallet = ({ userInfo }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [topupHistory, setTopupHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [lessonPayments, setLessonPayments] = useState([]);
  const [amount, setAmount] = useState(0);
  const [teacherEarnings, setTeacherEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Teacher Earnings (70%)',
        data: [3500, 10500, 5600, 8400, 7000, 12600],
        borderColor: '#015575',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#015575',
      },
      {
        label: 'Total Lesson Payments',
        data: [5000, 15000, 8000, 12000, 10000, 18000],
        borderColor: '#01B0F1',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#01B0F1',
      },
    ],
  };

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const token = localStorage.getItem('access_token');
      if (!token) {
        setErrorMessage('No authentication token found. Please login again.');
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      console.log('Fetching wallet data for user:', userInfo?.id);

      // Fetch wallet info using new API
      try {
        const walletResponse = await axios.get(`${FHOST}/api/wallet/`, { headers });
        console.log('Wallet API response:', walletResponse.data);
        
        if (walletResponse.data?.results?.length > 0) {
          // Find wallet for current user (in case multiple wallets returned)
          const userWallet = walletResponse.data.results.find(w => w.user === userInfo?.id) || walletResponse.data.results[0];
          const currentBalance = parseFloat(userWallet.balance) || 0;
          console.log('Current wallet balance:', currentBalance, 'Wallet data:', userWallet);
          setAmount(currentBalance);
          setTeacherEarnings(currentBalance);
          setPendingEarnings(0);
        } else {
          console.warn('No wallet found in response. Creating wallet might be needed.');
          setAmount(0);
        }
      } catch (walletError) {
        console.error('Error fetching wallet:', walletError);
        setErrorMessage(`Wallet error: ${walletError.response?.data?.detail || walletError.message}`);
      }

      // Fetch transactions using new API
      try {
        const transactionsResponse = await axios.get(`${FHOST}/api/transactions/`, { headers });
        console.log('Transactions API response:', transactionsResponse.data);
        const transactions = transactionsResponse.data?.results || [];
        
        // Filter transactions by type
        const deposits = transactions.filter((t) => t.transaction_type === 'deposit');
        const withdrawals = transactions.filter((t) => t.transaction_type === 'withdrawal');
        
        console.log('Deposits found:', deposits.length, 'Withdrawals found:', withdrawals.length);
        setTopupHistory(deposits);
        setWithdrawalHistory(withdrawals);
      } catch (transError) {
        console.error('Error fetching transactions:', transError);
        setErrorMessage(`Transactions error: ${transError.response?.data?.detail || transError.message}`);
        setTopupHistory([]);
        setWithdrawalHistory([]);
      }
      
      // Lesson payments feed (optional; keep empty until backend provides)
      setLessonPayments([]);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load wallet data.';
      setErrorMessage(`Error: ${errorMsg}`);
      setTopupHistory([]);
      setWithdrawalHistory([]);
      setLessonPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawalAmount || !mpesaNumber) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (parseFloat(withdrawalAmount) > amount) {
      setErrorMessage('Withdrawal amount cannot exceed available earnings');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const token = localStorage.getItem('access_token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      
      // Use new withdrawal API endpoint
      const response = await axios.post(`${FHOST}/api/withdraw/`, {
        amount: parseFloat(withdrawalAmount),
        account_number: mpesaNumber,
        payment_method: "mpesa",
      }, { headers });
      
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Withdrawal initiated successfully! You will receive the funds in your M-Pesa account shortly.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        setMpesaNumber('');
        fetchTransactionHistory();
      }
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to initiate withdrawal. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchTransactionHistory();
    }
  }, [userInfo?.id]);

  // Refresh wallet data periodically to catch updates from deposits
  useEffect(() => {
    if (!userInfo?.id) return;
    
    const interval = setInterval(() => {
      fetchTransactionHistory();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [userInfo?.id]);

  return (
    <div className="min-h-screen bg-gray-50 font-josefin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-lilita text-[#015575]">
            My Wallet
          </h1>
          <button
            onClick={fetchTransactionHistory}
            disabled={loading}
            className="px-4 py-2 bg-[#015575] text-white rounded-lg hover:bg-[#014060] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Wallet Summary Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Balance Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#015575]">
            <h2 className="text-gray-500 text-sm">Total Balance</h2>
            <p className="text-3xl font-bold text-[#015575] mt-2">
              Ksh {amount.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-2">Available funds</p>
          </div>

          {/* Teacher Earnings Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <h2 className="text-gray-500 text-sm">Teacher Earnings (70%)</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">
              Ksh {teacherEarnings.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-2">From lesson payments</p>
          </div>

          {/* Pending Earnings Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
            <h2 className="text-gray-500 text-sm">Pending Earnings</h2>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              Ksh {pendingEarnings.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-2">From completed lessons</p>
          </div>

          {/* Wallet Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-gray-500 text-sm">Wallet Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button 
                onClick={() => setShowPopup(true)}
                className="w-full border border-[#01B0F1] text-[#015575] py-3 rounded-xl hover:bg-[#f0f9ff] transition flex items-center justify-center"
              >
                <span className="text-sm">Fund Wallet</span>
              </button>
              <button 
                onClick={() => setShowWithdrawalModal(true)}
                disabled={amount <= 0}
                className="w-full bg-[#01B0F1] text-white py-3 rounded-xl hover:bg-[#0199d4] transition flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaDownload className="mr-2" />
                <span className="text-sm">Withdraw Funds</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold text-[#015575] mb-4 flex items-center">
            <FaChartLine className="mr-2" />
            Earnings Overview
          </h3>
          <div className="h-80">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: {
                    grid: { color: '#e5e7eb' },
                    ticks: { callback: value => `Ksh ${value}` }
                  },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Lesson Payments */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-[#015575] mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2" />
              Recent Lesson Payments
            </h3>
            <div className="space-y-4">
              {lessonPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No lesson payments yet</p>
              ) : (
                lessonPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm">{payment.lesson_title}</p>
                      <p className="text-xs text-gray-500">{payment.student_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold text-sm">
                        Ksh {payment.teacher_earnings.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">
                        (70% of Ksh {payment.amount.toLocaleString()})
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-[#015575] mb-4 flex items-center">
              <FaDownload className="mr-2" />
              Withdrawal History
            </h3>
            <div className="space-y-4">
              {withdrawalHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No withdrawals yet</p>
              ) : (
                withdrawalHistory.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">M-Pesa Withdrawal</p>
                      <p className="text-xs text-gray-500">{transaction.account_number || transaction.details?.mpesa_number}</p>
                    </div>
                    <span className="text-red-600 font-semibold">
                      -{transaction.amount_currency || "Ksh"} {parseFloat(transaction.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#015575]">Add Funds</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <Intasend 
                fetchTransactionHistory={fetchTransactionHistory} 
                userInfo={userInfo}
                onClose={() => setShowPopup(false)}
              />
            </div>
          </div>
        )}

        {/* Withdrawal Modal */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#015575] flex items-center">
                  <FaMobileAlt className="mr-2" />
                  Withdraw to M-Pesa
                </h3>
                <button 
                  onClick={() => setShowWithdrawalModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Earnings
                  </label>
                  <div className="text-2xl font-bold text-green-600">
                    Ksh {amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">70% of your lesson payments</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Withdrawal Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    max={amount}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: Ksh 100</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B0F1] focus:border-transparent"
                    placeholder="e.g., 254700000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your M-Pesa number</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#01B0F1] text-white rounded-lg hover:bg-[#0199d4] disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : 'Withdraw Funds'}
                  </button>
                </div>
              </form>
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
        
        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
            <p><strong>User ID:</strong> {userInfo?.id}</p>
            <p><strong>Balance:</strong> {amount}</p>
            <p><strong>Deposits:</strong> {topupHistory.length}</p>
            <p><strong>Withdrawals:</strong> {withdrawalHistory.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWallet;