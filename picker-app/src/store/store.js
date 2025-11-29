import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import ordersSlice from './slices/ordersSlice';
import inventorySlice from './slices/inventorySlice';
import binSlice from './slices/binSlice';
import notificationsSlice from './slices/notificationsSlice';
import socketSlice from './slices/socketSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: ordersSlice,
    inventory: inventorySlice,
    bins: binSlice,
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
