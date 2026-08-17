# React Native P15 Row Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `u-row-notice` as `UPRowNotice` with source-compatible string marquee animation, mode icons, no-payload events, and reactive source defaults.

**Architecture:** `UPRowNotice` remains independent from `UPNoticeBar` and `UPColumnNotice`. It measures its clipped content viewport and a single native text node, then uses `Animated.loop(Animated.timing(...))` to move the text from `contentWidth` to `-textWidth` at the source speed. `UP.props.rowNotice` stores frozen source defaults and updates mounted components through the existing external config store.

**Tech Stack:** React 19, React Native 0.86 `Animated`/`Pressable`/`Text`/`View`, existing `UPIcon`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus\components\u-row-notice`.
- Preserve source props/defaults and use PascalCase `UP*` public exports.
- Add `rowNotice` defaults to subscribable `UP.props` plus matching override, source-state, and merge paths so mounted components react to `UP.setConfig()`.
- `text` is a string-only source prop; `onClick` and `onClose` have no payload.
- Use measured native widths and `Animated.loop` with linear motion. Start at `contentWidth`, end at `-textWidth`, and use `((contentWidth + textWidth) / Math.max(1, getPx(speed))) * 1000` milliseconds.
- Restart animation when text, resolved font size, speed, or either measurement changes. Stop old animation during cleanup and unmount.
- `iconNode` replaces the named Vue icon slot. `customClass` remains a deprecated typed no-op.
- Keep source row layout: no added outer padding, 5px icon margins, and source mode icon sizes. Do not alter `UPNoticeBar` or extract a marquee abstraction.
- Do not reproduce source nvue animation, WebView visibility pause behavior, CSS keyframes/classes, or 20-character text splitting. Do not add dependencies.
- Do not reset, clean, delete, commit, or alter unrelated dirty workspace files.

---

## File Structure

- `src/components/row-notice/UPRowNotice.tsx` — public props, source-style layout, measurements, `Animated` lifecycle, and events.
- `src/components/row-notice/index.ts` — local component export barrel.
- `src/components/index.ts` — package component export.
- `src/config/defaults.ts` — `UPRowNoticeDefaults`, `UPProps['rowNotice']`, and frozen source defaults.
- `src/config/store.ts` — override type, resettable source-state copy, and runtime config merge path.
- `tests/components/UPRowNotice.test.tsx` — source layout, animation, event, and config regression tests.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx` — public phase status, compatibility limits, and a live row marquee example.

### Task 1: Establish Failing Source-Compatibility Tests

**Files:**
- Create: `tests/components/UPRowNotice.test.tsx`

**Interfaces:**
- Consumes planned root exports `UP`, `UPRowNotice`, and `UPRoot` from `../../src`.
- Requires test IDs `up-row-notice`, `up-row-notice-content`, `up-row-notice-moving`, `up-row-notice-text`, `up-row-notice-icon`, and `up-row-notice-close`.
- Requires source callback signatures `onClick?: () => void` and `onClose?: () => void`.
- Requires animation calls `Animated.Value#setValue`, `Animated.timing`, `Animated.loop`, loop `start()`, and loop `stop()` to be observable without mocking the `react-native` package entrypoint.

- [ ] **Step 1: Add safe Animated spies and default layout tests**

Create `tests/components/UPRowNotice.test.tsx`. Reuse the React Native Jest
preset's `Animated` mock and replace only its animation factory return values;
do not call `jest.requireActual('react-native')`, which bypasses the preset and
loads unavailable native dev modules.

