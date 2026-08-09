# UPTree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPTree` with virtualized hierarchical rows, source-compatible expansion/current/check behavior, configurable node fields, custom rendering, configuration defaults, documentation, and imperative ref methods.

**Architecture:** Normalize arbitrary object nodes into a keyed tree model, derive the visible rows with DFS, and keep expansion, current, checked, and half-checked state separate from the caller's data. Render the visible rows through `@shopify/flash-list` while the component owns row controls and interaction semantics.

**Tech Stack:** React, TypeScript, React Native, `@shopify/flash-list@^2.3.2`, existing `UPIcon`, `UPCheckbox`, `getPx`, config store, Jest, and `@testing-library/react-native`.

## Global Constraints

- Scope is `UPTree`.
- `UPTree` must implement expansion, current node, checkboxes, parent-child propagation, half-checked state, strict checking, accordion expansion, controlled state, custom node rendering, and ref methods.
- `@shopify/flash-list` is a direct runtime dependency at `^2.3.2`.
- Do not expose FlashList types or refs through the public `UPTree` API.
- Do not mutate caller-provided tree nodes or data arrays.
- Missing node keys use deterministic path keys; duplicate keys use path-qualified internal keys and emit development warnings.
- Controlled props are authoritative; uncontrolled state starts from `default*` props.
- Use `apply_patch` for manual edits and do not revert unrelated worktree changes.
- Preserve existing repository patterns: component folders, named exports, `UP.setConfig`, focused Jest tests, and documentation in English.
- Commit each independently reviewable task with only its intended files.

---

## File Structure

- Modify: `package.json` to add `@shopify/flash-list`.
- Modify: `package-lock.json` to synchronize the dependency.
- Modify: `src/config/defaults.ts` to add `UPTreeDefaults` and source defaults.
- Modify: `src/config/store.ts` to add the `tree` config override, initialization, and merge slot.
- Modify: `tests/config/store.test.ts` to verify the tree defaults and dependency metadata.
- Create: `tests/mocks/FlashList.tsx` for deterministic Jest rendering and ref behavior.
- Create: `src/components/tree/types.ts` for public props, render payload, check state, and ref types.
- Create: `src/components/tree/state.ts` for normalization, flattening, expansion, and check-state pure helpers.
- Create: `src/components/tree/UPTree.tsx` for controlled state, FlashList rendering, row controls, callbacks, and refs.
- Create: `src/components/tree/index.ts` for tree exports.
- Modify: `src/components/index.ts` to export the tree family.
- Create: `tests/components/UPTree.test.tsx` for pure and component behavior.
- Modify: `example/App.tsx` to show a compact tree.
- Modify: `README.md` to document the basic tree usage.
- Modify: `docs/compatibility.md` to document tree semantics and React Native boundaries.
- Modify: `docs/gap-matrix.md` to add the `u-tree` compatibility row.

### Task 1: Shared FlashList Dependency And Tree Config

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `tests/config/store.test.ts`
- Create: `tests/mocks/FlashList.tsx`

**Interfaces:**
- Produces `UPProps['tree']`.
- Produces the package dependency `@shopify/flash-list`.
- Produces the test module `@shopify/flash-list` mock used by later component tests.
- Later tasks consume `useUPConfig().props.tree`.

- [ ] **Step 1: Add failing config tests**

Append tests to `tests/config/store.test.ts`:

```tsx
const packageJson = jest.requireActual<typeof import('../../package.json')>('../../package.json');
import { getUPConfig, resetUPConfigForTests, setUPConfig } from '../../src/config/store';

it('declares the FlashList runtime dependency for P33', () => {
  expect(packageJson.dependencies).toEqual(
    expect.objectContaining({ '@shopify/flash-list': '^2.3.2' }),
  );
});

it('merges tree defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.tree).toEqual(
    expect.objectContaining({
      accordion: false,
      checkStrictly: false,
      defaultCheckedKeys: [],
      defaultExpandedKeys: [],
      defaultExpandAll: false,
      fieldNames: {
        children: 'children',
        disabled: 'disabled',
        label: 'label',
        nodeKey: 'id',
      },
      highlightCurrent: false,
      showCheckbox: false,
    }),
  );

  setUPConfig({
    props: {
      tree: {
        accordion: true,
        indent: 40,
        showCheckbox: true,
      },
    },
  });

  expect(getUPConfig().props.tree).toEqual(
    expect.objectContaining({ accordion: true, indent: 40, showCheckbox: true }),
  );
});
```

- [ ] **Step 2: Run the config tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected: FAIL because the `tree` config key and FlashList dependency do not exist.

