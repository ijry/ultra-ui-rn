import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
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
