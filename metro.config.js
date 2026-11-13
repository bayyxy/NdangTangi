const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Transform TypeScript source files from node_modules packages that ship TS source
// (required for react-native-gesture-handler v3+)
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|@expo|expo|react-native-screens|react-native-safe-area-context)/)',
];

module.exports = config;

