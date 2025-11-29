import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('picker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('picker_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Check if user is picker or admin
      if (!['picker', 'admin'].includes(user.role)) {
        throw new Error('Access denied. Picker role required.');
      }
      
      localStorage.setItem('picker_token', token);
      toast.success(`Welcome back, ${user.name}!`);
      
      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('picker_token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const response = await api.get('/auth/profile');
      const user = response.data.user;
      
      // Check if user is picker or admin
      if (!['picker', 'admin'].includes(user.role)) {
        localStorage.removeItem('picker_token');
        return rejectWithValue('Access denied. Picker role required.');
      }
      
      return { token, user };
    } catch (error) {
      localStorage.removeItem('picker_token');
      return rejectWithValue('Token validation failed');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'auth/updateAvailability',
  async (isAvailable, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/picker/availability', { isAvailable });
      toast.success(`Availability updated to ${isAvailable ? 'Available' : 'Unavailable'}`);
      return isAvailable;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update availability';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  isAvailable: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.isAvailable = true;
      localStorage.removeItem('picker_token');
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAvailability: (state, action) => {
      state.isAvailable = action.payload;
      if (state.user) {
        state.user.pickerDetails = {
          ...state.user.pickerDetails,
          isAvailable: action.payload
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAvailable = action.payload.user.pickerDetails?.isAvailable ?? true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAvailable = action.payload.user.pickerDetails?.isAvailable ?? true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isAvailable = true;
      })
      
      // Update availability
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.isAvailable = action.payload;
        if (state.user) {
          state.user.pickerDetails = {
            ...state.user.pickerDetails,
            isAvailable: action.payload
          };
        }
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setLoading, setAvailability } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAvailable = (state) => state.auth.isAvailable;
export const selectToken = (state) => state.auth.token;
