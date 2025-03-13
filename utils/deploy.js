const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Main deployment function
async function deploy() {
  try {
    log('Starting deployment process...');
    
    // Step 1: Ensure needed directories exist
    log('Checking directories...');
    const distPath = path.resolve(__dirname, 'frontend/dist');
    if (!fs.existsSync(distPath)) {
      log('Creating frontend/dist directory...');
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Step 2: Clean up any previous build
    log('Cleaning up previous build...');
    try {
      fs.rmSync(path.resolve(distPath, '*'), { recursive: true, force: true });
      log('Previous build cleaned successfully');
    } catch (e) {
      log('No previous build to clean or error cleaning: ' + e.message);
    }
    
    // Step 3: Build frontend
    log('Building frontend...');
    try {
      execSync('cd frontend && npm install && npm run build', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      log('Frontend built successfully');
    } catch (e) {
      log('Error building frontend: ' + e.message);
      throw new Error('Frontend build failed');
    }
    
    // Step 4: Verify build files
    log('Verifying build files...');
    if (!fs.existsSync(path.resolve(distPath, 'index.html'))) {
      throw new Error('Build verification failed: index.html not found in dist directory');
    }
    
    const files = fs.readdirSync(distPath);
    log(`Build files: ${files.join(', ')}`);
    
    // Step 5: Add version file for cache busting
    log('Adding version file for cache busting...');
    const version = {
      timestamp: new Date().toISOString(),
      version: '1.2.0-reddit-ui',
      buildTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.resolve(distPath, 'version.json'),
      JSON.stringify(version, null, 2)
    );
    
    // Step 6: Add a cache manifest file
    const manifest = {
      name: "Community Forum App",
      short_name: "Forum",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      description: "A Reddit-style community forum",
      version: version.version,
      build_id: Date.now().toString(),
      icons: []
    };
    
    fs.writeFileSync(
      path.resolve(distPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    log('Deployment preparation completed successfully!');
    log('To complete deployment, commit these changes and push to your repository.');
    
  } catch (error) {
    log(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment process
deploy();
