// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Avoid the module naming collision
defaultConfig.resolver.blacklistRE = [
  // Exclude the bullseye-mobile directory from being processed when running mobile
  /packages\/bullseye-mobile\/.*/, 
];

// Make sure async storage is properly transformed
defaultConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = defaultConfig;
