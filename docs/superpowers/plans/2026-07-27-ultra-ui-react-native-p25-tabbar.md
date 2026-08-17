# P25 Tabbar Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPTabbar` and `UPTabbarItem` with source-compatible selection APIs, parent-relative fixed layout, safe area support, visual variants, tests, example, and compatibility documentation.

**Architecture:** `UPTabbar` resolves controlled or internal selection state, then provides inherited parent values through React context. `UPTabbarItem` consumes that context for active state, press handling, icons, badges, and native visual mappings. Navigation stays application-owned.

**Tech Stack:** React 19, React Native 0.86, TypeScript, `@testing-library/react-native`, `react-native-safe-area-context`, `UPIcon`, `UPBadge`, and `UPSafeBottom`.

## Global Constraints

- Work directly in the existing `main` workspace; do not create branches or worktrees.
- Do not add dependencies, stage files, commit, push, reset, or clean.
- Apply every modification through `apply_patch`; preserve unrelated existing work.
- Keep routing application-owned and do not introduce a navigation-library dependency.
- Map source `fixed` to parent-relative native absolute layout rather than viewport CSS fixed.
- Retain CSS classes, CSS string shadows, and CSS string style props as typed no-ops where React Native cannot express them.

## File Structure

- Create `src/components/tabbar/context.ts` for selection names and inherited visual state.
- Create `src/components/tabbar/UPTabbar.tsx` for selection control, fixed layout, safe area, and placeholder.
- Create `src/components/tabbar/UPTabbarItem.tsx` for icons, badges, React node slots, and visual variants.
- Create `src/components/tabbar/index.ts` for public exports.
- Create `tests/components/UPTabbar.test.tsx` for selection, layout, and visual tests.
- Modify `src/config/defaults.ts`, `src/config/store.ts`, and `src/components/index.ts` for configuration and exports.
- Modify `example/App.tsx`, `docs/compatibility.md`, and `docs/gap-matrix.md` for integration and compatibility records.

---

### Task 1: Define Defaults and Failing Public API Tests

**Files:**
- Create: `tests/components/UPTabbar.test.tsx`
- Create: `src/components/tabbar/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces configuration keys `UP.props.tabbar` and `UP.props.tabbarItem`.
- Reserves public exports `UPTabbar`, `UPTabbarItem`, `UPTabbarName`, and `UPTabbarItemProps` for Tasks 2 and 3.
- Establishes test IDs `up-tabbar`, `up-tabbar-content`, `up-tabbar-placeholder`, `up-tabbar-item-<index>`, `up-tabbar-icon-<index>`, `up-tabbar-text-<index>`, `up-tabbar-badge-<index>`, `up-tabbar-indicator-<index>`, and `up-tabbar-mid-button-<index>`.

- [ ] **Step 1: Write a failing controlled event-order test**

Create `tests/components/UPTabbar.test.tsx`:

```tsx
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPTabbar, UPTabbarItem } from '../../src';

it('emits change before click for a non-active controlled item', () => {
  const events: string[] = [];
  const screen = render(
    <UPTabbar
      onChange={(name) => events.push(`change:${String(name)}`)}
      onClick={(name) => events.push(`click:${String(name)}`)}
      value="home"
    >
      <UPTabbarItem icon="home" name="home" text="Home" />
      <UPTabbarItem icon="star" name="favorites" text="Favorites" />
    </UPTabbar>,
  );

  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));
  expect(events).toEqual(['change:favorites', 'click:favorites']);
});
```

- [ ] **Step 2: Run the test to verify the public API is absent**

Run: `npm test -- --runInBand tests/components/UPTabbar.test.tsx`

Expected: Jest/TypeScript reports missing `UPTabbar` and `UPTabbarItem` exports.

- [ ] **Step 3: Add exact source configuration types and values**

Add these types near the other component defaults in `src/config/defaults.ts`:

```ts
export type UPTabbarDefaults = {
  value: string | number | null;
  safeAreaInsetBottom: boolean;
  border: boolean;
  borderColor: string;
  zIndex: number;
  activeColor: string;
  inactiveColor: string;
  fixed: boolean;
  placeholder: boolean;
  backgroundColor: string;
  styleType: string;
  animationType: string;
  activeBackgroundColor: string;
  inactiveBackgroundColor: string;
  itemShape: string;
  iconScale: number;
  textMode: string;
};