```tsx
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { UP, UPRowNotice, UPRoot } from '../../src';

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockReset = jest.fn();
const mockTimingAnimation = {
  _isUsingNativeDriver: () => true,
  _startNativeLoop: jest.fn(),
  reset: mockReset,
  start: mockStart,
  stop: mockStop,
} as ReturnType<typeof Animated.timing>;
const mockLoopAnimation = {
  _isUsingNativeDriver: () => true,
  _startNativeLoop: jest.fn(),
  reset: mockReset,
  start: mockStart,
  stop: mockStop,
} as ReturnType<typeof Animated.loop>;

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockReturnValue(mockTimingAnimation);
  jest.spyOn(Animated, 'loop').mockReturnValue(mockLoopAnimation);
  jest.spyOn(Animated.Value.prototype, 'setValue');
});

afterEach(() => {
  jest.restoreAllMocks();
  mockStart.mockClear();
  mockStop.mockClear();
  mockReset.mockClear();
});

it('uses source defaults without starting an unmeasured marquee', () => {
  const screen = renderRoot(<UPRowNotice text="Maintenance begins at 22:00" />);

  expect(screen.getByTestId('up-row-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Maintenance begins at 22:00');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#fdf6ec', justifyContent: 'space-between' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).not.toHaveProperty('paddingHorizontal');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).not.toHaveProperty('paddingVertical');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice-text').props.style)).toEqual(
    expect.objectContaining({ color: '#f9ae3d', fontSize: 14 }),
  );
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(Animated.loop).not.toHaveBeenCalled();
});

it('starts a measured linear source marquee at the configured speed', () => {
  const screen = renderRoot(<UPRowNotice text="Maintenance" />);

  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 180, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 60, x: 0, y: 0 } },
  });

  expect(Animated.Value.prototype.setValue).toHaveBeenLastCalledWith(180);
  expect(Animated.timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ duration: 3000, easing: Easing.linear, toValue: -60, useNativeDriver: true }),
  );
  expect(Animated.loop).toHaveBeenLastCalledWith(mockTimingAnimation);
  expect(mockStart).toHaveBeenCalledTimes(1);
});
```

The second test fixes source formula behavior: `(180 + 60) / 80 * 1000` is
3000ms. The moving view uses its own `onLayout`, not the text node, because it
is the exact transformed width in React Native.

- [ ] **Step 2: Add restart, empty-content, modes, and config tests**

Append these tests. Clear spy history before each focused change so assertions
cover the latest effect, not its initial render:

```tsx
it('stops and restarts when source text, font size, or speed changes', () => {
  const screen = renderRoot(<UPRowNotice speed={80} text="Old" />);

  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 160, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 18, width: 40, x: 0, y: 0 } },
  });
  mockStart.mockClear();
  mockStop.mockClear();
  (Animated.timing as jest.Mock).mockClear();

  screen.rerender(<UPRoot><UPRowNotice fontSize={16} speed={120} text="Updated" /></UPRoot>);
  fireEvent(screen.getByTestId('up-row-notice-content'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 200, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-row-notice-moving'), 'layout', {
    nativeEvent: { layout: { height: 20, width: 100, x: 0, y: 0 } },
  });

  expect(mockStop).toHaveBeenCalled();
  expect(Animated.timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ duration: 2500, toValue: -100 }),
  );
  expect(mockStart).toHaveBeenCalled();

  mockStart.mockClear();
  (Animated.timing as jest.Mock).mockClear();
  screen.rerender(<UPRoot><UPRowNotice text="" /></UPRoot>);
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(mockStart).not.toHaveBeenCalled();
  expect(Animated.Value.prototype.setValue).toHaveBeenLastCalledWith(0);
});

it('maps source click, icon slot, link, and closable behavior', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPRowNotice iconNode={<Text testID="custom-row-notice-icon">Info</Text>} mode="link" onClick={onClick} text="Update" />,
  );

  fireEvent.press(screen.getByTestId('up-row-notice'));
  expect(onClick).toHaveBeenCalledWith();
  expect(screen.getByTestId('custom-row-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);

  screen.rerender(
    <UPRoot><UPRowNotice mode="closable" onClick={onClick} onClose={onClose} text="Update" /></UPRoot>,
  );
  fireEvent.press(screen.getByTestId('up-row-notice-close'), { stopPropagation: jest.fn() });
  expect(onClose).toHaveBeenCalledWith();
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('up-row-notice')).toBeNull();
});

it('reacts to mounted rowNotice defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPRowNotice />);

  act(() => {
    UP.setConfig({ props: { rowNotice: { bgColor: '#102030', speed: 120, text: 'Configured' } } });
  });
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Configured');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030' }),
  );

  screen.rerender(<UPRoot><UPRowNotice bgColor="#abcdef" text="Explicit" /></UPRoot>);
  expect(screen.getByTestId('up-row-notice-text').props.children).toBe('Explicit');
  expect(StyleSheet.flatten(screen.getByTestId('up-row-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#abcdef' }),
  );
});
```

The changed measurement calculation is `(200 + 100) / 120 * 1000 = 2500ms`.
The link mode contains one icon because `iconNode` replaces the usual left icon.
The closable rerender restores the source left volume icon plus close icon but
the test observes behavior through its close control, not font glyph contents.

- [ ] **Step 3: Run the focused test to verify the missing API failure**

Run:

