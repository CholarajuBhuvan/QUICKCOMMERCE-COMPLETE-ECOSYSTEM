import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inventory: [],
  bins: [],
  currentItem: null,
  currentBin: null,
  loading: false,
  error: null,
  activeTab: 'products',
  filters: {
    search: '',
    binType: 'all',
    status: 'all'
  },
  stats: {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalBins: 0
  }
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setInventory: (state, action) => {
      state.inventory = action.payload;
      state.loading = false;
      state.error = null;
    },
    setBins: (state, action) => {
      state.bins = action.payload;
      state.loading = false;
      state.error = null;
    },
    addStock: (state, action) => {
      const { productId, binId, quantity } = action.payload;
      const inventoryItem = state.inventory.find(item => 
        item.product._id === productId && item.bin._id === binId
      );
      if (inventoryItem) {
        inventoryItem.quantity += quantity;
      } else {
        state.inventory.push(action.payload);
      }
    },
    updateStock: (state, action) => {
      const index = state.inventory.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.inventory[index] = action.payload;
      }
    },
    updateBin: (state, action) => {
      const index = state.bins.findIndex(bin => bin._id === action.payload._id);
      if (index !== -1) {
        state.bins[index] = action.payload;
      }
      if (state.currentBin && state.currentBin._id === action.payload._id) {
        state.currentBin = action.payload;
      }
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    setCurrentBin: (state, action) => {
      state.currentBin = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearCurrentBin: (state) => {
      state.currentBin = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setInventory,
  setBins,
  addStock,
  updateStock,
  updateBin,
  setCurrentItem,
  setCurrentBin,
  setActiveTab,
  setFilters,
  setStats,
  clearCurrentItem,
  clearCurrentBin
} = inventorySlice.actions;

export default inventorySlice.reducer;
