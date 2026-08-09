import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPTable2, type UPTable2Column } from '../../src';

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
