import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UserIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { 
  fetchDeliveryDetails, 
  startDelivery,
  markDelivered,
  selectCurrentDelivery,
  selectDeliveriesLoading
} from '../store/slices/deliveriesSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const delivery = useSelector(selectCurrentDelivery);
  const loading = useSelector(selectDeliveriesLoading);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchDeliveryDetails(id));
    }
  }, [dispatch, id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      if (newStatus === 'in_transit') {
        await dispatch(startDelivery(id)).unwrap();
      } else if (newStatus === 'delivered') {
        await dispatch(markDelivered(id)).unwrap();
      }
      toast.success(`Delivery status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'assigned', label: 'Assigned', completed: false },
      { key: 'picked_up', label: 'Picked Up', completed: false },
      { key: 'in_transit', label: 'In Transit', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false }
    ];

    const statusOrder = ['assigned', 'picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(delivery?.status);

    steps.forEach((step, idx) => {
      step.completed = idx <= currentIndex;
    });

    return steps;
  };

  const getNextAction = () => {
    const statusFlow = {
      assigned: { next: 'picked_up', label: 'Mark as Picked Up', icon: ShoppingBagIcon },
      picked_up: { next: 'in_transit', label: 'Start Delivery', icon: TruckIcon },
      in_transit: { next: 'delivered', label: 'Complete Delivery', icon: CheckCircleIcon }
    };
    return statusFlow[delivery?.status];
  };

  if (loading || !delivery) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading delivery details..." />
      </div>
    );
  }

  const nextAction = getNextAction();
  const steps = getStatusSteps();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/deliveries')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Delivery #{delivery.orderId?.slice(-8)}
            </h1>
            <p className="text-sm text-gray-600">Order placed {new Date(delivery.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 font-bold text-2xl">
            <CurrencyDollarIcon className="h-6 w-6" />
            {delivery.deliveryFee?.toFixed(2) || '5.00'}
          </div>
          <p className="text-xs text-gray-500">Delivery Fee</p>
        </div>
      </div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${(steps.filter(s => s.completed).length - 1) / (steps.length - 1) * 100}%`
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.completed
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-sm text-gray-400">{idx + 1}</span>
                  )}
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  step.completed ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Action Button */}
        {nextAction && (
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => handleStatusUpdate(nextAction.next)}
              disabled={updatingStatus}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingStatus ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                <>
                  <nextAction.icon className="h-5 w-5 mr-2" />
                  {nextAction.label}
                </>
              )}
            </button>
          </div>
        )}

        {delivery.status === 'delivered' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-900">Delivery Completed!</h3>
                <p className="text-sm text-green-700">Great job! Payment has been processed.</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{delivery.customer?.name || 'Customer'}</p>
                <p className="text-sm text-gray-600">{delivery.customer?.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{delivery.customer?.phone || 'N/A'}</p>
                <a
                  href={`tel:${delivery.customer?.phone}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Call Customer
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                <p className="text-sm text-gray-600">{delivery.deliveryAddress?.street}</p>
                <p className="text-sm text-gray-600">
                  {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.zipCode}
                </p>
                {delivery.deliveryAddress?.instructions && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Note: {delivery.deliveryAddress.instructions}
                  </p>
                )}
              </div>
            </div>

            <Link
              to={`/map?delivery=${delivery._id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
            >
              <MapPinIcon className="h-4 w-4 mr-2" />
              View on Map
            </Link>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {delivery.items?.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    ${item.price?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${delivery.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">${delivery.deliveryFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                ${((delivery.totalAmount || 0) + (delivery.deliveryFee || 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium text-gray-900">
                {delivery.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pickup Location */}
      {delivery.pickupLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h2>
          <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{delivery.pickupLocation.name || 'Store'}</p>
              <p className="text-sm text-gray-600">{delivery.pickupLocation.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                {delivery.distance ? `${delivery.distance.toFixed(1)} km from your location` : 'Distance calculating...'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeliveryDetailPage;
