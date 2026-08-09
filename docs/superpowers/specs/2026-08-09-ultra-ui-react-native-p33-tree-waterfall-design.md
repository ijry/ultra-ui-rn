# Ultra UI React Native P33 Tree And Waterfall Design

## Goal

P33 adds the next data-display family:

- `UPTree`: a virtualized hierarchical tree with source-compatible expansion, current-node, checkbox, parent-child, half-checked, accordion, custom-render, and ref behavior.
- `UPWaterfall`: a virtualized masonry list with dynamic item heights, fixed or automatic column counts, add/remove/clear behavior, and scroll methods.

The components share the repository's `UP` configuration, controlled-state conventions, public export style, and test approach. They remain separate components with separate state machines.

## Approved Decisions

- The selected scope is `UPTree` plus `UPWaterfall`.
- `UPTree` implements the complete core interaction set rather than an MVP.
- `UPWaterfall` uses dynamic heights plus virtualization.
- A mature virtualization dependency is allowed.
- `@shopify/flash-list` is the internal virtualization and masonry engine.
- FlashList types and component instances are not exposed through the public `UPTree` or `UPWaterfall` API.
- The package will use `@shopify/flash-list` as a direct runtime dependency, initially `^2.3.2`.
- `UPTree` accepts arbitrary object nodes through configurable field names and preserves raw nodes in callbacks.
- `UPWaterfall` uses React `value` / `defaultValue` instead of Vue `v-model`, and per-item `renderItem` instead of a source column slot.
- Dynamic masonry is non-deterministic with respect to column placement after measurement. `columnIndex` is therefore not part of the public render payload.

## Dependency Boundary

`@shopify/flash-list` is a direct dependency because both new components require a reliable internal list engine and the package should not fail at module evaluation when a consumer uses either component.

The dependency is isolated behind component-local adapters:

- `UPTree` maps its flattened row model to a regular FlashList.
- `UPWaterfall` maps its item data to FlashList masonry.
- Public props use React Native and repository types, not FlashList-specific types.
- The Jest environment supplies a deterministic FlashList mock.
- Native smoke coverage verifies real masonry measurement in the example application.

The dependency is not a replacement for the public component contract. Consumers configure `UPTree` and `UPWaterfall` without importing FlashList.

## Scope

### In Scope

- Add `src/components/tree`.
- Add `src/components/waterfall`.
- Add `UPTree`, `UPTreeRef`, and public tree types.
- Add `UPWaterfall`, `UPWaterfallRef`, and public waterfall types.
- Add tree and waterfall defaults to `src/config/defaults.ts`.
- Add config override and merge support to `src/config/store.ts`.
- Export both component families from `src/components/index.ts`.
- Add focused unit and component tests.
- Add a deterministic FlashList Jest mock.
- Add compact examples to `example/App.tsx`.
- Update `README.md`, `docs/compatibility.md`, and `docs/gap-matrix.md`.
- Add the direct FlashList dependency and lockfile update.

### Out of Scope

- A second fallback virtualization engine.
- A custom native masonry implementation.
- A source-compatible column slot that receives the engine's internal column arrays.
- Cross-screen tree state persistence.
- Async child loading, pagination, or network-owned tree data.
- Dragging, sorting, or reordering tree nodes.
- Waterfall item animation beyond the behavior provided by FlashList and normal React updates.
- Image measurement or image caching inside `UPWaterfall`.
- App-owned navigation, network requests, or pagination state.

## Architecture

### `UPTree`

`UPTree` owns interaction state and derives a visible row list from the raw tree:

1. Resolve each node's key, label, children, and disabled state through `fieldNames`.
2. Build a normalized node index keyed by stable node key.
3. Build parent links and descendant lists for state propagation.
4. Flatten only nodes whose ancestors are expanded.
5. Pass the flattened rows to FlashList.
6. Wrap the rendered node content with component-owned expansion, checkbox, accessibility, and click controls.

The raw input data is never mutated. The component retains raw node references in the normalized index so callbacks and ref methods return the original objects.

### `UPWaterfall`

`UPWaterfall` owns the displayed data queue and delegates layout:

