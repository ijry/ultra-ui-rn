# React Native P1 Content and Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the approved P1 display-and-layout phase by porting uview-plus cells, media, cards, empty/skeleton states, and grid primitives with source-compatible defaults and React Native API mappings.

**Architecture:** Extend the existing subscribable `UP.props` table with exact source defaults, then build three focused groups: media/content components that use React Native image lifecycle callbacks, cell/card containers with named `ReactNode` replacements for Vue slots, and layout primitives coordinated through React context. Components resolve `px`/`rpx` values with `getPx`, apply `customStyle` last, and document every unavailable uni-app behavior.

**Tech Stack:** React 19, React Native 0.86, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly authorized this workspace.
- Do not create a git commit unless explicitly asked.
- Source of truth is `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus` at uview-plus `3.8.86`.
- Public components use the `UP*` prefix and preserve source props/defaults wherever React Native allows.
- Retain unavailable mini-program props as typed deprecated no-ops and document each in `docs/gap-matrix.md`.
- `customStyle` is the final native style layer.
- Source `rpx` values use `getPx`; numeric and `px` values retain their source metric.

---

## File Structure

- Modify: `src/config/defaults.ts`, `src/config/store.ts` — default types and config merging for `cell`, `cellGroup`, `image`, `avatar`, `card`, `empty`, `skeleton`, `row`, `col`, `grid`, and `gridItem`.
- Create: `src/components/cell/*`, `src/components/image/*`, `src/components/avatar/*`, `src/components/card/*`, `src/components/empty/*`, `src/components/skeleton/*` — content and media components.
- Create: `src/components/row/*`, `src/components/col/*`, `src/components/grid/*` — source-shaped layout and inherited grid context.
- Modify: `src/components/index.ts` — public package exports.
- Create: `tests/components/UPContentMedia.test.tsx`, `tests/components/UPCellCard.test.tsx`, `tests/components/UPLayoutGrid.test.tsx` — source defaults, callback, context, and display-state tests.
- Modify: `docs/gap-matrix.md`, `docs/compatibility.md`, `README.md`, `example/App.tsx` — compatibility evidence and reference states.

## Task 1: Defaults, Config Store, and Layout Context

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `src/components/layout-context.ts`
- Test: `tests/components/UPLayoutGrid.test.tsx`

**Interfaces:**
- Consumes: `UPDimension`, `getPx`, and the existing subscribable configuration store.
- Produces: P1 default records and `UPRowContext`/`UPGridContext` values containing `gutter`, `col`, `border`, and child index metadata.

- [ ] **Step 1: Write failing global-default tests**

```tsx
it('uses a global grid column default for grid item width', () => {
  act(() => UP.setConfig({ props: { grid: { col: 4 } } }));
  const screen = render(<UPRoot><UPGrid><UPGridItem><Text>A</Text></UPGridItem></UPGrid></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-grid-item-0').props.style)).toEqual(
    expect.objectContaining({ flexBasis: '25%', maxWidth: '25%' }),
  );
});
```

- [ ] **Step 2: Run focused test and confirm it fails before exports/defaults exist**

Run: `npm test -- --runInBand tests/components/UPLayoutGrid.test.tsx`

Expected: FAIL because the component exports/default records are missing.

- [ ] **Step 3: Add exact source defaults and configuration merging**

Copy source values from `cell.js`, `cellGroup.js`, `image.js`, `avatar.js`, `card.js`, `empty.js`, `skeleton.js`, `row.js`, `col.js`, `grid.js`, and `gridItem.js`. Ensure `setUPConfig({ props: { ... } })` deep-merges each component record and triggers mounted component updates.

- [ ] **Step 4: Run focused test and typecheck**

Run: `npm test -- --runInBand tests/components/UPLayoutGrid.test.tsx && npm run typecheck`

Expected: PASS without TypeScript diagnostics.

## Task 2: Media, Avatar, Empty, and Skeleton

**Files:**
- Create: `src/components/image/UPImage.tsx`, `src/components/image/index.ts`
- Create: `src/components/avatar/UPAvatar.tsx`, `src/components/avatar/index.ts`
- Create: `src/components/empty/UPEmpty.tsx`, `src/components/empty/index.ts`
- Create: `src/components/skeleton/UPSkeleton.tsx`, `src/components/skeleton/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPContentMedia.test.tsx`

