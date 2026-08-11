# P36 Tree Source Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `UPTree` with the verified `uview-plus` 3.8.86 `u-tree` props, defaults, initial node state, callback order, and disabled-node behavior without adding APIs that the source component does not define.

**Architecture:** Keep the existing FlashList-backed flattened tree and public React Native extensions. Add source field mapping and icon aliases at the component boundary, carry node-level initial flags through the pure normalized model, and make node-content interactions follow the audited source order. Controlled keys, refs, `renderNode`, deterministic fallback keys, and the current configuration store remain unchanged.

**Tech Stack:** TypeScript, React Native, `@shopify/flash-list`, Jest, `@testing-library/react-native`, ESLint, React Native Builder Bob.

## Global Constraints

- Source compatibility is tracked against `uview-plus` 3.8.86.
- `props` is the source field-mapping alias; existing `fieldNames` remains supported for RN callers.
- Explicit `nodeKey` overrides `fieldNames`, which overrides source `props`, which overrides defaults.
- `expandOnClickNode` defaults to `true`; callers can pass `false` explicitly.
- Source icon defaults are `play-right-fill` and `arrow-down-fill`.
- Node-level `expanded` and `checked` flags participate only in initial uncontrolled state.
- Controlled `expandedKeys`, `checkedKeys`, and `currentNodeKey` remain authoritative.
- Disabled nodes remain clickable and expandable, but cannot change checked state.
- The node-content callback order is current-key update, expansion, check-change/check, node-click, then current-change.
- Missing and duplicate keys retain deterministic path-qualified fallback behavior and development warnings.
- Do not add async loading, `load`, Promise-based tree data, network requests, drag sorting, reordering, `allow-drop`, `node-drag`, or `node-drop`.
- Do not add a native dependency or expose FlashList/native refs.
- Do not add data watcher reinitialization semantics in P36.
- Preserve caller-owned data and node objects; normalization must not mutate them.

---

### Task 1: Freeze The `u-tree` Source Matrix

**Files:**
- Create: `docs/tree-source-compatibility.md`
- Read: `docs/superpowers/specs/2026-08-11-ultra-ui-react-native-p36-tree-source-compatibility-design.md`
- Read: `src/components/tree/types.ts`
- Read: `src/components/tree/state.ts`
- Read: `src/components/tree/UPTree.tsx`
- Read: `tests/components/UPTree.test.tsx`

**Interfaces:**
- Consumes: `uview-plus` 3.8.86 `components/u-tree/u-tree.vue` and `tree-node.vue`.
- Produces: the row-level source/RN matrix used by Tasks 2-5.

- [ ] **Step 1: Locate and verify the pinned source package**

Use the existing extracted source package when available. Otherwise obtain it
without changing this repository's dependencies:

```powershell
$suffix = Get-Date -Format 'yyyyMMddHHmmss'
$sourceDir = Join-Path $env:TEMP ("uview-plus-3.8.86-p36-" + $suffix)
$extractDir = Join-Path $env:TEMP ("uview-plus-3.8.86-p36-extracted-" + $suffix)
New-Item -ItemType Directory -Force $sourceDir | Out-Null
npm pack uview-plus@3.8.86 --pack-destination $sourceDir
$archive = Get-ChildItem $sourceDir -Filter 'uview-plus-3.8.86.tgz' | Select-Object -First 1
New-Item -ItemType Directory -Force $extractDir | Out-Null
tar -xf $archive.FullName -C $extractDir
Get-Content -Raw (Join-Path $extractDir 'package/components/u-tree/u-tree.vue')
Get-Content -Raw (Join-Path $extractDir 'package/components/u-tree/tree-node.vue')
```

Confirm from the source that it defines `props`, `nodeKey`, `expandOnClickNode`,
`expandIcon`, `collapseIcon`, node `expanded`/`checked` initialization, and
the audited callback order. Confirm that it does not define async loading or
drag/drop APIs.

- [ ] **Step 2: Write the source matrix**

Create `docs/tree-source-compatibility.md` with this table shape:

```markdown
| Source item | Source shape/default | Current RN shape | P36 action | RN boundary | Test |
|---|---|---|---|---|---|
```

Include rows for:

- `data`, `props`, `nodeKey`, `showCheckbox`, `defaultExpandAll`,
  `defaultExpandedKeys`, `defaultCheckedKeys`;
- `expandOnClickNode`, `checkOnClickNode`, `checkStrictly`, `accordion`,
  `highlightCurrent`, `currentNodeKey`, `indent`, `iconSize`,
  `checkboxSize`, `expandIcon`, and `collapseIcon`;
- node-level `expanded` and `checked` flags;
- `node-click`, `check-change`, `check`, `node-expand`, `node-collapse`, and
  `current-change`;
- disabled click, disabled expansion, and disabled checkbox behavior;
- source slot mapping to `renderNode`;
- async and drag/drop API candidates explicitly marked out of scope because
  they are absent from 3.8.86.

Use `Supported`, `Emulated`, `No-op retained`, and `Deferred` consistently with
the existing gap matrix. Every P36 action must name an implementation file and
focused test.

- [ ] **Step 3: Validate the matrix**

Run:

```powershell
rg -n -i "TBD|TODO|unknown|later" docs/tree-source-compatibility.md
git diff --check -- docs/tree-source-compatibility.md
```

Expected: no placeholders or whitespace errors. Any `unknown` match must be a
literal source type description, not an unfinished requirement.

- [ ] **Step 4: Commit the matrix**

```powershell
git add docs/tree-source-compatibility.md
git commit -m "docs: freeze tree source compatibility matrix"
```

---

### Task 2: Extend The Pure Tree Model

**Files:**
- Modify: `src/components/tree/state.ts`
- Test: `tests/components/UPTree.test.tsx`
- Read: `docs/tree-source-compatibility.md`

**Interfaces:**
- Consumes: source matrix rows for node-level initial flags and disabled
  expansion.
- Produces: `UPTreeNodeModel.initialExpandedKeys`,
  `UPTreeNodeModel.initialCheckedKeys`, `expandInitialCheckedKeys`, and
  source-compatible `toggleExpandedKeys`.

- [ ] **Step 1: Add failing state tests**

Add these tests to `tests/components/UPTree.test.tsx`:

```ts
import { expandInitialCheckedKeys } from '../../src/components/tree/state';

it('collects node-level initial flags without mutating source nodes', () => {
  const source = [{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }];

  const model = normalizeTree(source, fieldNames);

  expect(model.initialExpandedKeys).toEqual(['root']);
  expect(model.initialCheckedKeys).toEqual(['root']);
  expect(source).toEqual([{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }]);
});

it('allows disabled nodes to expand but still excludes them from check mutations', () => {
  const model = normalizeTree([{
    id: 'disabled',
    label: 'Disabled',
    disabled: true,
    children: [{ id: 'child', label: 'Child' }],
  }], fieldNames);

  expect(toggleExpandedKeys(model, [], 'disabled', true, false)).toEqual(['disabled']);
  expect(toggleCheckedKeys(model, [], 'disabled', true, {
    checkStrictly: false,
  })).toEqual([]);
});

it('preserves initial checked targets and propagates only to enabled descendants', () => {
  const model = normalizeTree([{
    id: 'root',
    label: 'Root',
    disabled: true,
    children: [
      { id: 'enabled', label: 'Enabled' },
      { id: 'blocked', label: 'Blocked', disabled: true, children: [{ id: 'nested', label: 'Nested' }] },
    ],
  }], fieldNames);

  expect(expandInitialCheckedKeys(model, ['root'], false)).toEqual([
    'root',
    'enabled',
  ]);
});
```

- [ ] **Step 2: Run the focused tests and verify the failures**

Run:

```powershell
npx jest tests/components/UPTree.test.tsx --runInBand
```

Expected: the new tests fail because the normalized model has no initial flag
arrays and expansion currently rejects disabled records. Existing tests remain
green.

- [ ] **Step 3: Add initial flag collections to the model**

Extend `UPTreeNodeModel<T>`:

```ts
export type UPTreeNodeModel<T> = {
  nodes: Map<UPKey, UPTreeNodeRecord<T>>;
  roots: UPKey[];
  visibleKeys: UPKey[];
  initialExpandedKeys: UPKey[];
  initialCheckedKeys: UPKey[];
};
```

