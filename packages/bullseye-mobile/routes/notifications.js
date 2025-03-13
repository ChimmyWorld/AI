const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

// Get all notifications for the logged in user
router.get('/', auth, async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /notifications request received for user:`, req.user.id);
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .exec();
    
    console.log(`[${new Date().toISOString()}] Found ${notifications.length} notifications for user ${req.user.id}`);
    res.json(notifications);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching notifications:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
  console.log(`[${new Date().toISOString()}] PUT /notifications/${req.params.id}/read request received`);
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      console.log(`[${new Date().toISOString()}] Notification ${req.params.id} not found`);
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if the notification belongs to the user
    if (notification.user.toString() !== req.user.id) {
      console.log(`[${new Date().toISOString()}] User ${req.user.id} not authorized to mark notification ${req.params.id} as read`);
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    console.log(`[${new Date().toISOString()}] Notification ${req.params.id} marked as read`);
    res.json(notification);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error marking notification as read:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  console.log(`[${new Date().toISOString()}] PUT /notifications/read-all request received for user ${req.user.id}`);
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    console.log(`[${new Date().toISOString()}] Marked ${result.modifiedCount} notifications as read for user ${req.user.id}`);
    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error marking all notifications as read:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