**Interfaces:**
- Consumes: Task 1 defaults, `UPIcon`, `getPx`, source-compatible mode mapping, React Native image `onLoad`/`onError` callbacks.
- Produces: `UPImage`, `UPAvatar`, `UPEmpty`, `UPSkeleton` exports and `onClick`, `onLoad`, `onError` callback mappings.

- [ ] **Step 1: Write failing media state tests**

```tsx
it('shows source loading/error image fallbacks and emits lifecycle callbacks', () => {
  const onError = jest.fn();
  const screen = render(<UPRoot><UPImage src="https://example.invalid/a.png" onError={onError} /></UPRoot>);
  fireEvent(screen.getByTestId('up-image-native'), 'error', { nativeEvent: { error: 'failed' } });
  expect(screen.getByTestId('up-image-error')).toBeTruthy();
  expect(onError).toHaveBeenCalledTimes(1);
});

it('renders avatar text, source empty defaults, and skeleton rows', () => {
  const screen = render(<UPRoot><UPAvatar text="UP" /><UPEmpty text="None" /><UPSkeleton avatar rows={2} /></UPRoot>);
  expect(screen.getByText('UP')).toBeTruthy();
  expect(screen.getByText('None')).toBeTruthy();
  expect(screen.getAllByTestId('up-skeleton-row')).toHaveLength(2);
});
```

- [ ] **Step 2: Run test and confirm it fails before implementations exist**

Run: `npm test -- --runInBand tests/components/UPContentMedia.test.tsx`

Expected: FAIL because media exports are missing.

- [ ] **Step 3: Implement source-shaped native media and placeholders**

`UPImage` maps uni modes to React Native resize modes, layers a source-colored loading state, supports loading/error ReactNode overrides, and represents fade with native opacity/transition behavior. `UPAvatar` applies source circle/square metrics and prefers `src`, then `icon`, then `text`; `mpAvatar` is retained no-op. `UPEmpty` maps named icon/description slots to `icon`/`children` props and uses documented icon fallbacks. `UPSkeleton` renders source title/avatar/rows while `loading`; `animate` is retained as an emulated static native base state pending Reanimated shimmer integration.

