# P37 Waterfall Source Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `UPWaterfall` with the verified `uview-plus@3.8.86` waterfall interface while preserving the existing React Native value API and FlashList masonry implementation.

**Architecture:** Extend the existing waterfall public types and pure state helpers with source-shaped model bindings, add-event payload construction, and immutable item modification. Keep the component's private displayed/pending queue and FlashList masonry surface, adding native `onLayout` measurement only for the `after-add-one.height` callback and exposing `modify` through the existing imperative ref.

**Tech Stack:** TypeScript, React, React Native, `@shopify/flash-list@^2.3.2`, Jest, `@testing-library/react-native`, existing `UPRoot`/configuration infrastructure, and the current FlashList test mock.

## Global Constraints

- Source compatibility is audited against `uview-plus@3.8.86` `components/u-waterfall/u-waterfall.vue`.
- P37 adds only source-compatible `modelValue` and `onUpdateModelValue`; existing RN `value`, `defaultValue`, and `onChange` remain supported.
- `modelValue` is authoritative when both `modelValue` and `value` are supplied; one development warning is allowed.
- Keep FlashList `masonry`, `numColumns`, `optimizeItemArrangement`, current scrolling methods, `addTime`, `idKey`, duplicate-id warnings, and automatic column calculation.
- `after-add-one` uses `{ ...item, height }` for object items and `{ item, height }` for primitive items.
- `after-add-all` emits only `{ newData }`; do not invent `columnHeights`.
- `remove`, `clear`, and `modify` update internal state, then call `onUpdateModelValue(next)`, then call existing RN `onChange(next)`.
- Do not expose `column`/`left` slots, stable `colIndex`, internal column arrays, column heights, resize subscriptions, network loading, pagination, automatic requests, drag/drop, or reordering APIs.
- Do not add a native dependency and do not mutate caller-owned arrays or item objects.
- Use the existing `tests/mocks/FlashList.tsx`; do not expose FlashList types or refs through the public API.
- Work directly on the current `main` workspace and do not revert unrelated untracked files.
- Use `apply_patch` for manual edits.
- Every implementation task ends with focused tests and an explicit commit containing only that task's files.

---

## File Structure

- Modify: `src/components/waterfall/types.ts` for `modelValue`, update callbacks, source-shaped after-add payloads, and `modify`.
- Modify: `src/components/waterfall/state.ts` for immutable top-level modification, source payload construction, and queue composition helpers.
- Modify: `src/components/waterfall/UPWaterfall.tsx` for input precedence, model update ordering, queue reconciliation, native height measurement, and imperative ref behavior.
- Modify: `tests/components/UPWaterfall.test.tsx` for focused P37 behavior and existing regression coverage.
- Create: `docs/waterfall-source-compatibility.md` for the audited source/RN API matrix and explicit FlashList boundaries.
- Modify: `README.md` for the public `modelValue` example and ref/event notes.
- Modify: `docs/compatibility.md` for detailed P37 behavior and unsupported source boundaries.
- Modify: `docs/gap-matrix.md` for final P37 status and test references.
- Do not modify `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`, or package dependencies; the existing waterfall config and export are sufficient.

## Task 1: Extend Public Types And Pure Waterfall Helpers

**Files:**
- Modify: `src/components/waterfall/types.ts`
- Modify: `src/components/waterfall/state.ts`
- Modify: `tests/components/UPWaterfall.test.tsx`

**Interfaces:**
- Consumes: existing `UPWaterfallProps`, `UPWaterfallRef`, `resolveWaterfallId`, and `UPKey`.
- Produces: `UPWaterfallAfterAddOnePayload<T>`, `UPWaterfallAfterAddAllPayload<T>`, `createWaterfallAfterAddOnePayload`, `modifyWaterfallItem`, and `composeWaterfallData`.
- Later tasks call `createWaterfallAfterAddOnePayload(item, height)`, `modifyWaterfallItem(item, key, value)`, and `composeWaterfallData(displayed, pending)`.

- [ ] **Step 1: Add failing pure-helper tests**

Append these imports and tests to `tests/components/UPWaterfall.test.tsx`:

```tsx
import {
  composeWaterfallData,
  createWaterfallAfterAddOnePayload,
  modifyWaterfallItem,
} from '../../src/components/waterfall/state';

it('builds source-shaped after-add-one payloads', () => {
  expect(createWaterfallAfterAddOnePayload({ id: 'a', title: 'A' }, 128)).toEqual({
    id: 'a',
    title: 'A',
    height: 128,
  });
  expect(createWaterfallAfterAddOnePayload('plain', 96)).toEqual({
    item: 'plain',
    height: 96,
  });
});

it('modifies object items immutably and rejects primitive items', () => {
  const source = { id: 'a', title: 'A', meta: { color: 'red' } };
  const changed = modifyWaterfallItem(source, 'title', 'Updated');

  expect(changed).toEqual({
    id: 'a',
    title: 'Updated',
    meta: { color: 'red' },
  });
  expect(changed).not.toBe(source);
  expect(source).toEqual({ id: 'a', title: 'A', meta: { color: 'red' } });
  expect(modifyWaterfallItem('plain', 'title', 'Updated')).toBeUndefined();
  expect(modifyWaterfallItem(source, '', 'Updated')).toBeUndefined();
});

it('composes displayed and pending data into a new array', () => {
  const displayed = [{ id: 'a' }];
  const pending = [{ id: 'b' }];
  const result = composeWaterfallData(displayed, pending);

  expect(result).toEqual([{ id: 'a' }, { id: 'b' }]);
  expect(result).not.toBe(displayed);
  expect(result).not.toBe(pending);
});
```

- [ ] **Step 2: Run the focused test and verify the failures**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: the existing waterfall tests pass and the new tests fail because the new helper exports and payload types do not exist.

- [ ] **Step 3: Add the source-compatible public types**

In `src/components/waterfall/types.ts`, add the conditional payload types and change the callback/ref contracts:

```ts
export type UPWaterfallAfterAddOnePayload<T> =
  T extends object ? T & { height: number } : { item: T; height: number };

export type UPWaterfallAfterAddAllPayload<T> = {
  newData: readonly T[];
};

export type UPWaterfallProps<T = unknown> = {
  modelValue?: readonly T[];
  value?: readonly T[];
  defaultValue?: readonly T[];
  columns?: number | 'auto';
  columnsMin?: number;
  minColumnWidth?: UPDimension;
  addTime?: number;
  idKey?: string;
  optimizeItemArrangement?: boolean;
  estimatedItemSize?: UPDimension;
  height?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPWaterfallRenderPayload<T>) => React.ReactNode;
  empty?: React.ReactNode;
  onChange?: (value: readonly T[]) => void;
  onUpdateModelValue?: (value: readonly T[]) => void;
  onAfterAddOne?: (payload: UPWaterfallAfterAddOnePayload<T>) => void;
  onAfterAddAll?: (payload: UPWaterfallAfterAddAllPayload<T>) => void;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
};

export type UPWaterfallRef<T = unknown> = {
  remove: (id: UPKey) => boolean;
  clear: () => void;
  modify: (id: UPKey, key: string, value: unknown) => boolean;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToTop: (animated?: boolean) => void;
  getData: () => readonly T[];
};
```

Retain `UPWaterfallRenderPayload<T>` unchanged. Do not add `columnIndex`, `column`, `left`, or `columnHeights` to any public type.

- [ ] **Step 4: Add pure helper implementations**

In `src/components/waterfall/state.ts`, add:

```ts
import type {
  UPWaterfallAfterAddOnePayload,
} from './types';

export function composeWaterfallData<T>(
  displayed: readonly T[],
  pending: readonly T[],
): T[] {
  return [...displayed, ...pending];
}

export function modifyWaterfallItem<T>(
  item: T,
  key: string,
  value: unknown,
): T | undefined {
  if (item === null || typeof item !== 'object' || key.trim().length === 0) {
    return undefined;
  }
  return {
    ...(item as Record<string, unknown>),
    [key]: value,
  } as T;
}

export function createWaterfallAfterAddOnePayload<T>(
  item: T,
  height: number,
): UPWaterfallAfterAddOnePayload<T> {
  if (item !== null && typeof item === 'object') {
    return {
      ...(item as Record<string, unknown>),
      height,
    } as UPWaterfallAfterAddOnePayload<T>;
  }
  return { item, height } as UPWaterfallAfterAddOnePayload<T>;
}
```

Keep `resolveWaterfallId`, `reconcileWaterfallItems`, `createWaterfallAddQueue`, and duplicate warning behavior unchanged unless the component task requires a narrowly scoped queue fix. The helper must shallow-clone only the top-level record; nested references remain shared and untouched.

