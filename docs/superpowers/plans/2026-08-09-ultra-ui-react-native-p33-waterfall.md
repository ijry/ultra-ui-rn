# UPWaterfall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPWaterfall` with FlashList masonry virtualization, dynamic or automatic column counts, stable item identity, add/remove/clear behavior, scroll refs, configuration defaults, documentation, and tests.

**Architecture:** Keep the incoming `value` or `defaultValue` as the source data contract, reconcile it by `idKey`, and maintain a small internal display queue for `addTime` and ref mutations. Render the display list through `@shopify/flash-list` with `masonry` enabled; the component does not reimplement measurement, recycling, or column assignment.

**Tech Stack:** React, TypeScript, React Native, `@shopify/flash-list@^2.3.2`, existing config store and `getPx`, Jest fake timers, `@testing-library/react-native`, and the shared FlashList mock from the UPTree plan.

## Global Constraints

- Scope is `UPWaterfall`.
- `UPWaterfall` must support dynamic item heights, numeric or automatic columns, `idKey`, delayed additions, `remove`, `clear`, `getData`, scroll refs, controlled `value`, `defaultValue`, `onChange`, and after-add callbacks.
- Reuse the direct `@shopify/flash-list@^2.3.2` dependency and `tests/mocks/FlashList.tsx` created by the UPTree plan.
- Do not add a second virtualization engine or implement custom masonry measurement.
- Do not expose FlashList types, column arrays, or `columnIndex` through the public API.
- Set `optimizeItemArrangement` default to `false` so input order remains stable; allow explicit opt-in.
- `columns="auto"` uses measured width with `columnsMin` and `minColumnWidth`; before measurement use two columns.
- Do not mutate caller-provided `value` or `defaultValue` arrays.
- Use `apply_patch` for manual edits and do not revert unrelated worktree changes.
- Preserve existing repository patterns: component folders, named exports, `UP.setConfig`, focused Jest tests, and documentation in English.
- Execute the UPTree plan first when the shared dependency, FlashList mock, and P33 export conventions are not yet present.
- Commit each independently reviewable task with only its intended files.

---

## File Structure

- Modify: `src/config/defaults.ts` to add `UPWaterfallDefaults` and source defaults.
- Modify: `src/config/store.ts` to add the `waterfall` config override, initialization, and merge slot.
- Modify: `tests/config/store.test.ts` to verify waterfall defaults.
- Create: `src/components/waterfall/types.ts` for public data, render, props, and ref types.
- Create: `src/components/waterfall/state.ts` for id resolution, data reconciliation, add queues, and automatic column calculation.
- Create: `src/components/waterfall/UPWaterfall.tsx` for queue synchronization, FlashList masonry, callbacks, and refs.
- Create: `src/components/waterfall/index.ts` for waterfall exports.
- Modify: `src/components/index.ts` to export the waterfall family.
- Create: `tests/components/UPWaterfall.test.tsx` for pure and component behavior.
- Modify: `example/App.tsx` to show a compact waterfall example.
- Modify: `README.md` to document the React waterfall API.
- Modify: `docs/compatibility.md` to document masonry and data mutation boundaries.
- Modify: `docs/gap-matrix.md` to add the `u-waterfall` compatibility row.

### Task 1: Waterfall Config And Shared Infrastructure Check

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Consumes the direct FlashList dependency and Jest mock from the UPTree plan.
- Produces `UPProps['waterfall']`.
- Later tasks consume `useUPConfig().props.waterfall`.

- [ ] **Step 1: Verify shared P33 infrastructure**

Run:

```powershell
node -e "const p=require('./package.json'); if(p.dependencies?.['@shopify/flash-list'] !== '^2.3.2') process.exit(1); console.log('FlashList dependency present')"
Test-Path tests/mocks/FlashList.tsx
```

Expected:

```text
FlashList dependency present
True
```

