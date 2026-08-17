import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { OverlayProvider, useUPOverlay } from '../../src/overlay';

function Probe() {
  const overlay = useUPOverlay();

  return (
    <Text
      testID="add-overlays"
      onPress={() => {
        overlay.add({
          id: 'popup',
          zIndex: 10075,
          node: <Text>popup</Text>,
        });
        overlay.add({
          id: 'toast',
          zIndex: 10090,
          node: <Text>toast</Text>,
        });
      }}
    >
      Add overlays
    </Text>
  );
}

function MissingRootProbe() {
  useUPOverlay();
  return null;
}

it('renders overlays in ascending z-index order', () => {
  const screen = render(
    <OverlayProvider>
      <Probe />
    </OverlayProvider>,
  );

  fireEvent.press(screen.getByTestId('add-overlays'));

  expect(screen.getAllByText(/^(popup|toast)$/).map((node) => node.props.children)).toEqual([
    'popup',
    'toast',
  ]);
});

it('explains when an overlay consumer is missing UPRoot', () => {
  expect(() => render(<MissingRootProbe />)).toThrow(
    'useUPOverlay must be used inside UPRoot.',
  );
});
