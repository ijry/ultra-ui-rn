# `u-table2` Source Compatibility Matrix

**Source:** `uview-plus` 3.8.86, `components/u-table2/u-table2.vue` and
`components/u-table2/tableRow.vue`.

**P35 rule:** Only rows marked `P35 action` may change implementation. Existing
React Native adapter callbacks remain for backward compatibility, even when
the source implementation declares an event but does not emit it in 3.8.86.

## Component Props

| Source item | Source shape/default | P34 RN shape | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
| `data` | required Array, default `[]` | optional `readonly T[]`, config default `[]` | Emulated | Keep | RN config makes the required source prop optional |
| `columns` | required Array, default `[]`; `type` is `default`, `selection`, or `expand` | optional generic columns, same type values | Emulated | Keep | RN config makes the required source prop optional |
| `stripe` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | Native styles replace CSS classes |
| `border` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | Native borders replace CSS |
| `height` | String/Number, default `null` | `UPDimension`, default equivalent to auto | Emulated | Keep | Parent-relative native layout replaces CSS sizing |
| `maxHeight` | String/Number, default `null` | `UPDimension`, default equivalent to auto | Emulated | Keep | Native max-height style |
| `showHeader` | Boolean, default `true` | Boolean, default `true` | Supported | Keep | None |
| `highlightCurrentRow` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | Native background style |
| `rowKey` | String, default `id` | String, default `id` | Supported | Keep | Missing/duplicate keys get RN deterministic fallbacks |
| `currentRowKey` | String/Number, default `null` | `UPKey \| null`, default `null` | Emulated | Keep | Controlled React state replaces Vue watcher state |
| `rowStyle` | Object/Function, default `{}` | `StyleProp<ViewStyle>` or payload function | Emulated | Keep | Style object uses React Native shape |
| `cellClassName` | Function | String/function payload adapter | No-op retained | Keep | CSS class names have no native effect |
| `cellStyle` | Function | Payload function returning `ViewStyle` | Emulated | Keep | Native style return replaces CSS style |
| `headerCellClassName` | Function | String/function payload adapter | No-op retained | Keep | CSS class names have no native effect |
| `rowClassName` | Function | String/function payload adapter | No-op retained | Keep | CSS class names have no native effect |
| `context` | Object, default `null` | `unknown`, default undefined/null equivalent | Emulated | Keep | Explicit callback context replaces Vue instance context |
| `showOverflowTooltip` | Boolean/Object, default `false` | Boolean, default `false` | Emulated | Keep | One-line native truncation replaces browser tooltip |
| `lazy` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | Host supplies the loader |
| `load` | Function, default `null`; callback or Promise result | Callback or Promise result | Emulated | Keep | Input rows remain immutable in RN |
| `treeProps` | Object default `{ children: 'children', hasChildren: 'hasChildren' }` | Same optional fields/default | Supported | Keep | None |
| `defaultExpandAll` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | None |
| `expandRowKeys` | Array, default `[]` | Missing; RN exposes `expandedRowKeys` and `defaultExpandedRowKeys` | Missing | Add source-named controlled alias | `expandedRowKeys` remains a backward-compatible RN alias |
| `sortOrders` | Array, default `['ascending', 'descending']` | Same readonly values/default | Supported | Keep | None |
| `sortable` | Boolean/String, default `false` | Boolean/`'custom'`, default `false` | Emulated | Keep | Source treats a truthy string as sortable; no new custom semantics |
| `multiSort` | Boolean, default `false` | Boolean, default `false` | Supported | Keep | None |
| `sortBy` | String, default `null`; sort helper also accepts function/array values | String/array/function | Emulated | Keep | Existing RN extensions are retained; local behavior follows source comparator |
| `sortMethod` | Function, default `null`; comparator receives `(a, b, field, context)` | Same callback shape | Supported | Keep | None |
| `filters` | Object, default `{}`; contains string matching | Readonly object, same contains matching | Emulated | Keep | Source 3.8.86 declares `filter-change` but does not emit it |
| `fixedHeader` | Boolean, default `true` | Boolean, default `true` | Supported | Keep | Native sticky header split |
| `emptyText` | String, default `暂无数据` | ReactNode, same default | Emulated | Keep | ReactNode is the RN rendering adapter |
| `mainCol` | String, default `''` | String, default `''` | Supported | Keep | None |
| `expandWidth` | String, default `25px` | `UPDimension`, default `25` | Emulated | Keep | Native dimension conversion |
| `rowHeight` | String, default `36px` | `UPDimension`, default `36` | Emulated | Keep | Fixed row height remains the RN virtualization contract |
| `spanMethod` | Function returning array/object span | Same array/object return forms | Emulated | Keep | Native overlay clips spans crossing fixed-left boundary |

## Column Fields