If the dependency or mock is absent because this plan is being executed independently, complete the exact setup from Task 1 of `2026-08-09-ultra-ui-react-native-p33-tree.md` before continuing.

- [ ] **Step 2: Add failing waterfall config tests**

Append to `tests/config/store.test.ts`:

```tsx
import { getUPConfig, resetUPConfigForTests, setUPConfig } from '../../src/config/store';

it('merges waterfall defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.waterfall).toEqual(
    expect.objectContaining({
      addTime: 200,
      columns: 2,
      columnsMin: 2,
      idKey: 'id',
      minColumnWidth: 230,
      optimizeItemArrangement: false,
      value: [],
    }),
  );

  setUPConfig({
    props: {
      waterfall: {
        addTime: 0,
        columns: 'auto',
        minColumnWidth: 180,
      },
    },
  });

  expect(getUPConfig().props.waterfall).toEqual(
    expect.objectContaining({
      addTime: 0,
      columns: 'auto',
      minColumnWidth: 180,
      optimizeItemArrangement: false,
    }),
  );
});
```

- [ ] **Step 3: Run config tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected: FAIL because the `waterfall` config key does not exist.

- [ ] **Step 4: Add waterfall default types**

Add near the existing list defaults in `src/config/defaults.ts`:

```ts
export type UPWaterfallDefaults = {
  value: readonly unknown[];
  columns: number | 'auto';
  columnsMin: number;
  minColumnWidth: number | string;
  addTime: number;
  idKey: string;
  optimizeItemArrangement: boolean;
  estimatedItemSize: number | string;
  height: number | string;
};
```

Add `waterfall: UPWaterfallDefaults;` to `UPProps`.

- [ ] **Step 5: Add source defaults**

Add to `sourceDefaults.props`:

```ts
waterfall: Object.freeze({
  addTime: 200,
  columns: 2 as const,
  columnsMin: 2,
  estimatedItemSize: 160,
  height: '100%',
  idKey: 'id',
  minColumnWidth: 230,
  optimizeItemArrangement: false,
  value: Object.freeze([]) as readonly unknown[],
}),
```

- [ ] **Step 6: Wire config store overrides**

Add `waterfall?: Partial<UPProps['waterfall']>;` to `UPConfigOverrides.props`.

Add to `createSourceState().props`:

```ts
waterfall: { ...sourceDefaults.props.waterfall },
```

Add to `setUPConfig().props`:

```ts
waterfall: { ...state.props.waterfall, ...overrides.props?.waterfall },
```

- [ ] **Step 7: Run config tests**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit waterfall config**

Run:

```powershell
git add -- src/config/defaults.ts src/config/store.ts tests/config/store.test.ts
git commit -m "feat: add p33 waterfall config defaults"
```

### Task 2: Waterfall Types And Data Helpers

**Files:**
- Create: `src/components/waterfall/types.ts`
- Create: `src/components/waterfall/state.ts`
- Create: `src/components/waterfall/index.ts`
- Create: `tests/components/UPWaterfall.test.tsx`

**Interfaces:**
- Produces `UPWaterfallRenderPayload`, `UPWaterfallRef`, `UPWaterfallProps`, `resolveWaterfallId`, `reconcileWaterfallItems`, `createWaterfallAddQueue`, and `calculateWaterfallColumns`.
- Later `UPWaterfall.tsx` imports these exact names.

- [ ] **Step 1: Write failing helper tests**

Start `tests/components/UPWaterfall.test.tsx` with:

