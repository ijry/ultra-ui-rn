# Ultra UI React Native P37 Waterfall Source Compatibility Design

## Goal

Align `UPWaterfall` with the verified `uview-plus@3.8.86`
`components/u-waterfall/u-waterfall.vue` interface while preserving the
existing React Native API and FlashList masonry implementation.

P37 is an interface-compatibility phase. It does not replace FlashList with a
source-style manually measured column engine.

## Source Baseline

The audited source defines:

- Vue 2 `value` and Vue 3 `modelValue` data bindings;
- `addTime`, `idKey`, `columns`, `columnsMin`, and `minColumnWidth`;
- `after-add-one` with the added item and measured `height`;
- `after-add-all` with `newData` and source column heights;
- `remove(id)`, `clear()`, and `modify(id, key, value)` methods;
- default item, `column`, and `left` slots;
- automatic column recalculation on source window resize.

P37 adds only the source-compatible `modelValue` prop. Existing RN
`value`/`defaultValue` remain supported as historical RN interfaces;
`modelValue` is authoritative when both controlled inputs are supplied.

## Scope

### In Scope

- Add `modelValue` and `onUpdateModelValue`.
- Preserve `value`/`defaultValue` and `onChange` for existing RN callers.
- Match source `after-add-one` object payloads.
- Match the supported portion of `after-add-all` with a `newData` payload.
- Add `UPWaterfallRef.modify(id, key, value)`.
- Make `remove`, `clear`, and `modify` emit source-shaped model updates.
- Preserve `addTime`, id reconciliation, duplicate-id warnings, automatic
  column count calculation, FlashList masonry, scrolling, and current
  `renderItem` behavior.
- Measure rendered item heights with native layout callbacks for
  `after-add-one`.
- Document unsupported column-level slot and column-height boundaries.
- Add focused tests and update the README, compatibility guide, and gap
  matrix.

### Out of Scope

- Replacing FlashList masonry with a manually maintained `columnList`.
- Stable public `colIndex` values.
- `column` or `left` slot emulation that exposes internal masonry columns.
- Exact source `columnHeights` reporting from `after-add-all`.
- Window-level resize subscriptions or source `uni` APIs.
- Pagination, network loading, automatic requests, drag/drop, or reordering.
- New native dependencies.
- Mutation of caller-owned arrays or item objects.

## Public API

`UPWaterfallProps<T>` gains:

```ts
modelValue?: readonly T[];
onUpdateModelValue?: (value: readonly T[]) => void;
```

The existing RN `value`, `defaultValue`, and `onChange` props remain
available. Input precedence is:

1. `modelValue`;
2. existing RN `value`;
3. `defaultValue`;
4. configured default `value`.

Passing both `modelValue` and `value` is valid; `modelValue` wins and the
component may issue one development warning. No new `value` source alias is
introduced.

The after-add payload types are:

```ts
type UPWaterfallAfterAddOnePayload<T> =
  T extends object ? T & { height: number } : { item: T; height: number };

type UPWaterfallAfterAddAllPayload<T> = {
  newData: readonly T[];
};
```

For object items, `after-add-one` follows the source spread-object shape. For
non-object generic items, the RN fallback keeps the item under `item` because
there is no safe source spread shape.

P37 changes the callback signatures to:

```ts
onAfterAddOne?: (payload: UPWaterfallAfterAddOnePayload<T>) => void;
onAfterAddAll?: (payload: UPWaterfallAfterAddAllPayload<T>) => void;
```

`UPWaterfallRef` gains:

```ts
modify: (id: UPKey, key: string, value: unknown) => boolean;
```

The boolean return is an RN convenience extension indicating whether an item
was found. The source method remains behaviorally compatible.

## Update And Event Semantics

### Controlled Data

The component keeps a private displayed queue so delayed additions remain
visible immediately, even when the parent has not rendered a new controlled
value. The parent remains the source of truth for the next reconciliation.

