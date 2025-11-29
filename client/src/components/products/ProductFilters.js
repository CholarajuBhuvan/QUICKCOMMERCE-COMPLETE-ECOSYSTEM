import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ProductFilters = ({ categories, filters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handlePriceChange = (type, value) => {
    const numericValue = value === '' ? '' : Number(value);
    onFilterChange({ [type]: numericValue });
  };

  const priceRanges = [
    { label: 'Under ₹100', min: 0, max: 100 },
    { label: '₹100 - ₹500', min: 100, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: 'Above ₹2000', min: 2000, max: null },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const FilterSection = ({ title, children, isExpanded, onToggle }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900"
      >
        {title}
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Categories */}
      <FilterSection
        title="Categories"
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category._id}
                checked={filters.category === category._id}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {category._id} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          {/* Predefined ranges */}
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  checked={
                    filters.minPrice === range.min && 
                    (range.max === null ? !filters.maxPrice : filters.maxPrice === range.max)
                  }
                  onChange={() => {
                    onFilterChange({
                      minPrice: range.min,
                      maxPrice: range.max || ''
                    });
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>

          {/* Custom range */}
          <div className="pt-2 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Customer Rating */}
      <FilterSection
        title="Customer Rating"
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <div className="ml-2 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-700">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        isExpanded={expandedSections.availability}
        onToggle={() => toggleSection('availability')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.fastDelivery}
              onChange={(e) => handleFilterChange('fastDelivery', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">10 Min Delivery</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.freeDelivery}
              onChange={(e) => handleFilterChange('freeDelivery', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Free Delivery</span>
          </label>
        </div>
      </FilterSection>

      {/* Brand */}
      {filters.category && (
        <FilterSection
          title="Brand"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search brands..."
              value={filters.brand || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
            {/* In a real app, you'd have a list of brands based on the category */}
            <div className="text-sm text-gray-500">
              Popular brands will appear here based on selected category
            </div>
          </div>
        </FilterSection>
      )}

      {/* Special Offers */}
      <FilterSection
        title="Special Offers"
        isExpanded={expandedSections.offers}
        onToggle={() => toggleSection('offers')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => handleFilterChange('onSale', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">On Sale</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.newArrivals}
              onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">New Arrivals</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Products</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};

export default ProductFilters;
