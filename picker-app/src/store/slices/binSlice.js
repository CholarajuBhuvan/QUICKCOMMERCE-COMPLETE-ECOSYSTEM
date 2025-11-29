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
export const fetchBins = createAsyncThunk(
  'bins/fetchBins',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/bins', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bins');
    }
  }
);

export const fetchBinDetails = createAsyncThunk(
  'bins/fetchBinDetails',
  async (binId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/bins/${binId}`);
      return response.data.bin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bin details');
    }
  }
);

export const scanQRCode = createAsyncThunk(
  'bins/scanQRCode',
  async (qrData, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/scan-qr', { qrData });
      return response.data.bin;
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid QR code';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'bins/generateQRCode',
  async (binId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/bins/${binId}/qr-code`);
      return { binId, qrCode: response.data.qrCode };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate QR code');
    }
  }
);

export const addStockToBin = createAsyncThunk(
  'bins/addStockToBin',
  async ({ binId, productId, quantity, expiryDate, batchNumber }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/bins/${binId}/add-stock`, {
        productId,
        quantity,
        expiryDate,
        batchNumber
      });
      toast.success('Stock added to bin successfully');
      return response.data.bin;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add stock to bin';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeStockFromBin = createAsyncThunk(
  'bins/removeStockFromBin',
  async ({ binId, productId, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/bins/${binId}/remove-stock`, {
        productId,
        quantity,
        reason
      });
      toast.success('Stock removed from bin successfully');
      return response.data.bin;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove stock from bin';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const transferBetweenBins = createAsyncThunk(
  'bins/transferBetweenBins',
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

export const getBinHistory = createAsyncThunk(
  'bins/getBinHistory',
  async ({ binId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/bins/${binId}/history`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bin history');
    }
  }
);

export const findProductLocation = createAsyncThunk(
  'bins/findProductLocation',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}/inventory`);
      return response.data.inventory.binLocations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to find product location');
    }
  }
);

export const getBinsByZone = createAsyncThunk(
  'bins/getBinsByZone',
  async (zone, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/bins', { params: { zone } });
      return response.data.bins;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bins by zone');
    }
  }
);