```tsx
import {
  calculateWaterfallColumns,
  createWaterfallAddQueue,
  reconcileWaterfallItems,
  resolveWaterfallId,
} from '../../src/components/waterfall/state';

const items = [
  { id: 'a', height: 80 },
  { id: 'b', height: 140 },
  { id: 'c', height: 100 },
];

it('resolves stable ids from the configured key', () => {
  expect(resolveWaterfallId({ code: 12 }, 0, 'code')).toBe(12);
  expect(resolveWaterfallId({ name: 'missing' }, 4, 'id')).toBe('index:4');
});

it('calculates numeric and automatic column counts', () => {
  expect(calculateWaterfallColumns(640, 3, 2, 230)).toBe(3);
  expect(calculateWaterfallColumns(640, 'auto', 2, 230)).toBe(2);
  expect(calculateWaterfallColumns(1000, 'auto', 2, 230)).toBe(4);
});

it('reconciles external data by id without mutating the input', () => {
  const source = [...items];
  const next = reconcileWaterfallItems(
    [{ id: 'a', height: 60 }, { id: 'b', height: 140 }],
    source,
    'id',
  );

  expect(next.displayed).toEqual(source);
  expect(next.removedIds).toEqual([]);
  expect(source).toEqual(items);
});

it('creates a queue only for new ids', () => {
  expect(createWaterfallAddQueue(items.slice(0, 1), items, 'id')).toEqual([
    items[1],
    items[2],
  ]);
});
```

- [ ] **Step 2: Run helper tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: FAIL because the waterfall state module does not exist.

- [ ] **Step 3: Define public waterfall types**

Create `src/components/waterfall/types.ts`:

```ts
import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';
import type { UPKey } from '../tree/types';

export type UPWaterfallRenderPayload<T> = {
  item: T;
  index: number;
  id: UPKey;
};

export type UPWaterfallRef<T = unknown> = {
  remove: (id: UPKey) => boolean;
  clear: () => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToTop: (animated?: boolean) => void;
  getData: () => readonly T[];
};

export type UPWaterfallProps<T = unknown> = {
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
  onAfterAddOne?: (item: T, index: number) => void;
  onAfterAddAll?: () => void;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
};
```

Export `UPKey` from `src/components/tree/types.ts` through the tree index so the waterfall public type can reuse the repository-wide key type.

- [ ] **Step 4: Implement id and column helpers**

Create `src/components/waterfall/state.ts`:

```ts
import { getPx } from '../../utils';
import type { UPKey } from '../tree/types';

export function resolveWaterfallId<T>(
  item: T,
  index: number,
  idKey: string,
): UPKey {
  if (item !== null && typeof item === 'object') {
    const value = (item as Record<string, unknown>)[idKey];
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (value !== undefined && value !== null) return String(value);
  }
  return `index:${index}`;
}

export function calculateWaterfallColumns(
  width: number,
  columns: number | 'auto',
  columnsMin: number,
  minColumnWidth: number | string,
): number {
  if (columns !== 'auto') return Math.max(1, Math.floor(Number(columns) || 1));
  const minimum = Math.max(1, Math.floor(Number(columnsMin) || 1));
  const itemWidth = Math.max(1, getPx(minColumnWidth));
  if (!Number.isFinite(width) || width <= 0) return 2;
  return Math.max(minimum, Math.floor(width / itemWidth));
}
```

- [ ] **Step 5: Implement reconciliation and queue helpers**

Add exact return types:

```ts
export type UPWaterfallReconcileResult<T> = {
  displayed: T[];
  removedIds: UPKey[];
  replacedIds: UPKey[];
};

export function reconcileWaterfallItems<T>(
  displayed: readonly T[],
  incoming: readonly T[],
  idKey: string,
): UPWaterfallReconcileResult<T> {
  const incomingIds = new Set(incoming.map((item, index) => resolveWaterfallId(item, index, idKey)));
  const removedIds = displayed
    .map((item, index) => resolveWaterfallId(item, index, idKey))
    .filter((id) => !incomingIds.has(id));
  const previousById = new Map(
    displayed.map((item, index) => [resolveWaterfallId(item, index, idKey), item]),
  );
  const replacedIds = incoming
    .map((item, index) => resolveWaterfallId(item, index, idKey))
    .filter((id) => previousById.has(id));

  return {
    displayed: [...incoming],
    removedIds,
    replacedIds,
  };
}

export function createWaterfallAddQueue<T>(
  displayed: readonly T[],
  incoming: readonly T[],
  idKey: string,
): T[] {
  const existing = new Set(
    displayed.map((item, index) => resolveWaterfallId(item, index, idKey)),
  );
  return incoming.filter((item, index) => {
    const id = resolveWaterfallId(item, index, idKey);
    if (existing.has(id)) return false;
    existing.add(id);
    return true;
  });
}
```

