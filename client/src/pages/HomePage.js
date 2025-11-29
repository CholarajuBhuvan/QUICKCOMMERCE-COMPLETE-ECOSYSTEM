import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';

import { 
  fetchFeaturedProducts, 
  fetchCategories,
  selectFeaturedProducts,
  selectCategories,
  selectProductsLoading 
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner, { CardSkeleton } from '../components/common/LoadingSpinner';

const HomePage = () => {
  const dispatch = useDispatch();
  
  const featuredProducts = useSelector(selectFeaturedProducts);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const features = [
    {
      icon: TruckIcon,
      title: 'Free Delivery',
      description: 'Free delivery on orders over ₹500',
      color: 'text-green-600',
    },
    {
      icon: ClockIcon,
      title: '10 Min Delivery',
      description: 'Get your groceries in just 10 minutes',
      color: 'text-blue-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Fresh Quality',
      description: '100% fresh and quality guaranteed',
      color: 'text-purple-600',
    },
    {
      icon: TagIcon,
      title: 'Best Prices',
      description: 'Lowest prices with amazing offers',
      color: 'text-red-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="lg:grid lg:grid-cols-2 lg:gap-8 items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Groceries delivered in 
                <span className="text-yellow-300"> 10 minutes</span>
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Order from your favorite local stores and get everything delivered to your doorstep
                in just 10 minutes. Fresh, fast, and convenient.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Start Shopping
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors">
                  Download App
                </button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Grocery delivery"
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold">
                  10 MIN
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find everything you need in one place</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories.slice(0, 6).map((category, index) => (
                <motion.div key={category._id} variants={itemVariants}>
                  <Link
                    to={`/products?category=${category._id}`}
                    className="block bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      {category._id.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {category._id}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{category.count} items</p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View all categories
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-lg text-gray-600">Handpicked products just for you</p>
            </div>
            <Link
              to="/products?featured=true"
              className="hidden sm:inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View all
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredProducts.slice(0, 8).map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative">
                      <img
                        src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          {product.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating?.average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.rating?.count || 0})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price?.selling}
                        </span>
                        {product.price?.mrp > product.price?.selling && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.price?.mrp}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.inStock
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/products?featured=true"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View all featured products
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get your groceries delivered?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust QuickMart for their daily needs.
              Download our app and get your first delivery free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Download App
              </button>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
