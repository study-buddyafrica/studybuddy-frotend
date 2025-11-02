import React, { useState, useRef, useEffect } from 'react';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

const DashboardHeader = ({ 
  title, 
  userInfo, 
  onLogout, 
  onToggleSidebar, 
  showSidebarToggle = true,
  notificationCount = 0,
  onViewProfile,
  onEditProfile
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
   <header className="bg-blue-300 dark:bg-blue-700 shadow-sm border-b border-blue-400 dark:border-blue-800 z-20 sticky top-0">

      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="mr-4 p-2 text-white hover:text-gray-200 lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-lilita text-white truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-white hover:text-gray-200 relative">
              <BellIcon className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
          
          {/* User Menu - Simple Icon Only with Round Background */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <UserIcon className="w-6 h-6" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userInfo?.full_name || userInfo?.username || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {userInfo?.email}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onViewProfile) onViewProfile();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-3" />
                    View Profile
                  </button>

                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onEditProfile) onEditProfile();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-3" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
