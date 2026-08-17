import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  UPPagination,
  UPRoot,
  UPScrollList,
  UPTabs,
  UPToolbar,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source toolbar controls and tracks horizontal scroll-list edges', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const onLeft = jest.fn();
  const onRight = jest.fn();
  const screen = renderRoot(
    <>
      <UPToolbar onCancel={onCancel} onConfirm={onConfirm} title="Filters" />
      <UPScrollList onLeft={onLeft} onRight={onRight}><Text>Scrollable content</Text></UPScrollList>
    </>,
  );

  fireEvent.press(screen.getByTestId('up-toolbar-cancel'));
  fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByTestId('up-scroll-list'), {
    nativeEvent: {
      contentOffset: { x: 0, y: 0 },
      contentSize: { height: 40, width: 180 },
      layoutMeasurement: { height: 40, width: 100 },
    },
  });
  expect(onLeft).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByTestId('up-scroll-list'), {
    nativeEvent: {
      contentOffset: { x: 80, y: 0 },
      contentSize: { height: 40, width: 180 },
      layoutMeasurement: { height: 40, width: 100 },
    },
  });
  expect(onRight).toHaveBeenCalledTimes(1);
});

it('maps source tabs item payloads and exposes active source styling', () => {
  const onChange = jest.fn();
  const onClick = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(
    <UPTabs
      activeStyle={{ color: '#123456' }}
      current={0}
      list={[{ name: 'News' }, { name: 'Saved' }, { disabled: true, name: 'Disabled' }]}
      onChange={onChange}
      onClick={onClick}
      onUpdateCurrent={onUpdateCurrent}
      scrollable={false}
    />,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-tabs-item-text-0').props.style)).toEqual(
    expect.objectContaining({ color: '#123456' }),
  );
  fireEvent.press(screen.getByTestId('up-tabs-item-1'));
  expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ index: 1, name: 'Saved' }), 1);
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ index: 1, name: 'Saved' }), 1);
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  fireEvent.press(screen.getByTestId('up-tabs-item-2'));
  expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ index: 2, name: 'Disabled' }), 2);
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('navigates source pagination pages and updates source page sizes', () => {
  const onCurrentChange = jest.fn();
  const onSizeChange = jest.fn();
  const onUpdateCurrentPage = jest.fn();
  const onUpdatePageSize = jest.fn();
  const screen = renderRoot(
    <UPPagination
      currentPage={1}
      layout="prev, pager, total, sizes, next"
      onCurrentChange={onCurrentChange}
      onSizeChange={onSizeChange}
      onUpdateCurrentPage={onUpdateCurrentPage}
      onUpdatePageSize={onUpdatePageSize}
      pageSize={10}
      pageSizes={[10, 20]}
      total={95}
    />,
  );

  fireEvent.press(screen.getByTestId('up-pagination-next'));
  expect(onCurrentChange).toHaveBeenCalledWith(2);
  expect(onUpdateCurrentPage).toHaveBeenCalledWith(2);
  fireEvent.press(screen.getByTestId('up-pagination-size-trigger'));
  fireEvent.press(screen.getByTestId('up-pagination-size-20'));
  expect(onSizeChange).toHaveBeenCalledWith(20);
  expect(onUpdatePageSize).toHaveBeenCalledWith(20);
  expect(screen.getByText('共 95 条')).toBeTruthy();
});
