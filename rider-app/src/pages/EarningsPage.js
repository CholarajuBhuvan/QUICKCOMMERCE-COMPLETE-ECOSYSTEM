import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { selectMyDeliveries } from '../store/slices/deliveriesSlice';
import { selectUser } from '../store/slices/authSlice';

const EarningsPage = () => {
  const deliveries = useSelector(selectMyDeliveries);
  const user = useSelector(selectUser);
  const [timeFilter, setTimeFilter] = useState('week');

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  // Calculate earnings
  const calculateEarnings = () => {
    const now = new Date();
    let filtered = completedDeliveries;

    if (timeFilter === 'today') {
      filtered = completedDeliveries.filter(d => {
        const deliveryDate = new Date(d.deliveredAt || d.updatedAt);
        return deliveryDate.toDateString() === now.toDateString();
      });
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = completedDeliveries.filter(d => {
        const deliveryDate = new Date(d.deliveredAt || d.updatedAt);
        return deliveryDate >= weekAgo;
      });
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = completedDeliveries.filter(d => {
        const deliveryDate = new Date(d.deliveredAt || d.updatedAt);
        return deliveryDate >= monthAgo;
      });
    }

    const total = filtered.reduce((sum, d) => sum + (d.deliveryFee || 5), 0);
    const count = filtered.length;
    const avgPerDelivery = count > 0 ? total / count : 0;

    return { total, count, avgPerDelivery, filtered };
  };

  const earnings = calculateEarnings();

  // Group deliveries by date for chart
  const getEarningsByDate = () => {
    const grouped = {};
    earnings.filtered.forEach(delivery => {
      const date = new Date(delivery.deliveredAt || delivery.updatedAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date, amount: 0, count: 0 };
      }
      grouped[date].amount += delivery.deliveryFee || 5;
      grouped[date].count += 1;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const earningsByDate = getEarningsByDate();

  const stats = [
    {
      name: 'Total Earnings',
      value: `$${earnings.total.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Deliveries Completed',
      value: earnings.count,
      icon: TruckIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Average per Delivery',
      value: `$${earnings.avgPerDelivery.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Total Distance',
      value: `${completedDeliveries.reduce((sum, d) => sum + (d.distance || 0), 0).toFixed(1)} km`,
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your delivery earnings and performance</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex space-x-2">
          {['today', 'week', 'month', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Earnings</h2>
        
        {earningsByDate.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No earnings data for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {earningsByDate.map((day, idx) => {
              const maxAmount = Math.max(...earningsByDate.map(d => d.amount));
              const width = (day.amount / maxAmount) * 100;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{day.date}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">${day.amount.toFixed(2)}</span>
                      <span className="text-gray-500 ml-2">({day.count} deliveries)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Completed Deliveries</h2>
        
        {earnings.filtered.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No completed deliveries in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings.filtered.slice(0, 10).map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{delivery.orderId?.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(delivery.deliveredAt || delivery.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {delivery.distance?.toFixed(1) || '0.0'} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {delivery.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                      ${(delivery.deliveryFee || 5).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payout Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Payout</h3>
            <p className="text-sm text-gray-700 mb-4">
              Your earnings will be transferred to your account every Friday.
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Minimum payout: $50.00</p>
              <p>• Processing time: 2-3 business days</p>
              <p>• Payment method: Bank transfer</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-blue-600">${earnings.total.toFixed(2)}</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Request Payout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EarningsPage;
