# UPTable2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `UPTable2`, a generic React Native virtualized data grid with source-compatible columns, tree rows, selection, sorting, filtering, lazy children, fixed left columns, fixed headers, and span metadata.

**Architecture:** Keep the existing static `UPTable` family unchanged. Add a focused `src/components/table2` module with public types, pure row/state/span helpers, and one orchestration component. `UPTable2` derives an immutable visible row model, renders the main grid through the existing `@shopify/flash-list` dependency, and renders fixed-left columns in a synchronized overlay whose vertical offset follows the main list.

**Tech Stack:** React 19, React Native 0.86, TypeScript 5.9, `@shopify/flash-list` 2.3.2, React Native Testing Library, Jest, existing `UPIcon`, `UPDimension`, `UPConfig`, and `UPRoot` conventions.

## Global Constraints

- Use the existing `@shopify/flash-list` dependency. Do not add another native data-grid dependency.
- Use a generic React API with source-compatible column fields and React-specific render callbacks.
- Use fixed row height by default and as the virtualization contract.
- Support controlled and uncontrolled selection, expansion, and current-row state.
- Support only source-compatible fixed left columns and fixed headers. Right fixed columns are out of scope.
- Do not mutate `data`, row objects, or caller-owned selection arrays.
- Do not expose FlashList types or refs.
- Keep sorting, filtering, tree flattening, and span calculation in pure helpers where possible.
- Fixed columns render in a sibling overlay and share visible row keys, row height, selection, expansion, and span metadata with the main plane.
- `spanMethod` accepts `[rowspan, colspan]` and object results; zero hides a covered cell.
- A lazy loader may call `resolve(children)` or return `Promise<children>`.
- Cross-plane spans are clipped at the fixed-column boundary and warn in development.
- CSS class props and hover tooltips remain retained/no-op or native truncation boundaries as documented.
- Preserve the package quality gates: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.

---

### Task 1: Add Public Table2 Types And Pure View-Model Helpers

**Files:**
- Create: `src/components/table2/types.ts`
- Create: `src/components/table2/state.ts`
- Test: `tests/components/UPTable2State.test.ts`

**Interfaces:**
- Consumes: `UPDimension` from `src/utils`, `UPKey` from `src/components/tree/types`, and the approved P34 design spec.
- Produces: `UPTable2Props`, `UPTable2Column`, all callback payload types, `UPTable2TreeModel`, `UPTable2VisibleRow`, and pure helpers consumed by the component and tests.

- [ ] **Step 1: Write failing helper tests for keys, filtering, stable sorting, tree flattening, selection, and spans**

Create focused tests with no React rendering:

```tsx
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
  expect(sortTable2Rows(source, columns, [{ field: 'score', order: 'ascending', column: columns[1] }]))
    .map((row) => row.id)
    .toEqual(['c', 'a', 'b']);
});

it('flattens only expanded descendants and preserves parent metadata', () => {
  const model = normalizeTable2Tree(rows, 'id', 'children', 'hasChildren', new Map());
  expect(flattenTable2Rows(model, ['root'], []).map((row) => row.key))
    .toEqual(['root', 'child-a', 'child-b', 'other']);
  expect(flattenTable2Rows(model, ['root'], [ 'child-a' ])[1])
    .toEqual(expect.objectContaining({ level: 1, parentRow: rows[0], selected: true }));
});

it('selects and deselects descendants immutably', () => {
  const model = normalizeTable2Tree(rows, 'id', 'children', 'hasChildren', new Map());
  expect(toggleTable2Selection(model, [], 'root', true)).toEqual(['root', 'child-a', 'child-b']);
  expect(toggleTable2Selection(model, ['root', 'child-a', 'child-b'], 'root', false)).toEqual([]);
});

it('normalizes array and object spans and hides zero-span cells', () => {
  expect(normalizeTable2Span([2, 3])).toEqual({ rowspan: 2, colspan: 3 });
  expect(normalizeTable2Span({ rowspan: 2 })).toEqual({ rowspan: 2, colspan: 1 });
  expect(normalizeTable2Span([0, 1])).toEqual({ rowspan: 0, colspan: 1 });
  expect(buildTable2SpanMap([], columns, undefined)).toEqual(new Map());
});
```

- [ ] **Step 2: Run the focused tests and verify they fail for missing exports**

Run:

```text
npx jest tests/components/UPTable2State.test.ts --runInBand
```

Expected: FAIL because `src/components/table2/state.ts` and its exported helpers do not exist yet.

- [ ] **Step 3: Define the public types in `src/components/table2/types.ts`**

Use the exact public shape below and keep FlashList types private to the implementation:

```ts
import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';
import type { UPKey } from '../tree/types';

export type UPTable2SortOrder = 'ascending' | 'descending';
export type UPTable2Align = 'left' | 'center' | 'right';

export type UPTable2Column<T = unknown> = {
  key: string;
  title?: React.ReactNode;
  label?: React.ReactNode;
  width?: UPDimension;
  fixed?: 'left';
  type?: 'default' | 'selection' | 'expand';
  align?: UPTable2Align;
  headerAlign?: UPTable2Align;
  sortable?: boolean;
  sortBy?: string | readonly string[] | ((row: T) => unknown);
  sortOrders?: readonly UPTable2SortOrder[];
  showOverflowTooltip?: boolean;
  renderHeader?: (payload: UPTable2HeaderPayload<T>) => React.ReactNode;
  renderCell?: (payload: UPTable2CellPayload<T>) => React.ReactNode;
};

export type UPTable2HeaderPayload<T = unknown> = {
  column: UPTable2Column<T>;
  columnIndex: number;
  sortOrder: UPTable2SortOrder | null;
  context: unknown;
};

export type UPTable2RowPayload<T = unknown> = {
  row: T;
  parentRow: T | null;
  rowKey: UPKey;
  rowIndex: number;
  level: number;
  context: unknown;
  selected: boolean;
  expanded: boolean;
};

export type UPTable2CellPayload<T = unknown> = {
  row: T;
  column: UPTable2Column<T>;
  parentRow: T | null;
  rowIndex: number;
  columnIndex: number;
  level: number;
  context: unknown;
  selected: boolean;
  expanded: boolean;
  toggleSelect: () => void;
  toggleExpand: () => void;
};

export type UPTable2LoadPayload<T = unknown> = {
  row: T;
  level: number;
  expanded: boolean;
  loading: boolean;
  context: unknown;
};

export type UPTable2SpanPayload<T = unknown> = {
  row: T;
  column: UPTable2Column<T>;
  rowIndex: number;
  columnIndex: number;
  context: unknown;
};

export type UPTable2SortCondition<T = unknown> = {
  field: string;
  order: UPTable2SortOrder;
  column: UPTable2Column<T>;
};

export type UPTable2Span = {
  rowspan: number;
  colspan: number;
};

export type UPTable2Props<T extends object = Record<string, unknown>> = {
  data?: readonly T[];
  columns?: readonly UPTable2Column<T>[];
  rowKey?: string;
  stripe?: boolean;
  border?: boolean;
  height?: UPDimension;
  maxHeight?: UPDimension;
  rowHeight?: UPDimension;
  showHeader?: boolean;
  fixedHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: UPKey | null;
  defaultCurrentRowKey?: UPKey | null;
  selectedRowKeys?: readonly UPKey[];
  defaultSelectedRowKeys?: readonly UPKey[];
  expandedRowKeys?: readonly UPKey[];
  defaultExpandedRowKeys?: readonly UPKey[];
  defaultExpandAll?: boolean;
  treeProps?: { children?: string; hasChildren?: string };
  lazy?: boolean;
  load?: (
    row: T,
    payload: UPTable2LoadPayload<T>,
    resolve: (children: readonly T[]) => void,
  ) => void | Promise<readonly T[]>;
  sortable?: boolean | 'custom';
  multiSort?: boolean;
  sortOrders?: readonly UPTable2SortOrder[];
  sortBy?: string | readonly string[] | ((row: T) => unknown);
  sortMethod?: (a: T, b: T, field: string, context: unknown) => number;
  filters?: Readonly<Record<string, unknown>>;
  showOverflowTooltip?: boolean;
  emptyText?: React.ReactNode;
  context?: unknown;
  mainCol?: string;
  expandWidth?: UPDimension;
  rowStyle?: StyleProp<ViewStyle> | ((payload: UPTable2RowPayload<T>) => ViewStyle | undefined);
  cellStyle?: (payload: UPTable2CellPayload<T>) => ViewStyle | undefined;
  rowClassName?: string | ((payload: UPTable2RowPayload<T>) => string | undefined);
  cellClassName?: string | ((payload: UPTable2CellPayload<T>) => string | undefined);
  headerCellClassName?: string | ((payload: UPTable2HeaderPayload<T>) => string | undefined);
  spanMethod?: (
    payload: UPTable2SpanPayload<T>,
  ) => [number?, number?] | { rowspan?: number; colspan?: number } | undefined;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onSelect?: (row: T, selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onSelectAll?: (selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onSelectionChange?: (selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onCellClick?: (payload: UPTable2CellPayload<T>) => void;
  onRowClick?: (row: T, payload: UPTable2RowPayload<T>) => void;
  onRowDoubleClick?: (row: T, payload: UPTable2RowPayload<T>) => void;
  onHeaderClick?: (column: UPTable2Column<T>, columnIndex: number) => void;
  onSortChange?: (conditions: readonly UPTable2SortCondition<T>[]) => void;
  onFilterChange?: (filters: Readonly<Record<string, unknown>>) => void;
  onScroll?: (scrollTop: number) => void;
  onCurrentChange?: (currentRow: T | null, previousRow: T | null) => void;
  onExpandChange?: (expandedRowKeys: readonly UPKey[], row: T) => void;
  onLoadError?: (error: unknown, row: T) => void;
};
```

- [ ] **Step 4: Implement immutable tree, filter, sort, selection, and span helpers**

Keep the model independent from React:

