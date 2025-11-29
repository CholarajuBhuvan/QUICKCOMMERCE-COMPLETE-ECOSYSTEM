const express = require('express');
const { query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('unreadOnly').optional().isBoolean()
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

    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { 
      recipient: req.user.userId,
      isActive: true
    };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.getUnreadCount(req.user.userId)
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.userId);
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.userId
      },
      { isActive: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
});

module.exports = router;
