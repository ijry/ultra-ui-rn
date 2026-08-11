# P35 Table2 Source Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close only the verified `u-table2` source-compatibility gaps left by P34 while preserving existing `UPTable2` behavior and React Native boundaries.

**Architecture:** Keep the P34 FlashList-backed table, immutable tree model, fixed-left overlay, fixed header, and fixed-row-height contract. Freeze the `uview-plus` 3.8.86 matrix first, then apply only three verified corrections: `expandRowKeys`, column `style`, and selection callback order.

**Tech Stack:** TypeScript, React Native, `@shopify/flash-list`, Jest, `@testing-library/react-native`, ESLint, React Native Builder Bob.

## Global Constraints

- Source compatibility is tracked against `uview-plus` 3.8.86.
- The source API and source behavior are authoritative.
- P35 must not add React Native-only table features or invent source semantics.
- Existing P34 public props and callbacks remain backward-compatible.
- `renderCell` and `renderHeader` remain the only React slot adapters.
- `fixed: 'left'` remains the supported fixed-column mode.
- `rowHeight` remains the virtualization contract.
- Pagination, remote fetching, network requests, and application-owned query state remain outside `UPTable2`.
- FlashList implementation details and native refs remain private.
- Caller-owned rows, nested child arrays, data arrays, and key arrays remain immutable.
- Do not add a native data-grid dependency.
- Every implementation change must map to a `P35 action` row in `docs/table2-source-compatibility.md`.

## File Map

- Create: `docs/table2-source-compatibility.md`
- Modify: `src/components/table2/types.ts`
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `tests/components/UPTable2.test.tsx`
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx` only if the existing example cannot demonstrate a source correction.

---

### Task 1: Freeze The Source Compatibility Matrix

**Files:**
- Create: `docs/table2-source-compatibility.md`
- Read: `docs/superpowers/specs/2026-08-11-ultra-ui-react-native-p35-table2-source-compatibility-design.md`
- Read: `src/components/table2/types.ts`
- Read: `src/components/table2/UPTable2.tsx`
- Read: `tests/components/UPTable2.test.tsx`

**Interfaces:**
- Consumes: official `uview-plus` 3.8.86 `u-table2` source and the P34 implementation.
- Produces: a frozen matrix of source fields, defaults, events, slots, current status, P35 action, and RN boundary.

- [ ] **Step 1: Obtain the pinned source package without changing repository dependencies**

Run in PowerShell:

```powershell
$suffix = Get-Date -Format 'yyyyMMddHHmmss'
$sourceDir = Join-Path $env:TEMP ("uview-plus-3.8.86-p35-" + $suffix)
$extractDir = Join-Path $env:TEMP ("uview-plus-3.8.86-p35-extracted-" + $suffix)
New-Item -ItemType Directory -Force $sourceDir | Out-Null
npm pack uview-plus@3.8.86 --pack-destination $sourceDir
$archive = Get-ChildItem $sourceDir -Filter 'uview-plus-3.8.86.tgz' | Select-Object -First 1
New-Item -ItemType Directory -Force $extractDir | Out-Null
tar -xf $archive.FullName -C $extractDir
Get-ChildItem $extractDir -Recurse -Filter '*table2*'
```

Inspect `package/components/u-table2/u-table2.vue` and
`package/components/u-table2/tableRow.vue`. Do not add `uview-plus` to this
repository's `package.json` or lockfile.

- [ ] **Step 2: Record the exact source contract**

Create the matrix with this shape:

```markdown
| Source item | Source shape/default | P34 RN shape | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
```

Record event argument order and whether each event is actually emitted by the
3.8.86 implementation. Use the statuses `Supported`, `Partial`, `Missing`,
`No-op retained`, and `Deferred`.

- [ ] **Step 3: Freeze the P35 change set**

The only `P35 action` rows are:

1. Add source-named controlled `expandRowKeys`, retaining
   `expandedRowKeys` and `defaultExpandedRowKeys` for P34 callers.
2. Add source-named column `style` and apply it where the source applies it.
3. Dispatch `selection-change` before `select`.

Mark fixed-right columns, dynamic row-height virtualization, half-selection,
`checkStrictly`, pagination/remote-query APIs, filter UI, column drag behavior,
and exposed native refs as outside P35.

- [ ] **Step 4: Validate the matrix**

Run:

```powershell
rg -n -i "TBD|TODO|unknown|later" docs/table2-source-compatibility.md
git diff --check -- docs/table2-source-compatibility.md
```

Expected: no placeholders or whitespace errors. Every `P35 action` names an
existing source field or event and has a concrete implementation target.

- [ ] **Step 5: Commit the matrix**

```powershell
git add docs/table2-source-compatibility.md
git commit -m "docs: freeze table2 source compatibility matrix"
```

---

### Task 2: Add The Source Alias And Column Style

**Files:**
- Modify: `src/components/table2/types.ts`
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `tests/components/UPTable2.test.tsx`
- Read: `docs/table2-source-compatibility.md`

**Interfaces:**
- Consumes: matrix rows for `expandRowKeys` and column `style`.
- Produces: `UPTable2Props.expandRowKeys`, `UPTable2Column.style`, and source-compatible expansion/header rendering.

- [ ] **Step 1: Add failing tests**

Add these tests to `tests/components/UPTable2.test.tsx`:

```ts
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
```

- [ ] **Step 2: Run the focused tests and verify the failures**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: the two new tests fail because P34 does not expose `expandRowKeys`
or column `style`; existing tests remain green.

- [ ] **Step 3: Implement the minimal type/default/render changes**

In `src/components/table2/types.ts`, add:

```ts
style?: StyleProp<ViewStyle>;
```

to `UPTable2Column`, and add:

```ts
expandRowKeys?: readonly UPKey[];
```

to `UPTable2Props`.

Add `expandRowKeys` with an immutable empty-array default to
`UPTable2Defaults` and the `table2` default object in `src/config/defaults.ts`.

In `UPTable2.tsx`, resolve the controlled expansion source in this order:

```ts
const controlledExpandedKeys =
  input.expandedRowKeys ?? input.expandRowKeys;
