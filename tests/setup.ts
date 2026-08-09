import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';
import { resetUPConfigForTests } from '../src/config/store';

jest.mock('react-native-reanimated', () =>
  jest.requireActual('react-native-reanimated/mock'),
);

jest.mock('@shopify/flash-list', () => ({
  FlashList: jest.requireActual<typeof import('./mocks/FlashList')>('./mocks/FlashList').FlashList,
}));

jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual<{
    default: Record<string, unknown>;
  }>('react-native-safe-area-context/jest/mock');
  return mock.default;
});

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-canvas', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  class CanvasImage {
    listeners = new Map();

    addEventListener(type: string, callback: () => void) {
      this.listeners.set(type, callback);
    }

    set src(_value: string) {
      void Promise.resolve().then(() => this.listeners.get('load')?.());
    }
  }

  const Canvas = React.forwardRef((
    props: Record<string, unknown>,
    ref: import('react').ForwardedRef<unknown>,
  ) => {
    const context = {
      beginPath: jest.fn(),
      clearRect: jest.fn(),
      closePath: jest.fn(),
      drawImage: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn((text: string) => Promise.resolve({ width: text.length * 8 })),
      rect: jest.fn(),
      stroke: jest.fn(),
      strokeRect: jest.fn(),
    };
    React.useImperativeHandle(ref, () => ({
      getContext: jest.fn(() => Promise.resolve(context)),
      toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mock')),
    }));
    return React.createElement(View, props);
  });

  return { __esModule: true, default: Canvas, Image: CanvasImage };
});

afterEach(() => {
  cleanup();
  resetUPConfigForTests();
});