- [ ] **Step 5: Run focused tests and lint**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
npx eslint src/components/waterfall/types.ts src/components/waterfall/state.ts tests/components/UPWaterfall.test.tsx
```

Expected: all current and new pure-helper tests pass and scoped lint passes.

- [ ] **Step 6: Commit the public contract and helpers**

```powershell
git add src/components/waterfall/types.ts src/components/waterfall/state.ts tests/components/UPWaterfall.test.tsx
git commit -m "fix: add waterfall source payload contracts"
```

## Task 2: Implement Model Binding, Queue Events, Measurement, And Ref Mutations

**Files:**
- Modify: `src/components/waterfall/UPWaterfall.tsx`
- Modify: `tests/components/UPWaterfall.test.tsx`

**Interfaces:**
- Consumes: the types and pure helpers from Task 1, existing FlashList masonry props, and the current `UPWaterfall` config defaults.
- Produces: authoritative `modelValue` precedence, `onUpdateModelValue` event ordering, measured/fallback after-add payloads, and `UPWaterfallRef.modify`.

- [ ] **Step 1: Add failing model-binding and callback tests**

Append these tests to `tests/components/UPWaterfall.test.tsx`:

```tsx
it('uses modelValue as the authoritative input over value', () => {
  const screen = renderRoot(
    <UPWaterfall
      modelValue={[cards[0]]}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={[cards[1]]}
    />,
  );

  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.queryByText('B')).toBeNull();
});

it('retains defaultValue when no controlled input is supplied', () => {
  const screen = renderRoot(
    <UPWaterfall
      defaultValue={[cards[1]]}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  expect(screen.getByText('B')).toBeTruthy();
  expect(screen.queryByText('A')).toBeNull();
});

it('warns for duplicate ids and keeps deterministic first-match removal', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const duplicate = [
    { id: 'same', title: 'First' },
    { id: 'same', title: 'Second' },
  ];
  const ref = React.createRef<UPWaterfallRef<(typeof duplicate)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={duplicate}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  expect(warn).toHaveBeenCalledWith(
    '[UPWaterfall] Duplicate id "same" at index 1.',
  );
  act(() => {
    expect(ref.current?.remove('same')).toBe(true);
  });
  expect(ref.current?.getData()).toEqual([duplicate[1]]);
  expect(ref.current?.remove('missing')).toBe(false);
  warn.mockRestore();
});

it('emits modelValue updates before the retained RN onChange callback', () => {
  const events: string[] = [];
  const onUpdateModelValue = jest.fn((next) => events.push(`model:${next.length}`));
  const onChange = jest.fn((next) => events.push(`change:${next.length}`));
  const ref = React.createRef<UPWaterfallRef<(typeof cards)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={cards}
      onChange={onChange}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  act(() => {
    expect(ref.current?.remove('b')).toBe(true);
  });

  expect(events).toEqual(['model:2', 'change:2']);
  expect(onUpdateModelValue).toHaveBeenCalledWith([cards[0], cards[2]]);
  expect(onChange).toHaveBeenCalledWith([cards[0], cards[2]]);
});

it('modifies an object through the ref without mutating the input item', () => {
  const source = [{ id: 'a', title: 'A', nested: { keep: true } }];
  const onUpdateModelValue = jest.fn();
  const ref = React.createRef<UPWaterfallRef<(typeof source)[number]>>();

  renderRoot(
    <UPWaterfall
      modelValue={source}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  act(() => {
    expect(ref.current?.modify('a', 'title', 'Updated')).toBe(true);
  });

  expect(source).toEqual([{ id: 'a', title: 'A', nested: { keep: true } }]);
  expect(onUpdateModelValue).toHaveBeenCalledWith([
    { id: 'a', title: 'Updated', nested: { keep: true } },
  ]);
  expect(ref.current?.modify('missing', 'title', 'No-op')).toBe(false);
});
```

- [ ] **Step 2: Add failing add-payload and pending-removal tests**

Append:

```tsx
it('emits source-shaped add payloads with estimated height fallback', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onAfterAddAll = jest.fn();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      estimatedItemSize={144}
      modelValue={[cards[0]]}
      onAfterAddAll={onAfterAddAll}
      onAfterAddOne={onAfterAddOne}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        estimatedItemSize={144}
        modelValue={cards}
        onAfterAddAll={onAfterAddAll}
        onAfterAddOne={onAfterAddOne}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'b',
    title: 'B',
    height: 144,
  });
  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'c',
    title: 'C',
    height: 144,
  });
  expect(onAfterAddAll).toHaveBeenCalledWith({ newData: cards });
  expect(onAfterAddAll.mock.calls[0][0]).not.toHaveProperty('columnHeights');
  jest.useRealTimers();
});