The component will use these helpers to identify additions and removals, while preserving incoming array order.

- [ ] **Step 6: Export waterfall helpers**

Create `src/components/waterfall/index.ts`:

```ts
export * from './state';
export * from './types';
export * from './UPWaterfall';
```

- [ ] **Step 7: Run helper tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: PASS for the helper tests; component tests remain pending until Task 3.

- [ ] **Step 8: Commit waterfall model**

Run:

```powershell
git add -- src/components/waterfall/types.ts src/components/waterfall/state.ts src/components/waterfall/index.ts tests/components/UPWaterfall.test.tsx
git commit -m "feat: add waterfall data helpers"
```

### Task 3: UPWaterfall Masonry Component And Ref

**Files:**
- Create: `src/components/waterfall/UPWaterfall.tsx`
- Modify: `src/components/index.ts`
- Modify: `tests/components/UPWaterfall.test.tsx`

**Interfaces:**
- Consumes `UPWaterfallProps`, `UPWaterfallRef`, `resolveWaterfallId`, `reconcileWaterfallItems`, `createWaterfallAddQueue`, and `calculateWaterfallColumns`.
- Produces the public `UPWaterfall` generic forward-ref component.

- [ ] **Step 1: Add failing component tests**

Append to `tests/components/UPWaterfall.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot, UPWaterfall, type UPWaterfallRef } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const cards = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
];

it('passes masonry and numeric columns to FlashList', () => {
  const screen = renderRoot(
    <UPWaterfall
      columns={3}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={cards}
    />,
  );

  const list = screen.getByTestId('up-waterfall-list');
  expect(list.props.masonry).toBe(true);
  expect(list.props.numColumns).toBe(3);
  expect(screen.getByText('A')).toBeTruthy();
});

it('computes automatic columns after container layout', () => {
  const screen = renderRoot(
    <UPWaterfall
      columns="auto"
      minColumnWidth={200}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={cards}
    />,
  );

  fireEvent(screen.getByTestId('up-waterfall'), 'layout', {
    nativeEvent: { layout: { height: 400, width: 640, x: 0, y: 0 } },
  });

  expect(screen.getByTestId('up-waterfall-list').props.numColumns).toBe(3);
});

it('queues additions and emits after-add callbacks', () => {
  jest.useFakeTimers();
  const onAfterAddOne = jest.fn();
  const onAfterAddAll = jest.fn();
  const screen = renderRoot(
    <UPWaterfall
      addTime={20}
      onAfterAddAll={onAfterAddAll}
      onAfterAddOne={onAfterAddOne}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={[cards[0]]}
    />,
  );

  screen.rerender(
    <UPRoot>
      <UPWaterfall
        addTime={20}
        onAfterAddAll={onAfterAddAll}
        onAfterAddOne={onAfterAddOne}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        value={cards}
      />
    </UPRoot>,
  );

  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith(cards[1], 1);
  act(() => jest.advanceTimersByTime(20));
  expect(onAfterAddOne).toHaveBeenCalledWith(cards[2], 2);
  expect(onAfterAddAll).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});

it('supports remove, clear, and scroll refs without mutating value', async () => {
  const ref = React.createRef<UPWaterfallRef>();
  const onChange = jest.fn();
  const source = [...cards];
  renderRoot(
    <UPWaterfall
      onChange={onChange}
      ref={ref}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      value={source}
    />,
  );

  expect(ref.current?.remove('b')).toBe(true);
  expect(source).toEqual(cards);
  expect(onChange).toHaveBeenCalledWith([cards[0], cards[2]]);
  ref.current?.clear();
  expect(onChange).toHaveBeenLastCalledWith([]);
  ref.current?.scrollToIndex(0);
  ref.current?.scrollToTop();
});

it('merges waterfall defaults through UP.setConfig', () => {
  act(() => {
    UP.setConfig({ props: { waterfall: { columns: 4, height: 220 } } });
  });

  const screen = renderRoot(
    <UPWaterfall renderItem={({ item }) => <Text>{item.title}</Text>} value={cards} />,
  );
  expect(screen.getByTestId('up-waterfall').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 220 })]),
  );
  expect(screen.getByTestId('up-waterfall-list').props.numColumns).toBe(4);
});
```

