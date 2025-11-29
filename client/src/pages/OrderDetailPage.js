import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline';

import {
  fetchOrderById,
  cancelOrder,
  selectCurrentOrder,
  selectOrdersLoading
} from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrdersLoading);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (cancelReason.trim()) {
      await dispatch(cancelOrder({
        orderId: order._id,
        reason: cancelReason
      }));
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'picking':
      case 'picked':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return <TruckIcon className="h-6 w-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'text-yellow-700 bg-yellow-100';
      case 'picking':
      case 'picked':
        return 'text-blue-700 bg-blue-100';
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return 'text-orange-700 bg-orange-100';
      case 'delivered':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const canCancelOrder = () => {
    return order && ['pending', 'confirmed', 'picking'].includes(order.orderStatus);
  };

  const getTimelineSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: CheckCircleIcon },
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircleIcon },
      { key: 'picking', label: 'Being Picked', icon: ClockIcon },
      { key: 'picked', label: 'Picked', icon: CheckCircleIcon },
      { key: 'ready_for_delivery', label: 'Ready for Delivery', icon: TruckIcon },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: TruckIcon },
      { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
    ];

    const statusOrder = ['pending', 'confirmed', 'picking', 'picked', 'ready_for_delivery', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.orderStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center">
                {getStatusIcon(order.orderStatus)}
                <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                  {formatStatus(order.orderStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Timeline */}
          {order.orderStatus !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h2>
              
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                          ? 'bg-green-100 text-green-600 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    
                    <span className={`mt-2 text-xs font-medium text-center ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    
                    {index < timelineSteps.length - 1 && (
                      <div className={`absolute top-5 left-10 w-20 h-0.5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Estimated Delivery */}
              {order.estimatedDeliveryTime && order.orderStatus !== 'delivered' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Estimated Delivery: {new Date(order.estimatedDeliveryTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                    <p className="text-sm text-gray-500">{item.product?.brand}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm font-medium text-gray-900">₹{item.price}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                    {item.pickingStatus && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        item.pickingStatus === 'picked' 
                          ? 'bg-green-100 text-green-800'
                          : item.pickingStatus === 'picking'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatStatus(item.pickingStatus)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center mb-4">
                <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Delivery Address</h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-900">{order.customer?.name}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress.street}
                </p>
                <p className="text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                </p>
                {order.deliveryAddress.landmark && (
                  <p className="text-sm text-gray-500">
                    Near: {order.deliveryAddress.landmark}
                  </p>
                )}
                <div className="flex items-center mt-3 pt-3 border-t">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{order.deliveryAddress.contactPhone}</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center mb-4">
                <CreditCardIcon className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{order.pricing.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₹{order.pricing.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">
                    {order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}
                  </span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-₹{order.pricing.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{order.pricing.total}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Payment Method: </span>
                    <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600">Payment Status: </span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Notes */}
          {(order.customerNotes || order.specialInstructions) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h2>
              
              {order.specialInstructions && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Special Instructions:</h3>
                  <p className="text-gray-600 mt-1">{order.specialInstructions}</p>
                </div>
              )}
              
              {order.customerNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Additional Notes:</h3>
                  <p className="text-gray-600 mt-1">{order.customerNotes}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {canCancelOrder() && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn-outline border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
              
              {order.orderStatus === 'delivered' && !order.customerRating && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="btn-primary"
                >
                  Rate Order
                </button>
              )}
              
              {order.orderStatus === 'delivered' && (
                <button className="btn-outline">
                  Reorder Items
                </button>
              )}
              
              <button
                onClick={() => window.print()}
                className="btn-outline"
              >
                Print Order
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this order? Please provide a reason.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Delivery taking too long">Delivery taking too long</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
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
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rate Your Order
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className={`h-8 w-8 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  >
                    <StarIcon />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                className="flex-1 btn-primary"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