```ts
export type UPTable2TreeNode<T> = {
  key: UPKey;
  row: T;
  parentKey: UPKey | null;
  parentRow: T | null;
  children: UPKey[];
  level: number;
  sourceIndex: number;
};

export type UPTable2TreeModel<T> = {
  nodes: Map<UPKey, UPTable2TreeNode<T>>;
  roots: UPKey[];
};

export type UPTable2VisibleRow<T> = {
  row: T;
  key: UPKey;
  parentRow: T | null;
  rowIndex: number;
  flatIndex: number;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  selected: boolean;
};

export function filterTable2Rows<T extends object>(
  rows: readonly T[],
  filters: Readonly<Record<string, unknown>>,
): T[] {
  return rows.filter((row) => Object.keys(filters).every((field) => {
    const filter = filters[field];
    if (!filter) return true;
    return String((row as Record<string, unknown>)[field] ?? '')
      .includes(String(filter));
  }));
}

export function resolveTable2RowKey<T>(
  row: T,
  index: number,
  rowKey: string,
  path: readonly number[],
): UPKey {
  const raw = row !== null && typeof row === 'object'
    ? (row as Record<string, unknown>)[rowKey]
    : undefined;
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (raw !== undefined && raw !== null && raw !== '') return String(raw);
  return `path:${path.join('.') || index}`;
}
```

The implementation must:

1. Normalize missing and duplicate keys to deterministic internal keys and warn once per category in development.
2. Build a new tree model from filtered and stably sorted top-level rows; retain child arrays through the model without mutating source rows.
3. Sort only when conditions exist, compare `column.sortBy` before table `sortBy`, call `sortMethod` with original rows and `context`, and preserve input order for equal values.
4. Flatten depth-first in visible order, retaining `row`, `parentRow`, source `rowIndex`, `flatIndex`, `level`, key, expanded, selected, and `hasChildren`.
5. Toggle parent selection recursively over loaded descendants and always return a fresh key array.
6. Normalize missing span values to `1`, clamp negative spans to `1`, preserve zero as hidden, and build a coverage map keyed by visible row index and column index.

- [ ] **Step 5: Run helper tests, typecheck the new module, and commit**

Run:

```text
npx jest tests/components/UPTable2State.test.ts --runInBand
npm run typecheck
git diff --check
```

Expected: all helper tests pass and the new types compile before the component exists.

Commit:

```text
git add src/components/table2/types.ts src/components/table2/state.ts tests/components/UPTable2State.test.ts
git commit -m "feat: add table2 view model helpers"
```

---

### Task 2: Register Table2 Defaults And Public Exports

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/config/store.test.ts`

**Interfaces:**
- Consumes: `UPTable2Props` and `UPTable2Column` from Task 1.
- Produces: `UPTable2` package export path and `UP.setConfig({ props: { table2: ... } })` support.

- [ ] **Step 1: Add failing configuration tests**

Append tests that assert the new default object and reactive merge:

```tsx
import { getUPConfig, resetUPConfigForTests, setUPConfig } from '../../src/config/store';

