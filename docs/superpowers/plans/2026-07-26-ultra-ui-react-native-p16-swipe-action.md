# React Native P16 Swipe Action Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `u-swipe-action` and `u-swipe-action-item` as `UPSwipeAction` and `UPSwipeActionItem`, retaining source right-side options, controlled open state, sibling auto-close, and option click payloads.

**Architecture:** `UPSwipeAction` owns a Context registry of child close handles and reports aggregate source state. `UPSwipeActionItem` uses the installed `react-native-gesture-handler/ReanimatedSwipeable`, maps native callbacks to source APIs, and renders only source-compatible right actions with the existing `UPIcon`.

**Tech Stack:** React 19, React Native 0.86, `react-native-gesture-handler/ReanimatedSwipeable`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly authorized this. Do not create a worktree, commit, push, reset, clean, or delete files.
- Source of truth is uview-plus 3.8.86 under `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus\components\u-swipe-action` and `u-swipe-action-item`.
- Public exports are PascalCase `UP*` values/types. Add `UPSwipeAction`, `UPSwipeActionItem`, `UPSwipeActionProps`, `UPSwipeActionItemProps`, and `UPSwipeActionOption`.
- Add source defaults to subscribable `UP.props` and every existing `UP.setConfig()` override, resettable state, and merge path.
- Use the existing `ReanimatedSwipeable`; do not add dependencies or implement a custom pan gesture.
- Map only source right `options`; omit left actions, WXS/nvue/browser touch paths, CSS class resolution, CSS-duration semantics, and an extra content-tap close handler.
- Retain item `autoClose`, `duration`, and `customClass` as documented typed no-ops. Parent `autoClose` alone controls sibling coordination.
- Do not modify `UPRoot`, current list/cell/notice components, or global gesture-handler Jest setup.
- Do not alter unrelated dirty workspace files.

---

## File Structure

- `src/components/swipe-action/context.ts` — opaque child handle and parent Context types.
- `src/components/swipe-action/UPSwipeAction.tsx` — parent defaults, item registry, sibling closure, and `opendItem={false}` close-all behavior.
- `src/components/swipe-action/UPSwipeActionItem.tsx` — item props, source option UI, native wrapper, controlled lifecycle, and source callbacks.
- `src/components/swipe-action/index.ts` and `src/components/index.ts` — local/package export barrels.
- `src/config/defaults.ts` and `src/config/store.ts` — source defaults and reactive config paths.
- `tests/components/UPSwipeAction.test.tsx` — native-wrapper and source-regression suite.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx` — public status, native limits, and runnable two-row example.

### Task 1: Establish Failing Source-Compatibility Tests

**Files:**
- Create: `tests/components/UPSwipeAction.test.tsx`

**Interfaces:**
- Consumes planned root exports `UP`, `UPRoot`, `UPSwipeAction`, and `UPSwipeActionItem` from `../../src`.
- Requires test IDs `up-swipe-action`, `up-swipe-action-item`, `up-swipe-action-native`, `up-swipe-action-options`, and `up-swipe-action-option-${index}`.
- Mock only `react-native-gesture-handler/ReanimatedSwipeable`; do not mock the package entrypoint because `UPRoot` relies on its `GestureHandlerRootView` export.

- [ ] **Step 1: Add an observable native Swipeable test double**

Create the test with this scoped Jest mock before importing `../../src`:

```tsx
import React from 'react';

const mockClose = jest.fn();
const mockOpenRight = jest.fn();
const mockSwipeableProps: Array<Record<string, unknown>> = [];

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Swipeable = ReactModule.forwardRef((props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => {
    mockSwipeableProps.push(props);
    ReactModule.useImperativeHandle(ref, () => ({
      close: mockClose,
      openLeft: jest.fn(),
      openRight: mockOpenRight,
      reset: jest.fn(),
    }));
    const renderRightActions = props.renderRightActions as (() => React.ReactNode) | undefined;
    return ReactModule.createElement(View, { testID: props.testID as string | undefined }, renderRightActions?.(), props.children as React.ReactNode);
  });
  return { __esModule: true, default: Swipeable };
});

import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { UP, UPRoot, UPSwipeAction, UPSwipeActionItem } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

