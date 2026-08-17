# P31 Interaction Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add React Native `UPDragsort`, `UPSignature`, and `UPGuide` components with uview-plus-compatible public APIs where React Native can support them.

**Architecture:** Each component is self-contained under `src/components/<name>` and merges source defaults through `useUPConfig()`. `UPDragsort` uses deterministic `PanResponder` math, `UPSignature` composes `UPCanvas`, and `UPGuide` renders through the existing root overlay host.

**Tech Stack:** React, TypeScript, React Native core primitives, existing `UPCanvas`, existing `UPIcon`, existing `UPSlider`, existing `UPRoot` overlay infrastructure, Jest, and `@testing-library/react-native`.

## Global Constraints

- Work directly on `main`.
- Do not run `git add`, `git commit`, `git push`, `git reset`, or `git clean`.
- Modify files with `apply_patch`.
- Do not add new native dependencies for P31.
- Reuse React Native core primitives, existing overlay infrastructure, and existing `UPCanvas`.
- Keep API compatibility with uview-plus where practical.
- Treat CSS classes, `movable-area`, `uni` storage, page-level touch prevention, and exact CSS transitions as retained no-ops or host-adapter responsibilities.
- No git staging or commits.

---

## File Structure

- Create `src/components/dragsort/UPDragsort.tsx`: local order state, drag math helpers, `PanResponder` handlers, and render callback bridge.
- Create `src/components/dragsort/index.ts`: public exports for the dragsort component and types.
- Create `tests/components/UPDragsort.test.tsx`: focused reorder, disabled, direction, handler, and config tests.
- Modify `src/components/canvas/types.ts`: add `moveTo` and `lineTo` methods to `UPCanvasRef`.
- Modify `src/components/canvas/UPCanvas.tsx`: enqueue `moveTo` and `lineTo` commands.
- Create `src/components/signature/UPSignature.tsx`: canvas-backed path recording, redraw, toolbar, export, and ref methods.
- Create `src/components/signature/index.ts`: public exports for the signature component and types.
- Create `tests/components/UPSignature.test.tsx`: focused canvas command, ref method, export, empty confirm, and config tests.
- Create `src/components/guide/UPGuide.tsx`: overlay-driven onboarding pager, storage adapter integration, callbacks, and ref methods.
- Create `src/components/guide/index.ts`: public exports for the guide component and types.
- Create `tests/components/UPGuide.test.tsx`: focused visibility, paging, skip, finish, once-storage, reset, and config tests.
- Modify `src/config/defaults.ts`: add `dragsort`, `signature`, and `guide` default types and source defaults.
- Modify `src/config/store.ts`: add config override slots, state initialization, and merge behavior for the three components.
- Modify `src/components/index.ts`: export `dragsort`, `signature`, and `guide`.
- Modify `example/App.tsx`: add compact examples for the three P31 components.
- Modify `docs/compatibility.md`: document P31 compatibility and retained no-op behavior.
- Modify `docs/gap-matrix.md`: mark P31 coverage and platform limits.

---

### Task 1: UPDragsort

**Files:**
- Create: `src/components/dragsort/UPDragsort.tsx`
- Create: `src/components/dragsort/index.ts`
- Create: `tests/components/UPDragsort.test.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `useUPConfig()`, `getPx(value: UPDimension): number`, `range(min: number, max: number, value: number): number`, `PanResponder`.
- Produces: `UPDragsort`, `UPDragsortProps<T>`, `UPDragsortDirection`, `UPDragsortItem`, `UPDragsortRenderPayload<T>`, `moveItem<T>()`, `getDragsortTargetIndex()`.
- Config key: `config.props.dragsort`.
- Callback: `onDragEnd(nextList: readonly T[]): void`.

- [ ] **Step 1: Write failing dragsort tests**

Create `tests/components/UPDragsort.test.tsx` with these tests:

```tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { UP, UPDragsort, UPRoot, moveItem } from '../../src';

const rows = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Charlie' },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function gesture(dx: number, dy: number) {
  return {
    dx,
    dy,
    moveX: dx,
    moveY: dy,
    numberActiveTouches: 1,
    stateID: 1,
    vx: 0,
    vy: 0,
    x0: 0,
    y0: 0,
  };
}

function handlers(screen: ReturnType<typeof renderRoot>, index: number) {
  return screen.getByTestId(`up-dragsort-item-${index}`).props;
}

it('moves array items without mutating the source list', () => {
  const source = ['A', 'B', 'C'];
  expect(moveItem(source, 0, 2)).toEqual(['B', 'C', 'A']);
  expect(source).toEqual(['A', 'B', 'C']);
  expect(moveItem(source, 1, 1)).toEqual(['A', 'B', 'C']);
});