1. Normalize the incoming `value` or `defaultValue` into a stable internal list.
2. Resolve each item's stable id from `idKey`.
3. Reconcile external data changes with the internal add queue.
4. Add new items immediately or at `addTime` intervals.
5. Render the current list through FlashList with `masonry` enabled.
6. Calculate `columns="auto"` after the container width is measured.
7. Forward scrolling and end-reached callbacks without owning network or pagination behavior.

FlashList owns recycling, measurement, visible-range work, and masonry column assignment. `UPWaterfall` owns data identity, source-compatible mutation methods, and callback timing.

## `UPTree` API

### Types

```ts
export type UPKey = string | number;

export type UPTreeFieldNames = {
  nodeKey?: string;
  label?: string;
  children?: string;
  disabled?: string;
};

export type UPTreeRenderPayload<T> = {
  node: T;
  key: UPKey;
  label: string;
  level: number;
  expanded: boolean;
  checked: boolean;
  halfChecked: boolean;
  selected: boolean;
  disabled: boolean;
  hasChildren: boolean;
  toggle: () => void;
};
```

`T` is an arbitrary object node type. `fieldNames` defaults to:

```ts
{
  nodeKey: 'id',
  label: 'label',
  children: 'children',
  disabled: 'disabled',
}
```

An explicit top-level `nodeKey` takes precedence over `fieldNames.nodeKey` when both are supplied.

### Props

```ts
export type UPTreeProps<T extends object = Record<string, unknown>> = {
  data?: readonly T[];
  fieldNames?: UPTreeFieldNames;
  nodeKey?: string;
  showCheckbox?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: readonly UPKey[];
  expandedKeys?: readonly UPKey[];
  defaultCheckedKeys?: readonly UPKey[];
  checkedKeys?: readonly UPKey[];
  expandOnClickNode?: boolean;
  checkOnClickNode?: boolean;
  checkStrictly?: boolean;
  accordion?: boolean;
  highlightCurrent?: boolean;
  defaultCurrentNodeKey?: UPKey | null;
  currentNodeKey?: UPKey | null;
  indent?: number | string;
  iconSize?: number | string;
  checkboxSize?: number | string;
  height?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderNode?: (payload: UPTreeRenderPayload<T>) => React.ReactNode;
  onNodeClick?: (node: T) => void;
  onCheckChange?: (node: T, checked: boolean) => void;
  onCheck?: (node: T, state: UPTreeCheckState<T>) => void;
  onNodeExpand?: (node: T) => void;
  onNodeCollapse?: (node: T) => void;
  onCurrentChange?: (currentNode: T | null, oldCurrentNode: T | null) => void;
  onUpdateExpandedKeys?: (keys: readonly UPKey[]) => void;
  onUpdateCheckedKeys?: (keys: readonly UPKey[]) => void;
  onUpdateCurrentNodeKey?: (key: UPKey | null) => void;
};
```

`renderNode` replaces only the node content area. The tree keeps ownership of the expand control, checkbox, row press boundary, accessibility state, and indentation.

### Check State

```ts
export type UPTreeCheckState<T> = {
  checkedNodes: readonly T[];
  checkedKeys: readonly UPKey[];
  halfCheckedNodes: readonly T[];
  halfCheckedKeys: readonly UPKey[];
};
```

When `checkStrictly` is false:

- Checking a node checks all checkable descendants.
- Unchecking a node clears all checkable descendants.
- A parent is checked when all of its checkable descendants are checked.
- A parent is half-checked when at least one, but not all, checkable descendants are checked.
- Disabled descendants do not become actively toggled by a parent operation.

When `checkStrictly` is true, only the target node changes and half-checked propagation is disabled.

### Ref

```ts
export type UPTreeRef<T extends object = Record<string, unknown>> = {
  getCheckedNodes: (leafOnly?: boolean) => readonly T[];
  getCheckedKeys: (leafOnly?: boolean) => readonly UPKey[];
  getHalfCheckedNodes: () => readonly T[];
  getHalfCheckedKeys: () => readonly UPKey[];
  setCheckedKeys: (keys: readonly UPKey[], leafOnly?: boolean) => void;
  setChecked: (key: UPKey, checked: boolean, deep?: boolean) => void;
  setCurrentKey: (key: UPKey | null) => void;
  getCurrentKey: () => UPKey | null;
  getCurrentNode: () => T | null;
  scrollToKey: (key: UPKey, animated?: boolean) => boolean;
};
```

