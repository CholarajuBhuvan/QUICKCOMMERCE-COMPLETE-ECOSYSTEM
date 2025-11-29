import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  QrCodeIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  CubeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

import {
  fetchOrderDetails,
  startPicking,
  markItemPicked,
  completeOrder,
  reportIssue,
  selectCurrentOrder,
  selectOrdersLoading,
  selectActionLoading
} from '../store/slices/ordersSlice';
import { selectUser } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ItemPickingCard from '../components/orders/ItemPickingCard';
import OrderTimeline from '../components/orders/OrderTimeline';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrdersLoading);
  const actionLoading = useSelector(selectActionLoading);
  const user = useSelector(selectUser);
  
  const [activeTab, setActiveTab] = useState('items');
  const [collectionBinId, setCollectionBinId] = useState('');
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  const handleStartPicking = async () => {
    try {
      await dispatch(startPicking(id)).unwrap();
      toast.success('Started picking order');
    } catch (error) {
      toast.error('Failed to start picking');
    }
  };

  const handleItemPicked = async (itemIndex, binId, itemNotes = '') => {
    try {
      await dispatch(markItemPicked({ 
        orderId: id, 
        itemIndex, 
        binId, 
        notes: itemNotes 
      })).unwrap();
    } catch (error) {
      toast.error('Failed to mark item as picked');
    }
  };

  const handleReportIssue = async (itemIndex, issue, description) => {
    try {
      await dispatch(reportIssue({ 
        orderId: id, 
        itemIndex, 
        issue, 
        description 
      })).unwrap();
      toast.success('Issue reported');
    } catch (error) {
      toast.error('Failed to report issue');
    }
  };

  const handleCompleteOrder = async () => {
    if (!collectionBinId) {
      toast.error('Please select a collection bin');
      return;
    }

    try {
      await dispatch(completeOrder({ 
        orderId: id, 
        collectionBinId, 
        notes 
      })).unwrap();
      toast.success('Order completed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to complete order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'assigned':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'picking':
        return <ClockIcon className="h-5 w-5 text-orange-500 animate-pulse" />;
      case 'picked':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The order you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const canStartPicking = order.orderStatus === 'assigned' && order.picker === user?.id;
  const isPicking = order.orderStatus === 'picking' && order.picker === user?.id;
  const isCompleted = ['picked', 'ready_for_delivery', 'out_for_delivery', 'delivered'].includes(order.orderStatus);
  
  const pickedItems = order.items?.filter(item => item.picked) || [];
  const totalItems = order.items?.length || 0;
  const pickingProgress = totalItems > 0 ? (pickedItems.length / totalItems) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Created {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
            {getStatusIcon(order.orderStatus)}
            <span className="ml-2 capitalize">{order.orderStatus.replace('_', ' ')}</span>
          </span>
          
          {canStartPicking && (
            <button
              onClick={handleStartPicking}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Picking
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isPicking && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Picking Progress</span>
            <span className="text-sm text-gray-500">
              {pickedItems.length} of {totalItems} items picked
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${pickingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'items'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Items ({totalItems})
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'timeline'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Timeline
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'items' && (
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <ItemPickingCard
                      key={index}
                      item={item}
                      itemIndex={index}
                      orderStatus={order.orderStatus}
                      onItemPicked={handleItemPicked}
                      onReportIssue={handleReportIssue}
                      disabled={!isPicking}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'timeline' && (
                <OrderTimeline order={order} />
              )}
            </div>
          </div>

          {/* Complete Order Section */}
          {isPicking && pickedItems.length === totalItems && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-900">
                    All items picked!
                  </h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Bin ID *
                  </label>
                  <input
                    type="text"
                    value={collectionBinId}
                    onChange={(e) => setCollectionBinId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter collection bin ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Any additional notes..."
                  />
                </div>
                
                <button
                  onClick={handleCompleteOrder}
                  disabled={!collectionBinId || actionLoading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Completing...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery:</span>
                <span className="font-medium">₹{order.deliveryFee?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Info</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{order.customer?.name || 'Customer'}</span>
              </div>
              
              {order.customer?.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{order.customer.phone}</span>
                </div>
              )}
              
              {order.deliveryAddress && (
                <div className="flex items-start">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.area}, {order.deliveryAddress.city}</p>
                    <p>{order.deliveryAddress.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => navigate('/scanner')}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Scan QR Code
              </button>
              
              <button
                onClick={() => navigate('/bins')}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CubeIcon className="h-4 w-4 mr-2" />
                Find Product Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
