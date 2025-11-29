import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  QrCodeIcon,
  ChartBarIcon,
  UserIcon,
  XMarkIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

import { setSidebarOpen, selectSidebarOpen, selectSidebarCollapsed } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationsSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const unreadCount = useSelector(selectUnreadCount);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      current: location.pathname === '/',
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingBagIcon,
      current: location.pathname.startsWith('/orders'),
      badge: 0, // Will be populated with pending orders count
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: CubeIcon,
      current: location.pathname === '/inventory',
    },
    {
      name: 'Bins',
      href: '/bins',
      icon: ArchiveBoxIcon,
      current: location.pathname === '/bins',
    },
    {
      name: 'QR Scanner',
      href: '/scanner',
      icon: QrCodeIcon,
      current: location.pathname === '/scanner',
    },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
          width: sidebarCollapsed ? 80 : 320,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 lg:relative lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">QuickMart</h1>
                  <p className="text-sm text-gray-500">Picker Interface</p>
                </div>
              )}
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`flex-shrink-0 h-5 w-5 ${
                        item.current ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Quick stats */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Today's Picks</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Average Time</span>
                  <span className="font-semibold text-gray-900">3.2 min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-200">
            <div className={`space-y-2 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className={`group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {!sidebarCollapsed && <span className="ml-3">Profile</span>}
              </Link>

              {/* Notification indicator */}
              {unreadCount > 0 && (
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {!sidebarCollapsed && (
                    <span className="ml-2 text-xs text-red-600 font-medium">
                      {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
