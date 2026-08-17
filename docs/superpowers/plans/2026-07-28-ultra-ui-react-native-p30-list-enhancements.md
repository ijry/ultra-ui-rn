# Ultra UI React Native P30 List Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPPullRefresh`, `UPVirtualList`, and `UPRefreshVirtualList` with source-compatible list refresh and fixed-height virtualization APIs.

**Architecture:** `UPPullRefresh` owns source-style pull gesture state, refresh status, optional internal `ScrollView`, and load-more footer wiring. `UPVirtualList` owns fixed-height visible-range calculation and imperative scroll controls. `UPRefreshVirtualList` composes the two components without adding another renderer or scroll math implementation.

**Tech Stack:** React Native core `View`, `Text`, `ScrollView`, `Animated`, TypeScript, Jest, `@testing-library/react-native`, existing `getPx`, `UPIcon`, `UPLoadingIcon`, and `UPLoadmore`.

## Global Constraints

- Work directly in the existing `main` checkout; do not create a branch or worktree.
- Do not run `git add`, `git commit`, `git push`, `git reset`, or `git clean`.
- Modify files with `apply_patch`.
- Do not add native dependencies for P30.
- Implement `UPVirtualList` with fixed item height only.
- Use React render callbacks for upstream scoped slots.
- Preserve source prop names where practical.
- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check` before handoff.

---

## File Structure

- Create `src/components/pull-refresh/UPPullRefresh.tsx`: pull gesture wrapper, status header, optional internal scroll, load-more footer, and ref methods.
- Create `src/components/pull-refresh/index.ts`: public pull-refresh exports.
- Create `src/components/virtual-list/UPVirtualList.tsx`: fixed-height virtualized scroll list and ref methods.
- Create `src/components/virtual-list/index.ts`: public virtual-list exports.
- Create `src/components/refresh-virtual-list/UPRefreshVirtualList.tsx`: composition wrapper using `UPPullRefresh` and `UPVirtualList`.
- Create `src/components/refresh-virtual-list/index.ts`: public refresh-virtual-list exports.
- Modify `src/config/defaults.ts`: add `pullRefresh`, `virtualList`, and `refreshVirtualList` default props.
- Modify `src/config/store.ts`: add config override and merge support for the three defaults.
- Modify `src/components/index.ts`: export all three component folders.
- Create `tests/components/UPPullRefresh.test.tsx`: pull gesture, controlled refresh, slots, and load-more tests.
- Create `tests/components/UPVirtualList.test.tsx`: visible range, scroll, primitive data, controlled scrollTop, and ref tests.
- Create `tests/components/UPRefreshVirtualList.test.tsx`: composition, refresh finish, scroll forwarding, and ref tests.
- Modify `example/App.tsx`: add compact examples.
- Modify `docs/compatibility.md`: document P30 behavior and limits.
- Modify `docs/gap-matrix.md`: add P30 matrix rows.

---

### Task 1: UPPullRefresh

**Files:**
- Create: `src/components/pull-refresh/UPPullRefresh.tsx`
- Create: `src/components/pull-refresh/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPPullRefresh.test.tsx`

**Interfaces:**
- Consumes: `UPLoadmoreProps`, `UPLoadmore`, `UPIcon`, `UPLoadingIcon`, `getPx`, and `useUPConfig`.
- Produces: `UPPullRefresh`, `UPPullRefreshProps`, `UPPullRefreshRef`, `UPPullRefreshStatus`, `UPPullRefreshRenderState`.
- Produces: global config key `props.pullRefresh`.

- [ ] **Step 1: Write failing pull-refresh tests**

Create `tests/components/UPPullRefresh.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UPPullRefresh, UPRoot, type UPPullRefreshRef } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function drag(screen: ReturnType<typeof render>, startY: number, moveY: number) {
  const root = screen.getByTestId('up-pull-refresh');
  fireEvent(root, 'touchStart', { nativeEvent: { pageY: startY, touches: [{ pageY: startY }] } });
  fireEvent(root, 'touchMove', { nativeEvent: { pageY: moveY, touches: [{ pageY: moveY }] } });
  fireEvent(root, 'touchEnd', { nativeEvent: { pageY: moveY, touches: [] } });
}

it('renders the pull header and child content', () => {
  const screen = renderRoot(
    <UPPullRefresh>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  expect(screen.getByTestId('up-pull-refresh')).toBeTruthy();
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  expect(screen.getByText('content')).toBeTruthy();
});

it('resets when released below threshold', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh damping={1} maxDistance={120} onRefresh={onRefresh} threshold={80}>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  await act(async () => drag(screen, 0, 40));

  expect(onRefresh).not.toHaveBeenCalled();
  expect(screen.getByTestId('up-pull-refresh-area').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 0 })]),
  );
});

it('emits refresh when released past threshold', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh damping={1} maxDistance={120} onRefresh={onRefresh} threshold={80}>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  await act(async () => drag(screen, 0, 100));

  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText('刷新中...')).toBeTruthy();
});

