const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Check if username or email is already taken
    if (username !== user.username || email !== user.email) {
      const exists = await User.findOne({
        $or: [
          { username, _id: { $ne: user._id } },
          { email, _id: { $ne: user._id } }
        ]
      });
      if (exists) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
});

module.exports = router;
