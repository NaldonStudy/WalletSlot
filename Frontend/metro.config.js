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
};

// 플랫폼 확장자 우선순위 설정
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// 추가 파일 확장자 지원
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs', // ES 모듈 지원
];

module.exports = config;