it('uses a previously measured native height when it is available', () => {
  jest.useFakeTimers();
  const item = { id: 'measured', title: 'Measured' };
  const onAfterAddOne = jest.fn();
  const ref = React.createRef<UPWaterfallRef<typeof item>>();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      modelValue={[item]}
      onAfterAddOne={onAfterAddOne}
      ref={ref}
      renderItem={({ item: row }) => <Text>{row.title}</Text>}
    />,
  );

  fireEvent(screen.getByTestId('up-waterfall-item-measured'), 'layout', {
    nativeEvent: { layout: { height: 212, width: 120, x: 0, y: 0 } },
  });
  act(() => {
    expect(ref.current?.remove('measured')).toBe(true);
  });
  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={[]}
        onAfterAddOne={onAfterAddOne}
        ref={ref}
        renderItem={({ item: row }) => <Text>{row.title}</Text>}
      />
    </UPRoot>,
  );
  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={[item]}
        onAfterAddOne={onAfterAddOne}
        ref={ref}
        renderItem={({ item: row }) => <Text>{row.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith({
    id: 'measured',
    title: 'Measured',
    height: 212,
  });
  jest.useRealTimers();
});

it('removes pending items and prevents their delayed callbacks', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onUpdateModelValue = jest.fn();
  const ref = React.createRef<UPWaterfallRef<(typeof cards)[number]>>();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      modelValue={[cards[0]]}
      onAfterAddOne={onAfterAddOne}
      onUpdateModelValue={onUpdateModelValue}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        modelValue={cards}
        onAfterAddOne={onAfterAddOne}
        onUpdateModelValue={onUpdateModelValue}
        ref={ref}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </UPRoot>,
  );

  act(() => {
    expect(ref.current?.remove('b')).toBe(true);
    jest.advanceTimersByTime(20);
  });

  expect(onUpdateModelValue).toHaveBeenLastCalledWith([cards[0]]);
  expect(onAfterAddOne).not.toHaveBeenCalled();
  jest.useRealTimers();
});
```

Keep the existing masonry, automatic-column, default, remove/clear, and queue tests. Update only their after-add expectations to the new payload shape.

- [ ] **Step 3: Run focused tests and verify the failures**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: the new tests fail on `modelValue`, callback order, height payloads, `modify`, and pending-item behavior while existing FlashList tests identify regressions.

- [ ] **Step 4: Resolve source input precedence and warning**

In `src/components/waterfall/UPWaterfall.tsx`, replace the current source selection with:

```tsx
const sourceValue =
  input.modelValue !== undefined
    ? input.modelValue
    : input.value !== undefined
      ? input.value
      : input.defaultValue !== undefined
        ? input.defaultValue
        : props.value ?? [];
```

Add a `useRef(false)` warning guard. When both `input.modelValue` and `input.value` are defined, issue once in development:

```tsx
if (
  typeof __DEV__ !== 'undefined' &&
  __DEV__ &&
  input.modelValue !== undefined &&
  input.value !== undefined &&
  !modelValueWarningRef.current
) {
  modelValueWarningRef.current = true;
  console.warn('[UPWaterfall] modelValue takes precedence over value.');
}
```

Use `modelValue` only as a source-selection alias; do not add `modelValue` to config defaults.

- [ ] **Step 5: Keep displayed and pending state in synchronized refs**

Add `pendingRef` beside `displayedRef`, update both refs whenever state changes, and compose mutation payloads with new arrays:

```tsx
const replaceQueue = useCallback(
  (nextDisplayed: readonly T[], nextPending: readonly T[]) => {
    const displayedNext = [...nextDisplayed];
    const pendingNext = [...nextPending];
    displayedRef.current = displayedNext;
    pendingRef.current = pendingNext;
    setDisplayed(displayedNext);
    setPending(pendingNext);
  },
  [],
);

