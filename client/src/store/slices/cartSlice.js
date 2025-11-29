import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// Using local storage for cart management (client-side cart)
// In production, you might want to sync with server

const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState = {
  items: getCartFromStorage(),
  loading: false,
  error: null,
  isOpen: false, // For cart sidebar/modal
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);

      if (existingItem) {
        // Check stock availability
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.inventory.availableStock) {
          toast.error(`Only ${product.inventory.availableStock} items available in stock`);
          return;
        }
        existingItem.quantity = newQuantity;
        existingItem.totalPrice = existingItem.quantity * product.price.selling;
        toast.success(`${product.name} quantity updated in cart`);
      } else {
        // Check stock availability
        if (quantity > product.inventory.availableStock) {
          toast.error(`Only ${product.inventory.availableStock} items available in stock`);
          return;
        }
        
        const cartItem = {
          id: `${product._id}_${Date.now()}`, // Unique cart item ID
          product,
          quantity,
          price: product.price.selling,
          totalPrice: quantity * product.price.selling,
          addedAt: new Date().toISOString(),
        };
        state.items.push(cartItem);
        toast.success(`${product.name} added to cart`);
      }

      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        state.items = state.items.filter(item => item.id !== itemId);
        saveCartToStorage(state.items);
        toast.success(`${item.product.name} removed from cart`);
      }
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item.id !== itemId);
          toast.success(`${item.product.name} removed from cart`);
        } else if (quantity > item.product.inventory.availableStock) {
          toast.error(`Only ${item.product.inventory.availableStock} items available in stock`);
          return;
        } else {
          item.quantity = quantity;
          item.totalPrice = quantity * item.price;
          toast.success('Cart updated');
        }
        saveCartToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
      toast.success('Cart cleared');
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    syncCartWithProducts: (state, action) => {
      // Sync cart items with updated product information
      const updatedProducts = action.payload;
      
      state.items = state.items.map(item => {
        const updatedProduct = updatedProducts.find(p => p._id === item.product._id);
        if (updatedProduct) {
          // Update product info and recalculate prices
          const newItem = {
            ...item,
            product: updatedProduct,
            price: updatedProduct.price.selling,
            totalPrice: item.quantity * updatedProduct.price.selling,
          };

          // Check if quantity exceeds available stock
          if (item.quantity > updatedProduct.inventory.availableStock) {
            newItem.quantity = updatedProduct.inventory.availableStock;
            newItem.totalPrice = newItem.quantity * updatedProduct.price.selling;
            if (updatedProduct.inventory.availableStock === 0) {
              toast.error(`${updatedProduct.name} is out of stock and removed from cart`);
              return null; // Will be filtered out
            } else {
              toast.warning(`${updatedProduct.name} quantity adjusted due to stock availability`);
            }
          }

          return newItem;
        }
        return item;
      }).filter(Boolean); // Remove null items (out of stock)

      saveCartToStorage(state.items);
    },

    applyCoupon: (state, action) => {
      const { couponCode, discountAmount, discountType } = action.payload;
      state.appliedCoupon = {
        code: couponCode,
        discountAmount,
        discountType, // 'percentage' or 'fixed'
      };
      toast.success(`Coupon ${couponCode} applied successfully!`);
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null;
      toast.success('Coupon removed');
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  syncCartWithProducts,
  applyCoupon,
  removeCoupon,
  setLoading,
  setError,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + item.totalPrice, 0);
export const selectCartSubtotal = (state) => {
  const subtotal = state.cart.items.reduce((total, item) => total + item.totalPrice, 0);
  return subtotal;
};
export const selectCartDiscount = (state) => {
  if (!state.cart.appliedCoupon) return 0;
  
  const subtotal = selectCartSubtotal({ cart: state.cart });
  const { discountAmount, discountType } = state.cart.appliedCoupon;
  
  if (discountType === 'percentage') {
    return (subtotal * discountAmount) / 100;
  } else {
    return Math.min(discountAmount, subtotal);
  }
};
export const selectCartFinalTotal = (state) => {
  const subtotal = selectCartSubtotal({ cart: state.cart });
  const discount = selectCartDiscount({ cart: state.cart });
  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery over ₹500
  
  return subtotal - discount + tax + deliveryFee;
};
export const selectCartIsOpen = (state) => state.cart.isOpen;
export const selectCartLoading = (state) => state.cart.loading;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
