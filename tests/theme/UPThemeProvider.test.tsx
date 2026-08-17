import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { UP, UPThemeProvider, useUPTheme } from '../../src';

function TokenProbe() {
  return <Text testID="primary">{useUPTheme().colors.primary}</Text>;
}

afterEach(() => {
  UP.setConfig({ color: { primary: '#3c9cff' } });
});

it('merges provider overrides over source colors', () => {
  const screen = render(
    <UPThemeProvider colors={{ primary: '#000000' }}>
      <TokenProbe />
    </UPThemeProvider>,
  );

  expect(screen.getByTestId('primary').props.children).toBe('#000000');
});

it('reacts to a global UP.setConfig color update', () => {
  const screen = render(
    <UPThemeProvider>
      <TokenProbe />
    </UPThemeProvider>,
  );

  act(() => {
    UP.setConfig({ color: { primary: '#111111' } });
  });

  expect(screen.getByTestId('primary').props.children).toBe('#111111');
});