In `normalizeTree`, create `initialExpandedKeys` and
`initialCheckedKeys` arrays before visiting nodes. For each raw node, inspect
the source flags without mutating the raw object:

```ts
if (recordNode.expanded === true) initialExpandedKeys.push(key);
if (recordNode.checked === true) initialCheckedKeys.push(key);
```

Return both arrays with the existing model fields. Keep the current path-key
and duplicate-key handling unchanged.

- [ ] **Step 4: Permit disabled expansion only**

Change `toggleExpandedKeys` so it returns unchanged keys only when the record
is missing or has no children:

```ts
if (!record || record.children.length === 0) return [...expandedKeys];
```

Do not remove the disabled checks in `toggleCheckedKeys` or
`deriveTreeCheckState`.

- [ ] **Step 5: Add source-compatible initial checked propagation**

Add this pure helper to `state.ts`:

```ts
export function expandInitialCheckedKeys<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  checkStrictly: boolean,
): UPKey[] {
  const next = new Set(checkedKeys);
  if (checkStrictly) return [...next];

  const visit = (key: UPKey): void => {
    const record = model.nodes.get(key);
    if (!record) return;
    record.children.forEach((childKey) => {
      const child = model.nodes.get(childKey);
      if (!child || child.disabled) return;
      next.add(childKey);
      visit(childKey);
    });
  };

  checkedKeys.forEach(visit);
  return [...next];
}
```

This preserves an explicitly checked disabled target but does not check a
disabled descendant or recurse through that disabled descendant. The
component will call this helper only while initializing uncontrolled checked
state; interactive disabled checks remain rejected by `toggleCheckedKeys`.

- [ ] **Step 6: Run state regressions**

Run:

```powershell
npx jest tests/components/UPTree.test.tsx --runInBand
npx eslint src/components/tree/state.ts tests/components/UPTree.test.tsx
```

Expected: all tree tests and scoped lint pass.

- [ ] **Step 7: Commit the pure model change**

```powershell
git add src/components/tree/state.ts tests/components/UPTree.test.tsx
git commit -m "fix: align tree initial state and disabled expansion"
```

---

### Task 3: Add Source Props, Icons, And Defaults

**Files:**
- Modify: `src/components/tree/types.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/components/tree/UPTree.tsx`
- Test: `tests/components/UPTree.test.tsx`
- Read: `src/components/icon/UPIcon.tsx`
- Read: `src/icons/upicon-map.ts`

**Interfaces:**
- Consumes: `UPTreeNodeModel.initialExpandedKeys` and
  `initialCheckedKeys` and `expandInitialCheckedKeys` from Task 2.
- Produces: source-shaped `UPTreeProps.props`, `expandIcon`,
  `collapseIcon`, and defaults usable by the component.

- [ ] **Step 1: Add failing component tests**

Add tests for the source field alias, icon props, node flags, controlled
precedence, and the new default click behavior:

```tsx
it('accepts source props as a field-mapping alias', () => {
  const screen = renderRoot(
    <UPTree
      data={[{
        code: 'root',
        title: 'Root',
        items: [{ code: 'child', title: 'Child' }],
      }]}
      defaultExpandedKeys={['root']}
      props={{ nodeKey: 'code', label: 'title', children: 'items' }}
    />,
  );

  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
});

it('lets existing fieldNames override the source props alias', () => {
  const screen = renderRoot(
    <UPTree
      data={[{
        code: 'root',
        title: 'Root',
        items: [{ code: 'child', title: 'Child' }],
      }]}
      defaultExpandedKeys={['root']}
      fieldNames={{ nodeKey: 'code', label: 'title', children: 'items' }}
      props={{ nodeKey: 'id', label: 'label', children: 'children' }}
    />,
  );

  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
});

it('uses source icon props and expands content by default', () => {
  const screen = renderRoot(
    <UPTree
      collapseIcon="source-collapse"
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      expandIcon="source-expand"
    />,
  );

  expect(screen.getByTestId('up-icon-glyph').props.children).toBe('source-expand');
  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
  expect(screen.getByTestId('up-icon-glyph').props.children).toBe('source-collapse');
});

it('uses explicit expandOnClickNode false for non-expanding content presses', () => {
  const screen = renderRoot(
    <UPTree
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      expandOnClickNode={false}
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  expect(screen.queryByTestId('up-tree-row-child')).toBeNull();
});

it('merges node flags into uncontrolled initial state but honors controlled keys', () => {
  const source = [{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }];

  const uncontrolled = renderRoot(
    <UPTree data={source} showCheckbox />,
  );
  expect(uncontrolled.getByTestId('up-tree-row-child')).toBeTruthy();
  expect(uncontrolled.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(true);

  const controlled = renderRoot(
    <UPTree checkedKeys={[]} data={source} expandedKeys={[]} showCheckbox />,
  );
  expect(controlled.queryByTestId('up-tree-row-child')).toBeNull();
  expect(controlled.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(false);
});
```

