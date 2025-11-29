import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { logout, updateProfile } from '../store/slices/authSlice';
import { selectMyDeliveries } from '../store/slices/deliveriesSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const deliveries = useSelector(selectMyDeliveries);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicleType: user?.riderDetails?.vehicleType || 'bike',
    vehicleNumber: user?.riderDetails?.vehicleNumber || ''
  });

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 5), 0);
  const avgRating = user?.riderDetails?.rating || 4.5;
  const totalDeliveries = user?.riderDetails?.totalDeliveries || completedDeliveries.length;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
    }
  };

  const stats = [
    {
      label: 'Total Deliveries',
      value: totalDeliveries,
      icon: TruckIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Average Rating',
      value: avgRating.toFixed(1),
      icon: StarIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'On Time Rate',
      value: `${user?.riderDetails?.onTimeRate || 95}%`,
      icon: ClockIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rider Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your stats</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ABC-1234"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      vehicleType: user?.riderDetails?.vehicleType || 'bike',
                      vehicleNumber: user?.riderDetails?.vehicleNumber || ''
                    });
                  }}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <UserCircleIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-base font-medium text-gray-900">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="text-base font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-base font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <TruckIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="text-base font-medium text-gray-900 capitalize">
                    {user?.riderDetails?.vehicleType || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Vehicle Number</p>
                  <p className="text-base font-medium text-gray-900">
                    {user?.riderDetails?.vehicleNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Account Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Completion Rate</span>
                  <span className="font-medium text-gray-900">{user?.riderDetails?.completionRate || 98}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${user?.riderDetails?.completionRate || 98}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">On-Time Rate</span>
                  <span className="font-medium text-gray-900">{user?.riderDetails?.onTimeRate || 95}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${user?.riderDetails?.onTimeRate || 95}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Customer Rating</span>
                  <span className="font-medium text-gray-900">{avgRating.toFixed(1)}/5.0</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(avgRating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
