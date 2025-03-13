// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Find the workspace root, assuming monorepo structure
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the root node_modules
config.resolver.disableHierarchicalLookup = true;

// 4. Add additional file extensions to support
const defaultAssetExts = config.resolver.assetExts;
const defaultSourceExts = config.resolver.sourceExts;

config.resolver.assetExts = [
  ...defaultAssetExts,
  // Add more asset extensions when needed
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
];

config.resolver.sourceExts = [
  ...defaultSourceExts,
  // Add more source extensions when needed
  'jsx',
  'js',
  'json',
  'ts',
  'tsx',
];

module.exports = config;
