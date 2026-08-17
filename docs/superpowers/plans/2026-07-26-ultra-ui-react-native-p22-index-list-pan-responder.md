# P22 Index List PanResponder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-style continuous native rail dragging to `UPIndexList` without regressing measured click navigation or accessibility.

**Architecture:** `UPIndexList` retains group measurement and active state, but centralizes click and drag selection in `activateIndex(index, animated, emitWhenActive)`. A rail `PanResponder` captures only vertical movement greater than 2 px, maps local touch coordinates to clamped rail indexes, and performs non-animated jumps only after the resolved rail key changes.

**Tech Stack:** TypeScript, React 19, React Native core `PanResponder`, `ScrollView`, `Pressable`, `@testing-library/react-native`, Jest.

## Global Constraints

- Work in `D:\Repos\xyito\open\ultra-ui-rn` on `main`; do not create branches, worktrees, commits, resets, cleans, or dependency changes.
- Extend only the current `u-index-list` mapping from uview-plus 3.8.86.
- Existing rail `Pressable` controls remain available for accessibility and ordinary taps.
- A rail press emits the exact source value and makes the current animated measured jump.
- A vertical movement strictly greater than 2 px captures the parent responder; every new resolved index emits once and jumps with `animated: false`.
- Missing group measurements still update active state and emit `onSelect`, but never call `scrollTo`.
- Responder release or termination emits nothing; scroll-derived activation is suspended while dragging.
- Do not add dependencies, a source-style magnifier, global scrolling, or CSS runtime behavior.

---

## File Structure

