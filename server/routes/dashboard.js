const express = require('express');
const { query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Bin = require('../models/Bin');
const Store = require('../models/Store');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
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
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const [
      // Order statistics
      totalOrders,
      pendingOrders,
      pickingOrders,
      deliveryOrders,
      deliveredOrders,
      cancelledOrders,
      
      // Revenue statistics
      revenueStats,
      
      // User statistics
      totalCustomers,
      totalPickers,
      totalRiders,
      availablePickers,
      availableRiders,
      
      // Inventory statistics
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalBins,
      
      // Performance metrics
      averageOrderValue,
      orderFulfillmentTime
    ] = await Promise.all([
      // Orders
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        orderStatus: { $in: ['pending', 'confirmed'] }
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        orderStatus: 'picking' 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        orderStatus: { $in: ['ready_for_delivery', 'out_for_delivery'] }
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        orderStatus: 'delivered' 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        orderStatus: 'cancelled' 
      }),
      
      // Revenue
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$pricing.total' }
          }
        }
      ]),
      
      // Users
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'picker', isActive: true }),
      User.countDocuments({ role: 'rider', isActive: true }),
      User.countDocuments({ 
        role: 'picker', 
        isActive: true, 
        'pickerDetails.isAvailable': true 
      }),
      User.countDocuments({ 
        role: 'rider', 
        isActive: true, 
        'riderDetails.isAvailable': true 
      }),
      
      // Inventory
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 
        isActive: true,
        $expr: { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] }
      }),
      Product.countDocuments({ 
        isActive: true,
        'inventory.availableStock': 0 
      }),
      Bin.countDocuments({ isActive: true }),
      
      // Performance
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            avgOrderValue: { $avg: '$pricing.total' }
          }
        }
      ]),
      
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            orderStatus: 'delivered',
            deliveredAt: { $exists: true }
          }
        },
        {
          $project: {
            fulfillmentTime: {
              $divide: [
                { $subtract: ['$deliveredAt', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgFulfillmentTime: { $avg: '$fulfillmentTime' }
          }
        }
      ])
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
    const avgOrderVal = averageOrderValue[0]?.avgOrderValue || 0;
    const avgFulfillmentTime = orderFulfillmentTime[0]?.avgFulfillmentTime || 0;

    res.json({
      success: true,
      overview: {
        period,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          picking: pickingOrders,
          delivery: deliveryOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        revenue: {
          total: revenue.totalRevenue,
          averageOrderValue: avgOrderVal
        },
        users: {
          customers: totalCustomers,
          pickers: {
            total: totalPickers,
            available: availablePickers
          },
          riders: {
            total: totalRiders,
            available: availableRiders
          }
        },
        inventory: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalBins
        },
        performance: {
          averageOrderValue: avgOrderVal,
          averageFulfillmentTime: avgFulfillmentTime
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard overview'
    });
  }
});

// Get order analytics
router.get('/orders/analytics', auth, isAdmin, [
  query('period').optional().isIn(['7days', '30days', '90days', '1year']),
  query('groupBy').optional().isIn(['day', 'week', 'month'])
], async (req, res) => {
  try {
    const { period = '30days', groupBy = 'day' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    let dateFormat;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    // Set date format based on groupBy
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    const orderAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            status: '$orderStatus'
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              revenue: '$revenue'
            }
          },
          totalOrders: { $sum: '$count' },
          totalRevenue: { $sum: '$revenue' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        period,
        groupBy,
        data: orderAnalytics
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order analytics'
    });
  }
});

