import { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import {
  HomeIcon,
  UserGroupIcon,
  WalletIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightCircleIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  EyeIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { FHOST, refreshAccessToken } from "./constants/Functions.jsx";
import ParentFeedback from "./parents/ParentFeedback.jsx";
import ParentProfileUpdate from "./parents/ParentProfileUpdate";
import DashboardHeader from "./layout/DashboardHeader.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const ParentDashboard = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [showAddFundsToStudentModal, setShowAddFundsToStudentModal] =
    useState(false);
  const [showUpcomingPaymentsModal, setShowUpcomingPaymentsModal] =
    useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // State for dynamic data
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

  // New state for smart features
  const [fundAmount, setFundAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [studentFundAmount, setStudentFundAmount] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // Refresh parent wallet balance and transactions (used after successful funding)
  const fetchParentBalance = async () => {
    try {
      if (!userInfo) return;

      let token;
      try {
        token = await refreshAccessToken();
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        window.location.href = "/";
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch wallet info using new API
      const walletResponse = await axios.get(`${FHOST}/api/wallet/`, {
        headers,
      });
      if (walletResponse.data?.results?.length > 0) {
        const wallet = walletResponse.data.results[0];
        setWalletBalance(parseFloat(wallet.balance) || 0);
      }

      // Fetch transactions using new API
      const transactionsResponse = await axios.get(
        `${FHOST}/api/transactions/`,
        { headers },
      );
      const transactionsData = transactionsResponse.data?.results || [];

      // Transform transactions to match the expected format
      const formattedTransactions = transactionsData.map((tx) => ({
        id: tx.id,
        date: new Date(tx.timestamp || tx.created_at),
        description: tx.description || "Transaction",
        type: tx.transaction_type,
        amount: parseFloat(tx.amount || 0),
        status: tx.status,
        payment_method: tx.payment_method,
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Failed to refresh parent balance:", error);
    }
  };
  const [editStudentForm, setEditStudentForm] = useState({
    fullName: "",
    className: "",
    email: "",
  });

  // New color scheme
  const primaryColor = "#00aae8";

  // Add this useEffect hook at the top of your component hooks
  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);

      // Check profile completion
      const checkProfileCompletion = async () => {
        try {
          const profileResponse = await axios.get(
            `${FHOST}/api/parent/profile/update/${storedUserInfo.id}/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            },
          );
          if (profileResponse.data) {
            const profileData = profileResponse.data;
            // Check if profile has required fields
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
        } catch (error) {
          // Profile doesn't exist or error - profile is incomplete
          setProfileComplete(false);
          setShowProfileUpdateModal(true);
          setActiveTab("profileupdate");
        }
      };
      checkProfileCompletion();
      // Fetch wallet balance and transactions
      fetchParentBalance();
    } else {
      // Redirect to login if no user info found
      window.location.href = "/";
    }
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const onProfileUpdate = () => {
      // Update userInfo from localStorage
      const updatedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (updatedUserInfo) {
        setUserInfo(updatedUserInfo);
        fetchParentBalance();
      }
    };
    window.addEventListener("profile-updated", onProfileUpdate);
    return () => window.removeEventListener("profile-updated", onProfileUpdate);
  }, []);

  // Fetch wallet data when userInfo changes
  useEffect(() => {
    if (userInfo?.id) {
      fetchParentBalance();
    }
  }, [userInfo?.id]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userInfo) return;

        setIsLoading(true);

        // Use userInfo.id from state
        const balanceRes = await axios.get(
          `${FHOST}/payments/wallet/${userInfo.id}`,
        );
        setWalletBalance(balanceRes.data.balance || 0);

        // Use userInfo.id from state
        const childrenRes = await axios.get(
          `${FHOST}/users/parent/${userInfo.id}/students`,
        );

        console.log(childrenRes.data);
        setStudents(childrenRes.data.students || []);

        // Set mock data for now - replace with actual API calls
        // setTransactions(mockTransactions);
        // setUpcomingPayments(mockUpcomingPayments);

        // If no students from API, use mock data for demonstration
        if (
          !childrenRes.data.students ||
          childrenRes.data.students.length === 0
        ) {
          // setStudents(mockStudentsWithBalances);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        const res = await axios.get(
          `${FHOST}/users/parent/${storedUserInfo.id}/students`,
        );
        setStudents(res.data.students || []);

        // If no students from API, use mock data for demonstration
        if (!res.data.students || res.data.students.length === 0) {
          // setStudents(mockStudentsWithBalances);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        // Use mock data if API fails
        //setStudents(mockStudentsWithBalances);
      }
    };

    fetchAll();
    if (userInfo) {
      fetchData();
    }
  }, [userInfo]);

  // Handle student form changes
  const handleStudentFormChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle edit student form changes
  const handleEditStudentFormChange = (e) => {
    setEditStudentForm({
      ...editStudentForm,
      [e.target.name]: e.target.value,
    });
  };

  // Submit new student
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
      username: username,
    };

    try {
      const response = await axios.post(
        `${FHOST}/users/parent/register-student`,
        payload,
      );

      const res = await axios.get(
        `${FHOST}/users/parent/${userInfo.id}/students`,
      );

      setStudents(res.data.students || []);
      console.log("New student added:", response.data);
      setShowAddStudentModal(false);
      setStudentForm({ fullName: "", dateOfBirth: "", className: "" });
      alert("Student registered successfully!");
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(
          `Error: ${error.response.data.message || "Check console for details"}`,
        );
      } else {
        console.error("Request failed:", error.message);
        alert("Network error. Please try again.");
      }
    }
  };

  // Edit student
  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      // API call to update student
      await axios.put(
        `${FHOST}/users/student/${editingStudent.id}`,
        editStudentForm,
      );

      // Update local state
      setStudents(
        students.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...editStudentForm }
            : student,
        ),
      );

      // Update selectedStudent if it's the same student
      if (selectedStudent && selectedStudent.id === editingStudent.id) {
        setSelectedStudent({
          ...selectedStudent,
          ...editStudentForm,
        });
      }

      setShowStudentDetailsModal(false);
      setEditingStudent(null);
      alert("Student updated successfully!");
    } catch (error) {
      console.error("Failed to update student:", error);
      alert("Failed to update student. Please try again.");
    }
  };

  // Add funds to parent wallet
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
        const data = response.data;

        // store deposit info
        setDepositInfo(data);
        setShowCheckoutModal(true);

        // close amount modal
        setShowFundModal(false);

        // clear fields
        setDepositAmount("");

        fetchParentBalance();
      }
    } catch (error) {
      console.error("Error initiating deposit:", error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to initiate deposit. Please try again.";
      alert(errorMsg);
    } finally {
      setDepositLoading(false);
    }
  };

  // Add funds to student account
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
        amount: amount,
      });

      // Update parent wallet balance (reduce by the amount transferred)
      setWalletBalance((prev) => prev - amount);

      // Add transaction record for parent wallet
      const newTransaction = {
        id: Date.now(),
        date: new Date(),
        type: "withdrawal",
        amount: -amount,
        description: `Funds transferred to ${selectedStudent.full_name}`,
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      // Update local state to reflect the new student balance
      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, balance: (student.balance || 0) + amount }
            : student,
        ),
      );

      // Update selectedStudent balance for display
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

  // View student details
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setEditStudentForm({
      fullName: student.full_name,
      className: student.class || "",
      email: student.email || "",
    });
    setShowStudentDetailsModal(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmAccountDeletion = () => {
    alert("Account deletion logic");
    setShowDeleteConfirmation(false);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setActiveTab("profileupdate");
    // You can add additional logic here if needed
  };

  // Handle view profile
  const handleViewProfile = () => {
    setActiveTab("profileupdate");
    // You can add additional logic here if needed
  };

  // Chart data
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Expenses",
        data: [12000, 19000, 3000, 5000, 2000, 20000],
        borderColor: primaryColor,
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderColor: primaryColor,
      },
    ],
  };

  const spendingByCategoryData = {
    labels: ["Tutoring", "Materials", "Classes", "Other"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const navigation = [
    { name: "Dashboard", key: "dashboard", icon: HomeIcon },
    { name: "Students", key: "students", icon: UserGroupIcon },
    { name: "Wallet", key: "wallet", icon: WalletIcon },
    { name: "History", key: "history", icon: ClockIcon },
    { name: "Feedback", key: "feedback", icon: ChartBarIcon },
    { name: "Analytics", key: "analytics", icon: ChartBarIcon },
    { name: "Settings", key: "settings", icon: Cog6ToothIcon },
  ];

  // Don't render anything until auth check completes
  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    try {
      console.log("Rendering content for tab:", activeTab);
      switch (activeTab) {
        case "dashboard":
          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm">Total Students</h3>
                    <UserGroupIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {students.length}
                  </p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="mt-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Student
                  </button>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm">Wallet Balance</h3>
                    <WalletIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    Ksh {walletBalance.toLocaleString()}
                  </p>
                  <button
                    onClick={() => setShowFundModal(true)}
                    className="mt-4 flex items-center text-green-600 hover:text-green-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Funds
                  </button>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm">Active Classes</h3>
                    <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {students.reduce(
                      (acc, student) => acc + (student.activeClasses || 0),
                      0,
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Across all students
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm">Upcoming Payments</h3>
                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {upcomingPayments.length}
                  </p>
                  <button
                    onClick={() => setShowUpcomingPaymentsModal(true)}
                    className="mt-4 text-sm text-orange-600 hover:text-orange-700 flex items-center transition-colors">
                    View Schedule{" "}
                    <ArrowRightCircleIcon className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    Spending Overview
                  </h3>
                  <div className="w-full h-64">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: { color: "#374151" },
                          },
                        },
                        scales: {
                          y: {
                            ticks: { color: "#374151" },
                          },
                          x: {
                            ticks: { color: "#374151" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    Spending by Category
                  </h3>
                  <div className="w-full h-64">
                    <Doughnut
                      data={spendingByCategoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { color: "#374151" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                      Recent Students
                    </h3>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {students.length > 0 ? (
                      students.slice(0, 3).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleViewStudentDetails(student)}>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {student.full_name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {student.class || "No class assigned"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${student.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 py-4 text-center">
                        No students found. Add a student to get started.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    Recent Transactions
                  </h3>
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              tx.amount > 0 ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-gray-500">
                              {tx.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            tx.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                          {tx.amount > 0 ? "+" : ""}Ksh{" "}
                          {Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          );

        case "students":
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Student Management
                </h2>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                  <PlusIcon className="w-5 h-5" />
                  <span>Add New Student</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {student.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewStudentDetails(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(student);
                              setEditStudentForm({
                                fullName: student.full_name,
                                className: student.class || "",
                                email: student.email || "",
                              });
                              setShowStudentDetailsModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Student">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {student.full_name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Class: {student.class || "Not assigned"}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-blue-600 font-medium">
                              {student.progress || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Next Lesson</span>
                          <span className="text-green-600 font-medium">
                            {student.nextLesson
                              ? new Date(
                                  student.nextLesson,
                                ).toLocaleDateString()
                              : "None"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Account Balance</span>
                          <span className="text-green-600 font-medium">
                            Ksh {(student.balance || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowAddFundsToStudentModal(true);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm">
                          Add Funds to Account
                        </button>
                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem(
                                "view_as_student_id",
                                String(student.id),
                              );
                              if (student.full_name) {
                                localStorage.setItem(
                                  "view_as_student_name",
                                  String(student.full_name),
                                );
                              }
                              if (student.email) {
                                localStorage.setItem(
                                  "view_as_student_email",
                                  String(student.email),
                                );
                              }
                            } catch (e) {}
                            const url = `/student-dashboard?student_id=${student.id}`;
                            window.open(url, "_blank");
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm">
                          View Student Dashboard
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No students yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Get started by adding your first student to monitor their
                      progress and manage their education.
                    </p>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Your First Student</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );

        case "wallet":
          console.log("Rendering wallet tab");
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Wallet Overview
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">
                            Current Balance
                          </p>
                          <p className="text-3xl font-bold">
                            Ksh {walletBalance.toLocaleString()}
                          </p>
                        </div>
                        {WalletIcon ? (
                          <WalletIcon className="w-12 h-12 text-blue-200" />
                        ) : (
                          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">
                            Total Deposits
                          </p>
                          <p className="text-3xl font-bold">
                            Ksh{" "}
                            {transactions
                              .filter((tx) => tx.type === "deposit")
                              .reduce((sum, tx) => sum + (tx.amount || 0), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        {ArrowTrendingUpIcon ? (
                          <ArrowTrendingUpIcon className="w-12 h-12 text-green-200" />
                        ) : (
                          <div className="w-12 h-12 bg-green-200 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowFundModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      {PlusIcon ? (
                        <PlusIcon className="w-5 h-5" />
                      ) : (
                        <span>+</span>
                      )}
                      <span>Add Funds</span>
                    </button>
                    <button
                      onClick={() => setShowUpcomingPaymentsModal(true)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      {CalendarIcon ? (
                        <CalendarIcon className="w-5 h-5" />
                      ) : (
                        <span>📅</span>
                      )}
                      <span>View Payments</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Transaction History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Description
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Type
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {tx.date.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tx.type === "deposit"
                                  ? "bg-green-100 text-green-800"
                                  : tx.type === "withdrawal"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}>
                              {tx.type
                                ? tx.type.charAt(0).toUpperCase() +
                                  tx.type.slice(1)
                                : "Transaction"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-semibold ${
                                tx.type === "deposit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}>
                              {tx.type === "deposit" ? "+" : "-"}Ksh{" "}
                              {Math.abs(tx.amount || 0).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case "history":
          return (
            <div className="space-y-6">
              {/* Active Classes Overview */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-blue-600 mb-6">
                  Active Classes & Student Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">
                          {student.full_name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {student.class || "No class"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              Overall Progress
                            </span>
                            <span className="text-blue-600 font-medium">
                              {student.progress || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Balance</span>
                          <span className="text-green-600 font-medium">
                            Ksh {(student.balance || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Next Lesson</span>
                          <span className="text-green-600 font-medium">
                            {student.nextLesson
                              ? new Date(
                                  student.nextLesson,
                                ).toLocaleDateString()
                              : "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  Transaction History
                </h3>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tx.amount > 0 ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">
                            {tx.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          tx.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                        {tx.amount > 0 ? "+" : ""}Ksh{" "}
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case "feedback":
          return <ParentFeedback parentId={userInfo.id} students={students} />;

        case "analytics":
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    Spending Overview
                  </h3>
                  <div className="w-full h-64">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: { color: darkMode ? "#e5e7eb" : "#374151" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    Spending by Category
                  </h3>
                  <div className="w-full h-64">
                    <Doughnut
                      data={spendingByCategoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { color: darkMode ? "#e5e7eb" : "#374151" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  Student Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <div key={student.id} className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3">
                        <div className="relative w-full h-full">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeDasharray={`${student.progress || 0}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-800">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        {student.full_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {student.class || "No class"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case "profileupdate":
          return <ParentProfileUpdate userInfo={userInfo} />;
        case "settings":
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Account Settings
                </h2>
                <p className="text-gray-600">
                  Manage your profile and account preferences
                </p>
              </div>

              {/* Profile Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Profile Management
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Current Profile Info */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">
                      Current Profile
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Email:</span>
                        <span className="font-medium text-blue-800">
                          {userInfo?.email || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Username:</span>
                        <span className="font-medium text-blue-800">
                          {userInfo?.username || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={handleEditProfile}>
                    <div className="flex items-center">
                      <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Edit Profile
                        </h4>
                        <p className="text-sm text-gray-500">
                          Update your personal information
                        </p>
                      </div>
                    </div>
                    <ArrowRightCircleIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={handleViewProfile}>
                    <div className="flex items-center">
                      <EyeIcon className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          View Profile
                        </h4>
                        <p className="text-sm text-gray-500">
                          See your current profile details
                        </p>
                      </div>
                    </div>
                    <ArrowRightCircleIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Preferences
                  </h3>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SunIcon className="w-6 h-6 text-yellow-600 mr-3" />
                      <MoonIcon className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-800">Dark Mode</h4>
                        <p className="text-sm text-gray-500">
                          Toggle between light and dark themes
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        darkMode ? "bg-blue-600" : "bg-gray-300"
                      }`}>
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          darkMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Account Actions
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={handleLogout}>
                    <div className="flex items-center">
                      <ArrowRightOnRectangleIcon className="w-6 h-6 text-orange-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-800">Logout</h4>
                        <p className="text-sm text-gray-500">
                          Sign out of your account
                        </p>
                      </div>
                    </div>
                    <ArrowRightCircleIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  <div
                    className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={handleDeleteAccount}>
                    <div className="flex items-center">
                      <XMarkIcon className="w-6 h-6 text-red-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-red-800">
                          Delete Account
                        </h4>
                        <p className="text-sm text-red-600">
                          Permanently remove your account
                        </p>
                      </div>
                    </div>
                    <ArrowRightCircleIcon className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering content:", error);
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Something went wrong</p>
            <p className="text-sm">Please try refreshing the page</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } flex min-h-screen bg-gray-50 dark:bg-gray-900 font-josefin`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl w-64 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(to bottom, #e8f5ff, #d0ecff, #00abe8)",
        }}>
        <div className="px-6 py-8 lg:py-12">
          <h2 className="text-2xl font-lilita text-gray-900 text-center mb-8">
            Parent<span className="text-amber-600"> Dashboard</span>
          </h2>
          <nav className="mt-8 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  console.log("Switching to tab:", item.key);
                  setActiveTab(item.key);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors text-left ${
                  activeTab === item.key
                    ? "bg-blue-200 text-gray-900"
                    : "text-gray-900 hover:bg-blue-50"
                }`}>
                <item.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <DashboardHeader
          title={
            navigation.find((n) => n.key === activeTab)?.name || "Dashboard"
          }
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onViewProfile={handleViewProfile}
          onEditProfile={handleEditProfile}
        />

        {/* Profile Update Modal */}
        {showProfileUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#01B0F1]/10 mb-6">
                  <UserIcon className="h-10 w-10 text-[#01B0F1]" />
                </div>
                <h2 className="text-3xl font-lilita text-[#015575] mb-4">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600 font-josefin text-lg mb-6">
                  Before you can continue, please complete your profile
                  information.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowProfileUpdateModal(false);
                      setActiveTab("profileupdate");
                    }}
                    className="bg-gradient-to-r from-[#01B0F1] to-[#015575] text-white px-8 py-3 rounded-xl font-lilita hover:shadow-lg transition-all">
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6">
          {renderContent()}
        </main>
      </div>

      {/* Add Funds Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-600">
                Deposit Funds
              </h3>
              <button
                onClick={() => setShowFundModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
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
                You'll receive an STK push on your registered M-Pesa number.
                Confirm on your phone to complete the deposit.
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={depositLoading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {depositLoading ? "Processing..." : "Deposit"}
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
              <h3 className="text-xl font-semibold text-blue-600">
                Deposit Initiated
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  {depositInfo.message}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Amount:</strong> Ksh{" "}
                    {depositInfo.amount_details.original_amount}
                  </p>
                  <p>
                    <strong>Fee:</strong> Ksh{" "}
                    {depositInfo.amount_details.fee_amount}
                  </p>
                  <p>
                    <strong>Total to Pay:</strong> Ksh{" "}
                    {depositInfo.amount_details.you_pay}
                  </p>
                  <p>
                    <strong>You Get:</strong> Ksh{" "}
                    {depositInfo.amount_details.you_get}
                  </p>
                  <p>
                    <strong>Transaction ID:</strong>{" "}
                    {depositInfo.transaction_id}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Click the button below to complete your payment. You'll
                  receive an STK push on your M-Pesa number.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={() => window.open(depositInfo.checkout_url, "_blank")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-600">
                Add Student
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={studentForm.fullName}
                  onChange={handleStudentFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                  placeholder="Student's full name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={studentForm.dateOfBirth}
                  onChange={handleStudentFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <input
                  type="text"
                  name="className"
                  value={studentForm.className}
                  onChange={handleStudentFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                  placeholder="Class/Grade"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200">
                Add Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-600">
                Student Details
              </h3>
              <button
                onClick={() => setShowStudentDetailsModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Student Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editStudentForm.fullName}
                    onChange={handleEditStudentFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                    placeholder="Student's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={editStudentForm.className}
                    onChange={handleEditStudentFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                    placeholder="Class/Grade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editStudentForm.email}
                    onChange={handleEditStudentFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                    placeholder="Student's email"
                  />
                </div>

                <button
                  onClick={handleEditStudent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200">
                  Update Student
                </button>
              </div>

              {/* Lesson Progress */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Lesson Progress
                </h4>
                {selectedStudent &&
                  selectedStudent.lessons &&
                  selectedStudent.lessons
                    .filter((lesson) => lesson.active)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-800">
                            {lesson.subject}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                            <span className="text-sm text-gray-500">
                              {lesson.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                          <div
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Teacher: {lesson.teacher}</p>
                          <p>
                            Next Lesson:{" "}
                            {lesson.nextLesson
                              ? new Date(lesson.nextLesson).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds to Student Modal */}
      {showAddFundsToStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-600">
                Add Funds to Student Account
              </h3>
              <button
                onClick={() => setShowAddFundsToStudentModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                {selectedStudent.full_name}
              </h4>
              <p className="text-sm text-gray-600">
                Current Balance:{" "}
                <span className="font-semibold text-green-600">
                  Ksh {selectedStudent.balance || 0}
                </span>
              </p>
            </div>

            <form onSubmit={handleAddFundsToStudent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add (Ksh)
                </label>
                <input
                  type="number"
                  min="100"
                  value={studentFundAmount}
                  onChange={(e) => setStudentFundAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition duration-200">
                Add Funds to Student Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Payments Modal */}
      {showUpcomingPaymentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-orange-600">
                Upcoming Payments Schedule
              </h3>
              <button
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {payment.student}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {payment.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          Ksh {payment.amount.toLocaleString()}
                        </p>
                        <button
                          onClick={() => {
                            setShowUpcomingPaymentsModal(false);
                            setShowFundModal(true);
                            // Pre-fill the amount if needed
                            // setFundAmount(payment.amount.toString());
                          }}
                          className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors">
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming payments
                  </h4>
                  <p className="text-gray-500">
                    You're all caught up with payments!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-red-600">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="p-2 text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="mb-6 text-gray-800">
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={confirmAccountDeletion}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
