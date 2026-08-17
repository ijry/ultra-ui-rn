# P28 Navigation and Cate Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible React Native `UPNavbar`, `UPNavbarMini`, and `UPCateTab` components with callback-owned routing and native `ScrollView` category coordination.

**Architecture:** `UPNavbar` and `UPNavbarMini` are focused native surfaces built from `View`, `Text`, `Pressable`, `BackHandler`, `UPIcon`, `UPLine`, and `UPStatusBar`. `UPCateTab` owns left/right scroll refs, section measurements, controlled/uncontrolled current resolution, and render-prop replacements for Vue slots. Each component reads reactive defaults through `useUPConfig()` and lets explicit props win.

**Tech Stack:** React 19, React Native 0.86 core, TypeScript 5.9, Jest, React Native Testing Library, existing `UPIcon`, `UPLine`, `UPStatusBar`, and `UPImage` primitives.

## Global Constraints

- Work directly on `main`; do not create branches or worktrees.
- Do not commit, stage, push, reset, clean, or otherwise alter git history/state.
- Add no dependency; use existing React Native and package primitives only.
- Edit repository files only with `apply_patch`.
- Preserve source public component and prop names where React Native has a direct mapping.
- Routing remains owned by the host app through callbacks.
- `UPNavbar` left press emits `onLeftClick` first; `autoBack` is opt-in and maps to `BackHandler.exitApp()`.
- `UPNavbarMini` home press emits `onHomeClick({ homeUrl, event })`; `homeUrl` never triggers internal routing.
- `UPCateTab` must support `mode="follow"` and `mode="tab"`.
- Vue slots map to React render props; CSS classes, hover classes, Web/NVue layout behavior, `uni.navigateBack`, and `uni.reLaunch` are documented compatibility limits.
- Configuration must merge `useUPConfig().props.<family>` first and explicit component props last, and must react to `UP.setConfig` updates.
- All interactive controls require stable test IDs and accessible roles, labels, and selected/disabled state where applicable.
- The root `tsconfig.json` deliberately excludes `example/`; do not introduce an example-specific compiler configuration solely to satisfy a standalone compiler invocation.

## File Structure

- Create `src/components/navbar/types.ts`: public `UPNavbarProps`, shared nav event aliases, and React Native style escape hatches.
- Create `src/components/navbar/UPNavbar.tsx`: full-width source navbar layout, fixed placeholder, safe-area handling, left/right callbacks, and opt-in `BackHandler.exitApp`.
- Create `src/components/navbar/index.ts`: navbar barrel export.
- Create `tests/components/UPNavbar.test.tsx`: navbar render, style, callback, `autoBack`, and config tests.
- Create `src/components/navbar-mini/types.ts`: public `UPNavbarMiniProps` and `UPNavbarMiniHomePayload`.
- Create `src/components/navbar-mini/UPNavbarMini.tsx`: capsule navbar layout, back/home regions, divider, safe-area handling, callbacks, and opt-in `BackHandler.exitApp`.
- Create `src/components/navbar-mini/index.ts`: navbar-mini barrel export.
- Create `tests/components/UPNavbarMini.test.tsx`: mini navbar render, event, payload, custom render, and config tests.
- Create `src/components/cate-tab/types.ts`: public category item, mode, render-prop payload, and component prop types.
- Create `src/components/cate-tab/UPCateTab.tsx`: vertical left menu, right pane, `follow` scroll syncing, `tab` single-section mode, default item grid, render props, and controlled state.
- Create `src/components/cate-tab/index.ts`: cate-tab barrel export.
- Create `tests/components/UPCateTab.test.tsx`: empty data, controlled/uncontrolled state, click sync, right scroll sync, `tab` mode, render props, and config tests.
- Modify `src/config/defaults.ts`: add `UPNavbarDefaults`, `UPNavbarMiniDefaults`, `UPCateTabDefaults`, `UPProps` keys, and frozen source default tables.
- Modify `src/config/store.ts`: add override typing, source-state cloning, and merge support for `navbar`, `navbarMini`, and `cateTab`.
- Modify `src/components/index.ts`: export the three new component families.
- Modify `example/App.tsx`: add compact navbar and category tab examples.
- Modify `docs/compatibility.md`: document P28 APIs, route ownership, slot-to-render-prop mapping, and `autoBack` limit.
- Modify `docs/gap-matrix.md`: add P28 support rows.

---

### Task 1: Implement `UPNavbar`

**Files:**
- Create: `src/components/navbar/types.ts`
- Create: `src/components/navbar/UPNavbar.tsx`
- Create: `src/components/navbar/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `tests/components/UPNavbar.test.tsx`

**Interfaces:**
- Produces `UPNavbarProps`.
- Produces `UPNavbarPressEvent = Parameters<NonNullable<React.ComponentProps<typeof Pressable>['onPress']>>[0]`.
- Produces `UPNavbar` with `testID="up-navbar"`, `up-navbar-placeholder`, `up-navbar-inner`, `up-navbar-content`, `up-navbar-left`, `up-navbar-title`, and `up-navbar-right`.
- Produces `UP.props.navbar` and `UPConfigOverrides['props']['navbar']`.
- Consumes `UPIcon`, `UPStatusBar`, `useUPConfig`, `useUPTheme`, and `getPx`.

- [ ] **Step 1: Write the failing navbar tests**

Create `tests/components/UPNavbar.test.tsx`:

```tsx
import React from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot } from '../../src';
import { UPNavigationBar, UPNavbar } from '../../src/components/navbar';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  UP.resetConfig();
  jest.restoreAllMocks();
});