- [ ] **Step 4: Run focused media tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPContentMedia.test.tsx && npm run typecheck`

Expected: PASS.

## Task 3: Cells and Cards

**Files:**
- Create: `src/components/cell/UPCell.tsx`, `src/components/cell/UPCellGroup.tsx`, `src/components/cell/index.ts`
- Create: `src/components/card/UPCard.tsx`, `src/components/card/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPCellCard.test.tsx`

**Interfaces:**
- Consumes: Task 1 defaults, `UPIcon`, `UPImage`, theme colors, and source spacing helper.
- Produces: `UPCell`, `UPCellGroup`, `UPCard` exports; callbacks `onClick` returning a source-shaped `{ name }` cell payload and card section node props.

- [ ] **Step 1: Write failing cell/card tests**

```tsx
it('uses source cell metrics, required state, arrow, border, and click payload', () => {
  const onClick = jest.fn();
  const screen = render(<UPRoot><UPCell isLink label="Detail" name="profile" required title="Profile" value="Set" onClick={onClick} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-cell'));
  expect(onClick).toHaveBeenCalledWith({ name: 'profile' });
  expect(screen.getByTestId('up-cell-border')).toBeTruthy();
});

it('renders source card header/body/footer and named ReactNode overrides', () => {
  const screen = render(<UPRoot><UPCard title="Title" foot={<Text>Footer</Text>}>Body</UPCard></UPRoot>);
  expect(screen.getByText('Title')).toBeTruthy();
  expect(screen.getByText('Body')).toBeTruthy();
  expect(screen.getByText('Footer')).toBeTruthy();
});
```

- [ ] **Step 2: Run test and confirm components fail to resolve**

Run: `npm test -- --runInBand tests/components/UPCellCard.test.tsx`

Expected: FAIL because cell/card exports are missing.

- [ ] **Step 3: Implement source layouts and event mapping**

`UPCell` uses 13×15 source padding, title/label/value typography, required marker, optional left/right ReactNode overrides, icon/image support, source arrow direction, disabled appearance, and a source-compatible click payload. `url`, `linkType`, and `stop` remain retained no-ops because navigation and propagation are app-owned in React Native. `UPCellGroup` provides source title padding and wrapper borders. `UPCard` uses source margins/radius/padding/border sections and replaces head/body/foot Vue slots with `head`, `children`, and `foot` ReactNode props.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPCellCard.test.tsx && npm run typecheck`

Expected: PASS.

## Task 4: Row, Col, Grid, and Grid Item

**Files:**
- Create: `src/components/row/UPRow.tsx`, `src/components/row/index.ts`
- Create: `src/components/col/UPCol.tsx`, `src/components/col/index.ts`
- Create: `src/components/grid/UPGrid.tsx`, `src/components/grid/UPGridItem.tsx`, `src/components/grid/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPLayoutGrid.test.tsx`

**Interfaces:**
- Consumes: Task 1 context/defaults and React child cloning.
- Produces: `UPRow`, `UPCol`, `UPGrid`, `UPGridItem` exports; `onClick` on row/col and `UPGrid`/`UPGridItem` callbacks with source item name/index.

- [ ] **Step 1: Add failing layout context tests**

```tsx
it('applies source row gutters and twelve-column spans', () => {
  const screen = render(<UPRoot><UPRow gutter="20px"><UPCol span={6} offset={3}><Text>Half</Text></UPCol></UPRow></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-row').props.style)).toEqual(expect.objectContaining({ marginHorizontal: -10 }));
  expect(StyleSheet.flatten(screen.getByTestId('up-col').props.style)).toEqual(expect.objectContaining({ flexBasis: '50%', marginLeft: '25%', paddingHorizontal: 10 }));
});

it('applies source grid border positions and forwards the item name', () => {
  const onClick = jest.fn();
  const screen = render(<UPRoot><UPGrid border col={2} onClick={onClick}><UPGridItem name="a" /><UPGridItem name="b" /><UPGridItem name="c" /></UPGrid></UPRoot>);
  fireEvent.press(screen.getByTestId('up-grid-item-2'));
  expect(onClick).toHaveBeenCalledWith('c');
  expect(StyleSheet.flatten(screen.getByTestId('up-grid-item-0').props.style)).toEqual(expect.objectContaining({ borderBottomWidth: 0.5, borderRightWidth: 0.5 }));
});
```

- [ ] **Step 2: Run test and confirm context-dependent components are absent**

Run: `npm test -- --runInBand tests/components/UPLayoutGrid.test.tsx`

Expected: FAIL because layout exports are missing.

- [ ] **Step 3: Implement row/column and grid context layouts**

`UPRow` provides source gutter and alignment through context. `UPCol` renders a 12-column percentage width with source offset, gutters, alignment and press callback. `UPGrid` clones grid item children with their position/count, and `UPGridItem` derives source 0.5px right/bottom borders from context and emits explicit `name` or its index to itself and the parent grid.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPLayoutGrid.test.tsx && npm run typecheck`

Expected: PASS.

## Task 5: Documentation, Showcase, and Full Validation

**Files:**
- Modify: `docs/gap-matrix.md`
- Modify: `docs/compatibility.md`
- Modify: `README.md`
- Modify: `example/App.tsx`
- Test: all P1 tests

**Interfaces:**
- Consumes: public exports from Tasks 2–4.
- Produces: complete P1 compatibility evidence and example reference states.

- [ ] **Step 1: Add media/content/layout reference states to the example**

```tsx
<UPCellGroup title="Profile"><UPCell isLink label="Account" title="Settings" value="Configured" /></UPCellGroup>
<UPCard foot={<UPText text="Footer" />} title="Card title"><UPText text="Card body" /></UPCard>
<UPRow gutter="20px"><UPCol span={6}><UPAvatar text="UP" /></UPCol></UPRow>
<UPGrid border col={3}><UPGridItem name="one"><UPText text="One" /></UPGridItem></UPGrid>
```

- [ ] **Step 2: Add API-level matrix rows**

Record every source prop/event/slot for the 11 components, including source resize modes, image fade and long-press behavior, avatar mini-program props, card CSS shadow emulation, native skeleton animation difference, cell navigation props, and grid border/index behavior.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all library tests/static checks pass; package dry run includes the source and generated artifacts only.

- [ ] **Step 4: Run example validation**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Working directory: `example`

Expected: typecheck, lint, and App test pass.
