# React Native P5 Scroll Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port source-compatible safe-area, announcement, expandable-content, sticky, and back-to-top components using explicit React Native scroll-host ownership.

**Architecture:** `UPStatusBar` and `UPSafeBottom` consume `react-native-safe-area-context`. `UPNoticeBar` and `UPReadMore` use React Native core layout/animation primitives with source props retained. `UPScrollHost` owns a single native scroll ref and scroll offset; `UPSticky` and `UPBackTop` consume that explicit contract instead of assuming a global page scroll API.

**Tech Stack:** React 19, React Native 0.86 core components and `Animated`, `react-native-safe-area-context`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults/events and use `UP*` PascalCase exports.
- Add all default tables to `UP.props` and merge overrides in `setUPConfig`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Use an explicit `UPScrollHost` rather than undocumented global scroll assumptions.

---

### Task 1: Safe-Area and Static Surface Components

**Files:**
- Create: `src/components/status-bar/UPStatusBar.tsx`, `src/components/status-bar/index.ts`, `src/components/safe-bottom/UPSafeBottom.tsx`, `src/components/safe-bottom/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPScrollSurfaces.test.tsx`

**Interfaces:**
- `UPStatusBarProps` accepts `bgColor`, `height`, `customStyle`, and `onUpdateHeight(height)`.
- `UPSafeBottomProps` renders the bottom safe-area inset and accepts `customStyle`.

- [ ] **Step 1: Write failing component tests**

```tsx
const screen = renderRoot(<UPStatusBar bgColor="#111" height={24} />);
expect(flatten(screen.getByTestId('up-status-bar').props.style)).toMatchObject({ height: 24 });
expect(screen.getByTestId('up-safe-bottom')).toBeTruthy();
```

- [ ] **Step 2: Run the focused test to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx`

Expected: FAIL because the P5 exports do not exist.

- [ ] **Step 3: Add defaults, config merge paths, components, and exports**

```tsx
const inset = useSafeAreaInsets();
const height = input.height ?? inset.top;
return <View style={[{ height, backgroundColor: props.bgColor }, input.customStyle]} />;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Notice Bar and Expandable Content

**Files:**
- Create: `src/components/notice-bar/UPNoticeBar.tsx`, `src/components/notice-bar/index.ts`, `src/components/read-more/UPReadMore.tsx`, `src/components/read-more/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPScrollSurfaces.test.tsx`

**Interfaces:**
- `UPNoticeBarProps` retains all source defaults and emits `onClick(index)` and `onClose()`.
- `UPReadMoreProps` accepts source display props, measures content with `onLayout`, and emits `onOpen(name)` / `onClose(name)`.

- [ ] **Step 1: Extend the focused tests**

```tsx
fireEvent.press(screen.getByTestId('up-notice-bar-close'));
expect(onClose).toHaveBeenCalledTimes(1);
fireEvent(screen.getByTestId('up-read-more-content'), 'layout', { nativeEvent: { layout: { height: 500 } } });
fireEvent.press(screen.getByText('展开阅读全文'));
expect(onOpen).toHaveBeenCalledWith('article');
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx`

Expected: FAIL because the new exports are unavailable.

- [ ] **Step 3: Implement measured expansion and source notice modes**

```tsx
const collapsed = isLongContent && status === 'close';
return <View style={{ maxHeight: collapsed ? getPx(props.showHeight) : undefined, overflow: 'hidden' }} />;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 3: Explicit Scroll Host, Sticky, and Back Top

**Files:**
- Create: `src/components/scroll-host/UPScrollHost.tsx`, `src/components/scroll-host/index.ts`, `src/components/sticky/UPSticky.tsx`, `src/components/sticky/index.ts`, `src/components/back-top/UPBackTop.tsx`, `src/components/back-top/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPScrollSurfaces.test.tsx`

**Interfaces:**
- `UPScrollHost` accepts `scrollRef`, observes `onScroll`, publishes `scrollY`, and provides `scrollToTop(duration)`.
- `UPSticky` retains source props and emits `onFixed(index)` / `onUnfixed(index)` based on host scroll position.
- `UPBackTop` uses explicit `scrollTop` when supplied or the nearest `UPScrollHost`; it emits `onClick()` after calling `scrollToTop(duration)`.

- [ ] **Step 1: Extend focused host and consumer tests**

```tsx
fireEvent.scroll(screen.getByTestId('up-scroll-host'), { nativeEvent: { contentOffset: { y: 120 } } });
expect(screen.getByTestId('up-sticky-fixed')).toBeTruthy();
fireEvent.press(screen.getByTestId('up-back-top'));
expect(scrollRef.current?.scrollTo).toHaveBeenCalledWith({ animated: true, y: 0 });
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx`

Expected: FAIL because host and scroll consumers are unavailable.

- [ ] **Step 3: Implement the explicit host contract and source surfaces**

```tsx
const scrollTop = input.scrollTop ?? host?.scrollY ?? 0;
const visible = getPx(scrollTop) > getPx(props.top);
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPScrollSurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 4: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

- [ ] **Step 1: Add source-state examples and compatibility rows**

```tsx
<UPScrollHost scrollRef={scrollRef}>
  <UPSticky><UPNoticeBar text="Announcement" /></UPSticky>
  <UPBackTop />
</UPScrollHost>
```

- [ ] **Step 2: Document exact emulations and retained no-ops**

Mark horizontal notice marquee and rich-content measurement as RN-core emulations; mark `url`, `linkType`, and CSS `customClass` behavior as retained no-ops where no RN navigation/CSS adapter exists.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
