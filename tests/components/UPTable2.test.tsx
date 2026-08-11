import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPTable2, type UPTable2Column } from '../../src';
import { buildTable2SpanMap } from '../../src/components/table2/state';
import {
  flashListScrollCalls,
  resetFlashListScrollCalls,
} from '../mocks/FlashList';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

type TableRow = {
  id: string;
  name: string;
  score: number;
  status: string;
};

const columns: readonly UPTable2Column<TableRow>[] = [
  { fixed: 'left', key: 'name', title: 'Name', width: 120 },
  { key: 'score', title: 'Score', width: 80 },
  { key: 'status', title: 'Status', width: 100 },
];

const data: readonly TableRow[] = [
  { id: 'a', name: 'Ada', score: 98, status: 'ready' },
  { id: 'b', name: 'Bea', score: 84, status: 'queued' },
];

it('renders source fields and React cell/header callbacks', () => {
  const renderColumns = columns.map((column) => ({
    ...column,
    renderHeader: ({ column: current }: { column: UPTable2Column<TableRow> }) => (
      <Text>{`H:${current.key}`}</Text>
    ),
    renderCell: ({ row }: { row: TableRow }) => <Text>{`C:${row.name}`}</Text>,
  }));
  const screen = renderRoot(
    <UPTable2
      columns={renderColumns}
      data={data}
      height={180}
      rowHeight={40}
    />,
  );

  expect(screen.getByTestId('up-table2')).toBeTruthy();
  expect(screen.getAllByText('H:name').length).toBeGreaterThan(0);
  expect(screen.getAllByText('C:Ada').length).toBeGreaterThan(0);
  expect(screen.getAllByTestId('up-table2-row-a').length).toBeGreaterThan(0);
});

it('accepts the source expandRowKeys controlled prop', () => {
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name', type: 'expand' }]}
      data={[{
        id: 'root',
        name: 'Root',
        children: [{ id: 'child', name: 'Child' }],
      }]}
      expandRowKeys={['root']}
    />,
  );

  expect(screen.getByTestId('up-table2-row-child')).toBeTruthy();
});

it('applies source column style to the header cell', () => {
  const screen = renderRoot(
    <UPTable2
      columns={[{
        key: 'name',
        title: 'Name',
        style: { backgroundColor: '#f5f7fa' },
      }]}
      data={[{ id: 'a', name: 'Ada' }]}
    />,
  );

  expect(screen.getByTestId('up-table2-header-name').props.style).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ backgroundColor: '#f5f7fa' }),
    ]),
  );
});

it('renders an empty state and preserves explicit fixed dimensions', () => {
  const screen = renderRoot(
    <UPTable2
      columns={columns}
      data={[]}
      emptyText="No records"
      fixedHeader
      height={220}
      rowHeight={44}
    />,
  );

  expect(screen.getByText('No records')).toBeTruthy();
  expect(screen.getByTestId('up-table2').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 220 })]),
  );
});

it('renders fixed and scrollable column planes with stable row keys', () => {
  const screen = renderRoot(<UPTable2 columns={columns} data={data} height={180} />);
  expect(screen.getByTestId('up-table2-fixed-plane')).toBeTruthy();
  expect(screen.getByTestId('up-table2-main-plane')).toBeTruthy();
  expect(screen.getAllByTestId('up-table2-row-a').length).toBeGreaterThanOrEqual(2);
});

it('updates uncontrolled selection, select-all, and recursive tree selection', () => {
  const onSelectionChange = jest.fn();
  const onSelect = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[
        { key: 'select', title: '', type: 'selection', width: 48 },
        { key: 'name', title: 'Name', type: 'expand' },
      ]}
      data={[{
        id: 'root',
        name: 'Root',
        children: [{ id: 'child', name: 'Child' }],
      }]}
      defaultExpandedRowKeys={['root']}
      onSelect={onSelect}
      onSelectionChange={onSelectionChange}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-select-root'));
  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'root' }),
    expect.arrayContaining([expect.objectContaining({ id: 'child' })]),
    ['root', 'child'],
  );
  expect(onSelectionChange).toHaveBeenLastCalledWith(
    expect.arrayContaining([expect.objectContaining({ id: 'root' })]),
    ['root', 'child'],
  );
});

