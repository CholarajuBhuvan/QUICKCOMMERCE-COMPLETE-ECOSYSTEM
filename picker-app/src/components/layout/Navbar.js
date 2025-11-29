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
  QrCodeIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

import { logout, selectUser, selectIsAvailable, updateAvailability } from '../../store/slices/authSlice';
import { toggleSidebar, selectSidebarOpen } from '../../store/slices/uiSlice';
import { 
  selectUnreadCount, 
  selectNotificationsIsOpen, 
  toggleNotifications,
  selectRecentNotifications 
} from '../../store/slices/notificationsSlice';
import { selectIsConnected, selectConnectionStatus } from '../../store/slices/socketSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAvailable = useSelector(selectIsAvailable);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const unreadCount = useSelector(selectUnreadCount);
  const notificationsOpen = useSelector(selectNotificationsIsOpen);
  const recentNotifications = useSelector(selectRecentNotifications);
  const isConnected = useSelector(selectIsConnected);
  const connectionStatus = useSelector(selectConnectionStatus);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };

  const handleToggleAvailability = () => {
    dispatch(updateAvailability(!isAvailable));
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
          {/* Mobile menu button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Logo for mobile */}
          <div className="flex items-center lg:hidden">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">Picker</span>
          </div>

          {/* Quick actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/scanner"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Scan QR
            </Link>
          </div>
        </div>

        {/* Center - Availability Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={handleToggleAvailability}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isAvailable ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="hidden sm:flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
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
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleToggleAvailability}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className={`h-4 w-4 mr-3 rounded-full ${isAvailable ? 'bg-red-500' : 'bg-green-500'}`} />
                      {isAvailable ? 'Go Unavailable' : 'Go Available'}
                    </button>

                    <Link
                      to="/scanner"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
                    >
                      <QrCodeIcon className="h-4 w-4 mr-3" />
                      QR Scanner
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
    </header>
  );
};

export default Navbar;
