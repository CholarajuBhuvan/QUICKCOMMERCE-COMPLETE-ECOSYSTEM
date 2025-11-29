import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { addNotification } from './notificationsSlice';
import { updateDeliveryInList, addNewDelivery } from './deliveriesSlice';

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
        
        // Join rider-specific rooms
        socket.emit('join-room', `user-${auth.user.id}`);
        socket.emit('join-room', 'riders');
        
        if (auth.user.riderDetails?.storeId) {
          socket.emit('join-room', `store-${auth.user.riderDetails.storeId}`);
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

      // Listen for new delivery assignments
      socket.on('new-delivery-assignment', (order) => {
        dispatch(addNewDelivery(order));
        
        // Show notification for new delivery
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'delivery_available',
          title: 'New Delivery Available',
          message: `Order #${order.orderNumber} is ready for delivery`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { orderId: order._id }
        }));
      });

      // Listen for delivery updates
      socket.on('delivery-update', (update) => {
        dispatch(updateDeliveryInList({
          orderId: update.orderId,
          updates: {
            orderStatus: update.status,
            timeline: update.timeline || []
          }
        }));
      });

      // Listen for rider-specific notifications
      socket.on('delivery-assignment', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'delivery_assigned',
          title: 'Delivery Assigned',
          message: `You've been assigned order #${data.orderNumber} for delivery`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { orderId: data.orderId }
        }));
      });

      // Listen for urgent delivery alerts
      socket.on('urgent-delivery', (alert) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'urgent_delivery',
          title: alert.title,
          message: alert.message,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: alert.data
        }));
      });

      // Listen for customer updates
      socket.on('customer-location-update', (data) => {
        console.log('Customer location updated:', data);
        // Update delivery location if needed
      });

      // Listen for route optimization updates
      socket.on('route-optimized', (routeData) => {
        console.log('Route optimized:', routeData);
        // Update route information
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

// Emit rider availability status
export const emitAvailabilityStatus = createAsyncThunk(
  'socket/emitAvailabilityStatus',
  async (isAvailable, { getState }) => {
    const { socket } = getState().socket;
    const { user } = getState().auth;
    
    if (socket.socket && user) {
      socket.socket.emit('rider-available', {
        riderId: user.id,
        name: user.name,
        isAvailable,
        storeId: user.riderDetails?.storeId,
        currentLocation: user.riderDetails?.currentLocation,
        timestamp: new Date().toISOString()
      });
    }
    
    return isAvailable;
  }
);

// Emit location update
export const emitLocationUpdate = createAsyncThunk(
  'socket/emitLocationUpdate',
  async (location, { getState }) => {
    const { socket } = getState().socket;
    const { user } = getState().auth;
    
    if (socket.socket && user) {
      socket.socket.emit('rider-location-update', {
        riderId: user.id,
        location,
        timestamp: new Date().toISOString()
      });
    }
    
    return location;
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
      })
      
      // Emit availability status
      .addCase(emitAvailabilityStatus.fulfilled, (state, action) => {
        // Add event for tracking
        state.events.unshift({
          type: 'availability_update',
          data: { isAvailable: action.payload },
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        });
      })
      
      // Emit location update
      .addCase(emitLocationUpdate.fulfilled, (state, action) => {
        // Add event for tracking
        state.events.unshift({
          type: 'location_update',
          data: { location: action.payload },
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        });
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