beforeEach(() => {
  mockClose.mockClear();
  mockOpenRight.mockClear();
  mockSwipeableProps.length = 0;
});
```

- [ ] **Step 2: Add default and right-only native-mapping tests**

Append these tests:

```tsx
it('uses source option defaults and maps right-only native swipe props', () => {
  const screen = renderRoot(
    <UPSwipeAction>
      <UPSwipeActionItem name="invoice" options={[{ icon: 'trash', text: 'Delete' }]}>
        <Text>Invoice #42</Text>
      </UPSwipeActionItem>
    </UPSwipeAction>,
  );

  expect(screen.getByTestId('up-swipe-action')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-item')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-native')).toBeTruthy();
  expect(screen.getByTestId('up-swipe-action-options')).toBeTruthy();
  expect(screen.getByText('Invoice #42')).toBeTruthy();
  expect(screen.getByText('Delete')).toBeTruthy();
  expect(screen.getAllByTestId('up-icon')).toHaveLength(1);
  expect(StyleSheet.flatten(screen.getByTestId('up-swipe-action-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#C7C6CD', paddingHorizontal: 15 }),
  );
  expect(mockSwipeableProps[0]).toEqual(expect.objectContaining({
    enabled: true,
    overshootRight: false,
    rightThreshold: 20,
  }));
  expect(mockSwipeableProps[0]).not.toHaveProperty('renderLeftActions');
});

it('maps disabled, threshold conversion, and option style overrides', () => {
  const screen = renderRoot(
    <UPSwipeActionItem
      disabled
      options={[{ style: { backgroundColor: '#102030', borderRadius: 8, color: '#abcdef', fontSize: 12 }, text: 'Styled' }]}
      threshold="24rpx"
    >
      <Text>Styled row</Text>
    </UPSwipeActionItem>,
  );

  expect(mockSwipeableProps[0]).toEqual(expect.objectContaining({ enabled: false, rightThreshold: expect.any(Number) }));
  expect(mockSwipeableProps[0].rightThreshold as number).toBeGreaterThan(0);
  expect(StyleSheet.flatten(screen.getByTestId('up-swipe-action-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#102030', borderRadius: 8 }),
  );
  expect(StyleSheet.flatten(screen.getByText('Styled').props.style)).toEqual(
    expect.objectContaining({ color: '#abcdef', fontSize: 12 }),
  );
});
```

- [ ] **Step 3: Add controlled state, source events, and parent coordination tests**

Capture a native prop object before calling it, so rerendering cannot replace
the callback under test:

```tsx
it('synchronizes controlled show with native methods and source callbacks', () => {
  const onClose = jest.fn();
  const onOpen = jest.fn();
  const onUpdateShow = jest.fn();
  const screen = renderRoot(
    <UPSwipeActionItem name="first" onClose={onClose} onOpen={onOpen} onUpdateShow={onUpdateShow} show>
      <Text>First</Text>
    </UPSwipeActionItem>,
  );

  expect(mockOpenRight).toHaveBeenCalledTimes(1);
  const openProps = mockSwipeableProps.at(-1)!;
  act(() => (openProps.onSwipeableWillOpen as () => void)());
  act(() => (openProps.onSwipeableOpen as () => void)());
  expect(onOpen).toHaveBeenCalledWith('first');
  expect(onUpdateShow).toHaveBeenLastCalledWith(true);

  screen.rerender(<UPRoot><UPSwipeActionItem name="first" onClose={onClose} onOpen={onOpen} onUpdateShow={onUpdateShow} show={false}><Text>First</Text></UPSwipeActionItem></UPRoot>);
  expect(mockClose).toHaveBeenCalledTimes(1);
  const closeProps = mockSwipeableProps.at(-1)!;
  act(() => (closeProps.onSwipeableClose as () => void)());
  expect(onClose).toHaveBeenCalledWith('first');
  expect(onUpdateShow).toHaveBeenLastCalledWith(false);
});

