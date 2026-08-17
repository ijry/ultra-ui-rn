# React Native P14 Column Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port uview-plus `u-column-notice` as `UPColumnNotice` with source-compatible paged notices, automatic wrapping, icon modes, current-index click events, and reactive defaults.

**Architecture:** Use a paged React Native `ScrollView` with local visibility, index, and horizontal viewport state. Preserve the source template rule `vertical="step ? false : true"`: `step=false` yields vertical 20px pages and `step=true` yields measured horizontal pages. Timer-driven autoplay advances the local index modulo item count and scrolls to the page; native momentum also updates the current index.

**Tech Stack:** React 19, React Native 0.86 `Pressable`/`ScrollView`/`Text`/`View`, existing `UPIcon`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus\components\u-column-notice`.
- Preserve source props/defaults and use PascalCase `UP*` exports.
- Add a source table to subscribable `UP.props` and all override/merge paths so mounted components react to `UP.setConfig()`.
- `step=false` must be vertical and `step=true` horizontal. The unused source computed `mode === 'horizontal'` must have no effect.
- `disableTouch` maps to `scrollEnabled={!disableTouch}`. When text has at least two items, autoplay always advances at `duration` and wraps to index zero.
- `speed` is a typed no-op because upstream declares but never reads it. `customClass` remains a deprecated typed no-op because React Native has no CSS class runtime.
- `iconNode` replaces the named Vue icon slot.
- Do not add native dependencies, a general carousel abstraction, a virtualized list, navigation behavior, or manual infinite-drag emulation.
- Do not reset, clean, delete, commit, or modify unrelated dirty workspace files.

---

## File Structure

- `src/components/column-notice/UPColumnNotice.tsx` — public props, local state, timer, native paging, icons, and callbacks.
- `src/components/column-notice/index.ts` — local export barrel.
- `src/components/index.ts` — public package export.
- `src/config/defaults.ts` — defaults type, `UPProps` member, and frozen source table.
- `src/config/store.ts` — config override type, state initialization, and merge path.
- `tests/components/UPColumnNotice.test.tsx` — deterministic source compatibility tests.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx` — public phase status, behavior limits, and usage sample.

### Task 1: Write Failing Source-Compatibility Tests

**Files:**
- Create: `tests/components/UPColumnNotice.test.tsx`

**Interfaces:**
- Consumes planned root exports `UP`, `UPColumnNotice`, and `UPRoot` from `../../src`.
- Requires test IDs `up-column-notice`, `up-column-notice-scroll`, `up-column-notice-page-{index}`, `up-column-notice-icon`, and `up-column-notice-close`.
- Requires `UPColumnNoticeProps` for `text`, `icon`, `mode`, `color`, `bgColor`, `fontSize`, `speed`, `step`, `duration`, `disableTouch`, `justifyContent`, `iconNode`, `customStyle`, `customClass`, `onClick`, and `onClose`.

- [ ] **Step 1: Mock `ScrollView` and test source default rendering**

Create the test file. Mock `ScrollView` before component imports so the ref
records scroll commands in `mockScrollTo` while the test renderer sees a native
`View` host:

```tsx
import React from 'react';

const mockScrollTo = jest.fn();

jest.mock('react-native', () => {
  const ReactModule = require('react') as typeof import('react');
  const actual = jest.requireActual<typeof import('react-native')>('react-native');
  const ScrollView = ReactModule.forwardRef<
    { scrollTo: typeof mockScrollTo },
    React.ComponentProps<typeof actual.ScrollView>
  >(({ children, ...props }, ref) => {
    ReactModule.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
    return ReactModule.createElement(
      actual.View,
      props as React.ComponentProps<typeof actual.View>,
      children,
    );
  });
  return { ...actual, ScrollView };
});

import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { UP, UPColumnNotice, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  mockScrollTo.mockClear();
  jest.useRealTimers();
});

it('uses source default colors, vertical pages, volume icon, and disabled touch', () => {
  const screen = renderRoot(<UPColumnNotice text={['First', 'Second']} />);

  expect(screen.getByTestId('up-column-notice-icon')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(screen.getByText('First')).toBeTruthy();
  expect(screen.getByTestId('up-column-notice-scroll').props).toEqual(
    expect.objectContaining({ horizontal: false, pagingEnabled: true, scrollEnabled: false }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#fdf6ec' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice-page-0').props.style)).toEqual(
    expect.objectContaining({ height: 20, justifyContent: 'flex-start' }),
  );
  expect(StyleSheet.flatten(screen.getByText('First').props.style)).toEqual(
    expect.objectContaining({ color: '#f9ae3d', fontSize: 14 }),
  );
});

it('maps step=true to horizontal paging, enables touch, and replaces the icon slot', () => {
  const screen = renderRoot(
    <UPColumnNotice
      disableTouch={false}
      iconNode={<Text testID="custom-column-notice-icon">News</Text>}
      step
      text={['First', 'Second']}
    />,
  );

  expect(screen.getByTestId('up-column-notice-scroll').props).toEqual(
    expect.objectContaining({ horizontal: true, pagingEnabled: true, scrollEnabled: true }),
  );
  expect(screen.getByTestId('custom-column-notice-icon')).toBeTruthy();
});
```

