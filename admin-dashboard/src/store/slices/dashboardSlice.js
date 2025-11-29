import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-orders');
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent orders');
    }
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'dashboard/fetchRevenueChart',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/revenue-chart?period=${period}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue chart');
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/top-products');
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top products');
    }
  }
);

export const fetchRealtimeActivity = createAsyncThunk(
  'dashboard/fetchRealtimeActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/realtime-activity');
      return response.data.activities;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch realtime activity');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'dashboard/fetchPerformanceMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/performance-metrics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance metrics');
    }
  }
);

const initialState = {
  stats: {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    ordersToday: 0,
    revenueToday: 0,
    newCustomersToday: 0,
    conversionRate: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    lowStockProducts: 0,
  },
  recentOrders: [],
  revenueChart: {
    labels: [],
    data: [],
    period: '7d'
  },
  topProducts: [],
  realtimeActivity: [],
  performanceMetrics: {
    pickers: {
      available: 0,
      busy: 0,
      offline: 0,
      averagePickTime: 0,
      totalPicksToday: 0
    },
    riders: {
      available: 0,
      busy: 0,
      offline: 0,
      averageDeliveryTime: 0,
      totalDeliveriesToday: 0
    },
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      activeUsers: 0
    }
  },
  loading: false,
  chartLoading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addRealtimeActivity: (state, action) => {
      state.realtimeActivity.unshift(action.payload);
      // Keep only last 50 activities
      if (state.realtimeActivity.length > 50) {
        state.realtimeActivity = state.realtimeActivity.slice(0, 50);
      }
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updatePerformanceMetrics: (state, action) => {
      state.performanceMetrics = {
        ...state.performanceMetrics,
        ...action.payload
      };
    },
    setChartPeriod: (state, action) => {
      state.revenueChart.period = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch recent orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload;
      })
      
      // Fetch revenue chart
      .addCase(fetchRevenueChart.pending, (state) => {
        state.chartLoading = true;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.revenueChart = {
          ...state.revenueChart,
          labels: action.payload.labels,
          data: action.payload.data
        };
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.chartLoading = false;
        state.error = action.payload;
      })
      
      // Fetch top products
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })
      
      // Fetch realtime activity
      .addCase(fetchRealtimeActivity.fulfilled, (state, action) => {
        state.realtimeActivity = action.payload;
      })
      
      // Fetch performance metrics
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceMetrics = action.payload;
      });
  },
});

export const {
  clearError,
  addRealtimeActivity,
  updateStats,
  updatePerformanceMetrics,
  setChartPeriod,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectRecentOrders = (state) => state.dashboard.recentOrders;
export const selectRevenueChart = (state) => state.dashboard.revenueChart;
export const selectTopProducts = (state) => state.dashboard.topProducts;
export const selectRealtimeActivity = (state) => state.dashboard.realtimeActivity;
export const selectPerformanceMetrics = (state) => state.dashboard.performanceMetrics;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectChartLoading = (state) => state.dashboard.chartLoading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectLastUpdated = (state) => state.dashboard.lastUpdated;
