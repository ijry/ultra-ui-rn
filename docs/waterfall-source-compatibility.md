# UPWaterfall Source Compatibility

Audited source: `uview-plus@3.8.86`
source file: `components/u-waterfall/u-waterfall.vue`

| Source item | Source shape/default | React Native surface | P37 status | Boundary / implementation note | Test |
|---|---|---|---|---|---|
| Data binding | Vue 2 `value`, Vue 3 `modelValue` | `modelValue`, retained `value`, `defaultValue` | Emulated | `modelValue` wins over `value`; fallback order is `modelValue`, `value`, `defaultValue`, configured `value` | `UPWaterfall.test.tsx` |
| Data update | `input` / `v-model` update | `onUpdateModelValue(next)`, retained `onChange(next)` | Emulated | Ref mutation order is internal state, model update, RN change callback | `UPWaterfall.test.tsx` |
| `addTime` | Delayed one-by-one additions | `addTime` | Supported | Existing displayed/pending queue remains private | `UPWaterfall.test.tsx` |
| `idKey` | Item identity field | `idKey` | Supported | Missing ids use `index:n`; duplicate ids warn in development and use first match | `UPWaterfall.test.tsx` |
| `columns` | Fixed column count or source auto mode | `columns={number|'auto'}` | Emulated | FlashList owns masonry placement | `UPWaterfall.test.tsx` |
| `columnsMin` | Minimum automatic column count | `columnsMin` | Supported | Applied by existing automatic-column calculation | `UPWaterfall.test.tsx` |
| `minColumnWidth` | Automatic width threshold | `minColumnWidth` | Supported | Applied after native container layout | `UPWaterfall.test.tsx` |
| Item slot | Default item slot | `renderItem({ item, index, id })` | Emulated | Per-item render callback replaces the default slot | `UPWaterfall.test.tsx` |
| `column` / `left` slots | Source column-level slots | Not exposed | Boundary | FlashList does not provide stable public column arrays or column indices | Public types and docs |
| `after-add-one` | Added item plus measured `height` | `onAfterAddOne(payload)` | Emulated | Object items use `{ ...item, height }`; primitive items use `{ item, height }`; estimate is the fallback | `UPWaterfall.test.tsx` |
| `after-add-all` | `newData` and source column heights | `onAfterAddAll({ newData })` | Partial | `columnHeights` is intentionally omitted because FlashList does not expose stable source-equivalent measurements | `UPWaterfall.test.tsx` |
| `remove(id)` | Imperative source method | `UPWaterfallRef.remove(id)` | Supported | Removes displayed or pending items without mutating input | `UPWaterfall.test.tsx` |
| `clear()` | Imperative source method | `UPWaterfallRef.clear()` | Supported | Clears displayed and pending items | `UPWaterfall.test.tsx` |
| `modify(id, key, value)` | Imperative source method | `UPWaterfallRef.modify(id, key, value): boolean` | Emulated | Shallow-clones object items; primitives and missing ids are no-ops; boolean is an RN convenience return | `UPWaterfall.test.tsx` |
| Scrolling | Internal source scroll behavior | `scrollToIndex`, `scrollToTop` | RN retained | FlashList ref remains private | Existing waterfall tests |
| Resize | Source window resize recalculation | No window-level resize API | Boundary | Columns recalculate from the rendered container layout; no `uni` resize subscription is added | Gap matrix |
| Pagination/network | Not part of the audited component contract | `onEndReached` remains application-owned | Boundary | No automatic request, pagination, upload, or network state is added | Gap matrix |
| Drag/reorder | Not part of P37 | No drag/reorder API | Deferred | Masonry item order remains data-owned | Public types |

P37 does not implement a manually measured `columnList`, stable `colIndex`,
column slots, source `columnHeights`, network loading, pagination, drag/drop,
or window-level `uni` APIs.
