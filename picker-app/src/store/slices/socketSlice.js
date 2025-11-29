import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { addNotification } from './notificationsSlice';
import { updateOrderInList, addNewOrder } from './ordersSlice';

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
        
        // Join picker-specific rooms
        socket.emit('join-room', `user-${auth.user.id}`);
        socket.emit('join-room', 'pickers');
        
        if (auth.user.pickerDetails?.storeId) {
          socket.emit('join-room', `store-${auth.user.pickerDetails.storeId}`);
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

      // Listen for new orders
      socket.on('new-order', (order) => {
        dispatch(addNewOrder(order));
        
        // Show notification for new order
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'order_available',
          title: 'New Order Available',
          message: `Order #${order.orderNumber} is ready for picking`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { orderId: order._id }
        }));
      });

      // Listen for order updates
      socket.on('order-update', (update) => {
        dispatch(updateOrderInList({
          orderId: update.orderId,
          updates: {
            orderStatus: update.status,
            timeline: update.timeline || []
          }
        }));
      });

      // Listen for inventory updates
      socket.on('inventory-update', (data) => {
        console.log('Inventory update received:', data);
        
        // Show notification for low stock
        if (data.type === 'low_stock') {
          dispatch(addNotification({
            id: Date.now().toString(),
            type: 'stock_low',
            title: 'Low Stock Alert',
            message: `${data.productName} is running low (${data.currentStock} remaining)`,
            priority: 'medium',
            isRead: false,
            createdAt: new Date().toISOString(),
            data: { productId: data.productId }
          }));
        }
      });

      // Listen for bin updates
      socket.on('bin-update', (data) => {
        console.log('Bin update received:', data);
      });

      // Listen for picker-specific notifications
      socket.on('picker-assignment', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'order_assigned',
          title: 'Order Assigned',
          message: `You've been assigned order #${data.orderNumber}`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { orderId: data.orderId }
        }));
      });

      // Listen for urgent alerts
      socket.on('urgent-alert', (alert) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'system_alert',
          title: alert.title,
          message: alert.message,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: alert.data
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

// Emit picker availability status
export const emitAvailabilityStatus = createAsyncThunk(
  'socket/emitAvailabilityStatus',
  async (isAvailable, { getState }) => {
    const { socket } = getState().socket;
    const { user } = getState().auth;
    
    if (socket.socket && user) {
      socket.socket.emit('picker-available', {
        pickerId: user.id,
        name: user.name,
        isAvailable,
        storeId: user.pickerDetails?.storeId,
        timestamp: new Date().toISOString()
      });
    }
    
    return isAvailable;
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
