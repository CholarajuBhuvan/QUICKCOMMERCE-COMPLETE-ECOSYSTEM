import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  filters: {
    type: '', // 'delivery_available', 'delivery_assigned', 'urgent_delivery', etc.
    priority: '', // 'low', 'medium', 'high', 'urgent'
    unreadOnly: false,
  },
  settings: {
    enableSound: true,
    enableDesktop: true,
    deliveryNotifications: true,
    routeNotifications: true,
    systemNotifications: true,
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        ...action.payload,
      };
      
      // Add to beginning of notifications array
      state.notifications.unshift(newNotification);
      
      // Update unread count
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
      
      // Keep only last 100 notifications to prevent memory issues
      if (state.notifications.length > 100) {
        const removedNotifications = state.notifications.slice(100);
        state.notifications = state.notifications.slice(0, 100);
        
        // Adjust unread count for removed notifications
        const removedUnread = removedNotifications.filter(n => !n.isRead).length;
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread);
      }

      // Play sound if enabled
      if (state.settings.enableSound && shouldPlaySound(newNotification, state.settings)) {
        playNotificationSound(newNotification.priority);
      }

      // Show desktop notification if enabled
      if (state.settings.enableDesktop && shouldShowDesktop(newNotification, state.settings)) {
        showDesktopNotification(newNotification);
      }
    },
    
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        
        // Update unread count if notification was unread
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        // Remove notification
        state.notifications.splice(notificationIndex, 1);
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    clearOldNotifications: (state, action) => {
      const daysOld = action.payload || 7; // Default to 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const oldNotifications = state.notifications.filter(n => 
        new Date(n.timestamp) < cutoffDate && n.isRead
      );
      
      state.notifications = state.notifications.filter(n => 
        new Date(n.timestamp) >= cutoffDate || !n.isRead
      );
      
      // Unread count should not change as we only remove read notifications
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
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Save to localStorage
      try {
        localStorage.setItem('rider_notification_settings', JSON.stringify(state.settings));
      } catch (error) {
        console.error('Failed to save notification settings:', error);
      }
    },
    
    loadSettings: (state) => {
      try {
        const savedSettings = localStorage.getItem('rider_notification_settings');
        if (savedSettings) {
          state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    },
    
    snoozeNotification: (state, action) => {
      const { notificationId, snoozeUntil } = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.snoozedUntil = snoozeUntil;
        notification.isRead = true;
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    unsnoozeExpiredNotifications: (state) => {
      const now = new Date();
      state.notifications.forEach(notification => {
        if (notification.snoozedUntil && new Date(notification.snoozedUntil) <= now) {
          notification.isRead = false;
          notification.snoozedUntil = null;
          state.unreadCount += 1;
        }
      });
    },
  },
});

// Helper functions
const shouldPlaySound = (notification, settings) => {
  if (!settings.enableSound) return false;
  
  switch (notification.type) {
    case 'delivery_available':
    case 'delivery_assigned':
    case 'urgent_delivery':
      return settings.deliveryNotifications;
    case 'route_optimized':
    case 'navigation_update':
      return settings.routeNotifications;
    case 'system_alert':
      return settings.systemNotifications;
    default:
      return true;
  }
};

const shouldShowDesktop = (notification, settings) => {
  if (!settings.enableDesktop) return false;
  
  // Only show desktop notifications for high priority items
  return ['high', 'urgent'].includes(notification.priority);
};

const playNotificationSound = (priority) => {
  try {
    // Create audio context if needed
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create different tones based on priority
      const frequency = priority === 'urgent' ? 1000 : priority === 'high' ? 750 : 500;
      const duration = priority === 'urgent' ? 0.5 : 0.3;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

const showDesktopNotification = (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });
    } catch (error) {
      console.warn('Could not show desktop notification:', error);
    }
  }
};

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  clearOldNotifications,
  toggleNotifications,
  openNotifications,
  closeNotifications,
  setFilters,
  clearFilters,
  updateSettings,
  loadSettings,
  snoozeNotification,
  unsnoozeExpiredNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsIsOpen = (state) => state.notifications.isOpen;
export const selectNotificationsFilters = (state) => state.notifications.filters;
export const selectNotificationsSettings = (state) => state.notifications.settings;

// Helper selectors
export const selectFilteredNotifications = (state) => {
  const { notifications, filters } = state.notifications;
  
  return notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.unreadOnly && notification.isRead) return false;
    
    // Don't show snoozed notifications
    if (notification.snoozedUntil && new Date(notification.snoozedUntil) > new Date()) {
      return false;
    }
    
    return true;
  });
};

export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter(n => !n.isRead);

export const selectNotificationsByType = (type) => (state) =>
  state.notifications.notifications.filter(n => n.type === type);

export const selectUrgentNotifications = (state) =>
  state.notifications.notifications.filter(n => n.priority === 'urgent' && !n.isRead);

export const selectRecentNotifications = (state) =>
  state.notifications.notifications.slice(0, 10); // Last 10 notifications