it('does not change controlled selection or caller-owned arrays', () => {
  const selectedRowKeys = ['root'];
  const onSelectionChange = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name' }, { key: 'select', type: 'selection' }]}
      data={[{ id: 'root', name: 'Root' }]}
      onSelectionChange={onSelectionChange}
      selectedRowKeys={selectedRowKeys}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-select-root'));
  expect(selectedRowKeys).toEqual(['root']);
  expect(onSelectionChange).toHaveBeenCalledWith([], []);
  expect(screen.getByTestId('up-table2-select-root').props.accessibilityState.checked).toBe(true);
});

it('supports current-row and expansion callbacks with cell payload toggles', () => {
  const onCurrentChange = jest.fn();
  const onExpandChange = jest.fn();
  const onCellClick = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name', type: 'expand' }]}
      data={[{ id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] }]}
      highlightCurrentRow
      onCellClick={onCellClick}
      onCurrentChange={onCurrentChange}
      onExpandChange={onExpandChange}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-expand-root'));
  expect(onExpandChange).toHaveBeenCalledWith(['root'], expect.objectContaining({ id: 'root' }));
  fireEvent.press(screen.getByTestId('up-table2-row-root'));
  expect(onCurrentChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'root' }), null);
  fireEvent.press(screen.getByTestId('up-table2-cell-root-name'));
  expect(onCellClick).toHaveBeenCalledWith(expect.objectContaining({
    row: expect.objectContaining({ id: 'root' }),
    column: expect.objectContaining({ key: 'name' }),
  }));
});

it('cycles sort order and emits source sort conditions', () => {
  const onSortChange = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name', sortable: true }]}
      data={[{ id: 'b', name: 'B' }, { id: 'a', name: 'A' }]}
      onSortChange={onSortChange}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-header-name'));
  expect(onSortChange).toHaveBeenLastCalledWith([
    expect.objectContaining({ field: 'name', order: 'ascending' }),
  ]);
  expect(screen.getAllByText('A').length).toBeGreaterThan(0);
});

it('emits filter changes and applies source-compatible contains filters', () => {
  const onFilterChange = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name' }]}
      data={[{ id: 'a', name: 'Ada' }, { id: 'b', name: 'Bea' }]}
      filters={{ name: 'Ad' }}
      onFilterChange={onFilterChange}
    />,
  );

  expect(screen.getByText('Ada')).toBeTruthy();
  expect(screen.queryByText('Bea')).toBeNull();
  expect(onFilterChange).toHaveBeenCalledWith({ name: 'Ad' });
});

it('loads lazy children through callback and Promise forms without mutating rows', async () => {
  const callbackChildren = [{ id: 'callback-child', name: 'Callback child' }];
  const promiseChildren = [{ id: 'promise-child', name: 'Promise child' }];
  const source = [
    { id: 'callback', name: 'Callback', hasChildren: true },
    { id: 'promise', name: 'Promise', hasChildren: true },
  ];
  const callbackLoad = jest.fn((_row, _payload, resolve) => resolve(callbackChildren));
  const promiseLoad = jest.fn((row: (typeof source)[number]) => (
    row.id === 'promise' ? Promise.resolve(promiseChildren) : undefined
  ));
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name', type: 'expand' }]}
      data={source}
      lazy
      load={(row, payload, resolve) => {
        if (row.id === 'callback') return callbackLoad(row, payload, resolve);
        return promiseLoad(row);
      }}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-expand-callback'));
  fireEvent.press(screen.getByTestId('up-table2-expand-promise'));
  expect(await screen.findByText('Callback child')).toBeTruthy();
  expect(await screen.findByText('Promise child')).toBeTruthy();
  expect(source[0]).not.toHaveProperty('children');
});

it('renders hidden covered cells and warns when a span crosses fixed columns', () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = renderRoot(
    <UPTable2
      columns={[
        { fixed: 'left', key: 'name', title: 'Name' },
        { key: 'score', title: 'Score' },
      ]}
      data={[{ id: 'a', name: 'Ada', score: 98 }]}
      spanMethod={({ columnIndex }) => columnIndex === 0 ? [1, 2] : [0, 0]}
    />,
  );

  expect(screen.getAllByTestId('up-table2-cell-a-name')[0].props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ width: expect.any(Number) })]),
  );
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('fixed-column boundary'));
  warning.mockRestore();
});