- [ ] **Step 2: Test duration rotation, wrap, momentum, and reset**

Append these source-state tests:

```tsx
it('cycles by duration, wraps to zero, and does not use speed for timing', () => {
  jest.useFakeTimers();
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPColumnNotice duration={100} onClick={onClick} speed={1} text={['First', 'Second', 'Third']} />,
  );

  act(() => { jest.advanceTimersByTime(100); });
  fireEvent.press(screen.getByTestId('up-column-notice'));
  expect(onClick).toHaveBeenLastCalledWith(1);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 20 }));

  act(() => { jest.advanceTimersByTime(200); });
  fireEvent.press(screen.getByTestId('up-column-notice'));
  expect(onClick).toHaveBeenLastCalledWith(0);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 0 }));
});

it('uses a native momentum page as the source click index', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPColumnNotice onClick={onClick} text={['First', 'Second', 'Third']} />);

  fireEvent(screen.getByTestId('up-column-notice-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0, y: 40 }, layoutMeasurement: { height: 20, width: 320 } },
  });
  fireEvent.press(screen.getByTestId('up-column-notice'));

  expect(onClick).toHaveBeenCalledWith(2);
});

it('resets index and scroll position when text changes', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPColumnNotice onClick={onClick} text={['First', 'Second']} />);

  fireEvent(screen.getByTestId('up-column-notice-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0, y: 20 }, layoutMeasurement: { height: 20, width: 320 } },
  });
  screen.rerender(<UPRoot><UPColumnNotice onClick={onClick} text={['Replacement']} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-column-notice'));

  expect(onClick).toHaveBeenLastCalledWith(0);
  expect(mockScrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ x: 0, y: 0 }));
});
```

The timer sequence must be `0 → 1 → 2 → 0` at three 100ms ticks. `speed={1}`
must not alter the source duration timing.

- [ ] **Step 3: Test modes and mounted config reactivity**

Append these tests:

```tsx
it('renders link and closable modes, and close removes only this notice surface', () => {
  const onClose = jest.fn();
  const closable = renderRoot(<UPColumnNotice mode="closable" onClose={onClose} text={['First']} />);

  fireEvent.press(closable.getByTestId('up-column-notice-close'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(closable.queryByTestId('up-column-notice')).toBeNull();

  const link = renderRoot(<UPColumnNotice mode="link" text={['First']} />);
  expect(link.getAllByTestId('up-icon')).toHaveLength(2);
});

it('reacts to mounted columnNotice defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPColumnNotice />);

  act(() => {
    UP.setConfig({ props: { columnNotice: { bgColor: '#102030', duration: 75, text: ['Configured'] } } });
  });
  expect(screen.getByText('Configured')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030' }),
  );

  screen.rerender(<UPRoot><UPColumnNotice bgColor="#abcdef" text={['Explicit']} /></UPRoot>);
  expect(screen.getByText('Explicit')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-column-notice').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#abcdef' }),
  );
});
```

The close handler must stop propagation, so it cannot invoke outer `onClick`.

- [ ] **Step 4: Run focused tests to verify expected failure**

Run:

```powershell
npm test -- --runInBand tests/components/UPColumnNotice.test.tsx
```

Expected: FAIL because `UPColumnNotice` and `UPConfigOverrides.props.columnNotice`
do not exist.

### Task 2: Add Reactive Defaults and Implement the Component

