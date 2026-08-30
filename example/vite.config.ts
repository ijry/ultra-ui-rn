import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Native module stubs for web
const gestureHandlerStub = path.resolve(__dirname, 'web-stubs/gesture-handler.tsx');
const safeAreaStub = path.resolve(__dirname, 'web-stubs/safe-area.tsx');
const flashListStub = path.resolve(__dirname, 'web-stubs/flash-list.tsx');
const canvasStub = path.resolve(__dirname, 'web-stubs/canvas.tsx');

const srcDir = path.resolve(__dirname, '../src');
const rnwDir = path.resolve(__dirname, 'node_modules/react-native-web');

export default defineConfig({
  base: './',
  plugins: [react()],

  resolve: {
    alias: [
      { find: /^react-native$/, replacement: rnwDir },
      { find: 'ultra-ui-rn', replacement: srcDir },
      { find: /^react-native-canvas$/, replacement: canvasStub },
      { find: /^react-native-gesture-handler$/, replacement: path.resolve(__dirname, 'web-stubs/react-native-gesture-handler/index.tsx') },
      { find: 'react-native-gesture-handler/ReanimatedSwipeable', replacement: path.resolve(__dirname, 'web-stubs/react-native-gesture-handler/ReanimatedSwipeable.tsx') },
      { find: /^react-native-safe-area-context$/, replacement: safeAreaStub },
      { find: /^@shopify\/flash-list$/, replacement: flashListStub },
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    process: { env: {} },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-native-web'],
  },
  server: {
    port: 3000,
    host: true,
  },
});
