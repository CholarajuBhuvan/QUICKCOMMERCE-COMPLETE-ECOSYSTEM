import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  StarIcon,
  TruckIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock staff data
    const mockStaff = [
      {
        _id: '1',
        name: 'Alice Smith',
        email: 'alice@quickmart.com',
        phone: '+1 (555) 101-2345',
        role: 'picker',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        employeeId: 'PKR-001',
        joinedDate: '2023-08-15T00:00:00Z',
        lastActive: '2024-01-15T11:30:00Z',
        performance: {
          ordersCompleted: 234,
          accuracy: 98.5,
          avgPickTime: 4.2,
          rating: 4.8
        },
        shift: 'Morning (6AM - 2PM)',
        department: 'Warehouse'
      },
      {
        _id: '2',
        name: 'Bob Johnson',
        email: 'bob@quickmart.com',
        phone: '+1 (555) 202-3456',
        role: 'rider',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        employeeId: 'RDR-002',
        joinedDate: '2023-09-20T00:00:00Z',
        lastActive: '2024-01-15T10:45:00Z',
        performance: {
          deliveriesCompleted: 189,
          onTimeRate: 96.8,
          avgDeliveryTime: 8.5,
          rating: 4.9
        },
        shift: 'Evening (2PM - 10PM)',
        department: 'Delivery'
      },
      {
        _id: '3',
        name: 'Carol Williams',
        email: 'carol@quickmart.com',
        phone: '+1 (555) 303-4567',
        role: 'picker',
        status: 'inactive',
        avatar: '/api/placeholder/40/40',
        employeeId: 'PKR-003',
        joinedDate: '2023-07-10T00:00:00Z',
        lastActive: '2024-01-12T15:20:00Z',
        performance: {
          ordersCompleted: 156,
          accuracy: 94.2,
          avgPickTime: 5.1,
          rating: 4.3
        },
        shift: 'Afternoon (10AM - 6PM)',
        department: 'Warehouse'
      },
      {
        _id: '4',
        name: 'David Brown',
        email: 'david@quickmart.com',
        phone: '+1 (555) 404-5678',
        role: 'rider',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        employeeId: 'RDR-004',
        joinedDate: '2023-10-05T00:00:00Z',
        lastActive: '2024-01-15T09:15:00Z',
        performance: {
          deliveriesCompleted: 142,
          onTimeRate: 89.4,
          avgDeliveryTime: 9.8,
          rating: 4.1
        },
        shift: 'Morning (6AM - 2PM)',
        department: 'Delivery'
      },
      {
        _id: '5',
        name: 'Emma Davis',
        email: 'emma@quickmart.com',
        phone: '+1 (555) 505-6789',
        role: 'admin',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        employeeId: 'ADM-005',
        joinedDate: '2023-06-01T00:00:00Z',
        lastActive: '2024-01-15T12:00:00Z',
        performance: {
          tasksCompleted: 98,
          efficiency: 95.5,
          avgResponseTime: 2.1,
          rating: 4.7
        },
        shift: 'Flexible',
        department: 'Administration'
      }
    ];

    setTimeout(() => {
      setStaff(mockStaff);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'picker': return 'bg-blue-100 text-blue-800';
      case 'rider': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'picker': return <CubeIcon className="w-4 h-4" />;
      case 'rider': return <TruckIcon className="w-4 h-4" />;
      case 'admin': return <UserGroupIcon className="w-4 h-4" />;
      default: return <UserGroupIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewStaff = (member) => {
    setSelectedStaff(member);
    setShowModal(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage pickers, riders, and administrative staff</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Add Staff Member
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
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
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
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {staff.filter(s => s.status === 'active').length}
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
              <CubeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pickers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {staff.filter(s => s.role === 'picker').length}
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
              <TruckIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Riders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {staff.filter(s => s.role === 'rider').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="picker">Pickers</option>
                <option value="rider">Riders</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member, index) => (
                <motion.tr
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full bg-gray-100 mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{member.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.department}</div>
                    <div className="text-sm text-gray-500">{member.shift}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {member.performance.rating}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.role === 'picker' && `${member.performance.ordersCompleted} orders`}
                      {member.role === 'rider' && `${member.performance.deliveriesCompleted} deliveries`}
                      {member.role === 'admin' && `${member.performance.tasksCompleted} tasks`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                      {member.status === 'active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                      {member.status === 'inactive' && <ClockIcon className="w-3 h-3 mr-1" />}
                      {member.status === 'suspended' && <XCircleIcon className="w-3 h-3 mr-1" />}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.lastActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStaff(member)}
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

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Staff Detail Modal */}
      {showModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Staff Details</h3>
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
              {/* Staff Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedStaff.avatar}
                  alt={selectedStaff.name}
                  className="w-16 h-16 rounded-full bg-gray-100"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedStaff.name}</h4>
                  <p className="text-gray-600">{selectedStaff.employeeId}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(selectedStaff.role)}`}>
                      {getRoleIcon(selectedStaff.role)}
                      <span className="ml-1">{selectedStaff.role}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedStaff.status)}`}>
                      {selectedStaff.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact and Work Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                  <p className="text-sm text-gray-600">Email: {selectedStaff.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedStaff.phone}</p>
                  <p className="text-sm text-gray-600">Joined: {formatDate(selectedStaff.joinedDate)}</p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 mb-2">Work Details</h5>
                  <p className="text-sm text-gray-600">Department: {selectedStaff.department}</p>
                  <p className="text-sm text-gray-600">Shift: {selectedStaff.shift}</p>
                  <p className="text-sm text-gray-600">Last Active: {formatDate(selectedStaff.lastActive)}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedStaff.role === 'picker' && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-purple-600">{selectedStaff.performance.ordersCompleted}</p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">{selectedStaff.performance.accuracy}%</p>
                        <p className="text-sm text-gray-600">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-blue-600">{selectedStaff.performance.avgPickTime}min</p>
                        <p className="text-sm text-gray-600">Avg Pick Time</p>
                      </div>
                    </>
                  )}
                  
                  {selectedStaff.role === 'rider' && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-purple-600">{selectedStaff.performance.deliveriesCompleted}</p>
                        <p className="text-sm text-gray-600">Deliveries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">{selectedStaff.performance.onTimeRate}%</p>
                        <p className="text-sm text-gray-600">On-Time Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-blue-600">{selectedStaff.performance.avgDeliveryTime}min</p>
                        <p className="text-sm text-gray-600">Avg Delivery</p>
                      </div>
                    </>
                  )}

                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                      <p className="text-2xl font-semibold text-yellow-600">{selectedStaff.performance.rating}</p>
                    </div>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
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
                Edit Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