const emitMutation = useCallback(
  (nextDisplayed: readonly T[], nextPending: readonly T[]) => {
    const displayedNext = [...nextDisplayed];
    const pendingNext = [...nextPending];
    const next = composeWaterfallData(displayedNext, pendingNext);
    displayedRef.current = displayedNext;
    pendingRef.current = pendingNext;
    setDisplayed(displayedNext);
    setPending(pendingNext);
    input.onUpdateModelValue?.(next);
    input.onChange?.(next);
  },
  [input.onChange, input.onUpdateModelValue],
);
```

The pending queue represents source items not yet rendered. For mutation callbacks, `next` is the displayed items followed by the remaining pending items. This preserves all source items except the one removed or modified and ensures a pending removal does not accidentally drop unrelated queued items.

- [ ] **Step 6: Preserve delayed additions during controlled reconciliation**

Retain the existing delayed-add behavior, but calculate incoming additions against the composed current queue and retain pending ids that still exist in the newest source array. Replacements use the newest incoming object without emitting an after-add callback:

```tsx
const currentQueue = composeWaterfallData(displayedRef.current, pendingRef.current);
const currentIds = new Set(
  currentQueue.map((item, index) => resolveWaterfallId(item, index, props.idKey)),
);
const incomingWithIds = sourceValue.map((item, index) => ({
  id: resolveWaterfallId(item, index, props.idKey),
  item,
}));
const additions = incomingWithIds
  .filter(({ id }) => !currentIds.has(id))
  .map(({ item }) => item);
const pendingIds = new Set(
  pendingRef.current.map((item, index) => resolveWaterfallId(item, index, props.idKey)),
);
const nextPending = [
  ...sourceValue
    .filter((item, index) => pendingIds.has(resolveWaterfallId(item, index, props.idKey)))
    .filter((item, index, source) => (
      source.findIndex((candidate, candidateIndex) => (
        resolveWaterfallId(candidate, candidateIndex, props.idKey) ===
        resolveWaterfallId(item, index, props.idKey)
      )) === index
    )),
  ...additions,
];
const nextPendingIds = new Set(
  nextPending.map((item, index) => resolveWaterfallId(item, index, props.idKey)),
);
const nextDisplayed = sourceValue.filter((item, index) => (
  !nextPendingIds.has(resolveWaterfallId(item, index, props.idKey))
));
```

When `addTime <= 0`, call `replaceQueue(sourceValue, [])`. When delayed additions exist, call `replaceQueue(nextDisplayed, nextPending)`. A source deletion/replacement updates displayed or queued objects without emitting after-add callbacks. Cancel and restart only the single existing timer.

- [ ] **Step 7: Emit source-shaped after-add callbacks**

In the pending timer, calculate the new displayed snapshot before updating state:

```tsx
const nextDisplayed = [...displayedRef.current, nextItem];
const height =
  measuredHeightsRef.current.get(
    resolveWaterfallId(nextItem, nextDisplayed.length - 1, props.idKey),
  ) ?? getPx(props.estimatedItemSize);
