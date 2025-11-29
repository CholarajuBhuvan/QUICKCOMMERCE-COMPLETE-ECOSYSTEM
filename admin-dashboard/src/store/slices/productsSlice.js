import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 12
  },
  stats: {
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  },
  categories: []
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct && state.currentProduct._id === action.payload._id) {
        state.currentProduct = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(product => product._id !== action.payload);
      if (state.currentProduct && state.currentProduct._id === action.payload) {
        state.currentProduct = null;
      }
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
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
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setCurrentProduct,
  setFilters,
  setPagination,
  setStats,
  setCategories,
  clearCurrentProduct
} = productsSlice.actions;

export default productsSlice.reducer;