export type UPTabbarItemDefaults = {
  name: string | number | null;
  icon: string;
  activeIcon: string;
  inactiveIcon: string;
  badge: string | number | null;
  dot: boolean;
  text: string;
  badgeStyle: string;
  mode: string;
  activeClass: string;
  inactiveClass: string;
  midButtonBgColor: string;
  midButtonIconColor: string;
  midButtonIconSize: number;
  midButtonBoxShadow: string;
  midButtonInnerBoxShadow: string;
  midButtonOffsetY: number;
};
```

Add `tabbar` and `tabbarItem` to `UPProps`, then add these source defaults:

```ts
tabbar: Object.freeze({
  value: null, safeAreaInsetBottom: true, border: true, borderColor: '', zIndex: 1,
  activeColor: '#1989fa', inactiveColor: '#7d7e80', fixed: true, placeholder: true,
  backgroundColor: '', styleType: 'default', animationType: 'none',
  activeBackgroundColor: '', inactiveBackgroundColor: '', itemShape: 'default',
  iconScale: 1.1, textMode: 'always',
}),
tabbarItem: Object.freeze({
  name: null, icon: '', activeIcon: '', inactiveIcon: '', badge: null, dot: false,
  text: '', badgeStyle: 'top: 6px;right:2px;', mode: '', activeClass: '',
  inactiveClass: '', midButtonBgColor: '', midButtonIconColor: '',
  midButtonIconSize: 26, midButtonBoxShadow: '', midButtonInnerBoxShadow: '',
  midButtonOffsetY: -10,
}),
```

- [ ] **Step 4: Wire configuration state and component exports**

In `src/config/store.ts`, add `tabbar?: Partial<UPProps['tabbar']>` and `tabbarItem?: Partial<UPProps['tabbarItem']>` to `UPConfigOverrides['props']`; clone both source defaults in `createSourceState()`; and merge both override keys in `setUPConfig()`.

Create `src/components/tabbar/index.ts`:

```ts
export * from './UPTabbar';
export * from './UPTabbarItem';
export * from './context';
```

Add `export * from './tabbar';` to `src/components/index.ts`. Do not create fake components or untyped stubs.

- [ ] **Step 5: Verify planned paths are the only unresolved imports**

Run: `npm run typecheck`

Expected: it fails only because the planned tabbar modules are not created yet.

### Task 2: Implement Parent Selection, Context, Fixed Layout, and Placeholder

**Files:**
- Create: `src/components/tabbar/context.ts`
- Create: `src/components/tabbar/UPTabbar.tsx`
- Modify: `tests/components/UPTabbar.test.tsx`

**Interfaces:**

```ts
export type UPTabbarName = string | number;
export type UPTabbarStyleType = 'default' | 'minimal' | 'underline' | 'dot' | 'pill' | 'card' | 'glow' | 'lift' | 'convex' | string;
export type UPTabbarAnimationType = 'none' | 'scale' | 'lift' | 'swing' | 'pulse' | string;

