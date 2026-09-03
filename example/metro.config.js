const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    // `disableHierarchicalLookup` is deliberately left off: it stops Metro from
    // walking up from the requiring module, which hides nested transitive deps
    // (e.g. react-native-reanimated's own semver@7 in its private
    // node_modules). Duplicate react/react-native copies are prevented by
    // `extraNodeModules` below instead.
    extraNodeModules: {
      react: path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    },
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
