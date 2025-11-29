import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../services/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  loading: false,
  error: null,
  isOpen: false, // For notification dropdown/panel
  lastFetched: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = action.payload;
      
      // Add to beginning of notifications array
      state.notifications.unshift(newNotification);
      
      // Update unread count if notification is unread
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
      
      // Keep only last 50 notifications to prevent memory issues
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n._id === id);
      
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        const wasUnread = !notification.isRead;
        
        state.notifications[notificationIndex] = {
          ...notification,
          ...updates
        };
        
        // Update unread count if read status changed
        if (wasUnread && updates.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && updates.isRead === false) {
          state.unreadCount += 1;
        }
      }
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      
      if (notification) {
        // Update unread count if notification was unread
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        // Remove notification
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
      }
    },
    
    toggleNotifications: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    openNotifications: (state) => {
      state.isOpen = true;
    },
    
    closeNotifications: (state) => {
      state.isOpen = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = initialState.pagination;
      state.lastFetched = null;
    },
    
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification) {
          // Update unread count if notification was unread
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          
          // Remove notification
          state.notifications = state.notifications.filter(n => n._id !== notificationId);
        }
      });
  },
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  toggleNotifications,
  openNotifications,
  closeNotifications,
  clearError,
  resetNotifications,
  setUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsIsOpen = (state) => state.notifications.isOpen;
export const selectLastFetched = (state) => state.notifications.lastFetched;

// Helper selectors
export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter(n => !n.isRead);

export const selectNotificationsByType = (type) => (state) =>
  state.notifications.notifications.filter(n => n.type === type);

export const selectRecentNotifications = (state) =>
  state.notifications.notifications.slice(0, 5); // Last 5 notifications

export const selectOrderNotifications = (state) =>
  state.notifications.notifications.filter(n => 
    ['order_placed', 'order_assigned', 'picking_started', 'item_picked', 'order_ready', 'delivery_assigned', 'out_for_delivery', 'delivered', 'order_cancelled'].includes(n.type)
  );
