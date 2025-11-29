import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green', 
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
    green: 'border-green-600',
    blue: 'border-blue-600',
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

// Skeleton loading component
export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={clsx(
      'animate-pulse bg-gray-200 rounded',
      className
    )}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 space-y-4">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
        <Skeleton className="h-16 w-16 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    ))}
  </div>
);

// Inline loading component
export const InlineLoading = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2 text-gray-500">
    <LoadingSpinner size="sm" color="gray" />
    <span className="text-sm">{text}</span>
  </div>
);

// Page loading component
export const PageLoading = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" color="green" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  </div>
);

// Button loading state
export const ButtonLoading = ({ size = 'sm', color = 'white' }) => (
  <LoadingSpinner size={size} color={color} />
);

export default LoadingSpinner;