it('closes only siblings when parent autoClose is enabled', () => {
  const onUpdateOpendItem = jest.fn();
  renderRoot(
    <UPSwipeAction onUpdateOpendItem={onUpdateOpendItem}>
      <UPSwipeActionItem name="first"><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second"><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  const firstProps = mockSwipeableProps[0];
  const secondProps = mockSwipeableProps[1];
  act(() => (firstProps.onSwipeableWillOpen as () => void)());
  mockClose.mockClear();
  act(() => (secondProps.onSwipeableWillOpen as () => void)());

  expect(mockClose).toHaveBeenCalledTimes(1);
  expect(onUpdateOpendItem).toHaveBeenLastCalledWith(true);
});

it('retains siblings when parent autoClose is false', () => {
  renderRoot(
    <UPSwipeAction autoClose={false}>
      <UPSwipeActionItem name="first"><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second"><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  act(() => (mockSwipeableProps[0].onSwipeableWillOpen as () => void)());
  act(() => (mockSwipeableProps[1].onSwipeableWillOpen as () => void)());
  expect(mockClose).not.toHaveBeenCalled();
});
```

- [ ] **Step 4: Add option payload, close-all, and config reactivity tests**

Append the remaining checks:

```tsx
it('emits source action payloads and observes closeOnClick', () => {
  const onClick = jest.fn();
  const closes = renderRoot(
    <UPSwipeActionItem name={7} onClick={onClick} options={[{ text: 'Archive' }]}><Text>Archive item</Text></UPSwipeActionItem>,
  );
  fireEvent.press(closes.getByTestId('up-swipe-action-option-0'));
  expect(onClick).toHaveBeenCalledWith({ index: 0, name: 7 });
  expect(mockClose).toHaveBeenCalledTimes(1);

  mockClose.mockClear();
  const remains = renderRoot(
    <UPSwipeActionItem closeOnClick={false} name="keep" options={[{ text: 'Keep' }]}><Text>Keep item</Text></UPSwipeActionItem>,
  );
  fireEvent.press(remains.getByTestId('up-swipe-action-option-0'));
  expect(mockClose).not.toHaveBeenCalled();
});

it('closes all registered rows when parent opendItem becomes false', () => {
  const screen = renderRoot(
    <UPSwipeAction>
      <UPSwipeActionItem name="first" show><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second" show><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction>,
  );
  mockClose.mockClear();
  screen.rerender(
    <UPRoot><UPSwipeAction opendItem={false}>
      <UPSwipeActionItem name="first" show><Text>First</Text></UPSwipeActionItem>
      <UPSwipeActionItem name="second" show><Text>Second</Text></UPSwipeActionItem>
    </UPSwipeAction></UPRoot>,
  );
  expect(mockClose).toHaveBeenCalledTimes(2);
});

it('reacts to mounted swipe defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPSwipeAction><UPSwipeActionItem><Text>Configured</Text></UPSwipeActionItem></UPSwipeAction>);
  act(() => {
    UP.setConfig({ props: { swipeAction: { autoClose: false }, swipeActionItem: { disabled: true, threshold: 40 } } });
  });
  expect(mockSwipeableProps.at(-1)).toEqual(expect.objectContaining({ enabled: false, rightThreshold: 40 }));

  screen.rerender(<UPRoot><UPSwipeAction autoClose><UPSwipeActionItem disabled={false} threshold={12}><Text>Explicit</Text></UPSwipeActionItem></UPSwipeAction></UPRoot>);
  expect(mockSwipeableProps.at(-1)).toEqual(expect.objectContaining({ enabled: true, rightThreshold: 12 }));
});
```

- [ ] **Step 5: Run the focused test to verify the missing API failure**

Run:

```powershell
npm test -- --runInBand tests/components/UPSwipeAction.test.tsx
```

Expected: FAIL because `UPSwipeAction`, `UPSwipeActionItem`, and both reactive
config entries do not exist yet.

### Task 2: Add Reactive Defaults and Implement Parent/Item Components

**Files:**
- Create: `src/components/swipe-action/context.ts`
- Create: `src/components/swipe-action/UPSwipeAction.tsx`
- Create: `src/components/swipe-action/UPSwipeActionItem.tsx`
- Create: `src/components/swipe-action/index.ts`
- Modify: `src/components/index.ts:58-66`
- Modify: `src/config/defaults.ts:444-556`
- Modify: `src/config/defaults.ts:929-931`
- Modify: `src/config/store.ts:70-73`
- Modify: `src/config/store.ts:160-163`
- Modify: `src/config/store.ts:255-258`

**Interfaces:**
- Produces `UPSwipeActionDefaults`, `UPSwipeActionItemDefaults`, `UPProps['swipeAction']`, `UPProps['swipeActionItem']`, and matching `UPConfigOverrides['props']` entries.
- Produces package-root `UPSwipeAction`, `UPSwipeActionItem`, and their public props/option types through the existing `src/index.ts` re-export of `./components`.
- Consumes `SwipeableMethods`, `getPx`, `useUPConfig`, `UPIcon`, and the test contract from Task 1; it adds no public ref API.

- [ ] **Step 1: Add frozen source defaults and all config-store paths**

In `src/config/defaults.ts`, directly after `UPRowNoticeDefaults`, add:

```ts
export type UPSwipeActionDefaults = { autoClose: boolean; };
export type UPSwipeActionItemDefaults = {
  show: boolean;
  closeOnClick: boolean;
  name: string;
  disabled: boolean;
  autoClose: boolean;
  threshold: number;
  options: readonly unknown[];
  duration: number;
};
```

Add the two `UPProps` entries directly after `rowNotice`:

```ts
swipeAction: UPSwipeActionDefaults;
swipeActionItem: UPSwipeActionItemDefaults;
```

Add these frozen source tables after `rowNotice` in `sourceDefaults.props`:

```ts
swipeAction: Object.freeze({ autoClose: true }),
swipeActionItem: Object.freeze({
  show: false,
  closeOnClick: true,
  name: '',
  disabled: false,
  autoClose: true,
  threshold: 20,
  options: Object.freeze([]) as readonly unknown[],
  duration: 300,
}),
```

Add the matching entries beside `rowNotice` in all three `src/config/store.ts`
paths:

```ts
// UPConfigOverrides['props']
swipeAction?: Partial<UPProps['swipeAction']>;
swipeActionItem?: Partial<UPProps['swipeActionItem']>;

// createSourceState().props
swipeAction: { ...sourceDefaults.props.swipeAction },
swipeActionItem: { ...sourceDefaults.props.swipeActionItem },

// setUPConfig().props
swipeAction: { ...state.props.swipeAction, ...overrides.props?.swipeAction },
swipeActionItem: { ...state.props.swipeActionItem, ...overrides.props?.swipeActionItem },
```

This creates resettable mutable state while retaining frozen source default
tables, matching the existing `UP.props` subscription model.

- [ ] **Step 2: Add the focused parent coordination Context**

Create `src/components/swipe-action/context.ts`:

```tsx
import { createContext, useContext } from 'react';

export type UPSwipeActionItemHandle = {
  close: () => void;
};

export type UPSwipeActionContextValue = {
  closeAll: () => void;
  notifyClose: (item: UPSwipeActionItemHandle) => void;
  notifyOpen: (item: UPSwipeActionItemHandle) => void;
  register: (item: UPSwipeActionItemHandle) => () => void;
};

export const UPSwipeActionContext = createContext<UPSwipeActionContextValue | null>(null);

export function useUPSwipeActionContext(): UPSwipeActionContextValue | null {
  return useContext(UPSwipeActionContext);
}
```

The parent owns open-item aggregation, and the opaque item handle exposes only
`close()`. This avoids stale local child state when native close callbacks
arrive after the parent requested sibling closure.

- [ ] **Step 3: Implement parent registration, sibling closure, and source aggregate events**

Create `src/components/swipe-action/UPSwipeAction.tsx`:

```tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPSwipeActionContext, type UPSwipeActionItemHandle } from './context';

