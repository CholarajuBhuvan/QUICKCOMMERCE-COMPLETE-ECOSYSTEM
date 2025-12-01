const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Bin = require('../models/Bin');
const Notification = require('../models/Notification');
const { auth, isAdmin, isPicker, isRider } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').trim().notEmpty().withMessage('State is required'),
  body('deliveryAddress.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('paymentMethod').isIn(['card', 'upi', 'wallet', 'cod']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, deliveryAddress, paymentMethod, customerNotes, specialInstructions } = req.body;

    console.log('Creating order with data:', {
      customerId: req.user.userId,
      itemsCount: items.length,
      deliveryAddress,
      paymentMethod
    });

    // Validate products and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found or inactive`
        });
      }

      if (product.inventory.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.availableStock}`
        });
      }

      const itemTotal = product.price.selling * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price.selling
      });

      // Reserve stock
      product.inventory.availableStock -= item.quantity;
      product.inventory.reservedStock += item.quantity;
      await product.save();
    }

    // Calculate total with tax and delivery fee
    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery over ₹500
    const total = subtotal + tax + deliveryFee;

    // Create order
    const order = new Order({
      customer: req.user.userId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      customerNotes,
      specialInstructions,
      pricing: {
        subtotal,
        tax,
        deliveryFee,
        total
      },
      orderStatus: 'confirmed' // Auto-confirm order for immediate picking
    });

    await order.save();

    // Generate delivery OTP for COD orders
    if (paymentMethod === 'cod') {
      order.deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await order.save();
    }

    // Create notification for admin (non-blocking)
    try {
      await Notification.createAndSend({
        recipient: req.user.userId,
        type: 'order_placed',
        title: 'New Order Placed',
        message: `Order ${order.orderNumber} has been placed`,
        data: { orderId: order._id },
        priority: 'medium'
      }, req.io);
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    // Send notifications to all pickers about new order
    try {
      const pickers = await User.find({ role: 'picker', isActive: true });
      for (const picker of pickers) {
        await Notification.createAndSend({
          recipient: picker._id,
          type: 'order_placed',
          title: '🛒 New Order to Pick',
          message: `Order ${order.orderNumber} needs picking - ${order.items.length} items`,
          data: { 
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemsCount: order.items.length
          },
          priority: 'high',
          actionRequired: true
        }, req.io);
      }

      // Emit real-time notification to pickers room
      if (req.io) {
        req.io.to('pickers').emit('new-order-for-picking', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customer: req.currentUser.name,
          itemsCount: order.items.length,
          items: orderItems.map(item => ({
            productId: item.product,
            quantity: item.quantity
          })),
          createdAt: order.createdAt
        });
      }
    } catch (pickerNotifError) {
      console.error('Picker notification failed (non-critical):', pickerNotifError.message);
    }

    // Send notifications to all riders about new order (for awareness)
    try {
      const riders = await User.find({ role: 'rider', isActive: true });
      for (const rider of riders) {
        await Notification.createAndSend({
          recipient: rider._id,
          type: 'order_placed',
          title: '📦 New Order Incoming',
          message: `Order ${order.orderNumber} placed - Delivery to ${deliveryAddress.city}`,
          data: { 
            orderId: order._id,
            orderNumber: order.orderNumber,
            deliveryAddress: {
              street: deliveryAddress.street,
              city: deliveryAddress.city,
              state: deliveryAddress.state,
              zipCode: deliveryAddress.zipCode,
              landmark: deliveryAddress.landmark,
              contactPhone: deliveryAddress.contactPhone
            }
          },
          priority: 'medium'
        }, req.io);
      }

      // Emit real-time notification to riders room
      if (req.io) {
        req.io.to('riders').emit('new-order-incoming', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          deliveryAddress: {
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            zipCode: deliveryAddress.zipCode,
            landmark: deliveryAddress.landmark,
            contactPhone: deliveryAddress.contactPhone
          },
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          total: order.pricing.total,
          paymentMethod: order.paymentMethod
        });
      }
    } catch (riderNotifError) {
      console.error('Rider notification failed (non-critical):', riderNotifError.message);
    }

    // Emit real-time notification to admin
    try {
      if (req.io && req.currentUser) {
        req.io.to('admin').emit('new-order', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customer: req.currentUser.name,
          total: order.pricing.total,
          itemsCount: order.items.length
        });
      }
    } catch (socketError) {
      console.error('Socket emit failed (non-critical):', socketError.message);
    }

    // Populate and return order
    const populatedOrder = await order.populate('items.product', 'name images price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return more specific error message
    const errorMessage = error.message || 'Server error creating order';
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isString()
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { customer: req.user.userId };
    
    if (status) filter.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price')
      .populate('picker', 'name phone')
      .populate('rider', 'name phone vehicleNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    if (req.currentUser.role === 'customer' && order.customer._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// Get orders for picking (Picker only)
router.get('/picking/available', auth, isPicker, async (req, res) => {
  try {
    const pickerId = req.user.userId;
    
    // Get orders that are confirmed and not fully picked
    const orders = await Order.find({
      orderStatus: { $in: ['confirmed', 'picking'] },
      $or: [
        { picker: pickerId }, // Already assigned to this picker
        { picker: { $exists: false } }, // Not assigned to any picker
        { 'items.pickerAssigned': { $exists: false } } // Items not assigned
      ]
    })
    .populate('customer', 'name phone')
    .populate('items.product', 'name images binLocations')
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get picking orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching picking orders'
    });
  }
});

// Accept order for picking
router.post('/:id/accept-picking', auth, isPicker, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'confirmed' && order.orderStatus !== 'picking') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be accepted for picking'
      });
    }

    // Assign picker to order
    order.picker = req.user.userId;
    order.orderStatus = 'picking';
    order.pickingStartedAt = new Date();

    // Assign picker to individual items
    order.items.forEach(item => {
      if (!item.pickerAssigned) {
        item.pickerAssigned = req.user.userId;
        item.pickingStatus = 'assigned';
      }
    });

    await order.save();

    // Create notification for customer
    await Notification.createAndSend({
      recipient: order.customer,
      type: 'picking_started',
      title: 'Order Picking Started',
      message: `Your order ${order.orderNumber} is being picked`,
      data: { orderId: order._id },
      priority: 'medium'
    }, req.io);

    // Emit real-time update
    req.io.to(`customer-${order.customer}`).emit('order-update', {
      orderId: order._id,
      status: 'picking',
      message: 'Your order is being picked'
    });

    res.json({
      success: true,
      message: 'Order accepted for picking',
      order
    });
  } catch (error) {
    console.error('Accept picking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting order for picking'
    });
  }
});

// Mark item as picked
router.post('/:orderId/items/:itemIndex/picked', auth, isPicker, [
  body('binId').isMongoId().withMessage('Valid bin ID is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { binId, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const itemIdx = parseInt(itemIndex);
    if (itemIdx >= order.items.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item index'
      });
    }

    const item = order.items[itemIdx];
    if (item.pickerAssigned.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to pick this item'
      });
    }

    // Mark item as picked
    item.pickingStatus = 'picked';
    item.binLocation = binId;
    item.pickedAt = new Date();
    item.notes = notes;

    // Update bin inventory
    const bin = await Bin.findById(binId);
    if (bin) {
      bin.removeStock(item.product, item.quantity, req.user.userId, order._id, 'Order picking');
      await bin.save();
    }

    // Check if all items are picked
    const allItemsPicked = order.items.every(item => item.pickingStatus === 'picked');
    if (allItemsPicked) {
      order.orderStatus = 'picked';
      order.pickingCompletedAt = new Date();
      
      // Update picker stats
      const picker = await User.findById(req.user.userId);
      picker.pickerDetails.totalItemsPicked += 1;
      await picker.save();

      // Notify all riders that order is ready for pickup
      try {
        const riders = await User.find({ role: 'rider', isActive: true });
        for (const rider of riders) {
          await Notification.createAndSend({
            recipient: rider._id,
            type: 'order_ready',
            title: '📦 Order Ready for Pickup',
            message: `Order ${order.orderNumber} is picked and ready in bin - Deliver to ${order.deliveryAddress.city}`,
            data: { 
              orderId: order._id,
              orderNumber: order.orderNumber,
              binLocation: binId,
              deliveryAddress: order.deliveryAddress
            },
            priority: 'high',
            actionRequired: true
          }, req.io);
        }

        // Emit real-time notification to riders
        if (req.io) {
          req.io.to('riders').emit('order-ready-for-pickup', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            binId: binId,
            deliveryAddress: order.deliveryAddress,
            total: order.pricing.total,
            paymentMethod: order.paymentMethod,
            deliveryOTP: order.deliveryOTP
          });
        }
      } catch (riderNotifError) {
        console.error('Rider notification failed (non-critical):', riderNotifError.message);
      }

      // Notify customer that order is picked and ready for delivery
      await Notification.createAndSend({
        recipient: order.customer,
        type: 'order_ready',
        title: '✅ Order Picked & Ready',
        message: `Your order ${order.orderNumber} has been picked and will be delivered soon!`,
        data: { orderId: order._id },
        priority: 'high'
      }, req.io);

      // Emit to customer
      req.io.to(`customer-${order.customer}`).emit('order-update', {
        orderId: order._id,
        status: 'picked',
        message: 'Your order is picked and ready for delivery'
      });
    }

    await order.save();

    // Create notification
    await Notification.createAndSend({
      recipient: order.customer,
      type: 'item_picked',
      title: 'Item Picked',
      message: `Item from your order ${order.orderNumber} has been picked`,
      data: { orderId: order._id },
      priority: 'low'
    }, req.io);

    res.json({
      success: true,
      message: 'Item marked as picked',
      order
    });
  } catch (error) {
    console.error('Mark item picked error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking item as picked'
    });
  }
});

// Get orders ready for delivery (Rider only)
router.get('/delivery/available', auth, isRider, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: 'picked',
      rider: { $exists: false }
    })
    .populate('customer', 'name phone')
    .populate('collectionBin', 'binCode location')
    .sort({ pickingCompletedAt: 1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching delivery orders'
    });
  }
});

// Accept order for delivery
router.post('/:id/accept-delivery', auth, isRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'picked') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for delivery'
      });
    }

    order.rider = req.user.userId;
    order.orderStatus = 'ready_for_delivery';
    order.assignedForDeliveryAt = new Date();

    await order.save();

    // Create notification for customer
    await Notification.createAndSend({
      recipient: order.customer,
      type: 'delivery_assigned',
      title: 'Delivery Partner Assigned',
      message: `Your order ${order.orderNumber} has been assigned to a delivery partner`,
      data: { orderId: order._id },
      priority: 'medium'
    }, req.io);

    res.json({
      success: true,
      message: 'Order accepted for delivery',
      order
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting order for delivery'
    });
  }
});

// Mark order as picked up by rider
router.post('/:id/pickup', auth, isRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order || order.rider.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    order.orderStatus = 'out_for_delivery';
    order.pickedUpAt = new Date();

    await order.save();

    // Notify customer
    await Notification.createAndSend({
      recipient: order.customer,
      type: 'out_for_delivery',
      title: '🚚 Order Out for Delivery',
      message: `Your order ${order.orderNumber} is on its way!`,
      data: { orderId: order._id },
      priority: 'high'
    }, req.io);

    // Emit to customer
    req.io.to(`customer-${order.customer}`).emit('order-update', {
      orderId: order._id,
      status: 'out_for_delivery',
      message: 'Your order is out for delivery'
    });

    // Notify admin
    req.io.to('admin').emit('order-update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: 'out_for_delivery',
      rider: req.currentUser.name
    });

    res.json({
      success: true,
      message: 'Order marked as picked up',
      order
    });
  } catch (error) {
    console.error('Order pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking order as picked up'
    });
  }
});

// Mark order as delivered
router.post('/:id/deliver', auth, isRider, [
  body('deliveryOTP').optional().isString(),
  body('deliveryNotes').optional().isString()
], async (req, res) => {
  try {
    const { deliveryOTP, deliveryNotes } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order || order.rider.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Verify OTP for COD orders
    if (order.paymentMethod === 'cod' && order.deliveryOTP !== deliveryOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery OTP'
      });
    }

    order.orderStatus = 'delivered';
    order.deliveredAt = new Date();
    order.deliveryNotes = deliveryNotes;
    order.paymentStatus = 'paid'; // Mark as paid when delivered

    // Update rider stats
    const rider = await User.findById(req.user.userId);
    rider.riderDetails.totalDeliveries += 1;
    await rider.save();

    await order.save();

    // Notify customer
    await Notification.createAndSend({
      recipient: order.customer,
      type: 'delivered',
      title: '🎉 Order Delivered Successfully!',
      message: `Your order ${order.orderNumber} has been delivered. Thank you for shopping!`,
      data: { orderId: order._id },
      priority: 'high'
    }, req.io);

    // Emit to customer
    req.io.to(`customer-${order.customer}`).emit('order-update', {
      orderId: order._id,
      status: 'delivered',
      message: 'Your order has been delivered successfully'
    });

    // Notify admin
    req.io.to('admin').emit('order-delivered', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      rider: req.currentUser.name,
      deliveredAt: order.deliveredAt
    });

    res.json({
      success: true,
      message: 'Order marked as delivered',
      order
    });
  } catch (error) {
    console.error('Order delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking order as delivered'
    });
  }
});

// Cancel order
router.post('/:id/cancel', auth, [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions
    if (req.currentUser.role === 'customer' && order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only cancel if not delivered
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order'
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledBy = req.user.userId;
    order.cancelledAt = new Date();

    // Restore product inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.inventory.availableStock += item.quantity;
        product.inventory.reservedStock -= item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

// Get all orders (Admin only)
router.get('/', auth, isAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const filter = {};
    
    if (status) filter.orderStatus = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('picker', 'name')
        .populate('rider', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

module.exports = router;