- [ ] **Step 2: Run component tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx
```

Expected: FAIL because `UPWaterfall` is not implemented or exported.

- [ ] **Step 3: Implement controlled and uncontrolled display state**

Create `src/components/waterfall/UPWaterfall.tsx` and resolve props:

```tsx
const config = useUPConfig();
const props = { ...config.props.waterfall, ...input } as Required<
  Pick<UPWaterfallProps<T>, 'addTime' | 'columns' | 'columnsMin' | 'estimatedItemSize' | 'height' | 'idKey' | 'minColumnWidth' | 'optimizeItemArrangement'>
> & UPWaterfallProps<T>;
const sourceValue = input.value !== undefined
  ? input.value
  : input.defaultValue ?? props.value;
const [displayed, setDisplayed] = useState<readonly T[]>(() => [...sourceValue]);
const [pending, setPending] = useState<readonly T[]>([]);
const displayedRef = useRef<readonly T[]>(sourceValue);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const replaceDisplayed = useCallback((next: readonly T[]) => {
  displayedRef.current = next;
  setDisplayed(next);
}, []);
```

On source changes:

```tsx
useEffect(() => {
  const incoming = sourceValue;
  const reconciled = reconcileWaterfallItems(displayedRef.current, incoming, props.idKey);
  const additions = createWaterfallAddQueue(displayedRef.current, incoming, props.idKey);
  const additionIds = new Set(
    additions.map((item, index) => resolveWaterfallId(item, index, props.idKey)),
  );
  const existingIncoming = reconciled.displayed.filter((item, index) => (
    !additionIds.has(resolveWaterfallId(item, index, props.idKey))
  ));

  if (props.addTime <= 0) {
    replaceDisplayed([...incoming]);
    setPending([]);
  } else {
    replaceDisplayed(existingIncoming);
    setPending(additions);
  }
}, [props.addTime, props.idKey, replaceDisplayed, sourceValue]);
```

When `value` is controlled, do not mutate the incoming array. When `value` changes again, it replaces the display list and cancels pending items absent from the new value.

- [ ] **Step 4: Implement the add queue**

Process one pending item per timer:

```tsx
useEffect(() => {
  if (pending.length === 0) return undefined;

  timerRef.current = setTimeout(() => {
    const [nextItem, ...remaining] = pending;
    const nextIndex = displayedRef.current.length;
    replaceDisplayed([...displayedRef.current, nextItem]);
    setPending(remaining);
    props.onAfterAddOne?.(nextItem, nextIndex);
    if (remaining.length === 0) props.onAfterAddAll?.();
  }, Math.max(0, Number(props.addTime)));

  return () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
  };
}, [pending, props.addTime, props.onAfterAddAll, props.onAfterAddOne, replaceDisplayed]);
```

Use a ref or effect-safe callback if needed to ensure a single pending timer and no callback after unmount.

- [ ] **Step 5: Implement width measurement and FlashList masonry**

Track the container width:

```tsx
const [containerWidth, setContainerWidth] = useState(0);
const columnCount = calculateWaterfallColumns(
  containerWidth,
  props.columns,
  props.columnsMin,
  props.minColumnWidth,
);
```

Render:

```tsx
<View
  onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
  style={[{ height: props.height, overflow: 'hidden' }, input.customStyle]}
  testID="up-waterfall"
