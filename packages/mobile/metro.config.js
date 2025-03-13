const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add all file extensions you need to handle
defaultConfig.resolver.assetExts.push(
  // Base file extensions
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  // Add any custom extensions that might be causing errors
  'js'
);

defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json'
];

// Avoid module naming collisions by excluding other frontend folders
defaultConfig.resolver.blacklistRE = [
  // Exclude all other frontend folders that might cause naming collisions
  /.*bullseye-mobile.*/,
  /.*packages\/web.*/,
  /.*frontend(?!\/node_modules).*/,  // Exclude frontend folders but not node_modules inside them
];

module.exports = defaultConfig;
