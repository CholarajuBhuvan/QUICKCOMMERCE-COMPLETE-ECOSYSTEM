import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fetch earnings summary
export const fetchEarningsSummary = createAsyncThunk(
  'earnings/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/riders/earnings/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

// Fetch earnings history
export const fetchEarningsHistory = createAsyncThunk(
  'earnings/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/riders/earnings/history`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings history');
    }
  }
);

const initialState = {
  summary: {
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    totalEarnings: 0,
    completedDeliveries: 0,
    averageEarningPerDelivery: 0,
  },
  history: [],
  loading: false,
  error: null,
  historyLoading: false,
  historyError: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    addEarning: (state, action) => {
      const earning = action.payload;
      state.summary.todayEarnings += earning.amount;
      state.summary.totalEarnings += earning.amount;
      state.summary.completedDeliveries += 1;
      state.summary.averageEarningPerDelivery = 
        state.summary.totalEarnings / state.summary.completedDeliveries;
      
      // Add to history
      state.history.unshift({
        ...earning,
        timestamp: new Date().toISOString()
      });
    },
    
    clearEarnings: (state) => {
      return initialState;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch summary
      .addCase(fetchEarningsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarningsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchEarningsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch history
      .addCase(fetchEarningsHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchEarningsHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchEarningsHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
  },
});

export const { addEarning, clearEarnings } = earningsSlice.actions;

export default earningsSlice.reducer;

// Selectors
export const selectEarningsSummary = (state) => state.earnings.summary;
export const selectEarningsHistory = (state) => state.earnings.history;
export const selectEarningsLoading = (state) => state.earnings.loading;
export const selectEarningsError = (state) => state.earnings.error;
export const selectHistoryLoading = (state) => state.earnings.historyLoading;
export const selectHistoryError = (state) => state.earnings.historyError;