export type UPSwipeActionProps = {
  autoClose?: boolean;
  opendItem?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onUpdateOpendItem?: (open: boolean) => void;
};

export function UPSwipeAction(input: UPSwipeActionProps): React.JSX.Element {
  const props = { ...useUPConfig().props.swipeAction, ...input } as UPSwipeActionProps;
  const items = useRef(new Set<UPSwipeActionItemHandle>());
  const openItems = useRef(new Set<UPSwipeActionItemHandle>());
  const previousOpendItem = useRef(input.opendItem);

  const context = useMemo(() => ({
    closeAll: () => items.current.forEach((item) => item.close()),
    notifyClose: (item: UPSwipeActionItemHandle) => {
      openItems.current.delete(item);
      if (openItems.current.size === 0) input.onUpdateOpendItem?.(false);
    },
    notifyOpen: (current: UPSwipeActionItemHandle) => {
      if (props.autoClose) {
        items.current.forEach((item) => {
          if (item !== current) item.close();
        });
      }
      openItems.current.add(current);
      input.onUpdateOpendItem?.(true);
    },
    register: (item: UPSwipeActionItemHandle) => {
      items.current.add(item);
      return () => {
        items.current.delete(item);
        openItems.current.delete(item);
      };
    },
  }), [input.onUpdateOpendItem, props.autoClose]);

  useEffect(() => {
    if (input.opendItem === false && previousOpendItem.current !== false) context.closeAll();
    previousOpendItem.current = input.opendItem;
  }, [context, input.opendItem]);

  return (
    <UPSwipeActionContext.Provider value={context}>
      <View style={input.customStyle} testID="up-swipe-action">{input.children}</View>
    </UPSwipeActionContext.Provider>
  );
}
```

Do not synthesize an open child from `opendItem={true}`: upstream also has no
child-selection mechanism. The item calls `notifyOpen` at native `willOpen`;
the item calls `notifyClose` after native `close`.

- [ ] **Step 4: Implement item state, option UI, native mapping, and source callbacks**

Create `src/components/swipe-action/UPSwipeActionItem.tsx` with these imports
and public types:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { useUPSwipeActionContext, type UPSwipeActionItemHandle } from './context';

export type UPSwipeActionOption = {
  text?: string;
  icon?: string;
  iconSize?: UPDimension;
  style?: StyleProp<ViewStyle & TextStyle>;
};

export type UPSwipeActionItemProps = {
  show?: boolean;
  closeOnClick?: boolean;
  name?: string | number;
  disabled?: boolean;
  /** @deprecated Source child auto-close is controlled by the parent. */
  autoClose?: boolean;
  threshold?: UPDimension;
  options?: readonly UPSwipeActionOption[];
  /** @deprecated ReanimatedSwipeable has no per-item transition duration API. */
  duration?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: { index: number; name: string | number }) => void;
  onOpen?: (name: string | number) => void;
  onClose?: (name: string | number) => void;
  onUpdateShow?: (show: boolean) => void;
};
```