**Files:**
- Create: `src/components/column-notice/UPColumnNotice.tsx`
- Create: `src/components/column-notice/index.ts`
- Modify: `src/components/index.ts:13-17`
- Modify: `src/config/defaults.ts:444-552`
- Modify: `src/config/defaults.ts:925-950`
- Modify: `src/config/store.ts:73-98`
- Modify: `src/config/store.ts:156-184`
- Modify: `src/config/store.ts:249-277`

**Interfaces:**
- Produces `UPColumnNoticeDefaults`, `UPProps['columnNotice']`, and `UPConfigOverrides['props']['columnNotice']`.
- Produces `UPColumnNoticeProps` with `onClick?: (index: number) => void` and `onClose?: () => void`.
- Produces root exports `UPColumnNotice` and `UPColumnNoticeProps` through the existing root component re-export.

- [ ] **Step 1: Add source defaults and config-store entries**

Add this after `UPNoticeBarDefaults` in `src/config/defaults.ts`:

```ts
export type UPColumnNoticeDefaults = {
  text: readonly string[];
  icon: string;
  mode: string;
  color: string;
  bgColor: string;
  fontSize: number;
  speed: number;
  step: boolean;
  duration: number;
  disableTouch: boolean;
  justifyContent: string;
};
```

Add `columnNotice: UPColumnNoticeDefaults;` beside `noticeBar` in `UPProps`.
Add this immediately after `noticeBar` in `sourceDefaults.props`:

```ts
columnNotice: Object.freeze({
  text: Object.freeze([]) as readonly string[],
  icon: 'volume',
  mode: '',
  color: '#f9ae3d',
  bgColor: '#fdf6ec',
  fontSize: 14,
  speed: 80,
  step: false,
  duration: 1500,
  disableTouch: true,
  justifyContent: 'flex-start',
}),
```

Add these matching entries next to each `noticeBar` path in `src/config/store.ts`:

```ts
// UPConfigOverrides['props']
columnNotice?: Partial<UPProps['columnNotice']>;

// createSourceState().props
columnNotice: { ...sourceDefaults.props.columnNotice },

// setUPConfig().props
columnNotice: { ...state.props.columnNotice, ...overrides.props?.columnNotice },
```

- [ ] **Step 2: Implement paged rendering and source state transitions**

Create `src/components/column-notice/UPColumnNotice.tsx` with these imports,
public API, and helpers:

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPColumnNoticeProps = {
  text?: readonly string[];
  icon?: string;
  mode?: '' | 'link' | 'closable' | string;
  color?: string;
  bgColor?: string;
  fontSize?: UPDimension;
  speed?: UPDimension;
  step?: boolean;
  duration?: UPDimension;
  disableTouch?: boolean;
  justifyContent?: ViewStyle['justifyContent'] | string;
  iconNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (index: number) => void;
  onClose?: () => void;
};

type NoticeViewport = { width: number };

function number(value: UPDimension | undefined, fallback: number): number {
  const result = Number.parseFloat(String(value ?? fallback));
  return Number.isFinite(result) ? result : fallback;
}

function clampIndex(value: number, length: number): number {
  return length > 0 ? Math.max(0, Math.min(length - 1, value)) : 0;
}
```

Merge config with `const props = { ...useUPConfig().props.columnNotice,
...input } as UPColumnNoticeProps;`. Use `texts = props.text ?? []`,
`pageHeight = 20`, a `ScrollView` ref, state for `show`, `currentIndex`, and
`viewport: NoticeViewport`. Use this transition code:

```tsx
const pageSpan = props.step ? viewport.width : pageHeight;
const scrollToIndex = useCallback((index: number, animated = true) => {
  if (!pageSpan) return;
  scrollRef.current?.scrollTo({
    animated,
    x: props.step ? index * pageSpan : 0,
    y: props.step ? 0 : index * pageSpan,
  });
}, [pageSpan, props.step]);

useEffect(() => {
  setCurrentIndex(0);
  scrollToIndex(0, false);
}, [scrollToIndex, texts]);

useEffect(() => {
  if (texts.length < 2) return undefined;
  const timer = setInterval(() => {
    setCurrentIndex((previous) => {
      const next = (clampIndex(previous, texts.length) + 1) % texts.length;
      scrollToIndex(next);
      return next;
    });
  }, Math.max(1, number(props.duration, 1500)));
  return () => clearInterval(timer);
}, [props.duration, scrollToIndex, texts.length]);
```

Derive native scrolling index from its actual axis and stop propagation on close:

```tsx
const onLayout = (event: LayoutChangeEvent) => {
  const width = event.nativeEvent.layout.width;
  setViewport((previous) => previous.width === width ? previous : { width });
};

