import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPAvatar, UPEmpty, UPImage, UPRoot, UPSkeleton } from '../../src';

function renderContent(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source image metrics, maps modes, and renders image lifecycle states', () => {
  const onLoad = jest.fn();
  const onError = jest.fn();
  const screen = renderContent(
    <UPImage
      height="100px"
      mode="aspectFit"
      src="https://example.com/image.png"
      width="120px"
      onError={onError}
      onLoad={onLoad}
    />,
  );

  const image = screen.getByTestId('up-image-native');
  expect(StyleSheet.flatten(image.props.style)).toEqual(
    expect.objectContaining({ height: 100, width: 120 }),
  );
  expect(image.props.resizeMode).toBe('contain');
  expect(screen.getByTestId('up-image-loading')).toBeTruthy();

  fireEvent(image, 'load', { nativeEvent: { source: { height: 100, width: 120 } } });
  expect(onLoad).toHaveBeenCalledTimes(1);

  fireEvent(image, 'error', { nativeEvent: { error: 'failed' } });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('up-image-error')).toBeTruthy();
});

it('renders source avatar text, icon fallback, empty states, and visibility', () => {
  const avatar = renderContent(<UPAvatar text="UP" />);
  expect(avatar.getByText('UP')).toBeTruthy();
  expect(StyleSheet.flatten(avatar.getByTestId('up-avatar').props.style)).toEqual(
    expect.objectContaining({ borderRadius: 100, height: 40, width: 40 }),
  );

  const icon = renderContent(<UPAvatar icon="person" />);
  expect(icon.getByTestId('up-avatar-icon')).toBeTruthy();

  const empty = renderContent(<UPEmpty text="No data" />);
  expect(empty.getByText('No data')).toBeTruthy();
  expect(StyleSheet.flatten(empty.getByTestId('up-empty-icon').props.style)).toEqual(
    expect.objectContaining({ height: 160, width: 160 }),
  );

  const hidden = renderContent(<UPEmpty show={false} />);
  expect(hidden.queryByTestId('up-empty')).toBeNull();
});

it('renders source skeleton title, avatar, rows, and children only after loading', () => {
  const loading = renderContent(<UPSkeleton avatar rows={2} />);
  expect(loading.getByTestId('up-skeleton-avatar')).toBeTruthy();
  expect(loading.getByTestId('up-skeleton-title')).toBeTruthy();
  expect(loading.getAllByTestId('up-skeleton-row')).toHaveLength(2);

  const content = renderContent(<UPSkeleton loading={false}>Loaded</UPSkeleton>);
  expect(content.getByText('Loaded')).toBeTruthy();
  expect(content.queryByTestId('up-skeleton')).toBeNull();
});

it('uses native Image source when an avatar URL is supplied', () => {
  const screen = renderContent(<UPAvatar src="https://example.com/avatar.png" />);
  const nativeImage = screen.getByTestId('up-avatar-image');
  expect(nativeImage.props.source).toEqual({ uri: 'https://example.com/avatar.png' });
});
