import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Sidebar state
  sidebarOpen: localStorage.getItem('admin_sidebar_open') !== 'false',
  sidebarCollapsed: localStorage.getItem('admin_sidebar_collapsed') === 'true',
  
  // Modal states
  modals: {
    addProduct: false,
    editProduct: false,
    addCustomer: false,
    editCustomer: false,
    orderDetails: false,
    confirmDialog: false,
    userPermissions: false,
    systemSettings: false,
    exportData: false,
    importData: false,
  },
  
  // Loading states
  pageLoading: false,
  actionLoading: {},
  
  // Theme and preferences
  theme: localStorage.getItem('admin_theme') || 'light',
  
  // View preferences
  tableView: localStorage.getItem('admin_table_view') || 'comfortable', // 'compact', 'comfortable', 'spacious'
  itemsPerPage: parseInt(localStorage.getItem('admin_items_per_page')) || 25,
  
  // Dashboard preferences
  dashboardLayout: localStorage.getItem('admin_dashboard_layout') || 'default',
  dashboardWidgets: JSON.parse(localStorage.getItem('admin_dashboard_widgets') || '[]'),
  
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
    customers: {},
    products: {},
    inventory: {},
    staff: {},
  },
  
  // Search states
  searchQueries: {
    orders: '',
    customers: '',
    products: '',
    inventory: '',
    staff: '',
  },
  
  // Export/Import states
  exportState: {
    inProgress: false,
    progress: 0,
    type: null,
    downloadUrl: null,
  },
  
  importState: {
    inProgress: false,
    progress: 0,
    type: null,
    results: null,
  },
  
  // Connection status indicators
  showConnectionStatus: true,
  
  // Global app state
  isOnline: navigator.onLine,
  lastUserAction: null,
  maintenanceMode: false,
  
  // Notification preferences
  soundEnabled: localStorage.getItem('admin_sound_enabled') !== 'false',
  desktopNotifications: localStorage.getItem('admin_desktop_notifications') === 'true',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem('admin_sidebar_open', state.sidebarOpen.toString());
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
      localStorage.setItem('admin_sidebar_open', action.payload.toString());
    },
    
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('admin_sidebar_collapsed', state.sidebarCollapsed.toString());
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('admin_sidebar_collapsed', action.payload.toString());
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
      localStorage.setItem('admin_theme', action.payload);
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('admin_theme', state.theme);
    },
    
    // View preferences
    setTableView: (state, action) => {
      state.tableView = action.payload;
      localStorage.setItem('admin_table_view', action.payload);
    },
    
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      localStorage.setItem('admin_items_per_page', action.payload.toString());
    },
    
    // Dashboard preferences
    setDashboardLayout: (state, action) => {
      state.dashboardLayout = action.payload;
      localStorage.setItem('admin_dashboard_layout', action.payload);
    },
    
    updateDashboardWidgets: (state, action) => {
      state.dashboardWidgets = action.payload;
      localStorage.setItem('admin_dashboard_widgets', JSON.stringify(action.payload));
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
    
    // Export/Import states
    setExportState: (state, action) => {
      state.exportState = { ...state.exportState, ...action.payload };
    },
    
    resetExportState: (state) => {
      state.exportState = initialState.exportState;
    },
    
    setImportState: (state, action) => {
      state.importState = { ...state.importState, ...action.payload };
    },
    
    resetImportState: (state) => {
      state.importState = initialState.importState;
    },
    
    // Connection status
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
    
    setMaintenanceMode: (state, action) => {
      state.maintenanceMode = action.payload;
    },
    
    // Notification preferences
    setSoundEnabled: (state, action) => {
      state.soundEnabled = action.payload;
      localStorage.setItem('admin_sound_enabled', action.payload.toString());
    },
    
    setDesktopNotifications: (state, action) => {
      state.desktopNotifications = action.payload;
      localStorage.setItem('admin_desktop_notifications', action.payload.toString());
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        tableView: state.tableView,
        itemsPerPage: state.itemsPerPage,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        dashboardLayout: state.dashboardLayout,
        dashboardWidgets: state.dashboardWidgets,
        soundEnabled: state.soundEnabled,
        desktopNotifications: state.desktopNotifications,
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
  setTableView,
  setItemsPerPage,
  setDashboardLayout,
  updateDashboardWidgets,
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
  setExportState,
  resetExportState,
  setImportState,
  resetImportState,
  toggleConnectionStatus,
  setConnectionStatusVisible,
  setOnlineStatus,
  setLastUserAction,
  setMaintenanceMode,
  setSoundEnabled,
  setDesktopNotifications,
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
export const selectTableView = (state) => state.ui.tableView;
export const selectItemsPerPage = (state) => state.ui.itemsPerPage;
export const selectDashboardLayout = (state) => state.ui.dashboardLayout;
export const selectDashboardWidgets = (state) => state.ui.dashboardWidgets;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectAlerts = (state) => state.ui.alerts;
export const selectActiveFilters = (section) => (state) => state.ui.activeFilters[section] || {};
export const selectSearchQuery = (section) => (state) => state.ui.searchQueries[section] || '';
export const selectExportState = (state) => state.ui.exportState;
export const selectImportState = (state) => state.ui.importState;
export const selectConnectionStatusVisible = (state) => state.ui.showConnectionStatus;
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectLastUserAction = (state) => state.ui.lastUserAction;
export const selectMaintenanceMode = (state) => state.ui.maintenanceMode;
export const selectSoundEnabled = (state) => state.ui.soundEnabled;
export const selectDesktopNotifications = (state) => state.ui.desktopNotifications;

// Compound selectors
export const selectIsDarkTheme = (state) => state.ui.theme === 'dark';
export const selectAnyModalOpen = (state) => Object.values(state.ui.modals).some(Boolean);
export const selectHasActiveFilters = (section) => (state) => 
  Object.keys(state.ui.activeFilters[section] || {}).length > 0;
export const selectHasAnyActiveFilters = (state) =>
  Object.values(state.ui.activeFilters).some(filters => Object.keys(filters).length > 0);
