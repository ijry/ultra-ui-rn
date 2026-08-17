import React from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPNavigationBar, UPNavbar, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders the source default left icon and centered title', () => {
  const screen = renderRoot(<UPNavbar title="订单详情" />);

  expect(screen.getByTestId('up-navbar')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-left')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('订单详情');
  expect(screen.queryByTestId('up-navbar-right')).toBeNull();
});

it('renders left and right text/icon areas and emits ordered callbacks', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPNavbar
      leftText="返回"
      onLeftClick={() => events.push('left')}
      onRightClick={() => events.push('right')}
      rightIcon="setting"
      rightText="设置"
      title="设置页"
    />,
  );

  fireEvent.press(screen.getByTestId('up-navbar-left'));
  fireEvent.press(screen.getByTestId('up-navbar-right'));

  expect(events).toEqual(['left', 'right']);
  expect(screen.getByText('返回')).toBeTruthy();
  expect(screen.getByText('设置')).toBeTruthy();
});

it('uses fixed placeholder and border styles from source-like props', () => {
  const screen = renderRoot(<UPNavbar border fixed height="48px" placeholder title="固定" />);

  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-placeholder').props.style)).toEqual(
    expect.objectContaining({ height: expect.any(Number) }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-inner').props.style)).toEqual(
    expect.objectContaining({ left: 0, position: 'absolute', right: 0, top: 0, zIndex: 11 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-content').props.style)).toEqual(
    expect.objectContaining({ borderBottomWidth: 1, height: 48 }),
  );
});

it('runs left callback before opt-in BackHandler exitApp', () => {
  const events: string[] = [];
  const exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  const screen = renderRoot(<UPNavbar autoBack onLeftClick={() => events.push('left')} title="返回" />);

  fireEvent.press(screen.getByTestId('up-navbar-left'));

  expect(events).toEqual(['left']);
  expect(exitApp).toHaveBeenCalledTimes(1);
});

it('supports custom render nodes and reactive config defaults', () => {
  const screen = renderRoot(
    <UPNavbar
      renderCenter={() => <Text>Custom center</Text>}
      renderLeft={() => <Text>Custom left</Text>}
      renderRight={() => <Text>Custom right</Text>}
    />,
  );

  expect(screen.getByText('Custom center')).toBeTruthy();
  expect(screen.getByText('Custom left')).toBeTruthy();
  expect(screen.getByText('Custom right')).toBeTruthy();

  act(() => {
    UP.setConfig({ props: { navbar: { bgColor: '#112233', title: 'Configured' } } });
  });

  screen.rerender(<UPRoot><UPNavbar /></UPRoot>);
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('Configured');
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-inner').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#112233' }),
  );
});

it('keeps the legacy UPNavigationBar alias source-compatible', () => {
  const screen = renderRoot(<UPNavigationBar title="Alias" />);
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('Alias');
});