it('renders source labels and vertical drag emits reordered list', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(<UPDragsort initialList={rows} itemHeight={50} onDragEnd={onDragEnd} />);

  expect(screen.getByText('Alpha')).toBeTruthy();
  expect(screen.getByText('Beta')).toBeTruthy();
  expect(screen.getByText('Charlie')).toBeTruthy();

  act(() => {
    handlers(screen, 0).onResponderGrant({}, gesture(0, 0));
    handlers(screen, 0).onResponderMove({}, gesture(0, 110));
    handlers(screen, 0).onResponderRelease({}, gesture(0, 110));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('uses horizontal item width for horizontal mode', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort direction="horizontal" initialList={rows} itemWidth={80} onDragEnd={onDragEnd} />,
  );

  act(() => {
    handlers(screen, 0).onResponderGrant({}, gesture(0, 0));
    handlers(screen, 0).onResponderMove({}, gesture(170, 0));
    handlers(screen, 0).onResponderRelease({}, gesture(170, 0));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('uses columns, width, and height for all-direction grid mode', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort columns={2} direction="all" initialList={rows} itemHeight={50} itemWidth={80} onDragEnd={onDragEnd} />,
  );

  act(() => {
    handlers(screen, 0).onResponderGrant({}, gesture(0, 0));
    handlers(screen, 0).onResponderMove({}, gesture(90, 60));
    handlers(screen, 0).onResponderRelease({}, gesture(90, 60));
  });

  expect(onDragEnd).toHaveBeenCalledWith([rows[1], rows[2], rows[0]]);
});

it('does not reorder when global drag or item drag is disabled', () => {
  const globalEnd = jest.fn();
  const itemEnd = jest.fn();
  const itemDisabled = [{ id: 'a', label: 'Alpha', draggable: false }, rows[1], rows[2]];

  const global = renderRoot(<UPDragsort draggable={false} initialList={rows} onDragEnd={globalEnd} />);
  act(() => {
    handlers(global, 0).onResponderGrant({}, gesture(0, 0));
    handlers(global, 0).onResponderMove({}, gesture(0, 100));
    handlers(global, 0).onResponderRelease({}, gesture(0, 100));
  });
  expect(globalEnd).not.toHaveBeenCalled();

  const item = renderRoot(<UPDragsort initialList={itemDisabled} onDragEnd={itemEnd} />);
  act(() => {
    handlers(item, 0).onResponderGrant({}, gesture(0, 0));
    handlers(item, 0).onResponderMove({}, gesture(0, 100));
    handlers(item, 0).onResponderRelease({}, gesture(0, 100));
  });
  expect(itemEnd).not.toHaveBeenCalled();
});

it('uses handler-only dragging and exposes dragging render state', () => {
  const onDragEnd = jest.fn();
  const screen = renderRoot(
    <UPDragsort
      initialList={rows}
      onDragEnd={onDragEnd}
      renderHandler={({ dragging, item }) => <Text>{dragging ? `moving-${item.id}` : `handle-${item.id}`}</Text>}
      renderItem={({ dragging, item }) => <Text>{dragging ? `dragging-${item.id}` : item.label}</Text>}
    />,
  );

  act(() => {
    screen.getByTestId('up-dragsort-handler-0').props.onResponderGrant({}, gesture(0, 0));
  });
  expect(screen.getByText('dragging-a')).toBeTruthy();
  expect(screen.getByText('moving-a')).toBeTruthy();

  act(() => {
    screen.getByTestId('up-dragsort-handler-0').props.onResponderMove({}, gesture(0, 100));
    screen.getByTestId('up-dragsort-handler-0').props.onResponderRelease({}, gesture(0, 100));
  });
  expect(onDragEnd).toHaveBeenCalledTimes(1);
});

it('merges UP.setConfig defaults for dragsort', () => {
  act(() => {
    UP.setConfig({ props: { dragsort: { itemHeight: 64 } } });
  });
  const screen = renderRoot(<UPDragsort initialList={rows} />);
  expect(StyleSheet.flatten(screen.getByTestId('up-dragsort').props.style)).toEqual(
    expect.objectContaining({ height: 192 }),
  );
});
```

- [ ] **Step 2: Run dragsort tests to verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPDragsort.test.tsx
```

Expected result: fail because `UPDragsort`, `moveItem`, and the `dragsort` config key do not exist.

- [ ] **Step 3: Add dragsort defaults and config merge**

In `src/config/defaults.ts`, import `UPDimension` is already present through existing defaults; add the type near other component default types:

```ts
export type UPDragsortDefaults = {
  columns: number;
  direction: 'vertical' | 'horizontal' | 'all';
  draggable: boolean;
  initialList: readonly unknown[];
  itemHeight: UPDimension;
  itemWidth: UPDimension;
  vibrate: boolean;
};
```

Add the prop key to `UPProps`:

```ts
dragsort: UPDragsortDefaults;
```

Add the source defaults beside the P30 list defaults:

```ts
dragsort: Object.freeze({
  columns: 3,
  direction: 'vertical' as const,
  draggable: true,
  initialList: Object.freeze([]) as readonly unknown[],
  itemHeight: 50,
  itemWidth: 100,
  vibrate: true,
}),
```

In `src/config/store.ts`, add `dragsort?: Partial<UPProps['dragsort']>;` to the overrides type, initialize `dragsort: { ...sourceDefaults.props.dragsort }`, and merge with:

```ts
dragsort: { ...state.props.dragsort, ...overrides.props?.dragsort },
```

- [ ] **Step 4: Implement dragsort helpers and component**

Create `src/components/dragsort/UPDragsort.tsx`:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';

export type UPDragsortDirection = 'vertical' | 'horizontal' | 'all';
export type UPDragsortItem = Record<string, unknown> & {
  draggable?: boolean;
  id?: number | string;
  label?: React.ReactNode;
};
export type UPDragsortRenderPayload<T = UPDragsortItem> = {
  dragging: boolean;
  index: number;
  item: T;
};
export type UPDragsortProps<T = UPDragsortItem> = {
  children?: React.ReactNode | ((payload: UPDragsortRenderPayload<T>) => React.ReactNode);
  columns?: number;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  direction?: UPDragsortDirection;
  draggable?: boolean;
  initialList?: readonly T[];
  itemHeight?: UPDimension;
  itemWidth?: UPDimension;
  renderHandler?: (payload: UPDragsortRenderPayload<T>) => React.ReactNode;
  renderItem?: (payload: UPDragsortRenderPayload<T>) => React.ReactNode;
  vibrate?: boolean;
  onDragEnd?: (nextList: readonly T[]) => void;
};

type DragState = {
  fromIndex: number;
  targetIndex: number;
};

function clampIndex(value: number, length: number): number {
  return range(0, Math.max(0, length - 1), value);
}

function safePx(value: UPDimension | undefined, fallback: number): number {
  const next = getPx(value ?? fallback);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  if (fromIndex === toIndex) return next;
  if (fromIndex < 0 || fromIndex >= next.length) return next;
  if (toIndex < 0 || toIndex >= next.length) return next;
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function getDragsortTargetIndex(options: {
  columns: number;
  direction: UPDragsortDirection;
  dx: number;
  dy: number;
  fromIndex: number;
  itemHeight: number;
  itemWidth: number;
  length: number;
}): number {
  const { columns, direction, dx, dy, fromIndex, itemHeight, itemWidth, length } = options;
  if (length <= 0) return 0;
  if (direction === 'horizontal') {
    return clampIndex(fromIndex + Math.round(dx / itemWidth), length);
  }
  if (direction === 'all') {
    const safeColumns = Math.max(1, Math.floor(columns));
    const startRow = Math.floor(fromIndex / safeColumns);
    const startColumn = fromIndex % safeColumns;
    const nextRow = Math.max(0, startRow + Math.round(dy / itemHeight));
    const nextColumn = range(0, safeColumns - 1, startColumn + Math.round(dx / itemWidth));
    return clampIndex(nextRow * safeColumns + nextColumn, length);
  }
  return clampIndex(fromIndex + Math.round(dy / itemHeight), length);
}

function getItemKey(item: unknown, index: number): string {
  if (item && typeof item === 'object') {
    const keyed = item as { id?: number | string; key?: number | string };
    const key = keyed.id ?? keyed.key;
    if (key !== undefined) return String(key);
  }
  return `up-dragsort-${index}`;
}

function defaultContent(item: unknown): React.ReactNode {
  if (item && typeof item === 'object' && 'label' in item) {
    return (item as { label?: React.ReactNode }).label;
  }
  return <Text>{String(item)}</Text>;
}

function InnerUPDragsort<T = UPDragsortItem>(input: UPDragsortProps<T>) {
  const config = useUPConfig();
  const props = { ...config.props.dragsort, ...input } as UPDragsortProps<T> & Required<
    Pick<UPDragsortProps<T>, 'columns' | 'direction' | 'draggable' | 'initialList' | 'itemHeight' | 'itemWidth' | 'vibrate'>
  >;
  const [items, setItems] = useState<T[]>(() => [...props.initialList]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemHeight = safePx(props.itemHeight, 50);
  const itemWidth = safePx(props.itemWidth, 100);
  const columns = props.direction === 'all' ? Math.max(1, Math.floor(Number(props.columns))) : items.length || 1;
  const rows = props.direction === 'all' ? Math.ceil(items.length / columns) : 1;

  useEffect(() => {
    setItems([...(input.initialList ?? props.initialList)]);
  }, [input.initialList, props.initialList]);

  const startDrag = useCallback((index: number) => {
    const item = items[index] as { draggable?: boolean } | undefined;
    if (!props.draggable || item?.draggable === false) return;
    const next = { fromIndex: index, targetIndex: index };
    dragRef.current = next;
    setDrag(next);
  }, [items, props.draggable]);

  const moveDrag = useCallback((gesture: PanResponderGestureState) => {
    const current = dragRef.current;
    if (!current) return;
    const targetIndex = getDragsortTargetIndex({
      columns,
      direction: props.direction,
      dx: gesture.dx,
      dy: gesture.dy,
      fromIndex: current.fromIndex,
      itemHeight,
      itemWidth,
      length: items.length,
    });
    const next = { ...current, targetIndex };
    dragRef.current = next;
    setDrag(next);
  }, [columns, itemHeight, itemWidth, items.length, props.direction]);

  const finishDrag = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current || current.fromIndex === current.targetIndex) return;
    setItems((latest) => {
      const next = moveItem(latest, current.fromIndex, current.targetIndex);
      input.onDragEnd?.(next);
      return next;
    });
  }, [input]);

  const createResponder = useCallback((index: number) => PanResponder.create({
    onMoveShouldSetPanResponder: () => Boolean(props.draggable),
    onMoveShouldSetPanResponderCapture: () => Boolean(props.draggable),
    onPanResponderGrant: () => startDrag(index),
    onPanResponderMove: (_event: GestureResponderEvent, gesture) => moveDrag(gesture),
    onPanResponderRelease: finishDrag,
    onPanResponderTerminate: finishDrag,
    onStartShouldSetPanResponder: () => Boolean(props.draggable),
  }), [finishDrag, moveDrag, props.draggable, startDrag]);

  const responders = useMemo(() => items.map((_item, index) => createResponder(index)), [createResponder, items]);
  const width = props.direction === 'all' || props.direction === 'horizontal' ? itemWidth * items.length : itemWidth;
  const height = props.direction === 'all' ? rows * itemHeight : itemHeight * items.length;

  return (
    <View style={[{ height, position: 'relative', width }, input.customStyle]} testID="up-dragsort">
      {items.map((item, index) => {
        const dragging = drag?.fromIndex === index;
        const displayIndex = drag?.fromIndex === index ? drag.targetIndex : index;
        const row = props.direction === 'all' ? Math.floor(displayIndex / columns) : 0;
        const column = props.direction === 'all' ? displayIndex % columns : index;
        const payload = { dragging, index, item };
        const content = props.renderItem?.(payload)
          ?? (typeof input.children === 'function' ? input.children(payload) : input.children)
          ?? defaultContent(item);
        const panHandlers = responders[index]?.panHandlers ?? {};
        const itemHandlers = props.renderHandler ? {} : panHandlers;
        const handler = props.renderHandler ? (
          <View testID={`up-dragsort-handler-${index}`} {...panHandlers}>
            {props.renderHandler(payload)}
          </View>
        ) : null;

        return (
          <View
            key={getItemKey(item, index)}
            style={{
              height: itemHeight,
              left: props.direction === 'vertical' ? 0 : column * itemWidth,
              opacity: dragging ? 0.85 : 1,
              position: 'absolute',
              top: props.direction === 'horizontal' ? 0 : row * itemHeight,
              width: itemWidth,
            }}
            testID={`up-dragsort-item-${index}`}
            {...itemHandlers}
          >
            {handler}
            {content}
          </View>
        );
      })}
    </View>
  );
}

export const UPDragsort = InnerUPDragsort as <T = UPDragsortItem>(
  props: UPDragsortProps<T>,
) => React.JSX.Element;
```

Create `src/components/dragsort/index.ts`:

```ts
export * from './UPDragsort';
```

Modify `src/components/index.ts`:

```ts
export * from './dragsort';
```

- [ ] **Step 5: Run dragsort tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPDragsort.test.tsx
```

Expected result: pass.

---

### Task 2: UPSignature

**Files:**
- Modify: `src/components/canvas/types.ts`
- Modify: `src/components/canvas/UPCanvas.tsx`
- Create: `src/components/signature/UPSignature.tsx`
- Create: `src/components/signature/index.ts`
- Create: `tests/components/UPSignature.test.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `UPCanvas`, `UPCanvasRef`, `UPCanvasProps`, `UPIcon`, `UPSlider`, `getPx`, `useUPConfig()`.
- Produces: `UPSignature`, `UPSignatureProps`, `UPSignatureRef`, `UPSignaturePoint`, `UPSignaturePath`.
- Extends: `UPCanvasRef.moveTo(x: number, y: number): Promise<void>` and `UPCanvasRef.lineTo(x: number, y: number): Promise<void>`.
- Config key: `config.props.signature`.
- Ref methods: `clear(): void`, `undo(): void`, `confirm(): Promise<void>`, `isEmpty(): boolean`, `getPaths(): readonly UPSignaturePath[]`.

- [ ] **Step 1: Write failing signature tests**

Create `tests/components/UPSignature.test.tsx`:

```tsx
import React, { createRef } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPRoot,
  UPSignature,
  type UPCanvasAdapterComponent,
  type UPCanvasAdapterHandle,
  type UPCanvasDrawCommand,
  type UPSignatureRef,
} from '../../src';

function createMockAdapter(commands: UPCanvasDrawCommand[], exportPath = 'mock://signature.png') {
  const handle: UPCanvasAdapterHandle = {
    execute: jest.fn(async (command) => {
      commands.push(command);
    }),
    toTempFilePath: jest.fn(async () => ({
      height: 180,
      tempFilePath: exportPath,
      width: 300,
    })),
  };
  const MockAdapter: UPCanvasAdapterComponent = ({ onReady, onTouchEnd, onTouchMove, onTouchStart, testID }) => {
    React.useEffect(() => {
      onReady(handle);
    }, [onReady]);
    return (
      <View testID={testID} onTouchEnd={onTouchEnd} onTouchMove={onTouchMove} onTouchStart={onTouchStart}>
        <Text>signature canvas</Text>
      </View>
    );
  };
  return { MockAdapter, handle };
}

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function touch(x: number, y: number) {
  return { nativeEvent: { locationX: x, locationY: y, pageX: x, pageY: y } };
}

it('records touch paths and sends canvas draw commands', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const { MockAdapter } = createMockAdapter(commands);
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(<UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig' }} ref={ref} />);

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchStart', touch(10, 12));
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchMove', touch(20, 24));
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchEnd', touch(20, 24));
  });

  expect(ref.current?.getPaths()).toHaveLength(1);
  expect(commands).toEqual(expect.arrayContaining([
    { kind: 'set', property: 'strokeStyle', value: '#000000' },
    { kind: 'set', property: 'lineWidth', value: 3 },
    { args: [], kind: 'call', method: 'beginPath' },
    { args: [10, 12], kind: 'call', method: 'moveTo' },
    { args: [20, 24], kind: 'call', method: 'lineTo' },
    { args: [], kind: 'call', method: 'stroke' },
    { args: [], kind: 'call', method: 'draw' },
    { args: [], kind: 'call', method: 'closePath' },
  ]));
});