- [ ] **Step 3: Add the direct dependency**

Add this entry to `package.json` under `dependencies`:

```json
"@shopify/flash-list": "^2.3.2"
```

Run:

```powershell
npm install --package-lock-only --ignore-scripts
```

Expected: the root package and lockfile contain the same dependency range.

- [ ] **Step 4: Add tree default types**

Add near the other list defaults in `src/config/defaults.ts`:

```ts
export type UPTreeFieldNameDefaults = {
  nodeKey: string;
  label: string;
  children: string;
  disabled: string;
};

export type UPTreeDefaults = {
  data: readonly unknown[];
  fieldNames: UPTreeFieldNameDefaults;
  nodeKey: string;
  showCheckbox: boolean;
  defaultExpandAll: boolean;
  defaultExpandedKeys: readonly (string | number)[];
  defaultCheckedKeys: readonly (string | number)[];
  expandOnClickNode: boolean;
  checkOnClickNode: boolean;
  checkStrictly: boolean;
  accordion: boolean;
  highlightCurrent: boolean;
  defaultCurrentNodeKey: string | number | null;
  indent: number;
  iconSize: number;
  checkboxSize: number;
  height: number | string;
};
```

Add `tree: UPTreeDefaults;` to `UPProps`.

- [ ] **Step 5: Add source defaults**

Add to `sourceDefaults.props` in `src/config/defaults.ts`:

```ts
tree: Object.freeze({
  accordion: false,
  checkOnClickNode: false,
  checkStrictly: false,
  checkboxSize: 16,
  data: Object.freeze([]) as readonly unknown[],
  defaultCheckedKeys: Object.freeze([]) as readonly (string | number)[],
  defaultCurrentNodeKey: null,
  defaultExpandAll: false,
  defaultExpandedKeys: Object.freeze([]) as readonly (string | number)[],
  expandOnClickNode: false,
  fieldNames: Object.freeze({
    children: 'children',
    disabled: 'disabled',
    label: 'label',
    nodeKey: 'id',
  }),
  height: '100%',
  highlightCurrent: false,
  iconSize: 14,
  indent: 32,
  nodeKey: '',
  showCheckbox: false,
}),
```

- [ ] **Step 6: Wire config store overrides**

Add `tree?: Partial<UPProps['tree']>;` to `UPConfigOverrides.props`.

Add this entry to `createSourceState().props`:

```ts
tree: { ...sourceDefaults.props.tree },
```

Add this entry to `setUPConfig().props`:

```ts
tree: { ...state.props.tree, ...overrides.props?.tree },
```

Because `fieldNames` is a nested value, the component will merge its individual fields with defaults after the global config merge.

- [ ] **Step 7: Add the deterministic FlashList mock**

Create `tests/mocks/FlashList.tsx`:

```tsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { FlatList } from 'react-native';

export const FlashList = forwardRef<any, any>(function FlashListMock(props, ref) {
  useImperativeHandle(ref, () => ({
    scrollToIndex: (options: { index: number; animated?: boolean }) => {
      props.__onScrollToIndex?.(options);
    },
    scrollToOffset: (options: { offset: number; animated?: boolean }) => {
      props.__onScrollToOffset?.(options);
    },
  }));

  return <FlatList {...props} />;
});
```

Add a Jest mock in `tests/setup.ts`:

```ts
jest.mock('@shopify/flash-list', () => ({
  FlashList: jest.requireActual<typeof import('./mocks/FlashList')>('./mocks/FlashList').FlashList,
}));
```

- [ ] **Step 8: Run config tests**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit shared setup**

Run:

```powershell
git add -- package.json package-lock.json src/config/defaults.ts src/config/store.ts tests/config/store.test.ts tests/setup.ts tests/mocks/FlashList.tsx
git commit -m "feat: add p33 tree config and FlashList setup"
```

### Task 2: Tree Types And Pure State Helpers

**Files:**
- Create: `src/components/tree/types.ts`
- Create: `src/components/tree/state.ts`
- Create: `src/components/tree/index.ts`
- Create: `tests/components/UPTree.test.tsx`

**Interfaces:**
- Consumes `UPKey` and defaults from Task 1.
- Produces `UPTreeNodeModel`, `UPTreeVisibleNode`, `normalizeTree`, `flattenVisibleTree`, `toggleExpandedKeys`, `toggleCheckedKeys`, and `deriveTreeCheckState`.
- Later `UPTree.tsx` imports these exact names.

- [ ] **Step 1: Write failing pure state tests**

