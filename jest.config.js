module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^react-native-gesture-handler/ReanimatedSwipeable$':
      '<rootDir>/tests/mocks/ReanimatedSwipeable.tsx',
  },
  testPathIgnorePatterns: ['/example/', '/lib/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-worklets)/)',
  ],
};