it('merges table2 defaults through setUPConfig', () => {
  resetUPConfigForTests();
  expect(getUPConfig().props.table2).toEqual(expect.objectContaining({
    fixedHeader: true,
    rowHeight: 36,
    rowKey: 'id',
  }));
  setUPConfig({
    props: {
      table2: {
        rowHeight: 48,
        fixedHeader: false,
        emptyText: 'Nothing',
      },
    },
  });
  expect(getUPConfig().props.table2).toEqual(expect.objectContaining({
    emptyText: 'Nothing',
    fixedHeader: false,
    rowHeight: 48,
  }));
});
```

- [ ] **Step 2: Run the focused test and verify the export/config entry is missing**

Run:

```text
npx jest tests/config/store.test.ts --runInBand
```

Expected: FAIL because `table2` is not present in `UPProps` or `UPConfigOverrides`.

- [ ] **Step 3: Add `UPTable2Defaults` and the source default object**

Add the type near `UPWaterfallDefaults` in `src/config/defaults.ts`:

```ts
export type UPTable2Defaults = {
  data: readonly unknown[];
  columns: readonly Record<string, unknown>[];
  rowKey: string;
  stripe: boolean;
  border: boolean;
  height: UPDimension;
  maxHeight: UPDimension;
  rowHeight: UPDimension;
  showHeader: boolean;
  fixedHeader: boolean;
  highlightCurrentRow: boolean;
  defaultCurrentRowKey: string | number | null;
  defaultSelectedRowKeys: readonly (string | number)[];
  defaultExpandedRowKeys: readonly (string | number)[];
  defaultExpandAll: boolean;
  treeProps: { children: string; hasChildren: string };
  lazy: boolean;
  sortable: boolean | 'custom';
  multiSort: boolean;
  sortOrders: readonly ('ascending' | 'descending')[];
  filters: Readonly<Record<string, unknown>>;
  showOverflowTooltip: boolean;
  emptyText: string;
  mainCol: string;
  expandWidth: UPDimension;
};
```

Register the type in `UPProps` and add this default object beside the existing tree/waterfall defaults:

```ts
table2: Object.freeze({
  columns: Object.freeze([]) as readonly Record<string, unknown>[],
  data: Object.freeze([]) as readonly unknown[],
  defaultCurrentRowKey: null,
  defaultExpandAll: false,
  defaultExpandedRowKeys: Object.freeze([]) as readonly (string | number)[],
  defaultSelectedRowKeys: Object.freeze([]) as readonly (string | number)[],
  emptyText: '暂无数据',
  expandWidth: 25,
  filters: Object.freeze({}) as Readonly<Record<string, unknown>>,
  fixedHeader: true,
  height: 'auto',
  highlightCurrentRow: false,
  lazy: false,
  mainCol: '',
  maxHeight: 'auto',
  multiSort: false,
  rowHeight: 36,
  rowKey: 'id',
  showHeader: true,
  showOverflowTooltip: false,
  sortable: false,
  sortOrders: Object.freeze(['ascending', 'descending']) as readonly ('ascending' | 'descending')[],
  stripe: false,
  border: false,
  treeProps: Object.freeze({ children: 'children', hasChildren: 'hasChildren' }),
}),
```

- [ ] **Step 4: Add config merge**

Add `table2?: Partial<UPProps['table2']>` to `UPConfigOverrides.props`, clone it in `createSourceState`, and merge it in `setUPConfig`:

```ts
table2: { ...sourceDefaults.props.table2 },
```

```ts
table2: { ...state.props.table2, ...overrides.props?.table2 },
```

- [ ] **Step 5: Run configuration tests and commit**

Run:

```text
npx jest tests/config/store.test.ts --runInBand
npm run typecheck
git diff --check
```

Expected: existing config tests and the new table2 default tests pass.

Commit:

```text
git add src/config/defaults.ts src/config/store.ts tests/config/store.test.ts
git commit -m "feat: register table2 defaults"
```

---

### Task 3: Render The Main Virtualized Grid And Fixed-Left Overlay

**Files:**
- Create: `src/components/table2/UPTable2.tsx`
- Create: `src/components/table2/index.ts`
- Modify: `src/components/index.ts`
- Modify: `tests/mocks/FlashList.tsx`
- Test: `tests/components/UPTable2.test.tsx`

**Interfaces:**
- Consumes: Task 1 types/helpers, Task 2 `UPConfig` defaults, `UPIcon`, `getPx`, and the existing FlashList mock.
- Produces: a mounted `UPTable2` with stable test IDs, source-compatible default cell/header output, fixed row/header planes, and numeric scroll synchronization callbacks.

- [ ] **Step 1: Add failing component tests for columns, rendering, dimensions, empty state, and fixed-plane props**

Start `tests/components/UPTable2.test.tsx` with:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPTable2 } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const columns = [
  { fixed: 'left' as const, key: 'name', title: 'Name', width: 120 },
  { key: 'score', title: 'Score', width: 80 },
  { key: 'status', title: 'Status', width: 100 },
];

const data = [
  { id: 'a', name: 'Ada', score: 98, status: 'ready' },
  { id: 'b', name: 'Bea', score: 84, status: 'queued' },
];

it('renders source fields and React cell/header callbacks', () => {
  const screen = renderRoot(
    <UPTable2
      columns={columns.map((column) => ({
        ...column,
        renderHeader: ({ column: current }) => <Text>{`H:${current.key}`}</Text>,
        renderCell: ({ row }) => <Text>{`C:${row.name}`}</Text>,
      }))}
      data={data}
      height={180}
      rowHeight={40}
    />,
  );

  expect(screen.getByTestId('up-table2')).toBeTruthy();
  expect(screen.getByText('H:name')).toBeTruthy();
  expect(screen.getAllByText('C:Ada').length).toBeGreaterThan(0);
  expect(screen.getByTestId('up-table2-row-a')).toBeTruthy();
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
```

- [ ] **Step 2: Run the focused component tests and verify the component is missing**

Run:

```text
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: FAIL because `UPTable2.tsx` is not implemented.

- [ ] **Step 3: Extend the FlashList mock to expose scroll events and synchronization calls**

Keep the mock dependency-free and preserve all existing tests. Add a module-level call log and pass `onScroll` through to the rendered test view:

```tsx
export const flashListScrollCalls: Array<{ offset: number; animated?: boolean }> = [];

export function resetFlashListScrollCalls(): void {
  flashListScrollCalls.length = 0;
}

