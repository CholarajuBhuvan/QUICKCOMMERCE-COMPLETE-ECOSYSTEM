const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  storeCode: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['warehouse', 'dark_store', 'retail_store', 'fulfillment_center'],
    default: 'dark_store'
  },
  address: {
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
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    }
  },
  contact: {
    phone: String,
    email: String,
    manager: {
      name: String,
      phone: String,
      email: String
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  serviceAreas: [{
    zipCode: String,
    city: String,
    deliveryTime: Number, // in minutes
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  capacity: {
    totalBins: {
      type: Number,
      default: 0
    },
    activeBins: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    maxCapacity: {
      type: Number,
      default: 10000
    }
  },
  staff: {
    pickers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isActive: {
        type: Boolean,
        default: true
      },
      shift: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      }
    }],
    managers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String
    }]
  },
  inventory: {
    totalValue: {
      type: Number,
      default: 0
    },
    totalItems: {
      type: Number,
      default: 0
    },
    lowStockItems: {
      type: Number,
      default: 0
    },
    outOfStockItems: {
      type: Number,
      default: 0
    }
  },
  metrics: {
    dailyOrders: {
      type: Number,
      default: 0
    },
    averagePickingTime: {
      type: Number,
      default: 0
    },
    pickingAccuracy: {
      type: Number,
      default: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  facilities: {
    hasParking: {
      type: Boolean,
      default: true
    },
    hasColdStorage: {
      type: Boolean,
      default: false
    },
    hasSecuritySystem: {
      type: Boolean,
      default: true
    },
    hasLoadingDock: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOperational: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
storeSchema.index({ storeCode: 1 });
storeSchema.index({ 'address.city': 1, 'address.zipCode': 1 });
storeSchema.index({ type: 1 });
storeSchema.index({ isActive: 1, isOperational: 1 });

// Virtual for current utilization percentage
storeSchema.virtual('utilizationPercentage').get(function() {
  if (this.capacity.maxCapacity === 0) return 0;
  return (this.inventory.totalItems / this.capacity.maxCapacity) * 100;
});

// Virtual for active pickers count
storeSchema.virtual('activePickersCount').get(function() {
  return this.staff.pickers.filter(picker => picker.isActive).length;
});

// Check if store serves a particular area
storeSchema.methods.servesArea = function(zipCode, city) {
  return this.serviceAreas.some(area => 
    area.zipCode === zipCode || 
    area.city.toLowerCase() === city.toLowerCase()
  );
};

// Get estimated delivery time for an area
storeSchema.methods.getDeliveryTime = function(zipCode, city) {
  const serviceArea = this.serviceAreas.find(area => 
    area.zipCode === zipCode || 
    area.city.toLowerCase() === city.toLowerCase()
  );
  return serviceArea ? serviceArea.deliveryTime : null;
};

// Check if store is currently open
storeSchema.methods.isOpen = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[today];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Add picker to store
storeSchema.methods.addPicker = function(userId, shift) {
  const existingPicker = this.staff.pickers.find(picker => 
    picker.user.toString() === userId.toString()
  );
  
  if (!existingPicker) {
    this.staff.pickers.push({
      user: userId,
      shift: shift,
      isActive: true
    });
  }
};

// Remove picker from store
storeSchema.methods.removePicker = function(userId) {
  this.staff.pickers = this.staff.pickers.filter(picker => 
    picker.user.toString() !== userId.toString()
  );
};

// Update store metrics
storeSchema.methods.updateMetrics = function(orders, pickingTimes) {
  this.metrics.dailyOrders = orders.length;
  
  if (pickingTimes.length > 0) {
    const avgTime = pickingTimes.reduce((sum, time) => sum + time, 0) / pickingTimes.length;
    this.metrics.averagePickingTime = avgTime;
  }
  
  this.metrics.lastUpdated = new Date();
};

storeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Store', storeSchema);
