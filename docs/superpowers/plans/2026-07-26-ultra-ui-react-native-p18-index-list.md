# React Native P18 Index List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible `UPIndexList`, `UPIndexItem`, and `UPIndexAnchor` components with accessible index-rail navigation.

**Architecture:** The parent owns a native `ScrollView`, group-position registry, active rail state, and absolute right rail. Items measure and register resolved group keys. Anchors report labels through context and render source header styles. Discrete rail presses select exact source values and scroll only to measured groups.

**Tech Stack:** React 19, React Native `ScrollView`/`Pressable`/`View`, TypeScript 5.9, Jest, React Native Testing Library, `getPx`, `useUPConfig`, and existing config store.

## Global Constraints

- Port only `u-index-list`, `u-index-item`, and `u-index-anchor` from uview-plus 3.8.86.
- Do not add native dependencies, virtualized data, screen-scroll adapters, continuous rail drag, or the source enlarged drag indicator.
- Public exports are `UPIndexList`, `UPIndexItem`, `UPIndexAnchor`, `UPIndexValue`, and three props types.
- Empty source `indexList` renders A–Z; non-empty rails preserve exact primitive/object callback identity.
- Rail controls are accessible discrete buttons; jumps only target registered measurements and always emit selection.
- `customNavHeight` offsets native jumps and active-state calculations.
- `safeBottomFix`, `customClass`, and CSS-only styles remain typed no-ops.
- Exact CSS sticky pinning is not claimed; `sticky` controls only documented opaque elevated anchor state.
- Global `UP.setConfig({ props: { indexList, indexAnchor } })` updates unresolved values; explicit props win.
- Do not commit, push, branch, create worktrees, reset, clean, delete unrelated files, or change intentional dirty state.

## File Structure

- `src/components/index-list/context.ts` holds parent registry and item-anchor contexts.
- `src/components/index-list/UPIndexList.tsx` holds public rail types, source normalization, scroll state, jump, and active selection.
- `src/components/index-list/UPIndexItem.tsx` holds item props, anchor handshake, measurement, and margin.
- `src/components/index-list/UPIndexAnchor.tsx` holds anchor props, source styling, and key reporting.
- `src/components/index-list/index.ts`, `src/components/index.ts` publish values/types.
- `src/config/defaults.ts`, `src/config/store.ts` provide reactive defaults.
- `tests/components/UPIndexList.test.tsx` provides family regression coverage.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx` provide user-facing evidence.

### Task 1: Create Failing Contract Tests

**Files:**
- Create: `tests/components/UPIndexList.test.tsx`

**Interfaces:**
- Consumes planned root `UP`, `UPRoot`, `UPIndexList`, `UPIndexItem`, `UPIndexAnchor`, and `UPIndexValue`.
- Requires IDs `up-index-list`, `up-index-scroll`, `up-index-rail-<index>`, `up-index-item-<key>`, and `up-index-anchor`.

- [ ] Create `renderRoot(node)` using `UPRoot`; create two groups with `UPIndexItem` plus anchors A/B; fire item layout y values before jump assertions.
- [ ] Test default A–Z rail and custom values `['A', { key: 'B', name: 'Beta' }, 3]`; assert primitive/object labels, exact rail count, and source active/inactive colors with explicit overrides.
- [ ] Test anchor default/override text, color, font size, height, background, `sticky={false}`, and React child replacement without duplicate source text.
- [ ] Spy on rendered native `ScrollView.scrollTo`; register A at y100/B at y300; press B with `customNavHeight={20}` and require `{ animated: true, y: 280 }`.
- [ ] Test object `onSelect` identity, missing-group select/highlight with no scroll, scroll events before first/A/B group boundaries, `itemMargin={12}`, and stable no-op `safeBottomFix`/`customClass` rendering.
- [ ] Mount unresolved defaults; set global index list/anchor values; assert mounted updates; rerender explicit values and assert precedence.
- [ ] Run `npm test -- --runInBand tests/components/UPIndexList.test.tsx`; expect missing P18 API/config failure before implementation.

### Task 2: Add Defaults, Contexts, and Exports

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `src/components/index-list/context.ts`
- Create: `src/components/index-list/index.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces `UPIndexListDefaults`, `UPIndexAnchorDefaults`, `UPProps` entries, override paths, and public barrel exports.
- Produces `UPIndexListContextValue` with `activeKey`, `itemMargin`, `sticky`, `registerItem(key, y)`, and `unregisterItem(key)`.
- Produces `UPIndexItemContextValue` with `setAnchorKey(key)`.

