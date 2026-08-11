# `u-tree` Source Compatibility Matrix

The source baseline for P36 is `uview-plus@3.8.86`, specifically
`components/u-tree/u-tree.vue` and `components/u-tree/tree-node.vue`. The
React Native implementation keeps its FlashList-backed row model and public
RN ref extensions while aligning the audited source surface.

| Source item | Source shape/default | Current RN shape | P36 action | RN boundary | Test |
|---|---|---|---|---|---|
| `data` | Array, default `[]` | `data?: readonly T[]` | Keep source-shaped node input | Caller owns data identity and updates | `tests/components/UPTree.test.tsx` |
| `props` | `{ label, children, nodeKey, disabled }`, source defaults | Existing `fieldNames` mapping | Add `props` as source alias; retain `fieldNames` | `fieldNames` remains the RN compatibility alias | `tests/components/UPTree.test.tsx` |
| `nodeKey` | String override, default `''` | `nodeKey?: string` | Preserve top-level override precedence | Missing and duplicate keys keep deterministic RN fallbacks | `tests/components/UPTree.test.tsx` |
| `showCheckbox` | Boolean, default `false` | `showCheckbox?: boolean` | Keep | Native checkbox is the interaction surface | `tests/components/UPTree.test.tsx` |
| `defaultExpandAll` | Boolean, default `false` | `defaultExpandAll?: boolean` | Keep and merge with node flags | Initialization is local and one-time | `tests/components/UPTree.test.tsx` |
| `defaultExpandedKeys` | Array, default `[]` | `defaultExpandedKeys?: readonly UPKey[]` | Keep and union with node flags | Controlled `expandedKeys` remains authoritative | `tests/components/UPTree.test.tsx` |
| `defaultCheckedKeys` | Array, default `[]` | `defaultCheckedKeys?: readonly UPKey[]` | Keep and union with node flags | Controlled `checkedKeys` remains authoritative | `tests/components/UPTree.test.tsx` |
| `expandOnClickNode` | Boolean, default `true` | Existing prop defaulted to `false` | Change default to `true` | Explicit `false` remains supported | `tests/components/UPTree.test.tsx` |
| `checkOnClickNode` | Boolean, default `false` | `checkOnClickNode?: boolean` | Keep | Disabled rows never change checked state | `tests/components/UPTree.test.tsx` |
| `checkStrictly` | Boolean, default `false` | `checkStrictly?: boolean` | Keep | Parent/child state remains derived in pure RN state | `tests/components/UPTree.test.tsx` |
| `accordion` | Boolean, default `false` | `accordion?: boolean` | Keep | Sibling collapse is limited to the same parent | `tests/components/UPTree.test.tsx` |
| `highlightCurrent` | Boolean, default `false` | `highlightCurrent?: boolean` | Keep | Native highlight is a background style | `tests/components/UPTree.test.tsx` |
| `currentNodeKey` | String/number, default `''` | `currentNodeKey?: UPKey \| null` | Keep controlled current key | RN also retains `defaultCurrentNodeKey` and ref methods | `tests/components/UPTree.test.tsx` |
| `indent` | Number/string, default `32` | `indent?: number \| string` | Keep | RN dimensions use the existing `getPx` adapter | `tests/components/UPTree.test.tsx` |
| `iconSize` | Number/string, default `14` | `iconSize?: number \| string` | Keep | Native icon size uses the existing dimension helper | `tests/components/UPTree.test.tsx` |
| `checkboxSize` | Number/string, default `16` | `checkboxSize?: number \| string` | Keep | Native checkbox is rendered with `Pressable` | `tests/components/UPTree.test.tsx` |
| `expandIcon` | String, default `play-right-fill` | Not previously exposed | Add source icon prop | Unknown names follow existing `UPIcon` fallback behavior | `tests/components/UPTree.test.tsx` |
| `collapseIcon` | String, default `arrow-down-fill` | Not previously exposed | Add source icon prop | Icon rendering stays inside the private row implementation | `tests/components/UPTree.test.tsx` |
| Node `expanded` | `true` contributes to initial expansion | Not previously read | Collect during normalization | Only affects initial uncontrolled state | `tests/components/UPTree.test.tsx` |
| Node `checked` | `true` contributes to initial checking | Not previously read | Collect during normalization | Initial propagation skips disabled descendants | `tests/components/UPTree.test.tsx` |
| `node-click` | Emits raw node after node actions | `onNodeClick(node)` | Preserve raw node payload and source order | React callback replaces the Vue event | `tests/components/UPTree.test.tsx` |
| `check-change` | Emits raw node and checked value | `onCheckChange(node, checked)` | Preserve callback and source order | Disabled checkbox presses are ignored | `tests/components/UPTree.test.tsx` |
| `check` | Emits raw node and checked-state object | `onCheck(node, state)` | Preserve callback and source order | State lists use normalized internal keys | `tests/components/UPTree.test.tsx` |
| `node-expand` | Emits raw node after expansion | `onNodeExpand(node)` | Preserve callback and source order | Disabled nodes may expand | `tests/components/UPTree.test.tsx` |
| `node-collapse` | Emits raw node after collapse | `onNodeCollapse(node)` | Preserve callback and source order | Disabled nodes may collapse | `tests/components/UPTree.test.tsx` |
| `current-change` | Emits new and old raw nodes after node actions | `onCurrentChange(current, old)` | Defer notification until the source action sequence completes | Controlled current keys are never locally overwritten | `tests/components/UPTree.test.tsx` |
| Disabled node click | Content tap still runs node handling | Content press was disabled | Remove native press blocking from content | Keep `accessibilityState.disabled` and visual styling | `tests/components/UPTree.test.tsx` |
| Disabled node expansion | Switcher is not source-blocked by disabled state | Expansion press was disabled | Permit expansion and collapse | No checked mutation is implied | `tests/components/UPTree.test.tsx` |
| Disabled checkbox | Checkbox is disabled and does not mutate state | Native checkbox press is disabled | Keep checkbox disabled and state guard | Disabled explicit initial keys remain representable | `tests/components/UPTree.test.tsx` |
| Source default slot | Scoped slot exposes node, level, and state | `renderNode(payload)` | Keep render adapter | React render callback replaces the Vue slot | `tests/components/UPTree.test.tsx` |
| Async child loading | No `load` prop or Promise loading contract in 3.8.86 | No async tree API | Deferred boundary | Data fetching remains application-owned | `docs/compatibility.md` |
| Drag/drop | No drag sorting, `allow-drop`, `node-drag`, or `node-drop` API in 3.8.86 | No tree drag API | Deferred boundary | Ordering remains application-owned | `docs/gap-matrix.md` |

Field mapping precedence is explicit: top-level `nodeKey`, then
`fieldNames`, then source-shaped `props`, then the default mapping
`id`/`label`/`children`/`disabled`. Controlled keys remain authoritative over
all initial node flags.

