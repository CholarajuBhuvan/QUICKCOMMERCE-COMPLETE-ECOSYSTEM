import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CubeIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

import { acceptOrder, startPicking } from '../../store/slices/ordersSlice';
import { selectIsAvailable, selectUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const OrderCard = ({ order, onAccept, showActions = true, compact = false }) => {
  const dispatch = useDispatch();
  const isAvailable = useSelector(selectIsAvailable);
  const user = useSelector(selectUser);
  const [loading, setLoading] = React.useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case 'picking':
        return <ClockIcon className="h-4 w-4 text-orange-500 animate-pulse" />;
      case 'picked':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picking':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'picked':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAcceptOrder = async () => {
    if (!isAvailable) {
      alert('You must be available to accept orders');
      return;
    }

    setLoading(true);
    try {
      await dispatch(acceptOrder(order._id)).unwrap();
      if (onAccept) onAccept(order._id);
    } catch (error) {
      console.error('Failed to accept order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPicking = async () => {
    setLoading(true);
    try {
      await dispatch(startPicking(order._id)).unwrap();
    } catch (error) {
      console.error('Failed to start picking:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccept = order.orderStatus === 'pending' && isAvailable;
  const canStartPicking = order.orderStatus === 'assigned' && order.picker === user?.id;
  const isPicking = order.orderStatus === 'picking' && order.picker === user?.id;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
      order.priority === 'urgent' ? 'ring-2 ring-red-200' : ''
    }`}>
      <div className={compact ? 'p-4' : 'p-6'}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                #{order.orderNumber}
              </h3>
              {order.priority === 'urgent' && (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 space-x-3">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {order.customer?.name || 'Customer'}
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              <span className="ml-1.5 capitalize">{order.orderStatus.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
              {order.priority}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CubeIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {order.items?.length || 0}
              </span>
            </div>
            <span className="text-xs text-gray-500">Items</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CurrencyRupeeIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {order.totalAmount?.toFixed(2)}
              </span>
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {order.estimatedPickTime || '5'} min
              </span>
            </div>
            <span className="text-xs text-gray-500">Est. Time</span>
          </div>
        </div>

        {/* Item Preview */}
        {!compact && order.items && order.items.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items to pick:</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">
                    {item.product?.name || 'Product'}
                  </span>
                  <span className="text-gray-500 ml-2">×{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Address Preview */}
        {order.deliveryAddress && (
          <div className="mb-4 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Delivery:</span> {order.deliveryAddress.area}, {order.deliveryAddress.city}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              to={`/orders/${order._id}`}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-1.5" />
              View Details
            </Link>
            
            {canAccept && (
              <button
                onClick={handleAcceptOrder}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1.5" />
                    Accept Order
                  </>
                )}
              </button>
            )}

            {canStartPicking && (
              <button
                onClick={handleStartPicking}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1.5" />
                    Start Picking
                  </>
                )}
              </button>
            )}

            {isPicking && (
              <Link
                to={`/orders/${order._id}`}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <ClockIcon className="h-4 w-4 mr-1.5 animate-pulse" />
                Continue Picking
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
