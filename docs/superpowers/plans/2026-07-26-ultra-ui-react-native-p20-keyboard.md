# P20 Keyboard Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible React Native keyboard, number-keyboard, and car-keyboard components.

**Architecture:** Standalone grid components own key layout and press lifecycle. `UPKeyboard` composes the appropriate grid inside the existing root-overlay-backed `UPPopup`, leaving visibility controlled by the caller. Source defaults flow through the existing reactive `UP` configuration store.

**Tech Stack:** TypeScript, React 19, React Native core, `@testing-library/react-native`, Jest fake timers.

## Global Constraints

- Source contract: uview-plus 3.8.86 under `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Public component names use `UP*` PascalCase and no package dependencies are added.
- Work directly on `main`; do not create branches, worktrees, commits, or unrelated changes.
- Explicit props override reactive `UP.setConfig` defaults.
- Retain unavailable CSS/touch runtime APIs as documented source-compatible no-ops.

---

### Task 1: Lock keyboard contracts with failing tests

**Files:**
- Create: `tests/components/UPKeyboard.test.tsx`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Consumes: public exports `UPKeyboard`, `UPNumberKeyboard`, `UPCarKeyboard`, `UPRoot`, and `UP`.
- Produces: source behavior coverage for P20 state, values, callbacks, and configuration.

- [ ] **Step 1: Write number and card payload tests**

```tsx
const screen = renderRoot(
  <UPNumberKeyboard mode="card" onBackspace={onBackspace} onChange={onChange} />,
);
fireEvent.press(screen.getByTestId('up-number-keyboard-key-X'));
fireEvent.press(screen.getByTestId('up-number-keyboard-key-1'));
fireEvent.press(screen.getByTestId('up-number-keyboard-backspace'));
expect(onChange).toHaveBeenNthCalledWith(1, 'X');
expect(onChange).toHaveBeenNthCalledWith(2, 1);
expect(onBackspace).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the focused test to verify missing exports fail**

Run: `npm test -- --runInBand tests/components/UPKeyboard.test.tsx`

Expected: FAIL because the three P20 exports do not exist.

- [ ] **Step 3: Add wrapper, long-press, and configuration cases**

```tsx
fireEvent.press(screen.getByTestId('up-keyboard-confirm'));
fireEvent.press(screen.getByTestId('up-popup-overlay'));
expect(onConfirm).toHaveBeenCalledTimes(1);
expect(onChangeShow).toHaveBeenCalledWith(false);
expect(onClose).toHaveBeenCalledTimes(1);
```

- [ ] **Step 4: Add car mode and auto-change cases**

```tsx
jest.useFakeTimers();
fireEvent.press(screen.getByTestId('up-car-keyboard-key-京'));
act(() => jest.advanceTimersByTime(200));
expect(screen.getByTestId('up-car-keyboard-key-Q')).toBeTruthy();
```

### Task 2: Implement reusable keyboard grids and configuration

**Files:**
- Create: `src/components/number-keyboard/UPNumberKeyboard.tsx`
- Create: `src/components/number-keyboard/index.ts`
- Create: `src/components/car-keyboard/UPCarKeyboard.tsx`
- Create: `src/components/car-keyboard/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces: `UPNumberKeyboardProps`, `UPCarKeyboardProps`, and public component exports.
- Consumes: `useUPConfig`, `getPx`, and `UPIcon`.

- [ ] **Step 1: Add exact source default tables and config keys**

```ts
keyboard: Object.freeze({ mode: 'number' as const, dotDisabled: false, tooltip: true, showTips: true, tips: '', showCancel: true, showConfirm: true, random: false, safeAreaInsetBottom: true, closeOnClickOverlay: true, show: false, overlay: true, zIndex: 10075, cancelText: '取消', confirmText: '确认', autoChange: false }),
numberKeyboard: Object.freeze({ mode: 'number' as const, dotDisabled: false, random: false }),
carKeyboard: Object.freeze({ random: false }),
```

- [ ] **Step 2: Implement `UPNumberKeyboard` layout and repeat backspace**

```tsx
<Pressable
  onPressIn={startBackspace}
  onPressOut={stopBackspace}
  testID="up-number-keyboard-backspace"
>
  <UPIcon name="backspace" size={28} />
</Pressable>
```

Use number keys `1..9`, then `.`/`X`, then `0`; span the `0` key when
`mode === 'number' && dotDisabled && !random`.

- [ ] **Step 3: Implement `UPCarKeyboard` rows and mode transition**

```tsx
const [alphabetic, setAlphabetic] = useState(false);
const inputKey = (value: string | number) => {
  input.onChange?.(value);
  if (!alphabetic && input.autoChange) timerRef.current = setTimeout(() => setAlphabetic(true), 200);
};
```

Render source province and alphanumeric key sets in four rows, add a
`中/英` toggle and shared repeating backspace behavior.

- [ ] **Step 4: Export grids and run focused contracts**

Run: `npm test -- --runInBand tests/components/UPKeyboard.test.tsx tests/config/store.test.ts`

Expected: grid, auto-change, repeat-backspace, and config expectations PASS.

### Task 3: Implement the source keyboard popup wrapper

**Files:**
- Create: `src/components/keyboard/UPKeyboard.tsx`
- Create: `src/components/keyboard/index.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `UPNumberKeyboard`, `UPCarKeyboard`, `UPPopup`, and reactive `UPProps['keyboard']`.
- Produces: `UPKeyboardProps` with `number | card | car` mode and source callbacks.

- [ ] **Step 1: Compose the controlled bottom popup**

```tsx
<UPPopup
  bgColor="rgb(214, 218, 220)"
  closeOnClickOverlay={props.closeOnClickOverlay}
  mode="bottom"
  onChangeShow={input.onChangeShow}
  onClose={input.onClose}
  overlay={props.overlay}
  round={false}
  safeAreaInsetBottom={props.safeAreaInsetBottom}
  show={props.show}
  zIndex={props.zIndex}
>
```

- [ ] **Step 2: Map toolbar and grid event contracts**

```tsx
{props.tooltip ? <View testID="up-keyboard-toolbar">...</View> : null}
{props.mode === 'car'
  ? <UPCarKeyboard autoChange={props.autoChange} onBackspace={input.onBackspace} onChange={input.onChange} random={props.random} />
  : <UPNumberKeyboard dotDisabled={props.dotDisabled} mode={props.mode} onBackspace={input.onBackspace} onChange={input.onChange} random={props.random} />}
```

Toolbar calls source `onCancel` and `onConfirm` without implicitly closing
the controlled popup.

- [ ] **Step 3: Run focused test and static checks**

Run: `npm test -- --runInBand tests/components/UPKeyboard.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

### Task 4: Document, demonstrate, and validate P20

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Consumes: P20 exports and callbacks.
- Produces: documented user-facing P20 support evidence.

- [ ] **Step 1: Add a controlled number keyboard example**

```tsx
<UPKeyboard
  onBackspace={() => setKeyboardValue((value) => value.slice(0, -1))}
  onChange={(value) => setKeyboardValue((current) => `${current}${value}`)}
  onChangeShow={setKeyboardOpen}
  show={keyboardOpen}
/>
```

- [ ] **Step 2: Record supported and retained source APIs**

Add P20 rows for all three components. Mark CSS hover, touchmove prevention,
and exact native press timing as React Native no-op/emulated boundaries.

- [ ] **Step 3: Run all package and example gates**

Run:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
Push-Location example; npx tsc --noEmit; npm run lint; npm test -- --runInBand; Pop-Location
```

Expected: all commands exit `0`; `npm pack --dry-run` leaves no tarball.
