const { getDefaultConfig } = require('expo/metro-config');

// Expo 기본 Metro 설정 가져오기
const config = getDefaultConfig(__dirname);

// MSW 지원을 위한 resolver 설정
config.resolver.alias = {
  ...config.resolver.alias,
  // MSW가 Node.js 모듈을 찾지 못하는 문제 해결
  'node:buffer': require.resolve('buffer'),
  'node:stream': require.resolve('stream-browserify'),
  'node:util': require.resolve('util'),
  'node:events': require.resolve('events'),
  'node:process': require.resolve('process/browser'),
};

// 플랫폼 확장자 우선순위 설정
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// 추가 파일 확장자 지원
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs', // ES 모듈 지원
  'cjs', // CommonJS 모듈 지원
];

// MSW 관련 모듈을 위한 추가 설정
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'buffer': require.resolve('buffer'),
  'stream': require.resolve('stream-browserify'),
  'util': require.resolve('util'),
  'events': require.resolve('events'),
  'process': require.resolve('process/browser'),
};

module.exports = config;