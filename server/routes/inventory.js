const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Bin = require('../models/Bin');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { auth, isAdmin, isPicker } = require('../middleware/auth');
const QRCode = require('qrcode');

const router = express.Router();

// Get all bins with filtering
router.get('/bins', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('storeId').optional().isMongoId(),
  query('zone').optional().isString(),
  query('binType').optional().isIn(['storage', 'picking', 'packing', 'shipping', 'returns'])
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

    const { page = 1, limit = 20, storeId, zone, binType } = req.query;
    const filter = { isActive: true };

    if (storeId) filter.store = storeId;
    if (zone) filter['location.zone'] = zone;
    if (binType) filter.binType = binType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bins, totalCount] = await Promise.all([
      Bin.find(filter)
        .populate('store', 'name storeCode')
        .populate('currentStock.product', 'name sku images price')
        .sort({ 'location.zone': 1, 'location.aisle': 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Bin.countDocuments(filter)
    ]);

    res.json({
      success: true,
      bins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bins'
    });
  }
});

// Get single bin details
router.get('/bins/:id', auth, async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id)
      .populate('store', 'name storeCode address')
      .populate('currentStock.product', 'name sku images price brand')
      .populate('movementHistory.product', 'name sku')
      .populate('movementHistory.performedBy', 'name role');

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    res.json({
      success: true,
      bin
    });
  } catch (error) {
    console.error('Get bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bin'
    });
  }
});

// Create new bin (Admin only)
router.post('/bins', auth, isAdmin, [
  body('binCode').trim().notEmpty().withMessage('Bin code is required'),
  body('binType').isIn(['storage', 'picking', 'packing', 'shipping', 'returns']),
  body('location.aisle').trim().notEmpty(),
  body('location.section').trim().notEmpty(),
  body('location.shelf').trim().notEmpty(),
  body('location.level').isInt({ min: 1 }),
  body('location.zone').trim().notEmpty(),
  body('store').isMongoId().withMessage('Valid store ID is required')
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

    // Check if bin code already exists
    const existingBin = await Bin.findOne({ binCode: req.body.binCode });
    if (existingBin) {
      return res.status(400).json({
        success: false,
        message: 'Bin with this code already exists'
      });
    }

    const bin = new Bin(req.body);
    await bin.save();

    // Update store capacity
    const store = await Store.findById(req.body.store);
    if (store) {
      store.capacity.totalBins += 1;
      store.capacity.activeBins += 1;
      await store.save();
    }

    res.status(201).json({
      success: true,
      message: 'Bin created successfully',
      bin
    });
  } catch (error) {
    console.error('Create bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating bin'
    });
  }
});

// Update bin
router.put('/bins/:id', auth, isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    res.json({
      success: true,
      message: 'Bin updated successfully',
      bin
    });
  } catch (error) {
    console.error('Update bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating bin'
    });
  }
});

// Add stock to bin
router.post('/bins/:id/add-stock', auth, isPicker, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('expiryDate').optional().isISO8601(),
  body('batchNumber').optional().isString()
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

    const { productId, quantity, expiryDate, batchNumber } = req.body;
    const bin = await Bin.findById(req.params.id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    // Check if bin has capacity
    if (bin.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Bin is at full capacity'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add stock to bin
    bin.addStock(productId, quantity, expiryDate, batchNumber, req.user.userId);
    await bin.save();

    // Update product inventory
    product.inventory.totalStock += quantity;
    product.inventory.availableStock += quantity;

    // Update bin locations in product
    const existingBinLocation = product.binLocations.find(bl => 
      bl.binId.toString() === bin._id.toString()
    );

    if (existingBinLocation) {
      existingBinLocation.quantity += quantity;
      existingBinLocation.lastUpdated = new Date();
    } else {
      product.binLocations.push({
        binId: bin._id,
        quantity: quantity
      });
    }

    await product.save();

    res.json({
      success: true,
      message: 'Stock added successfully',
      bin: await bin.populate('currentStock.product', 'name sku')
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding stock'
    });
  }
});

