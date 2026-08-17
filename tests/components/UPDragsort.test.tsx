import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { UP, UPDragsort, UPRoot, moveItem } from '../../src';

const rows = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Charlie' },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function responderEvent(dx: number, dy: number, timestamp = 1) {
  return {
    nativeEvent: { locationX: dx, locationY: dy, pageX: dx, pageY: dy },
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
      numberActiveTouches: 1,
      touchBank: [{
        currentPageX: dx,
        currentPageY: dy,
        currentTimeStamp: timestamp,
        previousPageX: 0,
        previousPageY: 0,
        previousTimeStamp: 0,
        touchActive: true,
      }],
    },
  };
}

function handlers(screen: ReturnType<typeof renderRoot>, index: number) {
  return screen.getByTestId(`up-dragsort-item-${index}`).props;
}

it('moves array items without mutating the source list', () => {
  const source = ['A', 'B', 'C'];
  expect(moveItem(source, 0, 2)).toEqual(['B', 'C', 'A']);
  expect(source).toEqual(['A', 'B', 'C']);
  expect(moveItem(source, 1, 1)).toEqual(['A', 'B', 'C']);
});

it('renders source labels and vertical drag emits reordered list', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(<UPDragsort initialList={rows} itemHeight={50} onDragEnd={onDragEnd} />);

  expect(screen.getByText('Alpha')).toBeTruthy();
  expect(screen.getByText('Beta')).toBeTruthy();
  expect(screen.getByText('Charlie')).toBeTruthy();

  act(() => {
    handlers(screen, 0).onResponderGrant(responderEvent(0, 0, 1));
    handlers(screen, 0).onResponderMove(responderEvent(0, 110, 2));
    handlers(screen, 0).onResponderRelease(responderEvent(0, 110, 3));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('uses horizontal item width for horizontal mode', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort direction="horizontal" initialList={rows} itemWidth={80} onDragEnd={onDragEnd} />,
  );

  act(() => {
    handlers(screen, 0).onResponderGrant(responderEvent(0, 0, 1));
    handlers(screen, 0).onResponderMove(responderEvent(170, 0, 2));
    handlers(screen, 0).onResponderRelease(responderEvent(170, 0, 3));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('uses columns, width, and height for all-direction grid mode', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort
      columns={2}
      direction="all"
      initialList={rows}
      itemHeight={50}
      itemWidth={80}
      onDragEnd={onDragEnd}
    />,
  );

  act(() => {
    handlers(screen, 0).onResponderGrant(responderEvent(0, 0, 1));
    handlers(screen, 0).onResponderMove(responderEvent(90, 60, 2));
    handlers(screen, 0).onResponderRelease(responderEvent(90, 60, 3));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('does not reorder when global drag or item drag is disabled', () => {
  const globalEnd = jest.fn();
  const itemEnd = jest.fn();
  const itemDisabled = [{ id: 'a', label: 'Alpha', draggable: false }, rows[1], rows[2]];

  const global = renderRoot(<UPDragsort draggable={false} initialList={rows} onDragEnd={globalEnd} />);
  act(() => {
    handlers(global, 0).onResponderGrant(responderEvent(0, 0, 1));
    handlers(global, 0).onResponderMove(responderEvent(0, 100, 2));
    handlers(global, 0).onResponderRelease(responderEvent(0, 100, 3));
  });
  expect(globalEnd).not.toHaveBeenCalled();

  const item = renderRoot(<UPDragsort initialList={itemDisabled} onDragEnd={itemEnd} />);
  act(() => {
    handlers(item, 0).onResponderGrant(responderEvent(0, 0, 1));
    handlers(item, 0).onResponderMove(responderEvent(0, 100, 2));
    handlers(item, 0).onResponderRelease(responderEvent(0, 100, 3));
  });
  expect(itemEnd).not.toHaveBeenCalled();
});

it('uses handler-only dragging and exposes dragging render state', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort
      initialList={rows}
      onDragEnd={onDragEnd}
      renderHandler={({ dragging, item }) => <Text>{dragging ? `moving-${item.id}` : `handle-${item.id}`}</Text>}
      renderItem={({ dragging, item }) => <Text>{dragging ? `dragging-${item.id}` : item.label}</Text>}
    />,
  );

  act(() => {
    screen.getByTestId('up-dragsort-handler-0').props.onResponderGrant(responderEvent(0, 0, 1));
  });
  expect(screen.getByText('dragging-a')).toBeTruthy();
  expect(screen.getByText('moving-a')).toBeTruthy();

  act(() => {
    screen.getByTestId('up-dragsort-handler-0').props.onResponderMove(responderEvent(0, 100, 2));
    screen.getByTestId('up-dragsort-handler-0').props.onResponderRelease(responderEvent(0, 100, 3));
  });
  expect(onDragEnd).toHaveBeenCalledTimes(1);
});

it('merges UP.setConfig defaults for dragsort', () => {
  act(() => {
    UP.setConfig({ props: { dragsort: { itemHeight: 64 } } });
  });
  const screen = renderRoot(<UPDragsort initialList={rows} />);
  expect(StyleSheet.flatten(screen.getByTestId('up-dragsort').props.style)).toEqual(
    expect.objectContaining({ height: 192 }),
  );
});