Start `tests/components/UPTree.test.tsx` with:

```tsx
import {
  deriveTreeCheckState,
  flattenVisibleTree,
  normalizeTree,
  toggleCheckedKeys,
  toggleExpandedKeys,
} from '../../src/components/tree/state';

const data = [
  {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B', disabled: true },
    ],
  },
  { id: 'other', label: 'Other' },
];

const fieldNames = {
  children: 'children',
  disabled: 'disabled',
  label: 'label',
  nodeKey: 'id',
} as const;

it('normalizes raw nodes and flattens only expanded descendants', () => {
  const model = normalizeTree(data, fieldNames);

  expect(flattenVisibleTree(model, [])).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ key: 'root', level: 0, hasChildren: true }),
      expect.objectContaining({ key: 'other', level: 0 }),
    ]),
  );
  expect(flattenVisibleTree(model, ['root']).map((row) => row.key)).toEqual([
    'root',
    'a',
    'b',
    'other',
  ]);
});

it('uses path-qualified internal keys for missing or duplicate keys', () => {
  const model = normalizeTree(
    [{ label: 'one' }, { id: 'same', label: 'two' }, { id: 'same', label: 'three' }],
    fieldNames,
  );

  expect(model.visibleKeys).toEqual(['path:0', 'same', 'same@path:2']);
});

it('enforces accordion expansion among siblings', () => {
  const model = normalizeTree(
    [{
      id: 'parent',
      label: 'Parent',
      children: [
        { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
        { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
      ],
    }],
    fieldNames,
  );
  expect(toggleExpandedKeys(model, ['parent'], 'parent', false, false)).toEqual([]);
  expect(toggleExpandedKeys(model, ['a', 'b'], 'a', true, true)).toEqual(['a']);
});

it('derives checked and half-checked parent state', () => {
  const model = normalizeTree(
    [{ id: 'root', label: 'Root', children: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }],
    fieldNames,
  );
  const state = deriveTreeCheckState(model, ['a'], false);

  expect(state.checkedKeys).toEqual(['a']);
  expect(state.halfCheckedKeys).toEqual(['root']);
  expect(state.checkedNodes).toHaveLength(1);
});

it('toggles descendants in non-strict mode and only the target in strict mode', () => {
  const model = normalizeTree(data, fieldNames);

  expect(toggleCheckedKeys(model, [], 'root', true, { checkStrictly: false })).toEqual(['root', 'a']);
  expect(toggleCheckedKeys(model, [], 'root', true, { checkStrictly: true })).toEqual(['root']);
});
```

- [ ] **Step 2: Run the pure tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPTree.test.tsx
```

Expected: FAIL because the tree state module and exports do not exist.

- [ ] **Step 3: Define public tree types**

Create `src/components/tree/types.ts` with the approved public interfaces:

```ts
import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type UPKey = string | number;

export type UPTreeFieldNames = {
  nodeKey?: string;
  label?: string;
  children?: string;
  disabled?: string;
};

export type UPTreeCheckState<T> = {
  checkedNodes: readonly T[];
  checkedKeys: readonly UPKey[];
  halfCheckedNodes: readonly T[];
  halfCheckedKeys: readonly UPKey[];
};

export type UPTreeVisibleNode<T> = {
  node: T;
  key: UPKey;
  parentKey: UPKey | null;
  level: number;
  label: string;
  disabled: boolean;
  hasChildren: boolean;
};

export type UPTreeRenderPayload<T> = UPTreeVisibleNode<T> & {
  expanded: boolean;
  checked: boolean;
  halfChecked: boolean;
  selected: boolean;
  toggle: () => void;
};

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

- [ ] **Step 4: Implement tree normalization**

Create the internal model in `src/components/tree/state.ts`:

```ts
import type {
  UPKey,
  UPTreeCheckState,
  UPTreeFieldNames,
  UPTreeVisibleNode,
} from './types';

export type UPTreeNodeRecord<T> = {
  children: UPKey[];
  disabled: boolean;
  key: UPKey;
  label: string;
  level: number;
  node: T;
  parentKey: UPKey | null;
};

export type UPTreeNodeModel<T> = {
  nodes: Map<UPKey, UPTreeNodeRecord<T>>;
  roots: UPKey[];
  visibleKeys: UPKey[];
};

function pathKey(path: number[]) {
  return `path:${path.join('.')}`;
}

export function normalizeTree<T extends object>(
  data: readonly T[],
  fieldNames: Required<UPTreeFieldNames>,
  nodeKeyOverride?: string,
): UPTreeNodeModel<T> {
  const nodes = new Map<UPKey, UPTreeNodeRecord<T>>();
  const roots: UPKey[] = [];

  const visit = (items: readonly T[], parentKey: UPKey | null, level: number, parentPath: number[]) => {
    items.forEach((node, index) => {
      const path = [...parentPath, index];
      const rawKey = (node as Record<string, unknown>)[nodeKeyOverride || fieldNames.nodeKey];
      const candidate = rawKey === undefined || rawKey === null || rawKey === ''
        ? pathKey(path)
        : (typeof rawKey === 'string' || typeof rawKey === 'number' ? rawKey : String(rawKey));
      const key = nodes.has(candidate) ? `${String(candidate)}@${pathKey(path)}` : candidate;
      const childrenValue = (node as Record<string, unknown>)[fieldNames.children];
      const children = Array.isArray(childrenValue) ? childrenValue as T[] : [];
      const record: UPTreeNodeRecord<T> = {
        children: [],
        disabled: Boolean((node as Record<string, unknown>)[fieldNames.disabled]),
        key,
        label: String((node as Record<string, unknown>)[fieldNames.label] ?? ''),
        level,
        node,
        parentKey,
      };
      nodes.set(key, record);
      if (parentKey === null) roots.push(key);
      else nodes.get(parentKey)?.children.push(key);
      visit(children, key, level + 1, path);
    });
  };

  visit(data, null, 0, []);
  return { nodes, roots, visibleKeys: roots };
}
```

Emit one development warning for missing or duplicate raw keys while retaining the deterministic key behavior above. Use `process.env.NODE_ENV !== 'production'` for the guard so the helper remains type-safe in the package build.

- [ ] **Step 5: Implement expansion and visible-row helpers**

Add these exact exports:

```ts
export function flattenVisibleTree<T>(
  model: UPTreeNodeModel<T>,
  expandedKeys: readonly UPKey[],
): UPTreeVisibleNode<T>[] {
  const expanded = new Set(expandedKeys);
  const rows: UPTreeVisibleNode<T>[] = [];

  const visit = (key: UPKey) => {
    const record = model.nodes.get(key);
    if (!record) return;
    rows.push({
      disabled: record.disabled,
      hasChildren: record.children.length > 0,
      key: record.key,
      label: record.label,
      level: record.level,
      node: record.node,
      parentKey: record.parentKey,
    });
    if (expanded.has(key)) record.children.forEach(visit);
  };

  model.roots.forEach(visit);
  return rows;
}

export function collectExpandableKeys<T>(model: UPTreeNodeModel<T>): UPKey[] {
  return [...model.nodes.values()]
    .filter((record) => record.children.length > 0)
    .map((record) => record.key);
}

export function toggleExpandedKeys<T>(
  model: UPTreeNodeModel<T>,
  expandedKeys: readonly UPKey[],
  key: UPKey,
  expanded: boolean,
  accordion: boolean,
): UPKey[] {
  const record = model.nodes.get(key);
  if (!record || record.disabled || record.children.length === 0) return [...expandedKeys];
  const next = new Set(expandedKeys);
  if (!expanded) next.delete(key);
  else {
    if (accordion && record.parentKey !== null) {
      const parent = model.nodes.get(record.parentKey);
      parent?.children.forEach((sibling) => next.delete(sibling));
    }
    next.add(key);
  }
  return [...next];
}
```

- [ ] **Step 6: Implement check-state helpers**

Add `toggleCheckedKeys` and `deriveTreeCheckState` using these rules:

