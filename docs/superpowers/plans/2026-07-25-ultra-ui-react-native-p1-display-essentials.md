# React Native P1 Display Essentials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the first independent uview-plus P1 display, label, divider, and container components to React Native while retaining source API defaults and documenting every compatibility decision.

**Architecture:** Extend the subscribable `UP.props` configuration table with source-default records, then build focused `UP*` components that resolve source units through `getPx`, palette values through `useUPTheme`, and native interactions through React Native `Pressable`. A small shared style helper normalizes source margin/padding shorthands so every component applies compatible 750rpx metrics without duplicating parsing logic.

**Tech Stack:** React 19, React Native 0.86, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly requested this workspace rather than a worktree.
- Do not create a git commit unless the user explicitly requests one.
- Source of truth is `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus` at uview-plus `3.8.86`.
- Public components use PascalCase `UP*` names and preserve source prop names/defaults where React Native permits.
- Source `customClass` and mini-program-only props remain typed deprecated no-ops; every omission is recorded in `docs/gap-matrix.md`.
- `customStyle` is applied after the source-derived native style.
- Source CSS `rpx` values must be converted with `getPx`; plain numbers and `px` values preserve their numeric values.

---

## File Structure

- Modify: `src/config/defaults.ts` — source-default types and immutable default tables for P1 components.
- Modify: `src/config/store.ts` — deep merge P1 default overrides into the subscribable global config.
- Create: `src/components/shared/style.ts` — parse source spacing values into React Native `ViewStyle`/`TextStyle` properties.
- Create: `src/components/text/UPText.tsx` — formatted typography with icons, truncation, links, and press callbacks.
- Create: `src/components/tag/UPTag.tsx` — typed tag with plain, close, icon, and disabled states.
- Create: `src/components/badge/UPBadge.tsx` — badge count formatter and attached/absolute layouts.
- Create: `src/components/gap/UPGap.tsx`, `src/components/line/UPLine.tsx`, `src/components/divider/UPDivider.tsx` — spacing and separator primitives.
- Create: `src/components/title/UPTitle.tsx`, `src/components/view/UPView.tsx`, `src/components/section/UPSection.tsx`, `src/components/box/UPBox.tsx` — source-shaped layout wrappers.
- Modify: `src/components/index.ts`, `src/index.ts` — public exports through the sole package entrypoint.
- Create: `tests/components/UPText.test.tsx`, `tests/components/UPTag.test.tsx`, `tests/components/UPBadge.test.tsx`, `tests/components/UPLayoutPrimitives.test.tsx`, `tests/components/UPContainers.test.tsx` — source-default and callback coverage.
- Modify: `docs/gap-matrix.md` — API-level support, emulation, no-op, and deferred entries.
- Modify: `example/App.tsx` — P1 visual reference states.

## Task 1: Shared Defaults and Source Style Translation

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `src/components/shared/style.ts`
- Test: `tests/components/UPLayoutPrimitives.test.tsx`

**Interfaces:**
- Consumes: `getPx(value: UPDimension): number` from `src/utils/dimensions.ts`.
- Produces: `UPProps` records named `text`, `tag`, `badge`, `gap`, `line`, `divider`, `section`, and `box`; `sourceSpacing(value)` returning a source-compatible React Native spacing style.

- [ ] **Step 1: Write failing source-spacing and default-override tests**

