import React from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPList, UPListItem, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source list defaults and renders registered source item anchors', () => {
  act(() => {
    UP.setConfig({ props: { list: { height: '100px', showScrollbar: true } } });
  });
  const screen = renderRoot(
    <UPList>
      <UPListItem anchor="profile"><Text>Profile</Text></UPListItem>
    </UPList>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-list').props.style)).toEqual(
    expect.objectContaining({ height: 100 }),
  );
  expect(screen.getByTestId('up-list').props.showsVerticalScrollIndicator).toBe(true);
  expect(screen.getByTestId('up-list-item-profile')).toBeTruthy();
});

it('emits source scroll offsets and threshold edge callbacks once per entry', () => {
  const onScroll = jest.fn();
  const onLower = jest.fn();
  const onUpper = jest.fn();
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPList
      height={200}
      lowerThreshold={20}
      onRefresherRefresh={onRefresh}
      onScroll={onScroll}
      onScrollToLower={onLower}
      onScrollToUpper={onUpper}
      refresherEnabled
    >
      <Text>Rows</Text>
    </UPList>,
  );

  fireEvent.scroll(screen.getByTestId('up-list'), {
    nativeEvent: {
      contentOffset: { x: 0, y: 0 },
      contentSize: { height: 1000, width: 320 },
      layoutMeasurement: { height: 200, width: 320 },
    },
  });
  expect(onScroll).toHaveBeenCalledWith(0);
  expect(onUpper).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByTestId('up-list'), {
    nativeEvent: {
      contentOffset: { x: 0, y: 780 },
      contentSize: { height: 1000, width: 320 },
      layoutMeasurement: { height: 200, width: 320 },
    },
  });
  expect(onLower).toHaveBeenCalledTimes(1);
  fireEvent(screen.UNSAFE_getByType(RefreshControl), 'refresh');
  expect(onRefresh).toHaveBeenCalledTimes(1);
});
