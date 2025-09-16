// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// MSW의 exports 필드 호환성을 위한 최소한의 설정
config.resolver.unstable_enablePackageExports = true;

module.exports = config;