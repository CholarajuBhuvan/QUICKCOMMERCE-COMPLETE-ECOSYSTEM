import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import deliveriesSlice from './slices/deliveriesSlice';
import notificationsSlice from './slices/notificationsSlice';
import socketSlice from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    deliveries: deliveriesSlice,
    notifications: notificationsSlice,
    socket: socketSlice,
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
