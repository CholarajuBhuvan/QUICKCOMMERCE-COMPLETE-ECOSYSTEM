import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics = {
      overview: {
        totalRevenue: 125430.50,
        revenueGrowth: 12.5,
        totalOrders: 1847,
        ordersGrowth: 8.3,
        totalCustomers: 923,
        customersGrowth: 15.2,
        avgOrderValue: 67.89,
        avgOrderGrowth: -2.1
      },
      revenueData: [
        { date: '2024-01-08', revenue: 12450, orders: 180 },
        { date: '2024-01-09', revenue: 15230, orders: 220 },
        { date: '2024-01-10', revenue: 18790, orders: 275 },
        { date: '2024-01-11', revenue: 16540, orders: 245 },
        { date: '2024-01-12', revenue: 19870, orders: 295 },
        { date: '2024-01-13', revenue: 22340, orders: 325 },
        { date: '2024-01-14', revenue: 20150, orders: 290 },
      ],
      categoryData: [
        { name: 'Fruits & Vegetables', value: 35, revenue: 43800 },
        { name: 'Dairy & Eggs', value: 25, revenue: 31350 },
        { name: 'Meat & Poultry', value: 20, revenue: 25070 },
        { name: 'Bakery', value: 12, revenue: 15050 },
        { name: 'Beverages', value: 8, revenue: 10030 }
      ],
      hourlyData: [
        { hour: '6AM', orders: 45 },
        { hour: '7AM', orders: 78 },
        { hour: '8AM', orders: 125 },
        { hour: '9AM', orders: 165 },
        { hour: '10AM', orders: 198 },
        { hour: '11AM', orders: 220 },
        { hour: '12PM', orders: 245 },
        { hour: '1PM', orders: 210 },
        { hour: '2PM', orders: 185 },
        { hour: '3PM', orders: 160 },
        { hour: '4PM', orders: 140 },
        { hour: '5PM', orders: 175 },
        { hour: '6PM', orders: 195 },
        { hour: '7PM', orders: 225 },
        { hour: '8PM', orders: 190 },
        { hour: '9PM', orders: 135 },
        { hour: '10PM', orders: 85 }
      ],
      topProducts: [
        { name: 'Organic Bananas', sales: 245, revenue: 978.55 },
        { name: 'Whole Milk', sales: 189, revenue: 848.61 },
        { name: 'Chicken Breast', sales: 156, revenue: 2026.44 },
        { name: 'Greek Yogurt', sales: 134, revenue: 936.66 },
        { name: 'Sourdough Bread', sales: 98, revenue: 587.02 }
      ],
      performance: {
        avgDeliveryTime: 8.5,
        customerSatisfaction: 4.7,
        orderAccuracy: 98.2,
        onTimeDelivery: 94.8
      }
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track performance metrics and business insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.overview.totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.overview.revenueGrowth > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${analytics.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(analytics.overview.revenueGrowth)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.overview.totalOrders)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.overview.ordersGrowth > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${analytics.overview.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(analytics.overview.ordersGrowth)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.overview.totalCustomers)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.overview.customersGrowth > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${analytics.overview.customersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(analytics.overview.customersGrowth)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.overview.avgOrderValue)}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.overview.avgOrderGrowth > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${analytics.overview.avgOrderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(analytics.overview.avgOrderGrowth)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hourly Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Avg Delivery Time</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{analytics.performance.avgDeliveryTime} min</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{analytics.performance.customerSatisfaction}/5.0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Order Accuracy</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{analytics.performance.orderAccuracy}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{analytics.performance.onTimeDelivery}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topProducts.map((product, index) => (
                  <tr key={product.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(product.sales)} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
