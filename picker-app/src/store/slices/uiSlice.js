import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Sidebar state
  sidebarOpen: localStorage.getItem('picker_sidebar_open') === 'true',
  sidebarCollapsed: localStorage.getItem('picker_sidebar_collapsed') === 'true',
  
  // Modal states
  modals: {
    qrScanner: false,
    stockAdd: false,
    stockRemove: false,
    stockTransfer: false,
    orderDetails: false,
    binDetails: false,
    productSearch: false,
    confirmDialog: false,
    issueReport: false,
    orderComplete: false,
  },
  
  // Loading states
  pageLoading: false,
  actionLoading: {},
  
  // Theme and preferences
  theme: localStorage.getItem('picker_theme') || 'light',
  
  // View preferences
  orderView: localStorage.getItem('picker_order_view') || 'card', // 'card' or 'list'
  binView: localStorage.getItem('picker_bin_view') || 'grid', // 'grid' or 'list'
  
  // Quick actions panel
  quickActionsOpen: false,
  
  // Current scanning state
  scanningMode: false,
  scanResult: null,
  
  // Current operation context
  currentOperation: null, // 'picking', 'stocking', 'transferring', etc.
  operationData: null,
  
  // Confirmation dialog
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'default', // 'default', 'danger', 'warning'
    data: null,
  },
  
  // Alerts and messages
  alerts: [],
  
  // Active filters across different sections
  activeFilters: {
    orders: {},
    inventory: {},
    bins: {},
  },
  
  // Search states
  searchQueries: {
    orders: '',
    products: '',
    bins: '',
  },
  
  // Performance and stats display
  statsVisible: true,
  
  // Connection status indicators
  showConnectionStatus: true,
  
  // Global app state
  isOnline: navigator.onLine,
  lastUserAction: null,
  focusMode: false, // For distraction-free picking
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem('picker_sidebar_open', state.sidebarOpen.toString());
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
      localStorage.setItem('picker_sidebar_open', action.payload.toString());
    },
    
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('picker_sidebar_collapsed', state.sidebarCollapsed.toString());
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('picker_sidebar_collapsed', action.payload.toString());
    },
    
    // Modal management
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    
    // Loading states
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    setActionLoading: (state, action) => {
      const { actionId, loading } = action.payload;
      if (loading) {
        state.actionLoading[actionId] = true;
      } else {
        delete state.actionLoading[actionId];
      }
    },
    
    clearAllActionLoading: (state) => {
      state.actionLoading = {};
    },
    
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('picker_theme', action.payload);
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('picker_theme', state.theme);
    },
    
    // View preferences
    setOrderView: (state, action) => {
      state.orderView = action.payload;
      localStorage.setItem('picker_order_view', action.payload);
    },
    
    setBinView: (state, action) => {
      state.binView = action.payload;
      localStorage.setItem('picker_bin_view', action.payload);
    },
    
    // Quick actions
    toggleQuickActions: (state) => {
      state.quickActionsOpen = !state.quickActionsOpen;
    },
    
    setQuickActionsOpen: (state, action) => {
      state.quickActionsOpen = action.payload;
    },
    
    // Scanning state
    setScanningMode: (state, action) => {
      state.scanningMode = action.payload;
      if (!action.payload) {
        state.scanResult = null;
      }
    },
    
    setScanResult: (state, action) => {
      state.scanResult = action.payload;
    },
    
    clearScanResult: (state) => {
      state.scanResult = null;
      state.scanningMode = false;
    },
    
    // Operation context
    setCurrentOperation: (state, action) => {
      const { operation, data } = action.payload;
      state.currentOperation = operation;
      state.operationData = data;
    },
    
    clearCurrentOperation: (state) => {
      state.currentOperation = null;
      state.operationData = null;
    },
    
    // Confirmation dialog
    openConfirmDialog: (state, action) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },
    
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        ...initialState.confirmDialog,
        isOpen: false,
      };
    },
    
    // Alerts
    addAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.alerts.push(alert);
    },
    
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    // Filters
    setActiveFilters: (state, action) => {
      const { section, filters } = action.payload;
      if (state.activeFilters.hasOwnProperty(section)) {
        state.activeFilters[section] = { ...state.activeFilters[section], ...filters };
      }
    },
    
    clearActiveFilters: (state, action) => {
      const section = action.payload;
      if (state.activeFilters.hasOwnProperty(section)) {
        state.activeFilters[section] = {};
      }
    },
    
    clearAllFilters: (state) => {
      Object.keys(state.activeFilters).forEach(section => {
        state.activeFilters[section] = {};
      });
    },
    
    // Search queries
    setSearchQuery: (state, action) => {
      const { section, query } = action.payload;
      if (state.searchQueries.hasOwnProperty(section)) {
        state.searchQueries[section] = query;
      }
    },
    
    clearSearchQuery: (state, action) => {
      const section = action.payload;
      if (state.searchQueries.hasOwnProperty(section)) {
        state.searchQueries[section] = '';
      }
    },
    
    clearAllSearchQueries: (state) => {
      Object.keys(state.searchQueries).forEach(section => {
        state.searchQueries[section] = '';
      });
    },
    
    // Display preferences
    toggleStatsVisibility: (state) => {
      state.statsVisible = !state.statsVisible;
    },
    
    setStatsVisible: (state, action) => {
      state.statsVisible = action.payload;
    },
    
    toggleConnectionStatus: (state) => {
      state.showConnectionStatus = !state.showConnectionStatus;
    },
    
    setConnectionStatusVisible: (state, action) => {
      state.showConnectionStatus = action.payload;
    },
    
    // Global state
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    setLastUserAction: (state, action) => {
      state.lastUserAction = {
        action: action.payload.action,
        timestamp: new Date().toISOString(),
        data: action.payload.data || null,
      };
    },
    
    toggleFocusMode: (state) => {
      state.focusMode = !state.focusMode;
    },
    
    setFocusMode: (state, action) => {
      state.focusMode = action.payload;
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        orderView: state.orderView,
        binView: state.binView,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  setPageLoading,
  setActionLoading,
  clearAllActionLoading,
  setTheme,
  toggleTheme,
  setOrderView,
  setBinView,
  toggleQuickActions,
  setQuickActionsOpen,
  setScanningMode,
  setScanResult,
  clearScanResult,
  setCurrentOperation,
  clearCurrentOperation,
  openConfirmDialog,
  closeConfirmDialog,
  addAlert,
  removeAlert,
  clearAlerts,
  setActiveFilters,
  clearActiveFilters,
  clearAllFilters,
  setSearchQuery,
  clearSearchQuery,
  clearAllSearchQueries,
  toggleStatsVisibility,
  setStatsVisible,
  toggleConnectionStatus,
  setConnectionStatusVisible,
  setOnlineStatus,
  setLastUserAction,
  toggleFocusMode,
  setFocusMode,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModal = (modalName) => (state) => state.ui.modals[modalName] || false;
export const selectPageLoading = (state) => state.ui.pageLoading;
export const selectActionLoading = (actionId) => (state) => state.ui.actionLoading[actionId] || false;
export const selectTheme = (state) => state.ui.theme;
export const selectOrderView = (state) => state.ui.orderView;
export const selectBinView = (state) => state.ui.binView;
export const selectQuickActionsOpen = (state) => state.ui.quickActionsOpen;
export const selectScanningMode = (state) => state.ui.scanningMode;
export const selectScanResult = (state) => state.ui.scanResult;
export const selectCurrentOperation = (state) => state.ui.currentOperation;
export const selectOperationData = (state) => state.ui.operationData;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectAlerts = (state) => state.ui.alerts;
export const selectActiveFilters = (section) => (state) => state.ui.activeFilters[section] || {};
export const selectSearchQuery = (section) => (state) => state.ui.searchQueries[section] || '';
export const selectStatsVisible = (state) => state.ui.statsVisible;
export const selectConnectionStatusVisible = (state) => state.ui.showConnectionStatus;
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectLastUserAction = (state) => state.ui.lastUserAction;
export const selectFocusMode = (state) => state.ui.focusMode;

// Compound selectors
export const selectIsDarkTheme = (state) => state.ui.theme === 'dark';
export const selectAnyModalOpen = (state) => Object.values(state.ui.modals).some(Boolean);
export const selectHasActiveFilters = (section) => (state) => 
  Object.keys(state.ui.activeFilters[section] || {}).length > 0;
export const selectHasAnyActiveFilters = (state) =>
  Object.values(state.ui.activeFilters).some(filters => Object.keys(filters).length > 0);
