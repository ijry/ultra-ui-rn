# Ultra UI React Native P31 Interaction Tools Design

## Goal

P31 adds the interaction-tool source components that can be implemented with existing package capabilities and no new native dependencies:

- `UPDragsort`: drag-to-reorder list/grid helper.
- `UPSignature`: canvas-backed signature pad with toolbar, undo, clear, and export hooks.
- `UPGuide`: full-screen onboarding guide with paging, skip/finish actions, and optional one-time storage.

The phase keeps source prop names where practical, uses React render callbacks for scoped slots, and documents React Native platform limits explicitly.

## Approved Decisions

- Work directly on `main`.
- Do not run `git add`, `git commit`, `git push`, `git reset`, or `git clean`.
- Modify files with `apply_patch`.
- Do not add new native dependencies for P31.
- Reuse React Native core primitives, existing overlay infrastructure, and existing `UPCanvas`.
- Keep API compatibility with uview-plus where practical.
- Treat CSS classes, `movable-area`, `uni` storage, page-level touch prevention, and exact CSS transitions as retained no-ops or host-adapter responsibilities.

## Scope

### In Scope

- Add `src/components/dragsort`.
- Add `src/components/signature`.
- Add `src/components/guide`.
- Add defaults and `UP.setConfig({ props })` merge support for `dragsort`, `signature`, and `guide`.
- Export all three components from the public component barrel.
- Add focused Jest tests for reorder math, disabled drag state, canvas draw calls, signature refs, guide paging, once storage, and callbacks.
- Add compact examples to `example/App.tsx`.
- Update `docs/compatibility.md` and `docs/gap-matrix.md`.

### Out of Scope

- Exact `movable-area` / `movable-view` physics.
- OS-level vibration behavior from `uni.vibrateShort`.
- Native image picker or file-system signing dependencies.
- Persisted guide state without an explicit storage adapter.
- Complex spotlight or element-target walkthroughs.
- Variable-size dragsort virtualization.
- Pixel-perfect source CSS transition timing.

## Architecture

### `UPDragsort`

`UPDragsort` owns local item order, measured item dimensions, and native drag state. It renders items in an absolute-positioned area and uses `PanResponder` to calculate the target index while dragging. It supports source `vertical`, `horizontal`, and `all` directions.

Core props:

- `initialList`
- `draggable`
- `vibrate`
- `direction`
- `columns`
- `itemHeight`
- `itemWidth`
- `customStyle`
- `renderItem`
- `renderHandler`
- `children`
- `onDragEnd`

Core behavior:

- `initialList` is copied into local order and updated when the prop reference changes.
- `direction="vertical"` maps drag `dy` to indexes with `itemHeight`.
- `direction="horizontal"` maps drag `dx` to indexes with `itemWidth`.
- `direction="all"` maps `dx` and `dy` into a grid index using `columns`, `itemWidth`, and `itemHeight`.
- Items with `draggable === false` and globally disabled lists ignore drag starts.
- Reordering emits `onDragEnd(nextList)` only when the order changes.
- `vibrate` is retained as a no-op because React Native core has no source-equivalent haptic API.
- A handler render prop restricts drag start to the handler region; without it, the whole item starts dragging.

Render mapping:

- Vue default slot becomes `renderItem({ item, index, dragging })` or a function child.
- Vue `handler` slot becomes `renderHandler({ item, index, dragging })`.
- Primitive labels render from `item.label` when no render function is supplied.

### `UPSignature`

`UPSignature` composes the existing `UPCanvas` with touch tracking. It stores path segments in memory so undo and redraw can work without querying native canvas pixels.

Core props:

- `width`
- `height`
- `bgColor`
- `color`
- `thickness`
- `showToolbar`
- `presetColors`
- `customStyle`
- `canvasProps`
- `onClear`
- `onConfirm`
- `onError`

Core ref methods:

- `clear(): void`
- `undo(): void`
- `confirm(): Promise<void>`
- `isEmpty(): boolean`
- `getPaths(): readonly UPSignaturePath[]`

Core behavior:

- Touch start begins a path and sets stroke style.
- Touch move draws line segments to the canvas and records points.
- Touch end closes the current path and pushes it onto `pathStack`.
- `undo()` removes the last path and redraws all remaining paths.
- `clear()` clears the stack and canvas and emits `onClear`.
- `confirm()` rejects empty signatures by returning early and emits `onConfirm(path)` only when canvas export succeeds.
- Export uses `UPCanvasRef.toTempFilePath({ fileType: 'png', quality: 1 })`.
- Export failures emit `onError(error)`.
- Toolbar uses existing `UPIcon`, `UPSlider`, and native press controls.

