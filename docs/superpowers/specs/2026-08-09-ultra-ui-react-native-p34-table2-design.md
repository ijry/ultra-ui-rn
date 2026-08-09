# Ultra UI React Native P34 Table2 Design

**Date:** 2026-08-09

## Goal

Add `UPTable2`, a native React Native data-grid component that covers the
high-value and high-complexity behavior of upstream `u-table2`:

- virtualized rows
- sortable and filterable data
- row selection and select-all
- current-row highlighting
- tree rows and expansion
- callback- or Promise-based lazy children
- fixed left columns
- fixed header
- row and column span metadata
- source-compatible row, cell, header, and sorting callbacks

The component is separate from the existing static `UPTable` family. `UPTable`
continues to render arbitrary React children, while `UPTable2` owns structured
rows and columns.

## Decisions

- Use the existing `@shopify/flash-list` dependency. Do not add another native
  data-grid dependency.
- Use a generic React API with source-compatible column fields and
  React-specific render callbacks.
- Use fixed row height by default and as the virtualization contract.
- Support controlled and uncontrolled selection, expansion, and current-row
  state.
- Support only source-compatible fixed left columns and fixed headers. Right
  fixed columns are out of scope.
- Do not mutate `data`, row objects, or caller-owned selection arrays.
- Do not expose FlashList types or refs.
- Keep sorting, filtering, tree flattening, and span calculation in pure
  helpers where possible.

## Architecture

`UPTable2` converts incoming rows into an internal immutable view model:

```text
data
  -> stable row key normalization
  -> filter
  -> sort
  -> visible tree flattening
  -> selection/current/expand state derivation
  -> cell span metadata
  -> virtualized grid rendering
```

The renderer has two synchronized planes:

1. The main plane renders all columns through a FlashList and owns horizontal
   scrolling for non-fixed columns.
2. The fixed plane renders only columns with `fixed: 'left'` and shares the
   same visible row model. It follows the main plane's vertical offset through
   guarded imperative scroll synchronization.

The header uses the same split. The scrollable header follows the main
horizontal offset, while the fixed header remains above the fixed body. A
single scroll synchronization guard prevents feedback loops between the main
and fixed lists.

Rows have stable dimensions derived from `rowHeight`. Column widths are
measured or resolved from explicit dimensions. The fixed plane width is the sum
of fixed column widths, and the main plane content width is the sum of all
column widths.

## Public Types

The public API uses repository dimensions and generic row types. FlashList
types are intentionally private.

```ts
export type UPTable2Column<T = unknown> = {
  key: string;
  title?: React.ReactNode;
  /** Compatibility alias for consumers using label-based column metadata. */
  label?: React.ReactNode;
  width?: UPDimension;
  fixed?: 'left';
  type?: 'default' | 'selection' | 'expand';
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortBy?: string | readonly string[] | ((row: T) => unknown);
  sortOrders?: readonly ('ascending' | 'descending')[];
  showOverflowTooltip?: boolean;
  renderHeader?: (payload: UPTable2HeaderPayload<T>) => React.ReactNode;
  renderCell?: (payload: UPTable2CellPayload<T>) => React.ReactNode;
};

export type UPTable2HeaderPayload<T = unknown> = {
  column: UPTable2Column<T>;
  columnIndex: number;
  sortOrder: 'ascending' | 'descending' | null;
  context: unknown;
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
  order: 'ascending' | 'descending';
  column: UPTable2Column<T>;
};
```

`UPTable2Props<T>` includes:

