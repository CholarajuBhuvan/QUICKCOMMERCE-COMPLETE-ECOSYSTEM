const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Bin = require('../models/Bin');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering, pagination, and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString(),
  query('subcategory').optional().isString(),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['name', 'price', 'rating', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('inStock').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    if (minPrice || maxPrice) {
      filter['price.selling'] = {};
      if (minPrice) filter['price.selling'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.selling'].$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter['inventory.availableStock'] = { $gt: 0 };
    }

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reviews -binLocations'),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      isActive: true,
      isFeatured: true,
      'inventory.availableStock': { $gt: 0 }
    })
    .sort({ 'rating.average': -1 })
    .limit(20)
    .select('-reviews -binLocations');

    res.json({
      success: true,
      products: featuredProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products'
    });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('reviews.userId', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// Create new product (Admin only)
router.post('/', auth, isAdmin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['groceries', 'electronics', 'clothing', 'home', 'books', 'beauty', 'sports', 'toys', 'pharmacy', 'other']),
  body('subcategory').trim().isLength({ min: 2 }),
  body('brand').trim().isLength({ min: 1 }),
  body('sku').trim().isLength({ min: 3 }),
  body('price.mrp').isFloat({ min: 0 }),
  body('price.selling').isFloat({ min: 0 }),
  body('inventory.totalStock').isInt({ min: 0 }),
  body('inventory.availableStock').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Calculate discount
    const discount = req.body.price.mrp - req.body.price.selling;
    req.body.price.discount = discount;

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// Update product (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    
    // Calculate discount if prices are updated
    if (updates.price && updates.price.mrp && updates.price.selling) {
      updates.price.discount = updates.price.mrp - updates.price.selling;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

// Add product review
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.userId.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add new review
    product.reviews.push({
      userId: req.user.userId,
      rating,
      comment
    });

    // Update average rating
    product.updateRating();
    await product.save();

    res.json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding review'
    });
  }
});

// Get product inventory across bins
router.get('/:id/inventory', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('binLocations.binId', 'binCode location');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      inventory: {
        totalStock: product.inventory.totalStock,
        availableStock: product.inventory.availableStock,
        reservedStock: product.inventory.reservedStock,
        binLocations: product.binLocations
      }
    });
  } catch (error) {
    console.error('Get product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory'
    });
  }
});

module.exports = router;
