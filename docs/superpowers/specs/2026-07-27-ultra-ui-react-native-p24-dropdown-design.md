# P24: `u-dropdown` Component Family Design

## Goal

Port uView Plus `u-dropdown` and `u-dropdown-item` to React Native as
`UPDropdown` and `UPDropdownItem`. Preserve source selection behavior,
configuration defaults, public props, callbacks, and imperative parent methods
while mapping Vue slots to React nodes and source positioning to the existing
root overlay infrastructure.

## Scope

This phase adds only the dropdown family:

- `UPDropdown`
- `UPDropdownItem`
- Context and public ref types required by those components
- Default configuration entries, exports, documentation, example usage, and
  component tests

No dependencies are added. Calendar, cascader, date-picker, upload, and all
other deferred upstream component families remain outside this phase.

## Public API

### `UPDropdown`

`UPDropdown` renders the horizontal menu bar and owns the one active dropdown
index. It retains the source props:

- `activeColor`, `inactiveColor`
- `closeOnClickMask`, `closeOnClickSelf`
- `duration`, `height`, `borderBottom`, `titleSize`, `borderRadius`
- `menuIcon`, `menuIconSize`
- `customStyle` and retained no-op `customClass`
- `onOpen(index)` and `onClose(index)`

Its ref exposes source-compatible methods:

- `open(index)` opens the registered, enabled item at `index`.
- `close()` closes the current item and reports its index once.
- `highlight(index?: number | readonly number[])` changes menu-label active
  styling without opening those items.

The parent measures its menu bar in window coordinates. The active item is
rendered through `UPRoot`'s overlay registry immediately below that bar, rather
than in an absolute child view. This prevents clipping in native scroll and
overflow containers.

### `UPDropdownItem`

Each item registers its title, disabled state, content, and selection state
with the nearest `UPDropdown`. It retains:

- `modelValue` plus legacy `value` input alias
- `title`, `options`, `disabled`, `height`, `closeOnClickOverlay`
- `customStyle` and retained no-op `customClass`
- `onUpdateModelValue(value)` and `onChange(value)`

The default option mode accepts source-shaped `{ label, value }` entries. The
selected row uses the parent's active color, displays the source check icon,
and permits loose source-equivalent comparison between its model value and an
option value. Its `height` is applied to the native option `ScrollView`; `auto`
does not impose a height cap.

When `children` is provided, it replaces the default option list completely.
The custom node receives no inferred option protocol. Its owner updates any
model state and closes the currently expanded panel through `UPDropdownRef`.
This directly maps source slot ownership and avoids guessing custom data
shapes.

## State and Events

`UPDropdown` owns `activeIndex: number | null`. Opening a different enabled
menu switches directly to it and emits `onOpen(newIndex)`. Tapping the active
menu closes it only when `closeOnClickSelf` is true. Disabled menus never open.

The root overlay has a transparent pressable mask from the menu bar's bottom
edge to the screen bottom. A mask press closes only when both the parent
`closeOnClickMask` and active item's `closeOnClickOverlay` are true. The
visible panel consumes press events, preserving interaction with item content.

In default option mode, a press emits `onUpdateModelValue(value)`, then
`onChange(value)`, then closes the parent. The close callback receives the
active menu index before active state clears. The parent does not mutate a
controlled `modelValue`; it uses the source-compatible local value only when
neither `modelValue` nor `value` is supplied.

## Rendering and Styles

The menu bar divides its width equally across registered children. The active
or highlighted label uses `activeColor`; disabled labels use native disabled
color; other labels use `inactiveColor`. The configured menu icon rotates 180
degrees for the active item. `borderBottom` draws a native bottom line.

The root-layer panel has a white background, a configurable bottom radius, and
an `UPTransition` slide-down animation using `duration`. The panel spans the
window width at the measured x-coordinate/width of the parent menu, constrained
to the window bounds. If it opens before measurement, it uses a safe full-width
fallback below the menu height and updates after layout.

The design intentionally does not use `UPPopup`: its edge-pinned modes cannot
start at a measured menu boundary or limit the overlay mask below that
boundary. It does reuse the same root-overlay and `UPTransition` primitives as
the existing popup, select, and tooltip implementations.

## Compatibility Limits

React Native core has no Vue component instance registration, CSS classes,
CSS transitions, or source touch-move prevention. React context replaces Vue
parent/child registration, React nodes replace slots, `UPTransition` replaces
CSS animation, and native styles replace CSS classes. `customClass` remains a
typed no-op.

The source dropdown is locally positioned. The native implementation chooses a
root-layer panel to avoid clipping; it remains visually anchored below the
measured menu bar. Exact CSS transform timing, Web/nvue touch cancellation,
and source mini-program layout quirks are unavailable.

## Tests

`tests/components/UPDropdown.test.tsx` will cover:

- default option rendering, controlled and local model updates, callback order,
  and option check state
- disabled menu and disabled menu visual state
- opening, switching, self-close policy, parent and item mask-close policies,
  and parent `onOpen`/`onClose` indexes
- ref `open`, `close`, and `highlight` behavior, including invalid or disabled
  indexes
- custom children replacing default options and application-triggered ref close
- active colors, icon rotation, border, configured defaults, and public exports

Documentation will add a compatibility section, a gap-matrix row, and a small
controlled example using the parent ref for custom content.