```ts
function collectDescendants<T>(model: UPTreeNodeModel<T>, key: UPKey): UPKey[] {
  const record = model.nodes.get(key);
  if (!record) return [];
  return record.children.flatMap((childKey) => [
    childKey,
    ...collectDescendants(model, childKey),
  ]);
}

export function toggleCheckedKeys<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  key: UPKey,
  checked: boolean,
  options: { checkStrictly: boolean; deep?: boolean },
): UPKey[] {
  const next = new Set(checkedKeys);
  const target = model.nodes.get(key);
  if (!target || target.disabled) return [...next];

  const keys = options.checkStrictly || options.deep === false
    ? [key]
    : [key, ...collectDescendants(model, key)];

  keys.forEach((candidate) => {
    if (!model.nodes.get(candidate)?.disabled) {
      if (checked) next.add(candidate);
      else next.delete(candidate);
    }
  });
  return [...next];
}

export function deriveTreeCheckState<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  checkStrictly: boolean,
): UPTreeCheckState<T> {
  const checked = new Set(checkedKeys);
  const halfChecked = new Set<UPKey>();
  if (!checkStrictly) {
    const evaluate = (key: UPKey): 'checked' | 'half' | 'empty' => {
      const record = model.nodes.get(key);
      if (!record || record.disabled) return 'empty';
      const children = record.children
        .map((childKey) => model.nodes.get(childKey))
        .filter((child): child is UPTreeNodeRecord<T> => Boolean(child) && !child.disabled);
      if (children.length === 0) return checked.has(key) ? 'checked' : 'empty';

      const states = children.map((child) => evaluate(child.key));
      const allChecked = states.every((state) => state === 'checked');
      const anyChecked = states.some((state) => state !== 'empty');
      if (allChecked) {
        checked.add(key);
        halfChecked.delete(key);
        return 'checked';
      }
      if (anyChecked) {
        checked.delete(key);
        halfChecked.add(key);
        return 'half';
      }
      checked.delete(key);
      halfChecked.delete(key);
      return 'empty';
    };
    model.roots.forEach((key) => evaluate(key));
  }

  const checkedKeyList = [...checked];
  const halfCheckedKeyList = [...halfChecked];
  return {
    checkedKeys: checkedKeyList,
    checkedNodes: checkedKeyList
      .map((key) => model.nodes.get(key)?.node)
      .filter((node): node is T => node !== undefined),
    halfCheckedKeys: halfCheckedKeyList,
    halfCheckedNodes: halfCheckedKeyList
      .map((key) => model.nodes.get(key)?.node)
      .filter((node): node is T => node !== undefined),
  };
}
```

`deriveTreeCheckState` must return checked keys exactly as supplied for strict mode. For non-strict mode, walk parents from leaves upward and add a parent to `halfCheckedKeys` when at least one but not all checkable descendants are checked. Exclude disabled descendants from active parent toggles and from the checkable descendant count.

Add these read helpers for the component ref:

```ts
export function getCheckedKeys<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  leafOnly: boolean,
): UPKey[] {
  const checked = new Set(checkedKeys);
  return [...checked].filter((key) => {
    const node = model.nodes.get(key);
    return Boolean(node) && (!leafOnly || node.children.length === 0);
  });
}

export function getCheckedNodes<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  leafOnly: boolean,
): T[] {
  return getCheckedKeys(model, checkedKeys, leafOnly)
    .map((key) => model.nodes.get(key)?.node)
    .filter((node): node is T => node !== undefined);
}
```

- [ ] **Step 7: Export state helpers**

Create `src/components/tree/index.ts`:

```ts
export * from './UPTree';
export * from './state';
export * from './types';
```

- [ ] **Step 8: Run pure state tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPTree.test.tsx
```

Expected: PASS for all pure state tests; component tests remain pending until Task 3.

- [ ] **Step 9: Commit tree model**

Run:

```powershell
git add -- src/components/tree/types.ts src/components/tree/state.ts src/components/tree/index.ts tests/components/UPTree.test.tsx
git commit -m "feat: add tree normalization and check state"
```

### Task 3: UPTree Component, Ref, And Public Export

**Files:**
- Create: `src/components/tree/UPTree.tsx`
- Modify: `src/components/index.ts`
- Modify: `tests/components/UPTree.test.tsx`

**Interfaces:**
- Consumes `UPTreeProps`, `UPTreeRef`, `UPTreeNodeModel`, `flattenVisibleTree`, `toggleExpandedKeys`, `toggleCheckedKeys`, and `deriveTreeCheckState`.
- Produces the public `UPTree` generic forward-ref component.

- [ ] **Step 1: Add failing component tests**

Append to `tests/components/UPTree.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot, UPTree, type UPTreeRef } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders only visible rows and custom node payloads', () => {
  const screen = renderRoot(
    <UPTree
      data={data}
      defaultExpandedKeys={['root']}
      renderNode={({ label, level }) => <Text>{`${level}:${label}`}</Text>}
    />,
  );

  expect(screen.getByTestId('up-tree')).toBeTruthy();
  expect(screen.getByText('0:Root')).toBeTruthy();
  expect(screen.getByText('1:A')).toBeTruthy();
  expect(screen.getByText('1:B')).toBeTruthy();
  expect(screen.getByText('0:Other')).toBeTruthy();
});

