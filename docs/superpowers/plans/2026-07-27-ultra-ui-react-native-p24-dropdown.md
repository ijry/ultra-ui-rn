# P24 Dropdown Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPDropdown` and `UPDropdownItem` with source-compatible selection APIs, a measured root-overlay menu, parent ref methods, configuration defaults, tests, example, and compatibility documentation.

**Architecture:** `UPDropdown` provides React context to child items, stores one active index, measures its menu bar, and renders the selected child panel through `UPRoot`'s overlay registry. `UPDropdownItem` registers its source metadata and either creates the native default option list or passes through fully application-owned React children.

**Tech Stack:** React 19, React Native 0.86, TypeScript, `@testing-library/react-native`, `UPRoot`, `UPOverlay`, `UPTransition`, and `UPIcon`.

## Global Constraints

- Work directly in the existing `main` workspace; do not create branches or worktrees.
- Do not add dependencies, stage, commit, push, reset, or clean.
- Apply all edits with `apply_patch` and preserve unrelated untracked files.
- Keep `customClass` as a typed deprecated no-op; React Native has no CSS class runtime.
- Root-layer behavior requires consumers to mount the component under `UPRoot`.

## File Structure

- Create `src/components/dropdown/context.ts` for registration and parent context types.
- Create `src/components/dropdown/UPDropdown.tsx` for the menu bar, root overlay, and ref.
- Create `src/components/dropdown/UPDropdownItem.tsx` for option selection and content registration.
- Create `src/components/dropdown/index.ts` for public dropdown exports.
- Create `tests/components/UPDropdown.test.tsx` for component behavior.
- Modify `src/config/defaults.ts`, `src/config/store.ts`, and `src/components/index.ts` for public configuration and exports.
- Modify `example/App.tsx`, `docs/compatibility.md`, and `docs/gap-matrix.md` for user-facing integration.

---

### Task 1: Add Configuration Types and the Failing Public Contract

**Files:**
- Create: `tests/components/UPDropdown.test.tsx`
- Create: `src/components/dropdown/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces `UP.props.dropdown` and `UP.props.dropdownItem` for `UP.setConfig`.
- Reserves public exports `UPDropdown`, `UPDropdownRef`, `UPDropdownItem`, and `UPDropdownOption` for Tasks 2–3.
- Establishes IDs: `up-dropdown`, `up-dropdown-menu-<index>`, `up-dropdown-title-<index>`, `up-dropdown-icon-<index>`, `up-dropdown-panel`, `up-dropdown-mask`, and `up-dropdown-option-<itemIndex>-<optionIndex>`.

- [ ] **Step 1: Write a test that imports and opens the public components**

Create `tests/components/UPDropdown.test.tsx`:

```tsx
import React, { createRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPDropdown,
  UPDropdownItem,
  UPRoot,
  type UPDropdownRef,
} from '../../src';

const deliveryOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Express', value: 'express' },
] as const;

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders item titles and opens default options', async () => {
  const screen = renderRoot(
    <UPDropdown>
      <UPDropdownItem options={deliveryOptions} title="Delivery" />
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByTestId('up-dropdown-panel')).toBeTruthy();
  expect(screen.getByText('Standard')).toBeTruthy();
});
```

- [ ] **Step 2: Confirm the test fails before implementation**

Run: `npm test -- --runInBand tests/components/UPDropdown.test.tsx`

Expected: TypeScript/Jest reports missing `UPDropdown` and `UPDropdownItem` exports.

- [ ] **Step 3: Add exact default contracts and frozen values**

Add these near `UPTooltipDefaults` in `src/config/defaults.ts`:

```ts
export type UPDropdownDefaults = {
  activeColor: string;
  inactiveColor: string;
  closeOnClickMask: boolean;
  closeOnClickSelf: boolean;
  duration: number;
  height: number;
  borderBottom: boolean;
  titleSize: number;
  borderRadius: number;
  menuIcon: string;
  menuIconSize: number;
};

