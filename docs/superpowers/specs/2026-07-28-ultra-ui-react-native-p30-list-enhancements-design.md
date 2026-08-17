# Ultra UI React Native P30 List Enhancements Design

## Goal

P30 adds the remaining source list helpers that fit React Native core without new native dependencies:

- `UPPullRefresh`: source-compatible pull-to-refresh wrapper with optional load-more footer.
- `UPVirtualList`: fixed-height virtual list for large in-memory arrays.
- `UPRefreshVirtualList`: convenience composition of pull refresh plus virtual list.

The design extends the existing P10 `UPList` and `UPLoadmore` work instead of introducing a second scrolling abstraction.

## Approved Decisions

- Work directly on `main`; do not create a branch or worktree.
- Do not run `git add`, `git commit`, `git push`, `git reset`, or `git clean`.
- Use only React Native core primitives already available in the package.
- Do not add native dependencies for this phase.
- Implement virtualization with fixed item height only, matching upstream `u-virtual-list`.
- Preserve source-compatible prop names while using React render callbacks for scoped slots.
- Treat exact source CSS transitions and `preventDefault` touch behavior as no-op retained behavior on React Native.

## Scope

### In Scope

- Add `src/components/pull-refresh`.
- Add `src/components/virtual-list`.
- Add `src/components/refresh-virtual-list`.
- Add default props and config merge support for `pullRefresh`, `virtualList`, and `refreshVirtualList`.
- Export all three components from `src/components/index.ts`.
- Add focused Jest tests for pull gesture state, refresh callbacks, load-more callbacks, visible-range calculation, scroll callbacks, imperative refs, and composition.
- Add compact examples to `example/App.tsx`.
- Update `docs/compatibility.md` and `docs/gap-matrix.md`.

### Out of Scope

- Variable-height virtualization.
- Masonry or waterfall layout.
- `FlatList` data-provider abstractions beyond the source fixed-height behavior.
- Native refresh threshold customization beyond component-owned gesture handling.
- Platform page-level scroll interception.
- Exact CSS easing, transition classes, or `preventDefault` semantics.

## Architecture

### `UPPullRefresh`

`UPPullRefresh` owns source-style refresh state and gesture interpretation. It renders a refresh header above content, translates content down while pulling, and emits `onRefresh` when the pull distance crosses `threshold`.

Core props:

- `refreshing`
- `threshold`
- `damping`
- `maxDistance`
- `showLoadmore`
- `loadmoreProps`
- `useScrollView`
- `enableBackToTop`
- `lowerThreshold`
- `scrollTop`
- `height`
- `customStyle`
- `children`
- `pull`
- `release`
- `refreshingNode`
- `onRefresh`
- `onLoadmore`
- `onScroll`

Core ref methods:

- `startRefresh(): void`
- `finishRefresh(): void`
- `resetRefresh(): void`

Behavior:

- Controlled `refreshing=true` forces status to `refreshing` and distance to `threshold`.
- Controlled `refreshing=false` resets distance and status to `pull`.
- Downward drag from top updates distance with `damping`, capped by `maxDistance`.
- Releasing above `threshold` emits `onRefresh` and keeps the header open.
- Releasing below `threshold` resets immediately.
- If `useScrollView=true`, children render in a core `ScrollView`; lower edge detection emits `onLoadmore` only when `showLoadmore` is true and `loadmoreProps.status === 'loadmore'`.
- If `useScrollView=false`, children render in a plain `View`; load-more footer still renders.

React render props replace upstream scoped slots:

- `pull({ distance, threshold })`
- `release({ distance, threshold })`
- `refreshingNode`

### `UPVirtualList`

`UPVirtualList` virtualizes a fixed-height data list. It keeps the source mental model: top spacer, visible rows, bottom spacer, and scroll-derived `scrollTop`.

Core props:

- `listData`
- `itemHeight`
- `height`
- `buffer`
- `keyField`
- `scrollTop`
- `customStyle`
- `renderItem`
- `children`
- `onUpdateScrollTop`
- `onScroll`

Core ref methods:

- `scrollTo(top: number): void`
- `scrollToTop(): void`
- `getVisibleRange(): { start: number; end: number }`