- `data?: readonly T[]`
- `columns?: readonly UPTable2Column<T>[]`
- `rowKey?: string`
- `stripe?: boolean`
- `border?: boolean`
- `height?: UPDimension`
- `maxHeight?: UPDimension`
- `rowHeight?: UPDimension`
- `showHeader?: boolean`
- `fixedHeader?: boolean`
- `highlightCurrentRow?: boolean`
- `currentRowKey?: UPKey | null`
- `defaultCurrentRowKey?: UPKey | null`
- `selectedRowKeys?: readonly UPKey[]`
- `defaultSelectedRowKeys?: readonly UPKey[]`
- `expandedRowKeys?: readonly UPKey[]`
- `defaultExpandedRowKeys?: readonly UPKey[]`
- `defaultExpandAll?: boolean`
- `treeProps?: { children?: string; hasChildren?: string }`
- `lazy?: boolean`
- `load?: (row: T, payload: UPTable2LoadPayload<T>, resolve: (children: readonly T[]) => void) => void | Promise<readonly T[]>`
- `sortable?: boolean | 'custom'`
- `multiSort?: boolean`
- `sortOrders?: readonly ('ascending' | 'descending')[]`
- `sortBy?: string | readonly string[] | ((row: T) => unknown)`
- `sortMethod?: (a: T, b: T, field: string, context: unknown) => number`
- `filters?: Readonly<Record<string, unknown>>`
- `showOverflowTooltip?: boolean`
- `emptyText?: React.ReactNode`
- `context?: unknown`
- `mainCol?: string`
- `expandWidth?: UPDimension`
- `rowStyle?: ViewStyle | ((payload: UPTable2RowPayload<T>) => ViewStyle | undefined)`
- `cellStyle?: (payload: UPTable2CellPayload<T>) => ViewStyle | undefined`
- `rowClassName?: string | ((payload: UPTable2RowPayload<T>) => string | undefined)`
- `cellClassName?: string | ((payload: UPTable2CellPayload<T>) => string | undefined)`
- `headerCellClassName?: string | ((payload: UPTable2HeaderPayload<T>) => string | undefined)`
- `spanMethod?: (payload: UPTable2SpanPayload<T>) => [number?, number?] | { rowspan?: number; colspan?: number } | undefined`
- `customStyle?: StyleProp<ViewStyle>`
- `customClass?: string`
- `renderCell` and `renderHeader` column callbacks
- source-shaped events described below

Defaults preserve the upstream component where practical: `rowKey` is `id`,
`treeProps.children` is `children`, `treeProps.hasChildren` is `hasChildren`,
`rowHeight` is `36`, `showHeader` is `true`, and `fixedHeader` is `true`.

`title` is the primary source-compatible header field. `label` is accepted as
an alias. When both are present, `title` wins.

## State And Data Flow

The component maintains local state only when the corresponding controlled
prop is absent:

- `selectedRowKeys` controls selection; otherwise
  `defaultSelectedRowKeys` initializes local selection.
- `expandedRowKeys` controls tree expansion; otherwise
  `defaultExpandedRowKeys` initializes local expansion.
- `currentRowKey` controls the highlighted row; otherwise
  `defaultCurrentRowKey` initializes local current-row state, which begins
  unset when neither prop is provided.

External controlled prop changes replace the related local view immediately.
Selection is key-based internally and resolves rows from the current view model
for callbacks. Parent selection selects or deselects descendants recursively,
matching the upstream behavior.

The component never sorts or filters the caller's array in place. Every
derived collection is a new array. Tree rows are flattened depth-first in
visible order. Each flattened row retains:

- the original row object
- its parent row
- its source row index
- its depth level
- its stable key
- its expanded and selected state

Filtering occurs before sorting and tree flattening. Sorting is stable and
supports single or multiple conditions. A column-level `sortBy` overrides the
table-level `sortBy`; `sortMethod` receives the original rows and context.

## Events

React callbacks preserve source payloads while exposing keys where React state
management benefits from them:

- `onSelect(row, selectedRows, selectedRowKeys)`
- `onSelectAll(selectedRows, selectedRowKeys)`
- `onSelectionChange(selectedRows, selectedRowKeys)`
- `onCellClick(payload)`
- `onRowClick(row, payload)`
- `onRowDoubleClick(row, payload)`
- `onHeaderClick(column, columnIndex)`
- `onSortChange(conditions)`
- `onFilterChange(filters)`
- `onCurrentChange(currentRow, previousRow)`
- `onExpandChange(expandedRowKeys, row)`
- `onLoadError(error, row)`

`onSelectionChange` is emitted after the local state transition in
uncontrolled mode and after the derived selection is calculated in controlled
mode. The callback always receives the current selection as a new array.

## Tree And Lazy Loading

