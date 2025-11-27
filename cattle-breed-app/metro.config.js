// Metro configuration for Expo project
// Adds support for bundling .tflite model files as assets to avoid "Invalid or unexpected token" parse errors.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .tflite files are treated as assets (binary) not JS source.
if (!config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

module.exports = config;