const initialState = {
  bins: [],
  currentBin: null,
  scannedBin: null,
  binHistory: [],
  productLocations: [],
  binsByZone: [],
  qrCodes: {}, // Store QR codes by bin ID
  filters: {
    zone: '',
    binType: '',
    status: '', // 'empty', 'partial', 'full'
    search: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  historyPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  loading: false,
  scanLoading: false,
  actionLoading: false,
  historyLoading: false,
  error: null,
  scanError: null,
  lastScanned: null,
  zones: [], // Available zones
};

const binSlice = createSlice({
  name: 'bins',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentBin: (state) => {
      state.currentBin = null;
    },
    clearScannedBin: (state) => {
      state.scannedBin = null;
      state.scanError = null;
    },
    clearBinHistory: (state) => {
      state.binHistory = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearScanError: (state) => {
      state.scanError = null;
    },
    updateBinInList: (state, action) => {
      const { binId, updates } = action.payload;
      const binIndex = state.bins.findIndex(bin => bin._id === binId);
      
      if (binIndex !== -1) {
        state.bins[binIndex] = { ...state.bins[binIndex], ...updates };
      }
      
      if (state.currentBin && state.currentBin._id === binId) {
        state.currentBin = { ...state.currentBin, ...updates };
      }
      
      if (state.scannedBin && state.scannedBin._id === binId) {
        state.scannedBin = { ...state.scannedBin, ...updates };
      }
    },
    setLastScanned: (state, action) => {
      state.lastScanned = {
        binId: action.payload,
        timestamp: new Date().toISOString()
      };
    },
    setZones: (state, action) => {
      state.zones = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bins
      .addCase(fetchBins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBins.fulfilled, (state, action) => {
        state.loading = false;
        state.bins = action.payload.bins;
        state.pagination = action.payload.pagination;
        
        // Extract unique zones
        const zones = [...new Set(action.payload.bins.map(bin => bin.location.zone))];
        state.zones = zones;
        
        state.error = null;
      })
      .addCase(fetchBins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch bin details
      .addCase(fetchBinDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBinDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBin = action.payload;
        state.error = null;
      })
      .addCase(fetchBinDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Scan QR code
      .addCase(scanQRCode.pending, (state) => {
        state.scanLoading = true;
        state.scanError = null;
      })
      .addCase(scanQRCode.fulfilled, (state, action) => {
        state.scanLoading = false;
        state.scannedBin = action.payload;
        state.lastScanned = {
          binId: action.payload._id,
          timestamp: new Date().toISOString()
        };
        state.scanError = null;
      })
      .addCase(scanQRCode.rejected, (state, action) => {
        state.scanLoading = false;
        state.scanError = action.payload;
        state.scannedBin = null;
      })
      
      // Generate QR code
      .addCase(generateQRCode.fulfilled, (state, action) => {
        const { binId, qrCode } = action.payload;
        state.qrCodes[binId] = qrCode;
      })
      
      // Add stock to bin
      .addCase(addStockToBin.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addStockToBin.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedBin = action.payload;
        
        // Update current bin
        if (state.currentBin && state.currentBin._id === updatedBin._id) {
          state.currentBin = updatedBin;
        }
        
        // Update scanned bin
        if (state.scannedBin && state.scannedBin._id === updatedBin._id) {
          state.scannedBin = updatedBin;
        }
        
        // Update in bins list
        const binIndex = state.bins.findIndex(bin => bin._id === updatedBin._id);
        if (binIndex !== -1) {
          state.bins[binIndex] = updatedBin;
        }
      })
      .addCase(addStockToBin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Remove stock from bin
      .addCase(removeStockFromBin.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeStockFromBin.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedBin = action.payload;
        
        // Update current bin
        if (state.currentBin && state.currentBin._id === updatedBin._id) {
          state.currentBin = updatedBin;
        }
        
        // Update scanned bin
        if (state.scannedBin && state.scannedBin._id === updatedBin._id) {
          state.scannedBin = updatedBin;
        }
        
        // Update in bins list
        const binIndex = state.bins.findIndex(bin => bin._id === updatedBin._id);
        if (binIndex !== -1) {
          state.bins[binIndex] = updatedBin;
        }
      })
      .addCase(removeStockFromBin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Transfer between bins
      .addCase(transferBetweenBins.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(transferBetweenBins.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { fromBin, toBin } = action.payload;
        
        // Update bins in list
        const fromIndex = state.bins.findIndex(bin => bin._id === fromBin._id);
        if (fromIndex !== -1) {
          state.bins[fromIndex] = fromBin;
        }
        
        const toIndex = state.bins.findIndex(bin => bin._id === toBin._id);
        if (toIndex !== -1) {
          state.bins[toIndex] = toBin;
        }
        
        // Update current bin if it matches
        if (state.currentBin) {
          if (state.currentBin._id === fromBin._id) {
            state.currentBin = fromBin;
          } else if (state.currentBin._id === toBin._id) {
            state.currentBin = toBin;
          }
        }
      })
      .addCase(transferBetweenBins.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // Get bin history
      .addCase(getBinHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(getBinHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.binHistory = action.payload.history;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(getBinHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      
      // Find product location
      .addCase(findProductLocation.fulfilled, (state, action) => {
        state.productLocations = action.payload;
      })
      
      // Get bins by zone
      .addCase(getBinsByZone.fulfilled, (state, action) => {
        state.binsByZone = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentBin,
  clearScannedBin,
  clearBinHistory,
  clearError,
  clearScanError,
  updateBinInList,
  setLastScanned,
  setZones,
} = binSlice.actions;

export default binSlice.reducer;

// Selectors
export const selectBins = (state) => state.bins.bins;
export const selectCurrentBin = (state) => state.bins.currentBin;
export const selectScannedBin = (state) => state.bins.scannedBin;
export const selectBinHistory = (state) => state.bins.binHistory;
export const selectProductLocations = (state) => state.bins.productLocations;
export const selectBinsByZone = (state) => state.bins.binsByZone;
export const selectQRCodes = (state) => state.bins.qrCodes;
export const selectBinFilters = (state) => state.bins.filters;
export const selectBinPagination = (state) => state.bins.pagination;
export const selectHistoryPagination = (state) => state.bins.historyPagination;
export const selectBinLoading = (state) => state.bins.loading;
export const selectScanLoading = (state) => state.bins.scanLoading;
export const selectActionLoading = (state) => state.bins.actionLoading;
export const selectHistoryLoading = (state) => state.bins.historyLoading;
export const selectBinError = (state) => state.bins.error;
export const selectScanError = (state) => state.bins.scanError;
export const selectLastScanned = (state) => state.bins.lastScanned;
export const selectZones = (state) => state.bins.zones;

// Helper selectors
export const selectEmptyBins = (state) => 
  state.bins.bins.filter(bin => bin.currentStock.length === 0);

export const selectFullBins = (state) => 
  state.bins.bins.filter(bin => bin.isFull);

export const selectBinsByType = (binType) => (state) =>
  state.bins.bins.filter(bin => bin.binType === binType);