export type UPTabbarContextValue = {
  value: UPTabbarName | null;
  activeColor: string;
  inactiveColor: string;
  styleType: UPTabbarStyleType;
  animationType: UPTabbarAnimationType;
  activeBackgroundColor: string;
  inactiveBackgroundColor: string;
  itemShape: string;
  iconScale: number;
  textMode: string;
  select: (name: UPTabbarName) => void;
};
```

- Selection resolves `input.value`, `input.modelValue`, `input.defaultValue`, then configured `props.value`.

- [ ] **Step 1: Add parent selection and layout tests**

Append to `tests/components/UPTabbar.test.tsx`, importing `StyleSheet` from `react-native`:

```tsx
it('keeps controlled values unchanged and only emits click for active items', () => {
  const events: string[] = [];
  const screen = render(
    <UPTabbar
      onChange={(name) => events.push(`change:${String(name)}`)}
      onClick={(name) => events.push(`click:${String(name)}`)}
      value="home"
    >
      <UPTabbarItem name="home" text="Home" />
      <UPTabbarItem name="favorites" text="Favorites" />
    </UPTabbar>,
  );

  fireEvent.press(screen.getByTestId('up-tabbar-item-0'));
  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));
  expect(events).toEqual(['click:home', 'change:favorites', 'click:favorites']);
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-content').props.style)).toEqual(
    expect.objectContaining({ bottom: 0, left: 0, position: 'absolute', right: 0 }),
  );
  expect(screen.getByTestId('up-tabbar-placeholder')).toBeTruthy();
});

it('updates an uncontrolled value and uses child index when name is absent', () => {
  const screen = render(
    <UPTabbar defaultValue={0} fixed={false}>
      <UPTabbarItem text="Home" />
      <UPTabbarItem text="Favorites" />
    </UPTabbar>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-0').props.style)).toEqual(
    expect.objectContaining({ color: '#1989fa' }),
  );
  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-1').props.style)).toEqual(
    expect.objectContaining({ color: '#1989fa' }),
  );
  expect(screen.queryByTestId('up-tabbar-placeholder')).toBeNull();
});
```

- [ ] **Step 2: Run the parent test and verify failure**

Run: `npm test -- --runInBand tests/components/UPTabbar.test.tsx -t "keeps controlled values"`

Expected: FAIL because tabbar context and parent state do not exist.

- [ ] **Step 3: Implement the context module**

Create `src/components/tabbar/context.ts` with the exact types above, a null context, and:

```ts
export const UPTabbarContext = createContext<UPTabbarContextValue | null>(null);

export function useUPTabbarContext(): UPTabbarContextValue | null {
  return useContext(UPTabbarContext);
}
```

- [ ] **Step 4: Implement `UPTabbar` parent behavior**

Create `src/components/tabbar/UPTabbar.tsx` with these requirements:

1. Merge `useUPConfig().props.tabbar` before explicit input; preserve `0` by checking `input.value !== undefined` before `input.modelValue`.
2. Keep internal selection seeded from `defaultValue ?? props.value`, synchronize only when a controlled alias exists, and derive the context value using the declared precedence.
3. Provide a stable `select(name)`: for a different value update only uncontrolled state and call `input.onChange(name)`; always call `input.onClick(name)` after that branch.
4. Clone valid direct children with `itemIndex`, then render inside `UPTabbarContext.Provider`.
5. Render `up-tabbar-content` with a 50 px item row and `UPSafeBottom` only if `safeAreaInsetBottom`. Add fixed `{ position: 'absolute', bottom: 0, left: 0, right: 0 }` styles only when `fixed`.
6. Store `onLayout` height. Render `up-tabbar-placeholder` only when `fixed && placeholder`, seeded at 50 px and updated with the measured content height.
7. Map `border`, `borderColor`, `backgroundColor`, `zIndex`, `styleType`, `itemShape`, and `customStyle` to native styles. Fall back to `#ffffff` background and `#dadbde` border; map pill/glow/card/convex to native padding and radius.

- [ ] **Step 5: Re-run parent test after parent implementation**

Run: `npm test -- --runInBand tests/components/UPTabbar.test.tsx -t "keeps controlled values"`

Expected: it remains red until Task 3 creates `UPTabbarItem`; do not substitute parent-only item markup.

### Task 3: Implement Item Icons, Badges, Slots, Visual Variants, and Mid Button

