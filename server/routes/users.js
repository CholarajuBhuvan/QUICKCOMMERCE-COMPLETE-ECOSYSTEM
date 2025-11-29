const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, isAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['customer', 'picker', 'rider', 'admin']),
  query('search').optional().isString()
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

    const { page = 1, limit = 20, role, search } = req.query;
    const filter = { isActive: true };

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('pickerDetails.storeId', 'name storeCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// Get available pickers
router.get('/pickers/available', auth, isAdmin, async (req, res) => {
  try {
    const pickers = await User.find({
      role: 'picker',
      isActive: true,
      'pickerDetails.isAvailable': true
    })
    .select('name phone pickerDetails')
    .populate('pickerDetails.storeId', 'name storeCode');

    res.json({
      success: true,
      pickers
    });
  } catch (error) {
    console.error('Get available pickers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available pickers'
    });
  }
});

// Get available riders
router.get('/riders/available', auth, isAdmin, async (req, res) => {
  try {
    const riders = await User.find({
      role: 'rider',
      isActive: true,
      'riderDetails.isAvailable': true
    })
    .select('name phone riderDetails');

    res.json({
      success: true,
      riders
    });
  } catch (error) {
    console.error('Get available riders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available riders'
    });
  }
});

// Get picker statistics
router.get('/pickers/:id/stats', auth, isAdmin, async (req, res) => {
  try {
    const picker = await User.findOne({
      _id: req.params.id,
      role: 'picker'
    }).select('name pickerDetails');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker not found'
      });
    }

    // Get picker's order statistics
    const [
      totalOrders,
      completedOrders,
      todayOrders,
      averagePickingTime
    ] = await Promise.all([
      Order.countDocuments({ picker: req.params.id }),
      Order.countDocuments({ 
        picker: req.params.id, 
        orderStatus: { $in: ['picked', 'ready_for_delivery', 'out_for_delivery', 'delivered'] }
      }),
      Order.countDocuments({ 
        picker: req.params.id,
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      }),
      Order.aggregate([
        { 
          $match: { 
            picker: picker._id,
            pickingStartedAt: { $exists: true },
            pickingCompletedAt: { $exists: true }
          }
        },
        {
          $project: {
            pickingTime: {
              $divide: [
                { $subtract: ['$pickingCompletedAt', '$pickingStartedAt'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageTime: { $avg: '$pickingTime' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        picker: {
          name: picker.name,
          totalItemsPicked: picker.pickerDetails.totalItemsPicked,
          totalOrdersCompleted: picker.pickerDetails.totalOrdersCompleted
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          today: todayOrders,
          averagePickingTime: averagePickingTime[0]?.averageTime || 0
        }
      }
    });
  } catch (error) {
    console.error('Get picker stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching picker statistics'
    });
  }
});

// Get rider statistics
router.get('/riders/:id/stats', auth, isAdmin, async (req, res) => {
  try {
    const rider = await User.findOne({
      _id: req.params.id,
      role: 'rider'
    }).select('name riderDetails');

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    // Get rider's delivery statistics
    const [
      totalDeliveries,
      completedDeliveries,
      todayDeliveries,
      averageDeliveryTime
    ] = await Promise.all([
      Order.countDocuments({ rider: req.params.id }),
      Order.countDocuments({ 
        rider: req.params.id, 
        orderStatus: 'delivered'
      }),
      Order.countDocuments({ 
        rider: req.params.id,
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      }),
      Order.aggregate([
        { 
          $match: { 
            rider: rider._id,
            pickedUpAt: { $exists: true },
            deliveredAt: { $exists: true }
          }
        },
        {
          $project: {
            deliveryTime: {
              $divide: [
                { $subtract: ['$deliveredAt', '$pickedUpAt'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageTime: { $avg: '$deliveryTime' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        rider: {
          name: rider.name,
          totalDeliveries: rider.riderDetails.totalDeliveries,
          rating: rider.riderDetails.rating,
          vehicleType: rider.riderDetails.vehicleType
        },
        deliveries: {
          total: totalDeliveries,
          completed: completedDeliveries,
          today: todayDeliveries,
          averageDeliveryTime: averageDeliveryTime[0]?.averageTime || 0
        }
      }
    });
  } catch (error) {
    console.error('Get rider stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching rider statistics'
    });
  }
});

// Update user status (Admin only)
router.put('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// Get user performance metrics
router.get('/performance', auth, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get performance metrics for pickers
    const pickerMetrics = await Order.aggregate([
      { 
        $match: { 
          ...dateFilter,
          picker: { $exists: true },
          pickingStartedAt: { $exists: true },
          pickingCompletedAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$picker',
          totalOrders: { $sum: 1 },
          totalItems: { $sum: { $sum: '$items.quantity' } },
          averagePickingTime: {
            $avg: {
              $divide: [
                { $subtract: ['$pickingCompletedAt', '$pickingStartedAt'] },
                1000 * 60
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'picker'
        }
      },
      { $unwind: '$picker' },
      {
        $project: {
          pickerId: '$_id',
          pickerName: '$picker.name',
          totalOrders: 1,
          totalItems: 1,
          averagePickingTime: 1
        }
      },
      { $sort: { totalOrders: -1 } }
    ]);

    // Get performance metrics for riders
    const riderMetrics = await Order.aggregate([
      { 
        $match: { 
          ...dateFilter,
          rider: { $exists: true },
          pickedUpAt: { $exists: true },
          deliveredAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$rider',
          totalDeliveries: { $sum: 1 },
          averageDeliveryTime: {
            $avg: {
              $divide: [
                { $subtract: ['$deliveredAt', '$pickedUpAt'] },
                1000 * 60
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'rider'
        }
      },
      { $unwind: '$rider' },
      {
        $project: {
          riderId: '$_id',
          riderName: '$rider.name',
          riderRating: '$rider.riderDetails.rating',
          totalDeliveries: 1,
          averageDeliveryTime: 1
        }
      },
      { $sort: { totalDeliveries: -1 } }
    ]);

    res.json({
      success: true,
      performance: {
        pickers: pickerMetrics,
        riders: riderMetrics
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching performance metrics'
    });
  }
});

// Get top performers
router.get('/top-performers', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Top pickers by orders completed
    const topPickers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          picker: { $exists: true },
          orderStatus: { $in: ['picked', 'ready_for_delivery', 'out_for_delivery', 'delivered'] }
        }
      },
      {
        $group: {
          _id: '$picker',
          ordersCompleted: { $sum: 1 },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'picker'
        }
      },
      { $unwind: '$picker' },
      {
        $project: {
          name: '$picker.name',
          ordersCompleted: 1,
          totalItems: 1
        }
      },
      { $sort: { ordersCompleted: -1 } },
      { $limit: 10 }
    ]);

    // Top riders by deliveries completed
    const topRiders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          rider: { $exists: true },
          orderStatus: 'delivered'
        }
      },
      {
        $group: {
          _id: '$rider',
          deliveriesCompleted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'rider'
        }
      },
      { $unwind: '$rider' },
      {
        $project: {
          name: '$rider.name',
          rating: '$rider.riderDetails.rating',
          deliveriesCompleted: 1
        }
      },
      { $sort: { deliveriesCompleted: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      topPerformers: {
        pickers: topPickers,
        riders: topRiders,
        period
      }
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top performers'
    });
  }
});

module.exports = router;
