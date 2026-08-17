# React Native P15 Row Notice Design

## Goal

Port uview-plus 3.8.86 `u-row-notice` as `UPRowNotice`, preserving its
string-only horizontal marquee, source speed calculation, icon/mode surface,
source event payloads, and reactive component defaults.

## Scope

P15 adds only `UPRowNotice`. It remains separate from `UPNoticeBar` and
`UPColumnNotice` because all three source components have independent prop
contracts and layout semantics:

- `UPRowNotice` maps source `u-row-notice`: one string and measured,
  continuously scrolling horizontal content;
- `UPColumnNotice` maps source `u-column-notice`: an array and native paged
  notices;
- `UPNoticeBar` remains the existing combined source-facing convenience surface
  with its own `direction`, array, timing, and navigation-retention props.

P15 does not extract a shared marquee abstraction, alter `UPNoticeBar`, add a
native animation dependency, reproduce nvue animations, or implement source
page/WebView visibility handling.

## Source Contract

The source `u-row-notice` accepts only a string `text`, initializes visible
state to true, and emits `click` without a payload when its outer surface is
pressed. Its source defaults are:

```ts
{
  text: '',
  icon: 'volume',
  mode: '',
  color: '#f9ae3d',
  bgColor: '#fdf6ec',
  fontSize: 14,
  speed: 80,
}
```

It displays an optional source icon on the left, a clipped horizontal content
area, and an optional right icon. `mode='link'` renders `arrow-right`;
`mode='closable'` renders `close` and emits `close`. Its named Vue `icon` slot
replaces the normal left icon.

For web targets, source CSS places the text just beyond the right edge using
`padding-left: 100%`, then loops it from `translate3d(0, 0, 0)` to
`translate3d(-100%, 0, 0)`. Source JavaScript measures text and content widths
and computes `animationDuration = textWidth / getPx(speed)` seconds. Because
the extra container-width distance is already represented by 100% left padding,
the effective path is `contentWidth + textWidth`, even though the CSS duration
is derived from the measured padded text width. It recalculates on `text`,
`fontSize`, and `speed` changes. It splits long text into 20-character Vue text
nodes only as a low-end Android web rendering workaround.

## React Native API

```tsx
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
  customClass?: string;
  onClick?: () => void;
  onClose?: () => void;
};
```

`iconNode` maps the named Vue icon slot: when supplied, it replaces the normal
left source icon even if `icon` is nonempty. `customClass` remains a deprecated
typed no-op because React Native has no CSS class runtime. `onClick` has no
argument, matching the source `clickHandler`, and `onClose` has no argument.

## Rendering and Animation Flow

`UPRowNotice` merges `useUPConfig().props.rowNotice` with component props, then
renders an outer source-style row:

- outer `Pressable`: `alignItems: 'center'`, `flexDirection: 'row'`,
  `justifyContent: 'space-between'`, and `overflow: 'hidden'`; unlike the
  existing `UPNoticeBar`, it has no unrequested horizontal or vertical padding;
- normal source left icon: `UPIcon` at size 19 and source color, wrapped with
  a 5px right margin; `iconNode` replaces this wrapper entirely;
- content viewport: `flex: 1`, row direction, `overflow: 'hidden'`, and a
  height based on `getPx(fontSize) + 4` so the text remains visible;
- moving content: native `Animated.View`, `alignSelf: 'flex-start'`,
  `flexDirection: 'row'`, and a translate-X transform;
- text: one `Text` node with `numberOfLines={1}`, source color, and
  `getPx(fontSize)`;
- source mode icon: `arrow-right` at size 17 for link or a nested close
  `Pressable` with `close` at size 16 for closable, each with a 5px left margin.

The component measures the content viewport width and moving text width through
`onLayout`. Once both are positive and text is nonempty, it:

1. resets `translateX` to `contentWidth`, placing text just past the right edge;
2. computes duration in milliseconds as
   `((contentWidth + textWidth) / Math.max(1, getPx(speed))) * 1000`;
3. starts `Animated.loop(Animated.timing(...))` with `Easing.linear`,
   `toValue: -textWidth`, and `useNativeDriver: true`;
4. stops the previous animation during effect cleanup, during a new
   measurement, and at unmount.

Changing `text`, resolved `fontSize`, or resolved `speed` causes React Native
layout to update, re-runs the effect, resets the moving value to the latest
content width, and restarts with the correct linear speed. A configured default
change delivered through `UP.setConfig()` follows the same merged-prop flow.
Empty text or either zero measurement does not start an animation and leaves
the text translated to zero.

The close nested press calls `event.stopPropagation()`, sets local visibility to
false, and calls `input.onClose?.()`. It must never invoke outer `onClick`.
Outer presses call only `input.onClick?.()`; no source index exists for this
component.

## Defaults and Config Reactivity

P15 adds this frozen source table:

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

Matching `UPRowNoticeDefaults`, `UPProps['rowNotice']`,
`UPConfigOverrides['props']['rowNotice']`, `createSourceState()`, and
`setUPConfig()` entries make `UP.props.rowNotice` source defaults observable.
Explicit component props always override mounted global defaults.

## Compatibility Limits

- React Native `Animated.loop` replaces source CSS keyframes and nvue animation
  plug-ins. It preserves measured linear path and speed but not CSS animation
  properties or nvue timing quirks.
- Source App WebView hidden/show pause behavior is unavailable from React Native
  core and is not mapped.
- Source 20-character node splitting is unnecessary for React Native `Text` and
  is not reproduced; one native text node displays the complete string.
- Source CSS `white-space`, `word-break`, and scoped classes have no React
  Native runtime equivalent. `customClass` remains a typed no-op.
- No text validation warning is emitted for non-string JavaScript values:
  TypeScript restricts public callers to strings, and rendering coerces no
  values. Runtime callers must provide a string as required by the source API.

## Test Plan

Add `tests/components/UPRowNotice.test.tsx`, rendered under `UPRoot`, with a
test-level `react-native` Animated mock that records `setValue`,
`timing`, `loop`, `start`, and `stop` calls without scheduling native work.
Tests cover:

- default background/text/icon, source no-padding row layout, source default
  string text, and absence of animation before measurements;
- separate content and text layout events producing right-edge start value,
  left-edge target, linear easing, native-driver timing, and
  `(contentWidth + textWidth) / speed * 1000` duration;
- text, font size, and speed replacement restarting animation with new measured
  values; empty text suppressing animation;
- `onClick()` payload absence; link icon presence; closable state/removal,
  close callback, and stopped parent propagation;
- `iconNode` replacement; mounted `UP.setConfig({ props: { rowNotice } })`
  updates; explicit props retaining precedence;
- package-root export of `UPRowNotice` and `UPRowNoticeProps` through typecheck
  and the public-entry suite.

## Documentation and Acceptance Criteria

`README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx` document the dedicated source row marquee, measured
speed-based React Native animation, icon node replacement, and native limits.

P15 is accepted when:

- the package root exports `UPRowNotice` and `UPRowNoticeProps`;
- source defaults are available at `UP.props.rowNotice` and update mounted
  components with `UP.setConfig()`;
- default `speed=80` controls a measured horizontal loop, and changing text,
  font size, or speed safely restarts it;
- source click, link, close, icon, and color semantics work;
- no new runtime dependency is introduced;
- full library and example quality gates pass.