| Source item | Source shape/default | P34 RN shape | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
| `key` | String field key | Required String | Supported | Keep | None |
| `title` | React/Vue-rendered header value | ReactNode | Emulated | Keep | `renderHeader` replaces the Vue header slot |
| `type` | `default`, `selection`, or `expand` | Same values | Supported | Keep | None |
| `width` | String/Number, otherwise auto/flex | `UPDimension`, default width fallback | Emulated | Keep | Native width resolution |
| `fixed` | Source implementation uses `left` | `'left'` | Supported | Keep | Fixed-right is not part of this source implementation |
| `align` | Header/body text alignment | `'left' \| 'center' \| 'right'` | Emulated | Keep | Native flex alignment |
| `headerAlign` | Header alignment override | Same | Supported | Keep | None |
| `sortable` | Column override, truthy means sortable | Boolean | Emulated | Keep | No invented `custom` behavior |
| `sortBy` | Column sort field/value resolver | String/array/function | Emulated | Keep | Existing RN value resolver |
| `sortOrders` | Column order list | Same readonly values | Supported | Keep | None |
| `showOverflowTooltip` | Boolean/Object override | Boolean | Emulated | Keep | Native truncation boundary |
| `style` | Source header style object is spread into header cell style | Missing from public type | Partial | Add source-named column style mapping | RN accepts a native style object; CSS strings remain unsupported |

## Events

| Source event | Source payload/order | P34 RN callback | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
| `select` | Emits the toggled row after `selection-change` | `onSelect(row, selectedRows, selectedRowKeys)` | Emulated | Correct dispatch order only | RN adds derived rows and keys for controlled state |
| `select-all` | Declared in `emits`, not emitted by the 3.8.86 implementation | `onSelectAll` is retained | No-op retained | Keep | Existing RN select-all control remains backward-compatible |
| `selection-change` | Emits selected rows before `select` | `onSelectionChange(selectedRows, selectedRowKeys)` | Emulated | Emit before `onSelect` | RN adds key array |
| `cell-click` | Declared, not emitted by source implementation | `onCellClick` is retained | No-op retained | Keep | Existing RN cell callback remains an adapter |
| `row-click` | Emits row after current-row update when enabled | `onRowClick(row, payload)` | Emulated | Verify order | RN payload adds tree/state metadata |
| `row-dblclick` | Declared, not emitted by source implementation | `onRowDoubleClick` is retained | No-op retained | Keep | Existing RN double-press adapter |
| `header-click` | Declared, not emitted by source implementation | `onHeaderClick` is retained | No-op retained | Keep | Existing RN header callback |
| `sort-change` | Emits current sort condition list after header state change | `onSortChange(conditions)` | Supported | Keep | None |
| `filter-change` | Declared, not emitted by source implementation | `onFilterChange(filters)` | No-op retained | Keep | No new filter UI or event semantics |
| `current-change` | Emits `(currentRow, oldRow)` on row click when enabled | `onCurrentChange(currentRow, previousRow)` | Supported | Keep | None |
| `expand-change` | Emits expanded key list after toggle | `onExpandChange(expandedRowKeys, row)` | Emulated | Keep existing extra row payload | RN adds the toggled row for existing callers |

## Slots And Rendering

| Source slot | Source payload | P34 RN adapter | Status | P35 action | RN boundary |
|---|---|---|---|---|---|
| `header` | `{ column, columnIndex, level, context }` | `renderHeader(payload)` | Emulated | Keep | ReactNode replaces Vue slot |
| `headerSort` | `{ sortStatus, column, columnIndex, level, context }` | Built-in sort indicator and `renderHeader` | Emulated | Keep | No separate new callback |
| `cell` | `{ row, column, prow, rowIndex, columnIndex, level, context }` | `renderCell(payload)` | Emulated | Keep | ReactNode replaces Vue slot |
| `empty` | Empty slot | `emptyText` ReactNode | Emulated | Keep | ReactNode replaces Vue slot |

## P35 Change Set

Only these source-verified corrections are in scope:

1. Add the source-named `expandRowKeys` controlled prop while retaining
   `expandedRowKeys` and `defaultExpandedRowKeys` for P34 callers.
2. Add the source-named column `style` field using the repository's native
   style type and apply it where the source applies column style.
3. Dispatch `onSelectionChange` before `onSelect`, matching source event order.
4. Add focused tests for the above corrections and regressions for all existing
   P34 behavior.

The following are explicitly not P35 changes:

- fixed-right columns;
- dynamic row-height virtualization;
- half-selected or `checkStrictly` table state;
- pagination, remote-query, network, or cache APIs;
- column drag behavior;
- exposed FlashList/native refs;
- new aliases other than the source-named `expandRowKeys`;
- new filter UI or synthetic `filter-change` semantics.