it('undo redraws the remaining paths and clear emits onClear', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onClear = jest.fn();
  const { MockAdapter } = createMockAdapter(commands);
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-undo' }} onClear={onClear} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-undo')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchStart', touch(1, 1));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchMove', touch(2, 2));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchEnd', touch(2, 2));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchStart', touch(3, 3));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchMove', touch(4, 4));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchEnd', touch(4, 4));
  });

  await act(async () => {
    ref.current?.undo();
  });
  expect(ref.current?.getPaths()).toHaveLength(1);
  expect(commands).toEqual(expect.arrayContaining([{ args: [0, 0, 300, 180], kind: 'call', method: 'clearRect' }]));

  await act(async () => {
    ref.current?.clear();
  });
  expect(ref.current?.isEmpty()).toBe(true);
  expect(onClear).toHaveBeenCalledTimes(1);
});

it('confirm exports non-empty signature and ignores empty signature', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onConfirm = jest.fn();
  const { MockAdapter } = createMockAdapter(commands, 'mock://done.png');
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-export' }} onConfirm={onConfirm} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-export')).toBeTruthy());
  await act(async () => {
    await ref.current?.confirm();
  });
  expect(onConfirm).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchStart', touch(5, 5));
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchMove', touch(9, 9));
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchEnd', touch(9, 9));
    await ref.current?.confirm();
  });
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ tempFilePath: 'mock://done.png' }));
});

