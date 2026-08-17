# React Native P10 List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the stable `u-list` and `u-list-item` family with source defaults, vertical edge callbacks, controlled position updates, pull-to-refresh mapping, and registered item anchors.

**Architecture:** `UPList` wraps a native vertical `ScrollView`, obtains source component defaults from subscribable `UP.props`, and emits source scroll/upper/lower callbacks when native offset crosses the configured thresholds. A list context accepts `UPListItem` layout registrations, so source `scrollIntoView` targets resolve to the nearest native item anchor without requiring a global DOM or a virtual-list runtime.

**Tech Stack:** React 19, React Native 0.86 core `ScrollView`, `RefreshControl`, and `View`; TypeScript 5.9; Jest; React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add all default tables to subscribable `UP.props` and merge overrides in `setUPConfig`, so mounted components react to `UP.setConfig()`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.
- `scrollIntoView` resolves registered `UPListItem.anchor` values only; native React has no document-ID scroll runtime.
- React Native core does not expose source virtual preloading, nvue `offsetAccuracy`, mini-program `enableFlex`/`enableBackToTop`, or refresher pulling/restore/abort lifecycle callbacks.

---

### Task 1: List Defaults, Anchor Context, and List Item

**Files:**
- Create: `src/components/list/context.ts`, `src/components/list/UPListItem.tsx`, `src/components/list/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPList.test.tsx`

**Interfaces:**
- Produces `UPListItemProps` with source `anchor?: string | number`, native `customStyle`, `customClass`, and `children`.
- Produces `UPListAnchorContextValue` with `registerAnchor(anchor: string | number, y: number): void`; the context is exported only inside the list component directory.
- Adds `UPProps['list']` and `UPProps['listItem']`, plus corresponding partial overrides to `UPConfigOverrides['props']`.

- [ ] **Step 1: Write the failing defaults and anchor-item test**

```tsx
it('uses source list defaults and renders registered source item anchors', () => {
  act(() => {
    UP.setConfig({ props: { list: { height: '100px', showScrollbar: true } } });
  });
  const screen = renderRoot(
    <UPList>
      <UPListItem anchor="profile"><Text>Profile</Text></UPListItem>
    </UPList>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-list').props.style))
    .toEqual(expect.objectContaining({ height: 100 }));
  expect(screen.getByTestId('up-list').props.showsVerticalScrollIndicator).toBe(true);
  expect(screen.getByTestId('up-list-item-profile')).toBeTruthy();
});
```

- [ ] **Step 2: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPList.test.tsx`

Expected: FAIL because `UPList` and `UPListItem` are unavailable.

- [ ] **Step 3: Add defaults, store merge paths, and item layout registration**

```tsx
export type UPListDefaults = {
  showScrollbar: boolean;
  lowerThreshold: number;
  upperThreshold: number;
  scrollTop: number;
  offsetAccuracy: number;
  enableFlex: boolean;
  pagingEnabled: boolean;
  scrollable: boolean;
  scrollIntoView: string;
  scrollWithAnimation: boolean;
  enableBackToTop: boolean;
  height: number;
  width: number;
  preLoadScreen: number;
  refresherEnabled: boolean;
  refresherThreshold: number;
  refresherDefaultStyle: string;
  refresherBackground: string;
  refresherTriggered: boolean;
};

