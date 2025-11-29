import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

import { selectUser } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationsSlice';

const Sidebar = () => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const unreadCount = useSelector(selectUnreadCount);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

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
      name: 'Customers',
      href: '/customers',
      icon: UsersIcon,
      current: location.pathname === '/customers',
    },
    {
      name: 'Products',
      href: '/products',
      icon: CubeIcon,
      current: location.pathname === '/products',
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: ArchiveBoxIcon,
      current: location.pathname === '/inventory',
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: UserGroupIcon,
      current: location.pathname === '/staff',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      current: location.pathname === '/analytics',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      current: location.pathname === '/settings',
    },
  ];

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
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
          width: 320,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-white shadow-lg z-50 lg:relative lg:translate-x-0 w-80"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <BuildingStorefrontIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">QuickMart</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 h-6 w-6 ${
                        item.current ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <span className="ml-3">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* System Status */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">System Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-semibold text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Users</span>
                <span className="font-semibold text-gray-900">247</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Server Load</span>
                <span className="font-semibold text-gray-900">23%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                Export Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                System Backup
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                View Logs
              </button>
            </div>

            {/* Notification indicator */}
            {unreadCount > 0 && (
              <div className="mt-4 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-red-600 font-medium">
                  {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
