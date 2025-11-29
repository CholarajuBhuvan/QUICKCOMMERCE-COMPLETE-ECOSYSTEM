import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { addNotification } from './notificationsSlice';
import { addOrderUpdate } from './ordersSlice';

// Socket connection thunk
export const setupSocketConnection = createAsyncThunk(
  'socket/setupConnection',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.isAuthenticated || !auth.user) {
        return rejectWithValue('User not authenticated');
      }

      const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: auth.token
        },
        transports: ['websocket']
      });

      // Setup event listeners
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        
        // Join user-specific room
        socket.emit('join-room', `user-${auth.user.id}`);
        
        // Join customer room for order updates
        if (auth.user.role === 'customer') {
          socket.emit('join-room', `customer-${auth.user.id}`);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Listen for notifications
      socket.on('new-notification', (notification) => {
        dispatch(addNotification(notification));
      });

      // Listen for order updates
      socket.on('order-update', (update) => {
        dispatch(addOrderUpdate({
          orderId: update.orderId,
          update: {
            status: update.status,
            message: update.message,
            timestamp: new Date().toISOString(),
            notes: update.message
          }
        }));
      });

      // Listen for real-time inventory updates (if needed)
      socket.on('inventory-update', (data) => {
        // Handle inventory updates
        console.log('Inventory update:', data);
      });

      // Listen for promotional notifications
      socket.on('promotion-notification', (promotion) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'promotion',
          title: promotion.title,
          message: promotion.message,
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { customData: promotion }
        }));
      });

      return socket;
    } catch (error) {
      console.error('Socket setup error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const disconnectSocket = createAsyncThunk(
  'socket/disconnect',
  async (_, { getState }) => {
    const { socket } = getState().socket;
    if (socket) {
      socket.disconnect();
    }
    return true;
  }
);

const initialState = {
  socket: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  lastConnected: null,
  events: [], // Store recent socket events for debugging
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    
    setConnected: (state, action) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.lastConnected = new Date().toISOString();
        state.reconnectAttempts = 0;
        state.connectionError = null;
      }
    },
    
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
      state.isConnecting = false;
    },
    
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
    
    addEvent: (state, action) => {
      const event = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      state.events.unshift(event);
      
      // Keep only last 50 events
      if (state.events.length > 50) {
        state.events = state.events.slice(0, 50);
      }
    },
    
    clearEvents: (state) => {
      state.events = [];
    },
    
    reset: (state) => {
      return { ...initialState };
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Setup connection
      .addCase(setupSocketConnection.pending, (state) => {
        state.isConnecting = true;
        state.connectionError = null;
      })
      .addCase(setupSocketConnection.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.socket = action.payload;
        state.isConnected = true;
        state.lastConnected = new Date().toISOString();
        state.reconnectAttempts = 0;
        state.connectionError = null;
      })
      .addCase(setupSocketConnection.rejected, (state, action) => {
        state.isConnecting = false;
        state.connectionError = action.payload;
        state.reconnectAttempts += 1;
      })
      
      // Disconnect
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.socket = null;
        state.isConnected = false;
        state.isConnecting = false;
        state.connectionError = null;
      });
  },
});

export const {
  setSocket,
  setConnected,
  setConnecting,
  setConnectionError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  addEvent,
  clearEvents,
  reset,
} = socketSlice.actions;

export default socketSlice.reducer;

// Selectors
export const selectSocket = (state) => state.socket.socket;
export const selectIsConnected = (state) => state.socket.isConnected;
export const selectIsConnecting = (state) => state.socket.isConnecting;
export const selectConnectionError = (state) => state.socket.connectionError;
export const selectReconnectAttempts = (state) => state.socket.reconnectAttempts;
export const selectLastConnected = (state) => state.socket.lastConnected;
export const selectSocketEvents = (state) => state.socket.events;

// Helper selectors
export const selectConnectionStatus = (state) => {
  if (state.socket.isConnected) return 'connected';
  if (state.socket.isConnecting) return 'connecting';
  if (state.socket.connectionError) return 'error';
  return 'disconnected';
};

export const selectShouldReconnect = (state) => 
  !state.socket.isConnected && 
  !state.socket.isConnecting && 
  state.socket.reconnectAttempts < state.socket.maxReconnectAttempts;
