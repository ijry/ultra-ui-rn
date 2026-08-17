import React from 'react';
import { Text } from 'react-native';
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