```

Use `controlledExpandedKeys` wherever the component currently reads
`props.expandedRowKeys`. Keep `expandedRowKeys` as the existing P34 alias.
Apply `column.style` to the shared header-cell style array so the main and
fixed-left headers both receive it.

- [ ] **Step 4: Run focused checks**

Run:

```powershell
npx tsc --noEmit
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: typecheck and all focused component tests pass.

- [ ] **Step 5: Commit the alias/style change**

```powershell
git add src/components/table2/types.ts src/components/table2/UPTable2.tsx src/config/defaults.ts tests/components/UPTable2.test.tsx
git commit -m "fix: align table2 source alias and column style"
```

---

### Task 3: Correct Selection Callback Order

**Files:**
- Modify: `src/components/table2/UPTable2.tsx`
- Modify: `tests/components/UPTable2.test.tsx`
- Read: `docs/table2-source-compatibility.md`

**Interfaces:**
- Consumes: existing `selectRow` state transition and the source selection event row.
- Produces: `onSelectionChange` dispatched before `onSelect`, with both existing callback signatures unchanged.

- [ ] **Step 1: Add a failing callback-order test**

Add:

```ts
it('dispatches selection-change before select', () => {
  const events: string[] = [];
  const onSelect = jest.fn(() => events.push('select'));
  const onSelectionChange = jest.fn(() => events.push('selection-change'));
  const screen = renderRoot(
    <UPTable2
      columns={[
        { key: 'select', type: 'selection' },
        { key: 'name', title: 'Name' },
      ]}
      data={[{ id: 'a', name: 'Ada' }]}
      onSelect={onSelect}
      onSelectionChange={onSelectionChange}
    />,
  );

  fireEvent.press(screen.getByTestId('up-table2-select-a'));

  expect(events).toEqual(['selection-change', 'select']);
  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'a' }),
    expect.any(Array),
    ['a'],
  );
});
```

