#!/bin/bash

# Reddit-style UI Deployment Script
echo "====== STARTING DEPLOYMENT PROCESS ======"
echo "Current directory: $(pwd)"

# Step 1: Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Step 2: Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 3: Verify build
echo "Verifying build..."
if [ -f "./public/index.html" ]; then
  echo "✅ Build successful - index.html exists in public folder"
else
  echo "❌ Build failed - index.html not found in public folder"
  exit 1
fi

# Step 4: Create a version file for cache busting
echo "Creating version file..."
echo "{
  \"version\": \"1.2.0-reddit-ui\",
  \"buildTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
}" > ./public/version.json

echo "====== DEPLOYMENT PREPARATION COMPLETE ======"
echo "To complete deployment:"
echo "1. Commit these changes: git add . && git commit -m \"Reddit UI update with deployment fixes\""
echo "2. Push to GitHub: git push"
echo "3. Deploy will automatically trigger on Render"