it('forwards export errors through onError', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onError = jest.fn();
  const { MockAdapter, handle } = createMockAdapter(commands);
  handle.toTempFilePath = jest.fn(async () => {
    throw new Error('export failed');
  });
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-error' }} onError={onError} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-error')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchStart', touch(5, 5));
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchMove', touch(9, 9));
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchEnd', touch(9, 9));
    await ref.current?.confirm();
  });
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'export failed' }));
});

it('toolbar buttons clear, undo, change color, and change thickness', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const { MockAdapter } = createMockAdapter(commands);
  const screen = renderRoot(<UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-toolbar' }} />);

  expect(screen.getByTestId('up-signature-toolbar')).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByTestId('up-signature-color-1'));
    fireEvent.press(screen.getByTestId('up-slider-value-4'));
    fireEvent.press(screen.getByTestId('up-signature-clear'));
    fireEvent.press(screen.getByTestId('up-signature-undo'));
  });
  expect(screen.getByTestId('up-signature')).toBeTruthy();
});

it('merges UP.setConfig defaults for signature', () => {
  act(() => {
    UP.setConfig({ props: { signature: { color: '#123456', thickness: 5 } } });
  });
  const screen = renderRoot(<UPSignature showToolbar={false} />);
  expect(screen.getByTestId('up-signature')).toBeTruthy();
  expect(screen.queryByTestId('up-signature-toolbar')).toBeNull();
});
```

- [ ] **Step 2: Run signature tests to verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPSignature.test.tsx
```

Expected result: fail because `UPSignature` and canvas path methods do not exist.

- [ ] **Step 3: Extend UPCanvas path API**

In `src/components/canvas/types.ts`, add these methods to `UPCanvasRef`:

```ts
lineTo: (x: number, y: number) => Promise<void>;
moveTo: (x: number, y: number) => Promise<void>;
```

In `src/components/canvas/UPCanvas.tsx`, add these entries to the `api` object:

```ts
lineTo: (x, y) => enqueue(commandCall('lineTo', [x, y])),
moveTo: (x, y) => enqueue(commandCall('moveTo', [x, y])),
```

- [ ] **Step 4: Add signature defaults and config merge**

In `src/config/defaults.ts`, add:

```ts
export type UPSignatureDefaults = {
  bgColor: string;
  color: string;
  height: UPDimension;
  presetColors: readonly string[];
  showToolbar: boolean;
  thickness: number;
  width: UPDimension;
};
```

Add the prop key to `UPProps`:

```ts
signature: UPSignatureDefaults;
```

Add the source defaults:

