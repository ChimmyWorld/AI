const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Set both userId and user.id for compatibility with different code patterns
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    
    // Get user info for notifications
    const user = await User.findById(decoded.userId);
    if (user) {
      req.username = user.username;
      req.email = user.email;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

module.exports = auth;