export type UPDropdownItemDefaults = {
  modelValue: string | number | readonly (string | number)[];
  title: string;
  options: readonly Record<string, unknown>[];
  disabled: boolean;
  height: string;
  closeOnClickOverlay: boolean;
};
```

Add `dropdown` and `dropdownItem` to `UPProps`, then add these frozen values to `sourceDefaults.props`:

```ts
dropdown: Object.freeze({
  activeColor: '#2979ff', inactiveColor: '#606266',
  closeOnClickMask: true, closeOnClickSelf: true, duration: 300,
  height: 40, borderBottom: false, titleSize: 14, borderRadius: 0,
  menuIcon: 'arrow-down', menuIconSize: 14,
}),
dropdownItem: Object.freeze({
  modelValue: '', title: '', options: Object.freeze([]), disabled: false,
  height: 'auto', closeOnClickOverlay: true,
}),
```

- [ ] **Step 4: Wire configuration state and the public barrel**

In `src/config/store.ts`, clone both new `sourceDefaults.props` keys in `createSourceState()`, then merge `overrides.props?.dropdown` and `overrides.props?.dropdownItem` in `setUPConfig()`.

Create `src/components/dropdown/index.ts`:

```ts
export * from './UPDropdown';
export * from './UPDropdownItem';
export * from './context';
```

Add `export * from './dropdown';` to `src/components/index.ts`. Do not create fake modules, placeholder components, or `any` casts.

- [ ] **Step 5: Verify only planned module paths are unresolved**

Run: `npm run typecheck`

Expected: it fails only for the intentional dropdown module imports. Existing errors remain out of scope.

### Task 2: Implement Parent Context, Menu Bar, and Root-Layer Panel

**Files:**
- Create: `src/components/dropdown/context.ts`
- Create: `src/components/dropdown/UPDropdown.tsx`
- Modify: `tests/components/UPDropdown.test.tsx`

**Interfaces:**
- Provides the following context contract to Task 3:

```ts
export type UPDropdownRegistration = {
  id: string;
  index: number;
  title: string | number;
  disabled: boolean;
  closeOnClickOverlay: boolean;
  node: React.ReactNode;
};

export type UPDropdownContextValue = {
  activeColor: string;
  inactiveColor: string;
  activeIndex: number | null;
  close: () => void;
  register: (entry: UPDropdownRegistration) => () => void;
};
```

- Produces this ref:

```ts
export type UPDropdownRef = {
  open: (index: number) => void;
  close: () => void;
  highlight: (index?: number | readonly number[]) => void;
};
```

- [ ] **Step 1: Add tests for switching, disabled items, and self-close**

Append this to the P24 test file:

```tsx
it('switches enabled menus, ignores disabled menus, and self-closes', async () => {
  const onOpen = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPDropdown onClose={onClose} onOpen={onOpen}>
      <UPDropdownItem title="One"><Text>One panel</Text></UPDropdownItem>
      <UPDropdownItem disabled title="Two"><Text>Two panel</Text></UPDropdownItem>
      <UPDropdownItem title="Three"><Text>Three panel</Text></UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByText('One panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-menu-1'));
  expect(screen.getByText('One panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-menu-2'));
  expect(screen.getByText('Three panel')).toBeTruthy();
  expect(onOpen).toHaveBeenNthCalledWith(1, 0);
  expect(onOpen).toHaveBeenLastCalledWith(2);
  fireEvent.press(screen.getByTestId('up-dropdown-menu-2'));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
  expect(onClose).toHaveBeenLastCalledWith(2);
});
```

- [ ] **Step 2: Run the interaction test and verify failure**

Run: `npm test -- --runInBand tests/components/UPDropdown.test.tsx -t "switches enabled menus"`

Expected: FAIL because the parent has not implemented registration, menu controls, or an overlay.

- [ ] **Step 3: Create the context module**

Create `src/components/dropdown/context.ts` with the exact types in the interface block and:

```tsx
import { createContext, useContext } from 'react';

export const UPDropdownContext = createContext<UPDropdownContextValue | null>(null);