const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  const span = props.step ? event.nativeEvent.layoutMeasurement.width : event.nativeEvent.layoutMeasurement.height;
  const offset = props.step ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
  if (span) setCurrentIndex(clampIndex(Math.round(offset / span), texts.length));
};

const close = (event: GestureResponderEvent) => {
  event.stopPropagation();
  setShow(false);
  input.onClose?.();
};
```

Return `null` after close. Otherwise use an outer `Pressable` with source row
style, `testID="up-column-notice"`, and
`onPress={() => input.onClick?.(currentIndex)}`. It renders `input.iconNode`
when supplied; otherwise it renders the source `UPIcon` inside
`testID="up-column-notice-icon"` when `props.icon` is nonempty.

Render the native pager as follows:

```tsx
<ScrollView
  horizontal={props.step === true}
  onLayout={onLayout}
  onMomentumScrollEnd={onMomentumScrollEnd}
  pagingEnabled
  ref={scrollRef}
  scrollEnabled={!props.disableTouch}
  showsHorizontalScrollIndicator={false}
  showsVerticalScrollIndicator={false}
  style={{ flex: 1, height: pageHeight }}
  testID="up-column-notice-scroll"
>
  {texts.map((item, index) => (
    <View
      key={`${item}-${index}`}
      style={{ alignItems: 'center', height: pageHeight, justifyContent: props.justifyContent as ViewStyle['justifyContent'], width: props.step ? viewport.width || '100%' : '100%' }}
      testID={`up-column-notice-page-${index}`}
    >
      <Text numberOfLines={1} style={{ color: props.color, fontSize: getPx(props.fontSize ?? 14) }}>{item}</Text>
    </View>
  ))}
</ScrollView>
```

Render `UPIcon name="arrow-right" size={17}` for link mode. Render a nested
`Pressable testID="up-column-notice-close" onPress={close}` containing
`UPIcon name="close" size={16}` for closable mode. All icons use source
`color`. Do not read `speed`, add horizontal-mode behavior, or emulate manual
circular dragging beyond timer-driven wrapping.

- [ ] **Step 3: Export P14 and run focused validation**

Create `src/components/column-notice/index.ts`:

```ts
export * from './UPColumnNotice';
```

Add this near other component barrels in `src/components/index.ts`:

```ts
export * from './column-notice';
```

Run:

```powershell
npm test -- --runInBand tests/components/UPColumnNotice.test.tsx
npm run typecheck
```

Expected: PASS. Vertical timer commands use `y`, horizontal commands use `x`,
timer progression wraps, native momentum changes click index, close hides, and
mounted configuration updates render.

### Task 3: Document Compatibility and Add an Example

**Files:**
- Modify: `README.md:24-74`
- Modify: `docs/compatibility.md` after `## P13 choose`
- Modify: `docs/gap-matrix.md:194-202`
- Modify: `example/App.tsx:6-71`
- Modify: `example/App.tsx:86-140`

**Interfaces:**
- Documents `step`, `disableTouch`, timer wrapping, `iconNode`, source `speed` no-op, source unused horizontal computed state, and manual native limits.
- Demonstrates `onClick(index)` and `onClose()` without implying inactive behavior.

- [ ] **Step 1: Add P14 to README**

Insert after P13:

```markdown
- [P14 column notice plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p14-column-notice.md)
```

Append after the P13 summary:

```markdown
P14 adds `UPColumnNotice`, preserving source `step` paging direction, timed
notice cycling, touch configuration, icon modes, and current-index click events
with React Native core.
```

- [ ] **Step 2: Add guide section and gap-matrix rows**

Append this to `docs/compatibility.md` after P13:

````markdown
## P14 column notice

`UPColumnNotice` ports `u-column-notice` as a paged native notice list. Source
template `vertical="step ? false : true"` makes default `step={false}` vertical;
`step` switches to horizontal paging. `disableTouch` maps to native
`ScrollView.scrollEnabled`, so the source default disables manual swiping.

```tsx
<UPColumnNotice
  mode="closable"
  text={['Deployment completed', 'A new report is available']}
  onClick={(index) => openNotice(index)}
  onClose={() => setNoticeVisible(false)}
/>
```

