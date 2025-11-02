import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-50 w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Admin</span>
          </div>
          <nav className="flex flex-1 flex-col px-4 pb-4 pt-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-1 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={`group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          item.href === location.pathname
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${item.href === location.pathname ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-800 p-4">
          <button className="flex w-full items-center justify-center rounded-md bg-red-50 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="bg-white shadow">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;