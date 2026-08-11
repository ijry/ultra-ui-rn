# Ultra UI React Native P36 Tree Source Compatibility Design

## Goal

Close the verified `u-tree` source-compatibility gaps in the existing
`UPTree` implementation while preserving current React Native extensions and
the user's source-compatibility boundary.

The source of truth is `uview-plus` 3.8.86:

- `components/u-tree/u-tree.vue`
- `components/u-tree/tree-node.vue`

P36 covers only source properties and interaction behavior that exist in that
version. The source implementation does not define async child loading,
network loading, drag sorting, or node-drop events; none of those APIs are
part of P36.

## Scope

### In Scope

- Add the source `props` field-mapping prop.
- Retain the existing RN `fieldNames` prop.
- Add source `expandIcon` and `collapseIcon` props.
- Match source defaults for `expandOnClickNode`, `expandIcon`, and
  `collapseIcon`.
- Read node-level `expanded` and `checked` flags during initial normalization.
- Match source node-content callback ordering.
- Allow disabled nodes to receive node-click/current-change callbacks and
  expand/collapse actions.
- Keep disabled nodes from changing checked state.
- Preserve existing controlled state, ref methods, `renderNode`, FlashList
  virtualization, and deterministic key fallback behavior.
- Add focused state/component tests and update compatibility documentation.

### Out of Scope

- Async child loading, `load` callbacks, Promise-based tree data, or network
  requests.
- Drag sorting, reordering, `allow-drop`, `node-drag`, or `node-drop`.
- Data watcher reinitialization semantics.
- New native dependencies.
- New React Native-only rendering or imperative APIs.
- Changes to `UPWaterfall` or other component families.

## Public API

`UPTreeProps` gains the following source-shaped fields:

```ts
type UPTreeProps<T extends object> = {
  props?: {
    nodeKey?: string;
    label?: string;
    children?: string;
    disabled?: string;
  };
  fieldNames?: UPTreeFieldNames;
  expandIcon?: string;
  collapseIcon?: string;
};
```

The existing `fieldNames` prop remains supported for P33 React Native callers.
The public API does not expose FlashList types or internal node records.

Field mapping precedence is:

1. Explicit top-level `nodeKey`.
2. Explicit `fieldNames`.
3. Source-shaped `props`.
4. Defaults:
   `{ nodeKey: 'id', label: 'label', children: 'children', disabled: 'disabled' }`.

This lets existing RN callers keep their current API while source-shaped
callers can pass `props` directly.

Source-compatible defaults are:

```ts
{
  expandOnClickNode: true,
  expandIcon: 'play-right-fill',
  collapseIcon: 'arrow-down-fill',
}
```

Callers that require the prior RN behavior can explicitly pass
`expandOnClickNode={false}`.

## State Model

The normalized tree model continues to preserve raw node references for
callbacks and ref methods. It additionally records initial expansion and
checked flags derived from source nodes:

- `node.expanded === true` contributes the node key to initial expansion.
- `node.checked === true` contributes the node key to initial selection.
- `defaultExpandedKeys` and `defaultCheckedKeys` are unioned with those keys.
- `defaultExpandAll` expands all currently expandable nodes.
- Controlled `expandedKeys` and `checkedKeys` remain authoritative and ignore
  local initial state.

The component does not add source-style deep data watchers in P36. Local
default state is initialized once, preserving the existing RN controlled-state
boundary when the `data` prop changes.

## Interaction Semantics

For a node-content press, P36 follows the source sequence:

1. Update the current node and invoke the RN current-key update callback.
2. Toggle expansion when `expandOnClickNode` is enabled and the node has
   children; invoke `onNodeExpand` or `onNodeCollapse`.
3. Toggle checking when `checkOnClickNode` and `showCheckbox` are enabled and
   the node is not disabled; invoke `onCheckChange`, then `onCheck`.
4. Invoke `onNodeClick`.
5. Invoke `onCurrentChange` only when the node differs from the previous
   current node.

The RN update callbacks are adapter callbacks and remain available even when
the source component has no equivalent `v-model` event.

Disabled behavior matches the audited source implementation:

- Disabled nodes remain clickable.
- Disabled nodes may expand or collapse.
- Disabled nodes cannot be toggled by their checkbox.
- `checkOnClickNode` never changes a disabled node.
- Disabled styling and accessibility state remain visible.

## Architecture

### Type And Defaults Layer

Update `src/components/tree/types.ts` with the source-shaped props and
`src/config/defaults.ts` with their defaults. The existing configuration merge
path remains unchanged.

### Pure Tree State Layer

Update `src/components/tree/state.ts` to:

- retain the current field mapping and deterministic key normalization;
- collect node-level initial `expanded` and `checked` flags;
- permit expansion of disabled nodes;
- retain disabled filtering for check mutations and half-check derivation.

No asynchronous state machine or drag/reorder state is introduced.

### Component Layer

Update `src/components/tree/UPTree.tsx` to:

- resolve `props` and `fieldNames` using the documented precedence;
- render configured source icon names;
- initialize local keys from normalized node flags;
- separate current-key state update from current-change notification when
  necessary to preserve source callback order;
- keep controlled props authoritative;
- remove `Pressable disabled` from node content and expansion controls while
  retaining disabled accessibility state;
- keep the checkbox disabled for disabled nodes.

## Error Handling And Boundaries

- Non-array children are treated as empty children.
- Missing keys continue to receive deterministic path keys and one development
  warning.
- Duplicate keys continue to receive path-qualified internal keys and one
  development warning.
- Unknown icon names follow the existing `UPIcon` behavior.
- No error is thrown for malformed optional tree fields.
- No network, async loading, drag, or reorder behavior is inferred from
  retained compatibility props.

## Testing

### Pure State Tests

Add focused coverage for:

- source `props` field mapping;
- precedence of `nodeKey`, `fieldNames`, and `props`;
- node-level initial `expanded` and `checked` flags;
- disabled expansion;
- disabled check protection;
- existing duplicate/missing key and parent-child check regressions.

### Component Tests

Add focused coverage for:

- `props` alias rendering source-shaped data;
- configurable expand/collapse icon names;
- default content-click expansion;
- explicit `expandOnClickNode={false}`;
- source callback order;
- disabled node click/current-change and expand behavior;
- disabled checkbox and `checkOnClickNode` behavior;
- controlled keys overriding node-level initial flags;
- existing `renderNode`, refs, accordion, field mapping, and half-check
  behavior.

### Quality Gates

P36 must pass:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

## Documentation

Update:

- `README.md`
- `docs/compatibility.md`
- `docs/gap-matrix.md`
- a dedicated `docs/tree-source-compatibility.md` matrix if the source audit
  requires row-level tracking

Documentation must state that:

- `props` is the source field-mapping alias;
- `fieldNames` remains the RN compatibility alias;
- source defaults and icon props are supported;
- disabled nodes remain clickable but cannot be checked;
- async loading and drag sorting are not source APIs in `uview-plus` 3.8.86
  and are not implemented.

## Acceptance Criteria

- Existing `UPTree` consumers remain source-compatible through preserved
  `fieldNames`, controlled keys, refs, and render callbacks.
- Source-shaped `props`, icon props, defaults, node flags, and callback order
  are covered by tests.
- Disabled behavior matches the audited source implementation.
- No async, drag, network, or RN-only tree API is introduced.
- Full repository quality gates pass.
