# Troubleshooting Guide

## Common Deployment Issues

### Build Failures

#### Vite Build Error
**Issue**: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite'`
- Cause: ES modules configuration conflict with Vite build process
- Fix: Use CommonJS in `vite.config.js` and remove `"type": "module"` from package.json

#### MongoDB Connection Error
**Issue**: `Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"`
- Cause: Environment variable includes the variable name in the value
- Fix: Set `MONGODB_URI` without the `MONGODB_URI=` prefix

### Render.com Deployment

#### Recommended Build Command
```bash
cd frontend && npm ci && NODE_ENV=production npm run build && cd .. && npm ci
```

#### Environment Variables
Required variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to "production"
- `PORT`: Will be set automatically by Render

## Quick Fixes

1. Frontend Build Issues
   ```bash
   # Local testing
   cd frontend
   npm ci
   npm run build
   ```

2. Backend Issues
   ```bash
   # Local testing
   npm ci
   node app.js
   ```

3. Check MongoDB Connection
   ```javascript
   // Valid URI format
   mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```