```ts
signature: Object.freeze({
  bgColor: '#ffffff',
  color: '#000000',
  height: 180,
  presetColors: Object.freeze(['#000000', '#2979ff', '#19be6b', '#f56c6c']),
  showToolbar: true,
  thickness: 3,
  width: 300,
}),
```

In `src/config/store.ts`, add `signature?: Partial<UPProps['signature']>;`, initialize `signature: { ...sourceDefaults.props.signature }`, and merge with:

```ts
signature: { ...state.props.signature, ...overrides.props?.signature },
```

- [ ] **Step 5: Implement signature component**

Create `src/components/signature/UPSignature.tsx`:

```tsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPCanvas, type UPCanvasExportResult, type UPCanvasProps, type UPCanvasRef } from '../canvas';
import { UPIcon } from '../icon';
import { UPSlider } from '../slider';

export type UPSignaturePoint = {
  color: string;
  type: 'move' | 'start';
  width: number;
  x: number;
  y: number;
};
export type UPSignaturePath = readonly UPSignaturePoint[];
export type UPSignatureRef = {
  clear: () => void;
  confirm: () => Promise<void>;
  getPaths: () => readonly UPSignaturePath[];
  isEmpty: () => boolean;
  undo: () => void;
};
export type UPSignatureProps = {
  bgColor?: string;
  canvasProps?: Omit<UPCanvasProps, 'bgColor' | 'height' | 'onTouchEnd' | 'onTouchMove' | 'onTouchStart' | 'width'>;
  color?: string;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  height?: UPDimension;
  presetColors?: readonly string[];
  showToolbar?: boolean;
  thickness?: number;
  width?: UPDimension;
  onClear?: () => void;
  onConfirm?: (result: UPCanvasExportResult) => void;
  onError?: (error: Error) => void;
};

function eventPoint(event: GestureResponderEvent): Pick<UPSignaturePoint, 'x' | 'y'> {
  const native = event.nativeEvent as { locationX?: number; locationY?: number; pageX?: number; pageY?: number };
  return {
    x: Number(native.locationX ?? native.pageX ?? 0),
    y: Number(native.locationY ?? native.pageY ?? 0),
  };
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export const UPSignature = forwardRef<UPSignatureRef, UPSignatureProps>(function UPSignature(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.signature, ...input } as UPSignatureProps & Required<
    Pick<UPSignatureProps, 'bgColor' | 'color' | 'height' | 'presetColors' | 'showToolbar' | 'thickness' | 'width'>
  >;
  const canvasRef = useRef<UPCanvasRef>(null);
  const pathsRef = useRef<UPSignaturePath[]>([]);
  const currentPathRef = useRef<UPSignaturePoint[]>([]);
  const [pathsVersion, setPathsVersion] = useState(0);
  const [color, setColor] = useState(props.color);
  const [thickness, setThickness] = useState(props.thickness);
  const width = getPx(props.width);
  const height = getPx(props.height);

  const refreshPaths = useCallback(() => setPathsVersion((value) => value + 1), []);

  const redraw = useCallback(async (paths: readonly UPSignaturePath[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await canvas.clearCanvas();
    for (const path of paths) {
      if (path.length === 0) continue;
      const [start, ...moves] = path;
      await canvas.setStrokeStyle(start.color);
      await canvas.setLineWidth(start.width);
      await canvas.beginPath();
      await canvas.moveTo(start.x, start.y);
      for (const point of moves) {
        await canvas.lineTo(point.x, point.y);
      }
      await canvas.stroke();
      await canvas.closePath();
    }
    await canvas.draw();
  }, []);

  const start = useCallback((event: GestureResponderEvent) => {
    const canvas = canvasRef.current;
    const point = { ...eventPoint(event), color, type: 'start' as const, width: thickness };
    currentPathRef.current = [point];
    void canvas?.setStrokeStyle(color);
    void canvas?.setLineWidth(thickness);
    void canvas?.beginPath();
    void canvas?.moveTo(point.x, point.y);
  }, [color, thickness]);

  const move = useCallback((event: GestureResponderEvent) => {
    const canvas = canvasRef.current;
    if (currentPathRef.current.length === 0) return;
    const point = { ...eventPoint(event), color, type: 'move' as const, width: thickness };
    currentPathRef.current.push(point);
    void canvas?.lineTo(point.x, point.y);
    void canvas?.stroke();
    void canvas?.draw();
  }, [color, thickness]);

  const end = useCallback(() => {
    const path = currentPathRef.current;
    currentPathRef.current = [];
    if (path.length === 0) return;
    pathsRef.current = [...pathsRef.current, path];
    refreshPaths();
    void canvasRef.current?.closePath();
  }, [refreshPaths]);

  const clear = useCallback(() => {
    currentPathRef.current = [];
    pathsRef.current = [];
    refreshPaths();
    void canvasRef.current?.clearCanvas();
    input.onClear?.();
  }, [input, refreshPaths]);

  const undo = useCallback(() => {
    const next = pathsRef.current.slice(0, -1);
    pathsRef.current = next;
    refreshPaths();
    void redraw(next);
  }, [redraw, refreshPaths]);

  const confirm = useCallback(async () => {
    if (pathsRef.current.length === 0) return;
    try {
      const result = await canvasRef.current?.toTempFilePath({ fileType: 'png', quality: 1 });
      if (result) input.onConfirm?.(result);
    } catch (error) {
      input.onError?.(toError(error));
    }
  }, [input]);

  useImperativeHandle(ref, () => ({
    clear,
    confirm,
    getPaths: () => pathsRef.current,
    isEmpty: () => pathsRef.current.length === 0 && currentPathRef.current.length === 0,
    undo,
  }), [clear, confirm, undo]);

  const toolbar = useMemo(() => {
    if (!props.showToolbar) return null;
    return (
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 8 }} testID="up-signature-toolbar">
        <Pressable accessibilityRole="button" onPress={undo} testID="up-signature-undo">
          <UPIcon name="reload" size={18} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={clear} testID="up-signature-clear">
          <Text>清除</Text>
        </Pressable>
        {props.presetColors.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() => setColor(item)}
            style={{
              backgroundColor: item,
              borderColor: color === item ? '#303133' : '#dcdfe6',
              borderRadius: 8,
              borderWidth: 1,
              height: 16,
              width: 16,
            }}
            testID={`up-signature-color-${index}`}
          />
        ))}
        <UPSlider
          max={10}
          min={1}
          onChange={setThickness}
          showValue
          step={1}
          value={thickness}
        />
      </View>
    );
  }, [clear, color, props.presetColors, props.showToolbar, thickness, undo]);

  return (
    <View style={input.customStyle} testID="up-signature">
      <UPCanvas
        {...input.canvasProps}
        bgColor={props.bgColor}
        disableScroll
        height={height}
        onError={input.onError}
        onTouchEnd={end}
        onTouchMove={move}
        onTouchStart={start}
        ref={canvasRef}
        width={width}
      />
      {toolbar}
      <Text style={{ display: 'none' }}>{pathsVersion}</Text>
    </View>
  );
});
```

