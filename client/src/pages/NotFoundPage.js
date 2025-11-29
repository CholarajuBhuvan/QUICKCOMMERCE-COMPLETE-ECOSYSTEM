import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        {/* 404 Illustration */}
        <div className="mx-auto w-64 h-64 mb-8">
          <svg viewBox="0 0 200 200" className="w-full h-full text-green-600">
            <circle cx="100" cy="100" r="80" fill="currentColor" fillOpacity="0.1" />
            <text x="100" y="120" textAnchor="middle" className="text-6xl font-bold" fill="currentColor">
              404
            </text>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Popular Pages
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link
              to="/products?category=groceries"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Groceries
            </Link>
            <Link
              to="/products?category=electronics"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Electronics
            </Link>
            <Link
              to="/products?featured=true"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Featured Products
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
