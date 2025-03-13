/**
 * Initialization script for Community Forum mono-repo
 * Installs dependencies for all packages
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands
const runCommand = (command, cwd) => {
  try {
    console.log(`${colors.dim}> ${command}${colors.reset}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute ${command}${colors.reset}`);
    return false;
  }
};

// Helper function to print section headers
const printHeader = (text) => {
  console.log('\n' + '-'.repeat(80));
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log('-'.repeat(80) + '\n');
};

// Main function
const init = () => {
  // Get the absolute path to the repo root
  const rootDir = path.resolve(__dirname);
  
  // Get all package directories
  const packagesDir = path.join(rootDir, 'packages');
  const packages = fs.readdirSync(packagesDir)
    .filter(name => fs.statSync(path.join(packagesDir, name)).isDirectory());
  
  // Print welcome message
  printHeader('Community Forum Mono-Repo Initialization');
  console.log(`${colors.yellow}This script will install dependencies for all packages in the mono-repo.${colors.reset}`);
  console.log(`Found packages: ${colors.green}${packages.join(', ')}${colors.reset}\n`);
  
  // Install root dependencies
  printHeader('Installing root dependencies');
  if (!runCommand('npm install', rootDir)) {
    console.error(`${colors.red}Failed to install root dependencies. Exiting.${colors.reset}`);
    process.exit(1);
  }
  
  // Install shared package dependencies first
  if (packages.includes('shared')) {
    printHeader('Installing shared package dependencies');
    const sharedDir = path.join(packagesDir, 'shared');
    if (!runCommand('npm install', sharedDir)) {
      console.error(`${colors.red}Failed to install shared package dependencies. Exiting.${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Install other package dependencies
  for (const pkg of packages) {
    if (pkg === 'shared') continue; // Skip shared package as we already installed it
    
    printHeader(`Installing ${pkg} package dependencies`);
    const pkgDir = path.join(packagesDir, pkg);
    if (!runCommand('npm install', pkgDir)) {
      console.error(`${colors.red}Failed to install ${pkg} package dependencies.${colors.reset}`);
      // Continue to next package instead of exiting
    }
  }
  
  // Success message
  printHeader('Initialization Complete');
  console.log(`${colors.green}Successfully initialized the Community Forum mono-repo!${colors.reset}`);
  console.log('\nTo start the web application:');
  console.log(`${colors.cyan}npm run start:web${colors.reset}`);
  console.log('\nTo start the mobile application:');
  console.log(`${colors.cyan}npm run start:mobile${colors.reset}`);
};

// Run the initialization
init();