Create `src/components/signature/index.ts`:

```ts
export * from './UPSignature';
```

Modify `src/components/index.ts`:

```ts
export * from './signature';
```

- [ ] **Step 6: Run signature and canvas tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPCanvas.test.tsx tests/components/UPSignature.test.tsx
```

Expected result: pass.

---

### Task 3: UPGuide

**Files:**
- Create: `src/components/guide/UPGuide.tsx`
- Create: `src/components/guide/index.ts`
- Create: `tests/components/UPGuide.test.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `useUPOverlay()`, `useUPConfig()`, React Native `ScrollView`, `Pressable`, `Dimensions`.
- Produces: `UPGuide`, `UPGuideProps`, `UPGuideRef`, `UPGuidePage`, `UPGuideChangeEvent`, `UPGuideStorage`.
- Config key: `config.props.guide`.
- Storage value: close persistence writes the string `"1"`.
- Ref methods: `open(): void`, `close(remember?: boolean): void`, `reset(): Promise<void>`.

- [ ] **Step 1: Write failing guide tests**

Create `tests/components/UPGuide.test.tsx`:

```tsx
import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UP, UPGuide, UPRoot, type UPGuideRef, type UPGuideStorage } from '../../src';

const pages = [
  { desc: 'First description', title: 'First' },
  { desc: 'Second description', title: 'Second' },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function storage(initial: Record<string, string> = {}): UPGuideStorage {
  const values = { ...initial };
  return {
    getItem: jest.fn(async (key) => values[key]),
    removeItem: jest.fn(async (key) => {
      delete values[key];
    }),
    setItem: jest.fn(async (key, value) => {
      values[key] = value;
    }),
  };
}

it('is hidden by default and visible when show is true', () => {
  const hidden = renderRoot(<UPGuide list={pages} />);
  expect(hidden.queryByTestId('up-guide')).toBeNull();

  const visible = renderRoot(<UPGuide list={pages} show />);
  expect(visible.getByTestId('up-guide')).toBeTruthy();
  expect(visible.getByText('First')).toBeTruthy();
});

it('next button advances pages and emits onChange', () => {
  const onChange = jest.fn();
  const screen = renderRoot(<UPGuide list={pages} onChange={onChange} show />);

  act(() => {
    fireEvent.press(screen.getByTestId('up-guide-next'));
  });

  expect(onChange).toHaveBeenCalledWith({ current: 1 });
  expect(screen.getByText('Second')).toBeTruthy();
});

it('skip remembers and closes', async () => {
  const adapter = storage();
  const onSkip = jest.fn();
  const onUpdateShow = jest.fn();
  const screen = renderRoot(
    <UPGuide list={pages} onSkip={onSkip} onUpdateShow={onUpdateShow} show storage={adapter} storageKey="guide-a" />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-guide-skip'));
  });

  expect(onSkip).toHaveBeenCalledTimes(1);
  expect(adapter.setItem).toHaveBeenCalledWith('guide-a', '1');
  expect(onUpdateShow).toHaveBeenLastCalledWith(false);
  expect(screen.queryByTestId('up-guide')).toBeNull();
});

it('finish remembers, emits callbacks, and closes', async () => {
  const adapter = storage();
  const onFinish = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPGuide list={pages} onClose={onClose} onFinish={onFinish} show storage={adapter} storageKey="guide-b" />,
  );

  act(() => {
    fireEvent.press(screen.getByTestId('up-guide-next'));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId('up-guide-finish'));
  });

  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(adapter.setItem).toHaveBeenCalledWith('guide-b', '1');
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('remembered guides stay hidden when once storage returns one', async () => {
  const adapter = storage({ guide: '1' });
  const onUpdateShow = jest.fn();
  const screen = renderRoot(<UPGuide list={pages} onUpdateShow={onUpdateShow} show storage={adapter} storageKey="guide" />);

  await waitFor(() => {
    expect(screen.queryByTestId('up-guide')).toBeNull();
  });
  expect(onUpdateShow).toHaveBeenCalledWith(false);
});

it('ref open, close, and reset control storage-backed visibility', async () => {
  const adapter = storage({ guide: '1' });
  const ref = createRef<UPGuideRef>();
  const screen = renderRoot(<UPGuide list={pages} ref={ref} storage={adapter} storageKey="guide" />);

  await act(async () => {
    await ref.current?.reset();
    ref.current?.open();
  });

  expect(adapter.removeItem).toHaveBeenCalledWith('guide');
  expect(screen.getByTestId('up-guide')).toBeTruthy();

  await act(async () => {
    ref.current?.close(true);
  });
  expect(adapter.setItem).toHaveBeenCalledWith('guide', '1');
});

it('uses custom renderPage and merges UP.setConfig defaults', () => {
  act(() => {
    UP.setConfig({ props: { guide: { finishText: '开始', nextText: '继续' } } });
  });
  const screen = renderRoot(
    <UPGuide
      list={pages}
      renderPage={({ current, item }) => <Text>{current}:{item.title}</Text>}
      show
    />,
  );

  expect(screen.getByText('0:First')).toBeTruthy();
  expect(screen.getByTestId('up-guide-next').props.accessibilityLabel).toBe('继续');
});
```

- [ ] **Step 2: Run guide tests to verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPGuide.test.tsx
```

Expected result: fail because `UPGuide` and `guide` config do not exist.

- [ ] **Step 3: Add guide defaults and config merge**

In `src/config/defaults.ts`, add:

```ts
export type UPGuideDefaultPage = {
  backgroundColor?: string;
  desc?: string;
  image?: string;
  title?: string;
};

