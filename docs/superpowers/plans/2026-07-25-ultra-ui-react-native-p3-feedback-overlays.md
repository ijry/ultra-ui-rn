# React Native P3 Feedback Overlays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port uview-plus 3.8.86 feedback and overlay components for React Native: overlay, transition, popup, modal, action sheet, notify, loading icon, loading page, and toast feedback.

**Architecture:** Declarative components render into the application tree or the existing `UPRoot` overlay provider when fixed stacking is required. A small `UPFeedbackHost` registered by `UPRoot` owns imperative Toast/Notify entries; calls without a host remain safe no-ops. Components retain source props, map `show` to `show` plus `onChangeShow`, and use React Native `Animated` instead of CSS transition classes.

**Tech Stack:** React 19, React Native 0.86, TypeScript 5.9, Animated API, React Native Testing Library, Jest fake timers.

## Global Constraints

- Work directly on `main`; the user explicitly authorized this workspace and no commit is created without a new instruction.
- Source of truth is uview-plus `3.8.86` at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Add exact source default records to `UP.props`; use `useUPConfig()` so mounted components react to `UP.setConfig()`.
- Preserve unavailable uni-app props as typed `@deprecated` no-ops and record each in `docs/gap-matrix.md`.
- Use `UP.getPx`/`rpx2px`, source color tokens, safe-area context, and apply `customStyle` last.
- All public components are `UP*`; Vue `update:show` becomes `onChangeShow(show)` and source `close`/`open` events become callbacks.

---

### Task 1: Overlay Defaults, Transition, and Overlay Surface

**Files:**
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Create: `src/components/transition/UPTransition.tsx`, `src/components/transition/index.ts`, `src/components/overlay/UPOverlay.tsx`, `src/components/overlay/index.ts`
- Test: `tests/components/UPOverlayTransition.test.tsx`

**Interfaces:**
- Produces `UPTransitionProps { show?: boolean; mode?: UPTransitionMode; duration?: UPDimension; timingFunction?: string; children?: ReactNode; onBeforeEnter?: () => void; onEnter?: () => void; onAfterEnter?: () => void; onBeforeLeave?: () => void; onLeave?: () => void; onAfterLeave?: () => void; onClick?: () => void }`.
- Produces `UPOverlayProps { show?: boolean; zIndex?: number | string; duration?: UPDimension; opacity?: number | string; customStyle?: StyleProp<ViewStyle>; children?: ReactNode; onClick?: () => void }`.
- Adds `transition` and `overlay` default tables and override entries.

- [ ] **Step 1: Write failing transition and overlay tests**

```tsx
it('maps source overlay opacity and click callback', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPOverlay opacity={0.4} show onClick={onClick} />);
  expect(StyleSheet.flatten(screen.getByTestId('up-overlay').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 10070 }),
  );
  fireEvent.press(screen.getByTestId('up-overlay'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('emits source transition lifecycle around visibility changes', () => {
  const onAfterLeave = jest.fn();
  const screen = renderRoot(<UPTransition duration={100} show onAfterLeave={onAfterLeave}><Text>Body</Text></UPTransition>);
  screen.rerender(<UPRoot><UPTransition duration={100} show={false} onAfterLeave={onAfterLeave}><Text>Body</Text></UPTransition></UPRoot>);
  act(() => jest.advanceTimersByTime(100));
  expect(onAfterLeave).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --runInBand tests/components/UPOverlayTransition.test.tsx`

Expected: FAIL because `UPOverlay` and `UPTransition` are not exported.

- [ ] **Step 3: Add source defaults and implement minimal Animated transition plus pressable overlay**

```tsx
const translate = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
return visible ? <Animated.View style={[baseStyle, { opacity: progress, transform: [{ translateY: translate }] }]}>{children}</Animated.View> : null;
```

