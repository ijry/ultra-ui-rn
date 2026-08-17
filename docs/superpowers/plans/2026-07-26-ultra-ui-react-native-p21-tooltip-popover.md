# P21 Tooltip and Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible React Native tooltip and popover overlays with copy, action, singleton, and imperative behavior.

**Architecture:** `UPTooltip` owns trigger measurement, visible state, singleton registration, and root-overlay lifecycle. A measured layer positions the source-style popup around the trigger. `UPPopover` forwards source wrapper defaults and maps named Vue slots to `trigger` and `content` React nodes.

**Tech Stack:** TypeScript, React 19, React Native core `Pressable`/`View`, existing `UPRoot` overlays, `@testing-library/react-native`, Jest timers.

## Global Constraints

- Source contract: uview-plus 3.8.86 under `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Public component names use `UP*` PascalCase; no package dependencies are added.
- Work directly on `main`; do not create branches, worktrees, commits, or unrelated changes.
- `UPRoot` is required for tooltip/popover root overlays.
- Explicit props override reactive `UP.setConfig({ props: { tooltip } })` values.
- Preserve upstream `placement` as a documented no-op; `direction` controls actual location.

---

### Task 1: Lock P21 source contracts with failing tests

**Files:**
- Create: `tests/components/UPTooltip.test.tsx`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Consumes: public `UPTooltip`, `UPPopover`, `UPRoot`, and `UP` exports.
- Produces: regression coverage for opening, closing, measurement fallback, source action indexes, copy, singleton, popover, and default configuration.

- [ ] **Step 1: Add trigger, action, and overlay closure contracts**

```tsx
fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
fireEvent.press(screen.getByTestId('up-tooltip-button-0'));
expect(onClick).toHaveBeenCalledWith(0);
expect(onUpdateShow).toHaveBeenCalledWith(false);

fireEvent.press(screen.getByTestId('up-tooltip-overlay'));
expect(onClose).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the focused test before implementation**

Run: `npm test -- --runInBand tests/components/UPTooltip.test.tsx`

Expected: FAIL because P21 exports are absent.

- [ ] **Step 3: Add copying, manual, singleton, and ref cases**

```tsx
fireEvent.press(screen.getByTestId('up-tooltip-copy'));
await waitFor(() => expect(writeText).toHaveBeenCalledWith('receipt'));
expect(onClick).toHaveBeenCalledWith(0);

act(() => ref.current?.open());
expect(screen.getByTestId('up-tooltip-popup')).toBeTruthy();
act(() => ref.current?.close());
```

- [ ] **Step 4: Add popover and reactive defaults cases**

```tsx
UP.setConfig({ props: { tooltip: { buttons: ['Configured'] } } });
fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
expect(screen.getByText('Configured')).toBeTruthy();

fireEvent.press(screen.getByTestId('up-popover-trigger'));
expect(screen.getByText('Popover body')).toBeTruthy();
```

### Task 2: Implement tooltip defaults and root overlay

**Files:**
- Create: `src/components/tooltip/UPTooltip.tsx`
- Create: `src/components/tooltip/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces: `UPTooltip`, `UPTooltipProps`, `UPTooltipRef`, and tooltip reactive defaults.
- Consumes: `useUPOverlay`, `UPOverlay`, `toast`, and source `UP.props` store patterns.

- [ ] **Step 1: Add source defaults and reactive store merging**

```ts
tooltip: Object.freeze({
  text: '', copyText: '', size: 14, color: '#606266', bgColor: 'transparent',
  direction: 'top' as const, zIndex: 10071, showCopy: true, buttons: Object.freeze([]),
  overlay: true, showToast: true, popupBgColor: '', triggerMode: 'longpress' as const,
  forcePosition: Object.freeze({}), show: false, singleton: false,
}),
```

- [ ] **Step 2: Implement trigger state, source callbacks, and singleton registry**

```tsx
const requestVisible = (next: boolean) => {
  if (visibleRef.current === next) return;
  visibleRef.current = next;
  setVisible(next);
  input.onUpdateShow?.(next);
  if (next) input.onOpen?.(); else input.onClose?.();
};
```

Only click and longpress bind an interactive `Pressable`; manual and hover
render a non-interactive trigger container. `useImperativeHandle` exposes
`open()` and `close()`.

- [ ] **Step 3: Implement measured root-layer position and actions**

```tsx
overlay.add({
  id,
  node: <TooltipLayer close={close} frame={frame} props={layerProps} />,
  zIndex: Number(props.zIndex),
});
```

Measure with `measureInWindow`, render a stable fallback frame first, clamp
computed positions within 12 px, and merge `forcePosition` after the computed
style. Use `UPOverlay` with opacity `0` for the source transparent mask.

- [ ] **Step 4: Map clipboard adapter and source indexes**

```tsx
const copy = async () => {
  close();
  input.onClick?.(0);
  await Promise.resolve(input.writeText?.(String(props.copyText || props.text)));
};
```

Button index is `index + 1` when `showCopy` is true, otherwise `index`.
Show success/failure feedback only when `showToast` is enabled.

- [ ] **Step 5: Run focused contracts and static checks**

Run: `npm test -- --runInBand tests/components/UPTooltip.test.tsx tests/config/store.test.ts && npm run typecheck && npm run lint`

Expected: PASS.

### Task 3: Implement popover source wrapper

**Files:**
- Create: `src/components/popover/UPPopover.tsx`
- Create: `src/components/popover/index.ts`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `UPTooltip`, `UPTooltipProps`, and `UPTooltipRef`.
- Produces: `UPPopover`, `UPPopoverProps`, and `UPPopoverRef`.

- [ ] **Step 1: Forward source wrapper defaults and refs**

```tsx
const props = {
  bgColor: '#f7f7f7', color: '#333', direction: 'top' as const,
  forcePosition: {}, placement: 'top', popupBgColor: '#f7f7f7',
  show: false, triggerMode: 'click' as const, zIndex: 10070, ...input,
};
```

- [ ] **Step 2: Map named source slots to React nodes**

```tsx
<UPTooltip
  content={<View style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>{input.content ?? <Text>{props.text}</Text>}</View>}
  trigger={input.trigger ?? input.children}
  {...forwardedProps}
/>
```

`placement` remains typed and documented but is intentionally not used for
positioning because upstream forwards it to a tooltip API that ignores it.

- [ ] **Step 3: Run focused tests**

Run: `npm test -- --runInBand tests/components/UPTooltip.test.tsx`

Expected: popover trigger, content, callbacks, and imperative ref PASS.

### Task 4: Document, demonstrate, and validate P21

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Consumes: `UPTooltip` and its root-overlay/clipboard adapter contract.
- Produces: user-facing P21 guidance and executable example coverage.

- [ ] **Step 1: Add a tooltip action example**

```tsx
<UPTooltip
  buttons={['Archive']}
  onClick={(index) => setTooltipAction(index === 0 ? 'Archived' : 'Copied')}
  showCopy={false}
  text="Actions"
  triggerMode="click"
/>
```

- [ ] **Step 2: Add P21 matrix and compatibility notes**

Document source action index offset, application clipboard ownership,
`UPRoot` requirement, click/longpress/manual mappings, and hover/placement
no-op limits.

- [ ] **Step 3: Run library and example release gates**

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

Expected: all commands exit `0`; `npm pack --dry-run` leaves no tarball and
no dependency changes are introduced.
