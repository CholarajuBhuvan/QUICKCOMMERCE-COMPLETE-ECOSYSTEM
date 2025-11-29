import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('picker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const fetchAvailableOrders = createAsyncThunk(
  'orders/fetchAvailableOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/picking/available');
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/picking/my-orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my orders');
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'orders/acceptOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/accept-picking`);
      toast.success('Order accepted for picking');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const startPicking = createAsyncThunk(
  'orders/startPicking',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/start-picking`);
      toast.success('Started picking order');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start picking';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const markItemPicked = createAsyncThunk(
  'orders/markItemPicked',
  async ({ orderId, itemIndex, binId, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/items/${itemIndex}/picked`, {
        binId,
        notes
      });
      toast.success('Item marked as picked');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark item as picked';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const completeOrder = createAsyncThunk(
  'orders/completeOrder',
  async ({ orderId, collectionBinId, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/complete-picking`, {
        collectionBinId,
        notes
      });
      toast.success('Order picking completed');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const reportIssue = createAsyncThunk(
  'orders/reportIssue',
  async ({ orderId, itemIndex, issue, description }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/items/${itemIndex}/issue`, {
        issue,
        description
      });
      toast.success('Issue reported');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to report issue';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

const initialState = {
  availableOrders: [],
  myOrders: [],
  currentOrder: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: '',
    priority: '',
    dateRange: '',
  },
  loading: false,
  actionLoading: false,
  error: null,
  stats: {
    todayPicked: 0,
    weeklyPicked: 0,
    totalPicked: 0,
    averagePickTime: 0,
  },
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
    clearError: (state) => {
      state.error = null;
    },
    updateOrderInList: (state, action) => {
      const { orderId, updates } = action.payload;
      
      // Update in available orders
      const availableIndex = state.availableOrders.findIndex(order => order._id === orderId);
      if (availableIndex !== -1) {
        state.availableOrders[availableIndex] = { ...state.availableOrders[availableIndex], ...updates };
      }
      
      // Update in my orders
      const myOrderIndex = state.myOrders.findIndex(order => order._id === orderId);
      if (myOrderIndex !== -1) {
        state.myOrders[myOrderIndex] = { ...state.myOrders[myOrderIndex], ...updates };
      }
      
      // Update current order
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder = { ...state.currentOrder, ...updates };
      }
    },
    addNewOrder: (state, action) => {
      const newOrder = action.payload;
      // Add to available orders if not assigned
      if (!newOrder.picker) {
        state.availableOrders.unshift(newOrder);
      }
    },
    removeOrderFromAvailable: (state, action) => {
      const orderId = action.payload;
      state.availableOrders = state.availableOrders.filter(order => order._id !== orderId);
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available orders
      .addCase(fetchAvailableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.availableOrders = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = action.payload;
        
        // Remove from available orders
        state.availableOrders = state.availableOrders.filter(o => o._id !== order._id);
        
        // Add to my orders
        const existingIndex = state.myOrders.findIndex(o => o._id === order._id);
        if (existingIndex === -1) {
          state.myOrders.unshift(order);
        } else {
          state.myOrders[existingIndex] = order;
        }
        
        state.currentOrder = order;
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Start picking
      .addCase(startPicking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startPicking.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = action.payload;
        
        // Update in my orders
        const index = state.myOrders.findIndex(o => o._id === order._id);
        if (index !== -1) {
          state.myOrders[index] = order;
        }
        
        state.currentOrder = order;
      })
      .addCase(startPicking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Mark item picked
      .addCase(markItemPicked.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markItemPicked.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = action.payload;
        
        // Update in my orders
        const index = state.myOrders.findIndex(o => o._id === order._id);
        if (index !== -1) {
          state.myOrders[index] = order;
        }
        
        state.currentOrder = order;
      })
      .addCase(markItemPicked.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Complete order
      .addCase(completeOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = action.payload;
        
        // Update in my orders
        const index = state.myOrders.findIndex(o => o._id === order._id);
        if (index !== -1) {
          state.myOrders[index] = order;
        }
        
        state.currentOrder = order;
        
        // Update stats
        state.stats.todayPicked += 1;
        state.stats.totalPicked += 1;
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Report issue
      .addCase(reportIssue.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(reportIssue.fulfilled, (state, action) => {
        state.actionLoading = false;
        const order = action.payload;
        
        // Update current order
        state.currentOrder = order;
      })
      .addCase(reportIssue.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentOrder,
  clearError,
  updateOrderInList,
  addNewOrder,
  removeOrderFromAvailable,
  updateStats,
} = ordersSlice.actions;

export default ordersSlice.reducer;

// Selectors
export const selectAvailableOrders = (state) => state.orders.availableOrders;
export const selectMyOrders = (state) => state.orders.myOrders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectOrdersFilters = (state) => state.orders.filters;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectActionLoading = (state) => state.orders.actionLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrdersStats = (state) => state.orders.stats;

// Helper selectors
export const selectActiveOrders = (state) => 
  state.orders.myOrders.filter(order => 
    ['picking', 'assigned'].includes(order.orderStatus)
  );

export const selectCompletedOrders = (state) => 
  state.orders.myOrders.filter(order => 
    ['picked', 'ready_for_delivery', 'out_for_delivery', 'delivered'].includes(order.orderStatus)
  );
