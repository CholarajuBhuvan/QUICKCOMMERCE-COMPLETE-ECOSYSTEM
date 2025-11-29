import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  HeartIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { logout, selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { selectCartCount, toggleCart } from '../../store/slices/cartSlice';
import { selectUnreadCount, toggleNotifications } from '../../store/slices/notificationsSlice';
import { toggleSidebar, selectSidebar } from '../../store/slices/uiSlice';
import { searchProducts, setSearchQuery } from '../../store/slices/productsSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);
  const unreadCount = useSelector(selectUnreadCount);
  const isMobileSidebarOpen = useSelector(selectSidebar('mobile'));
  
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  
  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setSearchQuery(searchQuery));
      dispatch(searchProducts(searchQuery));
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const categories = [
    { name: 'Groceries', href: '/products?category=groceries' },
    { name: 'Electronics', href: '/products?category=electronics' },
    { name: 'Clothing', href: '/products?category=clothing' },
    { name: 'Home & Kitchen', href: '/products?category=home' },
    { name: 'Beauty', href: '/products?category=beauty' },
    { name: 'Sports', href: '/products?category=sports' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-green-600 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>Free delivery in 10 minutes</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Customer Support: +91 8888888888</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-bold text-gray-900">QuickMart</span>
            </Link>
          </div>

          {/* Categories dropdown (Desktop) */}
          <div className="hidden lg:block relative" ref={categoriesDropdownRef}>
            <button
              onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <span>Categories</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {isCategoriesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryLocal(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => dispatch(toggleNotifications())}
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                <HeartIcon className="h-6 w-6" />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => dispatch(toggleSidebar('mobile'))}
              className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {isMobileSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => dispatch(toggleSidebar('mobile'))}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Q</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">QuickMart</span>
                  </div>
                  <button
                    onClick={() => dispatch(toggleSidebar('mobile'))}
                    className="p-2 text-gray-600 hover:text-green-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile navigation */}
                <nav className="space-y-2">
                  <Link
                    to="/"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => dispatch(toggleSidebar('mobile'))}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => dispatch(toggleSidebar('mobile'))}
                  >
                    All Products
                  </Link>
                  
                  <div className="pt-2">
                    <h3 className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </h3>
                    <div className="mt-2 space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => dispatch(toggleSidebar('mobile'))}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => dispatch(toggleSidebar('mobile'))}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => dispatch(toggleSidebar('mobile'))}
                      >
                        Profile
                      </Link>
                    </div>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
