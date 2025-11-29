import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  CubeIcon,
  TruckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import { 
  fetchAvailableOrders, 
  fetchMyOrders,
  selectAvailableOrders,
  selectActiveOrders,
  selectOrdersStats
} from '../store/slices/ordersSlice';
import { selectUser, selectIsAvailable } from '../store/slices/authSlice';
import { 
  getLowStockItems, 
  getInventorySummary,
  selectLowStockItems,
  selectInventorySummary 
} from '../store/slices/inventorySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAvailable = useSelector(selectIsAvailable);
  const availableOrders = useSelector(selectAvailableOrders);
  const activeOrders = useSelector(selectActiveOrders);
  const ordersStats = useSelector(selectOrdersStats);
  const lowStockItems = useSelector(selectLowStockItems);
  const inventorySummary = useSelector(selectInventorySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAvailableOrders()),
          dispatch(fetchMyOrders({ status: 'active' })),
          dispatch(getLowStockItems()),
          dispatch(getInventorySummary())
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const stats = [
    {
      name: 'Available Orders',
      stat: availableOrders.length,
      icon: ShoppingBagIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/orders?filter=available'
    },
    {
      name: 'Active Orders',
      stat: activeOrders.length,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      href: '/orders?filter=active'
    },
    {
      name: "Today's Picks",
      stat: ordersStats.todayPicked,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/orders?filter=completed'
    },
    {
      name: 'Low Stock Items',
      stat: lowStockItems.length,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bg: 'bg-red-100',
      href: '/inventory?filter=low_stock'
    },
  ];

  const quickActions = [
    {
      name: 'Scan QR Code',
      description: 'Scan bin or product QR codes',
      icon: QrCodeIcon,
      href: '/scanner',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'View Orders',
      description: 'Browse available orders',
      icon: ShoppingBagIcon,
      href: '/orders',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Manage Inventory',
      description: 'Check stock levels',
      icon: CubeIcon,
      href: '/inventory',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Bin Management',
      description: 'Organize warehouse locations',
      icon: TruckIcon,
      href: '/bins',
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your warehouse today
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-2 rounded-full text-sm font-medium ${
            isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>
          <Link
            to="/scanner"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Quick Scan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.href}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div>
                <div className={`absolute ${item.bg} rounded-md p-3`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {item.name}
                </p>
              </div>
              <div className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {item.stat}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 ${action.bg} rounded-md p-2`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {action.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Available Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Orders</h3>
              <Link
                to="/orders"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {availableOrders.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New orders will appear here when they're ready for picking.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority === 'urgent' 
                            ? 'bg-red-100 text-red-800'
                            : order.priority === 'high'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Inventory Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inventory Alerts</h3>
              <Link
                to="/inventory?filter=low_stock"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All good!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No low stock alerts at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lowStockItems.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.inventory?.availableStock || 0}
                        </p>
                      </div>
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white shadow rounded-lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Performance Summary</h3>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {ordersStats.todayPicked}
              </p>
              <p className="text-sm text-gray-500">Orders picked today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {ordersStats.averagePickTime || 0}
              </p>
              <p className="text-sm text-gray-500">Avg. pick time (min)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                {ordersStats.weeklyPicked}
              </p>
              <p className="text-sm text-gray-500">This week's total</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