- [ ] Add default types for index list fields `inactiveColor`, `activeColor`, `indexList`, `sticky`, `customNavHeight`, `safeBottomFix`, `itemMargin`; add anchor fields `text`, `color`, `size`, `bgColor`, `height`.
- [ ] Add frozen source tables: index list uses `#606266`, `#5677fc`, empty frozen list, true sticky, zero nav height, false safe fix, `0rpx` margin; anchor uses empty text, `#606266`, 14, `#f1f1f1`, 32.
- [ ] Add both defaults to `UPProps`; add typed override entries; add source-state copies; add merge expressions in `setUPConfig` using matching `indexList` and `indexAnchor` property names.
- [ ] Create context hooks using `createContext`/`useContext`; accept null outside parent/item composition.
- [ ] Create barrel exports for three planned component modules and add the family export to `src/components/index.ts`; leave `src/index.ts` unchanged.
- [ ] Run `npm run typecheck`; config declarations must typecheck before Task 3 implementation.

### Task 3: Implement Parent, Item, and Anchor

**Files:**
- Create: `src/components/index-list/UPIndexList.tsx`
- Create: `src/components/index-list/UPIndexItem.tsx`
- Create: `src/components/index-list/UPIndexAnchor.tsx`

**Interfaces:**
- Consumes Task 2 contexts, `useUPConfig`, `getPx`, and native core controls.
- Produces P18 public props/types and Task 1 IDs.

- [ ] In parent, define `UPIndexValue` and `UPIndexListProps`; implement A–Z constant and `valueKey(value)`: primitive String, object key, object name, then empty string; use fallback A–Z only for resolved empty list.
- [ ] Parent uses `ScrollView` ref, `Map<string, number>`, and `activeKey` state; registered positions are stable callbacks; rail press sets active key, calls exact `onSelect`, and invokes `scrollTo` only for an existing key with `Math.max(0, y - getPx(customNavHeight))`.
- [ ] Parent `onScroll` sorts registered items by y and selects the last y no greater than `offset + customNavHeight`; before first/unmatched values set active state null.
- [ ] Render root relative `up-index-list`; render optional header, children, footer in `up-index-scroll`; render absolute right accessible rail `up-index-rail-<index>` with active source background/white text and inactive transparent/source-colored text.
- [ ] Item defines `UPIndexItemProps`; explicit `index` wins over anchor key; item context receives anchor reports; item layout registers key/y; cleanup unregisters it; item margin uses `getPx(parent.itemMargin)` and ID contains resolved key.
- [ ] Anchor defines `UPIndexAnchorProps`; it merges config defaults; resolves primitive or object name label; effect reports label to item; explicit sticky overrides parent; opaque elevated root maps source dimensions/background; children replace default Text; source color/size apply to default Text.
- [ ] Run focused suite, typecheck, and lint. If unexpected behavior appears, invoke `systematic-debugging` before changing source.

### Task 4: Document and Demonstrate P18

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Documents discrete rail controls, source mapping, measured availability, and native limitations.
- Demonstrates parent/item/anchor composition plus selection state.

- [ ] Add P18 plan/status in README naming three components, default/custom rails, measured native jumps, source selection payloads, and accessible buttons.
- [ ] Add compatibility example composing index list, item, and anchor. Document host-owned data/navigation, measurement timing, and sticky/drag/safe-area restrictions.
- [ ] Insert P18 gap-matrix rows before deferred components: one emulated row for rail/item/anchor behavior tied to P18 test; one no-op row for drag/sticky/CSS/safe area tied to P18 parent implementation.
- [ ] Add example selected-index state; render A/B/C custom rail, 240px list height, three groups and city labels, selection callback, and `Selected index: ...` feedback.
- [ ] Build library; run example `npx tsc --noEmit`, lint, and Jest; run whitespace validation on docs/example changes.

### Task 5: Run P18 Quality Gate

**Files:**
- Verify: all P18 source, tests, docs, example, spec, and plan files.

- [ ] Run full validation: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.
- [ ] Verify no P18 dependency diff in `package.json`/`package-lock.json`; assert no `ultra-ui-rn-0.1.0.tgz` after dry run; inspect status without clean/reset/commit.

## Plan Self-Review

- **Spec coverage:** Covers A–Z/custom rails, source identity, group measurement, jumps, scroll active state, anchor visuals, no-op boundaries, global defaults, exports, docs, example, and quality gates.
- **Placeholder scan:** Every task identifies paths, context API, behaviors, source values, IDs, validations, and expected results.
- **Type consistency:** `UPIndexValue`, three prop types, `activeKey`, normalized item keys, `onSelect`, `indexList`, `indexAnchor`, and `customNavHeight` use consistent names through all tasks.