Rows are considered expandable when they contain an array at
`treeProps.children` or a truthy `treeProps.hasChildren` marker.

Expanding a lazy row calls `load` exactly once until it resolves or rejects.
The loader receives the row, level, expanded state, and context. A callback
loader calls `resolve(children)`. A Promise loader returns the child array.
Loaded children are stored in the component's internal immutable view model;
the input row object is not mutated.

Rejected loads clear the loading marker, leave the row expanded, preserve
existing children, and call `onLoadError`. A subsequent explicit collapse and
re-expand may retry the load.

## Rendering And Spans

Default cells render `row[column.key]` as native text. A column `renderCell`
replaces that output and receives the full row/column/tree context.
`renderHeader` replaces the default title and sort indicator.

Selection and expansion columns are built-in. The tree expansion control is
rendered inside `mainCol`; if `mainCol` is absent, the first non-special column
is used.

`spanMethod` supports both upstream return forms:

- `[rowspan, colspan]`
- `{ rowspan, colspan }`

Missing values default to `1`. A zero span hides a covered cell. A positive
row span multiplies the fixed row height and a positive column span expands
the cell width across adjacent columns.

Span metadata is calculated once per derived row/column view and reused by the
main and fixed planes. A span that crosses the fixed-column boundary is split
between planes and emits a development warning because native overlay layers
cannot create one continuous cell across their boundary.

## Fixed Columns And Scrolling

Only `fixed: 'left'` is supported. Fixed columns are rendered in a sibling
overlay with a measured width and elevated z-order. The overlay uses the same
row keys, row height, selection state, expansion state, and span metadata as
the main plane.

The main body is the vertical scroll source. The fixed body follows its
vertical offset with guarded `scrollToOffset` calls. Horizontal scrolling is
owned by the main plane and is mirrored to the scrollable header. The fixed
header remains horizontally static.

The public component exposes numeric `onScroll` events but does not expose
FlashList or native scroll refs.

## Compatibility Boundaries

- Fixed row height is required for virtualized rendering.
- Fixed right columns are deferred.
- Hover tooltips are replaced by one-line truncation or application-owned
  renderers.
- CSS class names and CSS sticky behavior are retained as no-op-compatible
  props.
- Pagination and remote data fetching remain application-owned.
- `context` is passed through callbacks but has no implicit global provider.
- Row keys must be stable and unique. Missing or duplicate keys use deterministic
  index fallbacks and emit development warnings.
- Unknown column keys render an empty value rather than throwing.
- FlashList implementation details remain private.

## Testing

Add pure helper tests for:

- stable row-key resolution
- filter and stable single/multi-sort
- tree flattening and default expansion
- recursive selection
- lazy-load state transitions
- span normalization and coverage

Add component tests for:

- hybrid column definitions and custom cell/header rendering
- fixed row/header props and empty state
- controlled and uncontrolled selection, expansion, and current row
- select-all and recursive tree selection
- sorting/filter callbacks and source payloads
- lazy loading through callback and Promise forms
- fixed-column synchronization hooks
- span rendering and development boundary warnings
- global `UP.setConfig` table2 defaults

Run the repository quality gates:

```text
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

## Documentation And Example

Update:

- `README.md` with the hybrid `UPTable2` API and controlled state example
- `docs/compatibility.md` with data-grid behavior and platform boundaries
- `docs/gap-matrix.md` with a P34 `u-table2` row
- `example/App.tsx` with a compact sortable/tree/selectable table example

The example should use explicit fixed row heights and a small dataset so
selection, sorting, tree expansion, fixed columns, and span behavior can be
smoke-tested without a network service.

## Acceptance Criteria

`UPTable2` is complete when:

1. It is exported from the public package with generic public types.
2. It renders the structured source-compatible data grid through FlashList.
3. Controlled/uncontrolled selection, expansion, and current-row behavior is
   covered by tests.
4. Sorting, filtering, tree flattening, lazy loading, fixed left columns,
   fixed header, and span metadata are implemented or explicitly reported by
   the documented boundaries above.
5. The component does not mutate caller data.
6. Focused and full test suites, typecheck, lint, build, package, and diff
   checks pass.
