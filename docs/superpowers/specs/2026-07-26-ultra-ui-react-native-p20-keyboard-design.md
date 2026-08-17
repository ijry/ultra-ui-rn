# P20 Keyboard Family Design

## Scope

P20 ports the source `u-keyboard`, `u-number-keyboard`, and
`u-car-keyboard` components from uview-plus 3.8.86 as `UPKeyboard`,
`UPNumberKeyboard`, and `UPCarKeyboard`. The components remain controlled:
the parent owns `show` and responds to `onChangeShow` when the keyboard is
dismissed.

No new native dependency is introduced. The existing `UPPopup`, root overlay,
safe-area provider, icon map, and React Native `Pressable` primitives provide
the required behavior on Android and iOS.

## Public Contract

`UPKeyboard` supports the source `number`, `card`, and `car` modes. It maps
the source bottom popup, optional toolbar, safe-bottom padding, overlay, and
overlay dismissal onto `UPPopup`. It exposes `onChange(value)`,
`onBackspace()`, `onCancel()`, `onConfirm()`, `onClose()`, and
`onChangeShow(show)`; `children` renders above the source toolbar.

`UPNumberKeyboard` is a standalone key grid. `number` mode renders digits,
an optional decimal point, and a backspace action. With `dotDisabled`, its
zero key spans the two leading cells on the final row. `card` mode replaces
the decimal point with `X`. Digit presses emit numbers, while `.` and `X`
remain strings.

`UPCarKeyboard` starts in the source province-key layout and toggles between
province and alphanumeric layouts. In car mode, `autoChange` switches to the
alphanumeric layout 200 milliseconds after a province press. Both standalone
grids support `random`; randomization changes only key order and never key
membership or payload identity.

## State and Rendering

The only interactive state is the car keyboard alphabet/province mode and
the 200 ms auto-change timer. `UPKeyboard` has no duplicate `show` state:
`UPPopup` receives the caller's value directly. Pressing the overlay triggers
`onChangeShow(false)` and `onClose()` through `UPPopup`, exactly once.

Backspace uses `Pressable.onPressIn` for the immediate event, repeats every
250 ms while pressed, and clears on `onPressOut` or component unmount. This
is the React Native mapping of source `touchstart`/`touchend` behavior.

Source `rpx` values map through `getPx` and existing source colors. The
keyboard panel has the source gray keybed, white raised keys, 4 px radii,
and an accessible `backspace` icon. CSS hover, touch-move suppression, and
platform-specific gesture timing have no React Native core equivalent; their
source props are retained where applicable but have no separate runtime
effect.

## Defaults and Configuration

`UP.props` gains three independent reactive tables:

- `keyboard`: source mode, toolbar, overlay, safe-area, text, and z-index
  defaults.
- `numberKeyboard`: `mode`, `dotDisabled`, and `random`.
- `carKeyboard`: `random`.

`UP.setConfig({ props: { ... } })` merges each table without resetting the
other source defaults. Explicit component props always win over configured
values.

## Verification

Contract tests cover all number/card key payloads, disabled decimal layout,
backspace repeat cancellation, car layout toggle and auto-change, popup
dismissal, toolbar callbacks, configured defaults, and explicit precedence.
The example provides a controlled `UPKeyboard` number entry interaction.
README, compatibility guide, and gap matrix document the P20 exports and
native no-op boundaries.
