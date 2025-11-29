import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { fetchProducts, selectProducts, selectInventoryLoading } from '../store/slices/inventorySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const inventory = useSelector(selectProducts);
  const loading = useSelector(selectInventoryLoading);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getStockStatus = (quantity, minStock = 10) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (quantity <= minStock) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.product?.category === categoryFilter;
    const stockStatus = getStockStatus(item.quantity);
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in_stock' && stockStatus.label === 'In Stock') ||
                        (stockFilter === 'low_stock' && stockStatus.label === 'Low Stock') ||
                        (stockFilter === 'out_of_stock' && stockStatus.label === 'Out of Stock');
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['all', ...new Set(inventory.map(item => item.product?.category).filter(Boolean))];

  const stats = {
    total: inventory.length,
    inStock: inventory.filter(item => getStockStatus(item.quantity).label === 'In Stock').length,
    lowStock: inventory.filter(item => getStockStatus(item.quantity).label === 'Low Stock').length,
    outOfStock: inventory.filter(item => getStockStatus(item.quantity).label === 'Out of Stock').length
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading inventory..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage warehouse stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bin Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item, idx) => {
                  const status = getStockStatus(item.quantity, item.minStock);
                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${item.product?.price?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.product?.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.product?.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.binLocation?.binCode || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{item.quantity}</div>
                        <div className="text-xs text-gray-500">Min: {item.minStock || 10}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InventoryPage;