export function useUPDropdownContext(): UPDropdownContextValue | null {
  return useContext(UPDropdownContext);
}
```

- [ ] **Step 4: Implement the parent as the single active-index owner**

Create `src/components/dropdown/UPDropdown.tsx` with these rules:

1. Merge `useUPConfig().props.dropdown` before explicit props. Type `duration`, `height`, `borderRadius`, `titleSize`, and `menuIconSize` as `UPDimension`.
2. Use `forwardRef`, `useImperativeHandle`, `useState`, `useRef`, `useEffect`, `useCallback`, `useMemo`, `Children`, and `cloneElement`. Clone valid children with `itemIndex`; registrations live in a `Map` and are rendered sorted by index.
3. Store `activeIndex: number | null` and `highlightedIndexes: readonly number[]`. `open(index)` ignores absent/disabled entries. A press on the active menu closes only when `closeOnClickSelf` is true.
4. Measure the menu with `measureInWindow`; start with `{ x: 0, y: 0, width: Dimensions.get('window').width, height: getPx(props.height) }`.
5. Register one full-window root layer with `useUPOverlay()` and a module-sequence ID. It contains `UPOverlay testID="up-dropdown-mask"` and `UPTransition mode="slide-down"`.
6. Position the white panel at `{ left: frame.x, top: frame.y + frame.height, width: frame.width }` and give it bottom radii from `borderRadius`. The panel contains exactly the current registration node and consumes its presses.
7. Attach the mask close handler only when both parent `closeOnClickMask` and active item `closeOnClickOverlay` are true.
8. Call `onOpen(index)` once for each valid open and `onClose(previousIndex)` once before clearing. Remove the root entry on close and unmount.
9. Render equal-width `Pressable` menu items: active/highlighted title uses `activeColor`, inactive uses `inactiveColor`, disabled title/icon use `#c0c4cc`, active icon rotates 180 degrees, and `borderBottom` draws `#e4e7ed`.
10. Include every source prop from the P24 design plus `customStyle`, deprecated `customClass`, React `children`, `onOpen`, and `onClose` in `UPDropdownProps`.

- [ ] **Step 5: Re-run the parent test**

Run: `npm test -- --runInBand tests/components/UPDropdown.test.tsx -t "switches enabled menus"`

Expected: it remains red until Task 3 registers child items. Do not weaken the test or introduce parent-only placeholder entries.

### Task 3: Implement Items, Default Options, and Ref Behavior

**Files:**
- Create: `src/components/dropdown/UPDropdownItem.tsx`
- Modify: `src/components/dropdown/UPDropdown.tsx`
- Modify: `tests/components/UPDropdown.test.tsx`

**Interfaces:**
- Produces:

```ts
export type UPDropdownValue = string | number | readonly (string | number)[];
export type UPDropdownOption = { label: string | number; value: UPDropdownValue };

export type UPDropdownItemProps = {
  modelValue?: UPDropdownValue;
  value?: UPDropdownValue;
  title?: string | number;
  options?: readonly UPDropdownOption[];
  disabled?: boolean;
  height?: UPDimension | 'auto';
  closeOnClickOverlay?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  children?: React.ReactNode;
  onUpdateModelValue?: (value: UPDropdownValue) => void;
  onChange?: (value: UPDropdownValue) => void;
  itemIndex?: number;
};
```

- Current value precedence is `modelValue`, legacy `value`, then local state; `0` remains controlled.
- Default row callback order is local uncontrolled update, `onUpdateModelValue`, `onChange`, then parent `close()`.

- [ ] **Step 1: Add selection, mask, ref, and custom-content tests**

Append these cases:

```tsx
it('updates default options before closing and honors item mask policy', async () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPDropdown>
      <UPDropdownItem
        closeOnClickOverlay={false}
        onChange={(value) => events.push(`change:${String(value)}`)}
        onUpdateModelValue={(value) => events.push(`update:${String(value)}`)}
        options={deliveryOptions}
        title="Delivery"
      />
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  fireEvent.press(screen.getByTestId('up-dropdown-mask'));
  expect(screen.getByTestId('up-dropdown-panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-option-0-1'));
  expect(events).toEqual(['update:express', 'change:express']);
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});

it('supports controlled zero, ref methods, and visual-only highlight', async () => {
  const ref = createRef<UPDropdownRef>();
  const screen = renderRoot(
    <UPDropdown ref={ref}>
      <UPDropdownItem modelValue={0} options={[{ label: 'Zero', value: 0 }]} title="One" />
      <UPDropdownItem disabled title="Two"><Text>Two panel</Text></UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  act(() => ref.current?.highlight([1]));
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-title-1').props.style)).toEqual(
    expect.objectContaining({ color: '#2979ff' }),
  );
  act(() => ref.current?.open(1));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
  act(() => ref.current?.open(0));
  expect(screen.getByText('Zero')).toBeTruthy();
  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});

it('replaces default options with application-owned custom children', async () => {
  const ref = createRef<UPDropdownRef>();
  const screen = renderRoot(
    <UPDropdown ref={ref}>
      <UPDropdownItem options={deliveryOptions} title="Custom">
        <Text>Custom controls own their state</Text>
      </UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByText('Custom controls own their state')).toBeTruthy();
  expect(screen.queryByTestId('up-dropdown-option-0-0')).toBeNull();
  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});
```

