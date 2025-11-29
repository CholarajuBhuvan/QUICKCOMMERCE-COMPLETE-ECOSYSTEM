import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.notifications || []);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QuickMart</h1>
              <p className="text-xs text-blue-600 font-medium">Rider Portal</p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Rider'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'rider'}</p>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
