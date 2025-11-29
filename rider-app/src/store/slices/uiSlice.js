import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  showMap: true,
  mapZoom: 13,
  theme: 'light',
  notifications: {
    sound: true,
    vibration: true,
  },
  filters: {
    deliveryStatus: 'all',
    dateRange: 'today',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleMap: (state) => {
      state.showMap = !state.showMap;
    },
    
    setMapZoom: (state, action) => {
      state.mapZoom = action.payload;
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMap,
  setMapZoom,
  setTheme,
  updateNotificationSettings,
  setFilters,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectShowMap = (state) => state.ui.showMap;
export const selectMapZoom = (state) => state.ui.mapZoom;
export const selectTheme = (state) => state.ui.theme;
export const selectNotificationSettings = (state) => state.ui.notifications;
export const selectFilters = (state) => state.ui.filters;
