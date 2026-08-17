import React from 'react';

import { act, fireEvent, render } from '@testing-library/react-native';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { UP, UPRowNotice, UPRoot } from '../../src';

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockReset = jest.fn();
const mockTimingAnimation = {
  _isUsingNativeDriver: () => true,
  _startNativeLoop: jest.fn(),
  reset: mockReset,
  start: mockStart,
  stop: mockStop,
} as ReturnType<typeof Animated.timing>;
const mockLoopAnimation = {
  _isUsingNativeDriver: () => true,
  _startNativeLoop: jest.fn(),
  reset: mockReset,
  start: mockStart,
  stop: mockStop,
} as ReturnType<typeof Animated.loop>;

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockReturnValue(mockTimingAnimation);
  jest.spyOn(Animated, 'loop').mockReturnValue(mockLoopAnimation);
  jest.spyOn(Animated.Value.prototype, 'setValue');
});

afterEach(() => {
  jest.restoreAllMocks();
  mockStart.mockClear();
  mockStop.mockClear();
  mockReset.mockClear();
});

it('uses source defaults without starting an unmeasured marquee', () => {
  const screen = renderRoot(<UPRowNotice text="Maintenance begins at 22:00" />);

  expect(screen.getByTestId('up-row-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Maintenance begins at 22:00');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#fdf6ec', justifyContent: 'space-between' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).not.toHaveProperty(
    'paddingHorizontal',
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).not.toHaveProperty(
    'paddingVertical',
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice-text').props.style)).toEqual(
    expect.objectContaining({ color: '#f9ae3d', fontSize: 14 }),
  );
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(Animated.loop).not.toHaveBeenCalled();
});

it('starts a measured linear source marquee at the configured speed', () => {
  const screen = renderRoot(<UPRowNotice text="Maintenance" />);

  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 180, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 60, x: 0, y: 0 } },
  });

  expect(Animated.Value.prototype.setValue).toHaveBeenLastCalledWith(180);
  expect(Animated.timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ duration: 3000, easing: Easing.linear, toValue: -60, useNativeDriver: true }),
  );
  expect(Animated.loop).toHaveBeenLastCalledWith(mockTimingAnimation);
  expect(mockStart).toHaveBeenCalledTimes(1);
});

it('stops and restarts when source text, font size, or speed changes', () => {
  const screen = renderRoot(<UPRowNotice speed={80} text="Old" />);

  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 160, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 40, x: 0, y: 0 } },
  });
  mockStart.mockClear();
  mockStop.mockClear();
  (Animated.timing as jest.Mock).mockClear();

  screen.rerender(<UPRoot><UPRowNotice fontSize={16} speed={120} text="Updated" /></UPRoot>);
  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 200, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 100, x: 0, y: 0 } },
  });

  expect(mockStop).toHaveBeenCalled();
  expect(Animated.timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ duration: 2500, toValue: -100 }),
  );
  expect(mockStart).toHaveBeenCalled();

  mockStart.mockClear();
  (Animated.timing as jest.Mock).mockClear();
  screen.rerender(<UPRoot><UPRowNotice text="" /></UPRoot>);
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(mockStart).not.toHaveBeenCalled();
  expect(Animated.Value.prototype.setValue).toHaveBeenLastCalledWith(0);
});

it('maps source click, icon slot, link, and closable behavior', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPRowNotice iconNode={<Text testID="custom-row-notice-icon">Info</Text>} mode="link" onClick={onClick} text="Update" />,
  );

  fireEvent.press(screen.getByTestId('up-row-notice'));
  expect(onClick).toHaveBeenCalledWith();
  expect(screen.getByTestId('custom-row-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);

  screen.rerender(
    <UPRoot><UPRowNotice mode="closable" onClick={onClick} onClose={onClose} text="Update" /></UPRoot>,
  );
  fireEvent.press(screen.getByTestId('up-row-notice-close'), { stopPropagation: jest.fn() });
  expect(onClose).toHaveBeenCalledWith();
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('up-row-notice')).toBeNull();
});

it('reacts to mounted rowNotice defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPRowNotice />);

  act(() => {
    UP.setConfig({ props: { rowNotice: { bgColor: '#102030', speed: 120, text: 'Configured' } } });
  });
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Configured');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030' }),
  );

  screen.rerender(<UPRoot><UPRowNotice bgColor="#abcdef" text="Explicit" /></UPRoot>);
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Explicit');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#abcdef' }),
  );
});
