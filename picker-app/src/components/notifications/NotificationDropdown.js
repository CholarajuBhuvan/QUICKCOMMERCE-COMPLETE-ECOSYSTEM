import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  BellIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';

const NotificationDropdown = ({ notifications = [], onClose }) => {
  const dispatch = useDispatch();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_available':
      case 'order_assigned':
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
      case 'stock_low':
      case 'stock_out':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'system_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'order_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'border-l-red-500 bg-red-50';
    if (priority === 'high') return 'border-l-yellow-500 bg-yellow-50';
    
    switch (type) {
      case 'order_available':
      case 'order_assigned':
        return 'border-l-blue-500 bg-blue-50';
      case 'stock_low':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'system_alert':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    onClose();
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(
                  notification.type,
                  notification.priority
                )} ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`mt-1 text-sm ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                      
                      {notification.priority === 'urgent' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                      
                      {notification.priority === 'high' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          High
                        </span>
                      )}
                    </div>

                    {/* Action buttons for specific notification types */}
                    {notification.type === 'order_available' && notification.data?.orderId && (
                      <div className="mt-3">
                        <Link
                          to={`/orders/${notification.data.orderId}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-600 bg-green-100 hover:bg-green-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Order
                        </Link>
                      </div>
                    )}

                    {notification.type === 'stock_low' && notification.data?.productId && (
                      <div className="mt-3">
                        <Link
                          to={`/inventory?product=${notification.data.productId}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Check Inventory
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDropdown;
