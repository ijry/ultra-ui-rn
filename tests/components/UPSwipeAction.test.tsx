import React from 'react';

const mockClose = jest.fn();
const mockOpenRight = jest.fn();
const mockSwipeableProps: Array<Record<string, unknown>> = [];

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const Swipeable = ReactModule.forwardRef((props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => {
    mockSwipeableProps.push(props);
    ReactModule.useImperativeHandle(ref, () => ({
      close: mockClose,
      openLeft: jest.fn(),
      openRight: mockOpenRight,
      reset: jest.fn(),
    }));
    const renderRightActions = props.renderRightActions as (() => React.ReactNode) | undefined;
    return ReactModule.createElement(
      'View',
      { testID: props.testID as string | undefined },
      renderRightActions?.(),
      props.children as React.ReactNode,
    );
  });
  return { __esModule: true, default: Swipeable };
});

import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { UP, UPRoot, UPSwipeAction, UPSwipeActionItem } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

beforeEach(() => {
  mockClose.mockClear();
  mockOpenRight.mockClear();
  mockSwipeableProps.length = 0;
});

it('uses source option defaults and maps right-only native swipe props', () => {
  const screen = renderRoot(
    <UPSwipeAction>
      <UPSwipeActionItem name="invoice" options={[{ icon: 'trash', text: 'Delete' }]}>
        <Text>Invoice #42</Text>
      </UPSwipeActionItem>
    </UPSwipeAction>,
  );

  expect(screen.getByTestId('up-swipe-action')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-item')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-native')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-options')).toBeTruthy();
  expect(screen.getByText('Invoice #42')).toBeTruthy();
  expect(screen.getByText('Delete')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(StyleSheet.flatten(screen.getByTestId('up-swipe-action-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#C7C6CD', paddingHorizontal: 15 }),
  );
  expect(mockSwipeableProps[0]).toEqual(expect.objectContaining({
    enabled: true,
    overshootRight: false,
    rightThreshold: 20,
  }));
  expect(mockSwipeableProps[0]).not.toHaveProperty('renderLeftActions');
});

it('maps disabled, threshold conversion, and option style overrides', () => {
  const screen = renderRoot(
    <UPSwipeActionItem
      disabled
      options={[{
        style: { backgroundColor: '#102030', borderRadius: 8, color: '#abcdef', fontSize: 12 },
        text: 'Styled',
      }]}
      threshold="24rpx"
    >
      <Text>Styled row</Text>
    </UPSwipeActionItem>,
  );

  expect(mockSwipeableProps[0]).toEqual(expect.objectContaining({
    enabled: false,
    rightThreshold: expect.any(Number),
  }));
  expect(mockSwipeableProps[0].rightThreshold as number).toBeGreaterThan(0);
  expect(StyleSheet.flatten(screen.getByTestId('up-swipe-action-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030', borderRadius: 8 }),
  );
  expect(StyleSheet.flatten(screen.getByText('Styled').props.style)).toEqual(
    expect.objectContaining({ color: '#abcdef', fontSize: 12 }),
  );
});

it('synchronizes controlled show with native methods and source callbacks', () => {
  const onClose = jest.fn();
  const onOpen = jest.fn();
  const onUpdateShow = jest.fn();
  const screen = renderRoot(
    <UPSwipeActionItem name="first" onClose={onClose} onOpen={onOpen} onUpdateShow={onUpdateShow} show>
      <Text>First</Text>
    </UPSwipeActionItem>,
  );

  expect(mockOpenRight).toHaveBeenCalledTimes(1);
  const openProps = mockSwipeableProps.at(-1)!;
  act(() => (openProps.onSwipeableWillOpen as () => void)());
  act(() => (openProps.onSwipeableOpen as () => void)());
  expect(onOpen).toHaveBeenCalledWith('first');
  expect(onUpdateShow).toHaveBeenLastCalledWith(true);

  screen.rerender(
    <UPRoot><UPSwipeActionItem name="first" onClose={onClose} onOpen={onOpen} onUpdateShow={onUpdateShow} show={false}><Text>First</Text></UPSwipeActionItem></UPRoot>,
  );
  expect(mockClose).toHaveBeenCalledTimes(1);
  const closeProps = mockSwipeableProps.at(-1)!;
  act(() => (closeProps.onSwipeableClose as () => void)());
  expect(onClose).toHaveBeenCalledWith('first');
  expect(onUpdateShow).toHaveBeenLastCalledWith(false);
});

it('closes only siblings when parent autoClose is enabled', () => {
  const onUpdateOpendItem = jest.fn();
  renderRoot(
    <UPSwipeAction onUpdateOpendItem={onUpdateOpendItem}>
      <UPSwipeActionItem name="first"><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second"><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  const firstProps = mockSwipeableProps[0];
  const secondProps = mockSwipeableProps[1];
  act(() => (firstProps.onSwipeableWillOpen as () => void)());
  mockClose.mockClear();
  act(() => (secondProps.onSwipeableWillOpen as () => void)());

  expect(mockClose).toHaveBeenCalledTimes(1);
  expect(onUpdateOpendItem).toHaveBeenLastCalledWith(true);
});

it('retains siblings when parent autoClose is false', () => {
  renderRoot(
    <UPSwipeAction autoClose={false}>
      <UPSwipeActionItem name="first"><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second"><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  act(() => (mockSwipeableProps[0].onSwipeableWillOpen as () => void)());
  act(() => (mockSwipeableProps[1].onSwipeableWillOpen as () => void)());
  expect(mockClose).not.toHaveBeenCalled();
});

it('emits source action payloads and observes closeOnClick', () => {
  const onClick = jest.fn();
  const closes = renderRoot(
    <UPSwipeActionItem name={7} onClick={onClick} options={[{ text: 'Archive' }]}>
      <Text>Archive item</Text>
    </UPSwipeActionItem>,
  );
  fireEvent.press(closes.getByTestId('up-swipe-action-option-0'));
  expect(onClick).toHaveBeenCalledWith({ index: 0, name: 7 });
  expect(mockClose).toHaveBeenCalledTimes(1);

  mockClose.mockClear();
  const remains = renderRoot(
    <UPSwipeActionItem closeOnClick={false} name="keep" options={[{ text: 'Keep' }]}>
      <Text>Keep item</Text>
    </UPSwipeActionItem>,
  );
  fireEvent.press(remains.getByTestId('up-swipe-action-option-0'));
  expect(mockClose).not.toHaveBeenCalled();
});

it('closes all registered rows when parent opendItem becomes false', () => {
  const screen = renderRoot(
    <UPSwipeAction>
      <UPSwipeActionItem name="first" show><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second" show><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  mockClose.mockClear();
  screen.rerender(
    <UPRoot><UPSwipeAction opendItem={false}>
      <UPSwipeActionItem name="first" show><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second" show><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction></UPRoot>,
  );
  expect(mockClose).toHaveBeenCalledTimes(2);
});

it('reacts to mounted swipe defaults while explicit props retain precedence', () => {
  const screen = renderRoot(
    <UPSwipeAction><UPSwipeActionItem><Text>Configured</Text></UPSwipeActionItem></UPSwipeAction>,
  );

  act(() => {
    UP.setConfig({ props: { swipeAction: { autoClose: false }, swipeActionItem: { disabled: true, threshold: 40 } } });
  });
  expect(mockSwipeableProps.at(-1)).toEqual(expect.objectContaining({ enabled: false, rightThreshold: 40 }));

  screen.rerender(
    <UPRoot><UPSwipeAction autoClose><UPSwipeActionItem disabled={false} threshold={12}><Text>Explicit</Text></UPSwipeActionItem></UPSwipeAction></UPRoot>,
  );
  expect(mockSwipeableProps.at(-1)).toEqual(expect.objectContaining({ enabled: true, rightThreshold: 12 }));
});
