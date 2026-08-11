# P35 Table2 Source Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close only the verified `u-table2` source-compatibility gaps left by P34 while preserving the existing `UPTable2` public API and React Native boundaries.

**Architecture:** Keep the P34 FlashList-backed table, immutable tree model, fixed-left overlay, fixed header, and fixed-row-height virtualization contract. First freeze an official `uview-plus` 3.8.86 compatibility matrix, then change only the existing state helpers, types/defaults, and component event dispatch that the matrix identifies as incomplete.

**Tech Stack:** TypeScript, React Native, `@shopify/flash-list`, Jest, `@testing-library/react-native`, ESLint, React Native Builder Bob.

## Global Constraints

- Source compatibility is tracked against `uview-plus` 3.8.86.
- The source API and source behavior are authoritative.
- P35 must not add React Native-only table features or invent new source semantics.
- Existing P34 public props and callbacks remain backward-compatible.
- `renderCell` and `renderHeader` remain the only React slot adapters; do not add a second RN-specific rendering API.
- `fixed: 'left'` remains the supported fixed-column mode.
- `rowHeight` remains the virtualization contract.
- Pagination, remote fetching, network requests, and application-owned query state remain outside `UPTable2`.
- FlashList implementation details and native refs remain private.
- The component must not mutate caller-owned rows, nested child arrays, data arrays, or key arrays.
- Do not add a new native data-grid dependency.
- Every implementation change must map to a row in the frozen source compatibility matrix.

## File Map

- Create: `docs/table2-source-compatibility.md` - frozen source-to-RN property, event, default, slot, and boundary matrix.
- Modify: `src/components/table2/types.ts` - only source-verified public type corrections or additions.
- Modify: `src/components/table2/state.ts` - pure source behavior corrections for filtering, sorting, tree state, lazy loading, selection, or spans.
- Modify: `src/components/table2/UPTable2.tsx` - source-verified event ordering, controlled-state dispatch, rendering, or native adapter corrections.
- Modify: `src/config/defaults.ts` - only source-verified `table2` default corrections.
- Modify: `tests/components/UPTable2State.test.ts` - pure compatibility regression tests.
- Modify: `tests/components/UPTable2.test.tsx` - component, callback, rendering, and synchronization tests.
- Modify: `README.md` - final source-compatible public surface and unchanged RN boundaries.
- Modify: `docs/compatibility.md` - detailed `UPTable2` behavior and platform boundaries.
- Modify: `docs/gap-matrix.md` - final `u-table2` status and source-verified gaps.
- Modify: `example/App.tsx` - only when a source-verified behavior needs a visible example.

---

### Task 1: Freeze The Source Compatibility Matrix

**Files:**
- Create: `docs/table2-source-compatibility.md`
- Read: `docs/superpowers/specs/2026-08-11-ultra-ui-react-native-p35-table2-source-compatibility-design.md`
- Read: `src/components/table2/types.ts`
- Read: `src/components/table2/state.ts`
- Read: `src/components/table2/UPTable2.tsx`
- Read: `tests/components/UPTable2.test.tsx`
- Read: `tests/components/UPTable2State.test.ts`

**Interfaces:**
- Consumes: official `uview-plus` 3.8.86 `u-table2` docs/source and the current P34 implementation.
- Produces: a frozen matrix with exact source names, value shapes, defaults, event payloads, event order, current P34 status, P35 action, and RN boundary.

- [ ] **Step 1: Obtain the pinned source package without changing repository dependencies**

Run in PowerShell:

```powershell
$sourceDir = Join-Path $env:TEMP 'uview-plus-3.8.86-p35'
New-Item -ItemType Directory -Force $sourceDir | Out-Null
npm pack uview-plus@3.8.86 --pack-destination $sourceDir
$archive = Get-ChildItem $sourceDir -Filter 'uview-plus-3.8.86.tgz' | Select-Object -First 1
$extractDir = Join-Path $env:TEMP 'uview-plus-3.8.86-p35-extracted'
New-Item -ItemType Directory -Force $extractDir | Out-Null
tar -xf $archive.FullName -C $extractDir
Get-ChildItem $extractDir -Recurse -Filter '*table2*'
```

