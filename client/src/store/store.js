import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productsSlice from './slices/productsSlice';
import cartSlice from './slices/cartSlice';
import ordersSlice from './slices/ordersSlice';
import notificationsSlice from './slices/notificationsSlice';
import socketSlice from './slices/socketSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productsSlice,
    cart: cartSlice,
    orders: ordersSlice,
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
