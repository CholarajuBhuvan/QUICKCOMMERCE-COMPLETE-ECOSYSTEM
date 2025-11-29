import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'purple', 
  className = '',
  text = '',
  overlay = false 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600',
    white: 'border-white',
  };

  const spinner = (
    <motion.div
      className={clsx(
        'border-4 border-t-transparent rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          {spinner}
          {text && (
            <p className="text-gray-700 text-sm font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {spinner}
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    );
  }

  return spinner;
};

// Skeleton loading component for cards
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-8 bg-gray-200 rounded w-full"></div>
  </div>
);

// Loading state for tables
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
        ))}
      </div>
    ))}
  </div>
);

// Chart skeleton
export const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default LoadingSpinner;