export type UPGuideDefaults = {
  bgColor: string;
  finishText: string;
  indicator: boolean;
  list: readonly UPGuideDefaultPage[];
  nextText: string;
  once: boolean;
  show: boolean;
  showSkip: boolean;
  skipText: string;
  storageKey: string;
  zIndex: number;
};
```

Add the prop key to `UPProps`:

```ts
guide: UPGuideDefaults;
```

Add the source defaults:

```ts
guide: Object.freeze({
  bgColor: '#111111',
  finishText: '立即体验',
  indicator: true,
  list: Object.freeze([]) as readonly UPGuideDefaultPage[],
  nextText: '下一步',
  once: true,
  show: false,
  showSkip: true,
  skipText: '跳过',
  storageKey: 'up-guide-default',
  zIndex: 10075,
}),
```

In `src/config/store.ts`, add `guide?: Partial<UPProps['guide']>;`, initialize `guide: { ...sourceDefaults.props.guide }`, and merge with:

```ts
guide: { ...state.props.guide, ...overrides.props?.guide },
```

- [ ] **Step 4: Implement guide component**

Create `src/components/guide/UPGuide.tsx`:

```tsx
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPOverlay } from '../../overlay';

export type UPGuidePage = {
  backgroundColor?: string;
  desc?: string;
  image?: string;
  title?: string;
  [key: string]: unknown;
};
export type UPGuideChangeEvent = { current: number };
export type UPGuideStorage = {
  getItem: (key: string) => boolean | number | string | null | undefined | Promise<boolean | number | string | null | undefined>;
  removeItem: (key: string) => void | Promise<void>;
  setItem: (key: string, value: string) => void | Promise<void>;
};
export type UPGuideRef = {
  close: (remember?: boolean) => void;
  open: () => void;
  reset: () => Promise<void>;
};
export type UPGuideRenderPayload = {
  current: number;
  item: UPGuidePage;
  total: number;
};
export type UPGuideProps = {
  bgColor?: string;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  finishText?: string;
  indicator?: boolean;
  list?: readonly UPGuidePage[];
  nextText?: string;
  once?: boolean;
  renderPage?: (payload: UPGuideRenderPayload) => React.ReactNode;
  show?: boolean;
  showSkip?: boolean;
  skipText?: string;
  storage?: UPGuideStorage;
  storageKey?: string;
  zIndex?: number | string;
  onChange?: (event: UPGuideChangeEvent) => void;
  onClose?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
  onUpdateShow?: (show: boolean) => void;
};

let guideSequence = 0;

