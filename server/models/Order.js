const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    // Picker assignment for this specific item
    pickerAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickingStatus: {
      type: String,
      enum: ['pending', 'assigned', 'picking', 'picked', 'unavailable'],
      default: 'pending'
    },
    binLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin'
    },
    pickedAt: Date,
    notes: String
  }],
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'picking', 'picked', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cod'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String,
    paidAt: Date
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    landmark: String,
    contactPhone: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  // Picker assignment and tracking
  picker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickingStartedAt: Date,
  pickingCompletedAt: Date,
  pickingNotes: String,
  
  // Rider assignment and delivery tracking
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedForDeliveryAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  deliveryNotes: String,
  deliveryOTP: String,
  
  // Store and bin information
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  collectionBin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  },
  
  // Timing and SLA
  estimatedDeliveryTime: Date,
  requestedDeliveryTime: Date,
  
  // Customer communication
  customerNotes: String,
  specialInstructions: String,
  
  // Order tracking timeline
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Rating and feedback
  customerRating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    picker: {
      type: Number,
      min: 1,
      max: 5
    },
    rider: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  
  // Cancellation details
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ picker: 1 });
orderSchema.index({ rider: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before validation
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Add timeline entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    this.timeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
      notes: `Order status changed to ${this.orderStatus}`
    });
  }
  next();
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for picked items count
orderSchema.virtual('pickedItems').get(function() {
  return this.items.filter(item => item.pickingStatus === 'picked').length;
});

// Virtual for pending items count
orderSchema.virtual('pendingItems').get(function() {
  return this.items.filter(item => item.pickingStatus === 'pending' || item.pickingStatus === 'assigned').length;
});

// Check if order is ready for delivery
orderSchema.virtual('readyForDelivery').get(function() {
  return this.items.every(item => item.pickingStatus === 'picked');
});

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
