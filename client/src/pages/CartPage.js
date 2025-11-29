import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  selectCartItems,
  selectCartSubtotal,
  selectCartFinalTotal,
  updateQuantity,
  removeFromCart,
  clearCart
} from '../store/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const finalTotal = useSelector(selectCartFinalTotal);

  const handleQuantityUpdate = (itemId, newQuantity) => {
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">
              Start shopping to add items to your cart.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center btn-primary"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery over ₹500

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Items ({cartItems.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 flex items-center space-x-4"
                    >
                      <img
                        src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product.brand}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-medium text-gray-900">
                            ₹{item.price}
                          </span>
                          {item.product.price?.mrp > item.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ₹{item.product.price.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.inventory?.availableStock}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-sm font-medium text-gray-900 w-20 text-right">
                        ₹{item.totalPrice}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
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
                
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(500 - subtotal).toFixed(2)} more for free delivery
                  </p>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full btn-primary text-center block"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/products"
                  className="w-full btn-outline text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    10 minute delivery
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your order will be delivered within 10 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
