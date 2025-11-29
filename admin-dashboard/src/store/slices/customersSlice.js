import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    customersPerPage: 10
  },
  stats: {
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    averageOrders: 0
  }
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCustomers: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(customer => customer._id === action.payload._id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.currentCustomer && state.currentCustomer._id === action.payload._id) {
        state.currentCustomer = action.payload;
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(customer => customer._id !== action.payload);
      if (state.currentCustomer && state.currentCustomer._id === action.payload) {
        state.currentCustomer = null;
      }
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setCurrentCustomer,
  setFilters,
  setPagination,
  setStats,
  clearCurrentCustomer
} = customersSlice.actions;

export default customersSlice.reducer;
