const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Determine if frontend build exists and print logs for debugging
const distPath = path.join(__dirname, 'frontend/dist');
const publicPath = path.join(__dirname, 'public');
console.log('Checking for frontend build at:', distPath);
console.log('Checking for public directory at:', publicPath);

let staticPath;
if (fs.existsSync(distPath)) {
  console.log('Frontend dist directory found! Serving from frontend/dist');
  staticPath = distPath;
} else if (fs.existsSync(publicPath)) {
  console.log('Public directory found! Serving from public');
  staticPath = publicPath;
} else {
  console.log('WARNING: Neither frontend/dist nor public directory exists. Cannot serve static files.');
  // Create a fallback public directory with an error page
  fs.mkdirSync(publicPath, { recursive: true });
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Application Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .error-container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 5px; }
        h1 { color: #d32f2f; }
        .actions { margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>Application Error</h1>
        <p>The application could not load properly because no static files were found.</p>
        <p>This could be because the build process did not complete successfully.</p>
        <div class="actions">
          <p>Please check the server logs for more information.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(publicPath, 'index.html'), errorHtml);
  staticPath = publicPath;
}

// Serve static files
app.use(express.static(staticPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`
      <html>
        <head>
          <title>Application Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error-container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 5px; }
            h1 { color: #d32f2f; }
            pre { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Application Error</h1>
            <p>The application could not serve the requested page.</p>
            <p>Index.html file not found at: ${indexPath}</p>
            <pre>Server Time: ${new Date().toISOString()}</pre>
          </div>
        </body>
      </html>
    `);
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Application error:', err.stack);
  res.status(500).send(`
    <html>
      <head>
        <title>Server Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error-container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 5px; }
          h1 { color: #d32f2f; }
          pre { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Server Error</h1>
          <p>The server encountered an error and could not complete your request.</p>
          <pre>${err.stack}</pre>
        </div>
      </body>
    </html>
  `);
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB with URI:', config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});