Extract the generated tarball into a second temporary directory and inspect
the `u-table2` documentation, component implementation, type declarations, and
default configuration. Do not add `uview-plus` to this repository's
`package.json` or lockfile.

- [ ] **Step 2: Record the exact source contract**

Create `docs/table2-source-compatibility.md` with one row for every source
table property, column property, default, slot, event, and exposed behavior.
Use this table shape:

```markdown
| Source item | Source shape/default | P34 RN shape | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
```

Record event argument order and whether the source event is emitted before or
after the related state transition. Record source behavior as `Supported`,
`Partial`, `Missing`, `No-op boundary`, or `Deferred`.

- [ ] **Step 3: Freeze the P35 change set**

Mark only source items that are both source-defined and incorrect or missing in
P34 as `P35 action`. Explicitly mark fixed-right columns, dynamic row-height
virtualization, half-selection additions, pagination/remote-query APIs,
column drag behavior, and exposed native refs as outside this P35 plan.

- [ ] **Step 4: Validate the matrix**

Run:

```powershell
rg -n -i "TBD|TODO|unknown|later" docs/table2-source-compatibility.md
git diff --check -- docs/table2-source-compatibility.md
```

Expected: no placeholder terms and no whitespace errors. Every P35 action must
name an existing source field, event, default, or behavior.

- [ ] **Step 5: Commit the matrix**

```powershell
git add docs/table2-source-compatibility.md
git commit -m "docs: freeze table2 source compatibility matrix"
```

---

### Task 2: Align Pure Table2 State Semantics

**Files:**
- Modify: `src/components/table2/state.ts`
- Modify: `tests/components/UPTable2State.test.ts`
- Read: `docs/table2-source-compatibility.md`

**Interfaces:**
- Consumes: the frozen matrix rows marked `P35 action` for pure state behavior.
- Produces: source-compatible behavior through the existing helpers
  `filterTable2Rows`, `sortTable2Rows`, `normalizeTable2Tree`,
  `flattenTable2Rows`, `toggleTable2Selection`, `normalizeTable2Span`, and
  `buildTable2SpanMap`.

- [ ] **Step 1: Add failing tests for each pure-state matrix row**

Add focused tests to `tests/components/UPTable2State.test.ts`. The tests must
cover only matrix rows marked `P35 action`, and must include:

```ts
it('matches the source filter value semantics', () => {
  const rows = [
    { id: 'a', name: 'Ada' },
    { id: 'b', name: 'Bea' },
  ];
  const result = filterTable2Rows(
    rows,
    { name: 'Ad' },
  );
  expect(result).toEqual([{ id: 'a', name: 'Ada' }]);
  expect(rows).toEqual([
    { id: 'a', name: 'Ada' },
    { id: 'b', name: 'Bea' },
  ]);
});

it('matches source custom-sort behavior', () => {
  const columns = [{ key: 'score', title: 'Score' }] as const;
  const rows = [
    { id: 'a', score: 2 },
    { id: 'b', score: 1 },
  ];
  const result = sortTable2Rows(
    rows,
    columns,
    [{ field: 'score', order: 'ascending', column: columns[0] }],
    undefined,
    (left, right) => left.score - right.score,
    undefined,
  );
  expect(result.map((row) => row.id)).toEqual(['b', 'a']);
});
```

Adjust the concrete values only when the frozen matrix records different
source semantics. Add immutability assertions for every helper that receives
caller-owned arrays or nested children.

- [ ] **Step 2: Run the focused state tests and verify the failures**

Run:

```powershell
npx jest tests/components/UPTable2State.test.ts --runInBand
```

Expected: the new tests fail only on the source behaviors identified by the
matrix; all existing P34 state tests continue to pass.

- [ ] **Step 3: Implement the smallest pure-helper corrections**

Update `state.ts` without changing helper names or adding a second state model.
Keep these invariants:

- filtering and sorting return new arrays;
- sorting remains stable;
- tree normalization never writes into source rows or child arrays;
- selection keys are derived immutably;
- span zero values hide covered cells;
- unknown values do not throw.