**Files:**
- Create: `src/components/tabbar/UPTabbarItem.tsx`
- Modify: `src/components/tabbar/UPTabbar.tsx`
- Modify: `tests/components/UPTabbar.test.tsx`

**Interfaces:**
- Consumes `useUPTabbarContext`, `UPIcon`, `UPBadge`, `getPx`, and `UPDimension`.
- Produces:

```ts
export type UPTabbarItemProps = {
  name?: UPTabbarName | null;
  icon?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  badge?: string | number | null;
  dot?: boolean;
  text?: string;
  badgeStyle?: StyleProp<ViewStyle> | string;
  mode?: 'midButton' | string;
  activeClass?: string;
  inactiveClass?: string;
  midButtonBgColor?: string;
  midButtonIconColor?: string;
  midButtonIconSize?: UPDimension;
  midButtonBoxShadow?: string;
  midButtonInnerBoxShadow?: string;
  midButtonOffsetY?: UPDimension;
  activeIconNode?: React.ReactNode;
  inactiveIconNode?: React.ReactNode;
  textNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  itemIndex?: number;
};
```

- Missing `name` falls back to `itemIndex`; `name={0}` remains numeric zero.
- `dot` takes precedence over badge text; a badge is visible for dot, non-empty string, or non-zero number.

- [ ] **Step 1: Add item visual tests**

Append these tests, importing `Text`, `View`, and `StyleSheet` from `react-native`:

```tsx
it('resolves icon nodes, badge precedence, and text nodes', () => {
  const screen = render(
    <UPTabbar fixed={false} value="active">
      <UPTabbarItem
        activeIconNode={<Text>Active node</Text>}
        badge={12}
        dot
        inactiveIconNode={<Text>Inactive node</Text>}
        name="active"
        text="Home"
        textNode={<Text>Custom text</Text>}
      />
      <UPTabbarItem inactiveIconNode={<Text>Other inactive</Text>} name="other" text="Other" />
    </UPTabbar>,
  );

  expect(screen.getByText('Active node')).toBeTruthy();
  expect(screen.getByText('Custom text')).toBeTruthy();
  expect(screen.getByTestId('up-tabbar-badge-0')).toBeTruthy();
  expect(screen.queryByText('12')).toBeNull();
  expect(screen.getByText('Other inactive')).toBeTruthy();
});

it('maps indicators, text mode, transforms, and mid button treatment', () => {
  const screen = render(
    <UPTabbar
      activeBackgroundColor="#dbeafe"
      animationType="lift"
      fixed={false}
      itemShape="round"
      styleType="underline"
      textMode="active"
      value="home"
    >
      <UPTabbarItem icon="home" name="home" text="Home" />
      <UPTabbarItem icon="star" name="favorites" text="Favorites" />
      <UPTabbarItem icon="plus" mode="midButton" name="create" text="Create" />
    </UPTabbar>,
  );

  expect(screen.getByTestId('up-tabbar-indicator-0')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-icon-0').props.style)).toEqual(
    expect.objectContaining({ transform: expect.any(Array) }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-1').props.style)).toEqual(
    expect.objectContaining({ opacity: 0.68 }),
  );
  expect(screen.getByTestId('up-tabbar-mid-button-2')).toBeTruthy();
});
```

- [ ] **Step 2: Run a visual test and verify failure**

Run: `npm test -- --runInBand tests/components/UPTabbar.test.tsx -t "resolves icon nodes"`

Expected: FAIL because `UPTabbarItem` has not consumed context or rendered native item content.

- [ ] **Step 3: Implement `UPTabbarItem` native mapping**

Create `src/components/tabbar/UPTabbarItem.tsx` with these rules:

1. Merge `useUPConfig().props.tabbarItem` before explicit input. Resolve name with `input.name === null || input.name === undefined || input.name === '' ? input.itemIndex ?? 0 : input.name`.
2. Without parent context, return a plain `View` containing supplied icon/text nodes and emit no selection callbacks. With context, calculate active state using source loose equality between context value and resolved name.
3. Resolve icon in order: active/inactive React node, matching active/inactive icon property, common `icon`. Render inside `up-tabbar-icon-<index>` and use parent colors unless `mode="midButton"`, which uses `midButtonIconColor || '#3c9cff'`.
4. Wrap `UPBadge` in `up-tabbar-badge-<index>` when visible. Pass `isDot={dot}`, `value={dot ? 1 : badge}`, `show`, `absolute`, and only object `badgeStyle`; ignore string badge styles.
5. Render `textNode` before fallback text. Fallback text uses `up-tabbar-text-<index>`, active/inactive color, and inactive `textMode="active"` opacity `0.68` plus scale `0.94`.
6. Draw an active 17 px bottom bar for `underline` or 5 px bottom dot for `dot`, with active color and `up-tabbar-indicator-<index>`.
7. Map item background colors, `pill`, `card`, `glow`, `lift`, `convex`, and item shape to native background/radius/transform styling. Glow falls back to `rgba(125, 211, 252, 0.12)` when active background is absent.
8. Map active animation types: scale by `iconScale`; lift with upward translation plus scale; swing with `-10deg` rotation plus scale; pulse as static scale. Do not create an animation loop.
9. For a mid button, render `up-tabbar-mid-button-<index>` as a 64 px circle with nested 52 px `midButtonBgColor || '#ffffff'` circle, offset through `getPx(midButtonOffsetY)`. Do not parse string shadow props.
10. Use `Pressable` with `testID={\`up-tabbar-item-${itemIndex}\`}`, `accessibilityRole="tab"`, `accessibilityState={{ selected: active }}`, and `onPress={() => context.select(name)}`. Keep class props, string shadows, string badge style, and `customClass` typed but unused.

- [ ] **Step 4: Complete parent indexing and safe-area placement**

In `UPTabbar.tsx`, inject `itemIndex` into valid children and place `UPSafeBottom` after the item row only when `safeAreaInsetBottom` is true. Retain `up-tabbar-content` and `up-tabbar-placeholder` test IDs.

- [ ] **Step 5: Add default override and measured placeholder test**

Append this test, importing `act` and `UP`:

```tsx
it('reacts to configured defaults while explicit values take precedence', () => {
  const screen = render(
    <UPTabbar activeColor="#00aa00"><UPTabbarItem name="home" text="Home" /></UPTabbar>,
  );
  act(() => {
    UP.setConfig({ props: { tabbar: { border: false, activeColor: '#ff0000' } } });
  });

  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-0').props.style)).toEqual(
    expect.objectContaining({ color: '#00aa00' }),
  );
  fireEvent(screen.getByTestId('up-tabbar-content'), 'layout', {
    nativeEvent: { layout: { height: 76, width: 320, x: 0, y: 0 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-placeholder').props.style)).toEqual(
    expect.objectContaining({ height: 76 }),
  );
});
```

Run: `npm test -- --runInBand tests/components/UPTabbar.test.tsx`

Expected: PASS. Cover controlled/uncontrolled values, index fallback, callback ordering, repeated active press, fixed/placeholder/safe area, badge/dot precedence, slots, mid button, indicators, text mode, transforms, defaults, and explicit props.

### Task 4: Add Example, Compatibility Documentation, and Full Validation

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes public `UPTabbar` and `UPTabbarItem` exports from Tasks 2 and 3.
- Produces application-owned navigation guidance and the P25 compatibility record.

- [ ] **Step 1: Add a controlled tabbar example**

In `example/App.tsx`, import `UPTabbar` and `UPTabbarItem`; add `const [activeTab, setActiveTab] = useState<string | number>('home');` near other controlled state; then add this after `UPScrollHost` and before existing `UPSafeBottom`:

