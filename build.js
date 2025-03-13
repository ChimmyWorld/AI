const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

// Function to run shell commands and log output
function runCommand(command, cwd) {
  try {
    console.log(`Running: ${command} in ${cwd || 'current directory'}`);
    const output = execSync(command, { 
      cwd: cwd || process.cwd(),
      stdio: 'inherit' 
    });
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check if frontend directory exists
const frontendDir = path.join(__dirname, 'frontend');
if (!fs.existsSync(frontendDir)) {
  console.error('Frontend directory not found!');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
runCommand('npm install');

// Install frontend dependencies and build
console.log('\n📦 Installing frontend dependencies...');
runCommand('npm install', frontendDir);

console.log('\n🔨 Building frontend...');
runCommand('npm run build', frontendDir);

// Ensure the dist output exists
const distDir = path.join(frontendDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Frontend build failed! dist directory not found.');
  process.exit(1);
}

// Create a public directory symlink to frontend/dist for compatibility
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('Removing existing public directory...');
  try {
    fs.rmSync(publicDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to remove public directory:', error.message);
  }
}

// Copy dist to public as a backup approach
console.log('Creating public directory with frontend build...');
try {
  fs.mkdirSync(publicDir, { recursive: true });
  
  // Copy all files from dist to public
  const copyFiles = (srcDir, destDir) => {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyFiles(distDir, publicDir);
  console.log('Successfully copied frontend build to public directory');
} catch (error) {
  console.error('Failed to create public directory with frontend build:', error.message);
}

console.log('\n✅ Build completed successfully!');
