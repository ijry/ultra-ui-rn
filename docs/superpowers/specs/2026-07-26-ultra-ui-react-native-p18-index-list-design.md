# React Native P18 Index List Design

## Goal

Port `u-index-list`, `u-index-item`, and `u-index-anchor` from uview-plus 3.8.86.

Export `UPIndexList`, `UPIndexItem`, and `UPIndexAnchor`.

Preserve source index rails, group jumps, active state, defaults, styling, and selection payloads.

## Scope

P18 adds only this component family, defaults, exports, tests, example, and documentation.

It adds no native dependency, virtualized data layer, global scroll adapter, or drag gesture.

`UPIndexList` owns a native `ScrollView` and a separate parent context.

## Source Defaults

```ts
indexList: {
  inactiveColor: '#606266',
  activeColor: '#5677fc',
  indexList: [],
  sticky: true,
  customNavHeight: 0,
  safeBottomFix: false,
  itemMargin: '0rpx',
}

indexAnchor: {
  text: '',
  color: '#606266',
  size: 14,
  bgColor: '#f1f1f1',
  height: 32,
}
```

An empty source index list renders A through Z.

Source values are primitives or objects with a `key` field.

The source rail selects exact values, highlights active values, and jumps to matching groups.

Source scrolling derives active state from measured group positions.

An anchor displays `text.name || text` in a left-padded full-width header.

## React Native API

```tsx
export type UPIndexValue = string | number | { key?: string | number; name?: string };

export type UPIndexListProps = {
  inactiveColor?: string;
  activeColor?: string;
  indexList?: readonly UPIndexValue[];
  sticky?: boolean;
  customNavHeight?: UPDimension;
  safeBottomFix?: boolean;
  itemMargin?: UPDimension;
  height?: UPDimension;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onSelect?: (index: UPIndexValue) => void;
};

export type UPIndexItemProps = {
  index?: string | number;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
};

export type UPIndexAnchorProps = {
  text?: string | number | { name?: string };
  color?: string;
  size?: UPDimension;
  bgColor?: string;
  height?: UPDimension;
  sticky?: boolean;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
};
```

React nodes `header` and `footer` replace named Vue slots.

`customClass` is a typed no-op.

Anchor children replace source anchor text but retain the resolved group label.

Object rail labels use `key`, then `name`, then `''`.

Callbacks preserve original object references.

## Architecture

`UPIndexList` merges `useUPConfig().props.indexList` with explicit props.

It creates A through Z only when the resolved list is empty.

Its context registers and unregisters item key/y positions.

Its context provides parent `sticky` and current active group state.

`UPIndexItem` uses explicit `index` or its nested anchor label as group key.

Item `onLayout` records group y position.

`UPIndexAnchor` reports its label to the nearest item context.

An explicit anchor `sticky` prop overrides parent `sticky`.

Each rail label is an accessible `Pressable` button.

A rail press sets the active rail value.

A rail press calls `onSelect` with the exact input entry.

A matching group scrolls with `scrollTo({ y: itemY - customNavHeight, animated: true })`.

A missing group still emits and highlights but does not invent a scroll target.

On scroll, the last group with y less than or equal to `offset + customNavHeight` is active.

Before the first group, no rail value is active.

Groups absent from the rail do not activate any rail value.

`itemMargin` is native item bottom margin and contributes to measured layout.

The root is relative and its rail is absolute at the right edge.

The active rail uses source active background and white text.

Inactive rail labels use source inactive color.

P18 implements discrete rail buttons, not source continuous drag selection.

P18 does not render the source enlarged drag indicator.

## Reactivity

Add frozen `UP.props.indexList` and `UP.props.indexAnchor` tables.

Add matching `UPProps`, config override, state construction, and merge paths.

`UPIndexItem` has no defaults because upstream defines no item props.

Mounted lists and anchors use `useUPConfig`.

`UP.setConfig({ props: { indexList, indexAnchor } })` updates unresolved props.

Explicit component props retain precedence.

## Compatibility Limits

React Native cannot exactly reproduce CSS sticky behavior through arbitrary nested children.

`sticky` gives anchors an opaque elevated header surface but not guaranteed pinning.

WXS/nvue behavior, mini-program IDs, continuous drag, enlarged indicator, and automatic safe-area adjustment are unavailable.

`safeBottomFix`, `customClass`, and CSS-only string styles remain typed no-ops.

`customNavHeight` remains a native jump and active-offset value.

Before item layout is registered, rail presses still emit/select but cannot scroll to that group.

## Test Plan

Add `tests/components/UPIndexList.test.tsx` under `UPRoot`.

Simulate layout and native scroll events without replacing React Native `ScrollView`.

Verify default A-Z and custom primitive/object rails.

Verify source active and inactive colors.

Verify anchor text, styles, child replacement, and sticky input.

Verify item registration and rail press payload identity.

Verify jump y offsets subtract `customNavHeight`.

Verify missing groups select/highlight without scroll.

Verify scroll active boundaries and inactive state before first group.

Verify item margin, no-op compatibility props, global defaults, explicit precedence, and root exports.

## Documentation and Acceptance Criteria

Update `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx`.

The example composes index list, items, anchors, and visible `onSelect` output.

Acceptance requires root exports, tested rail/jump/active/anchor/default behavior, and no dependency change.

Library and example typecheck, lint, Jest, build, dry-run package, and whitespace gates must pass.
