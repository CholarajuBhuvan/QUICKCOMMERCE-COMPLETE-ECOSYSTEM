import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rider_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const fetchAvailableDeliveries = createAsyncThunk(
  'deliveries/fetchAvailableDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/delivery/available');
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deliveries');
    }
  }
);

export const fetchMyDeliveries = createAsyncThunk(
  'deliveries/fetchMyDeliveries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/delivery/my-deliveries', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my deliveries');
    }
  }
);

export const acceptDelivery = createAsyncThunk(
  'deliveries/acceptDelivery',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/accept-delivery`);
      toast.success('Delivery accepted successfully');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept delivery';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const startDelivery = createAsyncThunk(
  'deliveries/startDelivery',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/start-delivery`);
      toast.success('Delivery started');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start delivery';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const markDelivered = createAsyncThunk(
  'deliveries/markDelivered',
  async ({ orderId, deliveryProof }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (deliveryProof.photo) {
        formData.append('photo', deliveryProof.photo);
      }
      formData.append('otp', deliveryProof.otp);
      formData.append('notes', deliveryProof.notes || '');
      formData.append('customerSignature', deliveryProof.signature || '');

      const response = await api.post(`/orders/${orderId}/mark-delivered`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Order marked as delivered');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark as delivered';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const reportIssue = createAsyncThunk(
  'deliveries/reportIssue',
  async ({ orderId, issue }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/delivery-issue`, issue);
      toast.success('Issue reported successfully');
      return response.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to report issue';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDeliveryDetails = createAsyncThunk(
  'deliveries/fetchDeliveryDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery details');
    }
  }
);

export const updateDeliveryLocation = createAsyncThunk(
  'deliveries/updateDeliveryLocation',
  async ({ orderId, location }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/update-location`, { location });
      return { orderId, location };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

const initialState = {
  availableDeliveries: [],
  myDeliveries: [],
  currentDelivery: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: '',
    priority: '',
    distance: '',
    dateRange: '',
  },
  loading: false,
  actionLoading: false,
  error: null,
  stats: {
    todayDeliveries: 0,
    weeklyDeliveries: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    completionRate: 0,
  },
  activeDelivery: null, // Currently active delivery
};

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentDelivery: (state) => {
      state.currentDelivery = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateDeliveryInList: (state, action) => {
      const { orderId, updates } = action.payload;
      
      // Update in available deliveries
      const availableIndex = state.availableDeliveries.findIndex(order => order._id === orderId);
      if (availableIndex !== -1) {
        state.availableDeliveries[availableIndex] = { ...state.availableDeliveries[availableIndex], ...updates };
      }
      
      // Update in my deliveries
      const myDeliveryIndex = state.myDeliveries.findIndex(order => order._id === orderId);
      if (myDeliveryIndex !== -1) {
        state.myDeliveries[myDeliveryIndex] = { ...state.myDeliveries[myDeliveryIndex], ...updates };
      }
      
      // Update current delivery
      if (state.currentDelivery && state.currentDelivery._id === orderId) {
        state.currentDelivery = { ...state.currentDelivery, ...updates };
      }
    },
    addNewDelivery: (state, action) => {
      const newDelivery = action.payload;
      // Add to available deliveries if not assigned
      if (!newDelivery.rider) {
        state.availableDeliveries.unshift(newDelivery);
      }
    },
    removeDeliveryFromAvailable: (state, action) => {
      const orderId = action.payload;
      state.availableDeliveries = state.availableDeliveries.filter(order => order._id !== orderId);
    },
    setActiveDelivery: (state, action) => {
      state.activeDelivery = action.payload;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available deliveries
      .addCase(fetchAvailableDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDeliveries = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch my deliveries
      .addCase(fetchMyDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.myDeliveries = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMyDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept delivery
      .addCase(acceptDelivery.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(acceptDelivery.fulfilled, (state, action) => {
        state.actionLoading = false;
        const delivery = action.payload;
        
        // Remove from available deliveries
        state.availableDeliveries = state.availableDeliveries.filter(d => d._id !== delivery._id);
        
        // Add to my deliveries
        const existingIndex = state.myDeliveries.findIndex(d => d._id === delivery._id);
        if (existingIndex === -1) {
          state.myDeliveries.unshift(delivery);
        } else {
          state.myDeliveries[existingIndex] = delivery;
        }
        
        state.currentDelivery = delivery;
      })
      .addCase(acceptDelivery.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Start delivery
      .addCase(startDelivery.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startDelivery.fulfilled, (state, action) => {
        state.actionLoading = false;
        const delivery = action.payload;
        
        // Update in my deliveries
        const index = state.myDeliveries.findIndex(d => d._id === delivery._id);
        if (index !== -1) {
          state.myDeliveries[index] = delivery;
        }
        
        state.currentDelivery = delivery;
        state.activeDelivery = delivery;
      })
      .addCase(startDelivery.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Mark delivered
      .addCase(markDelivered.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markDelivered.fulfilled, (state, action) => {
        state.actionLoading = false;
        const delivery = action.payload;
        
        // Update in my deliveries
        const index = state.myDeliveries.findIndex(d => d._id === delivery._id);
        if (index !== -1) {
          state.myDeliveries[index] = delivery;
        }
        
        state.currentDelivery = delivery;
        
        // Clear active delivery if this was it
        if (state.activeDelivery && state.activeDelivery._id === delivery._id) {
          state.activeDelivery = null;
        }
        
        // Update stats
        state.stats.todayDeliveries += 1;
        state.stats.totalDeliveries += 1;
      })
      .addCase(markDelivered.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Report issue
      .addCase(reportIssue.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(reportIssue.fulfilled, (state, action) => {
        state.actionLoading = false;
        const delivery = action.payload;
        
        // Update current delivery
        state.currentDelivery = delivery;
      })
      .addCase(reportIssue.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Fetch delivery details
      .addCase(fetchDeliveryDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDelivery = action.payload;
      })
      .addCase(fetchDeliveryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update delivery location
      .addCase(updateDeliveryLocation.fulfilled, (state, action) => {
        const { orderId, location } = action.payload;
        
        // Update current delivery location
        if (state.currentDelivery && state.currentDelivery._id === orderId) {
          state.currentDelivery.riderLocation = location;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentDelivery,
  clearError,
  updateDeliveryInList,
  addNewDelivery,
  removeDeliveryFromAvailable,
  setActiveDelivery,
  updateStats,
} = deliveriesSlice.actions;

export default deliveriesSlice.reducer;

// Selectors
export const selectAvailableDeliveries = (state) => state.deliveries.availableDeliveries;
export const selectMyDeliveries = (state) => state.deliveries.myDeliveries;
export const selectCurrentDelivery = (state) => state.deliveries.currentDelivery;
export const selectActiveDelivery = (state) => state.deliveries.activeDelivery;
export const selectDeliveriesPagination = (state) => state.deliveries.pagination;
export const selectDeliveriesFilters = (state) => state.deliveries.filters;
export const selectDeliveriesLoading = (state) => state.deliveries.loading;
export const selectActionLoading = (state) => state.deliveries.actionLoading;
export const selectDeliveriesError = (state) => state.deliveries.error;
export const selectDeliveriesStats = (state) => state.deliveries.stats;

// Helper selectors
export const selectInProgressDeliveries = (state) => 
  state.deliveries.myDeliveries.filter(delivery => 
    ['out_for_delivery', 'pickup_completed'].includes(delivery.orderStatus)
  );

export const selectCompletedDeliveries = (state) => 
  state.deliveries.myDeliveries.filter(delivery => 
    ['delivered', 'cancelled'].includes(delivery.orderStatus)
  );

export const selectPendingPickups = (state) => 
  state.deliveries.myDeliveries.filter(delivery => 
    delivery.orderStatus === 'ready_for_delivery'
  );