- [ ] **Step 2: Run the focused test and verify the failure**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx --runInBand
```

Expected: the new test fails with the P34 order `['select', 'selection-change']`.

- [ ] **Step 3: Change only the dispatch order**

In `selectRow`, calculate `nextKeys` and `selectedRows` exactly as P34 does,
then call `onSelectionChange` before `onSelect`. Do not change callback
arguments, controlled-state handling, recursive selection, or select-all.

- [ ] **Step 4: Run focused regression checks**

Run:

```powershell
npx jest tests/components/UPTable2.test.tsx --runInBand
npx eslint "src/components/table2/UPTable2.tsx" "tests/components/UPTable2.test.tsx"
```

Expected: all table2 component tests and scoped lint pass.

- [ ] **Step 5: Commit the event-order change**

```powershell
git add src/components/table2/UPTable2.tsx tests/components/UPTable2.test.tsx
git commit -m "fix: match table2 selection event order"
```

---

### Task 4: Update Compatibility Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `docs/table2-source-compatibility.md`
- Modify: `example/App.tsx` only if the current example cannot demonstrate a P35 correction

**Interfaces:**
- Consumes: the frozen matrix and final behavior from Tasks 2-3.
- Produces: documentation matching the source matrix and unchanged RN boundaries.

- [ ] **Step 1: Record final matrix coverage**

Update the rows for `expandRowKeys`, column `style`, and selection event order
with final implementation files and test names. Keep sorting, filtering, tree,
lazy loading, spans, fixed-left, and fixed-header rows marked as already
covered by P34.

- [ ] **Step 2: Update the README**

Document only:

- source `expandRowKeys` and retained `expandedRowKeys` compatibility;
- source column `style` mapping;
- source selection callback order;
- existing source-shaped fields and callbacks;
- fixed-left and fixed-row-height boundaries;
- host-owned pagination and remote fetching;
- `renderCell` and `renderHeader` as RN slot adapters.

Do not advertise fixed-right, dynamic row height, half-selection, filter UI,
remote-query props, or other excluded features.

- [ ] **Step 3: Update compatibility documents**

Update `docs/compatibility.md` and `docs/gap-matrix.md` so their `u-table2`
rows match the matrix exactly. Use the repository's existing `Supported`,
`Emulated`, `No-op retained`, and `Deferred` terminology.

- [ ] **Step 4: Keep the example source-shaped**

The current example already demonstrates source-shaped columns, selection,
tree expansion, sorting, fixed-left, and spans. Leave `example/App.tsx`
unchanged unless a P35 correction cannot be verified through existing usage.
If it must change, add only the smallest source-shaped demonstration.

- [ ] **Step 5: Verify documentation consistency**

Run:

```powershell
rg -n -i "fixed-right|dynamic row|half-selected|checkStrictly|remote-query|prop=" README.md docs example/App.tsx
git diff --check
```

Expected: matches are exclusion/boundary statements only, not advertised
supported API.

- [ ] **Step 6: Commit the documentation**

```powershell
git add README.md docs/compatibility.md docs/gap-matrix.md docs/table2-source-compatibility.md example/App.tsx
git commit -m "docs: finalize table2 source compatibility"
```

---

### Task 5: Run Full Quality Gates And Review The Diff

**Files:**
- Read: all files changed by Tasks 1-4

**Interfaces:**
- Consumes: the complete P35 implementation and documentation.
- Produces: a clean, verified P35 change set with no unsupported API additions.

- [ ] **Step 1: Run the complete test suite**

Run:

```powershell
npm test
```

Expected: all repository test suites pass, including all P34 table2 tests.

- [ ] **Step 2: Run static checks and package validation**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: every command exits successfully.

- [ ] **Step 3: Review the public API diff**

Run:

```powershell
git diff HEAD~4..HEAD -- src/components/table2 src/config/defaults.ts README.md docs example/App.tsx
rg -n "fixed: 'right'|estimatedRowHeight|checkStrictly|halfSelected|onQueryChange|remote" src README.md docs example
```

Confirm that no excluded API appears as implemented or advertised. Any match
must be an explicit exclusion or compatibility boundary.

- [ ] **Step 4: Review matrix coverage**

For each matrix row marked `P35 action`, identify the implementation file,
focused test, and documentation entry. For every changed implementation line,
identify the matrix row that justifies it. Revert any change without both
links before finalizing.

- [ ] **Step 5: Commit the verified result if fixes were needed**

```powershell
git status --short
git log --oneline -8
git add src tests docs README.md example/App.tsx
git commit -m "chore: verify table2 source compatibility"
```