it('renders the source default left icon and centered title', () => {
  const screen = renderRoot(<UPNavbar title="订单详情" />);

  expect(screen.getByTestId('up-navbar')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-left')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('订单详情');
  expect(screen.queryByTestId('up-navbar-right')).toBeNull();
});

it('renders left and right text/icon areas and emits ordered callbacks', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPNavbar
      leftText="返回"
      onLeftClick={() => events.push('left')}
      onRightClick={() => events.push('right')}
      rightIcon="setting"
      rightText="设置"
      title="设置页"
    />,
  );

  fireEvent.press(screen.getByTestId('up-navbar-left'));
  fireEvent.press(screen.getByTestId('up-navbar-right'));

  expect(events).toEqual(['left', 'right']);
  expect(screen.getByText('返回')).toBeTruthy();
  expect(screen.getByText('设置')).toBeTruthy();
});

it('uses fixed placeholder and border styles from source-like props', () => {
  const screen = renderRoot(<UPNavbar border fixed height="48px" placeholder title="固定" />);

  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-placeholder').props.style)).toEqual(
    expect.objectContaining({ height: expect.any(Number) }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-inner').props.style)).toEqual(
    expect.objectContaining({ left: 0, position: 'absolute', right: 0, top: 0, zIndex: 11 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-content').props.style)).toEqual(
    expect.objectContaining({ borderBottomWidth: 1, height: 48 }),
  );
});

it('runs left callback before opt-in BackHandler exitApp', () => {
  const events: string[] = [];
  const exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  const screen = renderRoot(<UPNavbar autoBack onLeftClick={() => events.push('left')} title="返回" />);

  fireEvent.press(screen.getByTestId('up-navbar-left'));

  expect(events).toEqual(['left']);
  expect(exitApp).toHaveBeenCalledTimes(1);
});

it('supports custom render nodes and reactive config defaults', () => {
  const screen = renderRoot(
    <UPNavbar
      renderCenter={() => <Text>Custom center</Text>}
      renderLeft={() => <Text>Custom left</Text>}
      renderRight={() => <Text>Custom right</Text>}
    />,
  );

  expect(screen.getByText('Custom center')).toBeTruthy();
  expect(screen.getByText('Custom left')).toBeTruthy();
  expect(screen.getByText('Custom right')).toBeTruthy();

  act(() => {
    UP.setConfig({ props: { navbar: { bgColor: '#112233', title: 'Configured' } } });
  });

  screen.rerender(<UPRoot><UPNavbar /></UPRoot>);
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('Configured');
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-inner').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#112233' }),
  );
});

