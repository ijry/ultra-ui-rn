import reactNativeConfig from '@react-native/eslint-config/flat';

export default [
  ...reactNativeConfig,
  {
    files: ['tests/setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
      },
    },
  },
];
