import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  ChartBarIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

import { 
  fetchAvailableDeliveries, 
  fetchMyDeliveries,
  selectAvailableDeliveries,
  selectInProgressDeliveries,
  selectDeliveriesStats,
  selectActiveDelivery
} from '../store/slices/deliveriesSlice';
import { selectUser, selectIsAvailable } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAvailable = useSelector(selectIsAvailable);
  const availableDeliveries = useSelector(selectAvailableDeliveries);
  const inProgressDeliveries = useSelector(selectInProgressDeliveries);
  const deliveriesStats = useSelector(selectDeliveriesStats);
  const activeDelivery = useSelector(selectActiveDelivery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAvailableDeliveries()),
          dispatch(fetchMyDeliveries({ status: 'active' }))
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
      name: 'Available Deliveries',
      stat: availableDeliveries.length,
      icon: TruckIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/deliveries?filter=available'
    },
    {
      name: 'In Progress',
      stat: inProgressDeliveries.length,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      href: '/deliveries?filter=in_progress'
    },
    {
      name: "Today's Deliveries",
      stat: deliveriesStats.todayDeliveries,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/deliveries?filter=completed'
    },
    {
      name: 'Total Earnings',
      stat: `₹${deliveriesStats.todayEarnings || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/earnings'
    },
  ];

  const quickActions = [
    {
      name: 'View Deliveries',
      description: 'Browse available deliveries',
      icon: TruckIcon,
      href: '/deliveries',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Open Map',
      description: 'View delivery locations',
      icon: MapPinIcon,
      href: '/map',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Earnings Report',
      description: 'Check your earnings',
      icon: CurrencyRupeeIcon,
      href: '/earnings',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Performance',
      description: 'View delivery stats',
      icon: ChartBarIcon,
      href: '/profile?tab=stats',
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
            Here's your delivery dashboard for today
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-2 rounded-full text-sm font-medium ${
            isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full inline-block mr-2 ${
              isAvailable ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>
          <Link
            to="/deliveries"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <TruckIcon className="h-4 w-4 mr-2" />
            View Deliveries
          </Link>
        </div>
      </div>

      {/* Active Delivery Alert */}
      {activeDelivery && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BoltIcon className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-orange-900">
                  Active Delivery in Progress
                </h3>
                <p className="text-orange-700">
                  Order #{activeDelivery.orderNumber} - {activeDelivery.customer?.name}
                </p>
              </div>
            </div>
            <Link
              to={`/deliveries/${activeDelivery._id}`}
              className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200"
            >
              Continue Delivery
            </Link>
          </div>
        </motion.div>
      )}

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

        {/* Available Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Deliveries</h3>
              <Link
                to="/deliveries"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {availableDeliveries.length === 0 ? (
              <div className="text-center py-6">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New delivery assignments will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableDeliveries.slice(0, 5).map((delivery) => (
                  <Link
                    key={delivery._id}
                    to={`/deliveries/${delivery._id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{delivery.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {delivery.customer?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {delivery.deliveryAddress?.area}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ₹{delivery.deliveryFee?.toFixed(2) || '40.00'}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          delivery.priority === 'urgent' 
                            ? 'bg-red-100 text-red-800'
                            : delivery.priority === 'high'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Today's Performance</h3>
              <StarIcon className="h-6 w-6 text-yellow-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deliveries Completed</span>
                <span className="text-lg font-semibold text-gray-900">
                  {deliveriesStats.todayDeliveries}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Earnings Today</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{deliveriesStats.todayEarnings || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Average Rating</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-900 mr-1">
                    {deliveriesStats.averageRating || '5.0'}
                  </span>
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Completion Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {deliveriesStats.completionRate || 100}%
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/earnings"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                View Detailed Report
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white shadow rounded-lg"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          
          {inProgressDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h4>
              <p className="mt-1 text-sm text-gray-500">
                No deliveries in progress at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressDeliveries.map((delivery) => (
                <div key={delivery._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{delivery.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {delivery.customer?.name} • {delivery.deliveryAddress?.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Started {formatDistanceToNow(new Date(delivery.startedAt || delivery.createdAt), { addSuffix: true })}
                    </p>
                    <Link
                      to={`/deliveries/${delivery._id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
