import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import {
  UP,
  UPAlbum,
  UPRoot,
  type UPAlbumPreviewEvent,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const imageGetSize = jest.spyOn(Image, 'getSize');

beforeEach(() => {
  imageGetSize.mockImplementation((_url, onSuccess) => onSuccess(400, 200));
});

afterEach(() => {
  imageGetSize.mockReset();
});

afterAll(() => {
  imageGetSize.mockRestore();
});

it('partitions source URLs, resolves keyed objects, and overlays hidden count', () => {
  const screen = renderRoot(
    <UPAlbum
      keyName="imageUrl"
      maxCount={4}
      multipleSize={60}
      rowCount={3}
      space={8}
      urls={[
        { imageUrl: 'https://example.com/one.png' },
        { imageUrl: '', src: 'https://example.com/two.png' },
        'https://example.com/three.png',
        { imageUrl: 'https://example.com/four.png' },
        'https://example.com/five.png',
      ]}
    />,
  );

  expect(screen.getByTestId('up-album-row-0')).toBeTruthy();
  expect(screen.getByTestId('up-album-row-1')).toBeTruthy();
  expect(screen.getByTestId('up-album-item-3')).toBeTruthy();
  expect(screen.queryByTestId('up-album-item-4')).toBeNull();
  expect(screen.getByText('+1')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-album-item-0').props.style)).toEqual(
    expect.objectContaining({ marginRight: 8 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-album-item-2').props.style)).toEqual(
    expect.objectContaining({ marginRight: 0 }),
  );
  expect(screen.getAllByTestId('up-image-native')[1].props.source).toEqual({
    uri: 'https://example.com/two.png',
  });
});

it('uses a single native wrapping row when auto-wrap is enabled', () => {
  const screen = renderRoot(
    <UPAlbum
      autoWrap
      maxCount={3}
      multipleSize={48}
      space={5}
      urls={['one', 'two', 'three', 'four']}
    />,
  );

  expect(screen.getByTestId('up-album-row-0')).toBeTruthy();
  expect(screen.queryByTestId('up-album-row-1')).toBeNull();
  expect(screen.getByTestId('up-album-item-2')).toBeTruthy();
  expect(screen.queryByTestId('up-album-item-3')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('up-album-row-0').props.style)).toEqual(
    expect.objectContaining({ flexWrap: 'wrap' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-album-item-2').props.style)).toEqual(
    expect.objectContaining({ marginBottom: 5, marginRight: 5 }),
  );
});

it('makes a single image retain its ratio with the source long edge', () => {
  const screen = renderRoot(
    <UPAlbum
      singleMode="aspectFit"
      singleSize={180}
      urls={['https://example.com/wide.png']}
    />,
  );

  expect(imageGetSize).toHaveBeenCalledWith(
    'https://example.com/wide.png',
    expect.any(Function),
    expect.any(Function),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-image-native').props.style)).toEqual(
    expect.objectContaining({ height: 90, width: 180 }),
  );
  expect(screen.getByTestId('up-image-native').props.resizeMode).toBe('contain');
});

it('uses measured source fallback dimensions after image metadata fails', () => {
  imageGetSize.mockImplementation((_url, _onSuccess, onFailure) => onFailure?.(new Error('unavailable')));
  const screen = renderRoot(
    <UPAlbum singleSize={180} urls={['https://example.com/unavailable.png']} />,
  );

  fireEvent(screen.getByTestId('up-album'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 200, x: 0, y: 0 } },
  });

  expect(StyleSheet.flatten(screen.getByTestId('up-image-native').props.style)).toEqual(
    expect.objectContaining({ height: 120, width: 120 }),
  );
});

it('emits positional host preview callbacks for images and the more overlay', () => {
  const onPreview = jest.fn<void, [UPAlbumPreviewEvent]>();
  const screen = renderRoot(
    <UPAlbum
      maxCount={2}
      previewFullImage={false}
      urls={['a', 'b', 'c']}
      onPreview={onPreview}
    />,
  );

  fireEvent.press(screen.getByTestId('up-album-item-1'));
  expect(onPreview).toHaveBeenCalledWith({ currentIndex: 1, urls: ['a', 'b', 'c'] });
  fireEvent.press(screen.getByTestId('up-album-more'));
  expect(onPreview).toHaveBeenLastCalledWith({ currentIndex: 1, urls: ['a', 'b', 'c'] });
  expect(onPreview).toHaveBeenCalledTimes(2);
});

it('maps source image styles and emits the first row width', () => {
  const onAlbumWidth = jest.fn();
  const screen = renderRoot(
    <UPAlbum
      multipleMode="aspectFit"
      multipleSize={60}
      radius={12}
      rowCount={3}
      shape="circle"
      space={8}
      urls={['one', 'two', 'three', 'four']}
      onAlbumWidth={onAlbumWidth}
    />,
  );

  expect(StyleSheet.flatten(screen.getAllByTestId('up-image-native')[0].props.style)).toEqual(
    expect.objectContaining({ borderRadius: 10000, height: 60, width: 60 }),
  );
  expect(screen.getAllByTestId('up-image-native')[0].props.resizeMode).toBe('contain');
  expect(onAlbumWidth).toHaveBeenLastCalledWith(196);

  screen.rerender(
    <UPRoot>
      <UPAlbum multipleSize={60} radius={12} shape="square" urls={['one', 'two']} />
    </UPRoot>,
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-image-native')[0].props.style)).toEqual(
    expect.objectContaining({ borderRadius: 12 }),
  );
});

it('reacts to mounted source defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPAlbum />);

  act(() => {
    UP.setConfig({
      props: { album: { maxCount: 1, multipleSize: 48, urls: ['configured'] } },
    });
  });
  expect(screen.getByTestId('up-album-item-0')).toBeTruthy();
  expect(screen.queryByTestId('up-album-item-1')).toBeNull();

  screen.rerender(
    <UPRoot>
      <UPAlbum maxCount={2} multipleSize={64} urls={['explicit-one', 'explicit-two']} />
    </UPRoot>,
  );
  expect(screen.getByTestId('up-album-item-1')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getAllByTestId('up-image-native')[0].props.style)).toEqual(
    expect.objectContaining({ height: 64, width: 64 }),
  );
});
