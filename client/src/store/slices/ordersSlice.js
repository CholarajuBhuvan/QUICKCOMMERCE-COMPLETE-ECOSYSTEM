import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.createOrder(orderData);
      toast.success('Order placed successfully!');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getMyOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId, reason);
      toast.success('Order cancelled successfully');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.trackOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track order');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  trackingInfo: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: '',
    startDate: '',
    endDate: '',
  },
  loading: false,
  createLoading: false,
  trackingLoading: false,
  error: null,
  recentOrders: [], // For quick access to recent orders
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOrderInList: (state, action) => {
      const { orderId, updates } = action.payload;
      const orderIndex = state.orders.findIndex(order => order._id === orderId);
      
      if (orderIndex !== -1) {
        state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
      }
      
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder = { ...state.currentOrder, ...updates };
      }
      
      // Update recent orders
      const recentOrderIndex = state.recentOrders.findIndex(order => order._id === orderId);
      if (recentOrderIndex !== -1) {
        state.recentOrders[recentOrderIndex] = { ...state.recentOrders[recentOrderIndex], ...updates };
      }
    },
    addOrderUpdate: (state, action) => {
      const { orderId, update } = action.payload;
      
      // Add timeline update to current order if it matches
      if (state.currentOrder && state.currentOrder._id === orderId) {
        if (!state.currentOrder.timeline) {
          state.currentOrder.timeline = [];
        }
        state.currentOrder.timeline.push(update);
        
        // Update order status if provided
        if (update.status) {
          state.currentOrder.orderStatus = update.status;
        }
      }
      
      // Update order in orders list
      const orderIndex = state.orders.findIndex(order => order._id === orderId);
      if (orderIndex !== -1) {
        if (!state.orders[orderIndex].timeline) {
          state.orders[orderIndex].timeline = [];
        }
        state.orders[orderIndex].timeline.push(update);
        
        if (update.status) {
          state.orders[orderIndex].orderStatus = update.status;
        }
      }
    },
    setRecentOrders: (state, action) => {
      state.recentOrders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentOrder = action.payload;
        // Add to recent orders at the beginning
        state.recentOrders.unshift(action.payload);
        // Keep only last 5 recent orders
        state.recentOrders = state.recentOrders.slice(0, 5);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        
        // Update recent orders with first 5 orders
        state.recentOrders = action.payload.orders.slice(0, 5);
        state.error = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        
        // Update current order
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        
        // Update order in list
        const orderIndex = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update recent orders
        const recentOrderIndex = state.recentOrders.findIndex(order => order._id === updatedOrder._id);
        if (recentOrderIndex !== -1) {
          state.recentOrders[recentOrderIndex] = updatedOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.trackingLoading = true;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.trackingInfo = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.trackingLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentOrder,
  clearTrackingInfo,
  clearError,
  updateOrderInList,
  addOrderUpdate,
  setRecentOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectRecentOrders = (state) => state.orders.recentOrders;
export const selectTrackingInfo = (state) => state.orders.trackingInfo;
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectOrdersFilters = (state) => state.orders.filters;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectCreateOrderLoading = (state) => state.orders.createLoading;
export const selectTrackingLoading = (state) => state.orders.trackingLoading;
export const selectOrdersError = (state) => state.orders.error;

// Helper selectors
export const selectOrdersByStatus = (status) => (state) =>
  state.orders.orders.filter(order => order.orderStatus === status);

export const selectPendingOrders = (state) =>
  state.orders.orders.filter(order => 
    ['pending', 'confirmed', 'picking'].includes(order.orderStatus)
  );

export const selectActiveOrders = (state) =>
  state.orders.orders.filter(order => 
    ['picking', 'ready_for_delivery', 'out_for_delivery'].includes(order.orderStatus)
  );

export const selectCompletedOrders = (state) =>
  state.orders.orders.filter(order => order.orderStatus === 'delivered');

export const selectCancelledOrders = (state) =>
  state.orders.orders.filter(order => order.orderStatus === 'cancelled');