`modelValue` is read as the controlled source when supplied. The existing
`value`/`defaultValue` path remains unchanged for RN callers when
`modelValue` is absent.

### Add Queue

Incoming ids are compared against the displayed ids. Only new ids enter the
pending queue. Each pending item is added after `addTime`, then emits one
`onAfterAddOne` payload. When the queue is empty, one `onAfterAddAll` payload
containing `newData` is emitted.

An input deletion or replacement reconciles displayed data but does not emit
an after-add callback. Duplicate ids continue to produce development
warnings and retain the existing deterministic first-match behavior.

`after-add-one.height` uses the native measured item height when available.
If the callback fires before layout measurement completes, it uses
`estimatedItemSize` as the documented fallback.

`after-add-all` intentionally omits `columnHeights`. FlashList masonry does not
expose stable item-to-column placement or per-column measured heights. Returning
an invented array would falsely claim source compatibility, so the omission is
documented as an RN boundary.

### Mutating Ref Methods

`remove(id)` removes a matching displayed or pending item. `clear()` removes
all displayed and pending items. `modify(id, key, value)` creates a new object
with one top-level field changed. Missing ids, primitive items, and invalid
modification targets produce no update and return `false` from `modify`.

For every successful ref mutation, the order is:

1. Update internal displayed/pending state.
2. Invoke `onUpdateModelValue(next)`.
3. Invoke existing RN `onChange(next)`.

Ref methods never mutate incoming arrays or item objects.

## Architecture

### Boundary And State Layer

`src/components/waterfall/types.ts` owns the new public prop, callback, and
payload types. `src/components/waterfall/state.ts` keeps id normalization,
reconciliation, and queue behavior pure, and gains helpers for immutable
top-level modification and source payload construction.

### Component Layer

`src/components/waterfall/UPWaterfall.tsx` resolves `modelValue` precedence,
emits both update callbacks in the documented order, exposes `modify`, and
wraps rendered items with `onLayout` height measurement.

The FlashList ref remains private. The component continues to use FlashList
`masonry`, `numColumns`, `optimizeItemArrangement`, and its existing scroll
methods.

### Documentation Layer

Update:

- `README.md`;
- the P33 waterfall section in `docs/compatibility.md`;
- the P33 Waterfall rows in `docs/gap-matrix.md`;
- a dedicated `docs/waterfall-source-compatibility.md` source matrix.

The documentation must distinguish supported source props/events from the
explicit `column/left` and `columnHeights` boundaries.

## Error Handling And Immutability

- Missing ids continue to use deterministic `index:n` keys.
- Duplicate ids continue to warn in development.
- `modify` is a no-op for missing ids, primitive items, and non-object item
  records.
- Array data remains the public input contract; malformed non-array values are
  not advertised as supported.
- All emitted arrays are new arrays.
- Modified object items are shallow clones; nested values retain caller
  references without being changed.
- No network or asynchronous request errors are introduced because loading
  remains application-owned.

## Testing

Focused tests in `tests/components/UPWaterfall.test.tsx` cover:

- controlled `modelValue` rendering and precedence over `value`;
- `onUpdateModelValue` and `onChange` order;
- source-shaped `after-add-one` payloads and measured/fallback heights;
- `after-add-all({ newData })` payloads and explicit absence of
  `columnHeights`;
- `modify`, `remove`, and `clear` ref behavior;
- immutable input arrays and item objects;
- pending-item removal and duplicate/missing ids;
- existing FlashList masonry, auto columns, scroll refs, and defaults.

Quality gates remain:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

## Acceptance Criteria

- Source callers can control the component through `modelValue` and receive
  `onUpdateModelValue` updates.
- Existing RN `value`/`defaultValue` and `onChange` callers continue to work.
- After-add callbacks use source-compatible object payloads within the
  documented FlashList boundary.
- `modify` is available through the imperative ref and does not mutate input.
- No unsupported source column, network, pagination, drag, or layout API is
  advertised as implemented.
- All focused and repository quality gates pass.
