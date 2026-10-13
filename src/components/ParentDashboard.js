import { useState, useEffect } from "react";
import axios from "axios";
import {
  HomeIcon,
  UserGroupIcon,
  WalletIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { FHOST, refreshAccessToken } from "./constants/Functions.jsx";
import ParentProfileUpdate from "./parents/ParentProfileUpdate";
import DashboardHeader from "./layout/DashboardHeader.jsx";
import { authStorage } from "../services/authStorage";

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [showAddFundsToStudentModal, setShowAddFundsToStudentModal] =
    useState(false);
  const [showUpcomingPaymentsModal, setShowUpcomingPaymentsModal] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    dateOfBirth: "",
    className: "",
  });
  const [studentFundAmount, setStudentFundAmount] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({
    fullName: "",
    className: "",
    email: "",
  });

  const fetchParentBalance = async () => {
    try {
      if (!userInfo) return;

      let token;
      try {
        token = await refreshAccessToken();
      } catch {
        authStorage.clearTokens();
        window.location.href = "/";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const walletResponse = await axios.get(`${FHOST}/api/wallet/`, {
        headers,
      });
      if (walletResponse.data?.results?.length > 0) {
        const wallet = walletResponse.data.results[0];
        setWalletBalance(parseFloat(wallet.balance) || 0);
      }

      const transactionsResponse = await axios.get(
        `${FHOST}/api/transactions/`,
        { headers },
      );
      const transactionsData = transactionsResponse.data?.results || [];
      setTransactions(
        transactionsData.map((tx) => ({
          id: tx.id,
          date: new Date(tx.timestamp || tx.created_at),
          description: tx.description || "Transaction",
          type: tx.transaction_type,
          amount: parseFloat(tx.amount || 0),
          status: tx.status,
          payment_method: tx.payment_method,
        })),
      );
    } catch (error) {
      console.error("Failed to refresh parent balance:", error);
    }
  };

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);

      const checkProfileCompletion = async () => {
        try {
          const profileResponse = await axios.get(
            `${FHOST}/api/parent/profile/update/`,
            {
              headers: {
                Authorization: `Bearer ${authStorage.getAccessToken()}`,
              },
            },
          );
          if (profileResponse.data) {
            const profileData = profileResponse.data;
            const isComplete = !!(
              profileData.profile_picture &&
              profileData.full_name &&
              profileData.birth_date
            );
            setProfileComplete(isComplete);
            if (!isComplete) {
              setShowProfileUpdateModal(true);
              setActiveTab("profileupdate");
            }
          }
        } catch {
          setProfileComplete(false);
          setShowProfileUpdateModal(true);
          setActiveTab("profileupdate");
        }
      };
      checkProfileCompletion();
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const onProfileUpdate = () => {
      const updatedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (updatedUserInfo) {
        setUserInfo(updatedUserInfo);
        fetchParentBalance();
        setProfileComplete(true);
        setShowProfileUpdateModal(false);
      }
    };
    window.addEventListener("profile-updated", onProfileUpdate);
    return () => window.removeEventListener("profile-updated", onProfileUpdate);
  }, []);

  useEffect(() => {
    if (userInfo?.id) {
      fetchParentBalance();
    }
  }, [userInfo?.id]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!userInfo) return;
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${FHOST}/users/parent/${userInfo.id}/students`,
        );
        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        try {
          const stored = JSON.parse(localStorage.getItem("userInfo"));
          if (stored?.id) {
            const res = await axios.get(
              `${FHOST}/users/parent/${stored.id}/students`,
            );
            setStudents(res.data.students || []);
          }
        } catch (_) {
          /* ignore */
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [userInfo]);

  const handleStudentFormChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleEditStudentFormChange = (e) => {
    setEditStudentForm({
      ...editStudentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const username = studentForm.fullName.toLowerCase().replace(/\s+/g, "_");
    const payload = {
      parent_id: userInfo.id,
      email: `${username}@studybuddy.com`,
      full_name: studentForm.fullName,
      birth_date: studentForm.dateOfBirth,
      password: "defaultPassword123#",
      confirm_password: "defaultPassword123#",
      username,
    };

    try {
      await axios.post(`${FHOST}/users/parent/register-student`, payload);
      const res = await axios.get(
        `${FHOST}/users/parent/${userInfo.id}/students`,
      );
      setStudents(res.data.students || []);
      setShowAddStudentModal(false);
      setStudentForm({ fullName: "", dateOfBirth: "", className: "" });
      alert("Student registered successfully!");
    } catch (error) {
      if (error.response) {
        alert(
          `Error: ${error.response.data.message || "Check console for details"}`,
        );
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${FHOST}/users/student/${editingStudent.id}`,
        editStudentForm,
      );
      setStudents(
        students.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...editStudentForm }
            : student,
        ),
      );
      if (selectedStudent?.id === editingStudent.id) {
        setSelectedStudent({ ...selectedStudent, ...editStudentForm });
      }
      setShowStudentDetailsModal(false);
      setEditingStudent(null);
      alert("Student updated successfully!");
    } catch (error) {
      console.error("Failed to update student:", error);
      alert("Failed to update student. Please try again.");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    try {
      setDepositLoading(true);
      const token = await refreshAccessToken();
      if (!token) {
        alert("Authentication required. Please login again.");
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
        { headers },
      );

      if (response.status === 200 || response.status === 201) {
        setDepositInfo(response.data);
        setShowCheckoutModal(true);
        setShowFundModal(false);
        setDepositAmount("");
        fetchParentBalance();
      }
    } catch (error) {
      console.error("Error initiating deposit:", error);
      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to initiate deposit. Please try again.",
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const handleAddFundsToStudent = async (e) => {
    e.preventDefault();
    const amount = parseFloat(studentFundAmount);
    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (amount > walletBalance) {
      alert("Insufficient funds in your wallet. Please add funds first.");
      return;
    }

    try {
      await axios.post(`${FHOST}/payments/parent_child_transfer`, {
        parent_id: userInfo.id,
        child_id: selectedStudent.id,
        amount,
      });
      setWalletBalance((prev) => prev - amount);
      setTransactions((prev) => [
        {
          id: Date.now(),
          date: new Date(),
          type: "withdrawal",
          amount: -amount,
          description: `Funds transferred to ${selectedStudent.full_name}`,
        },
        ...prev,
      ]);
      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, balance: (student.balance || 0) + amount }
            : student,
        ),
      );
      setSelectedStudent({
        ...selectedStudent,
        balance: (selectedStudent.balance || 0) + amount,
      });
      setShowAddFundsToStudentModal(false);
      setStudentFundAmount("");
      alert(
        `Successfully transferred Ksh ${amount.toLocaleString()} to ${selectedStudent.full_name}'s account!`,
      );
    } catch (error) {
      console.error("Failed to add funds to student:", error);
      alert("Failed to add funds to student. Please try again.");
    }
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setEditingStudent(student);
    setEditStudentForm({
      fullName: student.full_name || "",
      className: student.class || "",
      email: student.email || "",
    });
    setShowStudentDetailsModal(true);
  };

  const handleLogout = () => {
    authStorage.clearTokens();
    window.location.href = "/";
  };

  const navigation = [
    { name: "Home", key: "dashboard", icon: HomeIcon },
    { name: "Profile", key: "profileupdate", icon: UserIcon },
  ];

  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#01B0F1]" />
      </div>
    );
  }

  const displayName =
    userInfo.first_name ||
    userInfo.full_name?.split?.(" ")?.[0] ||
    userInfo.username ||
    "";

  const renderHub = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#01B0F1]" />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Greeting + wallet / M-Pesa */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-josefin text-sm font-semibold uppercase tracking-wide text-[#01B0F1]">
                Parent portal
              </p>
              <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
                Hello{displayName ? `, ${displayName}` : ""}
              </h1>
              <p className="mt-1 max-w-md font-josefin text-sm text-slate-500">
                Link learners, fund the family wallet with M-Pesa, and follow
                this week&apos;s activity.
              </p>
            </div>
            <div className="min-w-[200px] rounded-2xl bg-gradient-to-br from-[#013349] to-[#015575] px-6 py-4 text-white shadow-md">
              <p className="font-josefin text-xs uppercase tracking-wide text-white/70">
                Wallet balance
              </p>
              <p className="font-lilita text-2xl">
                KES {Number(walletBalance || 0).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => setShowFundModal(true)}
                className="mt-3 w-full rounded-full bg-[#01B0F1] px-4 py-2 font-josefin text-sm font-semibold text-white hover:bg-[#0199d4]"
              >
                Deposit with M-Pesa
              </button>
            </div>
          </div>
        </div>

        {/* Learners */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-lilita text-xl text-[#015575]">
                Your learners
              </h2>
              <p className="font-josefin text-sm text-slate-500">
                Add or open a child account linked to this parent profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#015575] px-4 py-2 font-josefin text-sm font-semibold text-white hover:bg-[#01B0F1]"
            >
              <PlusIcon className="h-4 w-4" />
              Add learner
            </button>
          </div>

          {students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] px-4 py-10 text-center">
              <UserGroupIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 font-josefin text-sm text-slate-500">
                No learners linked yet. Add a student to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleViewStudentDetails(student)}
                  className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 text-left transition hover:border-[#01B0F1]/40 hover:shadow-sm"
                >
                  <p className="font-lilita text-lg text-[#015575]">
                    {student.full_name || student.username}
                  </p>
                  <p className="font-josefin text-sm text-slate-500">
                    {student.class || student.grade || "Grade not set"}
                  </p>
                  <p className="mt-2 font-josefin text-xs font-semibold text-[#01B0F1]">
                    Balance: KES {Number(student.balance || 0).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* This week */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-lilita text-xl text-[#015575]">This week</h2>
              <p className="mt-1 font-josefin text-sm text-slate-500">
                Attendance and session activity will show here as classes are
                booked.
              </p>
            </div>
            {upcomingPayments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUpcomingPaymentsModal(true)}
                className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 font-josefin text-xs font-semibold text-orange-700"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                {upcomingPayments.length} payment
                {upcomingPayments.length > 1 ? "s" : ""}
              </button>
            )}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] px-4 py-8 text-center font-josefin text-sm text-slate-500">
            {upcomingPayments.length > 0
              ? `${upcomingPayments.length} upcoming payment(s) scheduled.`
              : "No sessions or payments scheduled for this week yet."}
          </div>
        </div>

        {/* Recent wallet activity (compact) */}
        {transactions.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-[#01B0F1]" />
              <h2 className="font-lilita text-xl text-[#015575]">
                Recent wallet activity
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between py-3 font-josefin text-sm"
                >
                  <span className="text-slate-600">
                    {tx.description}
                    <span className="ml-2 text-xs text-slate-400">
                      {tx.date instanceof Date
                        ? tx.date.toLocaleDateString()
                        : ""}
                    </span>
                  </span>
                  <span
                    className={
                      tx.amount >= 0
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-slate-700"
                    }
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {Number(tx.amount).toLocaleString()} KES
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "profileupdate") {
      return (
        <ParentProfileUpdate
          userInfo={userInfo}
          onDone={() => {
            setActiveTab("dashboard");
            setShowProfileUpdateModal(false);
          }}
        />
      );
    }
    return renderHub();
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-josefin">
      {/* Sidebar — onboarding tokens */}
      <aside
        className={`fixed inset-y-0 z-50 w-[280px] transform bg-[#013349] shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#01B0F1]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col px-5 py-8 lg:py-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
              <img
                src="/images/logo.png"
                alt="StudyBuddy"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h2 className="font-lilita text-xl text-white">
              Parent <span className="text-[#81CFFF]">Dashboard</span>
            </h2>
            <p className="mt-1 font-josefin text-[11px] uppercase tracking-wider text-white/50">
              Family portal
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left font-josefin text-sm transition-all ${
                    active
                      ? "bg-[#01B0F1] text-white shadow-lg shadow-[#01B0F1]/30"
                      : "text-[#B4C8DC] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-josefin text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div className="flex flex-1 flex-col lg:pl-[280px]">
        <DashboardHeader
          title={navigation.find((n) => n.key === activeTab)?.name || "Home"}
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onViewProfile={() => setActiveTab("profileupdate")}
          onEditProfile={() => setActiveTab("profileupdate")}
          profilePicture={userInfo?.profile_picture}
        />

        {showProfileUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#01B0F1]/10">
                  <UserIcon className="h-10 w-10 text-[#01B0F1]" />
                </div>
                <h2 className="mb-4 font-lilita text-3xl text-[#015575]">
                  Complete Your Profile
                </h2>
                <p className="mb-6 font-josefin text-lg text-gray-600">
                  Before you can continue, please complete your profile
                  information.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileUpdateModal(false);
                    setActiveTab("profileupdate");
                  }}
                  className="rounded-xl bg-gradient-to-r from-[#01B0F1] to-[#015575] px-8 py-3 font-lilita text-white transition-all hover:shadow-lg"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 space-y-6 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Deposit modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Deposit funds
              </h3>
              <button
                type="button"
                onClick={() => setShowFundModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium text-gray-700">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#01B0F1]"
                  placeholder="e.g. 500"
                />
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 font-josefin text-sm text-blue-700">
                You&apos;ll receive an STK push on your registered M-Pesa
                number.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!depositLoading) {
                      setShowFundModal(false);
                      setDepositAmount("");
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  disabled={depositLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="rounded-lg bg-[#015575] px-4 py-2 text-white hover:bg-[#01B0F1] disabled:opacity-70"
                >
                  {depositLoading ? "Processing..." : "Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckoutModal && depositInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Deposit initiated
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 font-josefin text-sm">
              {depositInfo.message && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                  {depositInfo.message}
                </div>
              )}
              {depositInfo.amount_details && (
                <div className="space-y-1 rounded-lg bg-gray-50 p-4">
                  <p>
                    <strong>Amount:</strong> Ksh{" "}
                    {depositInfo.amount_details.original_amount}
                  </p>
                  <p>
                    <strong>Fee:</strong> Ksh{" "}
                    {depositInfo.amount_details.fee_amount}
                  </p>
                  <p>
                    <strong>Total to pay:</strong> Ksh{" "}
                    {depositInfo.amount_details.you_pay}
                  </p>
                  <p>
                    <strong>You get:</strong> Ksh{" "}
                    {depositInfo.amount_details.you_get}
                  </p>
                  {depositInfo.transaction_id && (
                    <p>
                      <strong>Transaction ID:</strong>{" "}
                      {depositInfo.transaction_id}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {depositInfo.checkout_url && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(depositInfo.checkout_url, "_blank")
                  }
                  className="rounded-lg bg-[#015575] px-4 py-2 text-white hover:bg-[#01B0F1]"
                >
                  Complete payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add student modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Add learner
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={studentForm.fullName}
                  onChange={handleStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium text-gray-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={studentForm.dateOfBirth}
                  onChange={handleStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium text-gray-700">
                  Class / grade
                </label>
                <input
                  type="text"
                  name="className"
                  value={studentForm.className}
                  onChange={handleStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#015575] py-3 font-josefin font-semibold text-white hover:bg-[#01B0F1]"
              >
                Add learner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Student details modal */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Learner details
              </h3>
              <button
                type="button"
                onClick={() => setShowStudentDetailsModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editStudentForm.fullName}
                  onChange={handleEditStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium">
                  Class
                </label>
                <input
                  type="text"
                  name="className"
                  value={editStudentForm.className}
                  onChange={handleEditStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
              <div>
                <label className="mb-1 block font-josefin text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editStudentForm.email}
                  onChange={handleEditStudentFormChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#015575] py-3 font-josefin font-semibold text-white hover:bg-[#01B0F1]"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentDetailsModal(false);
                    setShowAddFundsToStudentModal(true);
                  }}
                  className="flex-1 rounded-lg border border-[#015575] py-3 font-josefin font-semibold text-[#015575] hover:bg-[#F8FAFC]"
                >
                  Transfer funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer to student */}
      {showAddFundsToStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Transfer to learner
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFundsToStudentModal(false)}
                className="p-2 text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4 font-josefin text-sm text-slate-600">
              {selectedStudent.full_name} · Wallet KES{" "}
              {Number(walletBalance || 0).toLocaleString()}
            </p>
            <form onSubmit={handleAddFundsToStudent} className="space-y-4">
              <input
                type="number"
                min="100"
                value={studentFundAmount}
                onChange={(e) => setStudentFundAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder="Amount (KES)"
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-3 font-josefin font-semibold text-white hover:bg-emerald-700"
              >
                Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming payments */}
      {showUpcomingPaymentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-lilita text-xl text-[#015575]">
                Upcoming payments
              </h3>
              <button
                type="button"
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className="p-2 text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {upcomingPayments.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="font-josefin text-slate-500">
                  No upcoming payments
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <li
                    key={payment.id}
                    className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 font-josefin text-sm"
                  >
                    <p className="font-semibold text-slate-800">
                      {payment.student}
                    </p>
                    <p className="text-slate-600">{payment.description}</p>
                    <p className="mt-1 font-semibold text-orange-700">
                      KES {Number(payment.amount || 0).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 font-lilita text-xl text-red-600">
              Confirm deletion
            </h3>
            <p className="mb-6 font-josefin text-slate-700">
              Are you sure you want to permanently delete your account?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Account deletion not implemented.");
                  setShowDeleteConfirmation(false);
                }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
