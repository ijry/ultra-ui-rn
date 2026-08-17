import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCropper, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits confirm with crop parameters and a null path (native boundary)', () => {
  const onConfirm = jest.fn();
  const screen = renderRoot(
    <UPCropper imageSrc="https://img.example.com/a.png" index={3} onConfirm={onConfirm} />,
  );
  fireEvent.press(screen.getByTestId('up-cropper-confirm'));
  expect(onConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      avatar: 'https://img.example.com/a.png',
      path: null,
      index: 3,
      data: expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) }),
    }),
  );
});

it('emits cancel on cancel press', () => {
  const onCancel = jest.fn();
  const screen = renderRoot(<UPCropper onCancel={onCancel} />);
  fireEvent.press(screen.getByTestId('up-cropper-cancel'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

it('emits avtinit on mount', () => {
  const onAvtinit = jest.fn();
  renderRoot(<UPCropper onAvtinit={onAvtinit} />);
  expect(onAvtinit).toHaveBeenCalledTimes(1);
});

it('shows a hint when no imageSrc is provided', () => {
  const screen = renderRoot(<UPCropper />);
  expect(screen.getByTestId('up-cropper-stage')).toHaveTextContent(/请提供 imageSrc/);
});