### `UPGuide`

`UPGuide` renders a root-level full-screen overlay. It uses a paged horizontal core `ScrollView`, simple dot indicators, and action buttons. It does not implement spotlight tours; the upstream component is a first-screen guide.

Core props:

- `show`
- `list`
- `storageKey`
- `once`
- `showSkip`
- `skipText`
- `nextText`
- `finishText`
- `indicator`
- `bgColor`
- `zIndex`
- `storage`
- `renderPage`
- `customStyle`
- `onUpdateShow`
- `onChange`
- `onSkip`
- `onFinish`
- `onClose`

Core ref methods:

- `open(): void`
- `close(remember?: boolean): void`
- `reset(): Promise<void>`

Storage adapter:

```ts
export type UPGuideStorage = {
  getItem: (key: string) => string | number | boolean | null | undefined | Promise<string | number | boolean | null | undefined>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};
```

Core behavior:

- `once=true` checks `storage` on mount/open; remembered guides stay hidden and emit `onUpdateShow(false)`.
- `close(true)` stores `"1"` through the adapter when `once=true`.
- Missing or failing storage is safe: the guide still functions for the current session.
- Next advances a page and emits `onChange({ current })`.
- Finish emits `onFinish()` then closes with remembering.
- Skip emits `onSkip()` then closes with remembering.
- Controlled `show` updates internal visibility and overlay state.

## Data Flow

1. Component props merge with `useUPConfig()` defaults.
2. Local interactive state derives from source props: dragsort order, signature path stack, guide visible/current.
3. Native events update local state through small deterministic helpers.
4. Public callbacks emit source-compatible payloads.
5. Ref methods expose source-style imperative controls.
6. Docs and tests describe retained no-op behavior rather than silently hiding platform gaps.

## Error Handling

- Empty `UPDragsort.initialList` renders an empty area and emits nothing.
- Invalid dragsort dimensions fall back to `50` px item height and `100` px item width.
- `UPDragsort` clamps target indexes to `0..list.length - 1`.
- `UPSignature.confirm()` returns without emitting `onConfirm` when there are no paths.
- `UPSignature` catches canvas export errors and forwards them through `onError`.
- `UPGuide` ignores empty `list` by rendering nothing and emitting no actions.
- `UPGuide` storage read/write/remove errors are swallowed to keep onboarding usable.

## Testing

Add focused tests:

- `tests/components/UPDragsort.test.tsx`
  - renders item labels and source order
  - vertical drag reorders items and emits `onDragEnd`
  - horizontal drag uses `itemWidth`
  - all-mode drag uses `columns`, `itemWidth`, and `itemHeight`
  - disabled items and global `draggable=false` do not reorder
  - render item and handler callbacks receive dragging state

- `tests/components/UPSignature.test.tsx`
  - renders canvas and toolbar
  - touch sequence records paths and calls canvas draw commands
  - `undo()` redraws remaining paths
  - `clear()` clears paths and emits `onClear`
  - `confirm()` emits exported path after canvas adapter export
  - empty confirm does not emit

- `tests/components/UPGuide.test.tsx`
  - hidden by default and visible when `show=true`
  - next button changes pages and emits `onChange`
  - skip emits `onSkip`, remembers, and closes
  - finish emits `onFinish`, remembers, and closes
  - remembered guides stay hidden with storage adapter
  - ref `open`, `close`, and `reset` work

Run:

- `npm test -- --runTestsByPath tests/components/UPDragsort.test.tsx tests/components/UPSignature.test.tsx tests/components/UPGuide.test.tsx`
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

- P31 adds no new native dependencies.
- `UPDragsort` uses deterministic PanResponder math instead of `movable-area` physics.
- `UPSignature` uses `UPCanvas` and export support depends on the configured canvas adapter.
- `UPGuide` one-time memory requires a host storage adapter.

## Acceptance Criteria

- `UPDragsort`, `UPSignature`, and `UPGuide` are exported from the package.
- Defaults and `UP.setConfig({ props })` work for all three components.
- Focused P31 tests pass.
- Full project validation passes.
- No new native dependencies are added.
- No git staging or commits are performed.
