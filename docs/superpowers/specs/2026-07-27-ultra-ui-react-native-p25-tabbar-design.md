# P25: `u-tabbar` Component Family Design

## Goal

Port uView Plus `u-tabbar` and `u-tabbar-item` to React Native as `UPTabbar`
and `UPTabbarItem`. Preserve source selection, default styling, parent-child
inheritance, badges, and events while keeping routing application-owned.

## Scope

This phase adds only the tabbar family:

- `UPTabbar`
- `UPTabbarItem`
- Context and public types required by those components
- Default configuration, public exports, tests, an example, compatibility
  documentation, and gap-matrix rows

No routing, navigation-library integration, or additional dependency is added.
Calendar, cascader, upload, and all other deferred upstream components remain
outside this phase.

## Public API

### `UPTabbar`

`UPTabbar` owns selected-name state and supplies shared styling to child items.
It supports source `value` and React-compatible `modelValue` aliases, plus a
native-only `defaultValue` for uncontrolled initial selection. The resolved
selection priority is `value`, `modelValue`, `defaultValue`, then source default
`value`.

It retains these source props:

- `safeAreaInsetBottom`, `border`, `borderColor`, `zIndex`
- `activeColor`, `inactiveColor`, `fixed`, `placeholder`, `backgroundColor`
- `styleType`, `animationType`, `activeBackgroundColor`,
  `inactiveBackgroundColor`, `itemShape`, `iconScale`, `textMode`
- `customStyle` and typed deprecated `customClass`

It exposes `onChange(name)` and `onClick(name)`. Pressing a non-active child
updates uncontrolled internal selection and emits `onChange(name)` before
`onClick(name)`. Pressing the active child emits only `onClick(name)`. In
controlled mode, the parent never mutates its chosen value.

The component does not navigate or manage screens. Applications respond to its
callbacks and update `value` or `modelValue` when using controlled selection.

### `UPTabbarItem`

Each `UPTabbarItem` consumes the nearest parent context. It retains source
props:

- `name`, `icon`, `activeIcon`, `inactiveIcon`, `badge`, `dot`, `text`,
  `badgeStyle`
- `mode`, `activeClass`, `inactiveClass`
- `midButtonBgColor`, `midButtonIconColor`, `midButtonIconSize`,
  `midButtonBoxShadow`, `midButtonInnerBoxShadow`, `midButtonOffsetY`
- `customStyle` and typed deprecated `customClass`

When `name` is missing, the item's React child index is its selection identity,
matching the source fallback. `activeIconNode`, `inactiveIconNode`, and
`textNode` replace source named icon/text slots. Source string classes stay
typed no-ops. `badgeStyle` accepts a native `ViewStyle`; CSS style strings are
retained but ignored.

## Rendering and State

The parent renders an equal-width item row with a base height of 50 px. When
`safeAreaInsetBottom` is true, `UPSafeBottom` fills the device bottom inset.
The parent measures the full content with `onLayout` and, when both `fixed` and
`placeholder` are true, renders a layout spacer of the measured height.

`fixed` maps to parent-relative native `{ position: 'absolute', bottom: 0,
left: 0, right: 0 }`, not CSS viewport fixed. It works inside ordinary native
layout trees. Applications that need a full-screen persistent bar mount it as a
direct child of their page/root layout and keep the underlying content padded or
use `placeholder`.

Each item uses the parent active state, colors, background colors, style type,
and text mode. It renders its active or inactive icon node before falling back
to the matching icon prop. `dot` overrides badge text. The native badge is a
small absolute view over the icon; it displays only when `dot` is true or the
badge is a non-empty non-zero source value.

`mode="midButton"` renders a 64 px circular button with configurable native
background, icon color, size, and vertical offset. Source string box-shadow
props remain typed compatibility values but cannot be parsed by React Native
core.

## Style Mapping

All source style types are retained as strings. The native implementation
expresses these states without CSS classes:

- `default` and `minimal`: standard equal-width row.
- `underline`: active item receives a bottom color bar.
- `dot`: active item receives a bottom dot.
- `pill`, `card`, and `glow`: active item uses parent background colors and
  native rounded surfaces; `glow` uses a light active background fallback.
- `lift`: active icon/text move upward through native transforms.
- `convex`: bar and non-mid active items use rounded native surface treatment.

`itemShape` maps `round` and `square` to native border radii. `animationType`
maps `scale`, `lift`, and `swing` to static native transform states when active;
`pulse` uses the scale state without a CSS keyframe loop. `textMode="active"`
reduces inactive text opacity and scale.

## Compatibility Limits

React Native core has no viewport CSS fixed positioning, class runtime, Vue
child instances, CSS keyframes, source touch-move prevention, or support for
string `box-shadow`/style declarations. Context replaces source parent-child
registration; React nodes replace slots; native layout and transforms replace
CSS. `fixed` is parent-relative, `customClass`, `activeClass`, and
`inactiveClass` are no-ops, and unsupported string visual props stay typed but
are ignored.

## Tests

`tests/components/UPTabbar.test.tsx` will cover:

- controlled and uncontrolled `value` / `modelValue` selection, including
  source numeric/string names and name-index fallback
- `onChange` only for non-active items, `onClick` for every press, and callback
  ordering
- active/inactive icon resolution, React node slot replacements, text, badge,
  dot precedence, and supported native badge styling
- safe-area content, fixed parent-relative style, layout-measured placeholder,
  border/background/default configuration, and explicit-prop precedence
- style type indicators, active backgrounds, text mode, icon transforms,
  item shape, and mid-button visual mapping
- public exports and nested-child context behavior

Documentation will add a controlled application-owned navigation example and
state the parent-relative `fixed` limitation and unsupported CSS-only source
visual behavior.
