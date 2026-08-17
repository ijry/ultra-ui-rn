import React from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPNavbarMini, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders a fixed capsule with back, divider, and home regions', () => {
  const screen = renderRoot(<UPNavbarMini />);

  expect(screen.getByTestId('up-navbar-mini')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-left')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-divider')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-home')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-inner').props.style)).toEqual(
    expect.objectContaining({
      left: 20,
      position: 'absolute',
      top: 10,
      width: expect.any(Number),
      zIndex: 11,
    }),
  );
});

it('emits back before opt-in BackHandler and emits homeUrl payload', () => {
  const events: string[] = [];
  const exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  const onHomeClick = jest.fn((payload) => events.push(`home:${payload.homeUrl}`));
  const screen = renderRoot(
    <UPNavbarMini
      autoBack
      homeUrl="/pages/index/index"
      onHomeClick={onHomeClick}
      onLeftClick={() => events.push('left')}
    />,
  );

  fireEvent.press(screen.getByTestId('up-navbar-mini-left'));
  fireEvent.press(screen.getByTestId('up-navbar-mini-home'));

  expect(events).toEqual(['left', 'home:/pages/index/index']);
  expect(exitApp).toHaveBeenCalledTimes(1);
  expect(onHomeClick.mock.calls[0][0]).toEqual(
    expect.objectContaining({ homeUrl: '/pages/index/index' }),
  );
});

it('supports placeholder, custom render nodes, and reactive config defaults', () => {
  const screen = renderRoot(
    <UPNavbarMini
      placeholder
      renderCenter={() => <Text>Home node</Text>}
      renderLeft={() => <Text>Back node</Text>}
    />,
  );

  expect(screen.getByText('Back node')).toBeTruthy();
  expect(screen.getByText('Home node')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-placeholder')).toBeTruthy();

  act(() => {
    UP.setConfig({ props: { navbarMini: { bgColor: '#223344', fixed: false, height: '40px' } } });
  });

  screen.rerender(<UPRoot><UPNavbarMini /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-content').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#223344', height: 40 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-inner').props.style)).toEqual(
    expect.objectContaining({ position: 'relative' }),
  );
});
