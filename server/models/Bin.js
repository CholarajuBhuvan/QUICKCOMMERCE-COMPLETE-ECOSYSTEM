const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binCode: {
    type: String,
    required: true,
    unique: true
  },
  binType: {
    type: String,
    enum: ['storage', 'picking', 'packing', 'shipping', 'returns'],
    default: 'storage'
  },
  location: {
    aisle: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    shelf: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    zone: {
      type: String,
      required: true
    }
  },
  coordinates: {
    x: Number,
    y: Number,
    z: Number
  },
  capacity: {
    maxItems: {
      type: Number,
      default: 100
    },
    maxWeight: {
      type: Number,
      default: 50 // in kg
    },
    maxVolume: {
      type: Number,
      default: 1000 // in cubic cm
    }
  },
  currentStock: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true
    },
    expiryDate: Date,
    batchNumber: String,
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  qrCode: {
    type: String,
    required: true
  },
  barcode: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  // For maintenance and cleaning schedules
  lastMaintenance: Date,
  nextMaintenance: Date,
  maintenanceNotes: String,
  
  // Environmental conditions (for sensitive products)
  conditions: {
    temperature: {
      min: Number,
      max: Number,
      current: Number
    },
    humidity: {
      min: Number,
      max: Number,
      current: Number
    }
  },
  
  // Access control
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'admin_only'],
    default: 'public'
  },
  
  // Picking optimization
  pickingFrequency: {
    type: Number,
    default: 0
  },
  lastPickedAt: Date,
  
  // Store association
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  
  // Movement history
  movementHistory: [{
    action: {
      type: String,
      enum: ['stock_in', 'stock_out', 'transfer', 'adjustment', 'pick']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    previousQuantity: Number,
    newQuantity: Number,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
binSchema.index({ binCode: 1 });
binSchema.index({ store: 1 });
binSchema.index({ 'location.zone': 1, 'location.aisle': 1 });
binSchema.index({ binType: 1 });
binSchema.index({ isActive: 1, isAccessible: 1 });

// Generate QR code before saving
binSchema.pre('save', async function(next) {
  if (!this.qrCode) {
    const QRCode = require('qrcode');
    try {
      this.qrCode = await QRCode.toDataURL(`BIN:${this.binCode}:${this._id}`);
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  }
  next();
});

// Virtual for current utilization
binSchema.virtual('currentUtilization').get(function() {
  const totalItems = this.currentStock.reduce((sum, item) => sum + item.quantity, 0);
  return {
    items: totalItems,
    itemsPercentage: (totalItems / this.capacity.maxItems) * 100,
    weight: 0, // Would need product weights to calculate
    volume: 0  // Would need product volumes to calculate
  };
});

// Virtual for available capacity
binSchema.virtual('availableCapacity').get(function() {
  const totalItems = this.currentStock.reduce((sum, item) => sum + item.quantity, 0);
  return {
    items: this.capacity.maxItems - totalItems,
    weight: this.capacity.maxWeight,
    volume: this.capacity.maxVolume
  };
});

// Check if bin is full
binSchema.virtual('isFull').get(function() {
  const totalItems = this.currentStock.reduce((sum, item) => sum + item.quantity, 0);
  return totalItems >= this.capacity.maxItems;
});

// Get product quantity in bin
binSchema.methods.getProductQuantity = function(productId) {
  const stockItem = this.currentStock.find(item => 
    item.product.toString() === productId.toString()
  );
  return stockItem ? stockItem.quantity : 0;
};

// Add stock to bin
binSchema.methods.addStock = function(productId, quantity, expiryDate, batchNumber, userId) {
  const existingStock = this.currentStock.find(item => 
    item.product.toString() === productId.toString() &&
    item.batchNumber === batchNumber
  );
  
  if (existingStock) {
    const previousQuantity = existingStock.quantity;
    existingStock.quantity += quantity;
    
    // Add to movement history
    this.movementHistory.push({
      action: 'stock_in',
      product: productId,
      quantity: quantity,
      previousQuantity: previousQuantity,
      newQuantity: existingStock.quantity,
      performedBy: userId,
      reason: 'Stock replenishment'
    });
  } else {
    this.currentStock.push({
      product: productId,
      quantity: quantity,
      expiryDate: expiryDate,
      batchNumber: batchNumber,
      addedBy: userId
    });
    
    // Add to movement history
    this.movementHistory.push({
      action: 'stock_in',
      product: productId,
      quantity: quantity,
      previousQuantity: 0,
      newQuantity: quantity,
      performedBy: userId,
      reason: 'New stock addition'
    });
  }
};

// Remove stock from bin
binSchema.methods.removeStock = function(productId, quantity, userId, orderId, reason = 'Stock removal') {
  const stockItem = this.currentStock.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!stockItem || stockItem.quantity < quantity) {
    throw new Error('Insufficient stock in bin');
  }
  
  const previousQuantity = stockItem.quantity;
  stockItem.quantity -= quantity;
  
  // Remove item if quantity becomes 0
  if (stockItem.quantity === 0) {
    this.currentStock = this.currentStock.filter(item => 
      item.product.toString() !== productId.toString()
    );
  }
  
  // Add to movement history
  this.movementHistory.push({
    action: 'pick',
    product: productId,
    quantity: quantity,
    previousQuantity: previousQuantity,
    newQuantity: stockItem.quantity,
    performedBy: userId,
    orderId: orderId,
    reason: reason
  });
  
  // Update picking frequency and last picked time
  this.pickingFrequency += 1;
  this.lastPickedAt = new Date();
};

binSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Bin', binSchema);
