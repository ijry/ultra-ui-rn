# `u-tree` Source Compatibility Matrix

The source baseline for P36 is `uview-plus@3.8.86`, specifically
`components/u-tree/u-tree.vue` and `components/u-tree/tree-node.vue`. The
React Native implementation keeps its FlashList-backed row model and public
RN ref extensions while aligning the audited source surface.

| Source item | Source shape/default | Current RN shape | P36 action | RN boundary | Test |
|---|---|---|---|---|---|
| `data` | Array, default `[]` | `data?: readonly T[]` | Emulated: preserve source-shaped node input (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Caller owns data identity and updates | `tests/components/UPTree.test.tsx` |
| `props` | `{ label, children, nodeKey, disabled }`, source defaults | `props?: UPTreeFieldNames`, retained `fieldNames` | Emulated: resolve source alias and retain RN alias (`src/components/tree/types.ts`, `src/components/tree/UPTree.tsx`) | `fieldNames` remains the RN compatibility alias | `tests/components/UPTree.test.tsx` |
| `nodeKey` | String override, default `''` | `nodeKey?: string` | Emulated: preserve top-level override precedence (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Missing and duplicate keys keep deterministic RN fallbacks | `tests/components/UPTree.test.tsx` |
| `showCheckbox` | Boolean, default `false` | `showCheckbox?: boolean` | Emulated: retain checkbox surface (`src/components/tree/UPTree.tsx`) | Native checkbox is the interaction surface | `tests/components/UPTree.test.tsx` |
| `defaultExpandAll` | Boolean, default `false` | `defaultExpandAll?: boolean` | Emulated: initialize all expandable keys (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Initialization is local and one-time | `tests/components/UPTree.test.tsx` |
| `defaultExpandedKeys` | Array, default `[]` | `defaultExpandedKeys?: readonly UPKey[]` | Emulated: union with node flags (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Controlled `expandedKeys` remains authoritative | `tests/components/UPTree.test.tsx` |
| `defaultCheckedKeys` | Array, default `[]` | `defaultCheckedKeys?: readonly UPKey[]` | Emulated: union and propagate enabled descendants (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Controlled `checkedKeys` remains authoritative | `tests/components/UPTree.test.tsx` |
| `expandOnClickNode` | Boolean, default `true` | `expandOnClickNode?: boolean` | Emulated: change default and retain explicit `false` (`src/config/defaults.ts`, `src/components/tree/UPTree.tsx`) | Content presses expand by default | `tests/components/UPTree.test.tsx` |
| `checkOnClickNode` | Boolean, default `false` | `checkOnClickNode?: boolean` | Emulated: retain and guard disabled rows (`src/components/tree/UPTree.tsx`) | Disabled rows never change checked state | `tests/components/UPTree.test.tsx` |
| `checkStrictly` | Boolean, default `false` | `checkStrictly?: boolean` | Emulated: retain pure parent/child derivation (`src/components/tree/state.ts`) | Parent/child state remains non-mutating | `tests/components/UPTree.test.tsx` |
| `accordion` | Boolean, default `false` | `accordion?: boolean` | Emulated: retain same-parent sibling collapse (`src/components/tree/state.ts`) | Sibling collapse is limited to the same parent | `tests/components/UPTree.test.tsx` |
| `highlightCurrent` | Boolean, default `false` | `highlightCurrent?: boolean` | Emulated: retain native highlight style (`src/components/tree/UPTree.tsx`) | Native highlight is a background style | `tests/components/UPTree.test.tsx` |
| `currentNodeKey` | String/number, default `''` | `currentNodeKey?: UPKey \| null` | Emulated: retain controlled current key and RN refs (`src/components/tree/UPTree.tsx`, `src/components/tree/types.ts`) | Controlled current keys are authoritative | `tests/components/UPTree.test.tsx` |
| `indent` | Number/string, default `32` | `indent?: number \| string` | Emulated: retain dimension adapter (`src/components/tree/UPTree.tsx`) | RN dimensions use `getPx` | `tests/components/UPTree.test.tsx` |
| `iconSize` | Number/string, default `14` | `iconSize?: number \| string` | Emulated: retain dimension adapter (`src/components/tree/UPTree.tsx`) | Native icon size uses the existing helper | `tests/components/UPTree.test.tsx` |
| `checkboxSize` | Number/string, default `16` | `checkboxSize?: number \| string` | Emulated: retain native checkbox sizing (`src/components/tree/UPTree.tsx`) | Checkbox remains a `Pressable` surface | `tests/components/UPTree.test.tsx` |
| `expandIcon` | String, default `play-right-fill` | `expandIcon?: string` | Supported: add configurable source icon (`src/components/tree/types.ts`, `src/config/defaults.ts`, `src/components/tree/UPTree.tsx`) | Unmapped icon names follow existing `UPIcon` fallback behavior | `tests/components/UPTree.test.tsx` |
| `collapseIcon` | String, default `arrow-down-fill` | `collapseIcon?: string` | Supported: add configurable source icon (`src/components/tree/types.ts`, `src/config/defaults.ts`, `src/components/tree/UPTree.tsx`) | Icon rendering stays private to the row | `tests/components/UPTree.test.tsx` |
| Node `expanded` | `true` contributes to initial expansion | Normalized model initial flags | Supported: collect without mutation (`src/components/tree/state.ts`) | Only affects initial uncontrolled state | `tests/components/UPTree.test.tsx` |
| Node `checked` | `true` contributes to initial checking | Normalized model initial flags | Supported: collect and propagate enabled descendants (`src/components/tree/state.ts`) | Initial propagation skips disabled descendants | `tests/components/UPTree.test.tsx` |
| `node-click` | Emits raw node after node actions | `onNodeClick(node)` | Emulated: preserve raw payload and source order (`src/components/tree/UPTree.tsx`) | React callback replaces the Vue event | `tests/components/UPTree.test.tsx` |
| `check-change` | Emits raw node and checked value | `onCheckChange(node, checked)` | Emulated: preserve callback and source order (`src/components/tree/UPTree.tsx`) | Disabled checkbox presses are ignored | `tests/components/UPTree.test.tsx` |
| `check` | Emits raw node and checked-state object | `onCheck(node, state)` | Emulated: preserve callback and source order (`src/components/tree/UPTree.tsx`) | State lists use normalized internal keys | `tests/components/UPTree.test.tsx` |
| `node-expand` | Emits raw node after expansion | `onNodeExpand(node)` | Emulated: preserve callback and allow disabled expansion (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Disabled nodes may expand | `tests/components/UPTree.test.tsx` |
| `node-collapse` | Emits raw node after collapse | `onNodeCollapse(node)` | Emulated: preserve callback and allow disabled collapse (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Disabled nodes may collapse | `tests/components/UPTree.test.tsx` |
| `current-change` | Emits new and old raw nodes after node actions | `onCurrentChange(current, old)` | Emulated: defer notification until source actions complete (`src/components/tree/UPTree.tsx`) | Controlled current keys are never locally overwritten | `tests/components/UPTree.test.tsx` |
| Disabled node click | Content tap still runs node handling | Content `Pressable` with accessibility state | Emulated: remove native press blocking (`src/components/tree/UPTree.tsx`) | Keep `accessibilityState.disabled` and visual styling | `tests/components/UPTree.test.tsx` |
| Disabled node expansion | Switcher is not source-blocked by disabled state | Expansion `Pressable` with accessibility state | Emulated: permit expansion and collapse (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | No checked mutation is implied | `tests/components/UPTree.test.tsx` |
| Disabled checkbox | Checkbox is disabled and does not mutate state | Disabled checkbox `Pressable` | Supported: retain disabled surface and state guard (`src/components/tree/UPTree.tsx`, `src/components/tree/state.ts`) | Disabled explicit initial keys remain representable | `tests/components/UPTree.test.tsx` |
| Source default slot | Scoped slot exposes node, level, and state | `renderNode(payload)` | Emulated: retain render adapter (`src/components/tree/types.ts`, `src/components/tree/UPTree.tsx`) | React render callback replaces the Vue slot | `tests/components/UPTree.test.tsx` |
| Async child loading | No `load` prop or Promise loading contract in 3.8.86 | No async tree API | Deferred: keep source boundary explicit (`src/components/tree/types.ts`, `docs/compatibility.md`) | Data fetching remains application-owned | `docs/compatibility.md` |
| Drag/drop | No drag sorting, `allow-drop`, `node-drag`, or `node-drop` API in 3.8.86 | No tree drag API | Deferred: keep source boundary explicit (`src/components/tree/types.ts`, `docs/gap-matrix.md`) | Ordering remains application-owned | `docs/gap-matrix.md` |

Field mapping precedence is explicit: top-level `nodeKey`, then
`fieldNames`, then source-shaped `props`, then the default mapping
`id`/`label`/`children`/`disabled`. Controlled keys remain authoritative over
all initial node flags.
