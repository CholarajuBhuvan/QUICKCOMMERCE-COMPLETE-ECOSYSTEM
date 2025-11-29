import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchRevenueChart,
  fetchTopProducts,
  fetchRealtimeActivity,
  selectDashboardStats,
  selectRecentOrders,
  selectRevenueChart,
  selectTopProducts,
  selectRealtimeActivity,
  selectDashboardLoading,
  setChartPeriod
} from '../store/slices/dashboardSlice';
import LoadingSpinner, { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const recentOrders = useSelector(selectRecentOrders);
  const revenueChart = useSelector(selectRevenueChart);
  const topProducts = useSelector(selectTopProducts);
  const realtimeActivity = useSelector(selectRealtimeActivity);
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    // Load dashboard data
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentOrders());
    dispatch(fetchRevenueChart());
    dispatch(fetchTopProducts());
    dispatch(fetchRealtimeActivity());

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats());
      dispatch(fetchRealtimeActivity());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const statsCards = [
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'increase',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: '+3.1%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Avg Order Value',
      value: `₹${stats.averageOrderValue}`,
      change: '-2.3%',
      changeType: 'decrease',
      icon: ChartBarIcon,
      color: 'bg-yellow-500'
    }
  ];

  const orderStatusData = [
    { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Completed', value: stats.completedOrders, color: '#10b981' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' }
  ];

  const handleChartPeriodChange = (period) => {
    dispatch(setChartPeriod(period));
    dispatch(fetchRevenueChart(period));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your e-commerce control center</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => handleChartPeriodChange(period)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    revenueChart.period === period
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">Order Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer?.name} • {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{order.totalAmount?.toFixed(2)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No product data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.sales} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{product.revenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-lg shadow"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Real-time Activity</h3>
        </div>
        <div className="p-6">
          {realtimeActivity.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {realtimeActivity.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'product' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
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
