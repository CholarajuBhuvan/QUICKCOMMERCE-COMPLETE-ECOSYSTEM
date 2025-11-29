import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  KeyIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

import {
  updateProfile,
  changePassword,
  selectUser,
  selectAuthLoading
} from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const profileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').required('Phone is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('ZIP code is required'),
  })
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password')
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || {}
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
    } catch (error) {
      // Error handled in slice
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap();
      resetPasswordForm();
    } catch (error) {
      // Error handled in slice
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mx-auto mb-1" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {avatarPreview || user?.avatar ? (
                        <img
                          src={avatarPreview || user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
                      <CameraIcon className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      user?.role === 'customer' 
                        ? 'bg-blue-100 text-blue-800'
                        : user?.role === 'picker'
                          ? 'bg-green-100 text-green-800'
                          : user?.role === 'rider'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`input-field ${profileErrors.name ? 'input-error' : ''}`}
                        {...registerProfile('name')}
                      />
                      {profileErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={`input-field ${profileErrors.phone ? 'input-error' : ''}`}
                        {...registerProfile('phone')}
                      />
                      {profileErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center"
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

            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
                  
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        className={`input-field ${profileErrors.address?.street ? 'input-error' : ''}`}
                        {...registerProfile('address.street')}
                      />
                      {profileErrors.address?.street && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.address.street.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          className={`input-field ${profileErrors.address?.city ? 'input-error' : ''}`}
                          {...registerProfile('address.city')}
                        />
                        {profileErrors.address?.city && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.address.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          className={`input-field ${profileErrors.address?.state ? 'input-error' : ''}`}
                          {...registerProfile('address.state')}
                        />
                        {profileErrors.address?.state && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.address.state.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          className={`input-field ${profileErrors.address?.zipCode ? 'input-error' : ''}`}
                          {...registerProfile('address.zipCode')}
                        />
                        {profileErrors.address?.zipCode && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.address.zipCode.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span className="ml-2">Updating...</span>
                          </>
                        ) : (
                          'Update Address'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Current Address Display */}
                {user?.address && (
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current Address</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-gray-900">{user.address.street}</p>
                          <p className="text-gray-600">
                            {user.address.city}, {user.address.state} - {user.address.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className={`input-field ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                        {...registerPassword('currentPassword')}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className={`input-field ${passwordErrors.newPassword ? 'input-error' : ''}`}
                        {...registerPassword('newPassword')}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className={`input-field ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                        {...registerPassword('confirmPassword')}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span className="ml-2">Changing...</span>
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Account Security Info */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Account Security</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Verification</p>
                          <p className="text-sm text-gray-500">Your email is verified</p>
                        </div>
                      </div>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Verification</p>
                          <p className="text-sm text-gray-500">Your phone number is verified</p>
                        </div>
                      </div>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Account Information Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹0</div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-500">Days with us</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