// inside useImperativeHandle
scrollToOffset: (options) => {
  flashListScrollCalls.push(options);
  props.__onScrollToOffset?.(options);
},
```

Include `onScroll: props.onScroll` in the mock `layoutProps` so tests can invoke the same numeric native event used by the component. Reset the call log in `tests/setup.ts` or `afterEach` in `UPTable2.test.tsx`.

- [ ] **Step 4: Implement the static grid shell with two synchronized planes**

Implement `UPTable2Inner<T extends object>` in `UPTable2.tsx` using `forwardRef` only if the component needs an internal ref shape; do not export a FlashList ref. The component should:

1. Merge `useUPConfig().props.table2` with input props and nested `treeProps`.
2. Resolve `rowHeight`, `height`, `maxHeight`, column widths, fixed width, and total width with `getPx`.
3. Derive filtered, sorted, normalized, and flattened rows through Task 1 helpers.
4. Render the main body with an existing `FlashList`, `keyExtractor={(item) => String(item.key)}`, `estimatedItemSize={rowHeight}`, and a row wrapper with stable height.
5. Wrap the main header/body content in a horizontal `ScrollView` and mirror its `contentOffset.x` to the scrollable header using a boolean synchronization guard.
6. Render fixed-left columns in an absolute sibling overlay with `pointerEvents="box-none"` on the plane and interactive child cells.
7. Render the fixed body through a second FlashList with the same row data and `onScrollToOffset` synchronization from the main vertical list.
8. Keep `fixedHeader` behavior explicit: a fixed header is a sibling above the bodies; a non-fixed header is supplied as `ListHeaderComponent` to both body lists so it scrolls vertically with rows.
9. Use these test IDs: `up-table2`, `up-table2-main-plane`, `up-table2-fixed-plane`, `up-table2-main-list`, `up-table2-fixed-list`, `up-table2-header`, `up-table2-row-${key}`, `up-table2-cell-${key}-${column.key}`, and `up-table2-empty`.

The core vertical synchronization should use this shape:

```tsx
const syncingVerticalRef = useRef(false);

const onMainListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  const offset = Math.max(0, event.nativeEvent.contentOffset.y);
  input.onScroll?.(offset);
  if (syncingVerticalRef.current) return;
  syncingVerticalRef.current = true;
  fixedListRef.current?.scrollToOffset({ animated: false, offset });
  requestAnimationFrame(() => {
    syncingVerticalRef.current = false;
  });
};
```

All public scroll callbacks expose only numeric offsets. The component must not expose either list ref.

- [ ] **Step 5: Add the table2 barrel export and implement default header/cell/row rendering**

Default cells render `String(row[column.key] ?? '')` inside `Text`; `renderCell` replaces only the content. Default headers render `title ?? label ?? column.key`; `renderHeader` replaces the title content while the sort indicator remains a sibling. Apply alignment, border, stripe, current-row, and explicit row/cell styles without using CSS classes at runtime.

Create the barrel and public component export:

```ts
export * from './UPTable2';
export * from './state';
export * from './types';
```

Add `export * from './table2';` after the existing `waterfall` export in `src/components/index.ts`. `src/index.ts` already re-exports `src/components`, so no direct root edit is needed.

Use a one-line `Text` truncation boundary for `showOverflowTooltip`:

```tsx
<Text numberOfLines={overflowEnabled ? 1 : undefined}>
  {value}
</Text>
```

Run:

```text
npx jest tests/components/UPTable2.test.tsx --runInBand
npm run typecheck
```

Expected: the component tests pass and all existing tests remain unaffected.

Commit:

```text
git add src/components/table2/UPTable2.tsx tests/mocks/FlashList.tsx tests/components/UPTable2.test.tsx
git commit -m "feat: render virtualized table2 planes"
```

---

### Task 4: Add Controlled And Uncontrolled Row Interaction State

**Files:**
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `src/components/table2/state.ts`
- Test: `tests/components/UPTable2.test.tsx`

**Interfaces:**
- Consumes: `UPTable2Props` controlled/default key props and `toggleTable2Selection`/`flattenTable2Rows`.
- Produces: selection, select-all, current-row, expansion, row/cell payloads, and source-shaped callback behavior.

- [ ] **Step 1: Add failing interaction tests**

Append tests covering both state modes and callback payloads:

```tsx
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
```

- [ ] **Step 2: Run the focused tests and verify the interaction callbacks fail**

Run:

```text
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: FAIL on selection, expansion, current-row, or missing test IDs because the initial renderer is read-only.

- [ ] **Step 3: Add local/controlled state and derive row payloads**

Use separate local state only when the corresponding controlled prop is absent:

```tsx
const [localSelectedKeys, setLocalSelectedKeys] = useState<readonly UPKey[]>(
  () => [...(props.defaultSelectedRowKeys ?? [])],
);
const [localExpandedKeys, setLocalExpandedKeys] = useState<readonly UPKey[]>(
  () => props.defaultExpandAll
    ? collectTable2ExpandableKeys(model)
    : [...(props.defaultExpandedRowKeys ?? [])],
);
const [localCurrentKey, setLocalCurrentKey] = useState<UPKey | null>(
  () => props.defaultCurrentRowKey ?? null,
);

const selectedKeys = props.selectedRowKeys ?? localSelectedKeys;
const expandedKeys = props.expandedRowKeys ?? localExpandedKeys;
const currentKey = props.currentRowKey ?? localCurrentKey;
```

Every transition must allocate a fresh array, call the corresponding `onUpdate`-equivalent only where the public spec defines one, and call source-shaped events with rows resolved from the current model. Do not write to `data`, row objects, or incoming key arrays.

- [ ] **Step 4: Add selection, select-all, expansion, current-row, and payload toggle handlers**

Implement these exact internal transitions:

