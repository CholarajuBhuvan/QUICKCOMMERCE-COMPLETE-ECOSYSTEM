import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock order data - in real app, fetch from API
    const mockOrder = {
      _id: id,
      orderNumber: 'ORD-001',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567'
      },
      items: [
        {
          _id: '1',
          name: 'Organic Bananas',
          image: '/api/placeholder/80/80',
          quantity: 2,
          price: 3.99,
          total: 7.98
        },
        {
          _id: '2',
          name: 'Whole Milk (1 Gallon)',
          image: '/api/placeholder/80/80',
          quantity: 1,
          price: 4.49,
          total: 4.49
        }
      ],
      subtotal: 12.47,
      tax: 1.25,
      deliveryFee: 2.99,
      totalAmount: 16.71,
      status: 'picking',
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      createdAt: '2024-01-15T10:30:00Z',
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      timeline: [
        {
          status: 'placed',
          timestamp: '2024-01-15T10:30:00Z',
          description: 'Order placed successfully'
        },
        {
          status: 'confirmed',
          timestamp: '2024-01-15T10:32:00Z',
          description: 'Order confirmed and sent to warehouse'
        },
        {
          status: 'picking',
          timestamp: '2024-01-15T10:45:00Z',
          description: 'Order is being picked by warehouse staff'
        }
      ],
      picker: {
        name: 'Alice Smith',
        id: 'PKR-001'
      },
      estimatedDelivery: '2024-01-15T11:30:00Z'
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'text-blue-600';
      case 'confirmed': return 'text-yellow-600';
      case 'picking': return 'text-purple-600';
      case 'delivering': return 'text-orange-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
      case 'confirmed': return <ClockIcon className="w-5 h-5" />;
      case 'picking': return <CheckCircleIcon className="w-5 h-5" />;
      case 'delivering': return <TruckIcon className="w-5 h-5" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <button
            onClick={() => navigate('/orders')}
            className="text-purple-600 hover:text-purple-800 inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <PrinterIcon className="w-4 h-4 mr-2" />
          Print Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${item.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{event.status}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-900">{order.customer.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.customer.phone}</span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">{order.deliveryAddress.street}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.paymentMethod}</span>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Staff Assignment */}
          {order.picker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Staff Assignment</h2>
              </div>
              <div className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Picker</p>
                  <p className="font-medium text-gray-900">{order.picker.name}</p>
                  <p className="text-sm text-gray-500">ID: {order.picker.id}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Estimated Delivery</h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatDate(order.estimatedDelivery)}
                </p>
                <p className="text-sm text-gray-500 mt-1">10-minute delivery promise</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