replaceQueue(nextDisplayed, remaining);
input.onAfterAddOne?.(createWaterfallAfterAddOnePayload(nextItem, height));
if (remaining.length === 0) {
  input.onAfterAddAll?.({ newData: [...nextDisplayed] });
}
```

Use `estimatedItemSize` as the finite fallback when a stored layout height is unavailable. Do not include `columnHeights` in the after-all object.

- [ ] **Step 8: Measure rendered item heights without changing masonry ownership**

Wrap each `renderItem` result in a `View` with a stable id test hook and native layout callback:

```tsx
renderItem={({ item, index }) => {
  const id = resolveWaterfallId(item, index, props.idKey);
  return (
    <View
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (Number.isFinite(height) && height > 0) {
          measuredHeightsRef.current.set(id, height);
        }
      }}
      testID={`up-waterfall-item-${String(id)}`}
    >
      {input.renderItem?.({ id, index, item })}
    </View>
  );
}}
```

Preserve `masonry`, `numColumns`, `optimizeItemArrangement`, `estimatedItemSize`, scrolling, and `renderItem` payload fields. Do not pass a column index or expose layout internals.

- [ ] **Step 9: Implement immutable `remove`, `clear`, and `modify`**

Replace the imperative handle body with ref-backed mutations:

```tsx
remove: (id) => {
  const displayedIndex = displayedRef.current.findIndex(
    (item, index) => resolveWaterfallId(item, index, props.idKey) === id,
  );
  if (displayedIndex >= 0) {
    emitMutation(
      displayedRef.current.filter((_item, index) => index !== displayedIndex),
      pendingRef.current,
    );
    return true;
  }

  const pendingIndex = pendingRef.current.findIndex(
    (item, index) => resolveWaterfallId(item, index, props.idKey) === id,
  );
  if (pendingIndex < 0) return false;
  emitMutation(
    displayedRef.current,
    pendingRef.current.filter((_item, index) => index !== pendingIndex),
  );
  return true;
},
clear: () => {
  emitMutation([], []);
},
modify: (id, key, value) => {
  const displayedIndex = displayedRef.current.findIndex(
    (item, index) => resolveWaterfallId(item, index, props.idKey) === id,
  );
  const pendingIndex = pendingRef.current.findIndex(
    (item, index) => resolveWaterfallId(item, index, props.idKey) === id,
  );
  const target = displayedIndex >= 0 ? 'displayed' : pendingIndex >= 0 ? 'pending' : null;
  if (!target) return false;
  const source = target === 'displayed'
    ? displayedRef.current[displayedIndex]
    : pendingRef.current[pendingIndex];
  const modified = modifyWaterfallItem(source, key, value);
  if (modified === undefined) return false;
  if (target === 'displayed') {
    const next = [...displayedRef.current];
    next[displayedIndex] = modified;
    emitMutation(next, pendingRef.current);
  } else {
    const next = [...pendingRef.current];
    next[pendingIndex] = modified;
    emitMutation(displayedRef.current, next);
  }
  return true;
},
```

Keep first-match behavior for duplicate ids. `modify` returns `false` for missing ids, primitive items, and empty keys. `remove` returns `true` for displayed or pending items. All emitted arrays are fresh; `modify` shallow-clones only the target object.

- [ ] **Step 10: Run focused P37 tests and scoped checks**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
npx tsc --noEmit
npx eslint src/components/waterfall/UPWaterfall.tsx src/components/waterfall/types.ts src/components/waterfall/state.ts tests/components/UPWaterfall.test.tsx
```

Expected: all focused tests pass, typecheck passes, and scoped lint passes.

- [ ] **Step 11: Commit the component implementation**

```powershell
git add src/components/waterfall/UPWaterfall.tsx src/components/waterfall/types.ts src/components/waterfall/state.ts tests/components/UPWaterfall.test.tsx
git commit -m "fix: align waterfall source binding and refs"
```

## Task 3: Add Source Compatibility Matrix And User Documentation

**Files:**
- Create: `docs/waterfall-source-compatibility.md`
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes: the final public contracts and focused tests from Tasks 1-2.
- Produces: a source-audited support matrix that explicitly separates supported source behavior from the FlashList boundary.

- [ ] **Step 1: Write the dedicated source matrix**

Create `docs/waterfall-source-compatibility.md` with this complete matrix:

```markdown
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
```

- [ ] **Step 2: Update README usage and boundaries**

Replace the current Waterfall example in `README.md` with:

```tsx
<UPWaterfall
  columns="auto"
  minColumnWidth={220}
  modelValue={items}
  onUpdateModelValue={setItems}
  renderItem={({ item }) => <ProductCard item={item} />}
/>
```

Document that `value`/`defaultValue` and `onChange` remain valid RN interfaces, `modelValue` wins when both controlled inputs are supplied, `modify(id, key, value)` is available on `UPWaterfallRef`, and render callbacks intentionally have no column index.

- [ ] **Step 3: Update the detailed compatibility guide**

Replace the P33 waterfall text in `docs/compatibility.md` with:

```markdown
## P37 waterfall source compatibility

`UPWaterfall` keeps the existing FlashList masonry implementation and adds the
source `modelValue`/`onUpdateModelValue` binding. Input precedence is
`modelValue`, `value`, `defaultValue`, then the configured default `value`.
Existing `onChange` callers continue to work; ref mutations call
`onUpdateModelValue` before `onChange`.

Delayed additions retain the private displayed/pending queue. `onAfterAddOne`
receives a source-shaped item payload with a measured native height when one
is available, otherwise `estimatedItemSize`. `onAfterAddAll` receives
`{ newData }`; `columnHeights` is not reported because FlashList does not
expose stable source-equivalent column measurements.

`remove(id)`, `clear()`, and `modify(id, key, value)` are available through
`UPWaterfallRef`. Mutations create new arrays, and `modify` shallow-clones
object items. The component does not expose `column`/`left` slots, stable
column indices, a manually maintained column model, source window-resize
subscriptions, network loading, pagination, drag/drop, or reordering.
```