it('emits expand and node-click callbacks', () => {
  const onNodeClick = jest.fn();
  const onNodeExpand = jest.fn();
  const screen = renderRoot(
    <UPTree data={data} onNodeClick={onNodeClick} onNodeExpand={onNodeExpand} />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  fireEvent.press(screen.getByTestId('up-tree-expand-root'));

  expect(onNodeClick).toHaveBeenCalledWith(data[0]);
  expect(onNodeExpand).toHaveBeenCalledWith(data[0]);
  expect(screen.getByTestId('up-tree-row-a')).toBeTruthy();
});

it('handles checkbox parent-child state and controlled updates', () => {
  const onCheck = jest.fn();
  const onUpdateCheckedKeys = jest.fn();
  const screen = renderRoot(
    <UPTree
      checkedKeys={[]}
      data={data}
      onCheck={onCheck}
      onUpdateCheckedKeys={onUpdateCheckedKeys}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-checkbox-root'));

  expect(onUpdateCheckedKeys).toHaveBeenCalledWith(['root', 'a']);
  expect(onCheck).toHaveBeenCalledWith(
    data[0],
    expect.objectContaining({ checkedKeys: ['root', 'a'] }),
  );
  expect(screen.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(false);
});

it('supports current-node state and ref methods', async () => {
  const ref = React.createRef<UPTreeRef>();
  const screen = renderRoot(
    <UPTree
      data={data}
      defaultCheckedKeys={['a']}
      defaultExpandedKeys={['root']}
      ref={ref}
      showCheckbox
    />,
  );

  expect(ref.current?.getCheckedKeys()).toEqual(['a']);
  expect(ref.current?.getHalfCheckedKeys()).toEqual(['root']);
  expect(ref.current?.getCurrentKey()).toBeNull();
  await act(async () => ref.current?.setCurrentKey('a'));
  expect(ref.current?.getCurrentNode()).toBe(data[0].children[0]);
  expect(ref.current?.scrollToKey('a')).toBe(true);
  expect(ref.current?.scrollToKey('missing')).toBe(false);
  expect(screen.getByTestId('up-tree-row-a')).toBeTruthy();
});

it('merges tree defaults through UP.setConfig', () => {
  act(() => {
    UP.setConfig({ props: { tree: { height: 180, showCheckbox: true } } });
  });

  const screen = renderRoot(<UPTree data={data} />);
  expect(screen.getByTestId('up-tree').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 180 })]),
  );
  expect(screen.getByTestId('up-tree-checkbox-root')).toBeTruthy();
});
```

- [ ] **Step 2: Run component tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPTree.test.tsx
```

Expected: FAIL because `UPTree` is not implemented or exported.

- [ ] **Step 3: Implement controlled state resolution**

Create `src/components/tree/UPTree.tsx` with a generic `forwardRef` component. Resolve props as follows:

```tsx
import { FlashList } from '@shopify/flash-list';

const config = useUPConfig();
const defaults = config.props.tree;
const props = {
  ...defaults,
  ...input,
  fieldNames: {
    ...defaults.fieldNames,
    ...input.fieldNames,
  },
};

const model = useMemo(
  () => normalizeTree(props.data, props.fieldNames, props.nodeKey || undefined),
  [props.data, props.fieldNames, props.nodeKey],
);

const [localExpandedKeys, setLocalExpandedKeys] = useState<readonly UPKey[]>(
  () => props.defaultExpandAll
    ? collectExpandableKeys(model)
    : props.defaultExpandedKeys,
);
const [localCheckedKeys, setLocalCheckedKeys] = useState<readonly UPKey[]>(
  () => props.defaultCheckedKeys,
);
const [localCurrentKey, setLocalCurrentKey] = useState<UPKey | null>(
  () => props.defaultCurrentNodeKey ?? null,
);

const expandedKeys = props.expandedKeys ?? localExpandedKeys;
const checkedKeys = props.checkedKeys ?? localCheckedKeys;
const currentKey = props.currentNodeKey ?? localCurrentKey;
const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);
const checkedSet = useMemo(() => new Set(checkedKeys), [checkedKeys]);
```

When data changes, derive all visible and ref results from the current model. Do not mutate the incoming `data` array.

- [ ] **Step 4: Implement expansion and row actions**

Use stable test ids and component-owned controls:

```tsx
const toggleExpanded = (key: UPKey, nextExpanded: boolean) => {
  const next = toggleExpandedKeys(
    model,
    expandedKeys,
    key,
    nextExpanded,
    Boolean(props.accordion),
  );
  if (props.expandedKeys === undefined) setLocalExpandedKeys(next);
  props.onUpdateExpandedKeys?.(next);

  const node = model.nodes.get(key)?.node;
  if (node) {
    if (nextExpanded) props.onNodeExpand?.(node);
    else props.onNodeCollapse?.(node);
  }
};

const onNodePress = (row: UPTreeVisibleNode<T>) => {
  props.onNodeClick?.(row.node);
  selectNode(row.key);
  if (props.expandOnClickNode && row.hasChildren) {
    toggleExpanded(row.key, !expandedSet.has(row.key));
  }
  if (props.checkOnClickNode && props.showCheckbox) {
    toggleChecked(row.key, !checkedSet.has(row.key));
  }
};
```

