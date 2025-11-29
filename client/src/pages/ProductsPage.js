import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import {
  fetchProducts,
  fetchCategories,
  setFilters,
  clearFilters,
  selectProducts,
  selectCategories,
  selectFilters,
  selectPagination,
  selectProductsLoading
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { setProductView, selectProductView } from '../store/slices/uiSlice';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner, { CardSkeleton } from '../components/common/LoadingSpinner';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectProductsLoading);
  const productView = useSelector(selectProductView);
  
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {};
    
    if (searchParams.get('category')) {
      urlFilters.category = searchParams.get('category');
    }
    if (searchParams.get('subcategory')) {
      urlFilters.subcategory = searchParams.get('subcategory');
    }
    if (searchParams.get('search')) {
      urlFilters.search = searchParams.get('search');
    }
    if (searchParams.get('minPrice')) {
      urlFilters.minPrice = searchParams.get('minPrice');
    }
    if (searchParams.get('maxPrice')) {
      urlFilters.maxPrice = searchParams.get('maxPrice');
    }
    if (searchParams.get('inStock')) {
      urlFilters.inStock = searchParams.get('inStock') === 'true';
    }

    if (Object.keys(urlFilters).length > 0) {
      dispatch(setFilters(urlFilters));
    }
  }, [searchParams, dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const params = {
      ...filters,
      sortBy,
      sortOrder,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage
    };

    dispatch(fetchProducts(params));
  }, [dispatch, filters, sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== null && value !== undefined) {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchParams({});
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handlePageChange = (page) => {
    // Update pagination would go here
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating-desc', label: 'Highest Rated' },
  ];

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== false && value !== null && value !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              {pagination.totalItems} products found
            </p>
          </div>

          {/* Controls */}
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="hidden sm:flex border border-gray-300 rounded-md">
              <button
                onClick={() => dispatch(setProductView('grid'))}
                className={`p-2 ${
                  productView === 'grid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(setProductView('list'))}
                className={`p-2 ${
                  productView === 'list' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Category: {filters.category}
                    <button
                      onClick={() => handleFilterChange({ category: '' })}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: {filters.search}
                    <button
                      onClick={() => handleFilterChange({ search: '' })}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                    <button
                      onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className={`grid gap-6 ${
                productView === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 9 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m9 0H9" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 btn-primary"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                layout
                className={`grid gap-6 ${
                  productView === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
              >
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      view={productView}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, pagination.currentPage - 2);
                    if (page > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
                
                <div className="mt-6 pt-6 border-t flex space-x-3">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 btn-secondary"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