Implement no behavior that is not represented by a matrix row.

- [ ] **Step 4: Run the focused state tests**

Run:

```powershell
npx jest tests/components/UPTable2State.test.ts --runInBand
```

Expected: all state tests pass.

- [ ] **Step 5: Commit the pure-state change**

```powershell
git add src/components/table2/state.ts tests/components/UPTable2State.test.ts
git commit -m "fix: align table2 source state semantics"
```

---

### Task 3: Align Source Types And Defaults

**Files:**
- Modify: `src/components/table2/types.ts`
- Modify: `src/config/defaults.ts`
- Modify: `tests/components/UPTable2.test.tsx`
- Read: `docs/table2-source-compatibility.md`

**Interfaces:**
- Consumes: source property/default rows marked `P35 action`.
- Produces: public TypeScript types and `UP.setConfig({ props: { table2 } })` defaults matching the pinned source contract.

- [ ] **Step 1: Add failing type/default coverage**

Add component tests that mount `UPTable2` through `UPRoot` and verify every
matrix row marked as a type or default correction. Cover:

- source default values;
- source column value shapes;
- source event callback props;
- retained P34 controlled/default precedence.

Use the existing public import path from `../../src` and do not introduce a
private test-only type.

- [ ] **Step 2: Run the focused component tests**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: new assertions fail only for source-verified type/default gaps.

- [ ] **Step 3: Apply only matrix-approved type/default changes**

Update `types.ts` with exact source names and value shapes. Update the
`table2` default object in `defaults.ts` only where the matrix records a
source default mismatch. Preserve the existing `renderCell` and
`renderHeader` adapter callbacks and all P34 props.

Do not add `prop`, `fixed: 'right'`, dynamic-height callbacks, half-selection
props, remote-query props, or other excluded fields.

- [ ] **Step 4: Run focused type and component checks**

Run:

```powershell
npx tsc --noEmit
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: typecheck and all focused component tests pass.

- [ ] **Step 5: Commit the public contract change**

```powershell
git add src/components/table2/types.ts src/config/defaults.ts tests/components/UPTable2.test.tsx
git commit -m "fix: align table2 source types and defaults"
```

---

### Task 4: Align Table2 Component Events And Rendering

**Files:**
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `tests/components/UPTable2.test.tsx`
- Read: `docs/table2-source-compatibility.md`
- Read: `src/components/table2/state.ts`

**Interfaces:**
- Consumes: corrected pure helpers from Task 2 and source types/defaults from Task 3.
- Produces: source-compatible component event dispatch and rendering through the existing `UPTable2` export.

- [ ] **Step 1: Add failing event-order and payload tests**

Add focused tests for every event row marked `P35 action`. Each test must
assert the complete callback payload and callback order, not only that a
callback was called. Cover:

- header sort interaction and custom-sort behavior;
- controlled filter changes;
- row selection and select-all;
- current-row changes;
- tree expansion and lazy loading;
- `spanMethod` rendering and covered-cell hiding;
- existing fixed-left vertical synchronization.

Use an ordered event array in tests:

```ts
const events: string[] = [];
const onSelect = jest.fn(() => events.push('select'));
const onSelectionChange = jest.fn(() => events.push('selection-change'));
```

Assert the exact sequence recorded by the source matrix.

- [ ] **Step 2: Run the focused component tests and verify failures**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: new tests fail only for the source behavior rows assigned to this
task; existing P34 tests remain green.

- [ ] **Step 3: Implement minimal component corrections**

Update only the existing handlers and render paths:

- `handleHeaderPress`;
- `selectRow`;
- `selectAll`;
- `toggleExpanded`;
- `loadChildren`;
- `renderHeader`;
- `renderRow`;
- `onMainListScroll`.

Preserve controlled/uncontrolled precedence, immutable inputs, private refs,
fixed-left overlay synchronization, and fixed row heights. Do not add a new
public RN-only callback or layout mode.

- [ ] **Step 4: Run focused tests and lint**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts --runInBand
npx eslint "src/components/table2/**/*.{ts,tsx}" "tests/components/UPTable2*.{ts,tsx}"
```

