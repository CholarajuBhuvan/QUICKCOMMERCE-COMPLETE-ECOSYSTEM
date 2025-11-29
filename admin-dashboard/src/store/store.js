import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import ordersSlice from './slices/ordersSlice';
import customersSlice from './slices/customersSlice';
import productsSlice from './slices/productsSlice';
import inventorySlice from './slices/inventorySlice';
import staffSlice from './slices/staffSlice';
import analyticsSlice from './slices/analyticsSlice';
import notificationsSlice from './slices/notificationsSlice';
import socketSlice from './slices/socketSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    orders: ordersSlice,
    customers: customersSlice,
    products: productsSlice,
    inventory: inventorySlice,
    staff: staffSlice,
    analytics: analyticsSlice,
    notifications: notificationsSlice,
    socket: socketSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.socket'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
