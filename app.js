const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

const app = express();

// Enable detailed logging for troubleshooting
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
};

app.use(requestLogger);

// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Modify static file serving and SPA handling
// Clear CORS headers for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add health check for render.com
app.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Add diagnostic endpoint
app.get('/api/diagnostic', async (req, res) => {
  try {
    const diagnostic = {
      serverTime: new Date().toISOString(),
      version: '1.1.0 - Reddit UI Update',
      environment: process.env.NODE_ENV || 'development',
      staticPath: path.resolve(__dirname, 'public'),
      staticExists: fs.existsSync(path.resolve(__dirname, 'public')),
      indexExists: fs.existsSync(path.resolve(__dirname, 'public/index.html')),
      serverStartTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      endpoints: [
        { method: 'GET', path: '/api/posts', handler: 'getAllPosts' },
        { method: 'POST', path: '/api/posts', handler: 'createPost' },
        { method: 'GET', path: '/api/posts/:id', handler: 'getPostById' },
        { method: 'GET', path: '/api/diagnostic', handler: 'diagnostic' }
      ]
    };
    
    return res.json(diagnostic);
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Serve static assets in correct order
// 1. First check in public directory (Vite actually builds here - see vite.config.js)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
}));

// 2. Then check in frontend/dist as fallback
app.use(express.static(path.join(__dirname, 'frontend/dist'), {
  maxAge: '1h',
}));

// Create simple HTML for error cases
const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Server Error</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    h1 { color: #d32f2f; }
  </style>
</head>
<body>
  <h1>Server Error</h1>
  <p>Sorry, something went wrong on our server. Please try again later.</p>
  <p>If the problem persists, please contact support.</p>
</body>
</html>
`;

// Important: Add a wildcard route to handle SPA routing - this ensures React Router works
app.get('*', (req, res) => {
  // Check if the request is for an API route
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // For non-API routes, serve the React app
  const publicPath = path.resolve(__dirname, 'public/index.html');
  
  // First check if the file exists in the public directory (this is where Vite builds to)
  if (fs.existsSync(publicPath)) {
    console.log(`Serving frontend from public: ${publicPath}`);
    return res.sendFile(publicPath);
  } else {
    // Try the frontend/dist folder as fallback
    const frontendPath = path.resolve(__dirname, 'frontend/dist/index.html');
    if (fs.existsSync(frontendPath)) {
      console.log(`Serving frontend from dist: ${frontendPath}`);
      return res.sendFile(frontendPath);
    } else {
      // If no index.html found in either location, serve error HTML
      console.error('ERROR: No index.html found in public or frontend/dist!');
      return res.status(500).send(errorHtml);
    }
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).send(errorHtml);
});

// MongoDB connection - Add more detailed error handling and retry logic
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds timeout on socket
  family: 4, // Use IPv4, skip trying IPv6
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  // Don't crash the app, but log the error
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Attempt reconnection if connection is lost
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Trying to reconnect...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    }).catch(err => console.error('Failed to reconnect to MongoDB:', err.message));
  }, 5000); // Try to reconnect after 5 seconds
});

// Make sure we handle process termination properly
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 10002;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  
  // Log public directory existence and contents
  const publicExists = fs.existsSync(path.join(__dirname, 'public'));
  console.log(`Public directory exists: ${publicExists}`);
  if (publicExists) {
    console.log(`Public directory contents: ${fs.readdirSync(path.join(__dirname, 'public'))}`);
  }
});