it('tracks controlled refreshing state and exposes ref methods', async () => {
  const ref = React.createRef<UPPullRefreshRef>();
  const screen = renderRoot(
    <UPPullRefresh ref={ref} refreshing>
      <Text>content</Text>
    </UPPullRefresh>,
  );

  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.finishRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  await act(async () => ref.current?.startRefresh());
  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.resetRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
});

it('renders custom state nodes', async () => {
  const screen = renderRoot(
    <UPPullRefresh
      damping={1}
      pull={({ distance }) => <Text>pull {distance}</Text>}
      release={({ distance }) => <Text>release {distance}</Text>}
      refreshingNode={<Text>busy</Text>}
      threshold={20}
    >
      <Text>content</Text>
    </UPPullRefresh>,
  );

  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchStart', {
    nativeEvent: { pageY: 0, touches: [{ pageY: 0 }] },
  });
  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchMove', {
    nativeEvent: { pageY: 25, touches: [{ pageY: 25 }] },
  });
  expect(screen.getByText('release 25')).toBeTruthy();
  fireEvent(screen.getByTestId('up-pull-refresh'), 'touchEnd', {
    nativeEvent: { pageY: 25, touches: [] },
  });
  await waitFor(() => expect(screen.getByText('busy')).toBeTruthy());
});

