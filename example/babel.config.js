module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Required by react-native-reanimated 4 (which moved worklet compilation into
  // react-native-worklets). Without it the native side reports
  // "Native part of Reanimated doesn't seem to be initialized" and every module
  // that transitively imports it fails to evaluate. Must stay last.
  plugins: ['react-native-worklets/plugin'],
};
