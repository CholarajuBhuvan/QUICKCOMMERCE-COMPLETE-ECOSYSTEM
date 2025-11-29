import React from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FilterPanel = ({ filters, onFilterChange, onClearFilters, onClose }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'picking', label: 'Picking' },
    { value: 'picked', label: 'Picked' },
    { value: 'ready_for_delivery', label: 'Ready for Delivery' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
  ];

  const sortOptions = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'createdAt_asc', label: 'Oldest First' },
    { value: 'priority_desc', label: 'High Priority First' },
    { value: 'totalAmount_desc', label: 'Highest Value First' },
    { value: 'totalAmount_asc', label: 'Lowest Value First' },
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear All
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
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Date Range
            </label>
            <select
              value={filters.dateRange || ''}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'createdAt_desc'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="0.00"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="10000.00"
              />
            </div>

            {/* Item Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Items
              </label>
              <input
                type="number"
                min="1"
                value={filters.minItems || ''}
                onChange={(e) => handleFilterChange('minItems', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange({ priority: 'urgent', status: 'pending' })}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
              Urgent Pending
            </button>
            <button
              onClick={() => onFilterChange({ status: 'picking' })}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
            >
              Currently Picking
            </button>
            <button
              onClick={() => onFilterChange({ dateRange: 'today', status: 'picked' })}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
            >
              Picked Today
            </button>
            <button
              onClick={() => onFilterChange({ minAmount: '1000' })}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              High Value (₹1000+)
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel;