```tsx
<UPTabbar fixed={false} onChange={setActiveTab} value={activeTab}>
  <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="Home" />
  <UPTabbarItem badge={2} icon="star" name="favorites" text="Favorites" />
  <UPTabbarItem icon="plus" mode="midButton" name="create" text="Create" />
</UPTabbar>
<Text>Active tab: {activeTab}</Text>
```

- [ ] **Step 2: Document P25 API mapping and limits**

Append `## P25 tabbar family` to `docs/compatibility.md`. State that `UPTabbar` uses controlled `value` / `modelValue` or `defaultValue`, does not navigate, emits `onChange` then `onClick` for a non-active press, and emits only `onClick` for active press. State that items retain index fallback, icon/text React node replacement, badge/dot behavior, and native mid-button mapping. State parent-relative fixed behavior, measured placeholder, `UPSafeBottom`, and unavailable CSS class/keyframe/touch prevention/shadow-string/CSS badge style mappings.

Include:

```tsx
const [tab, setTab] = useState('home');

<UPTabbar onChange={setTab} value={tab}>
  <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="Home" />
  <UPTabbarItem icon="star" name="favorites" text="Favorites" />
</UPTabbar>
```

- [ ] **Step 3: Add P25 gap-matrix rows**

Insert before `## Deferred Source Components` in `docs/gap-matrix.md`:

```md
## P25 Tabbar Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-tabbar` | value, safe area, border, fixed/placeholder, colors, styles, change/click | `UPTabbar`, `value` / `modelValue` / `defaultValue`, callbacks | Parent-managed selection with parent-relative absolute fixed layout and measured placeholder | Emulated | `tests/components/UPTabbar.test.tsx` |
| `u-tabbar-item` | name, icons, badge/dot, text, slots, mid button | `UPTabbarItem`, React nodes, native badge/mid button | Source name-index fallback, icon/text replacement, and badge precedence are retained | Emulated | `tests/components/UPTabbar.test.tsx` |
| tabbar family | routing, CSS classes/keyframes, viewport fixed, shadow strings, touch prevention | Application callbacks, React context, native layout/transforms | Applications own navigation; parent-relative fixed and static native transforms replace CSS behavior | No-op retained | `src/components/tabbar/UPTabbar.tsx` |
```

- [ ] **Step 4: Run validation from narrow to broad**

Run, in this order: `npm test -- --runInBand tests/components/UPTabbar.test.tsx`; `npm run typecheck`; `npm run lint`; `npm test -- --runInBand`; `npm run build`; from `example`, run `npx tsc --noEmit` and `npx eslint App.tsx`; then run `npm pack --dry-run` and `git diff --check` at the repository root.

Expected: every command exits `0`; package inspection does not create `ultra-ui-rn-0.1.0.tgz`.

- [ ] **Step 5: Inspect final state without changing unrelated work**

Run `git status --short` and `git diff --check`.

Expected: P25 component, configuration, test, documentation, and example files are present. Existing unrelated work remains untouched; do not stage or commit files.

## Plan Self-Review

### Spec Coverage

- Task 2 covers selection precedence, event ordering, context inheritance, fixed layout, placeholder measurement, safe area, border, and parent visual state.
- Task 3 covers name fallback, icon/text React nodes, badge/dot precedence, indicators, style variants, text mode, transforms, and mid-button behavior.
- Tasks 1 and 4 cover defaults, public exports, example, documentation, matrix rows, and full validation.

### Placeholder Scan

No placeholder markers or unspecified verification remain. Every module, public type, callback order, visual mapping, test ID, and validation command is explicit.

### Type Consistency

- `UPTabbarName` is `string | number` in the parent context and item props.
- Parent APIs consistently use `value`, `modelValue`, `defaultValue`, `onChange`, and `onClick`.
- Item APIs consistently use `activeIconNode`, `inactiveIconNode`, `textNode`, and `itemIndex`.
- Configuration keys are `tabbar` and `tabbarItem`; test IDs use `up-tabbar-`.
