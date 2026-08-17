import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UPPullRefresh, UPRoot, type UPPullRefreshRef } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function drag(screen: ReturnType<typeof render>, startY: number, moveY: number) {
  const root = screen.getByTestId('up-pull-refresh');
  fireEvent(root, 'touchStart', { nativeEvent: { pageY: startY, touches: [{ pageY: startY }] } });
  fireEvent(root, 'touchMove', { nativeEvent: { pageY: moveY, touches: [{ pageY: moveY }] } });
  fireEvent(root, 'touchEnd', { nativeEvent: { pageY: moveY, touches: [] } });
}

it('renders the pull header and child content', () => {
  const screen = renderRoot(
    <UPPullRefresh>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  expect(screen.getByTestId('up-pull-refresh')).toBeTruthy();
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  expect(screen.getByText('content')).toBeTruthy();
});

it('resets when released below threshold', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh damping={1} maxDistance={120} onRefresh={onRefresh} threshold={80}>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  await act(async () => drag(screen, 0, 40));

  expect(onRefresh).not.toHaveBeenCalled();
  expect(screen.getByTestId('up-pull-refresh-area').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 0 })]),
  );
});

it('emits refresh when released past threshold', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh damping={1} maxDistance={120} onRefresh={onRefresh} threshold={80}>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  await act(async () => drag(screen, 0, 100));

  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText('刷新中...')).toBeTruthy();
});

it('tracks controlled refreshing state and exposes ref methods', async () => {
  const ref = React.createRef<UPPullRefreshRef>();
  const screen = renderRoot(
    <UPPullRefresh ref={ref} refreshing>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.finishRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  await act(async () => ref.current?.startRefresh());
  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.resetRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
});

it('renders custom state nodes', async () => {
  const screen = renderRoot(
    <UPPullRefresh
      damping={1}
      pull={({ distance }) => <Text>pull {distance}</Text>}
      release={({ distance }) => <Text>release {distance}</Text>}
      refreshingNode={<Text>busy</Text>}
      threshold={20}
    >
      <Text>content</Text>
    </UPPullRefresh>,
  );

  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchStart', {
    nativeEvent: { pageY: 0, touches: [{ pageY: 0 }] },
  });
  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchMove', {
    nativeEvent: { pageY: 25, touches: [{ pageY: 25 }] },
  });
  expect(screen.getByText('release 25')).toBeTruthy();
  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchEnd', {
    nativeEvent: { pageY: 25, touches: [] },
  });
  await waitFor(() => expect(screen.getByText('busy')).toBeTruthy());
});

it('emits loadmore only when footer status is loadmore', () => {
  const onLoadmore = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh
      height={100}
      loadmoreProps={{ status: 'loadmore' }}
      onLoadmore={onLoadmore}
      showLoadmore
    >
      <Text>content</Text>
    </UPPullRefresh>,
  );

  fireEvent.scroll(screen.getByTestId('up-pull-refresh-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 180, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });
  expect(onLoadmore).toHaveBeenCalledTimes(1);

  screen.rerender(
    <UPRoot>
      <UPPullRefresh
        height={100}
        loadmoreProps={{ status: 'loading' }}
        onLoadmore={onLoadmore}
        showLoadmore
      >
        <Text>content</Text>
      </UPPullRefresh>
    </UPRoot>,
  );
  fireEvent.scroll(screen.getByTestId('up-pull-refresh-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 180, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });
  expect(onLoadmore).toHaveBeenCalledTimes(1);
});