Render each row with:

- an indentation wrapper based on `row.level * getPx(props.indent)`;
- a pressable expand icon with `testID={`up-tree-expand-${String(row.key)}`}`;
- an optional checkbox with `testID={`up-tree-checkbox-${String(row.key)}`}`;
- a content press target with `testID={`up-tree-content-${String(row.key)}`}`;
- a row wrapper with `testID={`up-tree-row-${String(row.key)}`}`;
- `renderNode(payload)` or the default label text.

The default row must expose `accessibilityState` for `disabled`, `selected`, `checked`, and `expanded` where applicable.

- [ ] **Step 5: Implement checkbox callbacks**

Use the pure helper, then emit both state-update and source-shaped events:

```tsx
const toggleChecked = (key: UPKey, nextChecked: boolean, deep = true) => {
  const next = toggleCheckedKeys(model, checkedKeys, key, nextChecked, {
    checkStrictly: Boolean(props.checkStrictly),
    deep,
  });
  const state = deriveTreeCheckState(model, next, Boolean(props.checkStrictly));
  if (props.checkedKeys === undefined) setLocalCheckedKeys(next);
  props.onUpdateCheckedKeys?.(next);

  const node = model.nodes.get(key)?.node;
  if (node) {
    props.onCheckChange?.(node, next.includes(key));
    props.onCheck?.(node, state);
  }
};
```

Render the `halfChecked` state from `deriveTreeCheckState` and do not allow disabled nodes to trigger this function.

- [ ] **Step 6: Implement current-node behavior**

On a row content press, resolve the old node before setting the new key:

```tsx
const selectNode = (key: UPKey) => {
  const oldNode = currentKey === null ? null : model.nodes.get(currentKey)?.node ?? null;
  const nextNode = model.nodes.get(key)?.node ?? null;
  if (props.currentNodeKey === undefined) setLocalCurrentKey(key);
  props.onUpdateCurrentNodeKey?.(key);
  props.onCurrentChange?.(nextNode, oldNode);
};
```

Apply highlight styling only when `highlightCurrent` is true.

- [ ] **Step 7: Implement the FlashList renderer and ref**

Render the visible rows:

```tsx
const rows = useMemo(
  () => flattenVisibleTree(model, expandedKeys),
  [expandedKeys, model],
);
const checkState = useMemo(
  () => deriveTreeCheckState(model, checkedKeys, Boolean(props.checkStrictly)),
  [checkedKeys, model, props.checkStrictly],
);
const listRef = useRef<FlashList<UPTreeVisibleNode<T>>>(null);

<FlashList
  data={rows}
  estimatedItemSize={44}
  keyExtractor={(row) => String(row.key)}
  ref={listRef}
  renderItem={({ item: row }) => renderTreeRow(row)}
  showsVerticalScrollIndicator
/>
```

Expose the ref:

```tsx
useImperativeHandle(ref, () => ({
  getCheckedKeys: (leafOnly = false) => getCheckedKeys(model, checkState.checkedKeys, leafOnly),
  getCheckedNodes: (leafOnly = false) => getCheckedNodes(model, checkState.checkedKeys, leafOnly),
  getHalfCheckedKeys: () => checkState.halfCheckedKeys,
  getHalfCheckedNodes: () => checkState.halfCheckedNodes,
  setCheckedKeys: (keys, leafOnly = false) => {
    const next = keys.filter((key) => {
      const node = model.nodes.get(key);
      return Boolean(node) && (!leafOnly || node.children.length === 0);
    });
    if (props.checkedKeys === undefined) setLocalCheckedKeys(next);
    props.onUpdateCheckedKeys?.(next);
  },
  setChecked: (key, checked, deep = true) => toggleChecked(key, checked, deep),
  setCurrentKey: (key) => selectNode(key),
  getCurrentKey: () => currentKey,
  getCurrentNode: () => currentKey === null ? null : model.nodes.get(currentKey)?.node ?? null,
  scrollToKey: (key, animated = false) => {
    const index = rows.findIndex((row) => row.key === key);
    if (index < 0) return false;
    listRef.current?.scrollToIndex({ animated, index });
    return true;
  },
}), [checkedKeys, currentKey, model, props, rows]);
```

