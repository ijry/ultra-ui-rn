# Ultra UI React Native P35 Table2 Source Compatibility Design

**Date:** 2026-08-11

## Goal

P35 closes verified compatibility gaps between the React Native `UPTable2`
port and the source uni-app/uview-plus `u-table2` contract tracked by this
repository.

The primary requirement is source compatibility. P35 must not add React
Native-only table features, invent new source semantics, or change the public
behavior already shipped in P34.

The compatibility baseline remains `uview-plus` 3.8.86. `UPTable2` keeps its
React Native name, while its structured column fields, state behavior, event
ordering, and callback payloads remain source-shaped where the platform allows.

## Scope

### Included

P35 includes only behavior that satisfies both conditions:

1. It is defined by the source `u-table2` API or behavior.
2. P34 does not already implement it correctly.

The implementation work is therefore:

- Freeze a source-to-RN compatibility matrix before changing implementation.
- Correct the source-named `expandRowKeys` controlled prop where P34 currently
  exposes only `expandedRowKeys`.
- Add the source-named column `style` field using the repository's native style
  type and apply it where the source applies column style.
- Correct selection callback ordering so `selection-change` is dispatched
  before `select`, matching the source implementation.
- Preserve and regression-test the existing sorting, filtering, selection,
  tree, lazy-loading, span, fixed-left, and fixed-header behavior because the
  source audit found these already covered by P34.
- Document every platform boundary that cannot be represented directly in
  React Native.

Existing React Native callbacks `renderCell` and `renderHeader` remain as the
platform adapter for Vue slots. They are retained for backward compatibility
and are not expanded into a new RN-specific table API.

### Excluded

P35 does not introduce any of the following:

- fixed-right columns;
- dynamic row-height virtualization;
- half-selected or `checkStrictly` table state;
- pagination or remote-query contracts;
- internal network requests, caching, or data fetching;
- column drag-reordering or drag-resizing;
- exposed FlashList or native scroll refs;
- new RN-only aliases such as `prop`;
- replacement of the P34 grid renderer with a different data-grid dependency.

If source verification later identifies one of these as a required source
behavior, it must be handled by a separately approved scope change rather than
silently added to P35.

Pagination, remote fetching, and application-owned query state remain outside
`UPTable2`, as documented by P34.

## Compatibility Rules

P35 follows these rules in order:

1. The source API and source behavior are authoritative.
2. Existing P34 public props and callbacks remain source-compatible and
   backward-compatible.
3. New public fields may be added only when the source API contains the field.
4. New fields use the source field name and source value shape.
5. A Vue slot is mapped to an existing React render callback only where the
   native platform requires a rendering replacement.
6. A source behavior that has no direct React Native equivalent is retained as
   a typed boundary or documented no-op, rather than replaced with a new
   semantic.
7. The component never mutates caller-owned rows, nested child arrays, data
   arrays, or key arrays.

The source compatibility matrix is a required P35 artifact. Every row must
identify:

| Source item | Current P34 behavior | P35 action | RN boundary |
|---|---|---|---|
| Property or event name | Supported, partial, or missing | Keep, correct, or add | Native mapping or no-op |

No implementation change begins for a property or event that is not present in
the frozen matrix.

## Architecture

P35 keeps the P34 component architecture:

1. Normalize source-shaped columns and row keys.
2. Derive filtered rows.
3. Derive sorted rows using source sort semantics.
4. Build the immutable tree model.
5. Derive expanded and selected visible rows.
6. Calculate source-compatible span metadata.
7. Render the existing main FlashList plane.
8. Render the existing fixed-left overlay plane.
9. Emit source-shaped callbacks in the documented order.

The component continues to use the existing `@shopify/flash-list`
dependency. FlashList types and refs remain private.

The state helpers remain pure where possible. `UPTable2.tsx` coordinates
controlled and uncontrolled state, rendering, native scrolling, and callback
dispatch. P35 should prefer extending the existing state helpers over adding a
second table state model.

## Public API

P35 does not redesign `UPTable2Props` or `UPTable2Column`.

The existing P34 surface remains stable:

- `key`, `title`, `label`, `fixed`, `type`, and `sortable` column fields;
- controlled and default selection, expansion, and current-row keys;
- `filters`, sorting options, tree props, lazy loading, and `spanMethod`;
- `renderCell` and `renderHeader` as React slot adapters;
- existing selection, current-row, expansion, sorting, filtering, loading, row,
  cell, header, and scroll callbacks.