When multiple tree rows are rendered in one test, use separate `renderRoot`
calls inside separate test cases or unmount the first render before asserting
global `up-icon-glyph` queries.

- [ ] **Step 2: Run the focused tests and verify the failures**

Run:

```powershell
npx jest tests/components/UPTree.test.tsx --runInBand
```

Expected: TypeScript/Jest fails on the missing source props and icons, and
content presses do not expand by default.

- [ ] **Step 3: Extend the public types and defaults**

In `src/components/tree/types.ts`, add:

```ts
props?: UPTreeFieldNames;
expandIcon?: string;
collapseIcon?: string;
```

In `UPTreeDefaults`, add:

```ts
expandIcon: string;
collapseIcon: string;
```

In the `sourceDefaults.props.tree` object, set:

```ts
expandIcon: 'play-right-fill',
collapseIcon: 'arrow-down-fill',
expandOnClickNode: true,
```

Do not add async, drag, or network fields to either public or default types.

- [ ] **Step 4: Resolve source and RN field mappings**

In `UPTree.tsx`, resolve field names before building `props`:

```ts
const resolvedFieldNames = {
  ...defaults.fieldNames,
  ...input.props,
  ...input.fieldNames,
};
```

Keep the existing top-level `nodeKey` override when calling
`normalizeTree`. Assign `resolvedFieldNames` to the merged component props so
the rest of the component continues using one normalized mapping.

- [ ] **Step 5: Initialize local keys from model flags**

Import `expandInitialCheckedKeys` from `./state` and use the model's initial
arrays only when the corresponding controlled prop is absent:

```ts
const [localExpandedKeys, setLocalExpandedKeys] = useState<readonly UPKey[]>(
  () => props.defaultExpandAll
    ? collectExpandableKeys(model)
    : [...new Set([...model.initialExpandedKeys, ...props.defaultExpandedKeys])],
);
const [localCheckedKeys, setLocalCheckedKeys] = useState<readonly UPKey[]>(
  () => expandInitialCheckedKeys(
    model,
    [...new Set([...model.initialCheckedKeys, ...props.defaultCheckedKeys])],
    Boolean(props.checkStrictly),
  ),
);
```

Add `expandInitialCheckedKeys(model, keys, checkStrictly)` in `state.ts`. It
must preserve every explicitly initial checked key, including a disabled
target, and when `checkStrictly` is false add only enabled descendants of each
checked target. It must not mutate source rows or child arrays. Interactive
`toggleCheckedKeys` must continue rejecting disabled targets.

- [ ] **Step 6: Render configured icons**

Replace hardcoded icon names in the expansion control:

```tsx
<UPIcon
  color={row.disabled ? '#c8c9cc' : '#606266'}
  name={expanded ? props.collapseIcon : props.expandIcon}
  size={iconSize}
/>
```

The existing `UPIcon` map already contains `play-right-fill` and
`arrow-down-fill`; unknown names continue through the existing fallback.

- [ ] **Step 7: Run focused type and component checks**

Run:

```powershell
npx tsc --noEmit
npx jest tests/components/UPTree.test.tsx --runInBand
npx eslint src/components/tree/types.ts src/components/tree/UPTree.tsx src/config/defaults.ts tests/components/UPTree.test.tsx
```

Expected: typecheck, all tree tests, and scoped lint pass.

- [ ] **Step 8: Commit the source props and defaults**

```powershell
git add src/components/tree/types.ts src/components/tree/UPTree.tsx src/config/defaults.ts tests/components/UPTree.test.tsx
git commit -m "fix: align tree source props and defaults"
```