Add the corresponding pure `getCheckedKeys` and `getCheckedNodes` helpers to `state.ts` before using them here.

- [ ] **Step 8: Export the component**

Modify `src/components/index.ts`:

```ts
export * from './tree';
```

- [ ] **Step 9: Run tree tests and typecheck**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPTree.test.tsx tests/config/store.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 10: Commit the tree component**

Run:

```powershell
git add -- src/components/tree/UPTree.tsx src/components/tree/index.ts src/components/index.ts tests/components/UPTree.test.tsx
git commit -m "feat: add UPTree"
```

### Task 4: Tree Example And Documentation

**Files:**
- Modify: `example/App.tsx`
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes the public `UPTree` exports from Task 3.
- Produces the user-facing tree example and compatibility boundary.

- [ ] **Step 1: Add a compact example**

Add to `example/App.tsx`:

```tsx
const demoTree = [
  {
    id: 'media',
    label: 'Media',
    children: [
      { id: 'images', label: 'Images' },
      { id: 'videos', label: 'Videos' },
    ],
  },
  { id: 'settings', label: 'Settings' },
];
```

Render:

```tsx
<Text style={styles.section}>Tree</Text>
<UPTree
  data={demoTree}
  defaultExpandedKeys={['media']}
  showCheckbox
  height={180}
  onCheck={(node, state) => console.log('tree check', node.id, state.checkedKeys)}
  renderNode={({ label, level }) => <UPText text={`${'  '.repeat(level)}${label}`} />}
/>
```

- [ ] **Step 2: Document the React API**

Add to `README.md`:

```md
### Tree

`UPTree` accepts arbitrary object nodes. Use `fieldNames` when the application
uses different key, label, children, or disabled fields. Pass
`expandedKeys`, `checkedKeys`, and `currentNodeKey` for controlled state, or
use the corresponding `default*` props for local state.

```tsx
<UPTree
  data={nodes}
  fieldNames={{ nodeKey: 'code', label: 'title', children: 'items' }}
  showCheckbox
  onCheck={(node, state) => setCheckedKeys(state.checkedKeys)}
/>
```
```

- [ ] **Step 3: Update compatibility documentation**

Append to `docs/compatibility.md`:

```md
## P33 tree

`UPTree` maps the source tree component to a virtualized React Native row
model. It supports configurable node fields, expansion, current-node
highlighting, checkbox parent-child propagation, half-checked state, strict
checking, accordion expansion, custom node rendering, and imperative checked
and current-node methods.

The component requires stable unique node keys for controlled state and ref
operations. Missing or duplicate keys use deterministic internal fallbacks and
emit development warnings. CSS classes remain accepted as `customClass` but
have no React Native CSS runtime.
```

- [ ] **Step 4: Add the gap matrix row**

Add a P33 tree section to `docs/gap-matrix.md`:

```md
## P33 Tree

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-tree` | data, node key/label/children fields, expansion, current node, checkbox, half-check, accordion, scoped node slot, ref methods | `UPTree`, `UPTreeRef`, `fieldNames`, `renderNode` | DFS visible-row model rendered by FlashList; raw nodes are preserved in callbacks and parent-child check state is derived without mutating input data | Emulated | `tests/components/UPTree.test.tsx` |
| `u-tree` | async child loading, drag sorting, CSS class behavior | Retained props / deferred | Application owns data fetching and ordering; React Native does not run source CSS classes | Deferred / No-op retained | Component prop types |
```

- [ ] **Step 5: Run documentation checks**

Run:

```powershell
npm run typecheck
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit tree docs**

Run:

```powershell
git add -- example/App.tsx README.md docs/compatibility.md docs/gap-matrix.md
git commit -m "docs: add P33 tree guidance"
```

### Task 5: Tree Validation

**Files:**
- Test all files changed by Tasks 1 through 4.

**Interfaces:**
- Consumes the complete `UPTree` implementation.
- Produces validation evidence before starting the waterfall plan.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPTree.test.tsx tests/config/store.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run the full Jest suite**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 3: Run static checks**

Run:

```powershell
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Run package checks**

Run:

```powershell
npm run build
npm pack --dry-run
git diff --check
```

Expected: PASS with the tree source, generated declarations, dependency metadata, README, and docs included as intended.

- [ ] **Step 5: Inspect scoped status**

Run:

```powershell
git status --short
```

Expected: no uncommitted P33 tree changes. Pre-existing unrelated untracked files may remain and must not be reverted.
