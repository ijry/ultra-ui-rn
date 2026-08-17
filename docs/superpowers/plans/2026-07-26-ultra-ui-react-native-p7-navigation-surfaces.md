# React Native P7 Navigation Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port source-compatible tab, pagination, toolbar, and horizontal-scroll navigation surfaces without additional native dependencies.

**Architecture:** Each component resolves public defaults from subscribable `UP.props`. `UPTabs` measures native tab layouts to animate/position its source indicator and center the active tab in a horizontal `ScrollView`; `UPPagination` implements source page-size selection through a React Native core `Modal`; `UPScrollList` derives indicator position and edge events from a horizontal native scroll event.

**Tech Stack:** React 19, React Native 0.86 core `ScrollView`, `Modal`, `Pressable`, `View`, `Text`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults/events and use `UP*` PascalCase exports.
- Add all default tables to `UP.props` and merge overrides in `setUPConfig`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.
- Use accessible roles, selected/disabled state, and at least 44px press targets for navigation controls.

---

### Task 1: Toolbar and Scroll List

**Files:**
- Create: `src/components/toolbar/UPToolbar.tsx`, `src/components/toolbar/index.ts`, `src/components/scroll-list/UPScrollList.tsx`, `src/components/scroll-list/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPNavigationSurfaces.test.tsx`

**Interfaces:**
- `UPToolbarProps` supports source visibility, labels, colors, title, right slot mapping, and `onCancel` / `onConfirm`.
- `UPScrollListProps` supports source indicator metrics/colors/style and `onLeft` / `onRight` scroll-edge callbacks.

- [ ] **Step 1: Write failing source behavior tests**

```tsx
fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
expect(onConfirm).toHaveBeenCalledTimes(1);
fireEvent.scroll(screen.getByTestId('up-scroll-list'), {
  nativeEvent: { contentOffset: { x: 80, y: 0 }, contentSize: { width: 180, height: 40 }, layoutMeasurement: { width: 100, height: 40 } },
});
expect(onRight).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx`

Expected: FAIL because P7 exports are unavailable.

- [ ] **Step 3: Implement defaults, edge tracking, and native core surfaces**

```tsx
const progress = maxOffset > 0 ? Math.min(1, Math.max(0, offsetX / maxOffset)) : 0;
const indicatorX = (getPx(props.indicatorWidth) - getPx(props.indicatorBarWidth)) * progress;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Tabs

**Files:**
- Create: `src/components/tabs/UPTabs.tsx`, `src/components/tabs/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPNavigationSurfaces.test.tsx`

**Interfaces:**
- `UPTabsProps` supports source list/item keys, current aliases, active/inactive/item styling, line metrics, scrollable/shape modes, item icons/badges, and click/change/long-press callbacks.

- [ ] **Step 1: Extend focused tests for source event semantics**

```tsx
fireEvent.press(screen.getByTestId('up-tabs-item-1'));
expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }), 1);
expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }), 1);
expect(onUpdateCurrent).toHaveBeenCalledWith(1);
```

- [ ] **Step 2: Run the focused suite to verify it fails**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx`

Expected: FAIL because `UPTabs` is unavailable.

- [ ] **Step 3: Implement source selection, native measurement, and scroll centering**

```tsx
const activeFrame = frames[current];
const indicatorLeft = activeFrame ? activeFrame.x + (activeFrame.width - lineWidth) / 2 : 0;
scrollRef.current?.scrollTo({ animated: true, x: Math.max(0, indicatorLeft - containerWidth / 2) });
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 3: Pagination

**Files:**
- Create: `src/components/pagination/UPPagination.tsx`, `src/components/pagination/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPNavigationSurfaces.test.tsx`

**Interfaces:**
- `UPPaginationProps` supports source page/current total inputs, labels/colors, page size choices, source layout string, single-page hiding, and current/page-size callbacks.

- [ ] **Step 1: Extend focused tests for page navigation and size selection**

```tsx
fireEvent.press(screen.getByTestId('up-pagination-next'));
expect(onCurrentChange).toHaveBeenCalledWith(2);
fireEvent.press(screen.getByTestId('up-pagination-size-trigger'));
fireEvent.press(screen.getByTestId('up-pagination-size-20'));
expect(onSizeChange).toHaveBeenCalledWith(20);
```

- [ ] **Step 2: Run the focused suite to verify it fails**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx`

Expected: FAIL because `UPPagination` is unavailable.

- [ ] **Step 3: Implement source page-range calculation and core Modal size picker**

```tsx
const totalPages = Math.max(1, Math.ceil(total / pageSize));
const current = Math.min(totalPages, Math.max(1, currentPage));
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPNavigationSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 4: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

- [ ] **Step 1: Add navigation surface examples**

```tsx
<UPTabs current={tab} list={[{ name: 'News' }, { name: 'Saved' }]} onUpdateCurrent={setTab} />
<UPPagination currentPage={page} total={95} onCurrentChange={setPage} />
<UPToolbar title="Filters" onCancel={close} onConfirm={apply} />
```

- [ ] **Step 2: Document exact React Native emulations and retained no-ops**

Document Modal-based page-size selection, RN layout indicator approximation, `lineBgSize` / CSS string styles, and `customClass` as no-op retained where applicable.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