it('keeps the legacy UPNavigationBar alias source-compatible', () => {
  const screen = renderRoot(<UPNavigationBar title="Alias" />);
  expect(screen.getByTestId('up-navbar-title').props.children).toBe('Alias');
});
```

- [ ] **Step 2: Run the focused navbar test to verify failure**

Run: `npm test -- --runTestsByPath tests/components/UPNavbar.test.tsx`

Expected: FAIL because `UPNavbar`, `UPNavigationBar`, and navbar config defaults do not exist.

- [ ] **Step 3: Add navbar defaults and config merge support**

In `src/config/defaults.ts`, add the type near neighboring component defaults:

```ts
export type UPNavbarDefaults = {
  safeAreaInsetTop: boolean;
  placeholder: boolean;
  fixed: boolean;
  border: boolean;
  leftIcon: string;
  leftText: string;
  rightText: string;
  rightIcon: string;
  title: string | number;
  titleColor: string;
  bgColor: string;
  statusBarBgColor: string;
  titleWidth: string | number;
  height: string | number;
  leftIconSize: string | number;
  leftIconColor: string;
  autoBack: boolean;
  titleStyle: Record<string, never>;
};
```

Add `navbar: UPNavbarDefaults;` to `UPProps`. Add the frozen defaults before `tabbar` or near other navigation defaults:

```ts
navbar: Object.freeze({
  safeAreaInsetTop: true,
  placeholder: false,
  fixed: false,
  border: false,
  leftIcon: 'arrow-left',
  leftText: '',
  rightText: '',
  rightIcon: '',
  title: '',
  titleColor: '',
  bgColor: '#ffffff',
  statusBarBgColor: '',
  titleWidth: '400rpx',
  height: '44px',
  leftIconSize: '20px',
  leftIconColor: '#303133',
  autoBack: false,
  titleStyle: Object.freeze({}),
}),
```

In `src/config/store.ts`, add:

```ts
navbar?: Partial<UPProps['navbar']>;
```

Then clone and merge it:

```ts
navbar: { ...sourceDefaults.props.navbar },
navbar: { ...state.props.navbar, ...overrides.props?.navbar },
```

- [ ] **Step 4: Implement navbar types**

Create `src/components/navbar/types.ts`:

```ts
import React from 'react';
import { Pressable, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';

export type UPNavbarPressEvent = Parameters<NonNullable<React.ComponentProps<typeof Pressable>['onPress']>>[0];

export type UPNavbarProps = {
  safeAreaInsetTop?: boolean;
  placeholder?: boolean;
  fixed?: boolean;
  border?: boolean;
  leftIcon?: string;
  leftText?: string;
  rightText?: string;
  rightIcon?: string;
  title?: string | number;
  titleColor?: string;
  bgColor?: string;
  statusBarBgColor?: string;
  titleWidth?: UPDimension;
  height?: UPDimension;
  leftIconSize?: UPDimension;
  leftIconColor?: string;
  autoBack?: boolean;
  titleStyle?: StyleProp<TextStyle> | string;
  renderLeft?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  customClass?: string;
  onLeftClick?: (event: UPNavbarPressEvent) => void;
  onRightClick?: (event: UPNavbarPressEvent) => void;
};
```

`left`, `center`, and `right` are React node aliases for simple slot migration. `renderLeft`, `renderCenter`, and `renderRight` win over node aliases when both are supplied.

- [ ] **Step 5: Implement `UPNavbar`**

Create `src/components/navbar/UPNavbar.tsx`:

```tsx
import React, { useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx } from '../../utils';
import { UPIcon } from '../icon';
import { UPStatusBar } from '../status-bar';
import type { UPNavbarPressEvent, UPNavbarProps } from './types';

export type { UPNavbarProps } from './types';

function flattenTitleStyle(value: UPNavbarProps['titleStyle']): TextStyle | undefined {
  return typeof value === 'string' ? undefined : StyleSheet.flatten(value);
}

export function UPNavbar(input: UPNavbarProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.navbar, ...input } as UPNavbarProps;
  const { colors } = useUPTheme();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(getPx(props.height ?? 44));
  const height = getPx(props.height ?? 44);
  const titleWidth = getPx(props.titleWidth ?? 0);
  const bgColor = props.bgColor || '#ffffff';
  const titleColor = props.titleColor || colors.mainColor;
  const leftColor = props.leftIconColor || colors.mainColor;
  const fixed = Boolean(props.fixed);
  const placeholder = fixed && Boolean(props.placeholder);
  const leftContent = input.renderLeft?.() ?? input.left ?? (
    <>
      {props.leftIcon ? <UPIcon color={leftColor} name={props.leftIcon} size={props.leftIconSize} /> : null}
      {props.leftText ? <Text style={[styles.leftText, { color: leftColor }]}>{props.leftText}</Text> : null}
    </>
  );
  const centerContent = input.renderCenter?.() ?? input.center ?? (
    <Text numberOfLines={1} style={[styles.title, { color: titleColor, width: titleWidth || undefined }, flattenTitleStyle(props.titleStyle), input.titleTextStyle]} testID="up-navbar-title">
      {String(props.title ?? '')}
    </Text>
  );
  const rightVisible = Boolean(input.renderRight || input.right || props.rightIcon || props.rightText);
  const rightContent = input.renderRight?.() ?? input.right ?? (
    <>
      {props.rightIcon ? <UPIcon color={colors.mainColor} name={props.rightIcon} size={20} /> : null}
      {props.rightText ? <Text style={[styles.rightText, { color: colors.mainColor }]}>{props.rightText}</Text> : null}
    </>
  );
  const onInnerLayout = (event: LayoutChangeEvent) => setContentHeight(event.nativeEvent.layout.height);
  const onLeftPress = (event: UPNavbarPressEvent) => {
    input.onLeftClick?.(event);
    if (props.autoBack) BackHandler.exitApp();
  };
  const innerStyle: ViewStyle = {
    backgroundColor: bgColor,
    left: fixed ? 0 : undefined,
    position: fixed ? 'absolute' : 'relative',
    right: fixed ? 0 : undefined,
    top: fixed ? 0 : undefined,
    zIndex: fixed ? 11 : undefined,
  };

  return (
    <View style={[input.customStyle]} testID="up-navbar">
      {placeholder ? <View style={{ height: contentHeight + statusBarHeight }} testID="up-navbar-placeholder" /> : null}
      <View onLayout={onInnerLayout} style={[innerStyle, input.innerStyle]} testID="up-navbar-inner">
        {props.safeAreaInsetTop ? <UPStatusBar bgColor={props.statusBarBgColor || bgColor} onUpdateHeight={setStatusBarHeight} /> : null}
        <View style={[styles.content, { borderBottomColor: colors.borderColor, borderBottomWidth: props.border ? StyleSheet.hairlineWidth : 0, height }, input.contentStyle]} testID="up-navbar-content">
          <Pressable accessibilityLabel={props.leftText || '返回'} accessibilityRole="button" onPress={onLeftPress} style={[styles.left, input.leftStyle]} testID="up-navbar-left">
            {leftContent}
          </Pressable>
          {centerContent}
          {rightVisible ? (
            <Pressable accessibilityLabel={props.rightText || '右侧操作'} accessibilityRole="button" onPress={input.onRightClick} style={[styles.right, input.rightStyle]} testID="up-navbar-right">
              {rightContent}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const UPNavigationBar = UPNavbar;

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  left: { alignItems: 'center', bottom: 0, flexDirection: 'row', left: 0, paddingHorizontal: 13, position: 'absolute', top: 0 },
  leftText: { fontSize: 15, marginLeft: 3 },
  right: { alignItems: 'center', bottom: 0, flexDirection: 'row', paddingHorizontal: 13, position: 'absolute', right: 0, top: 0 },
  rightText: { fontSize: 15, marginLeft: 3 },
  title: { fontSize: 16, textAlign: 'center' },
});
```

If lint flags line length, split the long JSX attributes but keep the same logic. Do not add comments.

- [ ] **Step 6: Add the navbar barrel and run focused tests**

Create `src/components/navbar/index.ts`:

```ts
export * from './types';
export * from './UPNavbar';
```

Run: `npm test -- --runTestsByPath tests/components/UPNavbar.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

---

### Task 2: Implement `UPNavbarMini`

**Files:**
- Create: `src/components/navbar-mini/types.ts`
- Create: `src/components/navbar-mini/UPNavbarMini.tsx`
- Create: `src/components/navbar-mini/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `tests/components/UPNavbarMini.test.tsx`

**Interfaces:**
- Produces `UPNavbarMiniHomePayload = { homeUrl: string; event: UPNavbarMiniPressEvent }`.
- Produces `UPNavbarMiniProps`.
- Produces `UPNavbarMini` with `testID="up-navbar-mini"`, `up-navbar-mini-placeholder`, `up-navbar-mini-inner`, `up-navbar-mini-content`, `up-navbar-mini-left`, `up-navbar-mini-divider`, and `up-navbar-mini-home`.
- Produces `UP.props.navbarMini` and `UPConfigOverrides['props']['navbarMini']`.
- Consumes `UPIcon`, `UPLine`, `UPStatusBar`, `getPx`, and the same `BackHandler.exitApp` behavior as `UPNavbar`.

- [ ] **Step 1: Write the failing mini-navbar tests**

Create `tests/components/UPNavbarMini.test.tsx`:

```tsx
import React from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot } from '../../src';
import { UPNavbarMini } from '../../src/components/navbar-mini';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  UP.resetConfig();
  jest.restoreAllMocks();
});