---

### Task 4: Correct Node Interaction Semantics

**Files:**
- Modify: `src/components/tree/UPTree.tsx`
- Test: `tests/components/UPTree.test.tsx`
- Read: `docs/tree-source-compatibility.md`

**Interfaces:**
- Consumes: source props/defaults and initial state from Task 3.
- Produces: source-ordered callbacks and disabled-node interaction behavior.

- [ ] **Step 1: Add a failing callback-order test**

Add a test that records every RN callback involved in one content press:

```tsx
it('dispatches tree content callbacks in source order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPTree
      checkOnClickNode
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      onCheck={() => events.push('check')}
      onCheckChange={() => events.push('check-change')}
      onCurrentChange={() => events.push('current-change')}
      onNodeClick={() => events.push('node-click')}
      onNodeExpand={() => events.push('node-expand')}
      onUpdateCurrentNodeKey={() => events.push('update-current')}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));

  expect(events).toEqual([
    'update-current',
    'node-expand',
    'check-change',
    'check',
    'node-click',
    'current-change',
  ]);
});
```

- [ ] **Step 2: Add a failing disabled-node behavior test**

Add a test that verifies disabled content and expansion remain active while
checkbox mutation is blocked:

```tsx
it('keeps disabled nodes clickable and expandable but not checkable', () => {
  const onCheckChange = jest.fn();
  const onNodeClick = jest.fn();
  const onNodeExpand = jest.fn();
  const screen = renderRoot(
    <UPTree
      checkOnClickNode
      data={[{
        id: 'disabled',
        label: 'Disabled',
        disabled: true,
        children: [{ id: 'child', label: 'Child' }],
      }]}
      onCheckChange={onCheckChange}
      onNodeClick={onNodeClick}
      onNodeExpand={onNodeExpand}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-disabled'));
  expect(onNodeClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'disabled' }));
  expect(onNodeExpand).toHaveBeenCalledWith(expect.objectContaining({ id: 'disabled' }));
  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();

  fireEvent.press(screen.getByTestId('up-tree-checkbox-disabled'));
  expect(onCheckChange).not.toHaveBeenCalled();
});
```

- [ ] **Step 3: Run focused tests and verify the failures**

Run:

```powershell
npx jest tests/components/UPTree.test.tsx --runInBand
```

Expected: callback order fails because current code invokes `onNodeClick`
before state callbacks, and disabled content is ignored because its
`Pressable` is disabled.

- [ ] **Step 4: Separate current-key mutation from notification**

In `UPTree.tsx`, keep ref-driven `selectNode` behavior backward-compatible,
but add a content-press path that:

1. Reads the previous node.
2. Updates local current state or emits the controlled update callback.
3. Defers `onCurrentChange` until after expansion, checking, and
   `onNodeClick`.

Only invoke `onCurrentChange` when the previous key differs from the pressed
key. Ensure a controlled `currentNodeKey` is never overwritten locally.

- [ ] **Step 5: Reorder `onNodePress`**

Implement the content press sequence in this order:

```ts
updateCurrentKey(row.key);
if (props.expandOnClickNode && row.hasChildren) {
  toggleExpanded(row.key, !expandedSet.has(row.key));
}
if (props.checkOnClickNode && props.showCheckbox && !row.disabled) {
  toggleChecked(row.key, !checkedSet.has(row.key), true);
}
props.onNodeClick?.(row.node);
emitCurrentChangeIfChanged(row.key);
```

Preserve the existing raw-node callback payloads and update callbacks.

- [ ] **Step 6: Remove disabled blocking from click surfaces**

The row-content and expansion `Pressable` elements must not receive
`disabled={row.disabled}`. Keep `accessibilityState.disabled` so native
assistive technology still receives the source-compatible disabled state.

Keep `disabled={row.disabled}` on the checkbox and retain the
`!row.disabled` guard in `checkOnClickNode`.

- [ ] **Step 7: Run focused regressions**

Run:

```powershell
npx jest tests/components/UPTree.test.tsx --runInBand
npx eslint src/components/tree/UPTree.tsx tests/components/UPTree.test.tsx
```

Expected: all tree tests and scoped lint pass, including existing ref,
accordion, current-node, checkbox, and render-node cases.

