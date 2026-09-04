import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UP, UPModal, UPPopup, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('closes popup through the source overlay callback', () => {
  const onChangeShow = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPPopup onChangeShow={onChangeShow} onClose={onClose} show>
      Panel
    </UPPopup>,
  );

  fireEvent.press(screen.getByTestId('up-popup-overlay'));
  expect(onChangeShow).toHaveBeenCalledWith(false);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('keeps async modal open until its parent changes show', () => {
  const onConfirm = jest.fn();
  const onChangeShow = jest.fn();
  const screen = renderRoot(
    <UPModal asyncClose content="Delete it?" onChangeShow={onChangeShow} onConfirm={onConfirm} show />,
  );

  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onChangeShow).not.toHaveBeenCalled();
  expect(screen.getByTestId('up-modal')).toBeTruthy();
});

it('uses source modal width and reverse button order', () => {
  const screen = renderRoot(
    <UPModal buttonReverse cancelText="No" content="Body" show showCancelButton title="Title" />,
  );

  expect(screen.getByTestId('up-modal').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ width: UP.getPx('650rpx') })]),
  );
  expect(screen.getAllByText(/^(No|确认)$/).map((node) => node.props.children)).toEqual(['确认', 'No']);
});

it('emits popup click when the panel content is pressed', () => {
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPPopup onClick={onClick} show>
      <Text>Panel</Text>
    </UPPopup>,
  );
  fireEvent.press(screen.getByTestId('up-popup'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('emits modal cancelOnAsync when cancel is pressed during a pending async confirm', () => {
  const onCancel = jest.fn();
  const onCancelOnAsync = jest.fn();
  const onChangeShow = jest.fn();
  const screen = renderRoot(
    <UPModal
      asyncClose
      onChangeShow={onChangeShow}
      onCancel={onCancel}
      onCancelOnAsync={onCancelOnAsync}
      show
      showCancelButton
      showConfirmButton
    />,
  );
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(onChangeShow).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('up-modal-cancel'));
  expect(onCancelOnAsync).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onChangeShow).not.toHaveBeenCalled();
});

it('reports popup open once per open, not once per parent render', () => {
  // The effect that adds the overlay depends on `props`/`input`, which are fresh
  // objects every render — it has to, since the popup's node carries children and
  // styles that must stay current. But `onOpen` rode along, so every parent
  // re-render re-announced an already-open popup.
  const onOpen = jest.fn();
  const screen = renderRoot(
    <UPPopup onOpen={onOpen} show>
      Panel
    </UPPopup>,
  );
  expect(onOpen).toHaveBeenCalledTimes(1);

  screen.update(<UPRoot><UPPopup onOpen={onOpen} show>Panel</UPPopup></UPRoot>);
  screen.update(<UPRoot><UPPopup onOpen={onOpen} show>Panel</UPPopup></UPRoot>);
  expect(onOpen).toHaveBeenCalledTimes(1);

  screen.update(<UPRoot><UPPopup onOpen={onOpen} show={false}>Panel</UPPopup></UPRoot>);
  screen.update(<UPRoot><UPPopup onOpen={onOpen} show>Panel</UPPopup></UPRoot>);
  expect(onOpen).toHaveBeenCalledTimes(2);
});

it('centres a center-mode popup in the viewport and keeps the overlay tappable', () => {
  // `panelPosition`'s fallback branch only set `alignSelf: 'center'`, so an
  // absolutely-positioned panel with no vertical rule pinned to the top edge of
  // the layer instead of the middle of the screen. Upstream's demo passes
  // `mode: 'center'` with `closeOnClickOverlay`, so the backdrop behind the
  // centred panel has to stay pressable.
  const onChangeShow = jest.fn();
  const screen = renderRoot(
    <UPPopup closeOnClickOverlay mode="center" onChangeShow={onChangeShow} show>
      Panel
    </UPPopup>,
  );

  const centred = screen.getByTestId('up-popup-center');
  const style = StyleSheet.flatten(centred.props.style);
  expect(style).toEqual(
    expect.objectContaining({
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    }),
  );
  expect(centred.props.pointerEvents).toBe('box-none');

  fireEvent.press(screen.getByTestId('up-popup-overlay'));
  expect(onChangeShow).toHaveBeenCalledWith(false);
});
