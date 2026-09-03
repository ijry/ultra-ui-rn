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

/**
 * Packages that must exist exactly once in the bundle. Both this repo's root and
 * `example/` carry a copy (the library declares them as dependencies, and the
 * example must declare them too so Gradle autolinks the native side). Library
 * source under `<root>/src` would otherwise resolve to the root copy while the
 * native module came from example's, and for gesture-handler / worklets a second
 * JS copy fails to initialise — gesture-handler throws
 * `TypeError: property is not writable` re-defining a JSI-injected global,
 * which leaves the whole `ultra-ui-rn` namespace undefined and blanks the screen.
 *
 * `extraNodeModules` cannot do this: Metro consults it only when normal
 * resolution *fails*, and the root copy resolves fine. Rewriting
 * `originModulePath` is what actually forces one copy.
 */
const SINGLETONS = [
  '@shopify/flash-list',
  'react',
  'react-dom',
  'react-native',
  'react-native-canvas',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-worklets',
];

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    // `disableHierarchicalLookup` is deliberately left off: it stops Metro from
    // walking up from the requiring module, which hides nested transitive deps
    // (e.g. react-native-reanimated's own semver@7 in its private node_modules).
    resolveRequest: (context, moduleName, platform) => {
      const owned = SINGLETONS.some(
        (name) => moduleName === name || moduleName.startsWith(`${name}/`),
      );
      const ctx = owned
        ? { ...context, originModulePath: path.join(projectRoot, 'index.js') }
        : context;
      return context.resolveRequest(ctx, moduleName, platform);
    },
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