```tsx
const selectRow = (key: UPKey, nextSelected: boolean) => {
  const nextKeys = toggleTable2Selection(model, selectedKeys, key, nextSelected);
  if (props.selectedRowKeys === undefined) setLocalSelectedKeys(nextKeys);
  const selectedRows = resolveTable2Rows(model, nextKeys);
  const row = model.nodes.get(key)?.row;
  if (row) props.onSelect?.(row, selectedRows, nextKeys);
  props.onSelectionChange?.(selectedRows, nextKeys);
};

const selectAll = (nextSelected: boolean) => {
  const nextKeys = nextSelected ? collectTable2SelectableKeys(model) : [];
  if (props.selectedRowKeys === undefined) setLocalSelectedKeys(nextKeys);
  const selectedRows = resolveTable2Rows(model, nextKeys);
  props.onSelectAll?.(selectedRows, nextKeys);
  props.onSelectionChange?.(selectedRows, nextKeys);
};
```

The header selection control uses all current model rows, not only currently mounted virtual rows. Expansion toggles only expandable rows and calls `onExpandChange(nextKeys, row)`. Row press updates local current state only when `currentRowKey` is absent and calls `onCurrentChange(nextRow, previousRow)` when `highlightCurrentRow` is enabled. Cell press calls `onCellClick` with a complete payload. `toggleSelect` and `toggleExpand` in cell payloads call these same handlers.

- [ ] **Step 5: Run interaction tests, typecheck, and commit**

Run:

```text
npx jest tests/components/UPTable2.test.tsx --runInBand
npm run typecheck
git diff --check
```

Expected: controlled props remain unchanged after presses, uncontrolled state re-renders, and all callbacks receive fresh arrays and source rows.

Commit:

```text
git add src/components/table2/UPTable2.tsx src/components/table2/state.ts tests/components/UPTable2.test.tsx
git commit -m "feat: add table2 row interaction state"
```

---

### Task 5: Add Sorting, Filtering, Lazy Children, And Span Rendering

**Files:**
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `src/components/table2/state.ts`
- Test: `tests/components/UPTable2.test.tsx`
- Test: `tests/components/UPTable2State.test.ts`

**Interfaces:**
- Consumes: Task 1 pure model/span helpers and Task 4 interaction handlers.
- Produces: source-shaped sort/filter callbacks, callback/Promise lazy loading, span-aware cells, and fixed-boundary diagnostics.

- [ ] **Step 1: Add failing tests for sorting, filters, lazy loaders, span coverage, and boundary warnings**

Append component tests:

```tsx
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
  const promiseLoad = jest.fn((row) => row.id === 'promise' ? Promise.resolve(promiseChildren) : undefined);
  const screen = renderRoot(
    <UPTable2
      columns={[{ key: 'name', title: 'Name', type: 'expand' }]}
      data={source}
      lazy
      load={(row, payload, resolve) => {
        if (row.id === 'callback') return callbackLoad(row, payload, resolve);
        return promiseLoad(row, payload, resolve);
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
```

Add pure span coverage assertions:

```tsx
it('marks covered row and column cells in the span map', () => {
  const map = buildTable2SpanMap(
    [{ key: 'a', row: { id: 'a' }, rowIndex: 0, flatIndex: 0, level: 0, parentRow: null, expanded: false, hasChildren: false, selected: false }],
    columns,
    ({ columnIndex }) => columnIndex === 0 ? [2, 2] : [0, 0],
  );
  expect(map.get('0:0')).toEqual(expect.objectContaining({ rowspan: 2, colspan: 2 }));
  expect(map.get('0:1')).toEqual(expect.objectContaining({ hidden: true }));
});
```

- [ ] **Step 2: Run the tests and verify the advanced behavior is absent**

Run:

```text
npx jest tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts --runInBand
```

Expected: FAIL on sort ordering, filter callback timing, lazy rows, and span metadata.

- [ ] **Step 3: Add local sort conditions and filter derivation**

Keep sort conditions internal because the approved public API exposes events but no controlled sort-condition prop:

```tsx
const [sortConditions, setSortConditions] = useState<readonly UPTable2SortCondition<T>[]>([]);

const handleHeaderPress = (column: UPTable2Column<T>, columnIndex: number) => {
  props.onHeaderClick?.(column, columnIndex);
  if (!(column.sortable ?? props.sortable)) return;
  const orders = column.sortOrders?.length ? column.sortOrders : props.sortOrders;
  const currentIndex = sortConditions.findIndex((condition) => condition.field === column.key);
  const currentOrder = currentIndex >= 0 ? sortConditions[currentIndex].order : null;
  const nextOrderIndex = currentOrder === null ? 0 : orders.indexOf(currentOrder) + 1;
  const next = nextOrderIndex >= orders.length
    ? sortConditions.filter((condition) => condition.field !== column.key)
    : props.multiSort
      ? [...sortConditions.filter((condition) => condition.field !== column.key), {
          field: column.key,
          order: orders[nextOrderIndex],
          column,
        }]
      : [{ field: column.key, order: orders[nextOrderIndex], column }];
  setSortConditions(next);
  props.onSortChange?.(next);
};
```

Derive `filteredRows` with `filterTable2Rows(props.data, props.filters)` and then call `sortTable2Rows`. Emit `onFilterChange` from an effect when the `filters` object changes, passing a shallow new object.

- [ ] **Step 4: Add immutable lazy-child state and retry semantics**

