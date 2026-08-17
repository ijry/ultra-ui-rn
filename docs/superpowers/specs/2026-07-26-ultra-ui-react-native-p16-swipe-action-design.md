# React Native P16 Swipe Action Design

## Goal

Port uview-plus 3.8.86 `u-swipe-action` and `u-swipe-action-item` as
`UPSwipeAction` and `UPSwipeActionItem`. Preserve the source right-side action
API, controlled open state, automatic sibling closing, option click payloads,
and source defaults while using the repository's installed native swipe
implementation.

## Scope

P16 adds only the swipe-action parent and item component pair. It does not
modify existing list, cell, notice, or gesture-root components. `UPRoot`
already supplies `GestureHandlerRootView`, and the package already includes
`react-native-gesture-handler` plus `react-native-reanimated`.

The implementation uses `ReanimatedSwipeable` from
`react-native-gesture-handler`. Only the source's right-side options are
rendered because `u-swipe-action-item` exposes only `options` / right actions.
No new runtime dependencies are introduced.

## Source Contract

The parent source component provides `autoClose`, defaulting to `true`. It
keeps its child items coordinated: when an item begins opening, it closes every
other registered child when `autoClose` is enabled. Setting the source
`opendItem` value to `false` closes all children.

The item source defaults are:

```ts
{
  show: false,
  closeOnClick: true,
  name: '',
  disabled: false,
  threshold: 20,
  autoClose: true,
  options: [],
  duration: 300,
}
```

Each source option may include `text`, `icon`, `iconSize`, and `style`. A
button press emits `{ index, name }`, then closes when `closeOnClick` is true.
The source opens or closes from the `show` prop and emits `update:show` on any
state transition. Its source gestures expose only right-side buttons, clamp
translation to their measured width, use `threshold` for release decisions,
and close an open item after a short right drag or a content tap.

## React Native API

```tsx
export type UPSwipeActionProps = {
  autoClose?: boolean;
  opendItem?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  children?: React.ReactNode;
  onUpdateOpendItem?: (open: boolean) => void;
};

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
  autoClose?: boolean;
  threshold?: UPDimension;
  options?: readonly UPSwipeActionOption[];
  duration?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: { index: number; name: string | number }) => void;
  onOpen?: (name: string | number) => void;
  onClose?: (name: string | number) => void;
  onUpdateShow?: (show: boolean) => void;
};
```

`customClass` is a deprecated typed no-op. `onUpdateShow` maps source
`update:show`; `onUpdateOpendItem` maps the parent source's `opendItem:update`
event. The source names this prop `opendItem`, including its spelling, so the
React Native API retains that name for compatibility.

`style` accepts React Native view/text style fields. `backgroundColor`,
`color`, `borderRadius`, and `fontSize` provide the source-compatible option
surface; unsupported CSS fields are ignored by React Native style processing.

## Architecture and State Flow

`UPSwipeAction` consumes `useUPConfig().props.swipeAction`, merges explicit
props over those defaults, and supplies a context containing:

- the resolved parent `autoClose` value;
- `register(item)` and `unregister(item)` functions for item close handles;
- `open(item)`, which closes other registered items if parent auto-close is
  enabled, then emits `onUpdateOpendItem(true)`;
- `close(item)`, which emits `onUpdateOpendItem(false)` only when no items
  remain open.

When an explicit `opendItem={false}` arrives after mount, the parent closes all
registered children. It does not manufacture an open item when
`opendItem={true}` because the source parent also has no child-selection
mechanism.

`UPSwipeActionItem` merges `useUPConfig().props.swipeActionItem` with its
explicit props. A `ReanimatedSwipeable` reference is registered with the
parent. The item tracks internal `open` state when `show` is not supplied;
when `show` is supplied, an effect calls `openRight()` or `close()` to follow
the controlled value. Every native open/close callback synchronizes the local
state, invokes `onUpdateShow`, invokes `onOpen(name)` or `onClose(name)`, and
notifies its parent coordinator.

