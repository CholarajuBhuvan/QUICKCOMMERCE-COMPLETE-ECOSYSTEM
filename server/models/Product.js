const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['groceries', 'electronics', 'clothing', 'home', 'books', 'beauty', 'sports', 'toys', 'pharmacy', 'other']
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    url: String,
    alt: String
  }],
  price: {
    mrp: {
      type: Number,
      required: true
    },
    selling: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  inventory: {
    totalStock: {
      type: Number,
      required: true,
      default: 0
    },
    availableStock: {
      type: Number,
      required: true,
      default: 0
    },
    reservedStock: {
      type: Number,
      default: 0
    },
    minStockLevel: {
      type: Number,
      default: 10
    },
    maxStockLevel: {
      type: Number,
      default: 1000
    }
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    color: String,
    size: String,
    material: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Bin location information
  binLocations: [{
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin'
    },
    quantity: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  expiryDate: Date,
  batchNumber: String,
  barcode: String,
  qrCode: String
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'price.selling': 1 });
productSchema.index({ sku: 1 });
productSchema.index({ isActive: 1 });

// Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.price.mrp && this.price.selling) {
    return Math.round(((this.price.mrp - this.price.selling) / this.price.mrp) * 100);
  }
  return 0;
});

// Check if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.inventory.availableStock > 0;
});

// Check if stock is low
productSchema.virtual('lowStock').get(function() {
  return this.inventory.availableStock <= this.inventory.minStockLevel;
});

// Update average rating when new review is added
productSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
};

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