>
  <FlashList
    data={displayed}
    estimatedItemSize={getPx(props.estimatedItemSize)}
    keyExtractor={(item, index) => String(resolveWaterfallId(item, index, props.idKey))}
    masonry
    numColumns={columnCount}
    onEndReached={input.onEndReached}
    onScroll={(event) => input.onScroll?.(event.nativeEvent.contentOffset.y)}
    optimizeItemArrangement={Boolean(props.optimizeItemArrangement)}
    ref={listRef}
    renderItem={({ item, index }) => input.renderItem?.({
      id: resolveWaterfallId(item, index, props.idKey),
      index,
      item,
    })}
    testID="up-waterfall-list"
  />
  {displayed.length === 0 ? input.empty : null}
</View>
```

Do not pass a `columnIndex` to `renderItem`. The FlashList engine owns masonry assignment.

- [ ] **Step 6: Implement ref methods and mutation events**

Expose:

```tsx
const emitChange = (next: readonly T[]) => {
  setDisplayed(next);
  props.onChange?.(next);
};

useImperativeHandle(ref, () => ({
  remove: (id) => {
    const index = displayed.findIndex(
      (item, itemIndex) => resolveWaterfallId(item, itemIndex, props.idKey) === id,
    );
    if (index < 0) return false;
    emitChange(displayed.filter((_item, itemIndex) => itemIndex !== index));
    setPending((queue) => queue.filter(
      (item, itemIndex) => resolveWaterfallId(item, itemIndex, props.idKey) !== id,
    ));
    return true;
  },
  clear: () => {
    setPending([]);
    emitChange([]);
  },
  getData: () => displayed,
  scrollToIndex: (index, animated = false) => {
    if (index < 0 || index >= displayed.length) return;
    listRef.current?.scrollToIndex({ index, animated });
  },
  scrollToTop: (animated = false) => {
    listRef.current?.scrollToOffset({ offset: 0, animated });
  },
}), [displayed, props.idKey, props.onChange]);
```

When `remove` or `clear` is called in controlled mode, emit `onChange` but keep the external `value` authoritative on the next prop update.

- [ ] **Step 7: Add id warning behavior**

In the normalization/reconciliation path, track ids in a `Set`. In development:

```ts
if (__DEV__ && ids.has(id)) {
  console.warn(`[UPWaterfall] Duplicate id "${String(id)}" at index ${index}.`);
}
```

Items without an `idKey` value use `index:${index}` for rendering and cannot provide stable id removal across reorder.

- [ ] **Step 8: Export the component**

Modify `src/components/index.ts`:

```ts
export * from './waterfall';
```

- [ ] **Step 9: Run waterfall tests and typecheck**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx tests/config/store.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 10: Commit the waterfall component**

Run:

```powershell
git add -- src/components/waterfall src/components/index.ts tests/components/UPWaterfall.test.tsx
git commit -m "feat: add UPWaterfall"
```

### Task 4: Waterfall Example And Documentation

**Files:**
- Modify: `example/App.tsx`
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes the public `UPWaterfall` exports from Task 3.
- Produces the user-facing waterfall example and compatibility boundary.

- [ ] **Step 1: Add a compact waterfall example**

Add to `example/App.tsx`:

```tsx
const demoWaterfallItems = [
  { id: 'card-1', title: 'Short card', height: 96 },
  { id: 'card-2', title: 'Tall card', height: 156 },
  { id: 'card-3', title: 'Medium card', height: 124 },
  { id: 'card-4', title: 'Another card', height: 180 },
];
```

Render:

```tsx
<Text style={styles.section}>Waterfall</Text>
<UPWaterfall
  columns={2}
  height={260}
  renderItem={({ item }) => (
    <UPCard customStyle={{ height: item.height, margin: 4 }} title={item.title}>
      <UPText text={`Item ${item.id}`} />
    </UPCard>
  )}
  value={demoWaterfallItems}
