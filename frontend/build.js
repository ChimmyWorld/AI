const { execSync } = require('child_process');
const path = require('path');

try {
  // Ensure we're in the frontend directory
  process.chdir(path.join(__dirname));
  
  console.log('Building React frontend...');
  
  // Run Vite build directly using Node.js
  execSync('node ./node_modules/vite/bin/vite.js build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