```powershell
npm test -- --runInBand tests/components/UPRowNotice.test.tsx
```

Expected: FAIL because `UPRowNotice` and `UPConfigOverrides.props.rowNotice`
are not exported or typed yet.

### Task 2: Add Config Defaults and Implement `UPRowNotice`

**Files:**
- Create: `src/components/row-notice/UPRowNotice.tsx`
- Create: `src/components/row-notice/index.ts`
- Modify: `src/components/index.ts:13-18`
- Modify: `src/config/defaults.ts:444-553`
- Modify: `src/config/defaults.ts:925-952`
- Modify: `src/config/store.ts:67-99`
- Modify: `src/config/store.ts:156-185`
- Modify: `src/config/store.ts:249-278`

**Interfaces:**
- Produces `UPRowNoticeDefaults`, `UPProps['rowNotice']`, and `UPConfigOverrides['props']['rowNotice']`.
- Produces `UPRowNoticeProps` and `UPRowNotice`.
- Produces package-root `UPRowNotice` and `UPRowNoticeProps` through the existing `src/index.ts` export of `./components`.

- [ ] **Step 1: Add frozen source defaults and all store paths**

Add this declaration after `UPColumnNoticeDefaults` in `src/config/defaults.ts`:

```ts
export type UPRowNoticeDefaults = {
  text: string;
  icon: string;
  mode: string;
  color: string;
  bgColor: string;
  fontSize: number;
  speed: number;
};
```

Add `rowNotice: UPRowNoticeDefaults;` beside `noticeBar` and `columnNotice` in
`UPProps`. Add this frozen table directly after `columnNotice` in
`sourceDefaults.props`:

```ts
rowNotice: Object.freeze({
  text: '',
  icon: 'volume',
  mode: '',
  color: '#f9ae3d',
  bgColor: '#fdf6ec',
  fontSize: 14,
  speed: 80,
}),
```

Add one entry alongside every notification prop path in `src/config/store.ts`:

```ts
// UPConfigOverrides['props']
rowNotice?: Partial<UPProps['rowNotice']>;

// createSourceState().props
rowNotice: { ...sourceDefaults.props.rowNotice },

// setUPConfig().props
rowNotice: { ...state.props.rowNotice, ...overrides.props?.rowNotice },
```

This creates a unique mutable props object for test resets while preserving the
frozen source table and `useSyncExternalStore` publication behavior.

- [ ] **Step 2: Implement the measured marquee and source interaction surface**

Create `src/components/row-notice/UPRowNotice.tsx` with this public API and
helpers:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPRowNoticeProps = {
  text?: string;
  icon?: string;
  mode?: '' | 'link' | 'closable' | string;
  color?: string;
  bgColor?: string;
  fontSize?: UPDimension;
  speed?: UPDimension;
  iconNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: () => void;
  onClose?: () => void;
};

