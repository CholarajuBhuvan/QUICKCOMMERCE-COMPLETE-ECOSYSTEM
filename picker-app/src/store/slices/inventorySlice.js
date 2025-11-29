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
export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'inventory/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params: { search: query } });
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getProductInventory = createAsyncThunk(
  'inventory/getProductInventory',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}/inventory`);
      return response.data.inventory;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product inventory');
    }
  }
);

export const updateProductStock = createAsyncThunk(
  'inventory/updateProductStock',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${productId}/inventory`, updates);
      toast.success('Product stock updated');
      return { productId, inventory: response.data.inventory };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update stock';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addStock = createAsyncThunk(
  'inventory/addStock',
  async ({ binId, productId, quantity, expiryDate, batchNumber }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/bins/${binId}/add-stock`, {
        productId,
        quantity,
        expiryDate,
        batchNumber
      });
      toast.success('Stock added successfully');
      return response.data.bin;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add stock';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeStock = createAsyncThunk(
  'inventory/removeStock',
  async ({ binId, productId, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/bins/${binId}/remove-stock`, {
        productId,
        quantity,
        reason
      });
      toast.success('Stock removed successfully');
      return response.data.bin;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove stock';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const transferStock = createAsyncThunk(
  'inventory/transferStock',
  async ({ fromBinId, toBinId, productId, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/bins/${fromBinId}/transfer/${toBinId}`, {
        productId,
        quantity,
        reason
      });
      toast.success('Stock transferred successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to transfer stock';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getLowStockItems = createAsyncThunk(
  'inventory/getLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { 
        params: { 
          lowStock: true,
          sortBy: 'inventory.availableStock',
          sortOrder: 'asc'
        }
      });
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

export const getOutOfStockItems = createAsyncThunk(
  'inventory/getOutOfStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { 
        params: { 
          inStock: false,
          sortBy: 'name',
          sortOrder: 'asc'
        }
      });
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch out of stock items');
    }
  }
);

export const getInventorySummary = createAsyncThunk(
  'inventory/getInventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/summary');
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory summary');
    }
  }
);

const initialState = {
  products: [],
  searchResults: [],
  lowStockItems: [],
  outOfStockItems: [],
  currentProduct: null,
  productInventory: null,
  summary: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  },
  filters: {
    category: '',
    brand: '',
    status: '', // 'in_stock', 'low_stock', 'out_of_stock'
    search: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  loading: false,
  actionLoading: false,
  searchLoading: false,
  error: null,
  lastUpdated: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.productInventory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProductInList: (state, action) => {
      const { productId, updates } = action.payload;
      
      // Update in products list
      const productIndex = state.products.findIndex(p => p._id === productId);
      if (productIndex !== -1) {
        state.products[productIndex] = { ...state.products[productIndex], ...updates };
      }
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(p => p._id === productId);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = { ...state.searchResults[searchIndex], ...updates };
      }
      
      // Update current product
      if (state.currentProduct && state.currentProduct._id === productId) {
        state.currentProduct = { ...state.currentProduct, ...updates };
      }
    },
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Get product inventory
      .addCase(getProductInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.productInventory = action.payload;
      })
      .addCase(getProductInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product stock
      .addCase(updateProductStock.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { productId, inventory } = action.payload;
        
        // Update product in list
        const productIndex = state.products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].inventory = inventory;
        }
        
        // Update current product inventory
        if (state.currentProduct && state.currentProduct._id === productId) {
          state.currentProduct.inventory = inventory;
          state.productInventory = inventory;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Add stock
      .addCase(addStock.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addStock.fulfilled, (state) => {
        state.actionLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Remove stock
      .addCase(removeStock.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeStock.fulfilled, (state) => {
        state.actionLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Transfer stock
      .addCase(transferStock.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(transferStock.fulfilled, (state) => {
        state.actionLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(transferStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Get low stock items
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })
      
      // Get out of stock items
      .addCase(getOutOfStockItems.fulfilled, (state, action) => {
        state.outOfStockItems = action.payload;
      })
      
      // Get inventory summary
      .addCase(getInventorySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearSearchResults,
  clearCurrentProduct,
  clearError,
  updateProductInList,
  setLastUpdated,
} = inventorySlice.actions;

export default inventorySlice.reducer;

// Selectors
export const selectProducts = (state) => state.inventory.products;
export const selectSearchResults = (state) => state.inventory.searchResults;
export const selectLowStockItems = (state) => state.inventory.lowStockItems;
export const selectOutOfStockItems = (state) => state.inventory.outOfStockItems;
export const selectCurrentProduct = (state) => state.inventory.currentProduct;
export const selectProductInventory = (state) => state.inventory.productInventory;
export const selectInventorySummary = (state) => state.inventory.summary;
export const selectInventoryFilters = (state) => state.inventory.filters;
export const selectInventoryPagination = (state) => state.inventory.pagination;
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectActionLoading = (state) => state.inventory.actionLoading;
export const selectSearchLoading = (state) => state.inventory.searchLoading;
export const selectInventoryError = (state) => state.inventory.error;
export const selectLastUpdated = (state) => state.inventory.lastUpdated;