Merge source defaults, create the internal native ref, and register the parent
handle using this lifecycle:

```tsx
const props = { ...useUPConfig().props.swipeActionItem, ...input } as UPSwipeActionItemProps;
const parent = useUPSwipeActionContext();
const swipeableRef = useRef<SwipeableMethods>(null);
const [open, setOpen] = useState(Boolean(props.show));
const controlled = input.show !== undefined;
const name = props.name ?? '';

const close = useCallback(() => swipeableRef.current?.close(), []);
const handle = useMemo<UPSwipeActionItemHandle>(() => ({ close }), [close]);

useEffect(() => parent?.register(handle), [handle, parent]);
useEffect(() => {
  if (!controlled) return;
  if (props.show) swipeableRef.current?.openRight();
  else swipeableRef.current?.close();
}, [controlled, props.show]);
```

Keep `open` for native state synchronization. It should be referenced by the
component (for example, in a `data-open` test-only prop is not permitted in RN;
instead use it to suppress duplicate state updates) so lint does not reject it:

```tsx
const handleOpen = () => {
  if (!open) setOpen(true);
  input.onUpdateShow?.(true);
  input.onOpen?.(name);
};
const handleClose = () => {
  if (open) setOpen(false);
  input.onUpdateShow?.(false);
  input.onClose?.(name);
  parent?.notifyClose(handle);
};
const handleWillOpen = () => parent?.notifyOpen(handle);
```

Render options by flattening their React Native style and using its compatible
`backgroundColor`, `borderRadius`, `color`, and `fontSize` fields:

```tsx
const renderRightActions = () => (
  <View style={{ flexDirection: 'row' }} testID="up-swipe-action-options">
    {(props.options ?? []).map((option, index) => {
      const optionStyle = StyleSheet.flatten(option.style) ?? {};
      const color = typeof optionStyle.color === 'string' ? optionStyle.color : '#ffffff';
      const fontSize = optionStyle.fontSize === undefined ? 16 : getPx(optionStyle.fontSize as UPDimension);
      const iconSize = option.iconSize === undefined
        ? (optionStyle.fontSize === undefined ? 17 : fontSize * 1.2)
        : getPx(option.iconSize);
      return (
        <Pressable
          key={`${String(name)}-${index}`}
          onPress={() => {
            input.onClick?.({ index, name });
            if (props.closeOnClick) close();
          }}
          style={[
            { alignItems: 'center', backgroundColor: '#C7C6CD', justifyContent: 'center', paddingHorizontal: 15 },
            optionStyle,
          ]}
          testID={`up-swipe-action-option-${index}`}
        >
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            {option.icon ? <UPIcon color={color} name={option.icon} size={iconSize} customStyle={option.text ? { marginRight: 2 } : undefined} /> : null}
            {option.text ? <Text style={{ color, fontSize, lineHeight: fontSize }}>{option.text}</Text> : null}
          </View>
        </Pressable>
      );
    })}
  </View>
);
```