`UPOverlay` must render a full-screen `Pressable` when `show`, use source `rgba(0, 0, 0, opacity)`, and forward `zIndex`; it must remain in-tree for composition by popup-like components.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- --runInBand tests/components/UPOverlayTransition.test.tsx`

Expected: PASS with both lifecycle and style assertions green.

---

### Task 2: Popup Container and Modal Dialog

**Files:**
- Create: `src/components/popup/UPPopup.tsx`, `src/components/popup/index.ts`, `src/components/modal/UPModal.tsx`, `src/components/modal/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPPopupModal.test.tsx`

**Interfaces:**
- Produces `UPPopupProps` for all source props: `show`, `overlay`, `mode`, `duration`, `closeable`, `overlayStyle`, `closeOnClickOverlay`, `zIndex`, safe-area flags, `closeIconPos`, `round`, `zoom`, `bgColor`, `overlayOpacity`, `pageInline`, `touchable`, `minHeight`, `maxHeight`, `children`, `bottom`, `onOpen`, `onClose`, `onChangeShow`.
- Produces `UPModalProps` for source title/content/button/async/overlay/width/alignment props and `onConfirm`, `onCancel`, `onClose`, `onChangeShow`.

- [ ] **Step 1: Write failing popup and modal behavior tests**

```tsx
it('closes popup through the source overlay callback', () => {
  const onChangeShow = jest.fn();
  const screen = renderRoot(<UPPopup show onChangeShow={onChangeShow}>Panel</UPPopup>);
  fireEvent.press(screen.getByTestId('up-popup-overlay'));
  expect(onChangeShow).toHaveBeenCalledWith(false);
});

