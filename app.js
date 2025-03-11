const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
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

// CORS configuration
const corsOptions = {
  // In development, allow all origins (including the browser preview)
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourproductiondomain.com'] // Lock down in production
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for diagnostics
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Add diagnostic endpoint
app.get('/api/diagnostic', async (req, res) => {
  try {
    const diagnostic = {
      serverTime: new Date().toISOString(),
      version: '1.1.0 - Reddit UI Update',
      environment: process.env.NODE_ENV || 'development',
      staticPath: path.resolve(__dirname, 'frontend/dist'),
      staticExists: fs.existsSync(path.resolve(__dirname, 'frontend/dist')),
      indexExists: fs.existsSync(path.resolve(__dirname, 'frontend/dist/index.html')),
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

// Serve static assets - use public directory as primary since that's where Vite builds to
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
}));

// Modify this to EXPLICITLY direct the route to use frontend/dist
// This is the most likely cause of our deployment issue
app.use(express.static(path.join(__dirname, 'frontend/dist'), {
  maxAge: '1h',
}));

// Important: Add a wildcard route to handle SPA routing - this ensures React Router works
app.get('*', (req, res) => {
  // Check if the request is for an API route
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // For non-API routes, serve the React app
  const frontendPath = path.resolve(__dirname, 'frontend/dist/index.html');
  
  // Log that we're serving the frontend for debugging
  console.log(`Serving frontend from: ${frontendPath}`);
  
  // First check if the file exists
  if (fs.existsSync(frontendPath)) {
    return res.sendFile(frontendPath);
  } else {
    // If not, try the public folder as fallback
    return res.sendFile(path.resolve(__dirname, 'public/index.html'));
  }
});

// Create simple HTML for error cases
const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Community Forum</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #d32f2f; }
    .message { line-height: 1.6; }
    .action { margin-top: 20px; }
    button { background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Application Error</h1>
    <div class="message">
      <p>We're having trouble loading the application. This might be due to:</p>
      <ul>
        <li>A problem with the build or deployment process</li>
        <li>Missing static files</li>
        <li>Server configuration issues</li>
      </ul>
    </div>
    <pre>Server time: ${new Date().toISOString()}</pre>
    <div class="action">
      <button onclick="window.location.reload()">Try Again</button>
    </div>
  </div>
</body>
</html>
`;

// Direct route for health check and troubleshooting
app.get('/healthcheck', (req, res) => {
  const publicExists = fs.existsSync(path.join(__dirname, 'public'));
  const publicIndexExists = fs.existsSync(path.join(__dirname, 'public/index.html'));
  const assetsExist = fs.existsSync(path.join(__dirname, 'public/assets'));

  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    directories: {
      publicExists,
      publicIndexExists,
      assetsExist,
      cwd: __dirname,
      files: publicExists ? fs.readdirSync(path.join(__dirname, 'public')) : []
    }
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).send(errorHtml);
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB with URI:', config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Debug MongoDB collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Available MongoDB collections:', collections.map(c => c.name));
        // Check if notifications collection exists and has documents
        if (collections.some(c => c.name === 'notifications')) {
          mongoose.connection.db.collection('notifications').countDocuments()
            .then(count => console.log(`Notifications collection contains ${count} documents`))
            .catch(err => console.error('Error counting notifications:', err));
        } else {
          console.warn('Warning: notifications collection does not exist in the database!');
        }
      })
      .catch(err => console.error('Error listing collections:', err));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
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
