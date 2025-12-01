import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ShoppingBagIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import {
  selectCartItems,
  selectCartSubtotal,
  selectCartFinalTotal,
  selectCartIsOpen,
  closeCart,
  updateQuantity,
  removeFromCart
} from '../../store/slices/cartSlice';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const finalTotal = useSelector(selectCartFinalTotal);
  const isOpen = useSelector(selectCartIsOpen);

  const handleQuantityUpdate = (itemId, newQuantity) => {
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleClose = () => {
    dispatch(closeCart());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({cartItems.length})
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 text-center mb-6">
                  Add items to your cart to see them here
                </p>
                <Link
                  to="/products"
                  onClick={handleClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder-product.png'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2 bg-white border rounded-lg">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                              disabled={item.quantity >= item.product.inventory?.availableStock}
                            >
                              <PlusIcon className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t p-4 space-y-4">
                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      to="/cart"
                      onClick={handleClose}
                      className="block w-full px-4 py-3 text-center bg-white text-green-600 border-2 border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                    >
                      View Cart
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={handleClose}
                      className="block w-full px-4 py-3 text-center bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