function sourceSpeed(value: UPDimension | undefined): number {
  return Math.max(1, getPx(value ?? 80));
}
```

Merge `useUPConfig().props.rowNotice` with the input object, derive
`text = props.text ?? ''`, and maintain `show`, `containerWidth`, `textWidth`,
and `translateX = useRef(new Animated.Value(0)).current`. The animation effect
must use all source restart inputs:

```tsx
useEffect(() => {
  if (!text || !containerWidth || !textWidth) {
    translateX.setValue(0);
    return undefined;
  }
  translateX.setValue(containerWidth);
  const animation = Animated.loop(
    Animated.timing(translateX, {
      duration: ((containerWidth + textWidth) / sourceSpeed(props.speed)) * 1000,
      easing: Easing.linear,
      toValue: -textWidth,
      useNativeDriver: true,
    }),
  );
  animation.start();
  return () => animation.stop();
}, [containerWidth, props.fontSize, props.speed, text, textWidth, translateX]);
```

Do not put `input` or the merged `props` object in this dependency list, since
they are recreated every render and would restart animation after unrelated
changes. `props.fontSize` is included explicitly because the source watcher
recalculates on font-size changes even before a subsequent layout reports the
new text width.

Use these layout callbacks and close handler:

```tsx
const onContentLayout = (event: LayoutChangeEvent) => {
  const width = event.nativeEvent.layout.width;
  setContainerWidth((previous) => previous === width ? previous : width);
};
const onMovingLayout = (event: LayoutChangeEvent) => {
  const width = event.nativeEvent.layout.width;
  setTextWidth((previous) => previous === width ? previous : width);
};
const close = (event: GestureResponderEvent) => {
  event.stopPropagation();
  setShow(false);
  input.onClose?.();
};
```

Return `null` after close. Otherwise use this source-compatible outer layout;
do not add the `UPNoticeBar` padding:

```tsx
<Pressable
  accessibilityRole={input.onClick ? 'button' : undefined}
  onPress={() => input.onClick?.()}
  style={[
    {
      alignItems: 'center',
      backgroundColor: props.bgColor,
      flexDirection: 'row',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    input.customStyle,
  ]}
  testID="up-row-notice"
>
  {input.iconNode !== undefined ? input.iconNode : props.icon ? (
    <View style={{ marginRight: 5 }} testID="up-row-notice-icon">
      <UPIcon color={props.color} name={props.icon} size={19} />
    </View>
  ) : null}
  <View
    onLayout={onContentLayout}
    style={{ alignItems: 'center', flex: 1, flexDirection: 'row', height: getPx(props.fontSize ?? 14) + 4, overflow: 'hidden' }}
    testID="up-row-notice-content"
  >
    <Animated.View
      onLayout={onMovingLayout}
      style={{ alignSelf: 'flex-start', flexDirection: 'row', transform: [{ translateX }] }}
      testID="up-row-notice-moving"
    >
      <Text numberOfLines={1} style={{ color: props.color, fontSize: getPx(props.fontSize ?? 14) }} testID="up-row-notice-text">
        {text}
      </Text>
    </Animated.View>
  </View>
  {props.mode === 'link' ? <View style={{ marginLeft: 5 }}><UPIcon color={props.color} name="arrow-right" size={17} /></View> : null}
  {props.mode === 'closable' ? (
    <Pressable accessibilityLabel="Close row notice" accessibilityRole="button" hitSlop={8} onPress={close} style={{ marginLeft: 5 }} testID="up-row-notice-close">
      <UPIcon color={props.color} name="close" size={16} />
    </Pressable>
  ) : null}
</Pressable>
```

The single `Text` node deliberately replaces the source's 20-character DOM
splitting workaround. No timer, touch prop, source index, navigation prop, or
manual pause behavior belongs to this component.

- [ ] **Step 3: Add component exports and run focused validation**

Create `src/components/row-notice/index.ts`:

```ts
export * from './UPRowNotice';
```

Add this component barrel near `row`, `notice-bar`, and `column-notice` in
`src/components/index.ts`:

```ts
export * from './row-notice';
```

Run:

```powershell
npm test -- --runInBand tests/components/UPRowNotice.test.tsx
npm run typecheck
```

Expected: PASS. Tests observe source defaults, no unmeasured animation,
measured linear timing, restart/stop behavior, no-payload events, source icon
modes, icon-node replacement, and reactive defaults.

### Task 3: Document P15 and Add an Example

**Files:**
- Modify: `README.md:24-77`
- Modify: `docs/compatibility.md` after `## P14 column notice`
- Modify: `docs/gap-matrix.md:202-210`
- Modify: `example/App.tsx:6-73`
- Modify: `example/App.tsx:127-158`

**Interfaces:**
- Documents `UPRowNotice` as the dedicated source string marquee, separate from `UPNoticeBar` and `UPColumnNotice`.
- Documents width-measured source speed mapping, `iconNode`, no-payload callbacks, and native limits.
- Demonstrates a closable row marquee and source click event in the example app.

- [ ] **Step 1: Add P15 project status to the README**

Insert this link after P14 in `README.md`:

```markdown
- [P15 row notice plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p15-row-notice.md)
```

Append this phase summary after P14:

```markdown
P15 adds `UPRowNotice`, preserving source string marquee measurement, speed,
icon modes, close behavior, and no-payload click events with React Native
`Animated`.
```

- [ ] **Step 2: Add compatibility guide and matrix rows**

Append this section after P14 in `docs/compatibility.md`:

````markdown
## P15 row notice

`UPRowNotice` ports the standalone source `u-row-notice` string marquee. It is
separate from `UPNoticeBar` and `UPColumnNotice`: it accepts one string, measures
the native viewport and text width, then moves from the right edge to past the
left edge at source `speed` (default `80`). `onClick()` and `onClose()` have no
payloads, matching source events.

```tsx
<UPRowNotice
  mode="closable"
  text="Nightly maintenance begins at 22:00."
  onClick={() => openNoticeDetails()}
  onClose={() => setRowNoticeVisible(false)}
/>
```

`iconNode` replaces the named Vue icon slot. Text, font size, and speed changes
restart the measured native animation. React Native `Animated.loop` replaces
source CSS/nvue animation but cannot reproduce WebView visibility pause,
scoped CSS classes, or the web-only 20-character text splitting workaround.
`customClass` remains a typed no-op.
````

Insert this section before `## Deferred Source Components` in
`docs/gap-matrix.md`:

```markdown
## P15 Row Notice

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-row-notice` | string text, icon, speed, click, close | `UPRowNotice`, `onClick()`, `onClose()` | Measured content/text widths drive a source-speed horizontal native Animated loop | Emulated | `tests/components/UPRowNotice.test.tsx` |
| `u-row-notice` | named `icon` slot, `link`/`closable` modes | `iconNode`, `mode` | React node replaces the slot; source arrow, close, and local removal behavior remain | Emulated | `tests/components/UPRowNotice.test.tsx` |
| `u-row-notice` | nvue animation, WebView pause, CSS keyframes/classes, 20-character splitting | Retained `customClass` | Core RN Animated does not expose these source web/nvue runtimes | No-op retained | `src/components/row-notice/UPRowNotice.tsx` |
```

- [ ] **Step 3: Add an interactive source marquee example and validate docs/example**

In `example/App.tsx`, import `UPRowNotice`; add state beside the current notice
example state:

```tsx
const [rowNoticeVisible, setRowNoticeVisible] = useState(true);
const [rowNoticeClicks, setRowNoticeClicks] = useState(0);
```

Render this directly below the `UPColumnNotice` example so all three separate
notice surfaces are visible together:

```tsx
{rowNoticeVisible ? (
  <UPRowNotice
    mode="closable"
    text="P15 measures its native text width for a source-speed marquee."
    onClick={() => setRowNoticeClicks((value) => value + 1)}
    onClose={() => setRowNoticeVisible(false)}
  />
) : (
  <UPButton plain text="Restore row notice" onClick={() => setRowNoticeVisible(true)} />
)}
<Text>Row notice clicks: {rowNoticeClicks}</Text>
```

Run:

```powershell
npm run typecheck
npm run lint
npm run build
Push-Location example
npx tsc --noEmit
npm run lint
npm test -- --runInBand
Pop-Location
```

Expected: every command exits zero.

### Task 4: Run the P15 Full Quality Gate

**Files:**
- Verify: all P15 source, test, documentation, example, spec, and plan files.

**Interfaces:**
- Verifies package-root `UPRowNotice` and `UPRowNoticeProps` exports and that no new runtime dependency was needed.
- Verifies full library/example validation, package dry-run cleanliness, and no whitespace errors while retaining the existing dirty workspace.

- [ ] **Step 1: Run complete library validation**

Run each command in order:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: all test suites, TypeScript, lint, build, package dry-run, and
whitespace validation exit zero.

- [ ] **Step 2: Confirm scope and package artefact cleanliness**

Run:

```powershell
git status --short
git diff -- README.md docs/compatibility.md docs/gap-matrix.md docs/superpowers/specs/2026-07-26-ultra-ui-react-native-p15-row-notice-design.md docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p15-row-notice.md example/App.tsx src/components/row-notice src/components/index.ts src/config/defaults.ts src/config/store.ts tests/components/UPRowNotice.test.tsx
if (Test-Path 'ultra-ui-rn-0.1.0.tgz') { throw 'npm pack --dry-run must not leave a tarball.' }
```

Expected: P15 files are present among the intentionally dirty workspace, and no
package archive exists after the dry run.

## Plan Self-Review

- **Spec coverage:** Task 1 fixes all public source behaviors through tests: defaults, no-padding source layout, source-speed formula, linear native animation, restart/stop lifecycle, empty content, icon replacement, link/close, no-payload events, configuration reactivity, and explicit precedence. Task 2 adds all configuration, exports, layout, animation, and source event code. Task 3 documents the separate component boundary and native limitations and adds a runnable example. Task 4 executes all library and example acceptance gates.
- **Placeholder scan:** Every task identifies exact paths, interfaces, source values, test IDs, code, commands, and expected outcomes. No unspecified follow-up work remains.
- **Type consistency:** `UPRowNoticeDefaults`, `UPProps['rowNotice']`, `UPConfigOverrides['props']['rowNotice']`, `UPRowNoticeProps`, `text`, `fontSize`, `speed`, `iconNode`, `onClick`, and `onClose` have matching names and compatible types throughout.
