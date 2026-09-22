import React, { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPCropper, type UPCropperHandle, UPRoot } from '../../src';

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

it('chooseImage picks through the adapter and shows the picked image', async () => {
  // Upstream's chooseImage(index, opts) picks via uni.chooseImage when no imageSrc
  // is given, then crops the picked path. Here the app injects that picker.
  const ref = createRef<UPCropperHandle>();
  const imagePickerAdapter = jest.fn().mockResolvedValue('file:///picked.png');
  const screen = renderRoot(<UPCropper imagePickerAdapter={imagePickerAdapter} ref={ref} />);

  expect(screen.getByTestId('up-cropper-stage')).toHaveTextContent(/请提供 imageSrc/);
  await act(async () => {
    await ref.current?.chooseImage(2, { areaWidth: '300rpx' });
  });

  expect(imagePickerAdapter).toHaveBeenCalledWith({ areaWidth: '300rpx' });
  expect(screen.getByTestId('up-cropper-image').props.source).toEqual({ uri: 'file:///picked.png' });
});

it('chooseImage uses an explicit imageSrc option without the picker', async () => {
  const ref = createRef<UPCropperHandle>();
  const imagePickerAdapter = jest.fn();
  const screen = renderRoot(<UPCropper imagePickerAdapter={imagePickerAdapter} ref={ref} />);

  await act(async () => {
    await ref.current?.chooseImage(1, { imageSrc: 'https://img.example.com/b.png' });
  });

  expect(imagePickerAdapter).not.toHaveBeenCalled();
  expect(screen.getByTestId('up-cropper-image').props.source).toEqual({ uri: 'https://img.example.com/b.png' });
});

it('confirm after chooseImage carries the picked image, its index, and export size', async () => {
  const ref = createRef<UPCropperHandle>();
  const onConfirm = jest.fn();
  const screen = renderRoot(
    <UPCropper
      imagePickerAdapter={async () => 'file:///picked.png'}
      onConfirm={onConfirm}
      ref={ref}
    />,
  );

  await act(async () => {
    await ref.current?.chooseImage(2, { exportWidth: '120px', exportHeight: '90px' });
  });
  fireEvent.press(screen.getByTestId('up-cropper-confirm'));

  expect(onConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      avatar: 'file:///picked.png',
      index: 2,
      data: expect.objectContaining({ destWidth: 120, destHeight: 90 }),
    }),
  );
});

it('chooseImage leaves the hint when the picker returns null (cancelled)', async () => {
  const ref = createRef<UPCropperHandle>();
  const screen = renderRoot(<UPCropper imagePickerAdapter={async () => null} ref={ref} />);

  await act(async () => {
    await ref.current?.chooseImage(0);
  });

  expect(screen.getByTestId('up-cropper-stage')).toHaveTextContent(/请提供 imageSrc/);
});
