import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { login, selectAuthLoading } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo and Header */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Admin Login
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access the admin dashboard
              </p>
            </div>

            {/* Login Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        errors.email
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        errors.password
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Admin:</strong> admin@demo.com / demo123</p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center text-white"
            >
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                  <ChartBarIcon className="w-16 h-16" />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  Admin Dashboard
                </h1>
                <p className="text-xl text-purple-100 mb-8">
                  Comprehensive management and analytics platform
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <span>Monitor real-time business metrics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <span>Manage orders and inventory</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <span>Track staff performance</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