// Remove stock from bin
router.post('/bins/:id/remove-stock', auth, isPicker, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
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

    const { productId, quantity, reason } = req.body;
    const bin = await Bin.findById(req.params.id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    // Check if sufficient stock exists
    const currentQuantity = bin.getProductQuantity(productId);
    if (currentQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${currentQuantity}`
      });
    }

    // Remove stock from bin
    bin.removeStock(productId, quantity, req.user.userId, null, reason);
    await bin.save();

    // Update product inventory
    const product = await Product.findById(productId);
    if (product) {
      product.inventory.totalStock -= quantity;
      product.inventory.availableStock -= quantity;

      // Update bin locations in product
      const binLocation = product.binLocations.find(bl => 
        bl.binId.toString() === bin._id.toString()
      );

      if (binLocation) {
        binLocation.quantity -= quantity;
        binLocation.lastUpdated = new Date();

        // Remove bin location if quantity becomes 0
        if (binLocation.quantity <= 0) {
          product.binLocations = product.binLocations.filter(bl => 
            bl.binId.toString() !== bin._id.toString()
          );
        }
      }

      await product.save();
    }

    res.json({
      success: true,
      message: 'Stock removed successfully',
      bin: await bin.populate('currentStock.product', 'name sku')
    });
  } catch (error) {
    console.error('Remove stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing stock'
    });
  }
});

// Transfer stock between bins
router.post('/bins/:fromBinId/transfer/:toBinId', auth, isPicker, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
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

    const { fromBinId, toBinId } = req.params;
    const { productId, quantity, reason } = req.body;

    const [fromBin, toBin] = await Promise.all([
      Bin.findById(fromBinId),
      Bin.findById(toBinId)
    ]);

    if (!fromBin || !toBin) {
      return res.status(404).json({
        success: false,
        message: 'One or both bins not found'
      });
    }

    // Check if sufficient stock exists in source bin
    const availableQuantity = fromBin.getProductQuantity(productId);
    if (availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock in source bin. Available: ${availableQuantity}`
      });
    }

    // Check if destination bin has capacity
    if (toBin.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Destination bin is at full capacity'
      });
    }

    // Get product info for transfer
    const sourceStock = fromBin.currentStock.find(item => 
      item.product.toString() === productId
    );

    // Remove from source bin
    fromBin.removeStock(productId, quantity, req.user.userId, null, `Transfer to ${toBin.binCode}: ${reason}`);

    // Add to destination bin
    toBin.addStock(
      productId, 
      quantity, 
      sourceStock.expiryDate, 
      sourceStock.batchNumber, 
      req.user.userId
    );

    // Add transfer record to destination bin
    toBin.movementHistory.push({
      action: 'transfer',
      product: productId,
      quantity: quantity,
      previousQuantity: toBin.getProductQuantity(productId) - quantity,
      newQuantity: toBin.getProductQuantity(productId),
      performedBy: req.user.userId,
      reason: `Transfer from ${fromBin.binCode}: ${reason}`
    });

    await Promise.all([fromBin.save(), toBin.save()]);

    // Update product bin locations
    const product = await Product.findById(productId);
    if (product) {
      // Update source bin location
      const sourceBinLocation = product.binLocations.find(bl => 
        bl.binId.toString() === fromBinId
      );
      if (sourceBinLocation) {
        sourceBinLocation.quantity -= quantity;
        if (sourceBinLocation.quantity <= 0) {
          product.binLocations = product.binLocations.filter(bl => 
            bl.binId.toString() !== fromBinId
          );
        }
      }

      // Update destination bin location
      const destBinLocation = product.binLocations.find(bl => 
        bl.binId.toString() === toBinId
      );
      if (destBinLocation) {
        destBinLocation.quantity += quantity;
        destBinLocation.lastUpdated = new Date();
      } else {
        product.binLocations.push({
          binId: toBinId,
          quantity: quantity
        });
      }

      await product.save();
    }

    res.json({
      success: true,
      message: 'Stock transferred successfully',
      fromBin: await fromBin.populate('currentStock.product', 'name sku'),
      toBin: await toBin.populate('currentStock.product', 'name sku')
    });
  } catch (error) {
    console.error('Transfer stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error transferring stock'
    });
  }
});

// Generate QR code for bin
router.get('/bins/:id/qr-code', auth, async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    // Generate new QR code if doesn't exist
    if (!bin.qrCode) {
      const qrData = `BIN:${bin.binCode}:${bin._id}`;
      bin.qrCode = await QRCode.toDataURL(qrData);
      await bin.save();
    }

    res.json({
      success: true,
      qrCode: bin.qrCode,
      binCode: bin.binCode,
      binId: bin._id
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating QR code'
    });
  }
});

// Scan QR code to get bin info
router.post('/scan-qr', auth, [
  body('qrData').trim().notEmpty().withMessage('QR data is required')
], async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR data (format: BIN:binCode:binId)
    const qrParts = qrData.split(':');
    if (qrParts.length !== 3 || qrParts[0] !== 'BIN') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    const binId = qrParts[2];
    const bin = await Bin.findById(binId)
      .populate('currentStock.product', 'name sku images price')
      .populate('store', 'name storeCode');

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    res.json({
      success: true,
      bin
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scanning QR code'
    });
  }
});

// Get inventory summary
router.get('/summary', auth, [
  query('storeId').optional().isMongoId()
], async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = {};
    if (storeId) filter.store = storeId;

    const [
      totalBins,
      activeBins,
      totalProducts,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      Bin.countDocuments({ ...filter, isActive: true }),
      Bin.countDocuments({ ...filter, isActive: true, isAccessible: true }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 
        isActive: true, 
        $expr: { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] }
      }),
      Product.countDocuments({ 
        isActive: true, 
        'inventory.availableStock': 0 
      })
    ]);

    // Get bin utilization
    const binUtilization = await Bin.aggregate([
      { $match: { ...filter, isActive: true } },
      {
        $addFields: {
          currentItems: { $sum: '$currentStock.quantity' },
          utilizationPercentage: {
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
          averageUtilization: { $avg: '$utilizationPercentage' },
          totalItems: { $sum: '$currentItems' },
          totalCapacity: { $sum: '$capacity.maxItems' }
        }
      }
    ]);

    res.json({
      success: true,
      summary: {
        bins: {
          total: totalBins,
          active: activeBins,
          utilization: binUtilization[0] || { averageUtilization: 0, totalItems: 0, totalCapacity: 0 }
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        }
      }
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory summary'
    });
  }
});

// Get bin movement history
router.get('/bins/:id/history', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const bin = await Bin.findById(req.params.id)
      .populate('movementHistory.product', 'name sku')
      .populate('movementHistory.performedBy', 'name role')
      .populate('movementHistory.orderId', 'orderNumber');

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    // Paginate movement history
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const history = bin.movementHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      history,
      pagination: {
        currentPage: parseInt(page),
        totalItems: bin.movementHistory.length,
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(bin.movementHistory.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bin history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bin history'
    });
  }
});

module.exports = router;
