import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { checkAuthStatus } from './store/slices/authSlice';
import { setupSocketConnection } from './store/slices/socketSlice';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Components
import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import MapPage from './pages/MapPage';
import EarningsPage from './pages/EarningsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/auth/LoginPage';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const { isConnected } = useSelector(state => state.socket);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Setup socket connection when authenticated
    if (isAuthenticated && !isConnected) {
      dispatch(setupSocketConnection());
    }
  }, [isAuthenticated, isConnected, dispatch]);

  // Redirect non-rider users
  useEffect(() => {
    if (isAuthenticated && user && !['rider', 'admin'].includes(user.role)) {
      window.location.href = 'http://localhost:3000'; // Redirect to customer app
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" text="Loading rider interface..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DashboardPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Deliveries */}
              <Route 
                path="/deliveries" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DeliveriesPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deliveries/:id" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DeliveryDetailPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Map */}
              <Route 
                path="/map" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MapPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Earnings */}
              <Route 
                path="/earnings" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EarningsPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['rider', 'admin']}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProfilePage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />

              {/* Redirect any unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
