import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPVirtualList, type UPVirtualListRef } from '../../src';

const data = Array.from({ length: 20 }, (_, index) => ({
  id: `row-${index}`,
  name: `Row ${index}`,
}));

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders only the fixed-height visible range', () => {
  const screen = renderRoot(
    <UPVirtualList height={100} itemHeight={20} listData={data} renderItem={({ item }) => <Text>{item.name}</Text>} />,
  );

  expect(screen.getByText('Row 0')).toBeTruthy();
  expect(screen.getByText('Row 8')).toBeTruthy();
  expect(screen.queryByText('Row 9')).toBeNull();
  expect(screen.getByTestId('up-virtual-list-top-spacer').props.style).toEqual(
    expect.objectContaining({ height: 0 }),
  );
  expect(screen.getByTestId('up-virtual-list-bottom-spacer').props.style).toEqual(
    expect.objectContaining({ height: 220 }),
  );
});

it('updates visible range from scroll events', () => {
  const onScroll = jest.fn();
  const onUpdateScrollTop = jest.fn();
  const screen = renderRoot(
    <UPVirtualList
      buffer={4}
      height={100}
      itemHeight={20}
      listData={data}
      onScroll={onScroll}
      onUpdateScrollTop={onUpdateScrollTop}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  fireEvent.scroll(screen.getByTestId('up-virtual-list-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 400, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });

  expect(onScroll).toHaveBeenCalledWith(80);
  expect(onUpdateScrollTop).toHaveBeenCalledWith(80);
  expect(screen.getByText('Row 2')).toBeTruthy();
  expect(screen.getByText('Row 10')).toBeTruthy();
  expect(screen.queryByText('Row 11')).toBeNull();
});

it('tracks controlled scrollTop', () => {
  const screen = renderRoot(
    <UPVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      scrollTop={120}
    />,
  );

  expect(screen.getByText('Row 4')).toBeTruthy();
  expect(screen.getByText('Row 12')).toBeTruthy();
  expect(screen.queryByText('Row 13')).toBeNull();
  expect(screen.getByTestId('up-virtual-list-top-spacer').props.style).toEqual(
    expect.objectContaining({ height: 80 }),
  );
  expect(screen.getByTestId('up-virtual-list-bottom-spacer').props.style).toEqual(
    expect.objectContaining({ height: 140 }),
  );
});

it('supports two-way scrollTop without re-scrolling on its own echo', () => {
  // Mirrors a caller wiring `scrollTop` + `onUpdateScrollTop` together, as
  // upstream's `v-model:scrollTop` does. The echoed value must not trigger
  // another scrollTo, which would fight the gesture.
  function Controlled() {
    const [top, setTop] = React.useState(0);
    return (
      <UPVirtualList
        height={100}
        itemHeight={20}
        listData={data}
        onUpdateScrollTop={setTop}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        scrollTop={top}
      />
    );
  }
  const screen = renderRoot(<Controlled />);

  act(() => {
    fireEvent.scroll(screen.getByTestId('up-virtual-list-scroll'), {
      nativeEvent: { contentOffset: { x: 0, y: 80 } },
    });
  });

  // The range followed the gesture, and the echo did not reset it to 0.
  expect(screen.getByText('Row 2')).toBeTruthy();
  expect(screen.getByText('Row 10')).toBeTruthy();
  expect(screen.getByTestId('up-virtual-list-top-spacer').props.style).toEqual(
    expect.objectContaining({ height: 40 }),
  );
});

it('wraps primitive data for render callbacks', () => {
  const screen = renderRoot(
    <UPVirtualList
      buffer={0}
      height={40}
      itemHeight={20}
      listData={['A', 'B', 'C']}
      renderItem={({ item }) => <Text>{item._virtualIndex}:{item.value}</Text>}
    />,
  );

  expect(screen.getByText('0:A')).toBeTruthy();
  expect(screen.getByText('1:B')).toBeTruthy();
  expect(screen.queryByText('2:C')).toBeNull();
});

it('exposes scroll ref methods', async () => {
  const ref = React.createRef<UPVirtualListRef>();
  renderRoot(
    <UPVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      ref={ref}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
  await act(async () => ref.current?.scrollTo(100));
  expect(ref.current?.getVisibleRange()).toEqual({ end: 12, start: 3 });
  await act(async () => ref.current?.scrollToTop());
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
});
