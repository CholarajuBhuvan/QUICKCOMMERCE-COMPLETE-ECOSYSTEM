import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  MapPinIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { fetchBins, selectBins, selectBinLoading } from '../store/slices/binSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BinManagementPage = () => {
  const dispatch = useDispatch();
  const bins = useSelector(selectBins);
  const loading = useSelector(selectBinLoading);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBins());
  }, [dispatch]);

  const getCapacityColor = (currentStock = 0, capacity = 100) => {
    const percentage = (currentStock / capacity) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.binCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bin.location?.zone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'all' || bin.location?.zone === zoneFilter;
    const matchesType = typeFilter === 'all' || bin.binType === typeFilter;
    return matchesSearch && matchesZone && matchesType;
  });

  const zones = ['all', ...new Set(bins.map(bin => bin.location?.zone).filter(Boolean))];
  const types = ['all', ...new Set(bins.map(bin => bin.binType).filter(Boolean))];

  const stats = {
    total: bins.length,
    available: bins.filter(bin => !bin.currentStock || bin.currentStock.length === 0).length,
    occupied: bins.filter(bin => bin.currentStock && bin.currentStock.length > 0).length,
    nearFull: bins.filter(bin => {
      const items = bin.currentStock?.length || 0;
      const capacity = bin.capacity || 100;
      return (items / capacity) >= 0.7;
    }).length
  };

  if (loading && bins.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading bins..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bin Management</h1>
          <p className="text-gray-600 mt-1">Manage warehouse storage bins and locations</p>
        </div>
        <Link
          to="/scanner"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          <QrCodeIcon className="h-5 w-5 mr-2" />
          Scan QR Code
        </Link>
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
              <p className="text-sm text-gray-600">Total Bins</p>
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
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-green-600" />
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
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.occupied}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm text-gray-600">Near Full</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.nearFull}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-yellow-600" />
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
              placeholder="Search bins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Zone Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bins Grid */}
      {filteredBins.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No bins found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBins.map((bin, idx) => {
            const stockCount = bin.currentStock?.length || 0;
            const capacity = bin.capacity || 100;
            const capacityPercent = (stockCount / capacity) * 100;
            const capacityColor = getCapacityColor(stockCount, capacity);

            return (
              <motion.div
                key={bin._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bin.binCode}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mt-1">
                      {bin.binType || 'Standard'}
                    </span>
                  </div>
                  <QrCodeIcon className="h-6 w-6 text-gray-400" />
                </div>

                {/* Location */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>Zone: {bin.location?.zone || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    Aisle: {bin.location?.aisle || 'N/A'}, Position: {bin.location?.position || 'N/A'}
                  </div>
                </div>

                {/* Capacity */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Capacity</span>
                    <span className={`font-medium ${capacityColor.split(' ')[0]}`}>
                      {stockCount} / {capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        capacityPercent >= 90 ? 'bg-red-500' :
                        capacityPercent >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Current Stock */}
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Current Stock:</p>
                  {stockCount === 0 ? (
                    <p className="text-xs text-gray-500">Empty bin</p>
                  ) : (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {bin.currentStock?.slice(0, 3).map((stock, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">
                            {stock.product?.name || 'Product'}
                          </span>
                          <span className="text-gray-900 font-medium ml-2">
                            x{stock.quantity}
                          </span>
                        </div>
                      ))}
                      {stockCount > 3 && (
                        <p className="text-xs text-gray-500">+{stockCount - 3} more items</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    to={`/bins/${bin._id}`}
                    className="block text-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BinManagementPage;
