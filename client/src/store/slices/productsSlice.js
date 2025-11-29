import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProduct(productId);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getCategories();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productsAPI.searchProducts(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addProductReview',
  async ({ productId, review }, { rejectWithValue }) => {
    try {
      await productsAPI.addReview(productId, review);
      toast.success('Review added successfully!');
      return { productId, review };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add review';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  searchResults: [],
  filters: {
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    inStock: false,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  searchLoading: false,
  categoryLoading: false,
  error: null,
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProductInList: (state, action) => {
      const { productId, updates } = action.payload;
      const productIndex = state.products.findIndex(p => p._id === productId);
      if (productIndex !== -1) {
        state.products[productIndex] = { ...state.products[productIndex], ...updates };
      }
      
      if (state.currentProduct && state.currentProduct._id === productId) {
        state.currentProduct = { ...state.currentProduct, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoryLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Add product review
      .addCase(addProductReview.fulfilled, (state, action) => {
        const { productId } = action.payload;
        if (state.currentProduct && state.currentProduct._id === productId) {
          // Refresh current product to show new review
          // In a real app, you might want to fetch the updated product
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  clearSearchResults,
  clearCurrentProduct,
  clearError,
  updateProductInList,
} = productsSlice.actions;

export default productsSlice.reducer;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectCategories = (state) => state.products.categories;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectFilters = (state) => state.products.filters;
export const selectPagination = (state) => state.products.pagination;
export const selectProductsLoading = (state) => state.products.loading;
export const selectSearchLoading = (state) => state.products.searchLoading;
export const selectSearchQuery = (state) => state.products.searchQuery;