Return exactly this native mapping:

```tsx
return (
  <View style={input.customStyle} testID="up-swipe-action-item">
    <ReanimatedSwipeable
      enabled={!props.disabled}
      overshootRight={false}
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={getPx(props.threshold ?? 20)}
      onSwipeableClose={handleClose}
      onSwipeableOpen={handleOpen}
      onSwipeableWillOpen={handleWillOpen}
      testID="up-swipe-action-native"
    >
      {input.children}
    </ReanimatedSwipeable>
  </View>
);
```

Omit `renderLeftActions`; do not forward `duration`, item `autoClose`, or
`customClass` to native props; do not add a child-content press handler.

- [ ] **Step 5: Add exports and run focused validation**

Create `src/components/swipe-action/index.ts`:

```ts
export * from './UPSwipeAction';
export * from './UPSwipeActionItem';
```

Add this barrel beside `row-notice` in `src/components/index.ts`:

```ts
export * from './swipe-action';
```

Run:

```powershell
npm test -- --runInBand tests/components/UPSwipeAction.test.tsx
npm run typecheck
```

Expected: PASS. The focused suite now proves source defaults, right-only native
mapping, controlled state, sibling closure, source payloads, close-on-click,
close-all, config reactivity, and explicit prop precedence.

### Task 3: Document P16 and Add an Interactive Example

**Files:**
- Modify: `README.md:38-82`
- Modify: `docs/compatibility.md` after `## P15 row notice`
- Modify: `docs/gap-matrix.md:210-218`
- Modify: `example/App.tsx:1-177`

**Interfaces:**
- Documents the parent/item boundary, source controlled state, option events, and native no-op limits.
- Demonstrates two swipe rows so sibling auto-close is observable on Android and iOS.

- [ ] **Step 1: Update README project status**

Insert this link after P15:

```markdown
- [P16 swipe action plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p16-swipe-action.md)
```

Append this paragraph after the P15 status paragraph:

```markdown
P16 adds `UPSwipeAction` and `UPSwipeActionItem`, preserving source right-side
options, controlled opening, sibling auto-close, and action payloads through
native `ReanimatedSwipeable`.
```

- [ ] **Step 2: Add compatibility guide and gap-matrix rows**

Append this section after `## P15 row notice` in `docs/compatibility.md`:

````markdown
## P16 swipe action

`UPSwipeAction` coordinates sibling `UPSwipeActionItem` rows. A native left
swipe opens source-compatible right-side `options`; the default parent
`autoClose` closes another row as one opens. `show` and `onUpdateShow` retain
the source controlled contract, while option clicks emit `{ index, name }`.

```tsx
<UPSwipeAction>
  <UPSwipeActionItem
    name="invoice-42"
    options={[{ icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' }]}
    onClick={({ name }) => removeInvoice(name)}
  >
    <UPCell title="Invoice #42" />
  </UPSwipeActionItem>
</UPSwipeAction>
```

The implementation uses `react-native-gesture-handler/ReanimatedSwipeable`.
Source WXS/nvue gesture code, CSS transition-duration control, content-tap
close behavior, left actions, and CSS classes are unavailable in this native
mapping. `duration`, child `autoClose`, and `customClass` remain typed no-ops.
````

Insert this section before `## Deferred Source Components` in
`docs/gap-matrix.md`:

