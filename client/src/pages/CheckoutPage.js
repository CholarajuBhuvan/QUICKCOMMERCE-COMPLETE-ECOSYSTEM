import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  TruckIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

import { 
  selectCartItems, 
  selectCartSubtotal,
  selectCartFinalTotal,
  clearCart 
} from '../store/slices/cartSlice';
import { createOrder, selectCreateOrderLoading } from '../store/slices/ordersSlice';
import { selectUser } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const schema = yup.object({
  deliveryAddress: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('ZIP code is required'),
    contactPhone: yup.string().required('Contact phone is required'),
    landmark: yup.string(),
  }),
  paymentMethod: yup.string().required('Payment method is required'),
  customerNotes: yup.string(),
  specialInstructions: yup.string(),
});

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const finalTotal = useSelector(selectCartFinalTotal);
  const user = useSelector(selectUser);
  const loading = useSelector(selectCreateOrderLoading);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [useDefaultAddress, setUseDefaultAddress] = useState(!!user?.address);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      deliveryAddress: user?.address || {},
      paymentMethod: 'cod'
    }
  });

  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  React.useEffect(() => {
    if (useDefaultAddress && user?.address) {
      Object.keys(user.address).forEach(key => {
        setValue(`deliveryAddress.${key}`, user.address[key]);
      });
    }
  }, [useDefaultAddress, user, setValue]);

  const onSubmit = async (data) => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        ...data
      };

      console.log('Submitting order:', orderData);
      console.log('Cart items:', cartItems);
      
      const order = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate(`/orders/${order._id}`);
    } catch (error) {
      console.error('Order submission error:', error);
      // Error is handled in the slice
    }
  };

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: TruckIcon,
      available: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Secure payment with your card',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using UPI apps like GPay, PhonePe',
      icon: CheckCircleIcon,
      available: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay using digital wallets',
      icon: CheckCircleIcon,
      available: false
    }
  ];

  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 40;

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Delivery Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Delivery Address</h2>
                </div>

                {user?.address && (
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useDefaultAddress}
                        onChange={(e) => setUseDefaultAddress(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Use my default address
                      </span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      disabled={useDefaultAddress}
                      className={`input-field ${errors.deliveryAddress?.street ? 'input-error' : ''} ${useDefaultAddress ? 'bg-gray-100' : ''}`}
                      {...register('deliveryAddress.street')}
                    />
                    {errors.deliveryAddress?.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      disabled={useDefaultAddress}
                      className={`input-field ${errors.deliveryAddress?.city ? 'input-error' : ''} ${useDefaultAddress ? 'bg-gray-100' : ''}`}
                      {...register('deliveryAddress.city')}
                    />
                    {errors.deliveryAddress?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      disabled={useDefaultAddress}
                      className={`input-field ${errors.deliveryAddress?.state ? 'input-error' : ''} ${useDefaultAddress ? 'bg-gray-100' : ''}`}
                      {...register('deliveryAddress.state')}
                    />
                    {errors.deliveryAddress?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      disabled={useDefaultAddress}
                      className={`input-field ${errors.deliveryAddress?.zipCode ? 'input-error' : ''} ${useDefaultAddress ? 'bg-gray-100' : ''}`}
                      {...register('deliveryAddress.zipCode')}
                    />
                    {errors.deliveryAddress?.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.zipCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      className={`input-field ${errors.deliveryAddress?.contactPhone ? 'input-error' : ''}`}
                      {...register('deliveryAddress.contactPhone')}
                    />
                    {errors.deliveryAddress?.contactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.contactPhone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Near hospital, school, etc."
                      className="input-field"
                      {...register('deliveryAddress.landmark')}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <CreditCardIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedPaymentMethod === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300'
                      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        disabled={!method.available}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => {
                          setSelectedPaymentMethod(e.target.value);
                          setValue('paymentMethod', e.target.value);
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                        {...register('paymentMethod')}
                      />
                      <div className="ml-3 flex items-center">
                        <method.icon className="h-5 w-5 text-gray-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {method.name}
                            {!method.available && (
                              <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Order Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                      className="input-field"
                      {...register('specialInstructions')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any additional notes..."
                      className="input-field"
                      {...register('customerNotes')}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6 sticky top-8"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">₹{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Estimated Delivery: 10 minutes
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 btn-primary flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="mt-2 text-xs text-gray-500 text-center">
                  Your payment information is secure and encrypted
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