/>
```

Keep the example item heights explicit so the native masonry path can be visually inspected without an image service.

- [ ] **Step 2: Document the React API**

Add to `README.md`:

```md
### Waterfall

`UPWaterfall` uses FlashList masonry for dynamic-height items. Use
`columns={2}` for a fixed layout or `columns="auto"` with `minColumnWidth`
for width-based column calculation. The component uses `value` and `onChange`
for the React equivalent of the source `v-model`.

```tsx
<UPWaterfall
  columns="auto"
  minColumnWidth={220}
  value={items}
  renderItem={({ item }) => <ProductCard item={item} />}
/>
```

`remove(id)` and `clear()` are exposed through `UPWaterfallRef`. The render
callback does not receive a column index because masonry placement can change
after measurement.
```

- [ ] **Step 3: Update compatibility documentation**

Append to `docs/compatibility.md`:

```md
## P33 waterfall

`UPWaterfall` maps the source waterfall data model to a React Native
FlashList masonry surface. It supports dynamic item heights, fixed or
automatic columns, stable `idKey` identity, delayed add callbacks, ref-driven
remove/clear operations, and scroll methods.

The React API uses `value` / `defaultValue` and `onChange`. The source column
slot is represented by per-item `renderItem`; internal masonry column arrays
and `columnIndex` are deliberately not public because measurement can change
placement. Pagination and network loading remain application-owned through
`onEndReached`.
```

- [ ] **Step 4: Add the gap matrix row**

Add a P33 waterfall section to `docs/gap-matrix.md`:

```md
## P33 Waterfall

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-waterfall` | v-model list, columns, auto column width, id key, delayed add events, clear/remove refs, scoped column slot | `UPWaterfall`, `UPWaterfallRef`, `renderItem` | FlashList masonry renders dynamic-height items; fixed or measured automatic columns; `value` remains the external source of truth | Emulated | `tests/components/UPWaterfall.test.tsx` |
| `u-waterfall` | stable internal column arrays and source CSS layout behavior | Per-item render callback and documented limits | Masonry placement is engine-owned; column indices are not stable public data | Deferred / Boundary | Component prop types |
```

- [ ] **Step 5: Run documentation checks**

Run:

```powershell
npm run typecheck
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit waterfall docs**

Run:

```powershell
git add -- example/App.tsx README.md docs/compatibility.md docs/gap-matrix.md
git commit -m "docs: add P33 waterfall guidance"
```

### Task 5: Waterfall Validation And Native Smoke

**Files:**
- Test all files changed by Tasks 1 through 4.
- Inspect: `example/App.tsx`.

**Interfaces:**
- Consumes the complete `UPWaterfall` implementation and shared FlashList setup.
- Produces validation evidence for P33 handoff.

- [ ] **Step 1: Run focused tests with fake timer cleanup**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPWaterfall.test.tsx tests/config/store.test.ts
```

Expected: PASS with no open timer warnings.

- [ ] **Step 2: Run the full Jest suite**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 3: Run static and package checks**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: PASS with the waterfall source, declarations, dependency metadata, README, and docs included as intended.

- [ ] **Step 4: Verify the example build path**

From the repository root, verify the example can resolve the package and FlashList:

```powershell
Test-Path node_modules/@shopify/flash-list
rg -n "UPWaterfall|demoWaterfallItems" example/App.tsx
```

Expected:

```text
True
```

and both identifiers are present in the example.

- [ ] **Step 5: Inspect scoped status**

Run:

```powershell
git status --short
```

Expected: no uncommitted P33 waterfall changes. Pre-existing unrelated untracked files may remain and must not be reverted.
