import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FHOST } from "../constants/Functions";
import { authStorage } from "../../services/authStorage";

/** Campaign Week 5 — keep false until payments sprint */
const PAYMENTS_ENABLED = false;

const MyWallet = ({ userInfo }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [topupHistory, setTopupHistory] = useState([]);
  const [expenditureHistory, setExpenditureHistory] = useState([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatKes = (n) =>
    `KES ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!PAYMENTS_ENABLED) {
      setErrorMessage(
        "M-Pesa automated deposits will launch during Week 5. Your wallet is active and provisioned.",
      );
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage("Please enter a valid deposit amount.");
      return;
    }

    try {
      setDepositLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const token = authStorage.getAccessToken();
      if (!token) {
        setErrorMessage("Authentication required. Please login again.");
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

      const response = await axios.post(
        `${FHOST}/api/wallet/deposit/`,
        payload,
        {
          headers,
        },
      );

      if (response.status === 200 || response.status === 201) {
        setDepositInfo(response.data);
        setShowCheckoutModal(true);
        setShowPopup(false);
        setDepositAmount("");
        fetchWalletData();
      }
    } catch (error) {
      console.error("Error initiating deposit:", error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to initiate deposit. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setDepositLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = authStorage.getAccessToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const walletResponse = await axios.get(`${FHOST}/api/wallet/`, {
        headers,
      });
      if (walletResponse.data?.results?.length > 0) {
        const wallet = walletResponse.data.results[0];
        setAmount(parseFloat(wallet.balance) || 0);
      }

      const transactionsResponse = await axios.get(
        `${FHOST}/api/transactions/`,
        { headers },
      );
      const transactions = transactionsResponse.data?.results || [];

      setTopupHistory(
        transactions.filter((t) => t.transaction_type === "deposit"),
      );
      setExpenditureHistory(
        transactions.filter((t) => t.transaction_type === "withdrawal"),
      );
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
    <div className="min-h-screen bg-gray-100 p-6 font-josefin">
      <header className="mb-6 rounded-lg bg-[#015575] px-6 py-4 text-white shadow-lg">
        <h1 className="font-lilita text-2xl">My Wallet</h1>
        <p className="mt-1 text-sm text-white/90">
          View balance and history. Deposits launch in Week 5.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Balance</h2>
          <p className="mb-4 font-lilita text-2xl text-[#015575]">
            {formatKes(amount)}
          </p>
          {PAYMENTS_ENABLED ? (
            <button
              type="button"
              className="w-full rounded-lg bg-[#015575] py-2 text-white shadow transition hover:bg-[#01B0F1]"
              onClick={() => setShowPopup(true)}
            >
              Add funds
            </button>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">M-Pesa deposits launch in Week 5</p>
              <p className="mt-1">
                Your wallet is active and provisioned. Checkout stays off until
                the payments sprint.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Monthly expenditure
          </h2>
          <div className="mt-4">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : expenditureHistory.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No expenditure data yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenditureHistory.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b py-2"
                  >
                    <div>
                      <p className="text-sm text-gray-700">
                        {transaction.description || "Expenditure"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      -{formatKes(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Top-up history
          </h2>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : topupHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No top-up history yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {topupHistory.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex justify-between py-2 text-gray-700"
                >
                  <span>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </span>
                  <span className="font-semibold text-green-600">
                    +{formatKes(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Expenditure history
          </h2>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : expenditureHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No expenditure history yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {expenditureHistory.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex justify-between py-2 text-gray-700"
                >
                  <div>
                    <span className="block">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transaction.description || "Expenditure"}
                    </span>
                  </div>
                  <span className="font-semibold text-red-600">
                    -{formatKes(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {PAYMENTS_ENABLED && showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-700">
                Deposit funds
              </h3>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#01B0F1]"
                  placeholder="e.g. 500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!depositLoading) {
                      setShowPopup(false);
                      setDepositAmount("");
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
                  disabled={depositLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="rounded-lg bg-[#015575] px-4 py-2 text-white disabled:opacity-70"
                >
                  {depositLoading ? "Processing..." : "Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {PAYMENTS_ENABLED && showCheckoutModal && depositInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-700">
                Deposit initiated
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {depositInfo.checkout_url && (
              <button
                type="button"
                onClick={() => window.open(depositInfo.checkout_url, "_blank")}
                className="w-full rounded-lg bg-[#015575] py-2 text-white"
              >
                Complete payment
              </button>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage("")}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWallet;
