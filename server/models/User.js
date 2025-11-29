const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'picker', 'rider', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Picker specific fields
  pickerDetails: {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentShift: {
      startTime: Date,
      endTime: Date
    },
    totalItemsPicked: {
      type: Number,
      default: 0
    },
    totalOrdersCompleted: {
      type: Number,
      default: 0
    }
  },
  // Rider specific fields
  riderDetails: {
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'bicycle', 'car']
    },
    vehicleNumber: String,
    licenseNumber: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      latitude: Number,
      longitude: Number
    },
    totalDeliveries: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
