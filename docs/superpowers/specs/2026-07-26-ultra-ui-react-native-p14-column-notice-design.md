# React Native P14 Column Notice Design

## Goal

Port `u-column-notice` from uview-plus 3.8.86 as `UPColumnNotice`, preserving
its array notices, source automatic cycling, `step`-controlled orientation,
touchability, icon/mode presentation, and current-index event payload.

## Scope

P14 adds only `UPColumnNotice`. It remains separate from the existing
`UPNoticeBar`, which has a different source API and horizontal-marquee runtime.
P14 does not introduce a general carousel abstraction, a third-party pager, or
a virtualized notices list.

## Source Contract

The source component receives an array `text`, always enables its native swiper
autoplay and circular options, and initializes `index` to `0`. On source swiper
change it updates `index`; pressing the bar emits `click(index)`. Its props and
source defaults are:

- `text: []`;
- `icon: 'volume'`;
- `mode: ''`, `link`, or `closable`;
- `color: '#f9ae3d'`, `bgColor: '#fdf6ec'`, `fontSize: 14`;
- `speed: 80`, `step: false`, `duration: 1500`, `disableTouch: true`;
- `justifyContent: 'flex-start'`.

The source template passes `vertical="step ? false : true"`. Therefore
`step=false` (the source default) produces a vertical pager; `step=true`
produces a horizontal pager. It passes `disableTouch` directly to the swiper.
The source `speed` prop is documented but never consumed by its template or
methods. The computed `vertical` property based on `mode === 'horizontal'` is
also unused by the template and has no behavior.

## React Native API

```tsx
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
  onClick?: (index: number) => void;
  onClose?: () => void;
};
```

`iconNode` replaces the named Vue icon slot. `customClass` remains a deprecated
typed no-op. The component accepts source `speed`, but it is a documented no-op
because upstream does not use it. No application adapter or native dependency
is needed.

## Rendering and State Flow

`UPColumnNotice` merges `useUPConfig().props.columnNotice` with component props
and renders a row with an optional left icon, a paged `ScrollView`, and an
optional right mode icon:

- `step=false` sets `horizontal={false}`, `pagingEnabled`, and a fixed
  20px pager height; each page stretches to that height.
- `step=true` sets `horizontal`, `pagingEnabled`, and measures pager width to
  give every page the source-equivalent full visible width.
- `disableTouch=true` sets `scrollEnabled={false}`; `false` enables native page
  swiping.
- `onMomentumScrollEnd` derives the page index from the relevant content offset
  and layout dimension, clamps it to the valid `text` range, and updates local
  state.
- when `text.length >= 2`, a `duration` interval advances local index modulo
  text length and imperatively scrolls to that page; source `circular` is
  emulated by wrapping timer-driven autoplay.
- changing `text` resets index to `0` and scrolls to the first item.
- pressing anywhere except the close control calls `onClick(currentIndex)`.
- `mode='closable'` hides the component and calls `onClose`; its inner press
  handler stops parent propagation. `mode='link'` renders `arrow-right`.

The implementation does not claim exact source infinite drag looping or CSS
swiper transitions. On React Native core, manual swipes stop at physical list
edges while autoplay wraps from final page to first.

## Defaults and Config Reactivity

P14 adds the following source table:

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

Matching `UPColumnNoticeDefaults`, `UPProps['columnNotice']`,
`UPConfigOverrides['props']['columnNotice']`, `createSourceState`, and
`setUPConfig` paths make mounted components update through `UP.setConfig()`.
Explicit component values retain precedence over defaults.

## Compatibility Limits

- `speed` remains a typed no-op because upstream declares but does not consume
  it.
- The unused source `mode === 'horizontal'` computed orientation is not mapped;
  only source template `step` controls orientation.
- Source continuous `circular` manual dragging, exact native swiper animation,
  mini-program scrolling implementation, and CSS classes cannot be reproduced
  by React Native core. Timer-driven autoplay wraps correctly.
- Vue named icon slots map to `iconNode`; Vue/CSS class syntax is unavailable.

## Test Plan

Add `tests/components/UPColumnNotice.test.tsx` beneath `UPRoot` with fake
timers and mocked `ScrollView.scrollTo`. Tests cover:

- source default colors, icon, vertical pager orientation, disabled touch, and
  source text page rendering;
- `step=true` horizontal pager layout and enabled touch;
- timer rotation and source wrap from final index to index zero;
- native momentum scroll changing the current index and bar click payload;
- closable state/removal versus link mode icon rendering;
- text replacement resetting index and scrolling to first page;
- mounted `UP.setConfig({ props: { columnNotice } })` updates plus explicit prop
  precedence;
- retained source `speed` being accepted without altering timer behavior.

## Documentation and Acceptance Criteria

`README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx` document the source `step` orientation rule,
`disableTouch`, timer-driven circular emulation, and source no-op properties.

P14 is accepted when:

- package root exports `UPColumnNotice` and `UPColumnNoticeProps`;
- `step=false` uses a vertical paged native surface and `step=true` uses a
  horizontal paged surface;
- source duration, current index, click payload, close, and mode icons work;
- `disableTouch` is passed to native scroll enablement;
- source defaults react through `UP.setConfig` without new runtime dependencies;
- complete library and example quality gates pass.