```markdown
## P16 Swipe Action

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-swipe-action` | `autoClose`, `opendItem` | `UPSwipeAction`, `onUpdateOpendItem` | Parent coordinates registered children and closes siblings by default | Emulated | `tests/components/UPSwipeAction.test.tsx` |
| `u-swipe-action-item` | `show`, `options`, `click`, `closeOnClick` | `UPSwipeActionItem`, `onUpdateShow`, `onClick({ index, name })` | Native right actions retain source option payload and close semantics | Emulated | `tests/components/UPSwipeAction.test.tsx` |
| `u-swipe-action-item` | WXS/nvue gestures, CSS duration/classes, child `autoClose` | Retained `duration`, `autoClose`, `customClass` | `ReanimatedSwipeable` owns native gesture/timing; source-only values are no-ops | No-op retained | `src/components/swipe-action/UPSwipeActionItem.tsx` |
```

- [ ] **Step 3: Add a live two-row example and validate library plus example**

In `example/App.tsx`, import `UPSwipeAction` and `UPSwipeActionItem`. Add this
state alongside P14/P15 state:

```tsx
const [lastSwipeAction, setLastSwipeAction] = useState('');
```

Render this immediately below the P15 row-notice example:

```tsx
<Text style={styles.section}>Swipe actions</Text>
<UPSwipeAction>
  <UPSwipeActionItem
    name="invoice-42"
    options={[
      { icon: 'chat', style: { backgroundColor: '#3c9cff' }, text: 'Reply' },
      { icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' },
    ]}
    onClick={({ index, name }) => setLastSwipeAction(`${name}:${index}`)}
  >
    <UPCell title="Invoice #42" value="Swipe left" />
  </UPSwipeActionItem>
  <UPSwipeActionItem
    name="invoice-43"
    options={[{ icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' }]}
    onClick={({ index, name }) => setLastSwipeAction(`${name}:${index}`)}
  >
    <UPCell title="Invoice #43" value="Swipe left" />
  </UPSwipeActionItem>
</UPSwipeAction>
<Text>Last swipe action: {lastSwipeAction || 'none'}</Text>
```

Run:

```powershell
npm test -- --runInBand tests/components/UPSwipeAction.test.tsx
npm run typecheck
npm run lint
npm run build
Push-Location example
npx tsc --noEmit
npm run lint
npm test -- --runInBand
Pop-Location
```

Expected: all commands exit zero. The existing example rendering test confirms
the new swipe components live beneath its current `UPRoot` gesture provider.

### Task 4: Run the P16 Full Quality Gate

**Files:**
- Verify: all P16 component, test, documentation, example, spec, and plan files.

**Interfaces:**
- Verifies public exports, reactive defaults, full package build output, and the absence of new dependencies.
- Retains the intentionally dirty workspace and does not create a package archive.

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

Expected: all library tests, TypeScript, lint, build, dry-run package, and
whitespace checks exit zero. The dry-run package lists swipe-action source and
generated output without creating `ultra-ui-rn-0.1.0.tgz`.

- [ ] **Step 2: Confirm scope and package artifact cleanliness**

Run:

```powershell
git status --short
git diff -- README.md docs/compatibility.md docs/gap-matrix.md docs/superpowers/specs/2026-07-26-ultra-ui-react-native-p16-swipe-action-design.md docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p16-swipe-action.md example/App.tsx src/components/swipe-action src/components/index.ts src/config/defaults.ts src/config/store.ts tests/components/UPSwipeAction.test.tsx
if (Test-Path 'ultra-ui-rn-0.1.0.tgz') { throw 'npm pack --dry-run must not leave a tarball.' }
```

Expected: P16 files appear alongside existing intentionally dirty files. Do not
commit, reset, clean, delete, or otherwise modify unrelated workspace state.

## Plan Self-Review

- **Spec coverage:** Task 1 covers defaults, native mapping, controlled state, parent auto-close, source option payloads, close-on-click, close-all, and configuration updates. Task 2 adds each default/store path, Context boundary, parent aggregation, item lifecycle, option UI, and exports. Task 3 documents native limits and adds a live two-row example. Task 4 runs all acceptance gates.
- **Placeholder scan:** Tasks name every file, public type, test ID, mock boundary, source value, code structure, validation command, and expected result. No implementation placeholder remains.
- **Type consistency:** `UPSwipeActionProps`, `UPSwipeActionItemProps`, `UPSwipeActionOption`, `UPSwipeActionItemHandle`, `onUpdateOpendItem`, `onUpdateShow`, `show`, `opendItem`, `autoClose`, and `{ index, name }` use matching names and compatible types throughout.
