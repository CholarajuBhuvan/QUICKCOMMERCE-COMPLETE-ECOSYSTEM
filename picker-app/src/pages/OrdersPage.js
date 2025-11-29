import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

import {
  fetchAvailableOrders,
  fetchMyOrders,
  acceptOrder,
  selectAvailableOrders,
  selectMyOrders,
  selectOrdersPagination,
  selectOrdersFilters,
  selectOrdersLoading,
  selectActionLoading,
  setFilters,
  clearFilters
} from '../store/slices/ordersSlice';
import { selectIsAvailable } from '../store/slices/authSlice';
import LoadingSpinner, { CardSkeleton } from '../components/common/LoadingSpinner';
import OrderCard from '../components/orders/OrderCard';
import FilterPanel from '../components/orders/FilterPanel';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const availableOrders = useSelector(selectAvailableOrders);
  const myOrders = useSelector(selectMyOrders);
  const pagination = useSelector(selectOrdersPagination);
  const filters = useSelector(selectOrdersFilters);
  const loading = useSelector(selectOrdersLoading);
  const actionLoading = useSelector(selectActionLoading);
  const isAvailable = useSelector(selectIsAvailable);

  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (activeTab === 'available') {
      dispatch(fetchAvailableOrders());
    } else {
      dispatch(fetchMyOrders({ page: 1 }));
    }
  }, [dispatch, activeTab]);

  const handleAcceptOrder = async (orderId) => {
    if (!isAvailable) {
      alert('You must be available to accept orders');
      return;
    }
    
    try {
      await dispatch(acceptOrder(orderId)).unwrap();
      // Refresh available orders
      dispatch(fetchAvailableOrders());
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    // Refresh data with new filters
    if (activeTab === 'available') {
      dispatch(fetchAvailableOrders());
    } else {
      dispatch(fetchMyOrders({ page: 1, ...newFilters }));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
    // Refresh data
    if (activeTab === 'available') {
      dispatch(fetchAvailableOrders());
    } else {
      dispatch(fetchMyOrders({ page: 1 }));
    }
  };

  const filteredOrders = (activeTab === 'available' ? availableOrders : myOrders).filter(order => {
    if (!searchQuery) return true;
    return (
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case 'picking':
        return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case 'picked':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'picking':
        return 'bg-orange-100 text-orange-800';
      case 'picked':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and pick customer orders</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Orders ({availableOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-orders'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Orders ({myOrders.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Search orders by number or customer name..."
          />
        </div>
      </div>

      {/* Availability Warning */}
      {!isAvailable && activeTab === 'available' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                You're currently unavailable
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Set your status to available to accept new orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {activeTab === 'available' ? (
              <ClockIcon className="h-12 w-12" />
            ) : (
              <CheckCircleIcon className="h-12 w-12" />
            )}
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'available' ? 'No available orders' : 'No orders found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'available'
              ? 'New orders will appear here when they\'re ready for picking.'
              : 'Your accepted and completed orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.customer?.name || 'Customer'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">{order.orderStatus}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Items:</span>
                      <span className="font-medium">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="text-gray-700">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    
                    {activeTab === 'available' && (
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={!isAvailable || actionLoading}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Accept
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {activeTab === 'my-orders' && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={pagination.currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => dispatch(fetchMyOrders({ page: pagination.currentPage - 1 }))}
            >
              Previous
            </button>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => dispatch(fetchMyOrders({ page: pagination.currentPage + 1 }))}
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => dispatch(fetchMyOrders({ page: pagination.currentPage - 1 }))}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => dispatch(fetchMyOrders({ page: pagination.currentPage + 1 }))}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
