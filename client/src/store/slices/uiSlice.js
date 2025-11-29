import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Loading states
  pageLoading: false,
  buttonLoading: {},
  
  // Modal states
  modals: {
    login: false,
    register: false,
    cart: false,
    productQuickView: false,
    addressForm: false,
    orderTracking: false,
    review: false,
    confirmDialog: false,
  },
  
  // Sidebar states
  sidebars: {
    mobile: false,
    filters: false,
    notifications: false,
  },
  
  // Theme and preferences
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'en',
  
  // Search and filters
  searchOpen: false,
  filtersOpen: false,
  
  // Notifications and alerts
  alerts: [],
  banners: [],
  
  // Product view preferences
  productView: localStorage.getItem('productView') || 'grid', // 'grid' or 'list'
  productsPerPage: parseInt(localStorage.getItem('productsPerPage')) || 20,
  
  // Quick view product
  quickViewProduct: null,
  
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
  },
  
  // Address form data
  addressForm: {
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    addressData: null,
  },
  
  // Order tracking
  orderTracking: {
    isOpen: false,
    orderId: null,
  },
  
  // Review form
  reviewForm: {
    isOpen: false,
    productId: null,
    orderData: null,
  },
  
  // Toast notifications (complementing react-hot-toast)
  toasts: [],
  
  // Global app state
  isOnline: navigator.onLine,
  deviceType: 'desktop', // 'mobile', 'tablet', 'desktop'
  
  // Performance metrics
  pageLoadTime: null,
  lastUserAction: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    setButtonLoading: (state, action) => {
      const { buttonId, loading } = action.payload;
      if (loading) {
        state.buttonLoading[buttonId] = true;
      } else {
        delete state.buttonLoading[buttonId];
      }
    },
    
    clearAllButtonLoading: (state) => {
      state.buttonLoading = {};
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
    
    // Sidebar management
    toggleSidebar: (state, action) => {
      const sidebarName = action.payload;
      if (state.sidebars.hasOwnProperty(sidebarName)) {
        state.sidebars[sidebarName] = !state.sidebars[sidebarName];
      }
    },
    
    openSidebar: (state, action) => {
      const sidebarName = action.payload;
      if (state.sidebars.hasOwnProperty(sidebarName)) {
        state.sidebars[sidebarName] = true;
      }
    },
    
    closeSidebar: (state, action) => {
      const sidebarName = action.payload;
      if (state.sidebars.hasOwnProperty(sidebarName)) {
        state.sidebars[sidebarName] = false;
      }
    },
    
    closeAllSidebars: (state) => {
      Object.keys(state.sidebars).forEach(sidebar => {
        state.sidebars[sidebar] = false;
      });
    },
    
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // Language management
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // Search and filters
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    
    toggleFilters: (state) => {
      state.filtersOpen = !state.filtersOpen;
    },
    
    setFiltersOpen: (state, action) => {
      state.filtersOpen = action.payload;
    },
    
    // Product view preferences
    setProductView: (state, action) => {
      state.productView = action.payload;
      localStorage.setItem('productView', action.payload);
    },
    
    setProductsPerPage: (state, action) => {
      state.productsPerPage = action.payload;
      localStorage.setItem('productsPerPage', action.payload.toString());
    },
    
    // Quick view
    setQuickViewProduct: (state, action) => {
      state.quickViewProduct = action.payload;
      if (action.payload) {
        state.modals.productQuickView = true;
      } else {
        state.modals.productQuickView = false;
      }
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
    
    // Address form
    openAddressForm: (state, action) => {
      state.addressForm = {
        isOpen: true,
        mode: action.payload.mode || 'add',
        addressData: action.payload.addressData || null,
      };
    },
    
    closeAddressForm: (state) => {
      state.addressForm = initialState.addressForm;
    },
    
    // Order tracking
    openOrderTracking: (state, action) => {
      state.orderTracking = {
        isOpen: true,
        orderId: action.payload,
      };
    },
    
    closeOrderTracking: (state) => {
      state.orderTracking = initialState.orderTracking;
    },
    
    // Review form
    openReviewForm: (state, action) => {
      state.reviewForm = {
        isOpen: true,
        productId: action.payload.productId,
        orderData: action.payload.orderData || null,
      };
    },
    
    closeReviewForm: (state) => {
      state.reviewForm = initialState.reviewForm;
    },
    
    // Alerts and banners
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
    
    addBanner: (state, action) => {
      const banner = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.banners.push(banner);
    },
    
    removeBanner: (state, action) => {
      state.banners = state.banners.filter(banner => banner.id !== action.payload);
    },
    
    clearBanners: (state) => {
      state.banners = [];
    },
    
    // Connection status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    // Device type
    setDeviceType: (state, action) => {
      state.deviceType = action.payload;
    },
    
    // Performance tracking
    setPageLoadTime: (state, action) => {
      state.pageLoadTime = action.payload;
    },
    
    setLastUserAction: (state, action) => {
      state.lastUserAction = {
        action: action.payload.action,
        timestamp: new Date().toISOString(),
        data: action.payload.data || null,
      };
    },
    
    // Reset all UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        language: state.language,
        productView: state.productView,
        productsPerPage: state.productsPerPage,
      };
    },
  },
});

export const {
  setPageLoading,
  setButtonLoading,
  clearAllButtonLoading,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  closeAllSidebars,
  setTheme,
  toggleTheme,
  setLanguage,
  toggleSearch,
  setSearchOpen,
  toggleFilters,
  setFiltersOpen,
  setProductView,
  setProductsPerPage,
  setQuickViewProduct,
  openConfirmDialog,
  closeConfirmDialog,
  openAddressForm,
  closeAddressForm,
  openOrderTracking,
  closeOrderTracking,
  openReviewForm,
  closeReviewForm,
  addAlert,
  removeAlert,
  clearAlerts,
  addBanner,
  removeBanner,
  clearBanners,
  setOnlineStatus,
  setDeviceType,
  setPageLoadTime,
  setLastUserAction,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectPageLoading = (state) => state.ui.pageLoading;
export const selectButtonLoading = (buttonId) => (state) => state.ui.buttonLoading[buttonId] || false;
export const selectModal = (modalName) => (state) => state.ui.modals[modalName] || false;
export const selectSidebar = (sidebarName) => (state) => state.ui.sidebars[sidebarName] || false;
export const selectTheme = (state) => state.ui.theme;
export const selectLanguage = (state) => state.ui.language;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectFiltersOpen = (state) => state.ui.filtersOpen;
export const selectProductView = (state) => state.ui.productView;
export const selectProductsPerPage = (state) => state.ui.productsPerPage;
export const selectQuickViewProduct = (state) => state.ui.quickViewProduct;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectAddressForm = (state) => state.ui.addressForm;
export const selectOrderTracking = (state) => state.ui.orderTracking;
export const selectReviewForm = (state) => state.ui.reviewForm;
export const selectAlerts = (state) => state.ui.alerts;
export const selectBanners = (state) => state.ui.banners;
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectDeviceType = (state) => state.ui.deviceType;
export const selectLastUserAction = (state) => state.ui.lastUserAction;

// Compound selectors
export const selectIsMobile = (state) => state.ui.deviceType === 'mobile';
export const selectIsTablet = (state) => state.ui.deviceType === 'tablet';
export const selectIsDesktop = (state) => state.ui.deviceType === 'desktop';
export const selectIsDarkTheme = (state) => state.ui.theme === 'dark';
export const selectAnyModalOpen = (state) => Object.values(state.ui.modals).some(Boolean);
export const selectAnySidebarOpen = (state) => Object.values(state.ui.sidebars).some(Boolean);