If the compatibility matrix identifies a missing source property or event,
P35 adds it with the source name and source-shaped payload. The design does not
pre-approve any additional alias or RN-only callback.

The following existing P34 boundaries remain explicit:

- `fixed: 'left'` is the supported fixed-column mode;
- `rowHeight` remains the virtualization contract;
- pagination and remote fetching are application-owned;
- CSS classes, hover behavior, CSS sticky behavior, and browser tooltips are
  not treated as native table semantics;
- FlashList implementation details are private.

## State And Data Flow

P35 preserves the P34 controlled-state model:

- A controlled prop is the source of truth for that state.
- A default prop initializes local state only when the controlled prop is absent.
- Parent updates replace the corresponding derived view immediately.
- Derived arrays and callback payload arrays are newly allocated.

The derived data flow is:

```text
source data and source-shaped props
  -> normalized rows and columns
  -> source filter semantics
  -> source sort semantics
  -> immutable tree model
  -> expanded visible rows
  -> selected visible rows
  -> source span metadata
  -> main and fixed-left planes
```

P35 must explicitly preserve the following already-covered behavior instead of
assuming that similar React behavior is source-compatible:

- source `sortMethod` comparator precedence and stable ordering;
- source contains-style `filters` derivation without adding filter UI;
- callback ordering for selection, select-all, expansion, sorting, and lazy
  loading;
- whether tree selection includes loaded descendants and how hidden descendants
  are reported;
- retry and error behavior for callback and Promise lazy loading;
- zero-span coverage and positive row/column span normalization.

## Error Handling And Boundaries

P35 retains the P34 error policy:

- Lazy-load failures clear the loading marker and call `onLoadError` when
  supplied.
- Missing or duplicate row keys use deterministic internal fallbacks and emit
  development warnings.
- Unknown column values render as empty content rather than throwing.
- Unsupported CSS or browser-only behavior does not affect native layout.
- No network or pagination error is created because those operations remain
  application-owned.

When the source API has a behavior that cannot be represented in React Native,
the implementation must choose one of:

1. Preserve the source prop and document it as a no-op boundary.
2. Map it to an existing native behavior without changing its callback
   contract.
3. Mark it deferred when implementing it would require a new non-source API or
   violate the fixed P34 architecture.

The implementation must not silently reinterpret a source prop as a new RN
feature.

## Testing

### Compatibility Matrix Tests

Add a focused compatibility fixture that verifies:

- source-shaped column fields and defaults;
- source-shaped sort and filter values;
- source callback names and argument order;
- controlled and uncontrolled state precedence;
- source empty and loading behavior;
- retained no-op and deferred boundaries.

### Pure State Tests

Keep `UPTable2State.test.ts` as the regression suite for the already-covered
source behavior:

- row-key normalization;
- filter semantics;
- stable single and multi-sort;
- `sortMethod` comparator behavior;
- tree flattening and expansion;
- recursive selection of loaded descendants;
- lazy-load completion, rejection, and retry;
- span array/object normalization and coverage.

### Component Tests

Extend `UPTable2.test.tsx` for the P35 corrections and regressions:

- `expandRowKeys` controlled alias behavior;
- source column `style` application;
- selection callback order;
- existing source-compatible header/cell rendering;
- current-row, expansion, sort/filter, lazy-loading, fixed-plane, span, and
  immutability regressions.

No test should be added for excluded RN-only features.

## Documentation

Update only the compatibility documentation required by verified changes:

- `README.md`: describe the final P35 source-compatible surface and unchanged
  RN boundaries.
- `docs/compatibility.md`: update the `UPTable2` behavior paragraph.
- `docs/gap-matrix.md`: update the `u-table2` row with source-verified status.
- Add a source compatibility matrix or include the finalized matrix in the P35
  specification and implementation documentation.

The example must continue to use the existing source-shaped table API. It must
not demonstrate excluded RN-only props.

## Acceptance Criteria

P35 is complete when:

1. The source compatibility matrix is frozen and has no unresolved
   contradictions.
2. Every implementation change maps to a source property, event, or behavior
   in that matrix.
3. No excluded RN-only feature or public API is introduced.
4. Existing P34 tests continue to pass without changing their intended
   contract.
5. New source behavior is covered by focused state and component tests.
6. Caller-owned data and key arrays remain immutable.
7. Compatibility and platform boundaries are documented.
8. The following commands pass:

```text
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```
