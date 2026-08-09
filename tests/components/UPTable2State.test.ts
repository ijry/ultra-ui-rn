import {
  buildTable2SpanMap,
  filterTable2Rows,
  flattenTable2Rows,
  normalizeTable2Span,
  normalizeTable2Tree,
  resolveTable2RowKey,
  sortTable2Rows,
  toggleTable2Selection,
} from '../../src/components/table2/state';

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'score', title: 'Score' },
] as const;

const rows = [
  {
    id: 'root',
    name: 'Root',
    score: 3,
    children: [
      { id: 'child-a', name: 'A', score: 2 },
      { id: 'child-b', name: 'B', score: 1 },
    ],
  },
  { id: 'other', name: 'Other', score: 4 },
];

it('uses configured keys and deterministic path fallbacks', () => {
  expect(resolveTable2RowKey({ id: 7 }, 0, 'id', [0])).toBe(7);
  expect(resolveTable2RowKey({ name: 'missing' }, 2, 'id', [2])).toBe('path:2');
});

it('filters top-level rows without mutating the input', () => {
  const source = [...rows];
  const filtered = filterTable2Rows(source, { name: 'Other' });
  expect(filtered.map((row) => row.name)).toEqual(['Other']);
  expect(source).toEqual(rows);
});

it('sorts stably by one or more conditions', () => {
  const source = [
    { id: 'a', score: 2, group: 'x' },
    { id: 'b', score: 2, group: 'y' },
    { id: 'c', score: 1, group: 'x' },
  ];
  expect(sortTable2Rows(
    source,
    columns,
    [{ field: 'score', order: 'ascending', column: columns[1] }],
  ).map((row) => row.id)).toEqual(['c', 'a', 'b']);
});

it('flattens only expanded descendants and preserves parent metadata', () => {
  const model = normalizeTable2Tree(rows, 'id', 'children', 'hasChildren', new Map());
  expect(flattenTable2Rows(model, ['root'], []).map((row) => row.key)).toEqual([
    'root',
    'child-a',
    'child-b',
    'other',
  ]);
  expect(flattenTable2Rows(model, ['root'], ['child-a'])[1]).toEqual(
    expect.objectContaining({ level: 1, parentRow: rows[0], selected: true }),
  );
});

it('selects and deselects descendants immutably', () => {
  const model = normalizeTable2Tree(rows, 'id', 'children', 'hasChildren', new Map());
  expect(toggleTable2Selection(model, [], 'root', true)).toEqual([
    'root',
    'child-a',
    'child-b',
  ]);
  expect(toggleTable2Selection(model, ['root', 'child-a', 'child-b'], 'root', false)).toEqual([]);
});

it('normalizes array and object spans and hides zero-span cells', () => {
  expect(normalizeTable2Span([2, 3])).toEqual({ rowspan: 2, colspan: 3 });
  expect(normalizeTable2Span({ rowspan: 2 })).toEqual({ rowspan: 2, colspan: 1 });
  expect(normalizeTable2Span([0, 1])).toEqual({ rowspan: 0, colspan: 1 });
  expect(buildTable2SpanMap([], columns, undefined)).toEqual(new Map());
});
