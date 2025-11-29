import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    dateRange: 'all'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  }
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrder && state.currentOrder._id === action.payload._id) {
        state.currentOrder = action.payload;
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setOrders,
  addOrder,
  updateOrder,
  setCurrentOrder,
  setFilters,
  setPagination,
  clearCurrentOrder
} = ordersSlice.actions;

export default ordersSlice.reducer;