Use an internal map rather than assigning `row[childrenKey]`:

```tsx
const [loadedChildren, setLoadedChildren] = useState<ReadonlyMap<UPKey, readonly T[]>>(
  () => new Map(),
);
const [loadingKeys, setLoadingKeys] = useState<ReadonlySet<UPKey>>(() => new Set());
const attemptedLazyKeysRef = useRef(new Set<UPKey>());

const loadChildren = (row: T, key: UPKey, level: number) => {
  if (!props.lazy || !props.load || attemptedLazyKeysRef.current.has(key)) return;
  attemptedLazyKeysRef.current.add(key);
  setLoadingKeys((current) => new Set(current).add(key));
  let settled = false;
  const finish = (children: readonly T[]) => {
    if (settled) return;
    settled = true;
    setLoadedChildren((current) => new Map(current).set(key, [...children]));
    setLoadingKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };
  const fail = (error: unknown) => {
    if (settled) return;
    settled = true;
    setLoadingKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    props.onLoadError?.(error, row);
  };
  try {
    const result = props.load(row, {
      context: props.context,
      expanded: true,
      level,
      loading: true,
      row,
    }, finish);
    if (result && typeof result.then === 'function') result.then(finish, fail);
  } catch (error) {
    fail(error);
  }
};
```

On collapse, remove the key from `attemptedLazyKeysRef` so a later explicit collapse/re-expand retries. A rejected load leaves expansion state active, preserves any existing children, clears loading, and emits `onLoadError`.

- [ ] **Step 5: Add span-aware cell layout and fixed-boundary diagnostics**

Before rendering, build one span map for the current visible row/column view. Each cell resolves:

```tsx
const span = spanMap.get(`${row.flatIndex}:${columnIndex}`) ?? {
  rowspan: 1,
  colspan: 1,
  hidden: false,
};
const cellWidth = columnWidth * Math.max(1, span.colspan);
const cellHeight = rowHeight * Math.max(1, span.rowspan);
```

Covered cells render with `display: 'none'`. Positive row spans use `cellHeight`; positive column spans use `cellWidth`. The fixed plane clips a span at `fixedColumns.length`, while the main plane keeps the full source span. In development, warn once per cell when a positive span begins in a fixed column and ends in a scrollable column:

```ts
if (typeof __DEV__ !== 'undefined' && __DEV__ && crossesFixedBoundary) {
  console.warn(`[UPTable2] span crosses the fixed-column boundary at ${String(row.key)}:${column.key}.`);
}
```

- [ ] **Step 6: Run advanced tests, typecheck, and commit**

Run:

```text
npx jest tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts --runInBand
npm run typecheck
git diff --check
```

Expected: sorting, filters, callback/Promise lazy loading, span coverage, and fixed-boundary warnings pass without source mutation.

Commit:

```text
git add src/components/table2/UPTable2.tsx src/components/table2/state.ts tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts
git commit -m "feat: add table2 sorting lazy loading and spans"
```

---

### Task 6: Complete Regression Coverage And Public Behavior Checks

**Files:**
- Modify: `tests/components/UPTable2.test.tsx`
- Modify: `tests/components/UPTable2State.test.ts`
- Modify: `tests/config/store.test.ts`
- Modify: `tests/mocks/FlashList.tsx`

**Interfaces:**
- Consumes: all Task 1-5 public and internal behavior.
- Produces: regression coverage for the acceptance criteria and fixed-plane scroll behavior.

- [ ] **Step 1: Add controlled prop replacement tests**

Cover external changes replacing local views immediately:

```tsx
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
  expect(screen.getAllByTestId('up-table2-select-child')[0].props.accessibilityState.checked).toBe(true);
});
```

- [ ] **Step 2: Add fixed-plane vertical synchronization assertions**

Invoke the main list's `onScroll` with a numeric native event and inspect the mock log:

```tsx
import { flashListScrollCalls, resetFlashListScrollCalls } from '../mocks/FlashList';

it('mirrors main vertical offsets to the fixed list without exposing a FlashList ref', () => {
  resetFlashListScrollCalls();
  const screen = renderRoot(
    <UPTable2
      columns={[{ fixed: 'left', key: 'name', title: 'Name' }, { key: 'score', title: 'Score' }]}
      data={[{ id: 'a', name: 'Ada', score: 98 }]}
    />,
  );

  fireEvent.scroll(screen.getByTestId('up-table2-main-list'), {
    nativeEvent: { contentOffset: { x: 0, y: 72 } },
  });

  expect(flashListScrollCalls).toContainEqual({ animated: false, offset: 72 });
});
```

- [ ] **Step 3: Add edge-case and non-mutation assertions**

Cover:

- unknown column keys render an empty value;
- duplicate and missing keys warn in development but still render;
- `rowHeight` remains fixed even when a cell span increases its visual height;
- a fixed-right column is treated as a normal scrollable column;
- `renderCell`, `renderHeader`, row styles, cell styles, class-name props, and `context` receive the expected payload;
- `onLoadError` clears loading after rejection and does not replace existing children;
- caller `data`, nested child arrays, and all caller-owned key arrays remain unchanged after every interaction;
- `onSortChange` returns fresh condition arrays;
- `onFilterChange` returns a fresh filter object.

