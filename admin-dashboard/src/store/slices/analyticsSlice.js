import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  analytics: null,
  loading: false,
  error: null,
  timeRange: '7d',
  filters: {
    dateFrom: null,
    dateTo: null,
    category: 'all',
    store: 'all'
  },
  overview: {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    avgOrderValue: 0,
    avgOrderGrowth: 0
  },
  charts: {
    revenueData: [],
    categoryData: [],
    hourlyData: [],
    conversionData: []
  },
  performance: {
    avgDeliveryTime: 0,
    customerSatisfaction: 0,
    orderAccuracy: 0,
    onTimeDelivery: 0
  },
  topProducts: [],
  trends: {
    salesTrend: [],
    customerTrend: [],
    orderTrend: []
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
      state.error = null;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setOverview: (state, action) => {
      state.overview = { ...state.overview, ...action.payload };
    },
    setCharts: (state, action) => {
      state.charts = { ...state.charts, ...action.payload };
    },
    setPerformance: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    setTopProducts: (state, action) => {
      state.topProducts = action.payload;
    },
    setTrends: (state, action) => {
      state.trends = { ...state.trends, ...action.payload };
    },
    updateRevenueData: (state, action) => {
      state.charts.revenueData = action.payload;
    },
    updateCategoryData: (state, action) => {
      state.charts.categoryData = action.payload;
    },
    updateHourlyData: (state, action) => {
      state.charts.hourlyData = action.payload;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
      state.overview = initialState.overview;
      state.charts = initialState.charts;
      state.performance = initialState.performance;
      state.topProducts = [];
      state.trends = initialState.trends;
    }
  }
});

export const {
  setLoading,
  setError,
  setAnalytics,
  setTimeRange,
  setFilters,
  setOverview,
  setCharts,
  setPerformance,
  setTopProducts,
  setTrends,
  updateRevenueData,
  updateCategoryData,
  updateHourlyData,
  clearAnalytics
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
