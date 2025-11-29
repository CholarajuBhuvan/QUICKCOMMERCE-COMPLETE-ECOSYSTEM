import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { productsAPI } from '../services/api';
import ProductFormModal from '../components/products/ProductFormModal';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState(['all']);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const cats = response.categories?.map(c => c._id) || [];
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        await productsAPI.update(selectedProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(error.message || 'Failed to save product');
      throw error;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = product.isActive === true;
    } else if (statusFilter === 'inactive') {
      matchesStatus = product.isActive === false;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = (product.inventory?.availableStock || 0) === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    lowStock: products.filter(p => {
      const stock = p.inventory?.availableStock || 0;
      const minStock = p.inventory?.minStockLevel || 10;
      return stock > 0 && stock <= minStock;
    }).length,
    outOfStock: products.filter(p => (p.inventory?.availableStock || 0) === 0).length,
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { color: 'text-red-600', icon: ExclamationTriangleIcon, text: 'Out of Stock' };
    if (stock <= minStock) return { color: 'text-yellow-600', icon: ExclamationTriangleIcon, text: 'Low Stock' };
    return { color: 'text-green-600', icon: CheckCircleIcon, text: 'In Stock' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.outOfStock}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              const stock = product.inventory?.availableStock || 0;
              const minStock = product.inventory?.minStockLevel || 10;
              const stockStatus = getStockStatus(stock, minStock);
              const StockIcon = stockStatus.icon;
              const imageUrl = product.images?.[0]?.url || '/api/placeholder/400/400';

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-w-1 aspect-h-1 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/400';
                      }}
                    />
                    {!product.isActive && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold text-purple-600">
                        ${product.price?.selling?.toFixed(2) || '0.00'}
                      </span>
                      {product.price?.mrp && product.price.mrp > product.price.selling && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price.mrp.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Brand:</span> {product.brand}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span> {product.sku}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between mb-3 py-2 border-t border-gray-100">
                      <div className={`flex items-center ${stockStatus.color}`}>
                        <StockIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{stockStatus.text}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {stock} units
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(product.updatedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button 
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <ProductFormModal
            product={selectedProduct}
            onClose={() => setShowProductModal(false)}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