it('keeps async modal open until its parent changes show', () => {
  const onConfirm = jest.fn();
  const screen = renderRoot(<UPModal asyncClose content="Delete it?" show onConfirm={onConfirm} />);
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('up-modal')).toBeTruthy();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --runInBand tests/components/UPPopupModal.test.tsx`

Expected: FAIL because popup and modal exports are missing.

- [ ] **Step 3: Implement popup positioning, safe-area padding, and modal buttons**

```tsx
const close = () => { input.onChangeShow?.(false); input.onClose?.(); };
const panelStyle = mode === 'bottom' ? { bottom: 0, left: 0, right: 0 } : mode === 'center' ? { alignSelf: 'center' } : sideStyle;
```

Use `UPOverlay` plus `UPTransition`; safe-area flags use `useSafeAreaInsets`. `touchable`, `minHeight`, `maxHeight`, and CSS class props remain typed no-ops except `maxHeight` native style mapping. Modal confirm/cancel must call their callbacks and only request closure when the respective async flag is false.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- --runInBand tests/components/UPPopupModal.test.tsx`

Expected: PASS with overlay close, modal async, source dimensions, and button order checks green.

---

### Task 3: Action Sheet, Loading Icon, and Loading Page

**Files:**
- Create: `src/components/action-sheet/UPActionSheet.tsx`, `src/components/action-sheet/index.ts`, `src/components/loading-icon/UPLoadingIcon.tsx`, `src/components/loading-icon/index.ts`, `src/components/loading-page/UPLoadingPage.tsx`, `src/components/loading-page/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPFeedbackDisplay.test.tsx`

**Interfaces:**
- Produces `UPActionSheetProps` for source action keys/config, cancel/overlay behavior, `onSelect(action, index)`, `onCancel`, `onClose`, `onChangeShow`.
- Produces `UPLoadingIconProps` matching show/color/text/layout/mode/duration defaults.
- Produces `UPLoadingPageProps` matching loading/text/image/color/size/zIndex source defaults.

- [ ] **Step 1: Write failing action-sheet and loading tests**

```tsx
it('emits source action payload and requests close', () => {
  const onSelect = jest.fn();
  const onChangeShow = jest.fn();
  const screen = renderRoot(<UPActionSheet actions={[{ name: 'Delete' }]} show onChangeShow={onChangeShow} onSelect={onSelect} />);
  fireEvent.press(screen.getByTestId('up-action-sheet-action-0'));
  expect(onSelect).toHaveBeenCalledWith({ name: 'Delete' }, 0);
  expect(onChangeShow).toHaveBeenCalledWith(false);
});

it('renders source loading text and loading page visibility', () => {
  const screen = renderRoot(<><UPLoadingIcon text="Loading" /><UPLoadingPage loading loadingText="Fetching" /></>);
  expect(screen.getByText('Loading')).toBeTruthy();
  expect(screen.getByText('Fetching')).toBeTruthy();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --runInBand tests/components/UPFeedbackDisplay.test.tsx`

Expected: FAIL because the three feedback components are not exported.

- [ ] **Step 3: Implement action list and native loading fallbacks**

```tsx
<ActivityIndicator color={props.color} size={getPx(props.size) >= 28 ? 'large' : 'small'} />
```

Map `actions` key names, disabled/color/subname state, source cancel behavior, and safe bottom inset. Use static `ActivityIndicator` for source `spinner`, `circle`, and `semicircle` modes; visual differences are documented as emulated. `UPLoadingPage` uses an absolute overlay with an optional image and its own z-index.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- --runInBand tests/components/UPFeedbackDisplay.test.tsx`

Expected: PASS with action payload and loading visibility assertions green.

---

### Task 4: Feedback Host, Toast, and Notify

**Files:**
- Create: `src/feedback/host.tsx`, `src/feedback/index.ts`, `src/components/toast/UPToast.tsx`, `src/components/toast/index.ts`, `src/components/notify/UPNotify.tsx`, `src/components/notify/index.ts`
- Modify: `src/overlay/UPRoot.tsx`, `src/index.ts`, `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/feedback/UPFeedbackHost.test.tsx`, `tests/components/UPToastNotify.test.tsx`

**Interfaces:**
- Produces `UPToastRef { show(options: UPToastOptions): void; hide(): void; primary(message: string): void; success(message: string): void; error(message: string): void; warning(message: string): void; loading(message: string): void }`.
- Produces `UPNotifyRef { show(options: UPNotifyOptions): void; hide(): void }` and declarative `UPNotify`.
- Produces `UP.toast` and `UP.notify` host-backed APIs that safely no-op until a `UPRoot` has mounted.

- [ ] **Step 1: Write failing imperative feedback tests with fake timers**

```tsx
it('shows a host-backed toast and completes after its source duration', () => {
  jest.useFakeTimers();
  render(<UPRoot><FeedbackButton /></UPRoot>);
  act(() => UP.toast.success('Saved'));
  expect(screen.getByText('Saved')).toBeTruthy();
  act(() => jest.advanceTimersByTime(2000));
  expect(screen.queryByText('Saved')).toBeNull();
});

it('does not throw when imperative feedback has no mounted root', () => {
  expect(() => UP.notify.show({ message: 'Offline' })).not.toThrow();
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- --runInBand tests/feedback/UPFeedbackHost.test.tsx tests/components/UPToastNotify.test.tsx`

Expected: FAIL because `UP.toast` / `UP.notify` are unavailable.

- [ ] **Step 3: Add single host registration and declarative feedback rendering**

```tsx
let feedbackApi: UPFeedbackApi | null = null;
export const toast = { show: (options: UPToastOptions) => feedbackApi?.showToast(options), success: (message: string) => feedbackApi?.showToast({ message, type: 'success' }) };
```

`UPRoot` mounts `UPFeedbackHost` inside its existing `OverlayProvider`. The host must clear timers before replacing entries, apply source toast default duration `2000`, notify duration `3000`, and clean up on unmount. Toast `overlay`, `position`, `loading`, type/icon, completion, and `duration: -1` are implemented; uni navigation callback props stay typed no-ops. Notify maps source top, theme type, safe top inset, and manual hide.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm test -- --runInBand tests/feedback/UPFeedbackHost.test.tsx tests/components/UPToastNotify.test.tsx`

Expected: PASS with timers, host absence, and declarative notification callbacks green.

---

### Task 5: P3-1 Documentation, Example, and Quality Gates

**Files:**
- Modify: `docs/gap-matrix.md`, `docs/compatibility.md`, `README.md`, `example/App.tsx`
- Test: P3 focused suites plus root and example quality gates

**Interfaces:**
- Adds a feedback showcase with controlled popup/modal/action-sheet, loading page, and imperative toast/notify actions.
- Adds source API matrix rows with Supported, Emulated, and No-op retained status for all Task 1–4 props/events/slots.

- [ ] **Step 1: Add P3 feedback showcase and compatibility examples**

```tsx
<UPButton text="Show toast" onClick={() => UP.toast.success('Saved')} />
<UPPopup show={popupOpen} onChangeShow={setPopupOpen}>Popup content</UPPopup>
<UPActionSheet actions={[{ name: 'Share' }]} show={sheetOpen} onChangeShow={setSheetOpen} />
```

Document source-to-RN aliases, overlay-host requirement, transition differences, static activity-indicator modes, no-op uni navigation props, and P3-2 navigation deferral.

- [ ] **Step 2: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all Jest suites pass, no TypeScript or ESLint errors, package contains new exports, and diff check is clean.

- [ ] **Step 3: Run example quality gates**

Run from `example/`: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: typecheck, lint, and `App.test.tsx` pass.
