import React from 'react';

import { act, fireEvent, render } from '@testing-library/react-native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { UP, UPColumnNotice, UPRoot } from '../../src';

const mockScrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  mockScrollTo.mockClear();
  jest.useRealTimers();
});

it('uses source default colors, vertical pages, volume icon, and disabled touch', () => {
  const screen = renderRoot(<UPColumnNotice text={['First', 'Second']} />);

  expect(screen.getByTestId('up-column-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(screen.getByText('First')).toBeTruthy();
  expect(screen.getByTestId('up-column-notice-scroll').props).toEqual(
    expect.objectContaining({ horizontal: false, pagingEnabled: true, scrollEnabled: false }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#fdf6ec' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ justifyContent: 'space-between' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).not.toHaveProperty(
    'paddingHorizontal',
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice-page-0').props.style)).toEqual(
    expect.objectContaining({ flexDirection: 'row', height: 20, justifyContent: 'flex-start' }),
  );
  expect(StyleSheet.flatten(screen.getByText('First').props.style)).toEqual(
    expect.objectContaining({ color: '#f9ae3d', fontSize: 14 }),
  );
});

it('maps step=true to horizontal pages, enables touch, and replaces the icon slot', () => {
  const screen = renderRoot(
    <UPColumnNotice
      disableTouch={false}
      iconNode={<Text testID="custom-column-notice-icon">News</Text>}
      step
      text={['First', 'Second']}
    />,
  );

  fireEvent(screen.getByTestId('up-column-notice-scroll'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 320, x: 0, y: 0 } },
  });

  expect(screen.getByTestId('up-column-notice-scroll').props).toEqual(
    expect.objectContaining({ horizontal: true, pagingEnabled: true, scrollEnabled: true }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice-page-0').props.style)).toEqual(
    expect.objectContaining({ width: 320 }),
  );
  expect(screen.getByTestId('custom-column-notice-icon')).toBeTruthy();
});

it('cycles by duration, wraps to zero, and does not use speed for timing', () => {
  jest.useFakeTimers();
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPColumnNotice duration={100} onClick={onClick} speed={1} text={['First', 'Second', 'Third']} />,
  );

  act(() => {
    jest.advanceTimersByTime(100);
  });
  fireEvent.press(screen.getByTestId('up-column-notice'));
  expect(onClick).toHaveBeenLastCalledWith(1);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 20 }));

  act(() => {
    jest.advanceTimersByTime(200);
  });
  fireEvent.press(screen.getByTestId('up-column-notice'));
  expect(onClick).toHaveBeenLastCalledWith(0);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 0 }));
});

it('uses a native momentum page as the source click index', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPColumnNotice onClick={onClick} text={['First', 'Second', 'Third']} />);

  fireEvent(screen.getByTestId('up-column-notice-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0, y: 40 }, layoutMeasurement: { height: 20, width: 320 } },
  });
  fireEvent.press(screen.getByTestId('up-column-notice'));

  expect(onClick).toHaveBeenCalledWith(2);
});

it('resets index and scroll position when text changes', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPColumnNotice onClick={onClick} text={['First', 'Second']} />);

  fireEvent(screen.getByTestId('up-column-notice-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0, y: 20 }, layoutMeasurement: { height: 20, width: 320 } },
  });
  screen.rerender(<UPRoot><UPColumnNotice onClick={onClick} text={['Replacement']} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-column-notice'));

  expect(onClick).toHaveBeenLastCalledWith(0);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 0 }));
});

it('renders link and closable modes, and close removes only this notice surface', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  const closable = renderRoot(
    <UPColumnNotice mode="closable" onClick={onClick} onClose={onClose} text={['First']} />,
  );

  fireEvent.press(closable.getByTestId('up-column-notice-close'), {
    stopPropagation: jest.fn(),
  });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
  expect(closable.queryByTestId('up-column-notice')).toBeNull();

  const link = renderRoot(<UPColumnNotice mode="link" text={['First']} />);
  expect(link.getAllByTestId('up-icon')).toHaveLength(2);
});

it('reacts to mounted columnNotice defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPColumnNotice />);

  act(() => {
    UP.setConfig({ props: { columnNotice: { bgColor: '#102030', duration: 75, text: ['Configured'] } } });
  });
  expect(screen.getByText('Configured')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030' }),
  );

  screen.rerender(<UPRoot><UPColumnNotice bgColor="#abcdef" text={['Explicit']} /></UPRoot>);
  expect(screen.getByText('Explicit')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#abcdef' }),
  );
});