it('renders a fixed capsule with back, divider, and home regions', () => {
  const screen = renderRoot(<UPNavbarMini />);

  expect(screen.getByTestId('up-navbar-mini')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-left')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-divider')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-home')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-inner').props.style)).toEqual(
    expect.objectContaining({ left: 20, position: 'absolute', top: 10, width: expect.any(Number), zIndex: 11 }),
  );
});

it('emits back before opt-in BackHandler and emits homeUrl payload', () => {
  const events: string[] = [];
  const exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  const onHomeClick = jest.fn((payload) => events.push(`home:${payload.homeUrl}`));
  const screen = renderRoot(
    <UPNavbarMini autoBack homeUrl="/pages/index/index" onHomeClick={onHomeClick} onLeftClick={() => events.push('left')} />,
  );

  fireEvent.press(screen.getByTestId('up-navbar-mini-left'));
  fireEvent.press(screen.getByTestId('up-navbar-mini-home'));

  expect(events).toEqual(['left', 'home:/pages/index/index']);
  expect(exitApp).toHaveBeenCalledTimes(1);
  expect(onHomeClick.mock.calls[0][0]).toEqual(expect.objectContaining({ homeUrl: '/pages/index/index' }));
});

it('supports placeholder, custom render nodes, and reactive config defaults', () => {
  const screen = renderRoot(
    <UPNavbarMini
      placeholder
      renderCenter={() => <Text>Home node</Text>}
      renderLeft={() => <Text>Back node</Text>}
    />,
  );

  expect(screen.getByText('Back node')).toBeTruthy();
  expect(screen.getByText('Home node')).toBeTruthy();
  expect(screen.getByTestId('up-navbar-mini-placeholder')).toBeTruthy();

  act(() => {
    UP.setConfig({ props: { navbarMini: { bgColor: '#223344', fixed: false, height: '40px' } } });
  });

  screen.rerender(<UPRoot><UPNavbarMini /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-content').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#223344', height: 40 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-navbar-mini-inner').props.style)).toEqual(
    expect.objectContaining({ position: 'relative' }),
  );
});
```

- [ ] **Step 2: Run the focused mini-navbar test to verify failure**

Run: `npm test -- --runTestsByPath tests/components/UPNavbarMini.test.tsx`

Expected: FAIL because `UPNavbarMini` and `navbarMini` defaults do not exist.

- [ ] **Step 3: Add mini-navbar defaults and config merge support**

In `src/config/defaults.ts`, add:

```ts
export type UPNavbarMiniDefaults = {
  safeAreaInsetTop: boolean;
  placeholder: boolean;
  fixed: boolean;
  leftIcon: string;
  bgColor: string;
  height: string | number;
  iconSize: string | number;
  iconColor: string;
  leftIconColor: string;
  autoBack: boolean;
  homeUrl: string;
};
```

Add `navbarMini: UPNavbarMiniDefaults;` to `UPProps`. Add frozen defaults:

```ts
navbarMini: Object.freeze({
  safeAreaInsetTop: true,
  placeholder: false,
  fixed: true,
  leftIcon: 'arrow-leftward',
  bgColor: 'rgba(0,0,0,.15)',
  height: '32px',
  iconSize: '20px',
  iconColor: '#fff',
  leftIconColor: '',
  autoBack: true,
  homeUrl: '',
}),
```

In `src/config/store.ts`, add:

```ts
navbarMini?: Partial<UPProps['navbarMini']>;
navbarMini: { ...sourceDefaults.props.navbarMini },
navbarMini: { ...state.props.navbarMini, ...overrides.props?.navbarMini },
```

- [ ] **Step 4: Implement mini-navbar types**

Create `src/components/navbar-mini/types.ts`:

```ts
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';

export type UPNavbarMiniPressEvent = Parameters<NonNullable<React.ComponentProps<typeof Pressable>['onPress']>>[0];
export type UPNavbarMiniHomePayload = { homeUrl: string; event: UPNavbarMiniPressEvent };