Expected: all focused tests and the scoped lint command pass.

- [ ] **Step 5: Commit the component change**

```powershell
git add src/components/table2/UPTable2.tsx tests/components/UPTable2.test.tsx tests/components/UPTable2State.test.ts
git commit -m "fix: align table2 source events and rendering"
```

---

### Task 5: Update Compatibility Documentation And Example

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx` only when a source-verified behavior needs an example
- Modify: `docs/table2-source-compatibility.md`

**Interfaces:**
- Consumes: the frozen matrix and the final behavior from Tasks 2-4.
- Produces: user-facing documentation that distinguishes source compatibility from unavoidable React Native platform boundaries.

- [ ] **Step 1: Add documentation assertions to the matrix**

Update each matrix row marked `P35 action` with:

- the final source field/event name;
- the final RN prop/callback shape;
- the implementation test file;
- the final boundary status.

Remove any row whose source verification did not confirm it. Do not leave
unresolved or speculative compatibility claims.

- [ ] **Step 2: Update the README**

Keep the existing `UPTable2` example source-shaped. Document:

- supported source fields and callbacks;
- controlled/default state behavior;
- fixed-left and fixed-row-height boundaries;
- the fact that pagination and remote fetching belong to the host;
- `renderCell` and `renderHeader` as RN slot adapters.

Do not document excluded properties as available.

- [ ] **Step 3: Update the compatibility documents**

Update `docs/compatibility.md` and `docs/gap-matrix.md` so their `u-table2`
rows match the matrix exactly. Use `Supported`, `Emulated`, `No-op retained`,
or `Deferred` consistently with the repository's existing terminology.

- [ ] **Step 4: Update the example only if required**

If the matrix contains a source behavior that cannot be demonstrated by the
current example, add the smallest source-shaped example using existing public
props. Do not add a demo for fixed-right columns, dynamic row height,
half-selection, remote-query props, or other excluded behavior.

- [ ] **Step 5: Verify documentation consistency**

Run:

```powershell
rg -n -i "fixed-right|dynamic row|half-selected|checkStrictly|remote-query|prop=" README.md docs example/App.tsx
git diff --check
```

Expected: any matches are exclusion/boundary statements only, not advertised
supported API.

- [ ] **Step 6: Commit the documentation**

```powershell
git add README.md docs/compatibility.md docs/gap-matrix.md docs/table2-source-compatibility.md example/App.tsx
git commit -m "docs: finalize table2 source compatibility"
```

---

### Task 6: Run Full Quality Gates And Review The Diff

**Files:**
- Read: all files changed by Tasks 1-5

**Interfaces:**
- Consumes: the complete P35 implementation and documentation.
- Produces: a clean, verified P35 change set with no unsupported API additions.

- [ ] **Step 1: Run the complete test suite**

Run:

```powershell
npm test
```

Expected: all repository test suites pass, including the P34 table2 tests.

- [ ] **Step 2: Run static checks and package validation**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: every command exits successfully and the package contains the
intended source, build, type, and documentation files only.

- [ ] **Step 3: Review the public API diff**

Run:

```powershell
git diff HEAD~5..HEAD -- src/components/table2 src/config/defaults.ts README.md docs example/App.tsx
rg -n "fixed: 'right'|estimatedRowHeight|checkStrictly|halfSelected|onQueryChange|remote" src README.md docs example
```

Confirm that no excluded API appears as an implemented or advertised feature.
Any remaining match must be an explicit exclusion or compatibility boundary.

- [ ] **Step 4: Review source matrix coverage**

For every matrix row marked `P35 action`, identify:

- the implementation file;
- the focused test;
- the documentation entry.

For every changed implementation line, identify the source matrix row that
justifies it. Revert any change without both links before finalizing.

- [ ] **Step 5: Commit the verified P35 result**

```powershell
git status --short
git log --oneline -8
```

If the final quality-gate commit is needed after fixes:

```powershell
git add src tests docs README.md example/App.tsx
git commit -m "chore: verify table2 source compatibility"
```