- [ ] **Step 2: Run the option test and confirm it fails**

Run: `npm test -- --runInBand tests/components/UPDropdown.test.tsx -t "updates default options"`

Expected: FAIL because the item has not registered option content or callbacks.

- [ ] **Step 3: Implement `UPDropdownItem`**

Create `src/components/dropdown/UPDropdownItem.tsx` with these requirements:

1. Merge `useUPConfig().props.dropdownItem` before explicit input. Generate a stable registration ID with a module sequence plus `useRef`.
2. Register in `useEffect` with id, injected `itemIndex`, title, disabled, `closeOnClickOverlay`, and the current panel node. Return the registration cleanup. Render `null` when context is absent.
3. When `children` is non-null, register a white `View` containing it. Do not derive options, values, callbacks, or automatic close behavior from custom content.
4. Otherwise register a vertical `ScrollView` of `Pressable` rows. The selected row uses the parent active color, renders `UPIcon name="checkbox-mark"`, and uses `up-dropdown-option-${itemIndex}-${optionIndex}`.
5. Use source loose equality, `currentValue == option.value`, for selected-state comparison. Derive current value with `input.modelValue !== undefined ? input.modelValue : input.value !== undefined ? input.value : localValue`.
6. On default row press, update local state only if both controlled values are undefined, then invoke `onUpdateModelValue`, `onChange`, and `context.close()` in that order.
7. When `height !== 'auto'`, use `maxHeight: getPx(height)` on the `ScrollView`; otherwise do not cap its height. Apply `customStyle` only to default option content.

- [ ] **Step 4: Finish parent ordering and public exports**

Ensure `UPDropdown` clones children inside its context provider, sorts entries by `index`, and supplies title/icon test IDs. Ensure the provider receives the stable parent close callback. Retain all three `src/components/dropdown/index.ts` exports so the new types reach `src/index.ts`.

- [ ] **Step 5: Add defaults, border, rotation, and parent-mask test**

Append this test, and add a `closeOnClickSelf={false}` assertion to the switching test:

```tsx
it('reacts to configured defaults while explicit values win', async () => {
  const screen = renderRoot(<UPDropdown><UPDropdownItem title="Configured" /></UPDropdown>);
  UP.setConfig({ props: { dropdown: { activeColor: '#ff0000', borderBottom: true } } });
  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-title-0').props.style)).toEqual(
    expect.objectContaining({ color: '#ff0000' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-icon-0').props.style)).toEqual(
    expect.objectContaining({ transform: [{ rotate: '180deg' }] }),
  );
  fireEvent.press(screen.getByTestId('up-dropdown-mask'));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});
```

Run: `npm test -- --runInBand tests/components/UPDropdown.test.tsx`

Expected: PASS. Coverage must include local/controlled `0`, disabled menus, both mask policies, self-close policy, switch callbacks, refs, children replacement, default overrides, border, active color, and icon rotation.

### Task 4: Add Example, Documentation, and Full Quality Gates

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes public `UPDropdown`, `UPDropdownItem`, and `UPDropdownRef` exports from Tasks 2–3.
- Produces user-facing content consistent with tested event ordering and custom-content ownership.

- [ ] **Step 1: Add a controlled default-options example**

In `example/App.tsx`, import `UPDropdown` and `UPDropdownItem`, add `const [delivery, setDelivery] = useState<string | number>('standard');` beside picker/select state, and place this after the `UPSelect` example:

