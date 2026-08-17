# React Native P17 Album Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible `UPAlbum` image grids with host-owned preview callbacks.

**Architecture:** `UPAlbum` merges `useUPConfig` defaults, resolves source URL entries, and renders each item through `UPImage`. It builds fixed or wrapping rows, obtains one-image aspect ratios through `Image.getSize`, and uses a measured square fallback with no viewer dependency.

**Tech Stack:** React 19, React Native core layout/image APIs, TypeScript, Jest, React Native Testing Library, existing `UPImage`, `getPx`, and `UP` configuration.

## Global Constraints

- Port only uview-plus 3.8.86 `u-album`; do not add viewer, upload, cache, or runtime dependencies.
- Export `UPAlbum`, `UPAlbumProps`, `UPAlbumItem`, and `UPAlbumPreviewEvent`.
- `onPreview({ urls, currentIndex })` replaces source image preview. Host applications own viewer UI; `previewFullImage` remains compatibility only.
- Preserve source defaults: `singleSize=180`, `multipleSize=70`, `space=6`, `maxCount=9`, `rowCount=3`, `previewFullImage=true`, `showMore=true`, `autoWrap=false`, `singleMode='scaleToFill'`, and `multipleMode='aspectFill'`.
- `UP.setConfig({ props: { album: ... } })` updates unresolved mounted props; explicit props take precedence.
- Keep `customClass` and non-pixel `unit` as typed no-ops; use `customStyle` for native styling.
- Do not commit, push, create a worktree, reset, clean, delete unrelated files, or modify intentional dirty state.

## File Structure

- `src/components/album/UPAlbum.tsx`: public API, source normalization, sizing, layout, overflow overlay, and callbacks.
- `src/components/album/index.ts` and `src/components/index.ts`: public exports.
- `src/config/defaults.ts` and `src/config/store.ts`: frozen source values and reactive config paths.
- `tests/components/UPAlbum.test.tsx`: deterministic component contract suite.
- `example/App.tsx`, `README.md`, `docs/compatibility.md`, and `docs/gap-matrix.md`: example and user-facing documentation.

### Task 1: Define Failing Album Contract Tests

**Files:**
- Create: `tests/components/UPAlbum.test.tsx`

**Interfaces:**
- Consumes package-root `UP`, `UPAlbum`, `UPRoot`, and `UPAlbumPreviewEvent`.
- Requires IDs: `up-album`, `up-album-row-<index>`, `up-album-item-<index>`, and `up-album-more`.

- [ ] Create a deterministic `Image.getSize` spy. The default invokes its success callback with `(400, 200)`; individual tests invoke failure. Use `UPRoot` for every render and restore the spy after the suite.
- [ ] Test string URLs, keyed object URLs, `src` fallback, fixed rows (`maxCount=4`, `rowCount=3`), `space=8`, suppressed fifth item, `+1`, final-row/final-column spacing, and an `autoWrap` single-row layout with native `flexWrap`.
- [ ] Test one-image ratio sizing: a `400x200` image with `singleSize=180` produces a `180x90` native frame. On failed metadata and a measured root width of `200`, require the `120x120` fallback frame.
- [ ] Test image and overlay presses emit `{ currentIndex: 1, urls: ['a', 'b', 'c'] }` for a `maxCount=2` album even when `previewFullImage=false`. Test shape/radius, `multipleMode`, and `onAlbumWidth(196)` for three 60px items separated by 8px.
- [ ] Test mounted global config reactivity with `UP.setConfig({ props: { album: { maxCount: 1, multipleSize: 48, urls: ['configured'] } } })`, then rerender with explicit values to prove prop precedence.
- [ ] Run `npm test -- --runInBand tests/components/UPAlbum.test.tsx`; expect a missing API failure before implementation.

