import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  TruckIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import {
  fetchMyOrders,
  cancelOrder,
  setFilters,
  selectOrders,
  selectOrdersPagination,
  selectOrdersFilters,
  selectOrdersLoading
} from '../store/slices/ordersSlice';
import LoadingSpinner, { ListSkeleton } from '../components/common/LoadingSpinner';

const OrdersPage = () => {
  const dispatch = useDispatch();
  
  const orders = useSelector(selectOrders);
  const pagination = useSelector(selectOrdersPagination);
  const filters = useSelector(selectOrdersFilters);
  const loading = useSelector(selectOrdersLoading);
  
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyOrders({ ...filters, status: selectedStatus }));
  }, [dispatch, filters, selectedStatus]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    dispatch(setFilters({ status }));
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel && cancelReason.trim()) {
      await dispatch(cancelOrder({
        orderId: orderToCancel._id,
        reason: cancelReason
      }));
      setShowCancelModal(false);
      setOrderToCancel(null);
      setCancelReason('');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'picking':
      case 'picked':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'picking':
      case 'picked':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed', 'picking'].includes(order.orderStatus);
  };

  const statusTabs = [
    { id: '', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'picking', label: 'Picking', count: 0 },
    { id: 'out_for_delivery', label: 'Delivering', count: 0 },
    { id: 'delivered', label: 'Delivered', count: 0 },
    { id: 'cancelled', label: 'Cancelled', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleStatusFilter(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedStatus === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      selectedStatus === tab.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <ListSkeleton items={5} />
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {selectedStatus ? `No ${formatStatus(selectedStatus).toLowerCase()} orders.` : 'You haven\'t placed any orders yet.'}
            </p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {getStatusIcon(order.orderStatus)}
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {formatStatus(order.orderStatus)}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{order.pricing.total}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                            <img
                              src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                              alt={item.product?.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {item.product?.name} × {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 px-3">
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Delivery Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                      </p>
                    </div>

                    {/* Order Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order Timeline</h4>
                        <div className="space-y-2">
                          {order.timeline.slice(-3).map((event, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <span className="text-gray-600">
                                {event.notes} - {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Link>

                      {order.orderStatus === 'delivered' && (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                          Reorder
                        </button>
                      )}

                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.orderStatus === 'delivered' && !order.customerRating && (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors">
                          Rate Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + Math.max(1, pagination.currentPage - 2);
                if (page > pagination.totalPages) return null;
                
                return (
                  <button
                    key={page}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      page === pagination.currentPage
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowCancelModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Cancel Order
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to cancel order #{orderToCancel?.orderNumber}? 
                  Please provide a reason for cancellation.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found better price elsewhere">Found better price elsewhere</option>
                    <option value="Delivery taking too long">Delivery taking too long</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Payment issues">Payment issues</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={confirmCancelOrder}
                    disabled={!cancelReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;
