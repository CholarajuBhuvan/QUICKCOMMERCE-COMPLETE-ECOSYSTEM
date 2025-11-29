import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  MapPinIcon,
  CubeIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ItemPickingCard = ({ 
  item, 
  itemIndex, 
  orderStatus, 
  onItemPicked, 
  onReportIssue, 
  disabled = false 
}) => {
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [binId, setBinId] = useState('');
  const [notes, setNotes] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartPicking = () => {
    setIsPickingMode(true);
  };

  const handleCancelPicking = () => {
    setIsPickingMode(false);
    setBinId('');
    setNotes('');
  };

  const handleConfirmPicked = async () => {
    if (!binId.trim()) {
      alert('Please enter the bin ID where you found the item');
      return;
    }

    setLoading(true);
    try {
      await onItemPicked(itemIndex, binId.trim(), notes.trim());
      setIsPickingMode(false);
      setBinId('');
      setNotes('');
    } catch (error) {
      console.error('Failed to mark item as picked:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueType || !issueDescription.trim()) {
      alert('Please select an issue type and provide a description');
      return;
    }

    setLoading(true);
    try {
      await onReportIssue(itemIndex, issueType, issueDescription.trim());
      setShowIssueForm(false);
      setIssueType('');
      setIssueDescription('');
    } catch (error) {
      console.error('Failed to report issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'damaged', label: 'Damaged Item' },
    { value: 'expired', label: 'Expired Product' },
    { value: 'wrong_item', label: 'Wrong Item in Bin' },
    { value: 'bin_not_found', label: 'Bin Not Found' },
    { value: 'other', label: 'Other Issue' },
  ];

  const getItemStatus = () => {
    if (item.picked) return 'picked';
    if (item.issue) return 'issue';
    if (isPickingMode) return 'picking';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picked':
        return 'bg-green-50 border-green-200';
      case 'issue':
        return 'bg-red-50 border-red-200';
      case 'picking':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'picked':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'issue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'picking':
        return <ClockIcon className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return <CubeIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const itemStatus = getItemStatus();

  return (
    <motion.div
      layout
      className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColor(itemStatus)}`}
    >
      {/* Item Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.product?.images?.[0] ? (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <CubeIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.product?.name || 'Product Name'}
            </h4>
            <p className="text-sm text-gray-500">
              Quantity: {item.quantity} {item.product?.unit || 'pcs'}
            </p>
            <p className="text-sm text-gray-500">
              Price: ₹{item.price?.toFixed(2)} each
            </p>
            
            {/* Bin Locations */}
            {item.product?.inventory?.binLocations && item.product.inventory.binLocations.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  Possible locations:
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.product.inventory.binLocations.slice(0, 3).map((location, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {location.binCode}
                    </span>
                  ))}
                  {item.product.inventory.binLocations.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{item.product.inventory.binLocations.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0">
          {getStatusIcon(itemStatus)}
        </div>
      </div>

      {/* Picked Item Info */}
      {item.picked && (
        <div className="mb-3 p-3 bg-green-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                ✓ Picked from bin: {item.pickedFromBin}
              </p>
              {item.pickedAt && (
                <p className="text-xs text-green-700">
                  {new Date(item.pickedAt).toLocaleString()}
                </p>
              )}
              {item.pickerNotes && (
                <p className="text-xs text-green-700 mt-1">
                  Note: {item.pickerNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Issue Info */}
      {item.issue && (
        <div className="mb-3 p-3 bg-red-100 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Issue: {item.issue.type.replace('_', ' ')}
              </p>
              <p className="text-xs text-red-700">
                {item.issue.description}
              </p>
              {item.issue.reportedAt && (
                <p className="text-xs text-red-600 mt-1">
                  Reported: {new Date(item.issue.reportedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Picking Mode */}
      {isPickingMode && !item.picked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-3 bg-blue-100 rounded-lg space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Bin ID where found *
            </label>
            <input
              type="text"
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              className="block w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter bin ID (e.g., A1-B3)"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="block w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any notes about the item condition, location, etc."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleConfirmPicked}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <ClockIcon className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Confirm Picked
                </>
              )}
            </button>
            
            <button
              onClick={handleCancelPicking}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Issue Reporting Form */}
      {showIssueForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-3 bg-red-100 rounded-lg space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-red-900 mb-1">
              Issue Type *
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="block w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select an issue</option>
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-red-900 mb-1">
              Description *
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Describe the issue in detail..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleReportIssue}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <ClockIcon className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Report Issue
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowIssueForm(false)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!item.picked && !item.issue && orderStatus === 'picking' && !disabled && (
        <div className="flex space-x-2">
          {!isPickingMode ? (
            <>
              <button
                onClick={handleStartPicking}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Pick Item
              </button>
              
              <button
                onClick={() => setShowIssueForm(true)}
                className="px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => window.open('/scanner', '_blank')}
                className="px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                title="Open QR Scanner"
              >
                <QrCodeIcon className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

export default ItemPickingCard;
