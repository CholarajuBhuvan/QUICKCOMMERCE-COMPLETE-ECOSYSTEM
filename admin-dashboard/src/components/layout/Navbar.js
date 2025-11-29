import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  PowerIcon,
  MagnifyingGlassIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

import { logout, selectUser } from '../../store/slices/authSlice';
import { selectIsConnected, selectConnectionStatus } from '../../store/slices/socketSlice';
import { 
  selectUnreadCount, 
  selectNotificationsIsOpen, 
  toggleNotifications,
  selectRecentNotifications 
} from '../../store/slices/notificationsSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const unreadCount = useSelector(selectUnreadCount);
  const notificationsOpen = useSelector(selectNotificationsIsOpen);
  const recentNotifications = useSelector(selectRecentNotifications);
  const isConnected = useSelector(selectIsConnected);
  const connectionStatus = useSelector(selectConnectionStatus);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <WifiIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'error':
        return <SignalSlashIcon className="h-5 w-5 text-red-500" />;
      default:
        return <SignalSlashIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Logo for mobile */}
          <div className="flex items-center lg:hidden">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">Admin</span>
          </div>

          {/* Search */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search orders, customers, products..."
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="hidden sm:flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
          </div>

          {/* Quick stats */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>24 Active</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => dispatch(toggleNotifications())}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <NotificationDropdown
                  notifications={recentNotifications}
                  onClose={() => dispatch(toggleNotifications())}
                />
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onBlur={() => setUserMenuOpen(false)}
                >
                  <div className="py-1">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Administrator
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      System Settings
                    </Link>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <PowerIcon className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Search..."
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
