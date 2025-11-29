import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import { register as registerUser, selectAuthLoading } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = yup.object({
  name: yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup.string()
    .email('Invalid email')
    .required('Email is required'),
  phone: yup.string()
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string()
    .oneOf(['customer', 'picker', 'rider'], 'Please select a valid role')
    .required('Role is required'),
  agreeToTerms: yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
}).shape({});

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const loading = useSelector(selectAuthLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'customer'
    }
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, agreeToTerms, ...userData } = data;
      await dispatch(registerUser(userData)).unwrap();
      navigate('/');
    } catch (error) {
      // Error is handled in the slice
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: watchedPassword?.length >= 6 },
    { text: 'Contains letters', met: /[a-zA-Z]/.test(watchedPassword || '') },
    { text: 'Contains numbers', met: /\d/.test(watchedPassword || '') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input-field ${errors.name ? 'input-error' : ''}`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter 10-digit mobile number"
                  className={`input-field ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I want to join as
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  className={`input-field ${errors.role ? 'input-error' : ''}`}
                  {...register('role')}
                >
                  <option value="customer">Customer</option>
                  <option value="picker">Store Worker/Picker</option>
                  <option value="rider">Delivery Rider</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* Address (only for customers) */}
            {watchedRole === 'customer' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700">Delivery Address</h3>
                
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    id="address.street"
                    type="text"
                    className={`input-field ${errors.address?.street ? 'input-error' : ''}`}
                    {...register('address.street')}
                  />
                  {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      id="address.city"
                      type="text"
                      className={`input-field ${errors.address?.city ? 'input-error' : ''}`}
                      {...register('address.city')}
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      id="address.state"
                      type="text"
                      className={`input-field ${errors.address?.state ? 'input-error' : ''}`}
                      {...register('address.state')}
                    />
                    {errors.address?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    id="address.zipCode"
                    type="text"
                    className={`input-field ${errors.address?.zipCode ? 'input-error' : ''}`}
                    {...register('address.zipCode')}
                  />
                  {errors.address?.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              {watchedPassword && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <CheckCircleIcon 
                        className={`h-4 w-4 mr-2 ${req.met ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword')}
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  {...register('agreeToTerms')}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="/terms" className="text-green-600 hover:text-green-500">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-green-600 hover:text-green-500">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Creating account...</span>
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or register with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
