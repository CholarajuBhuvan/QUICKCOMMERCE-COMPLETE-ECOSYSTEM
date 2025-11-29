import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { checkAuthStatus } from './store/slices/authSlice';
import { setupSocketConnection } from './store/slices/socketSlice';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Components
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HomePage />
                </motion.div>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductsPage />
                </motion.div>
              } 
            />
            
            <Route 
              path="/products/:id" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductDetailPage />
                </motion.div>
              } 
            />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterPage />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CartPage />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckoutPage />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrdersPage />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderDetailPage />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
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

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <NotFoundPage />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