function remembered(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function numericZIndex(value: number | string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 10075;
}

export const UPGuide = forwardRef<UPGuideRef, UPGuideProps>(function UPGuide(input, ref) {
  const config = useUPConfig();
  const overlay = useUPOverlay();
  const props = { ...config.props.guide, ...input } as UPGuideProps & Required<
    Pick<UPGuideProps, 'bgColor' | 'finishText' | 'indicator' | 'list' | 'nextText' | 'once' | 'show' | 'showSkip' | 'skipText' | 'storageKey' | 'zIndex'>
  >;
  const id = useRef(`up-guide-${guideSequence++}`).current;
  const scrollRef = useRef<ScrollView>(null);
  const visibleRef = useRef(false);
  const [visible, setVisible] = useState(Boolean(props.show));
  const [current, setCurrent] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const zIndex = numericZIndex(props.zIndex);

  const setVisibleState = useCallback((next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
    input.onUpdateShow?.(next);
    if (!next) input.onClose?.();
  }, [input]);

  const checkRemembered = useCallback(async () => {
    if (!props.once || !props.storage) return false;
    try {
      return remembered(await props.storage.getItem(props.storageKey));
    } catch {
      return false;
    }
  }, [props.once, props.storage, props.storageKey]);

  const remember = useCallback(async () => {
    if (!props.once || !props.storage) return;
    try {
      await props.storage.setItem(props.storageKey, '1');
    } catch {
      return;
    }
  }, [props.once, props.storage, props.storageKey]);

  const close = useCallback((rememberClose = false) => {
    if (rememberClose) void remember();
    setVisibleState(false);
  }, [remember, setVisibleState]);

  const open = useCallback(() => {
    void checkRemembered().then((done) => {
      if (done) {
        setVisibleState(false);
        return;
      }
      setCurrent(0);
      setVisibleState(props.list.length > 0);
    });
  }, [checkRemembered, props.list.length, setVisibleState]);

  const reset = useCallback(async () => {
    try {
      await props.storage?.removeItem(props.storageKey);
    } catch {
      return;
    }
  }, [props.storage, props.storageKey]);

  useImperativeHandle(ref, () => ({ close, open, reset }), [close, open, reset]);

  useEffect(() => {
    if (props.show) open();
    else close(false);
  }, [close, open, props.show]);

  useEffect(() => () => overlay.remove(id), [id, overlay]);

  const changeTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(props.list.length - 1, next));
    setCurrent(clamped);
    input.onChange?.({ current: clamped });
    scrollRef.current?.scrollTo({ animated: true, x: clamped * screenWidth, y: 0 });
  }, [input, props.list.length, screenWidth]);

  const next = useCallback(() => {
    if (current >= props.list.length - 1) {
      input.onFinish?.();
      close(true);
      return;
    }
    changeTo(current + 1);
  }, [changeTo, close, current, input, props.list.length]);

  const skip = useCallback(() => {
    input.onSkip?.();
    close(true);
  }, [close, input]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (nextIndex !== current) changeTo(nextIndex);
  }, [changeTo, current, screenWidth]);

  const layer = useMemo(() => {
    if (!visible || props.list.length === 0) return null;
    return (
      <View
        style={[{
          backgroundColor: props.bgColor,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex,
        }, input.customStyle]}
        testID="up-guide"
      >
        {props.showSkip ? (
          <Pressable
            accessibilityLabel={props.skipText}
            accessibilityRole="button"
            onPress={skip}
            style={{ padding: 16, position: 'absolute', right: 16, top: 32, zIndex: zIndex + 1 }}
            testID="up-guide-skip"
          >
            <Text style={{ color: '#ffffff' }}>{props.skipText}</Text>
          </Pressable>
        ) : null}
        <ScrollView
          horizontal
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          testID="up-guide-scroll"
        >
          {props.list.map((item, index) => (
            <View
              key={`${item.title ?? item.image ?? 'page'}-${index}`}
              style={{
                alignItems: 'center',
                backgroundColor: item.backgroundColor ?? props.bgColor,
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: 32,
                width: screenWidth,
              }}
              testID={`up-guide-page-${index}`}
            >
              {props.renderPage ? props.renderPage({ current: index, item, total: props.list.length }) : (
                <>
                  {item.image ? <Image source={{ uri: item.image }} style={{ height: 160, marginBottom: 24, width: 160 }} /> : null}
                  {item.title ? <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>{item.title}</Text> : null}
                  {item.desc ? <Text style={{ color: '#dcdfe6', fontSize: 15, textAlign: 'center' }}>{item.desc}</Text> : null}
                </>
              )}
            </View>
          ))}
        </ScrollView>
        {props.indicator ? (
          <View style={{ alignSelf: 'center', bottom: 88, flexDirection: 'row', gap: 6, position: 'absolute' }} testID="up-guide-indicator">
            {props.list.map((_item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: current === index ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  borderRadius: 4,
                  height: 8,
                  width: current === index ? 18 : 8,
                }}
                testID={`up-guide-dot-${index}`}
              />
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={current >= props.list.length - 1 ? props.finishText : props.nextText}
          accessibilityRole="button"
          onPress={next}
          style={{
            alignSelf: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 22,
            bottom: 32,
            minWidth: 132,
            paddingHorizontal: 24,
            paddingVertical: 12,
            position: 'absolute',
          }}
          testID={current >= props.list.length - 1 ? 'up-guide-finish' : 'up-guide-next'}
        >
          <Text style={{ color: props.bgColor, fontSize: 15, textAlign: 'center' }}>
            {current >= props.list.length - 1 ? props.finishText : props.nextText}
          </Text>
        </Pressable>
      </View>
    );
  }, [changeTo, current, input.customStyle, next, onMomentumScrollEnd, props, screenWidth, skip, visible, zIndex]);

  useEffect(() => {
    if (!layer) {
      overlay.remove(id);
      return;
    }
    overlay.add({ id, node: layer, zIndex });
    return () => overlay.remove(id);
  }, [id, layer, overlay, zIndex]);

  return null;
});
```

Create `src/components/guide/index.ts`:

```ts
export * from './UPGuide';
```

Modify `src/components/index.ts`:

```ts
export * from './guide';
```

- [ ] **Step 5: Run guide tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPGuide.test.tsx
```

Expected result: pass.

---

### Task 4: Docs, Examples, and Full Validation

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Test: focused P31 tests and full project checks.

**Interfaces:**
- Consumes: public exports from Tasks 1, 2, and 3.
- Produces: documented examples, compatibility notes, and validation evidence.

- [ ] **Step 1: Add compact examples**

Update `example/App.tsx` imports:

```tsx
import {
  UPDragsort,
  UPGuide,
  UPSignature,
} from '../src';
```

Add a compact P31 section inside the existing example screen:

```tsx
const [guideVisible, setGuideVisible] = React.useState(false);
const guideStorage = React.useMemo(() => {
  const values: Record<string, string> = {};
  return {
    getItem: async (key: string) => values[key],
    removeItem: async (key: string) => {
      delete values[key];
    },
    setItem: async (key: string, value: string) => {
      values[key] = value;
    },
  };
}, []);

<UPDragsort
  initialList={[
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Charlie' },
  ]}
  itemHeight={48}
  onDragEnd={(next) => console.log('drag sorted', next)}
/>

<UPSignature
  canvasProps={{ canvasId: 'example-signature' }}
  onConfirm={(result) => console.log('signature exported', result.tempFilePath)}
/>

<UPButton text="打开引导" onClick={() => setGuideVisible(true)} />
<UPGuide
  list={[
    { desc: 'PanResponder 拖拽排序', title: 'UPDragsort' },
    { desc: 'UPCanvas 签名导出', title: 'UPSignature' },
    { desc: 'Overlay 全屏引导', title: 'UPGuide' },
  ]}
  onUpdateShow={setGuideVisible}
  show={guideVisible}
  storage={guideStorage}
  storageKey="example-p31-guide"
/>
```

- [ ] **Step 2: Update compatibility docs**

In `docs/compatibility.md`, add a P31 section with these bullets:

```md
### P31 Interaction Tools

- `UPDragsort` maps source drag sorting to React Native `PanResponder`; `vibrate` is retained as a no-op because RN core has no source-equivalent haptic API.
- `UPSignature` composes `UPCanvas`; export support depends on the configured canvas adapter and uses `toTempFilePath({ fileType: 'png', quality: 1 })`.
- `UPGuide` renders through `UPRoot` overlay infrastructure; one-time display requires an explicit `storage` adapter.
- P31 adds no new native dependencies.
```

- [ ] **Step 3: Update gap matrix**

In `docs/gap-matrix.md`, mark P31 components with these entries:

```md
| `u-dragsort` | `UPDragsort` | P31 | `movable-area` physics and `uni.vibrateShort` are mapped to deterministic RN drag math and a retained no-op. |
| `u-signature` | `UPSignature` | P31 | Uses `UPCanvas`; export requires the configured canvas adapter to implement `toTempFilePath`. |
| `u-guide` | `UPGuide` | P31 | Full-screen onboarding is supported; spotlight tours and implicit `uni` storage are host responsibilities. |
```

- [ ] **Step 4: Run focused P31 validation**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPDragsort.test.tsx tests/components/UPSignature.test.tsx tests/components/UPGuide.test.tsx
```

Expected result: pass.

- [ ] **Step 5: Run full validation**

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
git status --short
```

Expected result: all non-status commands pass. `git status --short` may list modified and new files from P31.

- [ ] **Step 6: Record validation output for handoff**

In the final implementation response, report:

```md
- Focused P31 tests: pass
- `npm test`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm pack --dry-run`: pass
- `git diff --check`: pass
- Git staging/commits: not performed
```

---

## Execution Notes

- Execute tasks in order: dragsort first, signature second, guide third, docs and validation last.
- Keep each component file focused; do not restructure existing folders outside the files listed in this plan.
- Preserve existing coding style: named exports, React function components, `testID` hooks, and source defaults through `UP.setConfig({ props })`.
- If a validation failure is caused by unrelated pre-existing code, stop broad edits and report the failing command plus the unrelated failure.