- `src/components/index-list/UPIndexList.tsx` owns responder creation, rail/item layout measurement, selection, and scroll suspension.
- `tests/components/UPIndexList.test.tsx` covers the new responder contract and preserves click behavior.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx` state and demonstrate the delivered interaction.

## Task 1: Lock Continuous Rail Drag Contracts

**Files:**
- Modify: `tests/components/UPIndexList.test.tsx`

**Interfaces:**
- Consumes: `UPIndexList`, `UPIndexItem`, `UPIndexAnchor`, and `ScrollView` test handles.
- Requires: `up-index-rail` exposes generated native `onMoveShouldSetResponderCapture` and `onResponder*` props from `PanResponder.panHandlers`.
- Produces: regression coverage for capture threshold, bounds clamping, source identity, duplicate suppression, non-animated drag jumps, release silence, and existing click jumps.

- [ ] **Step 1: Add a helper for responder callbacks**

```tsx
function railHandlers(screen: ReturnType<typeof renderRoot>) {
  return screen.getByTestId('up-index-rail').props;
}
```

- [ ] **Step 2: Add a failing threshold, drag, and release test**

Extend `Groups` and `registerGroups` with a `C` group at layout `y: 500`. Add this test:

```tsx
it('captures vertical rail drags, clamps bounds, and skips duplicate selection', () => {
  const onSelect = jest.fn();
  const screen = renderRoot(
    <UPIndexList indexList={['A', 'B', 'C']} onSelect={onSelect}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const scrollTo = jest.spyOn(screen.UNSAFE_getByType(ScrollView).instance, 'scrollTo');
  const rail = railHandlers(screen);

  expect(rail.onMoveShouldSetResponderCapture(responderEvent(2, 1, 0, 2, 0, 3))).toBe(false);
  expect(rail.onMoveShouldSetResponderCapture(responderEvent(3, 2, 0, 3))).toBe(true);
  act(() => {
    rail.onResponderGrant(responderEvent(-10, 3));
    rail.onResponderMove(responderEvent(999, 4));
    rail.onResponderMove(responderEvent(999, 5));
    rail.onResponderRelease({});
  });

  expect(onSelect.mock.calls).toEqual([['A'], ['C']]);
  expect(scrollTo.mock.calls).toEqual([
    [{ animated: false, y: 100 }],
    [{ animated: false, y: 500 }],
  ]);
});
```

Add a `responderEvent` helper with the minimum one-touch history used by React Native `PanResponder`, then add an object-valued rail case that drags to `{ key: 'ObjectB', name: 'Beta' }` and asserts `onSelect.mock.calls[0][0]` is the same object reference. Assert an unregistered drag target emits once and makes no `scrollTo` call.

- [ ] **Step 3: Run focused tests before implementation**

Run: `npm test -- --runInBand tests/components/UPIndexList.test.tsx`

Expected: FAIL because `up-index-rail` has no generated native responder callbacks.

## Task 2: Implement Selection and PanResponder Mapping

**Files:**
- Modify: `src/components/index-list/UPIndexList.tsx`
- Test: `tests/components/UPIndexList.test.tsx`

**Interfaces:**
- Consumes: existing `UPIndexValue`, `getUPIndexValueKey`, group `positions`, configured colors, and `ScrollView` ref.
- Produces: central `activateIndex`, native rail coordinate mapping, responder lifecycle, and unchanged public props.

- [ ] **Step 1: Import `PanResponder` and add stable refs**

```tsx
const activeKeyRef = useRef<string | null>(null);
const draggingRef = useRef(false);
const railHeightRef = useRef(0);
const railItemLayouts = useRef(new Map<number, { height: number; y: number }>());

const setActive = useCallback((key: string | null) => {
  activeKeyRef.current = key;
  setActiveKey(key);
}, []);
```

- [ ] **Step 2: Replace direct rail selection with central selection**

```tsx
const activateIndex = useCallback((index: number, animated: boolean, emitWhenActive: boolean) => {
  if (!values.length) return;
  const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
  const value = values[clampedIndex];
  const key = getUPIndexValueKey(value);
  if (activeKeyRef.current === key && !emitWhenActive) return;
  setActive(key);
  input.onSelect?.(value);
  const y = positions.current.get(key);
  if (y !== undefined) {
    scrollRef.current?.scrollTo({ animated, y: Math.max(0, y - customNavHeight) });
  }
}, [customNavHeight, input, setActive, values]);
```

Make each child `Pressable` call `activateIndex(index, true, true)`. This preserves prior source click behavior when a user presses an already-active rail item.

- [ ] **Step 3: Record rail layouts and resolve a clamped index**

```tsx
const indexAtRailY = useCallback((locationY: number) => {
  const measured = [...railItemLayouts.current.entries()].sort(([first], [second]) => first - second);
  if (measured.length === values.length) {
    for (let index = 0; index < measured.length; index += 1) {
      const [, layout] = measured[index];
      if (locationY <= layout.y + layout.height / 2) return index;
    }
    return values.length - 1;
  }
  const pitch = railHeightRef.current > 0 ? railHeightRef.current / values.length : 18;
  return Math.max(0, Math.min(values.length - 1, Math.floor(locationY / Math.max(1, pitch))));
}, [values.length]);
```

Attach `onLayout` to `up-index-rail` to record height and update a `measureInWindow` rail origin ref. Resolve drag coordinates from `pageY - railWindowY` when both values are available, falling back to `locationY` in layout/test environments. Attach `onLayout` to each `Pressable` rail item to record its `y` and `height`. The retained 16 px item height plus 1 px margins keeps an 18 px no-layout fallback pitch.

- [ ] **Step 4: Attach a parent responder that does not steal taps**

```tsx
const railResponder = useMemo(() => PanResponder.create({
  onMoveShouldSetPanResponder: () => false,
  onMoveShouldSetPanResponderCapture: (_event, gesture) => (
    Math.abs(gesture.dy) > 2 && Math.abs(gesture.dy) >= Math.abs(gesture.dx)
  ),
  onPanResponderGrant: (event) => {
    draggingRef.current = true;
    activateIndex(indexAtRailY(event.nativeEvent.locationY), false, false);
  },
  onPanResponderMove: (event) => {
    activateIndex(indexAtRailY(event.nativeEvent.locationY), false, false);
  },
  onPanResponderRelease: () => { draggingRef.current = false; },
  onPanResponderTerminate: () => { draggingRef.current = false; },
}), [activateIndex, indexAtRailY]);
```

Spread `railResponder.panHandlers` on `up-index-rail` and remove `pointerEvents="box-none"`. At the start of `onScroll`, return when `draggingRef.current` is true. Otherwise derive the next active value through `setActive` so state and ref do not diverge.

- [ ] **Step 5: Run focused tests, typecheck, and lint**

Run:

```powershell
npm test -- --runInBand tests/components/UPIndexList.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit `0`; normal press uses `{ animated: true }`, drag uses `{ animated: false }`, repeated drag points do not emit, and release makes no changes.

## Task 3: Document and Demonstrate Drag Support

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Consumes: completed native drag behavior.
- Produces: user-facing P22 scope and accurate compatibility limits.

- [ ] **Step 1: Update the P18 compatibility section**

Replace the statement that continuous rail dragging is unavailable with text explaining that native `PanResponder` selects each changed source item once, clamps outside rail bounds, and makes non-animated measured jumps. Retain limitations for the source magnifier, exact CSS sticky pinning, CSS classes/styles, and safe-bottom behavior.

- [ ] **Step 2: Replace the P18 matrix limitation row**

```markdown
| `u-index-list` | continuous rail drag and selection | `UPIndexList` PanResponder rail | Vertical drag selects each newly crossed source index once and makes non-animated measured jumps | Emulated | `tests/components/UPIndexList.test.tsx` |
| `u-index-list` family | source enlarged drag indicator, exact CSS sticky pinning, CSS classes/styles, safe-area fix | Retained compatibility props | Core PanResponder has no source magnifier or CSS runtime; sticky remains elevated anchor styling | No-op retained | `src/components/index-list/UPIndexList.tsx` |
```

- [ ] **Step 3: Add README and example evidence**

Add P22 to the README plan list and extend the P18 status line to state that rails provide accessible tap jumps and native continuous vertical dragging.

Add this text immediately after the index-list selected-value output in `example/App.tsx`:

```tsx
<Text>Tap or drag the right rail to jump between registered groups.</Text>
```

- [ ] **Step 4: Build and validate the example**

Run:

```powershell
npm run build
Push-Location example
npx tsc --noEmit
npm run lint
npm test -- --runInBand
Pop-Location
```

Expected: every command exits `0`.

## Task 4: Complete Package Release Gate

**Files:**
- Verify only: P22 implementation, tests, docs, and example

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: release-ready P22 without package artifact or dependency changes.

- [ ] **Step 1: Run full validation**

Run these commands in order: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.

Expected: all commands exit `0`.

- [ ] **Step 2: Verify artifact and dependency hygiene**

Run: `Test-Path ultra-ui-rn-0.1.0.tgz`, `rg -n -i 'panresponder|gesture-handler|reanimated' package.json package-lock.json`, and `git status --short`.

Expected: tarball check is `False`; `PanResponder` adds no dependency; repository status contains only expected existing dirty files and P22 work.

## Plan Self-Review

- Spec coverage: Tasks 1–2 cover threshold capture, bounds clamping, source identity, duplicate suppression, non-animated measured jumps, missing measurement, release behavior, and scroll suspension. Task 3 documents the delivered mapping and retained limitations. Task 4 runs final package validation.
- Placeholder scan: no `TODO`, `TBD`, or generic implementation instructions appear.
- Type consistency: `setActive`, `activateIndex`, and `indexAtRailY` are defined in Task 2 and used consistently throughout the plan.
