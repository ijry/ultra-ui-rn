# P21 Tooltip and Popover Design

## Scope

P21 ports uview-plus 3.8.86 `u-tooltip` and its `u-popover` wrapper as
`UPTooltip` and `UPPopover`. The components use the existing `UPRoot` overlay
registry so their content escapes parent scroll and clipping boundaries. No
native or JavaScript dependencies are added.

The scope excludes `u-dropdown` and `u-dropdown-item`; their parent/child
menu registration and viewport masking are a separate selection-surface
phase.

## Public Contract

`UPTooltip` supports source `text`, `copyText`, `size`, `color`, `bgColor`,
`popupBgColor`, `direction`, `zIndex`, `showCopy`, `buttons`, `overlay`,
`showToast`, `triggerMode`, `forcePosition`, `show`, and `singleton` props.
React named-slot equivalents are `trigger` and `content`; `children` aliases
the trigger for normal React composition. It exposes an imperative
`UPTooltipRef` with `open()` and `close()`, and callbacks `onOpen`, `onClose`,
`onUpdateShow`, and `onClick(index)`.

`triggerMode="click"` opens through a native accessible press and
`triggerMode="longpress"` opens through a native long press. Manual mode
reacts to `show`; `hover` is retained only for popover compatibility because
React Native core has no cross-platform hover event. In source `u-tooltip`,
the declared `click` event is emitted for copy/action list selection, not for
the trigger press; the React Native port preserves that behavior.

`UPPopover` is a thin forwarding wrapper with its own source default values.
Its `trigger` and `content` React nodes map to source named slots, and it
forwards the same callbacks and `open()`/`close()` ref. Its `placement` prop
is retained because the upstream wrapper passes it into a tooltip prop that
does not consume it; actual placement continues to use source `direction`.

## Positioning and Overlay

Opening measures the trigger with `measureInWindow` and initially renders at a
stable fallback frame when React Native test or platform measurement is not
yet available. The root layer measures its own popup, then aligns top, bottom,
left, or right to the trigger while clamping within a 12 px screen inset.
`forcePosition` merges last and therefore overrides computed position fields.

The source transparent mask maps to `UPOverlay` with zero opacity. When
enabled, it blocks touch-through and closes the bubble. The popup uses the
source dark fallback (`#060607`), 5 px radius, 13 px action labels, and a
rotated indicator. Native `Pressable` plus `accessibilityRole="button"`
replace source hover/touch bindings.

## State, Copying, and Singleton Semantics

Each tooltip has local visible state, synchronizes manual `show` updates, and
emits visibility transitions exactly once. A module-level singleton registry
closes the previous visible singleton before opening the next one, and clears
when a component closes or unmounts.

The source `uni.setClipboardData` call maps to an optional application-owned
`writeText(content)` adapter, matching `UPCopy`. Copy emits `onClick(0)` and
closes before calling the adapter. Additional button labels emit source
indexes, offset by one when copy is visible. With `showToast`, adapter results
use `UP.toast` success/failure feedback. A missing adapter reports failure and
warns only in development.

## Defaults, Documentation, and Verification

`UP.props.tooltip` gains the exact source default table and reactive merge
support. Explicit component props override config values. `UPPopover` applies
its hard-coded source wrapper defaults before passing values to `UPTooltip`.

Tests cover click/longpress/manual modes, overlay dismissal, force position,
copy adapter outcomes and source indexes, singleton behavior, configured
defaults, popover content/trigger mapping, and imperative refs. README,
compatibility documentation, the gap matrix, and the example demonstrate a
controlled tooltip action surface and document no-op hover/placement limits.