export type UPNavbarMiniProps = {
  safeAreaInsetTop?: boolean;
  placeholder?: boolean;
  fixed?: boolean;
  leftIcon?: string;
  bgColor?: string;
  height?: UPDimension;
  iconSize?: UPDimension;
  iconColor?: string;
  leftIconColor?: string;
  autoBack?: boolean;
  homeUrl?: string;
  renderLeft?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  centerStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onLeftClick?: (event: UPNavbarMiniPressEvent) => void;
  onHomeClick?: (payload: UPNavbarMiniHomePayload) => void;
};
```

- [ ] **Step 5: Implement `UPNavbarMini`**

Create `src/components/navbar-mini/UPNavbarMini.tsx`:

```tsx
import React, { useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import { UPIcon } from '../icon';
import { UPLine } from '../line';
import { UPStatusBar } from '../status-bar';
import type { UPNavbarMiniPressEvent, UPNavbarMiniProps } from './types';

export type { UPNavbarMiniHomePayload, UPNavbarMiniProps } from './types';

export function UPNavbarMini(input: UPNavbarMiniProps): React.JSX.Element {
  const props = { ...useUPConfig().props.navbarMini, ...input } as UPNavbarMiniProps;
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(getPx(props.height ?? 32));
  const height = getPx(props.height ?? 32);
  const fixed = Boolean(props.fixed);
  const placeholder = fixed && Boolean(props.placeholder);
  const iconColor = props.leftIconColor || props.iconColor || '#fff';
  const innerStyle: ViewStyle = {
    left: fixed ? 20 : undefined,
    overflow: 'hidden',
    position: fixed ? 'absolute' : 'relative',
    top: fixed ? 10 : undefined,
    width: 90,
    zIndex: fixed ? 11 : undefined,
  };
  const onLayout = (event: LayoutChangeEvent) => setContentHeight(event.nativeEvent.layout.height);
  const onLeftPress = (event: UPNavbarMiniPressEvent) => {
    input.onLeftClick?.(event);
    if (props.autoBack) BackHandler.exitApp();
  };
  const onHomePress = (event: UPNavbarMiniPressEvent) => {
    input.onHomeClick?.({ event, homeUrl: props.homeUrl ?? '' });
  };

  return (
    <View style={input.customStyle} testID="up-navbar-mini">
      {placeholder ? <View style={{ height: contentHeight + statusBarHeight }} testID="up-navbar-mini-placeholder" /> : null}
      <View onLayout={onLayout} style={[innerStyle, input.innerStyle]} testID="up-navbar-mini-inner">
        {props.safeAreaInsetTop ? <UPStatusBar bgColor="transparent" onUpdateHeight={setStatusBarHeight} /> : null}
        <View style={[styles.content, { backgroundColor: props.bgColor, height }, input.contentStyle]} testID="up-navbar-mini-content">
          <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onLeftPress} style={[styles.region, input.leftStyle]} testID="up-navbar-mini-left">
            {input.renderLeft?.() ?? input.left ?? <UPIcon color={iconColor} name={props.leftIcon} size={props.iconSize} />}
          </Pressable>
          <View style={styles.dividerWrap} testID="up-navbar-mini-divider">
            <UPLine color="#fff" direction="col" length="16px" />
          </View>
          <Pressable accessibilityLabel="首页" accessibilityRole="button" onPress={onHomePress} style={[styles.region, input.centerStyle]} testID="up-navbar-mini-home">
            {input.renderCenter?.() ?? input.center ?? <UPIcon color={props.iconColor} name="home" size={props.iconSize} />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
  dividerWrap: { paddingHorizontal: 10, paddingVertical: 10 },
  region: { alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 6: Add the mini-navbar barrel and run focused tests**

Create `src/components/navbar-mini/index.ts`:

```ts
export * from './types';
export * from './UPNavbarMini';
```

Run: `npm test -- --runTestsByPath tests/components/UPNavbarMini.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

---

### Task 3: Implement `UPCateTab`

**Files:**
- Create: `src/components/cate-tab/types.ts`
- Create: `src/components/cate-tab/UPCateTab.tsx`
- Create: `src/components/cate-tab/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `tests/components/UPCateTab.test.tsx`

**Interfaces:**
- Produces `UPCateTabMode = 'follow' | 'tab'`.
- Produces `UPCateTabItem = Record<string, unknown> & { children?: readonly UPCateTabItem[]; icon?: string }`.
- Produces `UPCateTabRenderPayload = { item: UPCateTabItem; index: number; active: boolean }`.
- Produces `UPCateTabPageItemPayload = { item: UPCateTabItem; index: number; parent: UPCateTabItem; parentIndex: number }`.
- Produces `UPCateTab` with stable test IDs: `up-cate-tab`, `up-cate-tab-menu-scroll`, `up-cate-tab-menu-item-${index}`, `up-cate-tab-right-scroll`, `up-cate-tab-section-${index}`, `up-cate-tab-page-item-${parentIndex}-${index}`.
- Produces `UP.props.cateTab` and `UPConfigOverrides['props']['cateTab']`.
- Consumes `UPImage`, `UPIcon`, `useUPConfig`, `useUPTheme`, `getPx`, and React Native `ScrollView`.

- [ ] **Step 1: Write the failing cate-tab tests**

Create `tests/components/UPCateTab.test.tsx`:

```tsx
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot } from '../../src';
import { UPCateTab } from '../../src/components/cate-tab';

const data = [
  { name: '手机', children: [{ name: 'iPhone', icon: 'https://example.test/iphone.png' }, { name: 'Android' }] },
  { name: '电脑', children: [{ name: 'Mac' }, { name: 'Windows' }] },
  { name: '配件', children: [{ name: '键盘' }] },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function layoutSections(screen: ReturnType<typeof renderRoot>) {
  fireEvent(screen.getByTestId('up-cate-tab-menu-item-0'), 'layout', {
    nativeEvent: { layout: { height: 48, width: 96, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-0'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-1'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 200 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-2'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 400 } },
  });
}

afterEach(() => {
  UP.resetConfig();
  jest.restoreAllMocks();
});

it('renders source-style left tabs and default right item grid', () => {
  const screen = renderRoot(<UPCateTab tabList={data} />);

  expect(screen.getByText('手机')).toBeTruthy();
  expect(screen.getByText('iPhone')).toBeTruthy();
  expect(screen.getByText('Windows')).toBeTruthy();
  expect(screen.getByTestId('up-cate-tab-page-item-0-0')).toBeTruthy();
});

it('updates uncontrolled current from left menu presses and suppresses duplicate changes', () => {
  const onChange = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(<UPCateTab onChange={onChange} onUpdateCurrent={onUpdateCurrent} tabList={data} />);
  const scrollTo = jest.spyOn(screen.UNSAFE_getAllByType(ScrollView)[1].instance, 'scrollTo');
  layoutSections(screen);

  fireEvent.press(screen.getByTestId('up-cate-tab-menu-item-1'));
  fireEvent.press(screen.getByTestId('up-cate-tab-menu-item-1'));

  expect(onUpdateCurrent).toHaveBeenCalledTimes(1);
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(1, data[1]);
  expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: 200 });
});

it('keeps controlled current visually selected and clamps stale indexes', () => {
  const screen = renderRoot(<UPCateTab current={99} tabList={data} />);

  expect(screen.getByTestId('up-cate-tab-menu-item-2').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );

  screen.rerender(<UPRoot><UPCateTab current={1} tabList={data.slice(0, 1)} /></UPRoot>);
  expect(screen.getByTestId('up-cate-tab-menu-item-0').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
});

it('syncs follow mode from measured right-side scroll positions', () => {
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(<UPCateTab onUpdateCurrent={onUpdateCurrent} tabList={data} />);
  layoutSections(screen);

  fireEvent.scroll(screen.getByTestId('up-cate-tab-right-scroll'), {
    nativeEvent: { contentOffset: { x: 0, y: 250 } },
  });

  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  expect(screen.getByTestId('up-cate-tab-menu-item-1').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
});

it('renders only the active section in tab mode', () => {
  const screen = renderRoot(<UPCateTab current={1} mode="tab" tabList={data} />);

  expect(screen.queryByTestId('up-cate-tab-section-0')).toBeNull();
  expect(screen.getByTestId('up-cate-tab-section-1')).toBeTruthy();
  expect(screen.queryByTestId('up-cate-tab-section-2')).toBeNull();
});

it('maps render props and custom key names', () => {
  const custom = [{ title: '一级', children: [{ title: '二级' }] }];
  const screen = renderRoot(
    <UPCateTab
      itemKeyName="title"
      renderPageItem={({ item }) => <Text>page:{String(item.title)}</Text>}
      renderRightTop={() => <Text>right top</Text>}
      renderTabItem={({ item, active }) => <Text>{active ? `active:${String(item.title)}` : String(item.title)}</Text>}
      tabKeyName="title"
      tabList={custom}
    />,
  );

  expect(screen.getByText('active:一级')).toBeTruthy();
  expect(screen.getByText('right top')).toBeTruthy();
  expect(screen.getByText('page:二级')).toBeTruthy();
});

it('reacts to configured defaults while explicit props win', () => {
  const screen = renderRoot(<UPCateTab current={1} mode="tab" tabList={data} />);

  act(() => {
    UP.setConfig({ props: { cateTab: { current: 2, height: '360px', mode: 'follow' } } });
  });

  expect(screen.queryByTestId('up-cate-tab-section-0')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('up-cate-tab').props.style)).toEqual(
    expect.objectContaining({ height: 360 }),
  );
});
```

- [ ] **Step 2: Run the focused cate-tab test to verify failure**

Run: `npm test -- --runTestsByPath tests/components/UPCateTab.test.tsx`

Expected: FAIL because `UPCateTab` and `cateTab` defaults do not exist.

- [ ] **Step 3: Add cate-tab defaults and config merge support**

In `src/config/defaults.ts`, add:

```ts
export type UPCateTabDefaults = {
  mode: 'follow' | 'tab';
  height: string | number;
  tabList: readonly Record<string, unknown>[];
  tabKeyName: string;
  itemKeyName: string;
  current: number;
  animated: boolean;
};
```

Add `cateTab: UPCateTabDefaults;` to `UPProps`. Add frozen defaults:

```ts
cateTab: Object.freeze({
  mode: 'follow' as const,
  height: '100%',
  tabList: Object.freeze([]) as readonly Record<string, unknown>[],
  tabKeyName: 'name',
  itemKeyName: 'name',
  current: 0,
  animated: true,
}),
```

In `src/config/store.ts`, add:

```ts
cateTab?: Partial<UPProps['cateTab']>;
cateTab: { ...sourceDefaults.props.cateTab },
cateTab: { ...state.props.cateTab, ...overrides.props?.cateTab },
```

- [ ] **Step 4: Implement cate-tab public types**

Create `src/components/cate-tab/types.ts`:

```ts
import React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';

export type UPCateTabMode = 'follow' | 'tab';
export type UPCateTabItem = Record<string, unknown> & {
  children?: readonly UPCateTabItem[];
  icon?: string;
};

export type UPCateTabRenderPayload = {
  item: UPCateTabItem;
  index: number;
  active: boolean;
};

export type UPCateTabPageItemPayload = {
  item: UPCateTabItem;
  index: number;
  parent: UPCateTabItem;
  parentIndex: number;
};

export type UPCateTabProps = {
  mode?: UPCateTabMode;
  height?: UPDimension;
  tabList?: readonly UPCateTabItem[];
  tabKeyName?: string;
  itemKeyName?: string;
  current?: number;
  defaultCurrent?: number;
  animated?: boolean;
  renderTabItem?: (payload: UPCateTabRenderPayload) => React.ReactNode;
  renderRightTop?: (payload: { tabList: readonly UPCateTabItem[] }) => React.ReactNode;
  renderItemList?: (payload: UPCateTabRenderPayload) => React.ReactNode;
  renderPageItem?: (payload: UPCateTabPageItemPayload) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  menuStyle?: StyleProp<ViewStyle>;
  menuItemStyle?: StyleProp<ViewStyle>;
  activeMenuItemStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  sectionStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  customClass?: string;
  onUpdateCurrent?: (index: number) => void;
  onChange?: (index: number, item: UPCateTabItem) => void;
};
```

- [ ] **Step 5: Implement current resolution and scroll coordination**

Create `src/components/cate-tab/UPCateTab.tsx` with these helpers:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, range } from '../../utils';
import { UPImage } from '../image';
import type { UPCateTabItem, UPCateTabProps } from './types';

export type { UPCateTabProps } from './types';

function labelOf(item: UPCateTabItem, keyName: string): string {
  return String(item[keyName] ?? '');
}

function childrenOf(item: UPCateTabItem): readonly UPCateTabItem[] {
  return Array.isArray(item.children) ? item.children : [];
}
```

Inside the component:

```tsx
const props = { ...useUPConfig().props.cateTab, ...input } as UPCateTabProps;
const tabs = props.tabList ?? [];
const controlled = input.current !== undefined;
const [innerCurrent, setInnerCurrent] = useState(input.defaultCurrent ?? props.current ?? 0);
const resolvedCurrent = range(0, Math.max(0, tabs.length - 1), controlled ? input.current : innerCurrent);
const currentRef = useRef(resolvedCurrent);
const menuRef = useRef<ScrollView>(null);
const rightRef = useRef<ScrollView>(null);
const sectionOffsets = useRef(new Map<number, number>());
const menuFrames = useRef(new Map<number, { height: number; y: number }>());
const rightProgrammaticScroll = useRef(false);
```

Use one `activate(index, source)` callback for both left presses and follow-scroll changes:

```ts
const activate = useCallback((rawIndex: number, source: 'menu' | 'scroll') => {
  if (!tabs.length) return;
  const index = range(0, tabs.length - 1, rawIndex);
  if (index === currentRef.current) return;
  currentRef.current = index;
  if (!controlled) setInnerCurrent(index);
  input.onUpdateCurrent?.(index);
  input.onChange?.(index, tabs[index]!);
  const menuFrame = menuFrames.current.get(index);
  if (menuFrame) {
    menuRef.current?.scrollTo({ animated: props.animated !== false, y: Math.max(0, menuFrame.y + menuFrame.height / 2 - 180) });
  }
  if (source === 'menu' && props.mode !== 'tab') {
    const target = sectionOffsets.current.get(index);
    if (target !== undefined) {
      rightProgrammaticScroll.current = true;
      rightRef.current?.scrollTo({ animated: props.animated !== false, y: target });
      setTimeout(() => { rightProgrammaticScroll.current = false; }, 120);
    }
  }
}, [controlled, input, props.animated, props.mode, tabs]);
```

Add effects to keep `currentRef` in sync and to scroll when controlled `current` changes:

```ts
useEffect(() => {
  currentRef.current = resolvedCurrent;
}, [resolvedCurrent]);

useEffect(() => {
  if (!controlled || props.mode === 'tab') return;
  const target = sectionOffsets.current.get(resolvedCurrent);
  if (target !== undefined) rightRef.current?.scrollTo({ animated: props.animated !== false, y: target });
}, [controlled, props.animated, props.mode, resolvedCurrent]);
```

For right scroll in `follow`, find the last section offset less than or equal to `contentOffset.y + 1`, skip if `rightProgrammaticScroll.current` is true, and call `activate(nextIndex, 'scroll')`.

- [ ] **Step 6: Implement rendering and default item grid**

Render the shell:

```tsx
return (
  <View style={[styles.root, { height: String(props.height).includes('%') ? props.height as `${number}%` : getPx(props.height ?? '100%') }, input.customStyle]} testID="up-cate-tab">
    <View style={styles.wrap}>
      <ScrollView ref={menuRef} style={[styles.menu, input.menuStyle]} testID="up-cate-tab-menu-scroll">
        {tabs.map((item, index) => {
          const active = index === resolvedCurrent;
          return (
            <Pressable
              accessibilityLabel={labelOf(item, props.tabKeyName ?? 'name')}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={`${labelOf(item, props.tabKeyName ?? 'name')}-${index}`}
              onLayout={(event: LayoutChangeEvent) => menuFrames.current.set(index, event.nativeEvent.layout)}
              onPress={() => activate(index, 'menu')}
              style={[styles.menuItem, active ? styles.menuItemActive : null, input.menuItemStyle, active ? input.activeMenuItemStyle : null]}
              testID={`up-cate-tab-menu-item-${index}`}
            >
              {input.renderTabItem?.({ active, index, item }) ?? <Text numberOfLines={1} style={[styles.menuText, active ? styles.menuTextActive : null]}>{labelOf(item, props.tabKeyName ?? 'name')}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView onScroll={onRightScroll} ref={rightRef} scrollEventThrottle={16} style={[styles.right, input.rightStyle]} testID="up-cate-tab-right-scroll">
        {input.renderRightTop?.({ tabList: tabs })}
        {(props.mode === 'tab' ? tabs.filter((_item, index) => index === resolvedCurrent) : tabs).map((item, localIndex) => {
          const index = props.mode === 'tab' ? resolvedCurrent : localIndex;
          const active = index === resolvedCurrent;
          return renderSection(item, index, active);
        })}
      </ScrollView>
    </View>
  </View>
);
```

`renderSection` must:

- Set `testID={`up-cate-tab-section-${index}`}`.
- In `follow`, store `event.nativeEvent.layout.y` in `sectionOffsets`.
- Render `input.renderItemList?.({ item, index, active })` when provided and skip default section content.
- Otherwise render the title and a wrapping child grid.
- Render `UPImage` for child `icon` URLs using `width={50}`, `height={50}`, and `mode="aspectFill"`.
- Render child text from `itemKeyName`.

Use these default styles:

```ts
const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff' },
  wrap: { flex: 1, flexDirection: 'row' },
  menu: { backgroundColor: '#f6f6f6', width: 90 },
  menuItem: { alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: 8, position: 'relative' },
  menuItemActive: { backgroundColor: '#ffffff' },
  menuText: { color: '#303133', fontSize: 14 },
  menuTextActive: { color: '#3c9cff', fontWeight: '600' },
  right: { backgroundColor: '#ffffff', flex: 1 },
  section: { paddingBottom: 16 },
  sectionTitle: { color: '#303133', fontSize: 15, fontWeight: '600', paddingHorizontal: 12, paddingTop: 12 },
  itemContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingTop: 8 },
  thumbBox: { alignItems: 'center', marginBottom: 14, paddingHorizontal: 6, width: '33.3333%' },
  thumbName: { color: '#606266', fontSize: 13, marginTop: 6, textAlign: 'center' },
});
```

- [ ] **Step 7: Add cate-tab barrel and run focused tests**

Create `src/components/cate-tab/index.ts`:

```ts
export * from './types';
export * from './UPCateTab';
```

Run: `npm test -- --runTestsByPath tests/components/UPCateTab.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

---

### Task 4: Public Exports, Example, and Compatibility Docs

**Files:**
- Modify: `src/components/index.ts`
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `tests/components/UPNavbar.test.tsx`
- Modify: `tests/components/UPNavbarMini.test.tsx`
- Modify: `tests/components/UPCateTab.test.tsx`

**Interfaces:**
- Produces root exports for `UPNavbar`, `UPNavigationBar`, `UPNavbarMini`, `UPCateTab`, and their public prop/payload types.
- Produces example usage that imports from `../src`.
- Produces docs stating no router dependency, `autoBack` uses `BackHandler.exitApp()`, and `homeUrl` is callback payload only.
- Consumes all components from Tasks 1-3.

- [ ] **Step 1: Export new component families**

Append these exports in `src/components/index.ts` near related navigation/layout exports:

```ts
export * from './navbar';
export * from './navbar-mini';
export * from './cate-tab';
```

Change the focused P28 tests from component-directory imports to root package imports:

```ts
import { UP, UPCateTab, UPNavigationBar, UPNavbar, UPNavbarMini, UPRoot } from '../../src';
```

- [ ] **Step 2: Add example app coverage**

In `example/App.tsx`, add a compact P28 demo section using existing demo state conventions. The code should look like this shape, adjusted to the existing file's local sample naming:

```tsx
const categoryTabs = [
  { name: '手机', children: [{ name: 'iPhone', icon: 'https://dummyimage.com/80x80/edf2f7/334155.png&text=iPhone' }, { name: 'Android' }] },
  { name: '电脑', children: [{ name: 'Mac' }, { name: 'Windows' }] },
  { name: '配件', children: [{ name: '键盘' }, { name: '耳机' }] },
];

const [cateCurrent, setCateCurrent] = useState(0);
```

Render:

```tsx
<UPNavbar
  border
  leftText="返回"
  onLeftClick={() => appendLog('navbar:left')}
  onRightClick={() => appendLog('navbar:right')}
  rightText="帮助"
  title="P28 导航栏"
/>
<UPNavbarMini
  fixed={false}
  homeUrl="/pages/index/index"
  onHomeClick={({ homeUrl }) => appendLog(`navbar-mini:home:${homeUrl}`)}
  onLeftClick={() => appendLog('navbar-mini:left')}
/>
<UPCateTab
  current={cateCurrent}
  height={360}
  onUpdateCurrent={setCateCurrent}
  tabList={categoryTabs}
/>
<UPCateTab
  current={cateCurrent}
  height={260}
  mode="tab"
  onUpdateCurrent={setCateCurrent}
  tabList={categoryTabs}
/>
```

Do not add an example-specific `tsconfig`.

- [ ] **Step 3: Update compatibility docs**

In `docs/compatibility.md`, add a P28 section:

```md
### P28 Navigation and Cate Tab

- `UPNavbar` maps `u-navbar` left/right/center slots to `renderLeft`, `renderCenter`, `renderRight`, or React node aliases.
- `UPNavbar` emits `onLeftClick` before opt-in `autoBack`; `autoBack` calls React Native `BackHandler.exitApp()` because RN core has no router-agnostic `navigateBack`.
- `UPNavbarMini` preserves `homeUrl` as data only and emits `onHomeClick({ homeUrl, event })`; apps own React Navigation, Expo Router, or custom route handling.
- `UPCateTab` supports `mode="follow"` by measuring right-side sections and syncing the left menu from right scroll positions.
- `UPCateTab` supports `mode="tab"` by rendering only the active section.
- Vue slots map to `renderTabItem`, `renderRightTop`, `renderItemList`, and `renderPageItem`.
```

- [ ] **Step 4: Update gap matrix**

In `docs/gap-matrix.md`, add rows matching the existing table format:

```md
| `u-navbar` | safe area, fixed/placeholder, border, title, left/right icon/text, custom slots, `autoBack` | `UPNavbarProps` | Native navbar with callback-owned routing; `UPNavigationBar` alias exported | Supported with RN route limit | `tests/components/UPNavbar.test.tsx` |
| `u-navbar-mini` | capsule fixed navbar, back/home regions, divider, `homeUrl`, custom slots | `UPNavbarMiniProps` | Native capsule control; `homeUrl` emitted only through `onHomeClick` | Supported with RN route limit | `tests/components/UPNavbarMini.test.tsx` |
| `u-cate-tab` | `follow`/`tab`, `tabList`, `current`, key names, default grid, slot render props | `UPCateTabProps` | Native vertical category tab with measured right-scroll syncing | Supported except virtualization | `tests/components/UPCateTab.test.tsx` |
```

- [ ] **Step 5: Run focused P28 tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPNavbar.test.tsx tests/components/UPNavbarMini.test.tsx tests/components/UPCateTab.test.tsx
```

Expected: PASS.

---

### Task 5: Full Validation and Packaging Checks

**Files:**
- Read-only validation across the repository.
- Modify only files touched in Tasks 1-4 if a validation failure is directly caused by P28 changes.

**Interfaces:**
- Consumes all P28 components, config defaults, public exports, docs, and examples.
- Produces a validated package state with no unrelated fixes.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: PASS. If a failure is unrelated to P28, record it in the handoff and do not refactor unrelated code.

- [ ] **Step 2: Run TypeScript checks**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 4: Run package build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Run package dry-run**

Run: `npm pack --dry-run`

Expected: PASS and includes the new `src/components/navbar`, `src/components/navbar-mini`, and `src/components/cate-tab` files.

- [ ] **Step 6: Run whitespace validation**

Run: `git diff --check`

Expected: PASS.

- [ ] **Step 7: Inspect final changed files**

Run: `git status --short`

Expected: Shows P28 files and existing unrelated untracked workspace files. Do not stage or commit.

- [ ] **Step 8: Prepare final handoff**

Report:

```md
- Implemented `UPNavbar`, `UPNavbarMini`, and `UPCateTab`.
- Updated public exports, example coverage, compatibility docs, and gap matrix.
- Validation: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, `git diff --check`.
- No git staging or commits performed.
```