```tsx
<Text style={styles.section}>Dropdown</Text>
<UPDropdown>
  <UPDropdownItem
    modelValue={delivery}
    onUpdateModelValue={(value) => {
      if (typeof value === 'string' || typeof value === 'number') setDelivery(value);
    }}
    options={[
      { label: 'Standard delivery', value: 'standard' },
      { label: 'Express delivery', value: 'express' },
    ]}
    title="Delivery"
  />
</UPDropdown>
<Text>Delivery: {delivery}</Text>
```

- [ ] **Step 2: Document the P24 native mapping**

Add `## P24 dropdown family` after P23 in `docs/compatibility.md`. State that `UPDropdown` measures its menu and uses a `UPRoot` overlay to avoid ancestor clipping; `UPDropdownItem` supports `modelValue`, legacy `value`, and `{ label, value }`; option selection emits update then change then closes; `UPDropdownRef` exposes `open(index)`, `close()`, and `highlight(index?)`; and custom React children replace default options, with application code owning state changes and parent-ref close. State that CSS classes/transforms, Vue registration, and source touch-move prevention have no direct native mapping and `customClass` stays a no-op.

Include:

```tsx
const menuRef = useRef<UPDropdownRef>(null);
const [delivery, setDelivery] = useState('standard');

<UPDropdown ref={menuRef}>
  <UPDropdownItem
    modelValue={delivery}
    onUpdateModelValue={(value) => setDelivery(String(value))}
    options={[{ label: 'Standard', value: 'standard' }]}
    title="Delivery"
  />
</UPDropdown>
```

- [ ] **Step 3: Add P24 gap-matrix rows**

Insert this before `## Deferred Source Components` in `docs/gap-matrix.md`:

```md
## P24 Dropdown Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-dropdown` | title bar, colors, mask/self close, open/close/highlight | `UPDropdown`, `UPDropdownRef` | One measured root-overlay panel is active; disabled menus never open and highlight is visual-only | Emulated | `tests/components/UPDropdown.test.tsx` |
| `u-dropdown-item` | `modelValue`/`value`, options, disabled, height, mask close, change | `UPDropdownItem`, `onUpdateModelValue`, `onChange` | Source options update then emit change before parent close; React children replace default options | Emulated | `tests/components/UPDropdown.test.tsx` |
| dropdown family | Vue instances, CSS classes/transforms, touch-move prevention | React context, root overlay, `UPTransition`, retained `customClass` | Root overlay avoids native clipping; exact CSS and platform gesture behavior have no RN-core equivalent | No-op retained | `src/components/dropdown/UPDropdown.tsx` |
```

- [ ] **Step 4: Run validation from narrow to broad**

Run from repository root:

```powershell
npm test -- --runInBand tests/components/UPDropdown.test.tsx
npm run typecheck
npm run lint
npm run build
Push-Location example; npx tsc --noEmit; npx eslint App.tsx; Pop-Location
npm pack --dry-run
git diff --check
```

Expected: every command exits `0`; `npm pack --dry-run` must not write a tarball.

- [ ] **Step 5: Inspect only, preserving existing work**

Run:

```powershell
git status --short
git diff --check
```

Expected: P24 files are present and prior unrelated modifications remain untouched. Do not stage or commit anything.

## Plan Self-Review

### Spec Coverage

- Task 2 covers measured root-overlay placement, active-state ownership, masks, self-close, colors, icon, border, events, and parent ref methods.
- Task 3 covers model aliases, source option rendering, check state, scrolling height, event order, custom children, and item mask policy.
- Tasks 1 and 4 cover configuration, exports, tests, example, documentation, compatibility matrix, and full validation.

### Placeholder Scan

No placeholder markers or unspecified validation remains. All modules, public types, test IDs, callback ordering, and commands are explicit.

### Type Consistency

- `UPDropdownRef` consistently exposes `open(index)`, `close()`, and `highlight(index?)`.
- `UPDropdownItemProps` consistently uses `modelValue`, legacy `value`, `onUpdateModelValue`, and `onChange`.
- Configuration keys remain `dropdown` and `dropdownItem`; test IDs use `up-dropdown-`.
