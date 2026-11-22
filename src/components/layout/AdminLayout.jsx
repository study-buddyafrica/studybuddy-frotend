import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Calendar, 
  GraduationCap,
  School,
  UserCheck,
  UserCircle,
  LogOut
} from 'lucide-react';
import { authStorage } from "../../services/authStorage";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
  { name: 'Students', href: '/admin/students', icon: School },
  { name: 'Parents', href: '/admin/parents', icon: UserCircle },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: UserCheck },
  { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Tutors', href: '/admin/tutors', icon: GraduationCap },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStorage.clearTokens();
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="app-dashboard min-h-screen bg-[#F8FAFC] font-josefin">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-50 w-64 border-r border-[#013349] bg-[#013349]">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
            <span className="font-lilita text-xl text-white">Admin</span>
          </div>
          <nav className="flex flex-1 flex-col px-4 pb-4 pt-4">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-1 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          item.href === location.pathname
                            ? 'bg-[#01B0F1] text-white shadow-sm'
                            : 'text-[#B4C8DC] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${item.href === location.pathname ? 'bg-white/15 text-white' : 'bg-white/5 text-[#B4C8DC]'}`}>
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-800 p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-md bg-red-50 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="sticky top-0 z-20 border-b border-blue-300 bg-gradient-to-r from-[#f2f9fe] to-[#cdeafd] shadow-sm">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-lilita text-2xl text-[#015575] sm:text-3xl">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="min-h-[calc(100vh-5rem)] bg-[#F8FAFC] py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
