import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { fetchMyDeliveries, acceptDelivery, selectMyDeliveries, selectDeliveriesLoading } from '../store/slices/deliveriesSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DeliveriesPage = () => {
  const dispatch = useDispatch();
  const deliveries = useSelector(selectMyDeliveries);
  const loading = useSelector(selectDeliveriesLoading);
  const { isAvailable } = useSelector(state => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nearest');

  useEffect(() => {
    dispatch(fetchMyDeliveries());
  }, [dispatch]);

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      await dispatch(acceptDelivery(deliveryId)).unwrap();
      toast.success('Delivery accepted successfully!');
    } catch (error) {
      toast.error('Failed to accept delivery');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    if (sortBy === 'nearest') {
      return (a.distance || 0) - (b.distance || 0);
    } else if (sortBy === 'time') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'earnings') {
      return (b.deliveryFee || 0) - (a.deliveryFee || 0);
    }
    return 0;
  });

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading deliveries..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Deliveries</h1>
          <p className="text-gray-600 mt-1">
            {!isAvailable && (
              <span className="text-orange-600 font-medium">
                ⚠️ You're currently offline - Go online to accept deliveries
              </span>
            )}
            {isAvailable && sortedDeliveries.length > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {sortedDeliveries.length} deliveries available
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="nearest">Nearest First</option>
            <option value="time">Oldest First</option>
            <option value="earnings">Highest Earnings</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      {sortedDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No deliveries found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {!isAvailable 
              ? 'Go online to start receiving delivery requests'
              : searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back soon for new delivery opportunities'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {sortedDeliveries.map((delivery) => (
              <motion.div
                key={delivery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{delivery.orderId?.slice(-8)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(delivery.status)}`}>
                      {delivery.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600 font-bold text-xl">
                      <CurrencyDollarIcon className="h-5 w-5" />
                      {delivery.deliveryFee?.toFixed(2) || '5.00'}
                    </div>
                    <p className="text-xs text-gray-500">Delivery Fee</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{delivery.customer?.name || 'Customer'}</p>
                      <p className="text-sm text-gray-600">{delivery.deliveryAddress?.street}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.zipCode}
                      </p>
                    </div>
                  </div>

                  {delivery.distance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {delivery.distance.toFixed(1)} km away
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Pickup: {new Date(delivery.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Items to deliver:</p>
                  <div className="space-y-1">
                    {delivery.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-gray-900 font-medium">x{item.quantity}</span>
                      </div>
                    ))}
                    {delivery.items?.length > 3 && (
                      <p className="text-xs text-gray-500">+{delivery.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    to={`/deliveries/${delivery._id}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  {delivery.status === 'pending' && isAvailable && (
                    <button
                      onClick={() => handleAcceptDelivery(delivery._id)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Accept
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
