import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
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

const fillStyle: ViewStyle = { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 };

function FillProbe() {
  const overlay = useUPOverlay();  return (
    <Text
      testID="add-fill"
      onPress={() =>
        overlay.add({
          id: 'fill',
          zIndex: 10080,
          node: <View style={fillStyle} testID="fill-node" />,
        })
      }
    >
      Add
    </Text>
  );
}

it('gives each overlay entry a full-screen containing block', () => {
  // An entry node that is `position: absolute; inset: 0` — which every overlay in
  // the library is — resolves its edges against this wrapper. A wrapper with no
  // layout of its own collapses to zero height, because its only child is out of
  // flow, and the overlay's backdrop then covers nothing while its text children
  // still paint. UPNoNetwork hit exactly that; the other five consumers only
  // escaped it by each hand-rolling their own absolute-fill wrapper.
  const screen = render(
    <OverlayProvider>
      <FillProbe />
    </OverlayProvider>,
  );
  fireEvent.press(screen.getByTestId('add-fill'));

  const style = StyleSheet.flatten(screen.getByTestId('up-overlay-entry').props.style);
  expect(style).toEqual(
    expect.objectContaining({ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }),
  );
  expect(screen.getByTestId('fill-node')).toBeTruthy();
});