export function UPListItem(input: UPListItemProps): React.JSX.Element {
  const list = useUPListAnchorContext();
  const registerLayout = (event: LayoutChangeEvent) => {
    if (input.anchor !== undefined && input.anchor !== '') {
      list?.registerAnchor(input.anchor, event.nativeEvent.layout.y);
    }
  };
  return <View onLayout={registerLayout} testID={`up-list-item-${input.anchor ?? ''}`}>{input.children}</View>;
}
```

Add `list` and `listItem` to the `UPProps` type, `sourceDefaults.props`, `createSourceState`, and `setUPConfig` merge path. `UPListItem` only registers layout with its nearest list context; outside a list it still renders its children.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPList.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Core Source List Scroll Surface

**Files:**
- Create: `src/components/list/UPList.tsx`
- Modify: `src/components/list/index.ts`
- Test: `tests/components/UPList.test.tsx`

**Interfaces:**
- Produces `UPListProps` with all source props: `showScrollbar`, `lowerThreshold`, `upperThreshold`, `scrollTop`, `offsetAccuracy`, `enableFlex`, `pagingEnabled`, `scrollable`, `scrollIntoView`, `scrollWithAnimation`, `enableBackToTop`, `height`, `width`, `preLoadScreen`, `refresherEnabled`, `refresherThreshold`, `refresherDefaultStyle`, `refresherBackground`, and `refresherTriggered`.
- Event mappings are `onScroll(scrollTop: number)`, `onScrollToLower()`, `onScrollToUpper()`, and `onRefresherRefresh()`.
- Retains `onRefresherPulling`, `onRefresherRestore`, and `onRefresherAbort` as typed no-op source callbacks.

- [ ] **Step 1: Extend the focused suite with source edge and refresh events**

```tsx
it('emits source scroll offsets and threshold edge aliases once per entry', () => {
  const onScroll = jest.fn();
  const onLower = jest.fn();
  const onUpper = jest.fn();
  const onRefresh = jest.fn();
  const screen = renderRoot(
    <UPList
      height={200}
      lowerThreshold={20}
      onRefresherRefresh={onRefresh}
      onScroll={onScroll}
      onScrollToLower={onLower}
      onScrollToUpper={onUpper}
      refresherEnabled
    >
      <Text>Rows</Text>
    </UPList>,
  );

  fireEvent.scroll(screen.getByTestId('up-list'), {
    nativeEvent: {
      contentOffset: { x: 0, y: 0 },
      contentSize: { height: 1000, width: 320 },
      layoutMeasurement: { height: 200, width: 320 },
    },
  });
  expect(onScroll).toHaveBeenCalledWith(0);
  expect(onUpper).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByTestId('up-list'), {
    nativeEvent: {
      contentOffset: { x: 0, y: 780 },
      contentSize: { height: 1000, width: 320 },
      layoutMeasurement: { height: 200, width: 320 },
    },
  });
  expect(onLower).toHaveBeenCalledTimes(1);
  fireEvent(screen.getByTestId('up-list-refresh'), 'refresh');
  expect(onRefresh).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused suite to verify core list behavior fails**

Run: `npm test -- --runInBand tests/components/UPList.test.tsx`

Expected: FAIL because `UPList` is unavailable.

- [ ] **Step 3: Implement source scroll, threshold, controlled position, and refresh mappings**

```tsx
const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  const offset = contentOffset.y;
  const atUpper = offset <= getPx(props.upperThreshold ?? 0);
  const atLower = offset + layoutMeasurement.height >= contentSize.height - getPx(props.lowerThreshold ?? 50);
  input.onScroll?.(offset);
  if (atUpper && !edgeState.current.upper) input.onScrollToUpper?.();
  if (atLower && !edgeState.current.lower) input.onScrollToLower?.();
  edgeState.current = { lower: atLower, upper: atUpper };
};

useEffect(() => {
  scrollRef.current?.scrollTo({
    animated: Boolean(props.scrollWithAnimation),
    y: getPx(props.scrollTop ?? 0),
  });
}, [props.scrollTop, props.scrollWithAnimation]);
```

Render a native vertical `ScrollView` with source height/width, `pagingEnabled`, `scrollEnabled`, and vertical scrollbar visibility. If `refresherEnabled`, supply a core `RefreshControl` with `refreshing={Boolean(props.refresherTriggered)}`, `onRefresh={input.onRefresherRefresh}`, and the source refresher background mapped to `progressBackgroundColor`. Create an anchor map in `UPList`; on `scrollIntoView` changes or a matching `UPListItem` layout registration, scroll to the registered y coordinate using `scrollWithAnimation`.

- [ ] **Step 4: Run focused tests, typecheck, and lint**

Run: `npm test -- --runInBand tests/components/UPList.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

### Task 3: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

**Interfaces:**
- Documents `UPList` / `UPListItem` source mappings, vertical threshold events, source alias names, native `RefreshControl`, and the registered-anchor restriction for `scrollIntoView`.

- [ ] **Step 1: Add a source list example**

```tsx
<UPList height={180} lowerThreshold={20} onScrollToLower={loadNextPage}>
  <UPListItem anchor="profile"><UPCell title="Profile" /></UPListItem>
  <UPListItem anchor="settings"><UPCell title="Settings" /></UPListItem>
</UPList>
```

- [ ] **Step 2: Document React Native list limits**

Document that Vue child slots map to `children`, native `RefreshControl` maps only `refresherEnabled`, `refresherTriggered`, `refresherBackground`, and `onRefresherRefresh`, and `scrollIntoView` resolves only `UPListItem.anchor` values. State that source virtual preloading, nvue offset accuracy, mini-program flex/back-to-top behavior, custom refresh threshold/style, CSS classes, and refresher pulling/restore/abort callbacks remain typed no-ops.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