it('emits loadmore only when footer status is loadmore', () => {
  const onLoadmore = jest.fn();
  const screen = renderRoot(
    <UPPullRefresh
      height={100}
      loadmoreProps={{ status: 'loadmore' }}
      onLoadmore={onLoadmore}
      showLoadmore
    >
      <Text>content</Text>
    </UPPullRefresh>,
  );

  fireEvent.scroll(screen.getByTestId('up-pull-refresh-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 180, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });
  expect(onLoadmore).toHaveBeenCalledTimes(1);

  screen.rerender(
    <UPRoot>
      <UPPullRefresh
        height={100}
        loadmoreProps={{ status: 'loading' }}
        onLoadmore={onLoadmore}
        showLoadmore
      >
        <Text>content</Text>
      </UPPullRefresh>
    </UPRoot>,
  );
  fireEvent.scroll(screen.getByTestId('up-pull-refresh-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 180, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });
  expect(onLoadmore).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run failing pull-refresh tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPPullRefresh.test.tsx
```

Expected: FAIL because `UPPullRefresh` is not exported.

- [ ] **Step 3: Implement `UPPullRefresh`**

Create `src/components/pull-refresh/UPPullRefresh.tsx` with these public types and behavior:

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
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPLoadingIcon } from '../loading-icon';
import { UPLoadmore, type UPLoadmoreProps } from '../loadmore';

export type UPPullRefreshStatus = 'pull' | 'release' | 'refreshing';

export type UPPullRefreshRenderState = {
  distance: number;
  threshold: number;
  status: UPPullRefreshStatus;
};

export type UPPullRefreshRef = {
  startRefresh: () => void;
  finishRefresh: () => void;
  resetRefresh: () => void;
};

export type UPPullRefreshProps = {
  refreshing?: boolean;
  threshold?: UPDimension;
  damping?: number;
  maxDistance?: UPDimension;
  showLoadmore?: boolean;
  loadmoreProps?: UPLoadmoreProps;
  useScrollView?: boolean;
  enableBackToTop?: boolean;
  lowerThreshold?: UPDimension;
  scrollTop?: UPDimension;
  height?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  children?: React.ReactNode;
  pull?: (state: UPPullRefreshRenderState) => React.ReactNode;
  release?: (state: UPPullRefreshRenderState) => React.ReactNode;
  refreshingNode?: React.ReactNode;
  onRefresh?: () => void;
  onLoadmore?: () => void;
  onScroll?: (scrollTop: number) => void;
};

function readTouchY(event: unknown) {
  const nativeEvent = (event as { nativeEvent?: { pageY?: number; touches?: Array<{ pageY?: number }> } }).nativeEvent;
  return nativeEvent?.touches?.[0]?.pageY ?? nativeEvent?.pageY ?? 0;
}

function normalizeDistance(value: UPDimension | undefined, fallback: number) {
  const next = value === undefined || value === '' ? fallback : getPx(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function defaultHeader(status: UPPullRefreshStatus) {
  if (status === 'refreshing') {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
        <UPLoadingIcon mode="circle" size={22} text="刷新中..." vertical />
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
      <UPIcon
        color="#606266"
        name={status === 'release' ? 'arrow-upward' : 'arrow-downward'}
        size={26}
      />
      <Text style={{ color: '#303133', fontSize: 14 }}>
        {status === 'release' ? '释放刷新' : '下拉刷新'}
      </Text>
    </View>
  );
}

export const UPPullRefresh = forwardRef<UPPullRefreshRef, UPPullRefreshProps>(function UPPullRefresh(input, ref) {
  const props = { ...useUPConfig().props.pullRefresh, ...input } as Required<
    Pick<
      UPPullRefreshProps,
      'damping' | 'enableBackToTop' | 'lowerThreshold' | 'maxDistance' | 'scrollTop' | 'showLoadmore' | 'threshold' | 'useScrollView'
    >
  > & UPPullRefreshProps;
  const threshold = normalizeDistance(props.threshold, 80);
  const maxDistance = normalizeDistance(props.maxDistance, 120);
  const [distance, setDistance] = useState(0);
  const [status, setStatus] = useState<UPPullRefreshStatus>('pull');
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const startYRef = useRef(0);
  const touchingRef = useRef(false);
  const scrollTopRef = useRef(getPx(props.scrollTop ?? 0));
  const lowerEnteredRef = useRef(false);
  const isRefreshing = props.refreshing ?? internalRefreshing;

  const resetRefresh = useCallback(() => {
    setDistance(0);
    setStatus('pull');
    setInternalRefreshing(false);
  }, []);

  const startRefresh = useCallback(() => {
    setDistance(threshold);
    setStatus('refreshing');
    setInternalRefreshing(true);
  }, [threshold]);

  const finishRefresh = useCallback(() => {
    resetRefresh();
  }, [resetRefresh]);

  useImperativeHandle(ref, () => ({ finishRefresh, resetRefresh, startRefresh }), [
    finishRefresh,
    resetRefresh,
    startRefresh,
  ]);

  useEffect(() => {
    scrollTopRef.current = getPx(props.scrollTop ?? 0);
  }, [props.scrollTop]);

  useEffect(() => {
    if (props.refreshing === true) {
      setDistance(threshold);
      setStatus('refreshing');
    } else if (props.refreshing === false && !touchingRef.current) {
      setDistance(0);
      setStatus('pull');
      setInternalRefreshing(false);
    }
  }, [props.refreshing, threshold]);

  const state = useMemo(
    () => ({ distance, status, threshold }),
    [distance, status, threshold],
  );

  const renderHeader = () => {
    if (status === 'refreshing' && props.refreshingNode) return props.refreshingNode;
    if (status === 'release' && props.release) return props.release(state);
    if (status === 'pull' && props.pull) return props.pull(state);
    return defaultHeader(status);
  };

  const onTouchStart = (event: unknown) => {
    if (isRefreshing) return;
    touchingRef.current = true;
    startYRef.current = readTouchY(event);
    setStatus('pull');
  };

  const onTouchMove = (event: unknown) => {
    if (!touchingRef.current || isRefreshing || scrollTopRef.current > 0) return;
    const diff = readTouchY(event) - startYRef.current;
    if (diff <= 0) return;
    const nextDistance = Math.min(maxDistance, diff * props.damping);
    setDistance(nextDistance);
    setStatus(nextDistance >= threshold ? 'release' : 'pull');
  };

  const onTouchEnd = () => {
    if (!touchingRef.current) return;
    touchingRef.current = false;
    if (distance >= threshold && !isRefreshing) {
      startRefresh();
      input.onRefresh?.();
    } else if (!isRefreshing) {
      resetRefresh();
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    scrollTopRef.current = Number.isFinite(offset) ? offset : 0;
    input.onScroll?.(scrollTopRef.current);
    const lowerThreshold = getPx(props.lowerThreshold ?? 50);
    const lower =
      offset + event.nativeEvent.layoutMeasurement.height >=
      event.nativeEvent.contentSize.height - lowerThreshold;
    if (
      lower &&
      !lowerEnteredRef.current &&
      props.showLoadmore &&
      (props.loadmoreProps?.status ?? 'loadmore') === 'loadmore'
    ) {
      input.onLoadmore?.();
    }
    lowerEnteredRef.current = lower;
  };

  const footer = props.showLoadmore ? (
    <UPLoadmore {...props.loadmoreProps} onLoadmore={input.onLoadmore} />
  ) : null;
  const content = (
    <>
      {input.children}
      {footer}
    </>
  );

  return (
    <View
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      style={[{ height: props.height === undefined ? '100%' : props.height, overflow: 'hidden', position: 'relative' }, input.customStyle]}
      testID="up-pull-refresh"
    >
      <View
        style={[{ alignItems: 'center', height: distance, justifyContent: 'flex-end', left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 }]}
        testID="up-pull-refresh-area"
      >
        {renderHeader()}
      </View>
      <View style={{ flex: 1, transform: [{ translateY: distance }] }} testID="up-pull-refresh-content">
        {props.useScrollView ? (
          <ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={Boolean(props.enableBackToTop)}
            testID="up-pull-refresh-scroll"
          >
            {content}
          </ScrollView>
        ) : (
          <View testID="up-pull-refresh-static">{content}</View>
        )}
      </View>
    </View>
  );
});
```

Create `src/components/pull-refresh/index.ts`:

```ts
export * from './UPPullRefresh';
```

- [ ] **Step 4: Add pull-refresh defaults and exports**

Modify `src/config/defaults.ts` near list defaults:

```ts
export type UPPullRefreshDefaults = {
  refreshing: boolean;
  threshold: number;
  damping: number;
  maxDistance: number;
  showLoadmore: boolean;
  loadmoreProps: { status: 'loadmore' };
  useScrollView: boolean;
  enableBackToTop: boolean;
  lowerThreshold: number;
  scrollTop: number;
  height: string;
};
```

Add to `UPProps`:

```ts
pullRefresh: UPPullRefreshDefaults;
```

Add to `sourceDefaults.props`:

```ts
pullRefresh: Object.freeze({
  damping: 0.4,
  enableBackToTop: false,
  height: '100%',
  loadmoreProps: Object.freeze({ status: 'loadmore' as const }),
  lowerThreshold: 50,
  maxDistance: 120,
  refreshing: false,
  scrollTop: 0,
  showLoadmore: false,
  threshold: 80,
  useScrollView: true,
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
pullRefresh?: Partial<UPProps['pullRefresh']>;
pullRefresh: { ...sourceDefaults.props.pullRefresh },
pullRefresh: { ...state.props.pullRefresh, ...overrides.props?.pullRefresh },
```

Modify `src/components/index.ts`:

```ts
export * from './pull-refresh';
```

- [ ] **Step 5: Run pull-refresh verification**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPPullRefresh.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 2: UPVirtualList

**Files:**
- Create: `src/components/virtual-list/UPVirtualList.tsx`
- Create: `src/components/virtual-list/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPVirtualList.test.tsx`

**Interfaces:**
- Consumes: `getPx`, `UPDimension`, and `useUPConfig`.
- Produces: `UPVirtualList`, `UPVirtualListProps`, `UPVirtualListRef`, `UPVirtualListRenderPayload`, `UPVirtualListRange`.
- Produces: global config key `props.virtualList`.

- [ ] **Step 1: Write failing virtual-list tests**

Create `tests/components/UPVirtualList.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPVirtualList, type UPVirtualListRef } from '../../src';

const data = Array.from({ length: 20 }, (_, index) => ({
  id: `row-${index}`,
  name: `Row ${index}`,
}));

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders only the fixed-height visible range', () => {
  const screen = renderRoot(
    <UPVirtualList height={100} itemHeight={20} listData={data} renderItem={({ item }) => <Text>{item.name}</Text>} />,
  );

  expect(screen.getByText('Row 0')).toBeTruthy();
  expect(screen.getByText('Row 8')).toBeTruthy();
  expect(screen.queryByText('Row 9')).toBeNull();
  expect(screen.getByTestId('up-virtual-list-top-spacer').props.style).toEqual(
    expect.objectContaining({ height: 0 }),
  );
  expect(screen.getByTestId('up-virtual-list-bottom-spacer').props.style).toEqual(
    expect.objectContaining({ height: 220 }),
  );
});

it('updates visible range from scroll events', () => {
  const onScroll = jest.fn();
  const onUpdateScrollTop = jest.fn();
  const screen = renderRoot(
    <UPVirtualList
      buffer={4}
      height={100}
      itemHeight={20}
      listData={data}
      onScroll={onScroll}
      onUpdateScrollTop={onUpdateScrollTop}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  fireEvent.scroll(screen.getByTestId('up-virtual-list-scroll'), {
    nativeEvent: {
      contentOffset: { y: 120 },
      contentSize: { height: 400, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });

  expect(onScroll).toHaveBeenCalledWith(120);
  expect(onUpdateScrollTop).toHaveBeenCalledWith(120);
  expect(screen.getByText('Row 4')).toBeTruthy();
  expect(screen.getByText('Row 12')).toBeTruthy();
  expect(screen.queryByText('Row 3')).toBeNull();
});

it('uses controlled scrollTop to calculate initial range', () => {
  const screen = renderRoot(
    <UPVirtualList height={100} itemHeight={20} listData={data} scrollTop={80}>
      {({ item }) => <Text>{item.name}</Text>}
    </UPVirtualList>,
  );

  expect(screen.getByText('Row 2')).toBeTruthy();
  expect(screen.getByText('Row 10')).toBeTruthy();
  expect(screen.queryByText('Row 1')).toBeNull();
});

it('renders primitive list values through a value wrapper', () => {
  const screen = renderRoot(
    <UPVirtualList
      height={60}
      itemHeight={20}
      listData={['A', 'B', 'C', 'D']}
      renderItem={({ item, index }) => <Text>{`${index}:${item.value}`}</Text>}
    />,
  );

  expect(screen.getByText('0:A')).toBeTruthy();
  expect(screen.getByText('3:D')).toBeTruthy();
});

it('exposes scroll and range ref methods', async () => {
  const ref = React.createRef<UPVirtualListRef>();
  const screen = renderRoot(
    <UPVirtualList ref={ref} height={100} itemHeight={20} listData={data} renderItem={({ item }) => <Text>{item.name}</Text>} />,
  );

  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
  await act(async () => ref.current?.scrollTo(100));
  expect(ref.current?.getVisibleRange()).toEqual({ end: 14, start: 5 });
  expect(screen.getByText('Row 5')).toBeTruthy();
  await act(async () => ref.current?.scrollToTop());
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
});
```

- [ ] **Step 2: Run failing virtual-list tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPVirtualList.test.tsx
```

Expected: FAIL because `UPVirtualList` is not exported.

- [ ] **Step 3: Implement `UPVirtualList`**

Create `src/components/virtual-list/UPVirtualList.tsx`:

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
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPVirtualListRange = { start: number; end: number };

export type UPVirtualListRenderPayload<T = unknown> = {
  item: T extends Record<string, unknown> ? T & { _virtualIndex: number } : { value: T; _virtualIndex: number };
  index: number;
};

export type UPVirtualListRef = {
  scrollTo: (top: number) => void;
  scrollToTop: () => void;
  getVisibleRange: () => UPVirtualListRange;
};

export type UPVirtualListProps<T = unknown> = {
  listData?: readonly T[];
  itemHeight?: UPDimension;
  height?: UPDimension;
  buffer?: number;
  keyField?: string;
  scrollTop?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPVirtualListRenderPayload<T>) => React.ReactNode;
  children?: React.ReactNode | ((payload: UPVirtualListRenderPayload<T>) => React.ReactNode);
  onUpdateScrollTop?: (scrollTop: number) => void;
  onScroll?: (scrollTop: number) => void;
};

function normalizeItem<T>(item: T, index: number): UPVirtualListRenderPayload<T>['item'] {
  if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
    return { ...(item as Record<string, unknown>), _virtualIndex: index } as UPVirtualListRenderPayload<T>['item'];
  }
  return { value: item, _virtualIndex: index } as UPVirtualListRenderPayload<T>['item'];
}

function calculationHeight(value: UPDimension | undefined) {
  if (value === undefined || value === '') return 500;
  if (typeof value === 'string' && value.trim().endsWith('%')) return 500;
  const parsed = getPx(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
}

function nativeHeight(value: UPDimension | undefined): UPDimension {
  return value === undefined || value === '' ? '100%' : value;
}

function positivePx(value: UPDimension | undefined, fallback: number) {
  const parsed = value === undefined || value === '' ? fallback : getPx(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const UPVirtualList = forwardRef<UPVirtualListRef, UPVirtualListProps>(function UPVirtualList(input, ref) {
  const props = { ...useUPConfig().props.virtualList, ...input } as Required<
    Pick<UPVirtualListProps, 'buffer' | 'height' | 'itemHeight' | 'keyField' | 'listData' | 'scrollTop'>
  > & UPVirtualListProps;
  const scrollRef = useRef<ScrollView>(null);
  const itemHeight = positivePx(props.itemHeight, 50);
  const containerHeight = calculationHeight(props.height);
  const [scrollTop, setScrollTop] = useState(() => Math.max(0, getPx(props.scrollTop ?? 0)));
  const buffer = Math.max(0, Math.floor(Number(props.buffer) || 0));
  const remain = Math.max(1, Math.ceil(containerHeight / itemHeight));
  const visibleCount = remain + buffer;
  const range = useMemo<UPVirtualListRange>(() => {
    const rawStart = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, rawStart - Math.floor(buffer / 2));
    const end = Math.min(props.listData.length, start + visibleCount);
    return { end, start };
  }, [buffer, itemHeight, props.listData.length, scrollTop, visibleCount]);

  useEffect(() => {
    const next = Math.max(0, getPx(props.scrollTop ?? 0));
    setScrollTop(next);
    scrollRef.current?.scrollTo({ animated: false, y: next });
  }, [props.scrollTop]);

  const scrollTo = useCallback((top: number) => {
    const next = Number.isFinite(top) && top > 0 ? top : 0;
    setScrollTop(next);
    scrollRef.current?.scrollTo({ animated: false, y: next });
  }, []);

  const scrollToTop = useCallback(() => scrollTo(0), [scrollTo]);
  const getVisibleRange = useCallback(() => range, [range]);

  useImperativeHandle(ref, () => ({ getVisibleRange, scrollTo, scrollToTop }), [
    getVisibleRange,
    scrollTo,
    scrollToTop,
  ]);

  const render = input.renderItem ?? (typeof input.children === 'function' ? input.children : undefined);
  const visibleItems = props.listData.slice(range.start, range.end).map((item, index) => ({
    item: normalizeItem(item, range.start + index),
    sourceIndex: range.start + index,
  }));
  const topHeight = range.start * itemHeight;
  const bottomHeight = Math.max(0, (props.listData.length - range.end) * itemHeight);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y;
    const normalized = Number.isFinite(next) && next > 0 ? next : 0;
    setScrollTop(normalized);
    input.onUpdateScrollTop?.(normalized);
    input.onScroll?.(normalized);
  };

  return (
    <View style={[{ height: nativeHeight(props.height), overflow: 'hidden' }, input.customStyle]} testID="up-virtual-list">
      <ScrollView
        onScroll={onScroll}
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ height: '100%' }}
        testID="up-virtual-list-scroll"
      >
        <View style={{ height: topHeight }} testID="up-virtual-list-top-spacer" />
        {visibleItems.map(({ item, sourceIndex }) => {
          const key =
            item && typeof item === 'object' && props.keyField in item
              ? String((item as Record<string, unknown>)[props.keyField])
              : String(sourceIndex);
          return (
            <View key={key} style={{ height: itemHeight }} testID={`up-virtual-list-item-${sourceIndex}`}>
              {render?.({ item, index: sourceIndex })}
            </View>
          );
        })}
        <View style={{ height: bottomHeight }} testID="up-virtual-list-bottom-spacer" />
      </ScrollView>
    </View>
  );
});
```

Create `src/components/virtual-list/index.ts`:

```ts
export * from './UPVirtualList';
```

- [ ] **Step 4: Add virtual-list defaults and exports**

Modify `src/config/defaults.ts`:

```ts
export type UPVirtualListDefaults = {
  listData: readonly unknown[];
  itemHeight: number;
  height: string;
  buffer: number;
  keyField: string;
  scrollTop: number;
};
```

Add to `UPProps`:

```ts
virtualList: UPVirtualListDefaults;
```

Add to `sourceDefaults.props`:

```ts
virtualList: Object.freeze({
  buffer: 4,
  height: '100%',
  itemHeight: 50,
  keyField: 'id',
  listData: Object.freeze([]) as readonly unknown[],
  scrollTop: 0,
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
virtualList?: Partial<UPProps['virtualList']>;
virtualList: { ...sourceDefaults.props.virtualList },
virtualList: { ...state.props.virtualList, ...overrides.props?.virtualList },
```

Modify `src/components/index.ts`:

```ts
export * from './virtual-list';
```

- [ ] **Step 5: Run virtual-list verification**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPVirtualList.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 3: UPRefreshVirtualList

**Files:**
- Create: `src/components/refresh-virtual-list/UPRefreshVirtualList.tsx`
- Create: `src/components/refresh-virtual-list/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPRefreshVirtualList.test.tsx`

**Interfaces:**
- Consumes: `UPPullRefresh`, `UPPullRefreshRef`, `UPVirtualList`, `UPVirtualListRef`, and `UPVirtualListRenderPayload`.
- Produces: `UPRefreshVirtualList`, `UPRefreshVirtualListProps`, `UPRefreshVirtualListRef`.
- Produces: global config key `props.refreshVirtualList`.

- [ ] **Step 1: Write failing refresh-virtual-list tests**

Create `tests/components/UPRefreshVirtualList.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPRefreshVirtualList, UPRoot, type UPRefreshVirtualListRef } from '../../src';

const data = Array.from({ length: 12 }, (_, index) => ({ id: index, name: `Item ${index}` }));

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders virtual rows inside pull refresh', () => {
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  expect(screen.getByTestId('up-refresh-virtual-list')).toBeTruthy();
  expect(screen.getByText('Item 0')).toBeTruthy();
  expect(screen.getByText('Item 8')).toBeTruthy();
  expect(screen.queryByText('Item 9')).toBeNull();
});

it('emits refresh from the composed pull wrapper', async () => {
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      onRefresh={onRefresh}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      threshold={30}
    />,
  );

  const root = screen.getByTestId('up-pull-refresh');
  fireEvent(root, 'touchStart', { nativeEvent: { pageY: 0, touches: [{ pageY: 0 }] } });
  fireEvent(root, 'touchMove', { nativeEvent: { pageY: 100, touches: [{ pageY: 100 }] } });
  await act(async () => fireEvent(root, 'touchEnd', { nativeEvent: { pageY: 100, touches: [] } }));

  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText('刷新中...')).toBeTruthy();
});

it('forwards virtual list scroll values', () => {
  const onScroll = jest.fn();
  const onUpdateScrollTop = jest.fn();
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      onScroll={onScroll}
      onUpdateScrollTop={onUpdateScrollTop}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  fireEvent.scroll(screen.getByTestId('up-virtual-list-scroll'), {
    nativeEvent: {
      contentOffset: { y: 80 },
      contentSize: { height: 240, width: 100 },
      layoutMeasurement: { height: 100, width: 100 },
    },
  });

  expect(onScroll).toHaveBeenCalledWith(80);
  expect(onUpdateScrollTop).toHaveBeenCalledWith(80);
  expect(screen.getByText('Item 2')).toBeTruthy();
});

it('exposes finishRefresh and virtual-list ref methods', async () => {
  const ref = React.createRef<UPRefreshVirtualListRef>();
  const screen = renderRoot(
    <UPRefreshVirtualList
      height={100}
      itemHeight={20}
      listData={data}
      ref={ref}
      refreshing
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />,
  );

  expect(screen.getByText('刷新中...')).toBeTruthy();
  await act(async () => ref.current?.finishRefresh());
  expect(screen.getByText('下拉刷新')).toBeTruthy();
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
  await act(async () => ref.current?.scrollTo(60));
  expect(ref.current?.getVisibleRange()).toEqual({ end: 12, start: 3 });
  await act(async () => ref.current?.scrollToTop());
  expect(ref.current?.getVisibleRange()).toEqual({ end: 9, start: 0 });
});
```

- [ ] **Step 2: Run failing refresh-virtual-list tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPRefreshVirtualList.test.tsx
```

Expected: FAIL because `UPRefreshVirtualList` is not exported.

- [ ] **Step 3: Implement `UPRefreshVirtualList`**

Create `src/components/refresh-virtual-list/UPRefreshVirtualList.tsx`:

```tsx
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { type UPDimension } from '../../utils';
import { UPPullRefresh, type UPPullRefreshRef } from '../pull-refresh';
import {
  UPVirtualList,
  type UPVirtualListRef,
  type UPVirtualListRenderPayload,
  type UPVirtualListRange,
} from '../virtual-list';

export type UPRefreshVirtualListRef = {
  finishRefresh: () => void;
  scrollTo: (top: number) => void;
  scrollToTop: () => void;
  getVisibleRange: () => UPVirtualListRange;
};

export type UPRefreshVirtualListProps<T = unknown> = {
  listData?: readonly T[];
  itemHeight?: UPDimension;
  height?: UPDimension;
  buffer?: number;
  keyField?: string;
  scrollTop?: UPDimension;
  threshold?: UPDimension;
  refreshing?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPVirtualListRenderPayload<T>) => React.ReactNode;
  children?: React.ReactNode | ((payload: UPVirtualListRenderPayload<T>) => React.ReactNode);
  onRefresh?: () => void;
  onScroll?: (scrollTop: number) => void;
  onUpdateScrollTop?: (scrollTop: number) => void;
};

export const UPRefreshVirtualList = forwardRef<UPRefreshVirtualListRef, UPRefreshVirtualListProps>(
  function UPRefreshVirtualList(input, ref) {
    const props = { ...useUPConfig().props.refreshVirtualList, ...input } as Required<
      Pick<UPRefreshVirtualListProps, 'buffer' | 'height' | 'itemHeight' | 'keyField' | 'listData' | 'threshold'>
    > & UPRefreshVirtualListProps;
    const pullRef = useRef<UPPullRefreshRef>(null);
    const listRef = useRef<UPVirtualListRef>(null);
    const [localRefreshing, setLocalRefreshing] = useState(false);
    const [localScrollTop, setLocalScrollTop] = useState(0);
    const refreshing = props.refreshing ?? localRefreshing;

    const finishRefresh = useCallback(() => {
      setLocalRefreshing(false);
      pullRef.current?.finishRefresh();
    }, []);

    const handleRefresh = useCallback(() => {
      setLocalRefreshing(true);
      input.onRefresh?.();
    }, [input.onRefresh]);

    const handleScroll = useCallback((next: number) => {
      setLocalScrollTop(next);
      input.onScroll?.(next);
    }, [input.onScroll]);

    const handleUpdateScrollTop = useCallback((next: number) => {
      setLocalScrollTop(next);
      input.onUpdateScrollTop?.(next);
    }, [input.onUpdateScrollTop]);

    useImperativeHandle(ref, () => ({
      finishRefresh,
      getVisibleRange: () => listRef.current?.getVisibleRange() ?? { end: 0, start: 0 },
      scrollTo: (top) => listRef.current?.scrollTo(top),
      scrollToTop: () => listRef.current?.scrollToTop(),
    }), [finishRefresh]);

    return (
      <View style={input.customStyle} testID="up-refresh-virtual-list">
        <UPPullRefresh
          height={props.height}
          onRefresh={handleRefresh}
          ref={pullRef}
          refreshing={refreshing}
          scrollTop={localScrollTop}
          threshold={props.threshold}
          useScrollView={false}
        >
          <UPVirtualList
            buffer={props.buffer}
            height={props.height}
            itemHeight={props.itemHeight}
            keyField={props.keyField}
            listData={props.listData}
            onScroll={handleScroll}
            onUpdateScrollTop={handleUpdateScrollTop}
            ref={listRef}
            renderItem={input.renderItem}
            scrollTop={props.scrollTop}
          >
            {input.children}
          </UPVirtualList>
        </UPPullRefresh>
      </View>
    );
  },
);
```

Create `src/components/refresh-virtual-list/index.ts`:

```ts
export * from './UPRefreshVirtualList';
```

- [ ] **Step 4: Add refresh-virtual-list defaults and exports**

Modify `src/config/defaults.ts`:

```ts
export type UPRefreshVirtualListDefaults = {
  listData: readonly unknown[];
  itemHeight: number;
  height: string;
  buffer: number;
  keyField: string;
  scrollTop: number;
  threshold: number;
  refreshing: boolean;
};
```

Add to `UPProps`:

```ts
refreshVirtualList: UPRefreshVirtualListDefaults;
```

Add to `sourceDefaults.props`:

```ts
refreshVirtualList: Object.freeze({
  buffer: 4,
  height: '100%',
  itemHeight: 50,
  keyField: 'id',
  listData: Object.freeze([]) as readonly unknown[],
  refreshing: false,
  scrollTop: 0,
  threshold: 50,
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
refreshVirtualList?: Partial<UPProps['refreshVirtualList']>;
refreshVirtualList: { ...sourceDefaults.props.refreshVirtualList },
refreshVirtualList: { ...state.props.refreshVirtualList, ...overrides.props?.refreshVirtualList },
```

Modify `src/components/index.ts`:

```ts
export * from './refresh-virtual-list';
```

- [ ] **Step 5: Run refresh-virtual-list verification**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPRefreshVirtualList.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 4: Docs, Examples, And Full Validation

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Test: full project validation commands

**Interfaces:**
- Consumes: public exports from Tasks 1 through 3.
- Produces: P30 user-facing examples and compatibility rows.

- [ ] **Step 1: Add compact examples**

Modify `example/App.tsx` imports:

```tsx
import { UPPullRefresh, UPRefreshVirtualList, UPVirtualList } from 'ultra-ui-rn';
```

Add example data near existing demo constants:

```tsx
const demoVirtualRows = Array.from({ length: 60 }, (_, index) => ({
  id: `virtual-${index}`,
  name: `Virtual row ${index + 1}`,
}));
```

Render compact examples near the existing list section:

```tsx
<Text style={styles.section}>List Enhancements</Text>
<UPPullRefresh
  height={140}
  onRefresh={() => UP.toast.default('Refresh requested')}
  showLoadmore
>
  <UPCell title="Pull refresh content" value="Drag down" />
</UPPullRefresh>
<UPVirtualList
  height={180}
  itemHeight={44}
  listData={demoVirtualRows}
  renderItem={({ item }) => <UPCell title={item.name} />}
/>
<UPRefreshVirtualList
  height={180}
  itemHeight={44}
  listData={demoVirtualRows}
  onRefresh={() => UP.toast.default('Virtual refresh requested')}
  renderItem={({ item }) => <UPCell title={item.name} />}
/>
```

- [ ] **Step 2: Update compatibility documentation**

Append to `docs/compatibility.md`:

```md
## P30 list enhancements

`UPPullRefresh` implements source-style pull distance, release threshold, refreshing state, optional internal `ScrollView`, and optional `UPLoadmore` footer with React Native core primitives. Exact CSS transition classes and page-level `preventDefault` behavior are not available on React Native.

`UPVirtualList` maps upstream `u-virtual-list` to a fixed-item-height native list. It renders top and bottom spacers plus only the visible buffered rows, and exposes `scrollTo`, `scrollToTop`, and `getVisibleRange`.

`UPRefreshVirtualList` composes `UPPullRefresh` and `UPVirtualList`; it does not duplicate virtual-list math. The host can control `refreshing` or call `finishRefresh()` on the ref after async work completes.
```

- [ ] **Step 3: Update gap matrix**

Insert before Deferred Source Components in `docs/gap-matrix.md`:

```md
## P30 List Enhancements

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-pull-refresh` | refreshing, threshold, damping, max distance, optional scroll-view, loadmore footer, scoped state slots | `UPPullRefresh`, render callbacks, `UPPullRefreshRef` | Core touch events drive source pull/release/refreshing states; optional `UPLoadmore` footer is wired to lower-edge detection | Emulated | `tests/components/UPPullRefresh.test.tsx` |
| `u-virtual-list` | list data, fixed item height, height, buffer, key field, scroll top, default slot | `UPVirtualList`, `renderItem`, `UPVirtualListRef` | Fixed-height spacer virtualization with numeric scroll callbacks and visible-range ref | Emulated | `tests/components/UPVirtualList.test.tsx` |
| `u-refresh-virtual-list` | pull refresh wrapper around virtual list, refresh, scroll, finish/scroll methods | `UPRefreshVirtualList`, `UPRefreshVirtualListRef` | Composition of `UPPullRefresh` and `UPVirtualList`; host controls or finishes refresh state | Emulated | `tests/components/UPRefreshVirtualList.test.tsx` |
| P30 list enhancement family | CSS transitions, page-level touch prevention, variable-height virtualization | Retained props / documented limits | React Native core replaces CSS and DOM scroll behavior; variable-height virtualization is deferred | No-op retained / deferred | Component prop types |
```

- [ ] **Step 4: Run focused P30 tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPPullRefresh.test.tsx tests/components/UPVirtualList.test.tsx tests/components/UPRefreshVirtualList.test.tsx
```

Expected: PASS.

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

Expected:

```text
npm test: PASS
npm run typecheck: PASS
npm run lint: PASS
npm run build: PASS
npm pack --dry-run: PASS
git diff --check: no whitespace errors
git status --short: shows only expected modified and untracked files from this worktree
```

- [ ] **Step 6: Handoff summary**

Report:

```text
- Added `UPPullRefresh`, `UPVirtualList`, and `UPRefreshVirtualList`.
- Kept P30 dependency-free; React Native core only.
- Updated exports, defaults, docs, examples, and tests.
- Validation results: npm test, typecheck, lint, build, pack dry-run, diff check.
- No git staging or commits were performed.
```
