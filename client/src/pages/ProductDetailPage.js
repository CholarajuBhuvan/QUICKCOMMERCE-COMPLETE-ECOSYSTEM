import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  HeartIcon,
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

import {
  fetchProductById,
  addProductReview,
  selectCurrentProduct,
  selectProductsLoading
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductsLoading);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      setQuantity(1);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (product && rating && review.trim()) {
      dispatch(addProductReview({
        productId: product._id,
        review: { rating, comment: review.trim() }
      }));
      setShowReviewForm(false);
      setRating(5);
      setReview('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [
    { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: product.name }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            Home
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-gray-700">
            Products
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index 
                          ? 'border-green-500' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-8 lg:mt-0"
            >
              {/* Product Title and Brand */}
              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-lg text-gray-600">by {product.brand}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating?.average?.toFixed(1) || 0} ({product.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price?.selling}
                  </span>
                  {product.price?.mrp > product.price?.selling && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price?.mrp}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {product.discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory?.availableStock || 1, quantity + 1))}
                      className="p-2 hover:bg-gray-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {product.inventory?.availableStock && (
                    <span className="text-sm text-gray-500">
                      {product.inventory.availableStock} available
                    </span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      product.inStock
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">Free delivery on orders over ₹500</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">10 minute delivery available</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-700">100% quality guarantee</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="p-6 lg:p-8">
              <div className="space-y-8">
                {/* Specifications */}
                {product.specifications && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-outline text-sm"
                    >
                      Write a Review
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleSubmitReview}
                      className="mb-6 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setRating(i + 1)}
                              className={`h-6 w-6 ${
                                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            >
                              <StarIcon />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review
                        </label>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          rows={4}
                          className="input-field"
                          placeholder="Share your experience with this product..."
                          required
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button type="submit" className="btn-primary">
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {product.reviews?.length > 0 ? (
                      product.reviews.map((review, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {review.userId?.name || 'Anonymous'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No reviews yet. Be the first to review this product!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