`scrollToKey` returns `false` when the node is missing or not currently visible because one of its ancestors is collapsed. It does not mutate controlled expansion state.

## `UPWaterfall` API

### Types

```ts
export type UPWaterfallRenderPayload<T> = {
  item: T;
  index: number;
  id: UPKey;
};

export type UPWaterfallRef<T = unknown> = {
  remove: (id: UPKey) => boolean;
  clear: () => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToTop: (animated?: boolean) => void;
  getData: () => readonly T[];
};
```

### Props

```ts
export type UPWaterfallProps<T = unknown> = {
  value?: readonly T[];
  defaultValue?: readonly T[];
  columns?: number | 'auto';
  columnsMin?: number;
  minColumnWidth?: number | string;
  addTime?: number;
  idKey?: string;
  optimizeItemArrangement?: boolean;
  estimatedItemSize?: number | string;
  height?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPWaterfallRenderPayload<T>) => React.ReactNode;
  empty?: React.ReactNode;
  onChange?: (value: readonly T[]) => void;
  onAfterAddOne?: (item: T, index: number) => void;
  onAfterAddAll?: () => void;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
};
```

`idKey` defaults to `id`. Primitive items use their index as a render fallback but do not provide reliable id-based removal.

The component maps `columns="auto"` to a measured numeric column count. The calculation uses the measured content width, `columnsMin`, and `minColumnWidth`; before the first measurement, it renders two columns.

### Ref Semantics

- `remove(id)` removes the matching item and returns `true`; missing ids return `false`.
- `clear()` removes all currently displayed items.
- `scrollToIndex()` and `scrollToTop()` delegate to the internal list ref.
- `getData()` returns the current internal display list.

## Controlled State And Data Flow

### Tree

- `defaultExpandedKeys`, `defaultCheckedKeys`, and `defaultCurrentNodeKey` initialize local state once.
- `expandedKeys`, `checkedKeys`, and `currentNodeKey` are controlled whenever supplied.
- Controlled interactions emit update callbacks but do not overwrite the controlled prop internally.
- When data changes, state keys for removed nodes are discarded from derived results.
- A stable node key is required for reliable controlled state and ref behavior.
- `accordion` normalizes local expansion changes so only one sibling under the same parent remains expanded.
- `expandOnClickNode` and `checkOnClickNode` affect row-content presses; arrow and checkbox controls remain independently actionable.
- Disabled nodes cannot be expanded or toggled, but node clicks remain observable through `onNodeClick`.

### Waterfall

- `value` is controlled and `defaultValue` initializes local state.
- New external items are reconciled by `idKey`.
- `addTime > 0` queues new items one at a time; `addTime=0` inserts the batch immediately.
- `onAfterAddOne` fires after an item enters the internal display list.
- `onAfterAddAll` fires once when the current add queue drains.
- `remove` and `clear` update the internal display list and emit `onChange`.
- A later external `value` update is authoritative and cancels queued items no longer present.
- Duplicate ids emit a development warning; the newest external record replaces the existing record with the same id.
- `optimizeItemArrangement` defaults to `false` so input order remains stable. When enabled, the internal FlashList masonry engine may alter visual placement to balance column heights.
- `renderItem` receives item, index, and stable id. It does not receive `columnIndex`.

## Error Handling And Compatibility

- During normalization, a missing tree key uses its deterministic path key. A duplicate tree key emits a development warning and uses a path-qualified internal key for indexing and rendering. Controlled state and ref calls using the duplicated original key are not guaranteed to target one unique node.
- Missing or duplicate waterfall ids emit a development warning.
- `scrollToKey` returns `false` for missing or collapsed targets.
- `remove` returns `false` for missing ids and does not throw.
- Invalid scroll indices are ignored by the ref adapter.
- An empty waterfall list renders `empty` when provided and otherwise renders no items.
- The package does not own network, pagination, or async child-loading behavior.
- FlashList is an implementation dependency. Consumers should use the new components without importing it directly.
- The source tree's Vue slot is represented by `renderNode`; the source waterfall column slot is intentionally represented by per-item `renderItem` because internal masonry columns are not stable public data.
- Source CSS classes remain accepted as `customClass` but have no React Native runtime effect.