- [ ] **Step 4: Update the P33 Waterfall gap rows**

Replace the two existing rows in `docs/gap-matrix.md` with:

```markdown
## P33 Waterfall

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-waterfall` | `value`/`modelValue`, `addTime`, `idKey`, `columns`, `columnsMin`, `minColumnWidth`, add callbacks, `remove`, `clear`, `modify` | `UPWaterfall`, `UPWaterfallRef`, `modelValue`, `onUpdateModelValue`, retained RN aliases, `renderItem` | Source-shaped data binding and callbacks over FlashList masonry; measured item height with estimate fallback; immutable ref mutations | Emulated | `tests/components/UPWaterfall.test.tsx`; `docs/waterfall-source-compatibility.md` |
| `u-waterfall` | `column`/`left` slots, stable column arrays, stable `colIndex`, exact `columnHeights`, window-level `uni` resize behavior | No public equivalent | FlashList owns placement and measurement; container layout drives automatic columns | Deferred / Boundary | `src/components/waterfall/types.ts`; `docs/waterfall-source-compatibility.md` |
```

- [ ] **Step 5: Check documentation for unsupported API claims**

Run:

```powershell
rg -n -i "columnHeights|columnIndex|colIndex|columnList|network|pagination|drag|reorder|uni\\.onWindowResize" README.md docs
git diff --check
```

Expected: every match is an explicit limitation or host-owned boundary, and no unsupported API is presented as implemented.

- [ ] **Step 6: Commit the documentation**

```powershell
git add docs/waterfall-source-compatibility.md README.md docs/compatibility.md docs/gap-matrix.md
git commit -m "docs: finalize p37 waterfall source compatibility"
```

## Task 4: Run Full Quality Gates And Review The Public Diff

**Files:**
- Read: `src/components/waterfall/types.ts`
- Read: `src/components/waterfall/state.ts`
- Read: `src/components/waterfall/UPWaterfall.tsx`
- Read: `tests/components/UPWaterfall.test.tsx`
- Read: `README.md`
- Read: `docs/compatibility.md`
- Read: `docs/gap-matrix.md`
- Read: `docs/waterfall-source-compatibility.md`

**Interfaces:**
- Consumes: the complete P37 source compatibility implementation from Tasks 1-3.
- Produces: passing focused tests, repository quality gates, and a verified public diff with no unsupported source API.

- [ ] **Step 1: Run the focused waterfall suite**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: all helper, model binding, callback, measurement, ref, duplicate-id, pending queue, masonry, auto-column, scrolling, and default tests pass.

- [ ] **Step 2: Run the complete repository test suite**

Run:

```powershell
npm test
```

Expected: all repository test suites pass without open timer warnings.

- [ ] **Step 3: Run static, build, package, and whitespace checks**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: every command exits successfully. The package dry-run includes the changed source and documentation files through the existing package file rules.

- [ ] **Step 4: Review the public API diff**

Run:

```powershell
git diff HEAD~3..HEAD -- src/components/waterfall README.md docs
rg -n -i "columnHeights|columnIndex|colIndex|columnList|network|pagination|drag|reorder|uni\\.onWindowResize" src/components/waterfall README.md docs
git status --short
```

Confirm that the only new public source-compatible interfaces are `modelValue`, `onUpdateModelValue`, source-shaped after-add payloads, and `modify`; every search match for excluded behavior is a documented boundary. `git status --short` may still show unrelated pre-existing untracked files and they must remain untouched.

- [ ] **Step 5: Commit only final P37 corrections**

If the review identifies a P37-only defect, add a focused regression test and implementation fix, rerun the affected quality gates, then commit only the P37 files:

```powershell
git add src/components/waterfall tests/components/UPWaterfall.test.tsx README.md docs
git commit -m "fix: close p37 waterfall compatibility gap"
```

Do not create a no-op verification commit when no final correction is needed.

## Execution Notes

- Execute Tasks 1-4 in order.
- Use `superpowers:executing-plans` for inline execution or `superpowers:subagent-driven-development` for task-by-task delegated execution.
- Do not add a second virtualization engine or implement a manually measured column model.
- Keep all mutation arrays and modified records immutable.
- Report focused tests, full tests, typecheck, lint, build, pack dry-run, diff check, and any untouched pre-existing worktree files in the implementation handoff.
