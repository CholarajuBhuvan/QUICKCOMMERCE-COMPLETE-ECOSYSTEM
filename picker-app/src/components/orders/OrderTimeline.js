import React from 'react';
import { format } from 'date-fns';
import {
  ClockIcon,
  UserIcon,
  PlayIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const OrderTimeline = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'assigned':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      case 'picking':
        return <PlayIcon className="h-5 w-5 text-orange-600" />;
      case 'picked':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'ready_for_delivery':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'out_for_delivery':
        return <TruckIcon className="h-5 w-5 text-yellow-600" />;
      case 'delivered':
        return <HomeIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'assigned':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'picking':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'picked':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'ready_for_delivery':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'out_for_delivery':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getStatusTitle = (status) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'assigned':
        return 'Assigned to Picker';
      case 'picking':
        return 'Picking Started';
      case 'picked':
        return 'Picking Completed';
      case 'ready_for_delivery':
        return 'Ready for Delivery';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusDescription = (status, entry) => {
    switch (status) {
      case 'placed':
        return 'Customer placed the order';
      case 'confirmed':
        return 'Order has been confirmed and is ready for processing';
      case 'assigned':
        return entry.assignedTo ? `Assigned to ${entry.assignedTo.name}` : 'Assigned to picker';
      case 'picking':
        return entry.pickerName ? `${entry.pickerName} started picking` : 'Picking process started';
      case 'picked':
        return entry.pickerName ? `${entry.pickerName} completed picking` : 'All items picked successfully';
      case 'ready_for_delivery':
        return 'Order is ready for delivery pickup';
      case 'out_for_delivery':
        return entry.riderName ? `${entry.riderName} is delivering` : 'Order is out for delivery';
      case 'delivered':
        return 'Order successfully delivered to customer';
      case 'cancelled':
        return entry.reason ? `Cancelled: ${entry.reason}` : 'Order has been cancelled';
      default:
        return entry.notes || 'Status updated';
    }
  };

  // Create timeline entries from order data
  const timelineEntries = [];

  // Add basic timeline from order.timeline if it exists
  if (order.timeline && order.timeline.length > 0) {
    order.timeline.forEach(entry => {
      timelineEntries.push({
        status: entry.status,
        timestamp: entry.timestamp,
        notes: entry.notes,
        user: entry.user,
        assignedTo: entry.assignedTo,
        pickerName: entry.pickerName,
        riderName: entry.riderName,
        reason: entry.reason
      });
    });
  } else {
    // Fallback: create basic timeline from order status and dates
    timelineEntries.push({
      status: 'placed',
      timestamp: order.createdAt,
      notes: 'Order created by customer'
    });

    if (order.confirmedAt) {
      timelineEntries.push({
        status: 'confirmed',
        timestamp: order.confirmedAt,
        notes: 'Order confirmed and ready for processing'
      });
    }

    if (order.assignedAt && order.picker) {
      timelineEntries.push({
        status: 'assigned',
        timestamp: order.assignedAt,
        assignedTo: order.picker,
        notes: `Assigned to ${order.picker.name || 'picker'}`
      });
    }

    if (order.pickingStartedAt) {
      timelineEntries.push({
        status: 'picking',
        timestamp: order.pickingStartedAt,
        pickerName: order.picker?.name,
        notes: 'Picking process started'
      });
    }

    if (order.pickedAt) {
      timelineEntries.push({
        status: 'picked',
        timestamp: order.pickedAt,
        pickerName: order.picker?.name,
        notes: 'All items picked successfully'
      });
    }

    if (order.readyForDeliveryAt) {
      timelineEntries.push({
        status: 'ready_for_delivery',
        timestamp: order.readyForDeliveryAt,
        notes: 'Order ready for delivery pickup'
      });
    }

    if (order.outForDeliveryAt && order.rider) {
      timelineEntries.push({
        status: 'out_for_delivery',
        timestamp: order.outForDeliveryAt,
        riderName: order.rider.name,
        notes: `${order.rider.name} picked up for delivery`
      });
    }

    if (order.deliveredAt) {
      timelineEntries.push({
        status: 'delivered',
        timestamp: order.deliveredAt,
        notes: 'Order successfully delivered'
      });
    }

    if (order.cancelledAt) {
      timelineEntries.push({
        status: 'cancelled',
        timestamp: order.cancelledAt,
        reason: order.cancellationReason,
        notes: order.cancellationReason || 'Order cancelled'
      });
    }
  }

  // Sort timeline entries by timestamp
  timelineEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (timelineEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Timeline information is not available for this order.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineEntries.map((entry, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx !== timelineEntries.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white border-2 ${getStatusColor(entry.status)}`}>
                    {getStatusIcon(entry.status)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusTitle(entry.status)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getStatusDescription(entry.status, entry)}
                    </p>
                    {entry.notes && entry.notes !== getStatusDescription(entry.status, entry) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={entry.timestamp}>
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy')}
                    </time>
                    <br />
                    <time dateTime={entry.timestamp} className="text-xs">
                      {format(new Date(entry.timestamp), 'HH:mm')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTimeline;