### Task 2: Add Defaults, Store Paths, and Exports

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `src/components/album/index.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces `UPAlbumDefaults`, `UPProps['album']`, and `UPConfigOverrides['props']['album']`.
- Publishes Task 3 component/value types at the package root.

- [ ] Define `UPAlbumDefaults` with `urls`, `keyName`, `singleSize`, `multipleSize`, `space`, `singleMode`, `multipleMode`, `maxCount`, `previewFullImage`, `rowCount`, `showMore`, `autoWrap`, `unit`, and `stop`.
- [ ] Add `album: UPAlbumDefaults` to `UPProps` and frozen source values exactly matching the Global Constraints, including `urls: Object.freeze([]) as readonly unknown[]`.
- [ ] Add `album?: Partial<UPProps['album']>` to overrides, `album: { ...sourceDefaults.props.album }` to `createSourceState`, and `album: { ...state.props.album, ...overrides.props?.album }` to `setUPConfig`.
- [ ] Create `src/components/album/index.ts` with `export * from './UPAlbum';` and add `export * from './album';` to the components barrel. Keep root export unchanged.
- [ ] Run `npm run typecheck`; config paths must typecheck before component creation.

### Task 3: Implement `UPAlbum`

**Files:**
- Create: `src/components/album/UPAlbum.tsx`

**Interfaces:**
- Consumes `useUPConfig().props.album`, `getPx`, `UPDimension`, and `UPImage`.
- Produces `UPAlbumItem`, `UPAlbumPreviewEvent`, `UPAlbumProps`, and `UPAlbum`.

- [ ] Define source-compatible props and types. `UPAlbumItem` is `string | Record<string, unknown>`; preview events are `{ urls: string[]; currentIndex: number }`. Preserve all listed source props plus `customStyle`, typed deprecated `customClass`, `onPreview`, and `onAlbumWidth`.
- [ ] Implement `resolveSource`: string item, then named string property, then string `src`, then `''`; do not remove invalid items because indices must remain positional. Implement finite numeric normalization: `maxCount >= 0` and `rowCount >= 1`.
- [ ] Merge config/defaults and derive `visibleUrls`. Chunk fixed rows by `rowCount`; use one native wrapping row when `autoWrap` is true. Derive nonnegative numeric sizes through `getPx`.
- [ ] Track `ratio` and measured container width. For exactly one visible URL call `Image.getSize`; valid positive metadata saves `width / height`; failures use null ratio. Compute `singleWidth`/`singleHeight` using the source long-edge rule or `min(singleSize, containerWidth * 0.6)` square fallback.
- [ ] Render root/row/item test IDs. Pass calculated dimensions, mode, shape, and radius to `UPImage`. Fixed rows remove final right/bottom spacing; wrapped rows retain source spacing. Image presses call `input.onPreview?.({ currentIndex, urls: resolvedUrls })`.
- [ ] Render the final `+N` item only when `showMore` and source URLs exceed `maxCount`; use a nested pressable ID `up-album-more`, absolute `rgba(0,0,0,0.3)` surface, matching radius, centered white text, and identical last-visible-index callback.
- [ ] In an effect, emit `onAlbumWidth`: a one-image width is computed `singleWidth`; otherwise first-row count times `multipleSize` plus inter-item spaces. Never emit during render.
- [ ] Run `npm test -- --runInBand tests/components/UPAlbum.test.tsx`, `npm run typecheck`, and `npm run lint`. If unexpected behavior occurs, use `systematic-debugging` before corrective edits.

### Task 4: Document and Demonstrate Album

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Documents host-owned preview, native metadata timing, and retained no-ops.
- Demonstrates package-root use and real preview callback state.

- [ ] Add P17 plan/status entries to `README.md`, naming `UPAlbum`, grid layouts, `+N`, reactive defaults, and host-owned `onPreview`.
- [ ] Add P17 compatibility documentation with `onPreview={({ urls, currentIndex }) => openPhotoViewer(urls, currentIndex)}`. State that it replaces `uni.previewImage`, the host owns viewer UI, `Image.getSize` and measured square fallback replace source metadata timing, and Vue slots/CSS classes/non-pixel units are unavailable.
- [ ] Insert P17 matrix rows before deferred components: one emulated row for URL/layout/shape/preview/width behavior tied to `tests/components/UPAlbum.test.tsx`; one host-adapter/no-op row for viewer/CSS/metadata tied to `src/components/album/UPAlbum.tsx`.
- [ ] Import `UPAlbum` in the example. Add `lastAlbumPreview` state, render five HTTPS images with `maxCount={4}` and `multipleSize={72}`, update `${currentIndex + 1}/${urls.length}` through `onPreview`, and display the result under `Host preview callback` without implying a built-in viewer.
- [ ] Run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand` in `example`, then run whitespace validation for the four changed docs/example files.

### Task 5: Run Full P17 Quality Gate

**Files:**
- Verify: P17 source, tests, docs, example, spec, and plan.

- [ ] Run full library validation: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.
- [ ] Verify `git diff -- package.json package-lock.json` has no P17 dependency changes; assert `ultra-ui-rn-0.1.0.tgz` does not exist after dry run; inspect `git status --short` without cleaning or committing changes.

## Plan Self-Review

- **Spec coverage:** Covers URL resolution, grid/wrap layout, overflow, ratio/fallback, event payloads, width events, global defaults, exports, docs, example, dependency limits, and all validation gates.
- **Placeholder scan:** Every task contains target paths, fields, test IDs, expected behavior, commands, and acceptance conditions.
- **Type consistency:** `UPAlbumItem`, `UPAlbumPreviewEvent`, `UPAlbumProps`, `onPreview`, `onAlbumWidth`, `album`, `maxCount`, `rowCount`, and all IDs retain identical names across tasks.
