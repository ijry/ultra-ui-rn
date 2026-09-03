module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // These packages must resolve to the single copy at the repo root. The example
  // now declares them itself (so RN autolinking can see them), which means a
  // second copy exists under example/node_modules — and a bare specifier hitting
  // one copy while a subpath hits the other yields two module instances, so the
  // jestSetup native-module mocks stop applying. Subpaths are mapped too;
  // the ReanimatedSwipeable stub stays first because order wins.
  moduleNameMapper: {
    '^react$': '<rootDir>/../node_modules/react',
    '^@shopify/flash-list(/.*)?$':
      '<rootDir>/../node_modules/@shopify/flash-list$1',
    '^react-native-canvas(/.*)?$':
      '<rootDir>/../node_modules/react-native-canvas$1',
    '^react-native-gesture-handler/ReanimatedSwipeable$':
      '<rootDir>/../tests/mocks/ReanimatedSwipeable.tsx',
    '^react-native-gesture-handler(/.*)?$':
      '<rootDir>/../node_modules/react-native-gesture-handler$1',
    '^react-native-reanimated(/.*)?$':
      '<rootDir>/../node_modules/react-native-reanimated$1',
    '^react-native-safe-area-context(/.*)?$':
      '<rootDir>/../node_modules/react-native-safe-area-context$1',
    '^react-native-worklets(/.*)?$':
      '<rootDir>/../node_modules/react-native-worklets$1',
    '^react-test-renderer$': '<rootDir>/../node_modules/react-test-renderer',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-worklets)/)',
  ],
};
