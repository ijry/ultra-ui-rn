import React from 'react';
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
