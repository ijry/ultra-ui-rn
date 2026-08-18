import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () =>
  jest.requireActual('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual('react-native-safe-area-context/jest/mock');
  return mock.default;
});

jest.mock('@shopify/flash-list', () =>
  jest.requireActual('../../tests/mocks/FlashList'),
);

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-canvas', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  class CanvasImage {
    listeners = new Map();

    addEventListener(type, callback) {
      this.listeners.set(type, callback);
    }

    set src(_value) {
      void Promise.resolve().then(() => this.listeners.get('load')?.());
    }
  }

  const Canvas = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }),
  );

  return {
    __esModule: true,
    default: Canvas,
    Image: CanvasImage,
  };
});
