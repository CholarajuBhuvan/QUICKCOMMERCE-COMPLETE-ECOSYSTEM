const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_assigned',
      'picking_started',
      'item_picked',
      'order_ready',
      'delivery_assigned',
      'out_for_delivery',
      'delivered',
      'order_cancelled',
      'stock_low',
      'stock_out',
      'bin_full',
      'system_alert',
      'promotion',
      'payment_success',
      'payment_failed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin'
    },
    customData: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create and send notification
notificationSchema.statics.createAndSend = async function(notificationData, io) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    // Populate recipient for real-time emission
    await notification.populate('recipient', 'name email role');
    
    // Send real-time notification via Socket.io
    if (io) {
      io.to(`user-${notification.recipient._id}`).emit('new-notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        createdAt: notification.createdAt
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isActive: true
  });
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to delete old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