```tsx
it('converts source spacing shorthands and global gap defaults', () => {
  UP.setConfig({ props: { gap: { height: '40rpx' } } });
  const screen = render(<UPRoot><UPGap marginTop="1px 2px" /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-gap').props.style)).toEqual(
    expect.objectContaining({ height: getPx('40rpx'), marginTop: 1 }),
  );
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because `UPGap` and its defaults are absent**

Run: `npm test -- --runInBand tests/components/UPLayoutPrimitives.test.tsx`

Expected: FAIL with an unresolved component/export or missing default-table error.

- [ ] **Step 3: Add immutable source defaults, config merging, and style parser**

```ts
export function sourceSpacing(value: UPDimension | undefined): ViewStyle {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean).map(getPx);
  if (parts.length === 1) return { margin: parts[0] };
  if (parts.length === 2) return { marginHorizontal: parts[1], marginVertical: parts[0] };
  if (parts.length === 3) return { marginTop: parts[0], marginHorizontal: parts[1], marginBottom: parts[2] };
  if (parts.length >= 4) return { marginTop: parts[0], marginRight: parts[1], marginBottom: parts[2], marginLeft: parts[3] };
  return {};
}
```

Add the exact source records from `text.js`, `tag.js`, `badge.js`, `gap.js`, `line.js`, `divider.js`, `section.js`, and `box.js`; update `UPConfigOverrides['props']` and `createSourceState()` so components react to `UP.setConfig()` changes.

- [ ] **Step 4: Run the focused test and type checker**

Run: `npm test -- --runInBand tests/components/UPLayoutPrimitives.test.tsx && npm run typecheck`

Expected: PASS with no TypeScript diagnostics.

## Task 2: Typography, Tags, and Badges

**Files:**
- Create: `src/components/text/UPText.tsx`
- Create: `src/components/text/index.ts`
- Create: `src/components/tag/UPTag.tsx`
- Create: `src/components/tag/index.ts`
- Create: `src/components/badge/UPBadge.tsx`
- Create: `src/components/badge/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPText.test.tsx`
- Test: `tests/components/UPTag.test.tsx`
- Test: `tests/components/UPBadge.test.tsx`

**Interfaces:**
- Consumes: P1 config defaults from Task 1, `UPIcon`, `useUPConfig`, `useUPTheme`, `colorToRgba`, and `sourceSpacing`.
- Produces: `UPText`, `UPTag`, and `UPBadge` exports; callbacks `onClick`, `onClose`, and optional `onLinkPress`.

- [ ] **Step 1: Write failing behavioral tests**

```tsx
it('formats price text, exposes icons, and reports presses', () => {
  const onClick = jest.fn();
  const screen = render(<UPRoot><UPText mode="price" prefixIcon="heart" text="12.50" onClick={onClick} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-text'));
  expect(screen.getByText('￥')).toBeTruthy();
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('reports a close event with the source name', () => {
  const onClose = jest.fn();
  const screen = render(<UPRoot><UPTag closable name="new" text="New" onClose={onClose} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-tag-close'));
  expect(onClose).toHaveBeenCalledWith('new');
});

it('formats overflow, zero visibility, and absolute badge offsets', () => {
  const screen = render(<UPRoot><UPBadge absolute offset={['2px', '3px']} value={1000} /></UPRoot>);
  expect(screen.getByText('999+')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-badge').props.style)).toEqual(
    expect.objectContaining({ position: 'absolute', right: 3, top: 2 }),
  );
});
```

- [ ] **Step 2: Run focused tests and confirm the components do not yet resolve**

Run: `npm test -- --runInBand tests/components/UPText.test.tsx tests/components/UPTag.test.tsx tests/components/UPBadge.test.tsx`

Expected: FAIL because the components are not exported.

- [ ] **Step 3: Implement source behaviors with native equivalents**

```tsx
export function UPBadge(input: UPBadgeProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.badge, ...input };
  const visible = props.show && (props.isDot || props.showZero || Number(props.value) !== 0);
  if (!visible) return null;
  return <Text testID="up-badge" style={[badgeStyle, input.customStyle]}>{props.isDot ? '' : displayBadgeValue(props)}</Text>;
}
```

Implement `UPText` modes `text`, `price`, `phone`, `name`, `date`, and `link`; treat source `call` and `href` through optional `onLinkPress`/React Native `Linking` handling, retaining the mini-program open capability props as typed no-ops. Implement tag sizes `mini`/`medium`/`large`, primary/info/success/warning/error theme colors, plain/`plainFill`, custom colors, icon rendering, and separate press targets for the close button.

- [ ] **Step 4: Run component tests and type checker**

Run: `npm test -- --runInBand tests/components/UPText.test.tsx tests/components/UPTag.test.tsx tests/components/UPBadge.test.tsx && npm run typecheck`

Expected: PASS with callbacks and source metrics asserted.

## Task 3: Gaps, Lines, Dividers, and Base View

**Files:**
- Create: `src/components/gap/UPGap.tsx`
- Create: `src/components/gap/index.ts`
- Create: `src/components/line/UPLine.tsx`
- Create: `src/components/line/index.ts`
- Create: `src/components/divider/UPDivider.tsx`
- Create: `src/components/divider/index.ts`
- Create: `src/components/view/UPView.tsx`
- Create: `src/components/view/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPLayoutPrimitives.test.tsx`

**Interfaces:**
- Consumes: source defaults/config from Task 1, `getPx`, `sourceSpacing`, and React Native `Pressable`/`View`/`Text`.
- Produces: `UPGap`, `UPLine`, `UPDivider`, and `UPView` exports; `UPDivider`/`UPView` support `onClick`.

- [ ] **Step 1: Add failing default-style and interaction tests**

```tsx
it('renders source hairline lines and divider alignment', () => {
  const screen = render(<UPRoot><UPDivider text="More" textPosition="left" /><UPLine direction="col" length="20px" /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-divider-left-line').props.style)).toEqual(
    expect.objectContaining({ width: getPx('80rpx') }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-line-1').props.style)).toEqual(
    expect.objectContaining({ height: 20, transform: [{ scaleX: 0.5 }] }),
  );
});
```

- [ ] **Step 2: Run the primitive test and confirm it fails before implementation**

Run: `npm test -- --runInBand tests/components/UPLayoutPrimitives.test.tsx`

Expected: FAIL because the exports and test IDs are absent.

- [ ] **Step 3: Implement source metric primitives**

```tsx
export function UPLine({ direction = 'row', hairline = true, ...input }: UPLineProps): React.JSX.Element {
  const dimensionStyle = direction === 'row'
    ? { borderBottomWidth: 1, width: input.length, transform: hairline ? [{ scaleY: 0.5 }] : undefined }
    : { borderLeftWidth: 1, height: input.length, transform: hairline ? [{ scaleX: 0.5 }] : undefined };
  return <View testID="up-line" style={[dimensionStyle, input.customStyle]} />;
}
```

Use `borderStyle: 'dashed'` for emulated dashed lines. `UPDivider` composes two `UPLine` instances, uses 15px vertical margin, offsets label text by 15px (12px for the dot), maps source left/right `80rpx` fixed side lines, and makes its wrapper pressable only when `onClick` is supplied. `UPView` maps source style props and renders children.

- [ ] **Step 4: Run primitive tests and type checker**

Run: `npm test -- --runInBand tests/components/UPLayoutPrimitives.test.tsx && npm run typecheck`

Expected: PASS.

## Task 4: Title, Section, and Box Containers

**Files:**
- Create: `src/components/title/UPTitle.tsx`
- Create: `src/components/title/index.ts`
- Create: `src/components/section/UPSection.tsx`
- Create: `src/components/section/index.ts`
- Create: `src/components/box/UPBox.tsx`
- Create: `src/components/box/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPContainers.test.tsx`

**Interfaces:**
- Consumes: `UPIcon`, source defaults/config from Task 1, `getPx`, and `useUPTheme`.
- Produces: `UPTitle`, `UPSection`, and `UPBox` exports; `UPSection` exposes `onClick`, `UPBox` exposes `left`/`rightTop`/`rightBottom` ReactNode overrides.

- [ ] **Step 1: Write failing container tests**

```tsx
it('uses source title prefix dimensions and section defaults', () => {
  const screen = render(<UPRoot><UPTitle>Title</UPTitle><UPSection title="News" /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-title-prefix').props.style)).toEqual(
    expect.objectContaining({ height: 18, marginRight: 10, width: 4 }),
  );
  expect(screen.getByText('更多')).toBeTruthy();
});

it('lays out the three source box panels at the configured height', () => {
  const screen = render(<UPRoot><UPBox /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-box').props.style)).toEqual(
    expect.objectContaining({ height: 160 }),
  );
});
```

- [ ] **Step 2: Run the test and confirm the components are absent**

Run: `npm test -- --runInBand tests/components/UPContainers.test.tsx`

Expected: FAIL because container exports do not exist.

- [ ] **Step 3: Implement the three source-shaped layouts**

```tsx
export function UPTitle({ prefix, children, customStyle }: UPTitleProps): React.JSX.Element {
  return <View testID="up-title" style={[{ alignItems: 'center', flexDirection: 'row' }, customStyle]}>
    {prefix ?? <View testID="up-title-prefix" style={{ backgroundColor: colors.primary, borderRadius: 2, height: 18, marginRight: 10, width: 4 }} />}
    {children}
  </View>;
}
```

`UPSection` uses the exact `section.js` defaults, the fixed `更多` fallback for its translated `subTitle`, and source colors/font sizes; its `arrow` maps to `UPIcon name="arrow-right"`. `UPBox` uses the source three-color layout, 160px default height, 6px radii, 15px gaps, and named ReactNode overrides in place of Vue named slots.

- [ ] **Step 4: Run container tests and type checker**

Run: `npm test -- --runInBand tests/components/UPContainers.test.tsx && npm run typecheck`

Expected: PASS.

## Task 5: Compatibility Evidence and Manual Reference Screen

**Files:**
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`
- Modify: `README.md`
- Test: all P1 component test files

**Interfaces:**
- Consumes: public components from Tasks 2–4.
- Produces: complete P1-essentials compatibility records and a manually inspectable sample screen.

- [ ] **Step 1: Extend the example with each new source reference state**

```tsx
<UPText mode="price" prefixIcon="rmb" text="199.00" type="error" />
<UPTag closable plain plainFill text="New" type="primary" />
<UPBadge absolute value={12}><UPIcon name="bell" /></UPBadge>
<UPDivider text="More" />
<UPSection title="Recommended" />
<UPBox />
```

- [ ] **Step 2: Record every P1-essentials source API status**

Add rows for all source props/events in `u-text`, `u-tag`, `u-badge`, `u-gap`, `u-line`, `u-divider`, `u-title`, `u-section`, `u-view`, and `u-box`, including retained mini-program APIs, CSS dashed-line emulation, text link/phone adapter behavior, and named-slot-to-ReactNode substitutions.

- [ ] **Step 3: Run the complete package validation**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all tests and static checks pass; package dry run includes source, generated artifacts, font asset, README, and license only.

- [ ] **Step 4: Run example static validation**

Run: `npm run typecheck --prefix example && npm run lint --prefix example && npm test --prefix example -- --runInBand`

Expected: all example checks pass.
