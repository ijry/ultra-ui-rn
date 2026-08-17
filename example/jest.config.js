module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^react$': '<rootDir>/../node_modules/react',
    '^react-native-gesture-handler$':
      '<rootDir>/../node_modules/react-native-gesture-handler',
    '^react-native-gesture-handler/ReanimatedSwipeable$':
      '<rootDir>/../tests/mocks/ReanimatedSwipeable.tsx',
    '^react-native-reanimated$':
      '<rootDir>/../node_modules/react-native-reanimated',
    '^react-native-safe-area-context$':
      '<rootDir>/../node_modules/react-native-safe-area-context',
    '^react-native-worklets$': '<rootDir>/../node_modules/react-native-worklets',
    '^react-test-renderer$': '<rootDir>/../node_modules/react-test-renderer',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-worklets)/)',
  ],
};