- [ ] **Step 4: Run the complete focused regression set**

Run:

```text
npx jest tests/components/UPTable2State.test.ts tests/components/UPTable2.test.tsx tests/config/store.test.ts --runInBand
npm run typecheck
npm run lint
```

Expected: all table2 tests pass, existing tree/waterfall/static-table tests still pass through the same command setup, and lint/typecheck report no new errors.

Commit:

```text
git add tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts tests/config/store.test.ts tests/mocks/FlashList.tsx
git commit -m "test: cover table2 controlled state and synchronization"
```

---

### Task 7: Update Documentation, Example, Gap Matrix, And Release Gates

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Consumes: the final `UPTable2` public API from Tasks 1-6.
- Produces: discoverable documentation, a compact local example, and accurate P34 status reporting.

- [ ] **Step 1: Add the README API section**

Add a P34 section after the existing P33 material with a concise controlled example:

```tsx
type OrderRow = {
  id: string;
  customer: string;
  amount: number;
  children?: readonly OrderRow[];
};

const columns = [
  { fixed: 'left' as const, key: 'customer', title: 'Customer', width: 140, type: 'expand' as const },
  { key: 'amount', title: 'Amount', sortable: true, width: 100 },
  { key: 'status', title: 'Status', width: 100 },
];

const [selectedRowKeys, setSelectedRowKeys] = useState<readonly string[]>([]);

<UPTable2<OrderRow>
  columns={columns}
  data={orders}
  defaultExpandedRowKeys={['order-1']}
  height={320}
  onSelectionChange={(_rows, keys) => setSelectedRowKeys(keys.map(String))}
  rowHeight={40}
  selectedRowKeys={selectedRowKeys}
  showHeader
/>
```

Document that `UPTable2` is separate from static `UPTable`, uses fixed row height, supports only fixed-left columns, keeps FlashList refs private, and treats pagination/remote fetching as application-owned.

- [ ] **Step 2: Add compatibility boundaries**

In `docs/compatibility.md`, document:

- source fields `key/title/fixed/type/sortable`, accepted `label` alias, and React `renderCell/renderHeader`;
- controlled/default selection, expansion, and current row props;
- recursive tree selection and callback/Promise lazy loading;
- numeric scroll events and private FlashList implementation;
- one-line native truncation in place of hover tooltip;
- fixed-left overlay synchronization and no fixed-right support;
- span arrays/objects, zero-cell hiding, and fixed-boundary warning;
- CSS classes and CSS sticky behavior retained as no-op-compatible props;
- no data mutation guarantee.

- [ ] **Step 3: Replace the deferred P34 gap row**

Replace the existing `u-table2` deferred row in `docs/gap-matrix.md` with a P34 row that names:

```text
UPTable2Props, UPTable2Column, renderCell, renderHeader, FlashList virtualization,
sort/filter events, recursive tree selection, callback/Promise lazy loading,
fixed-left overlay, fixed header, and spanMethod
```

Mark the status as `Emulated` and reference `tests/components/UPTable2.test.tsx` and `tests/components/UPTable2State.test.ts`.

- [ ] **Step 4: Add a compact example section**

In `example/App.tsx`, import `UPTable2` and add a small `demoTable2` dataset with:

- one fixed-left expandable customer column;
- one sortable numeric column;
- one selection column;
- one nested child row;
- controlled `selectedRowKeys`;
- `height={260}` and `rowHeight={40}`;
- visible text showing the selected key count.

Keep the existing static table example unchanged so both table families remain visible.

- [ ] **Step 5: Run documentation and package gates**

Run:

```text
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: the full suite, typecheck, lint, build, package dry-run, and whitespace check pass. Inspect the package dry-run output to confirm `src/components/table2` and its public types are included.

Commit:

```text
git add README.md docs/compatibility.md docs/gap-matrix.md example/App.tsx
git commit -m "docs: document table2 compatibility and example"
```

---

## Coverage Audit

The plan covers every approved P34 requirement:

- Public generic API and source-shaped callback payloads: Tasks 1, 3, 4, and 7.
- Immutable filter/sort/tree/selection/span view model: Task 1.
- FlashList virtualization with private implementation details: Task 3.
- Fixed row height, fixed header, and fixed-left synchronized overlay: Tasks 3 and 6.
- Controlled and uncontrolled selection, expansion, and current-row state: Tasks 4 and 6.
- Select-all and recursive tree selection: Task 4.
- Sorting, filtering, and callbacks: Task 5.
- Callback and Promise lazy children with retry/error behavior: Task 5.
- Row/column span arrays and objects, hidden coverage, and boundary warnings: Task 5.
- Global `UP.setConfig` defaults: Task 2.
- Public exports, example, README, compatibility notes, gap matrix, and quality gates: Tasks 2 and 7.
- No caller data, row, or key-array mutation: Tasks 1, 4, 5, and 6.

Type names, function names, test IDs, and config keys are fixed in the tasks above so implementation can proceed task-by-task without inventing neighboring interfaces.