it('marks covered row and column cells in the span map', () => {
  const map = buildTable2SpanMap(
    [{
      key: 'a',
      row: { id: 'a', name: 'Ada', score: 98, status: 'ready' },
      rowIndex: 0,
      flatIndex: 0,
      level: 0,
      parentRow: null,
      expanded: false,
      hasChildren: false,
      selected: false,
    }],
    columns,
    ({ columnIndex }) => columnIndex === 0 ? [2, 2] : [0, 0],
  );
  expect(map.get('0:0')).toEqual(expect.objectContaining({ rowspan: 2, colspan: 2 }));
  expect(map.get('0:1')).toEqual(expect.objectContaining({ hidden: true }));
});

it('adopts controlled selected, expanded, and current keys when parents change', () => {
  const screen = renderRoot(
    <UPTable2
      currentRowKey={null}
      data={[{ id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] }]}
      expandedRowKeys={[]}
      highlightCurrentRow
      columns={[
        { key: 'select', title: '', type: 'selection' },
        { key: 'name', title: 'Name', type: 'expand' },
      ]}
      selectedRowKeys={[]}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPTable2
        columns={[
          { key: 'select', title: '', type: 'selection' },
          { key: 'name', title: 'Name', type: 'expand' },
        ]}
        currentRowKey="root"
        data={[{ id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] }]}
        expandedRowKeys={['root']}
        highlightCurrentRow
        selectedRowKeys={['child']}
      />
    </UPRoot>,
  );

  expect(screen.getByTestId('up-table2-row-child')).toBeTruthy();
  expect(screen.getAllByTestId('up-table2-select-child')[0].props.accessibilityState.checked)
    .toBe(true);
});

it('mirrors main vertical offsets to the fixed list without exposing a FlashList ref', () => {
  resetFlashListScrollCalls();
  const screen = renderRoot(
    <UPTable2
      columns={[
        { fixed: 'left', key: 'name', title: 'Name' },
        { key: 'score', title: 'Score' },
      ]}
      data={[{ id: 'a', name: 'Ada', score: 98 }]}
    />,
  );

  fireEvent.scroll(screen.getByTestId('up-table2-main-list'), {
    nativeEvent: { contentOffset: { x: 0, y: 72 } },
  });

  expect(flashListScrollCalls).toContainEqual({ animated: false, offset: 72 });
});

it('renders unknown values as empty and treats fixed-right as scrollable', () => {
  const screen = renderRoot(
    <UPTable2
      columns={[
        { fixed: 'left', key: 'name', title: 'Name' },
        { fixed: 'right' as never, key: 'unknown', title: 'Unknown' },
        { key: 'score', title: 'Score' },
      ]}
      data={[{ id: 'a', name: 'Ada', score: 98 }]}
    />,
  );

  expect(screen.getByTestId('up-table2-fixed-plane')).toBeTruthy();
  expect(screen.getByTestId('up-table2-cell-a-unknown')).toBeTruthy();
  expect(screen.queryByText('undefined')).toBeNull();
});

it('keeps caller-owned rows, nested children, and key arrays immutable', () => {
  const children = [{ id: 'child', name: 'Child' }];
  const source = [{ id: 'root', name: 'Root', children }];
  const selectedRowKeys = ['root'];
  const expandedRowKeys = ['root'];
  const screen = renderRoot(
    <UPTable2
      columns={[
        { key: 'select', type: 'selection' },
        { key: 'name', type: 'expand' },
      ]}
      data={source}
      expandedRowKeys={expandedRowKeys}
      selectedRowKeys={selectedRowKeys}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-select-root'));
  fireEvent.press(screen.getByTestId('up-table2-expand-root'));
  expect(source).toEqual([{ id: 'root', name: 'Root', children }]);
  expect(children).toEqual([{ id: 'child', name: 'Child' }]);
  expect(selectedRowKeys).toEqual(['root']);
  expect(expandedRowKeys).toEqual(['root']);
});

it('renders non-fixed headers and emits a row double-click payload', () => {
  const onRowDoubleClick = jest.fn();
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name' }]}
      data={[{ id: 'root', name: 'Root' }]}
      fixedHeader={false}
      onRowDoubleClick={onRowDoubleClick}
    />,
  );

  expect(screen.getByTestId('up-table2-header-name')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-table2-row-root'));
  fireEvent.press(screen.getByTestId('up-table2-row-root'));
  expect(onRowDoubleClick).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'root' }),
    expect.objectContaining({ rowKey: 'root' }),
  );
});