- [ ] **Step 8: Commit interaction semantics**

```powershell
git add src/components/tree/UPTree.tsx tests/components/UPTree.test.tsx
git commit -m "fix: match tree source interaction semantics"
```

---

### Task 5: Update Compatibility Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `docs/tree-source-compatibility.md`

**Interfaces:**
- Consumes: final public types and behavior from Tasks 2-4.
- Produces: documentation that names source aliases and explicitly excludes
  non-source async/drag APIs.

- [ ] **Step 1: Update README usage**

Extend the tree example to show source-shaped `props` and explicit source
icons without removing the existing `fieldNames` example:

```tsx
<UPTree
  data={nodes}
  props={{ nodeKey: 'code', label: 'title', children: 'items' }}
  expandIcon="play-right-fill"
  collapseIcon="arrow-down-fill"
  showCheckbox
  onCheck={(node, state) => setCheckedKeys(state.checkedKeys)}
/>
```

Document that `expandOnClickNode` defaults to `true`, `fieldNames` remains the
RN alias, and disabled nodes remain clickable but cannot be checked.

- [ ] **Step 2: Update the detailed compatibility guide**

In the P33 tree section of `docs/compatibility.md`, document:

- source `props` and retained RN `fieldNames`;
- field mapping precedence;
- source icon names and default expansion-on-content-click behavior;
- node-level `expanded`/`checked` initialization;
- source callback order and disabled behavior;
- no async child loading, network, drag, or reorder API in the audited source.

- [ ] **Step 3: Update the gap matrix**

Replace the P33 tree rows in `docs/gap-matrix.md` with the final P36 surface.
Keep async loading and drag sorting marked `Deferred` only as explicit
non-source/deferred boundaries, and do not list them as supported props.
Reference `tests/components/UPTree.test.tsx` and
`docs/tree-source-compatibility.md`.

- [ ] **Step 4: Update the source matrix**

Mark each P36 action row in `docs/tree-source-compatibility.md` as implemented
and add the final source file/test references:

- `src/components/tree/types.ts`;
- `src/components/tree/state.ts`;
- `src/components/tree/UPTree.tsx`;
- `src/config/defaults.ts`;
- `tests/components/UPTree.test.tsx`.

- [ ] **Step 5: Verify documentation boundaries**

Run:

```powershell
rg -n -i "load\\(|node-drop|node-drag|allow-drop|drag-sort|remote|network" README.md docs example/App.tsx
git diff --check
```

Expected: any matches are explicit exclusions or host-boundary statements;
none advertise unsupported tree APIs.

- [ ] **Step 6: Commit documentation**

```powershell
git add README.md docs/compatibility.md docs/gap-matrix.md docs/tree-source-compatibility.md
git commit -m "docs: finalize p36 tree source compatibility"
```

---

### Task 6: Run Full Quality Gates And Review The Public Diff

**Files:**
- Read: all files changed by Tasks 1-5

**Interfaces:**
- Consumes: the complete P36 source compatibility implementation.
- Produces: a clean, tested P36 change set with no unsupported tree API.

- [ ] **Step 1: Run the complete test suite**

Run:

```powershell
npm test
```

Expected: all repository suites pass, including all tree and prior table2
tests.

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

- [ ] **Step 3: Review the public API and unsupported-feature scan**

Run:

```powershell
git diff HEAD~5..HEAD -- src/components/tree src/config/defaults.ts README.md docs example/App.tsx
rg -n "load|node-drop|node-drag|allow-drop|fixed: 'right'|remote|network" src/components/tree README.md docs example
```

Confirm that only `props`, `expandIcon`, `collapseIcon`, source defaults,
initial flags, callback ordering, and disabled interaction behavior were
added. Any unsupported-feature match must be an explicit exclusion or
non-tree documentation from an earlier phase.

- [ ] **Step 4: Check matrix coverage**

For every `P36 action` row, identify one implementation file, one focused test,
and one documentation entry. For every changed implementation line, identify
the corresponding source matrix row. Remove any untracked implementation
change that lacks all three links.

- [ ] **Step 5: Commit only if final fixes were needed**

```powershell
git status --short
git diff --check
git add src tests docs README.md example/App.tsx
git commit -m "chore: verify p36 tree source compatibility"
```