## File Structure

Create:

- `src/components/tree/types.ts`
- `src/components/tree/state.ts`
- `src/components/tree/UPTree.tsx`
- `src/components/tree/index.ts`
- `src/components/waterfall/types.ts`
- `src/components/waterfall/state.ts`
- `src/components/waterfall/UPWaterfall.tsx`
- `src/components/waterfall/index.ts`
- `tests/components/UPTree.test.tsx`
- `tests/components/UPWaterfall.test.tsx`
- `tests/mocks/FlashList.tsx`

Update:

- `src/components/index.ts`
- `src/config/defaults.ts`
- `src/config/store.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `example/App.tsx`
- `docs/compatibility.md`
- `docs/gap-matrix.md`

## Testing

### Tree Tests

- Field-name mapping preserves raw node callbacks.
- Default expansion and `defaultExpandAll` produce the correct flattened rows.
- Expand, collapse, `expandOnClickNode`, and `accordion` behavior emit expected callbacks.
- Parent-child check propagation produces checked and half-checked keys.
- `checkStrictly` only changes the target node.
- Disabled nodes do not toggle.
- Current-node controlled and uncontrolled behavior emits the expected old and new nodes.
- Custom render payload contains level and all derived state.
- Ref methods read and mutate checked/current state.
- `scrollToKey` succeeds for visible nodes and returns false for missing/collapsed nodes.
- Global tree defaults merge through `UP.setConfig`.

### Waterfall Tests

- Data renders through `renderItem` with stable ids.
- Numeric columns map to FlashList `numColumns` and `masonry`.
- Automatic columns react to measured width.
- `addTime=0` inserts a batch and emits `onAfterAddAll`.
- Delayed additions emit one `onAfterAddOne` per item and one final `onAfterAddAll`.
- External updates cancel removed queued items.
- `remove`, `clear`, `getData`, and scroll refs behave correctly.
- Controlled `value` emits `onChange` without mutating the incoming array.
- Empty state, `onScroll`, `onEndReached`, and custom styles are forwarded.
- Global waterfall defaults merge through `UP.setConfig`.

### Validation Commands

Run:

- `npm test -- --runTestsByPath tests/components/UPTree.test.tsx tests/components/UPWaterfall.test.tsx`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm pack --dry-run`
- `git diff --check`

The example application must also receive a compact tree and waterfall demonstration so the dependency and native masonry path can be smoke-tested outside Jest.

## Documentation

Update:

- `README.md`
- `example/App.tsx`
- `docs/compatibility.md`
- `docs/gap-matrix.md`

Documentation must state:

- `UPTree` supports arbitrary object nodes through `fieldNames`.
- Tree controlled state requires stable unique keys.
- `UPWaterfall` uses dynamic masonry with FlashList and does not expose column indices.
- `value` and `onChange` are the React mapping for the source waterfall model.
- Removing or clearing waterfall data is ref-driven and still reports `onChange`.
- Network, pagination, async data loading, and item rendering remain application-owned.
- `customClass` is retained for source compatibility but has no React Native CSS runtime.

## Acceptance Criteria

- `UPTree` and `UPWaterfall` are exported from the package with their public types.
- Config defaults and `UP.setConfig({ props })` work for both components.
- FlashList is installed as a direct runtime dependency and the lockfile is synchronized.
- Tree expansion, selection, checkbox, half-check, controlled-state, and ref behavior pass focused tests.
- Waterfall masonry props, dynamic column calculation, add queue, mutation refs, controlled sync, and scroll behavior pass focused tests.
- Jest, typecheck, lint, build, pack, and diff checks pass.
- Example and compatibility documentation explain the new public contracts and their deliberate source-runtime boundaries.
