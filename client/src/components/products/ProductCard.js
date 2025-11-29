import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

const ProductCard = ({ 
  product, 
  view = 'grid', 
  onAddToCart, 
  onQuickView,
  isWishlisted = false,
  onWishlistToggle 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView && onQuickView(product);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle && onWishlistToggle(product);
  };

  if (view === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
      >
        <div className="flex">
          {/* Image */}
          <Link to={`/products/${product._id}`} className="relative flex-shrink-0">
            <img
              src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
              alt={product.name}
              className="w-32 h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                {product.discountPercentage}% OFF
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <Link to={`/products/${product._id}`}>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>

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
                  ({product.rating?.count || 0} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg font-bold text-gray-900">
                  ₹{product.price?.selling}
                </span>
                {product.price?.mrp > product.price?.selling && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.price?.mrp}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {product.discountPercentage}% off
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                    product.inStock
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                {onQuickView && (
                  <button
                    onClick={handleQuickView}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                    title="Quick View"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                )}

                {onWishlistToggle && (
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>

              {!product.inStock && (
                <span className="text-sm text-red-500 font-medium">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Image */}
      <Link to={`/products/${product._id}`} className="relative block">
        <img
          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.discountPercentage > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </span>
          )}
        </div>

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onWishlistToggle && (
            <button
              onClick={handleWishlistToggle}
              className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-600 transition-colors"
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? (
                <HeartIconSolid className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
            </button>
          )}
          
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-green-600 transition-colors"
              title="Quick View"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Stock indicator */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}

        {/* Rating */}
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
        
        {/* Price */}
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
          {product.discountPercentage > 0 && (
            <span className="text-sm text-green-600 font-medium">
              {product.discountPercentage}% off
            </span>
          )}
        </div>
        
        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={clsx(
            'w-full py-2 px-4 rounded-lg font-medium transition-colors',
            product.inStock
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>

        {/* Stock indicator */}
        {product.inventory?.availableStock <= product.inventory?.minStockLevel && product.inStock && (
          <p className="text-xs text-orange-500 mt-1 text-center">
            Only {product.inventory.availableStock} left!
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
