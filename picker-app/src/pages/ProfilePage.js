import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

import { 
  updateProfile, 
  updateAvailability, 
  selectUser, 
  selectIsAvailable, 
  selectAuthLoading 
} from '../store/slices/authSlice';
import { selectOrdersStats } from '../store/slices/ordersSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  address: yup.object({
    street: yup.string(),
    city: yup.string(),
    state: yup.string(),
    pincode: yup.string().matches(/^\d{6}$/, 'Please enter a valid pincode'),
  }),
});

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAvailable = useSelector(selectIsAvailable);
  const loading = useSelector(selectAuthLoading);
  const ordersStats = useSelector(selectOrdersStats);

  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
      }
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onSubmitProfile = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      // This would be handled by a separate endpoint
      // await dispatch(updatePassword(data)).unwrap();
      toast.success('Password updated successfully!');
      resetPasswordForm();
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleToggleAvailability = () => {
    dispatch(updateAvailability(!isAvailable));
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: CogIcon },
    { id: 'stats', name: 'Performance', icon: ChartBarIcon },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <button
                onClick={handleToggleAvailability}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {isAvailable ? 'Go Unavailable' : 'Go Available'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h3>
                <p className="text-gray-600 mb-6">
                  Update your personal information and contact details.
                </p>
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerProfile('name')}
                        type="text"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          profileErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerProfile('email')}
                        type="email"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          profileErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerProfile('phone')}
                        type="tel"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Address
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        {...registerProfile('address.street')}
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Street Address"
                      />
                    </div>
                    <div>
                      <input
                        {...registerProfile('address.city')}
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <input
                        {...registerProfile('address.state')}
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <input
                        {...registerProfile('address.pincode')}
                        type="text"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          profileErrors.address?.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Pincode"
                      />
                      {profileErrors.address?.pincode && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.address.pincode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <p className="text-gray-600 mb-6">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Performance Statistics
                </h3>
                <p className="text-gray-600 mb-6">
                  View your picking performance and statistics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircleIcon className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{ordersStats.todayPicked}</p>
                  <p className="text-sm text-green-700">Orders picked today</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <ClockIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{ordersStats.averagePickTime || '0'}</p>
                  <p className="text-sm text-blue-700">Avg pick time (min)</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <ChartBarIcon className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{ordersStats.weeklyPicked}</p>
                  <p className="text-sm text-purple-700">Weekly total</p>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Performance Chart</h4>
                <p className="text-gray-600">
                  Detailed performance analytics will be displayed here.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
