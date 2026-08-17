import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UP, UPIcon, UPRoot } from '../../src';

it('uses themed glyph colors and emits the source index', () => {
  const onClick = jest.fn();
  const screen = render(
    <UPRoot>
      <UPIcon
        color="primary"
        index="3"
        label="Find"
        name="search"
        onClick={onClick}
      />
    </UPRoot>,
  );

  fireEvent.press(screen.getByTestId('up-icon'), { nativeEvent: {} });

  expect(onClick).toHaveBeenCalledWith('3', expect.anything());
  expect(
    StyleSheet.flatten(screen.getByTestId('up-icon-glyph').props.style),
  ).toEqual(expect.objectContaining({ color: '#3c9cff' }));
});

it('uses Image when source name contains a path separator', () => {
  const screen = render(
    <UPRoot>
      <UPIcon name="https://cdn.example/icon.png" size="24px" />
    </UPRoot>,
  );

  expect(screen.getByTestId('up-icon-image').props.source).toEqual({
    uri: 'https://cdn.example/icon.png',
  });
});

it('maps uni image modes to React Native resize modes', () => {
  const screen = render(
    <UPRoot>
      <UPIcon imgMode="aspectFill" name="https://cdn.example/icon.png" />
    </UPRoot>,
  );

  expect(screen.getByTestId('up-icon-image').props.resizeMode).toBe('cover');
});

it('reacts to global icon defaults', () => {
  UP.setConfig({ props: { icon: { size: '22px' } } });
  const screen = render(
    <UPRoot>
      <UPIcon name="search" />
    </UPRoot>,
  );

  expect(
    StyleSheet.flatten(screen.getByTestId('up-icon-glyph').props.style),
  ).toEqual(expect.objectContaining({ fontSize: 22 }));
});
