import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPRefreshVirtualList, UPRoot, type UPRefreshVirtualListRef } from '../../src';

const data = Array.from({ length: 12 }, (_, index) => ({ id: index, name: `Item ${index}` }));

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders virtual rows inside pull refresh', () => {
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  expect(screen.getByTestId('up-refresh-virtual-list')).toBeTruthy();
  expect(screen.getByText('Item 0')).toBeTruthy();
  expect(screen.getByText('Item 8')).toBeTruthy();
  expect(screen.queryByText('Item 9')).toBeNull();
});

it('emits refresh from the composed pull wrapper', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      onRefresh={onRefresh}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      threshold={30}
    />,
  );

  const root = screen.getByTestId('up-pull-refresh');
  fireEvent(root, 'touchStart', { nativeEvent: { pageY: 0, touches: [{ pageY: 0 }] } });
  fireEvent(root, 'touchMove', { nativeEvent: { pageY: 100, touches: [{ pageY: 100 }] } });
  await act(async () => fireEvent(root, 'touchEnd', { nativeEvent: { pageY: 100, touches: [] } }));

  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText('刷新中...')).toBeTruthy();
});

it('forwards virtual list scroll values', () => {
  const onScroll = jest.fn();
  const onUpdateScrollTop = jest.fn();
  const screen = renderRoot(
    <UPRefreshVirtualList
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
      contentSize: { height: 240, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });

  expect(onScroll).toHaveBeenCalledWith(80);
  expect(onUpdateScrollTop).toHaveBeenCalledWith(80);
  expect(screen.getByText('Item 2')).toBeTruthy();
});

it('exposes finishRefresh and virtual-list ref methods', async () => {
  const ref = React.createRef<UPRefreshVirtualListRef>();
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      ref={ref}
      refreshing
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.finishRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
  await act(async () => ref.current?.scrollTo(60));
  expect(ref.current?.getVisibleRange()).toEqual({ end: 10, start: 1 });
  await act(async () => ref.current?.scrollToTop());
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
});