// Get real-time activity feed
router.get('/activity', auth, isAdmin, [
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent orders with timeline updates
    const recentActivity = await Order.find({
      'timeline.timestamp': { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    })
    .select('orderNumber orderStatus timeline customer pricing')
    .populate('customer', 'name')
    .sort({ 'timeline.timestamp': -1 })
    .limit(parseInt(limit));

    // Transform to activity feed format
    const activities = [];
    
    recentActivity.forEach(order => {
      order.timeline.forEach(event => {
        if (event.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          activities.push({
            id: `${order._id}-${event.timestamp}`,
            type: 'order_update',
            message: `Order ${order.orderNumber} - ${event.notes || event.status}`,
            orderId: order._id,
            orderNumber: order.orderNumber,
            customer: order.customer?.name,
            status: event.status,
            timestamp: event.timestamp,
            amount: order.pricing.total
          });
        }
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      activities: activities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activity feed'
    });
  }
});

// Get performance metrics
router.get('/performance', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
    }

    const [
      orderMetrics,
      pickingMetrics,
      deliveryMetrics,
      customerSatisfaction
    ] = await Promise.all([
      // Order processing metrics
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' },
            totalRevenue: { $sum: '$pricing.total' }
          }
        }
      ]),
      
      // Picking performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
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
            avgPickingTime: { $avg: '$pickingTime' },
            totalPickedOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Delivery performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
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
            avgDeliveryTime: { $avg: '$deliveryTime' },
            totalDeliveredOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Customer satisfaction (based on ratings)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            'customerRating.overall': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$customerRating.overall' },
            totalRatedOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      performance: {
        period,
        orders: orderMetrics[0] || { totalOrders: 0, avgOrderValue: 0, totalRevenue: 0 },
        picking: pickingMetrics[0] || { avgPickingTime: 0, totalPickedOrders: 0 },
        delivery: deliveryMetrics[0] || { avgDeliveryTime: 0, totalDeliveredOrders: 0 },
        satisfaction: customerSatisfaction[0] || { avgRating: 0, totalRatedOrders: 0 }
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

// Get inventory dashboard
router.get('/inventory', auth, isAdmin, async (req, res) => {
  try {
    const [
      categoryDistribution,
      stockLevels,
      binUtilization,
      topProducts
    ] = await Promise.all([
      // Product distribution by category
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { 
              $sum: { 
                $multiply: ['$inventory.availableStock', '$price.selling'] 
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Stock level analysis
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $project: {
            name: 1,
            sku: 1,
            availableStock: '$inventory.availableStock',
            minStockLevel: '$inventory.minStockLevel',
            stockStatus: {
              $cond: {
                if: { $eq: ['$inventory.availableStock', 0] },
                then: 'out_of_stock',
                else: {
                  $cond: {
                    if: { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] },
                    then: 'low_stock',
                    else: 'in_stock'
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: '$stockStatus',
            count: { $sum: 1 },
            products: { $push: { name: '$name', sku: '$sku', stock: '$availableStock' } }
          }
        }
      ]),
      
      // Bin utilization
      Bin.aggregate([
        { $match: { isActive: true } },
        {
          $project: {
            binCode: 1,
            currentItems: { $sum: '$currentStock.quantity' },
            maxCapacity: '$capacity.maxItems',
            utilization: {
              $multiply: [
                { $divide: [{ $sum: '$currentStock.quantity' }, '$capacity.maxItems'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalBins: { $sum: 1 },
            avgUtilization: { $avg: '$utilization' },
            totalItems: { $sum: '$currentItems' },
            totalCapacity: { $sum: '$maxCapacity' }
          }
        }
      ]),
      
      // Top selling products (based on order items)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
            orderStatus: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            sku: '$product.sku',
            totalQuantity: 1,
            totalRevenue: 1,
            orderCount: 1
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      inventory: {
        categoryDistribution,
        stockLevels,
        binUtilization: binUtilization[0] || { 
          totalBins: 0, 
          avgUtilization: 0, 
          totalItems: 0, 
          totalCapacity: 0 
        },
        topProducts
      }
    });
  } catch (error) {
    console.error('Get inventory dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory dashboard'
    });
  }
});

// Get staff performance dashboard
router.get('/staff', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }

    const [
      pickerStats,
      riderStats,
      staffAvailability
    ] = await Promise.all([
      // Picker performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            picker: { $exists: true },
            pickingCompletedAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$picker',
            ordersCompleted: { $sum: 1 },
            totalItems: { $sum: { $sum: '$items.quantity' } },
            avgPickingTime: {
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
            name: '$picker.name',
            ordersCompleted: 1,
            totalItems: 1,
            avgPickingTime: 1
          }
        },
        { $sort: { ordersCompleted: -1 } }
      ]),
      
      // Rider performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            rider: { $exists: true },
            deliveredAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$rider',
            deliveriesCompleted: { $sum: 1 },
            avgDeliveryTime: {
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
            name: '$rider.name',
            rating: '$rider.riderDetails.rating',
            deliveriesCompleted: 1,
            avgDeliveryTime: 1
          }
        },
        { $sort: { deliveriesCompleted: -1 } }
      ]),
      
      // Staff availability
      User.aggregate([
        {
          $match: {
            role: { $in: ['picker', 'rider'] },
            isActive: true
          }
        },
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            available: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$pickerDetails.isAvailable', true] },
                      { $eq: ['$riderDetails.isAvailable', true] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      staff: {
        period,
        pickers: pickerStats,
        riders: riderStats,
        availability: staffAvailability
      }
    });
  } catch (error) {
    console.error('Get staff dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff dashboard'
    });
  }
});

module.exports = router;