Behavior:

- Height uses existing `getPx` conversion. Percent heights fall back to `500` for calculations but still allow native style height when possible.
- `remain = max(1, ceil(containerHeight / itemHeight))`.
- `visibleCount = remain + buffer`.
- `start = max(0, floor(scrollTop / itemHeight) - floor(buffer / 2))`.
- `end = min(listData.length, start + visibleCount)`.
- Visible items receive `_virtualIndex` on cloned object values. Primitive values are wrapped as `{ value, _virtualIndex }` for render consistency.
- `renderItem({ item, index })` is the primary API. A function child with the same signature is also accepted for source slot compatibility.
- Scroll events emit `onUpdateScrollTop(scrollTop)` and `onScroll(scrollTop)`.

### `UPRefreshVirtualList`

`UPRefreshVirtualList` composes `UPPullRefresh` and `UPVirtualList`. It owns no separate rendering engine.

Core props:

- `listData`
- `itemHeight`
- `height`
- `buffer`
- `keyField`
- `refreshing`
- `renderItem`
- `children`
- `onRefresh`
- `onScroll`
- `onUpdateScrollTop`

Core ref methods:

- `finishRefresh(): void`
- `scrollTo(top: number): void`
- `scrollToTop(): void`
- `getVisibleRange(): { start: number; end: number }`

Behavior:

- `refreshing` can be controlled by the host. If omitted, the component manages local refreshing state and clears it via `finishRefresh()`.
- `onRefresh` fires from `UPPullRefresh`.
- `scrollTo` and `scrollToTop` forward to `UPVirtualList`.
- `onScroll` and `onUpdateScrollTop` forward virtual-list scroll values.

## Data Flow

1. Component props merge with `useUPConfig()` defaults.
2. Pull refresh normalizes gesture distance and refresh status.
3. Virtual list normalizes height, item height, and scroll offset.
4. Scroll events update edge status or visible range.
5. Source-compatible callbacks emit simple numeric payloads.
6. Composition component forwards callbacks and ref methods without duplicating list math.

## Error Handling

- Empty `listData` renders only spacers and no rows.
- Non-positive `itemHeight` is normalized to `1` to avoid division by zero.
- Non-finite scroll offsets are normalized to `0`.
- Missing `renderItem` or function child renders `null` rows instead of throwing.
- Invalid `height` strings use `500` for virtual range calculations while preserving native layout style where possible.

## Testing

Add focused tests:

- `tests/components/UPPullRefresh.test.tsx`
  - default header text and controlled refreshing state
  - pull below threshold resets without callback
  - pull past threshold emits refresh once
  - scroll lower emits loadmore only in `loadmore` status
  - custom pull/release/refreshing render nodes

- `tests/components/UPVirtualList.test.tsx`
  - initial visible rows and spacer heights
  - scroll updates visible range and callbacks
  - controlled `scrollTop` updates visible range
  - primitive data rendering
  - ref `scrollToTop` and `getVisibleRange`

- `tests/components/UPRefreshVirtualList.test.tsx`
  - composed refresh callback
  - composed virtual rows
  - `finishRefresh`
  - forwarded scroll callbacks and ref methods

Run:

- `npm test -- --runTestsByPath tests/components/UPPullRefresh.test.tsx tests/components/UPVirtualList.test.tsx tests/components/UPRefreshVirtualList.test.tsx`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm pack --dry-run`
- `git diff --check`

## Documentation

Update:

- `example/App.tsx`
- `docs/compatibility.md`
- `docs/gap-matrix.md`

Documentation must state:

- P30 uses React Native core only.
- `UPVirtualList` supports fixed item heights.
- `UPPullRefresh` implements source-style pull state in component logic; exact CSS transition and page-level scroll prevention are unavailable.
- `UPRefreshVirtualList` is composition, not a separate renderer.

## Acceptance Criteria

- `UPPullRefresh`, `UPVirtualList`, and `UPRefreshVirtualList` are exported from the package.
- Defaults and `UP.setConfig({ props })` work for all three components.
- Focused P30 tests pass.
- Full project validation passes.
- No new native dependencies are added.
- No git staging or commits are performed.