With two or more items, the component advances every `duration` (default 1500)
and timer progression wraps to the first notice. Native manual paging stops at
physical edges; core React Native cannot exactly reproduce source swiper's
infinite drag or CSS transition. `iconNode` replaces the named Vue icon slot.
`speed` remains accepted but inactive because source never reads it. The unused
source `mode === 'horizontal'` computed branch is not mapped; only `step`
controls direction. CSS classes remain unavailable.
````

Insert before `## Deferred Source Components` in `docs/gap-matrix.md`:

```markdown
## P14 Column Notice

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-column-notice` | `text`, `step`, `duration`, `disableTouch`, `click` | `UPColumnNotice`, `onClick(index)` | `step=false` vertical, `step=true` horizontal; duration wraps and disableTouch controls scrolling | Emulated | `tests/components/UPColumnNotice.test.tsx` |
| `u-column-notice` | named `icon` slot, `link`/`closable`, `close` | `iconNode`, `mode`, `onClose` | React node replaces Vue slot; source icons and close/removal behavior remain | Emulated | `tests/components/UPColumnNotice.test.tsx` |
| `u-column-notice` | `speed`, unused horizontal computed state, circular dragging, CSS classes | Retained `speed`, `customClass` | Speed and unused direction are no-ops; exact infinite drag/CSS transitions are unavailable with core ScrollView | No-op retained | `src/components/column-notice/UPColumnNotice.tsx` |
```

- [ ] **Step 3: Add interactive example and run documentation checks**

In `example/App.tsx`, import `UPColumnNotice`, add state beside `chooseIndex`,
and change the visible title:

```tsx
const [columnNoticeVisible, setColumnNoticeVisible] = useState(true);
const [columnNoticeIndex, setColumnNoticeIndex] = useState(0);

<Text style={styles.title}>ultra-ui-rn / uview-plus P14 essentials</Text>
```

Render this directly below sticky `UPNoticeBar`:

```tsx
{columnNoticeVisible ? (
  <UPColumnNotice
    mode="closable"
    text={['P14 default step=false pages vertically.', 'Swipe can be enabled with disableTouch={false}.']}
    onClick={setColumnNoticeIndex}
    onClose={() => setColumnNoticeVisible(false)}
  />
) : (
  <UPButton plain text="Restore column notice" onClick={() => setColumnNoticeVisible(true)} />
)}
<Text>Selected column notice index: {columnNoticeIndex}</Text>
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

### Task 4: Run the P14 Full Quality Gate

**Files:**
- Verify: all P14 source, test, documentation, example, spec, and plan files.

**Interfaces:**
- Verifies root `UPColumnNotice` and `UPColumnNoticeProps` exports without new runtime dependencies.
- Verifies package dry-run leaves no archive and scope inspection preserves the dirty workspace.

- [ ] **Step 1: Run complete library validation**

Run in order:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: Jest, TypeScript, lint, build, package dry-run, and whitespace checks
all exit zero.

- [ ] **Step 2: Confirm scope and package artefact cleanliness**

Run:

```powershell
git status --short
git diff -- README.md docs/compatibility.md docs/gap-matrix.md docs/superpowers/specs/2026-07-26-ultra-ui-react-native-p14-column-notice-design.md docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p14-column-notice.md example/App.tsx src/components/column-notice src/components/index.ts src/config/defaults.ts src/config/store.ts tests/components/UPColumnNotice.test.tsx
if (Test-Path 'ultra-ui-rn-0.1.0.tgz') { throw 'npm pack --dry-run must not leave a tarball.' }
```

Expected: show P14 files while retaining pre-existing dirty state, and confirm
package dry-run created no archive.

## Plan Self-Review

- **Spec coverage:** Task 1 covers defaults, orientation, touch, slot replacement, timer wrapping, native momentum, text reset, modes, config precedence, and inert speed. Task 2 covers configuration, exports, state, events, and rendering. Task 3 covers required docs and example. Task 4 runs every acceptance check.
- **Placeholder scan:** Every task contains concrete files, interfaces, test IDs, source values, code, commands, and expected outcomes. No follow-up work is unspecified.
- **Type consistency:** `UPColumnNoticeDefaults`, `UPProps['columnNotice']`, `UPConfigOverrides['props']['columnNotice']`, `UPColumnNoticeProps`, `onClick`, `onClose`, `iconNode`, `duration`, `step`, and `disableTouch` retain compatible names and types across tasks.