On `onSwipeableWillOpen`, the item invokes parent `open(item)` before the
native panel completes its transition. It maps `rightThreshold` to
`getPx(threshold)`, maps `disabled` to `enabled={false}`, disables overshoot,
and renders no left action panel. A close request from the parent calls the
item's `SwipeableMethods.close()` and then follows normal close state
synchronization.

Each right option is a `Pressable` rendered inside `renderRightActions`. The
button first calls `onClick({ index, name })`. If `closeOnClick` is true, it
then calls the item's close operation. Default button presentation is source
compatible: `#C7C6CD` background, white content, centered row layout, and 15px
horizontal padding. A source icon is rendered with `UPIcon`; text is rendered
with `Text`; both use `style.color` and `style.fontSize` when supplied.

## Defaults and Config Reactivity

P16 adds frozen source tables in `UP.props`:

```ts
swipeAction: Object.freeze({
  autoClose: true,
}),
swipeActionItem: Object.freeze({
  show: false,
  closeOnClick: true,
  name: '',
  disabled: false,
  threshold: 20,
  autoClose: true,
  options: Object.freeze([]),
  duration: 300,
}),
```

Matching entries in `UPProps`, `UPConfigOverrides['props']`, source-state
creation, and config merging make global defaults observable. Mounted parent
and item components update through `useUPConfig()`; explicit component props
always take precedence.

The item-level source `autoClose` is retained in the public config and API.
The parent source logic controls actual coordination, so parent `autoClose`
determines whether siblings close. Item-level `autoClose` is a compatibility
no-op, reflecting that upstream item gesture code delegates this decision to
its parent.

## Compatibility Limits

- `ReanimatedSwipeable` replaces source web WXS, nvue, mini-program, and CSS
  transition implementations. Native gesture arbitration, release behavior,
  and animation timing remain platform-owned.
- The source `duration` prop is retained but no-op because the supported
  `ReanimatedSwipeable` public API has no per-item transition-duration field.
- Source content-tap-to-close behavior follows the native swipeable's gesture
  behavior; P16 does not install an extra content press handler that could
  conflict with arbitrary children.
- Left actions, source CSS classes, scoped styles, and raw CSS-only style
  fields are unavailable. `customClass` remains a typed no-op.

## Test Plan

Add `tests/components/UPSwipeAction.test.tsx` under `UPRoot`, using the Jest
gesture-handler setup already present in `tests/setup.ts`. Mock only
`ReanimatedSwipeable` with a forward ref that exposes `close`, `openRight`, and
records its callback props; do not mock the entire `react-native-gesture-handler`
package.

The suite verifies:

- source defaults, option default styles, icons/text, and no left action;
- `rightThreshold`, disabled gesture mapping, and option style overrides;
- initial and changed controlled `show` values invoke native open/close
  handles and sync `onUpdateShow`;
- native open/close callbacks emit the source name and coordinate parent state;
- parent `autoClose=true` closes only sibling rows, while `false` retains them;
- button callbacks carry exactly `{ index, name }`, and `closeOnClick` changes
  whether the native close handle runs;
- `opendItem={false}` closes all mounted children;
- mounted `UP.setConfig({ props: { swipeAction, swipeActionItem } })` updates
  unresolved props, while explicit props preserve precedence;
- package-root value and type exports compile through the regular typecheck and
  public-entry coverage.

## Documentation and Acceptance Criteria

Update `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx` with an interactive deletion/reply action example and the
native implementation limits.

P16 is accepted when `UPSwipeAction` and `UPSwipeActionItem` export from the
package root; source defaults are reactive through `UP.setConfig()`; parent
auto-close, controlled `show`, option payloads, and `closeOnClick` are tested;
and the library plus example typecheck, lint, Jest, build, dry-run pack, and
whitespace gates all pass without new dependencies.
