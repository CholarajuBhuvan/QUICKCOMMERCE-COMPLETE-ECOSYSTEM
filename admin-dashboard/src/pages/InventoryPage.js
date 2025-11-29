import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [binFilter, setBinFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    // Mock inventory and bins data
    const mockInventory = [
      {
        _id: '1',
        product: {
          _id: 'p1',
          name: 'Organic Bananas',
          sku: 'FF-BAN-001',
          image: '/api/placeholder/60/60'
        },
        bin: {
          _id: 'b1',
          code: 'A1-01',
          location: 'Aisle A, Shelf 1'
        },
        quantity: 150,
        minQuantity: 20,
        maxQuantity: 200,
        lastRestocked: '2024-01-14T10:00:00Z',
        expiryDate: '2024-01-20T00:00:00Z',
        status: 'in-stock'
      },
      {
        _id: '2',
        product: {
          _id: 'p2',
          name: 'Whole Milk',
          sku: 'MF-MLK-002',
          image: '/api/placeholder/60/60'
        },
        bin: {
          _id: 'b2',
          code: 'B2-03',
          location: 'Aisle B, Refrigerator 2'
        },
        quantity: 8,
        minQuantity: 15,
        maxQuantity: 50,
        lastRestocked: '2024-01-13T08:30:00Z',
        expiryDate: '2024-01-18T00:00:00Z',
        status: 'low-stock'
      },
      {
        _id: '3',
        product: {
          _id: 'p3',
          name: 'Chicken Breast',
          sku: 'PC-CHK-003',
          image: '/api/placeholder/60/60'
        },
        bin: {
          _id: 'b3',
          code: 'C1-02',
          location: 'Freezer Section, Unit 1'
        },
        quantity: 0,
        minQuantity: 10,
        maxQuantity: 30,
        lastRestocked: '2024-01-10T14:15:00Z',
        expiryDate: '2024-01-25T00:00:00Z',
        status: 'out-of-stock'
      },
      {
        _id: '4',
        product: {
          _id: 'p4',
          name: 'Greek Yogurt',
          sku: 'MP-YOG-005',
          image: '/api/placeholder/60/60'
        },
        bin: {
          _id: 'b2',
          code: 'B2-03',
          location: 'Aisle B, Refrigerator 2'
        },
        quantity: 45,
        minQuantity: 20,
        maxQuantity: 60,
        lastRestocked: '2024-01-15T09:45:00Z',
        expiryDate: '2024-01-22T00:00:00Z',
        status: 'in-stock'
      }
    ];

    const mockBins = [
      {
        _id: 'b1',
        code: 'A1-01',
        location: 'Aisle A, Shelf 1',
        type: 'shelf',
        capacity: 200,
        occupied: 150,
        qrCode: 'QR-A1-01',
        temperature: 'ambient',
        products: 1,
        lastAccessed: '2024-01-15T10:30:00Z'
      },
      {
        _id: 'b2',
        code: 'B2-03',
        location: 'Aisle B, Refrigerator 2',
        type: 'refrigerator',
        capacity: 110,
        occupied: 53,
        qrCode: 'QR-B2-03',
        temperature: '2-8°C',
        products: 2,
        lastAccessed: '2024-01-15T11:15:00Z'
      },
      {
        _id: 'b3',
        code: 'C1-02',
        location: 'Freezer Section, Unit 1',
        type: 'freezer',
        capacity: 50,
        occupied: 0,
        qrCode: 'QR-C1-02',
        temperature: '-18°C',
        products: 1,
        lastAccessed: '2024-01-14T16:20:00Z'
      },
      {
        _id: 'b4',
        code: 'D3-05',
        location: 'Aisle D, Shelf 3',
        type: 'shelf',
        capacity: 150,
        occupied: 0,
        qrCode: 'QR-D3-05',
        temperature: 'ambient',
        products: 0,
        lastAccessed: '2024-01-12T09:00:00Z'
      }
    ];

    setTimeout(() => {
      setInventory(mockInventory);
      setBins(mockBins);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBinTypeColor = (type) => {
    switch (type) {
      case 'shelf': return 'bg-blue-100 text-blue-800';
      case 'refrigerator': return 'bg-cyan-100 text-cyan-800';
      case 'freezer': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInventory = inventory.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bin.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = binFilter === 'all' || bin.type === binFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track stock levels and manage warehouse bins</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <QrCodeIcon className="w-4 h-4 mr-2" />
            Scan QR
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(i => i.status === 'in-stock').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(i => i.status === 'low-stock').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(i => i.status === 'out-of-stock').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-semibold text-gray-900">{bins.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardDocumentListIcon className="w-5 h-5 inline mr-2" />
              Product Inventory
            </button>
            <button
              onClick={() => setActiveTab('bins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bins'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPinIcon className="w-5 h-5 inline mr-2" />
              Bin Management
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {activeTab === 'bins' && (
              <select
                value={binFilter}
                onChange={(e) => setBinFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Bin Types</option>
                <option value="shelf">Shelf</option>
                <option value="refrigerator">Refrigerator</option>
                <option value="freezer">Freezer</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'products' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Restocked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.bin.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.bin.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="text-gray-500">/{item.maxQuantity}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minQuantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.lastRestocked)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.expiryDate)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12">
                  <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBins.map((bin, index) => (
                <motion.div
                  key={bin._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bin.code}</h3>
                      <p className="text-sm text-gray-600">{bin.location}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBinTypeColor(bin.type)}`}>
                      {bin.type}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Capacity</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bin.occupied}/{bin.capacity}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          bin.occupied / bin.capacity > 0.8 ? 'bg-red-500' :
                          bin.occupied / bin.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(bin.occupied / bin.capacity) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Products</span>
                      <span className="text-sm font-medium text-gray-900">{bin.products}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temperature</span>
                      <span className="text-sm font-medium text-gray-900">{bin.temperature}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">QR Code</span>
                      <span className="text-sm font-mono text-purple-600">{bin.qrCode}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Last accessed: {formatDate(bin.lastAccessed)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'bins' && filteredBins.length === 0 && (
            <div className="text-center py-12">
              <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bins found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
