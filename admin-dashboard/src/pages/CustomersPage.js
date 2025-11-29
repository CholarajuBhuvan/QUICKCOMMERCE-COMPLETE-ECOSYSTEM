import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock customer data
    const mockCustomers = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, Anytown, CA 12345',
        joinedDate: '2024-01-01T00:00:00Z',
        totalOrders: 15,
        totalSpent: 425.75,
        lastOrderDate: '2024-01-15T10:30:00Z',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        averageRating: 4.8,
        loyaltyPoints: 120
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 234-5678',
        address: '456 Oak Ave, Somecity, NY 54321',
        joinedDate: '2023-12-15T00:00:00Z',
        totalOrders: 23,
        totalSpent: 687.90,
        lastOrderDate: '2024-01-14T15:20:00Z',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        averageRating: 4.9,
        loyaltyPoints: 200
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 (555) 345-6789',
        address: '789 Pine St, Otherville, TX 67890',
        joinedDate: '2023-11-20T00:00:00Z',
        totalOrders: 8,
        totalSpent: 156.30,
        lastOrderDate: '2024-01-10T09:45:00Z',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        averageRating: 4.5,
        loyaltyPoints: 45
      },
      {
        _id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1 (555) 456-7890',
        address: '321 Elm St, Newtown, FL 09876',
        joinedDate: '2023-10-05T00:00:00Z',
        totalOrders: 31,
        totalSpent: 892.40,
        lastOrderDate: '2024-01-13T14:15:00Z',
        status: 'vip',
        avatar: '/api/placeholder/40/40',
        averageRating: 5.0,
        loyaltyPoints: 350
      },
      {
        _id: '5',
        name: 'Tom Brown',
        email: 'tom@example.com',
        phone: '+1 (555) 567-8901',
        address: '654 Maple Dr, Hometown, WA 13579',
        joinedDate: '2023-09-12T00:00:00Z',
        totalOrders: 2,
        totalSpent: 45.60,
        lastOrderDate: '2023-12-20T11:30:00Z',
        status: 'inactive',
        avatar: '/api/placeholder/40/40',
        averageRating: 4.0,
        loyaltyPoints: 15
      }
    ];

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer relationships and data</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
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
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlusIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers.filter(c => c.status === 'vip').length}
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(customers.reduce((acc, c) => acc + c.totalOrders, 0) / customers.length)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <StarIcon className="w-3 h-3 mr-1 text-yellow-400" />
                          {customer.averageRating}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.totalOrders}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last: {formatDate(customer.lastOrderDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.loyaltyPoints} points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.joinedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No customers found</div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  className="w-16 h-16 rounded-full bg-gray-100"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h4>
                  <p className="text-gray-600">Customer since {formatDate(selectedCustomer.joinedDate)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-600">{selectedCustomer.address}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-lg font-semibold text-gray-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyalty Points</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCustomer.loyaltyPoints}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Customer Rating</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(selectedCustomer.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedCustomer.averageRating}/5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
