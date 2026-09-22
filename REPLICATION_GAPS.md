# Library Gaps Identified During Demo Replication

This document tracks component features present in the upstream uview-plus demos but missing or incomplete in the ultra-ui-rn port.

Generated: 2026-09-03  
Last updated: 2026-09-05
Source: Strict replication of 17 advanced component demos, extended 2026-09-04 by
the 20 demo pages that closed the example-coverage gap

---

## Effects keyed on the props object (3 found, all fixed 2026-09-04)

Three components listed `input` — the raw props object, a fresh identity on every
render — in a `useEffect` dependency array. The consequence is the same each
time: **any parent re-render re-runs the effect**, so callbacks re-fire and
animations/overlays restart, and a handler that sets parent state loops forever.

| Component | Effect re-fired | Fixed in |
|---|---|---|
| `UPTransition` | all 7 lifecycle callbacks, plus the animation | `fc166e8` |
| `UPNoNetwork` | `onDisconnected` / `onConnected`, plus re-adding the overlay | 2026-09-04 |
| `UPReadMore` | (different mechanism — see below) | 2026-09-04 |

The fix pattern, now used by all three: hold the callbacks in a
`useRef(input)` updated on every render, and depend only on the values that
should genuinely re-trigger the effect. Where a captured node has to call back
out (`UPNoNetwork`'s retry button lives inside an overlay node built once per
`overlay.add`), route the call through the ref so it cannot freeze the first
render's closure.

**Why unit tests missed all three:** every existing test rendered once and
asserted the callback fired once. None re-rendered the parent. The regression
tests added alongside each fix all take the same shape — re-render the parent and
assert the call count did *not* grow.

### UPSelect rendered a blank trigger (fixed 2026-09-04)

`showOptionsLabel` swaps the label for the selected option's text. With nothing
selected that text is `''`, and it was returned unguarded — so a select with
`showOptionsLabel` and no initial value rendered **only a chevron and no words**.
Upstream's demo passes `showOptionsLabel` on all three selects, so all three of
SelectDemo's triggers were blank on device. Now falls back to `label`.

Same test-shape lesson: the existing test passed `current="first"`, i.e. only the
already-selected path.

### UPReadMore measured inside the node it clamps (fixed 2026-09-04)

`showHeight` was never honoured: content rendered in full with no
展开阅读全文 button, and the page's window never went idle.

The `onLayout` that measured content height was attached to a `View` **inside**
the `View` that receives `maxHeight`. So the measurement depended on its own
outcome: measure tall → collapse → the clamped subtree reports the *clipped*
height → `contentHeight > showHeight` becomes false → un-clamp → measure tall →
… an endless relayout with no fixed point.

Fixed by latching the tallest height seen since the last `init()`, so a clipped
re-measure cannot lower the value that produced the clip. Shrinking content is
`init()`'s job, which is upstream's contract too.

**How it was found:** the device sweep flagged the page as
`hierarchy never idle`, which the tooling notes had recorded as a benign
false positive for animating pages. ReadMore has nothing to animate — that is
what made it a real bug. `adb exec-out uiautomator dump` returning
`ERROR: could not get idle state` on a static page is now documented as a
loop signature rather than an artifact.

## The root overlay host gave entries no containing block (fixed 2026-09-04)

`OverlayProvider` wrapped each entry in `<View style={{ zIndex }}>` — a z-index
and nothing else. Overlay nodes are `position: absolute` with
`top/right/bottom/left: 0`, so they resolved their edges against that wrapper,
whose only child is out of flow: **it collapsed to zero height.** The backdrop
covered nothing while the text children overflowed and still painted, and on
Android the zero-size box was skipped by hit testing and the accessibility tree.

Measured in H5 before and after, which is what confirmed it:

| | backdrop box | bottom-popup panel |
|---|---|---|
| before | 485 × **0** | y = **−144** (off-screen above) |
| after | 485 × 979 | inside the layer |

**Why only NoNetwork looked broken:** the other five consumers each hand-roll
their own full-screen wrapper before handing the node over — `UPPopup`'s
`PopupLayer`, `UPSelect`'s `SelectLayer`, `UPDropdown`/`UPTooltip`'s `layerStyle`,
`UPGuide`'s layer root. They were compensating for the host. `UPNoNetwork` passes
a bare `UPOverlay`, so it was the one that showed the defect. Fixing the host
rather than the component removes the trap for the next consumer; the five
existing wrappers stay harmless.

Verified on an Android emulator across all six: NoNetwork now shows an opaque
full-screen backdrop with a hit-testable 重试 that dismisses; bottom-mode popup
still anchors to the screen bottom over a dimmed backdrop; Select's menu still
anchors under its trigger; Guide's overlay is hit-testable. Sweep of all six
pages: zero JS errors.

### UPPopup announced open on every render (fixed 2026-09-04)

Its effect deps include `props` and `input`, and unlike the other cases they
*have to* — the overlay node carries children and styles that must stay current.
Only `onOpen` was wrong to ride along, since it reports a transition rather than a
state; it fired 3 times after two parent re-renders. Now latched to the open edge.

### UPPopup centre mode was not vertically centred (fixed 2026-09-04)

`panelPosition`'s fallback branch returned only `{ alignSelf: 'center', maxWidth: '92%' }`,
and the layer applied it alongside `position: 'absolute'` — an absolute box with
no vertical rule pins to the top edge of its containing block, so a
`mode="center"` popup sat at the top of the screen rather than the middle.

Fixed by laying the centre-mode panel out **in flow** inside a full-screen
`alignItems/justifyContent: 'center'` wrapper, instead of absolutely. Translate-based
centring was the obvious alternative and is wrong here: the `fade-zoom`
transition already owns `transform`, so the two would collide.

The wrapper is `pointerEvents="box-none"`, which is load-bearing — upstream's
centre demo passes `closeOnClickOverlay: true`
(`popup.nvue:133-137`), so a full-screen wrapper that swallowed presses would
break closing by tapping the backdrop. The regression test asserts both the
centring style and that pressing the overlay still closes.

### UPCopy swallowed the press of a nested pressable child (fixed 2026-09-04)

Upstream nests `<up-button>` inside `<up-copy>` and relies on tap bubbling
(`copy.nvue:12-14`). RN hands the gesture to the innermost pressable, so the
nested `UPButton` — itself a `Pressable` — took it and `UPCopy`'s wrapper never
fired. 点击按钮复制 was dead on device.

Measured rather than assumed, with a calibration pass: tapping the plain-`Text`
child produced the 复制成功 toast **and** the Android clipboard chip showing
`uview-plus is great !`; tapping the nested button produced neither, across three
consecutive frames. (A screenshot taken after a `sleep` misses the 2 s toast —
tap and grab frames back-to-back in the same adb round trips.)

Fixed by having the wrapper also watch raw touch events, which reach an ancestor
even when a descendant is the responder. Two details make it safe rather than a
blunt `pointerEvents="box-only"`, which would have been one line but would have
killed nested children's own handlers:

- `onPressIn` on our own `Pressable` records whether it claimed the gesture. If it
  did, `onPress` copies and the touch path stands down — so one tap never copies
  twice, and the ordering of the two callbacks does not matter.
- A 12 dp / 600 ms tap threshold, because `onTouchEnd` also fires at the end of a
  scroll that began on the copy area, and a scroll must not copy.

Nested children keep their own interactivity, which `box-only` would have removed.

---

## Gaps recorded from the 20 new demo pages (status updated through 2026-09-05)

Surfaced while replicating the demos for the components that previously had no
example page. None is a blocker; all are documented in the demo pages themselves.

### UPPoster
- ~~**No `onExport` event**~~ — ✓ Fixed 2026-09-05: added `onExport`, fired with the
  result whenever `exportImage()` resolves (adapter or null-path branch), matching
  upstream's `@export` (poster.nvue:29). PosterDemo now binds it instead of calling
  the handler by hand.
- ~~**`radius` in a view's css is ignored**~~ — ✓ Fixed 2026-09-05: css `radius` is now
  read as `borderRadius` across image/qrcode/view branches (`radiusOf`), matching
  upstream's `radius: '16rpx'` / `'12rpx'` (poster.nvue:56,85).

### UPTable2
- ~~**`column.style` / `cellStyle` are `ViewStyle`**, so upstream's per-column and
  per-cell **text** colours cannot be expressed~~ — ✓ Fixed 2026-09-05: both now
  accept `ViewStyle & TextStyle`. The box keeps the view props; text properties
  (`color`, `fontSize`, …) are split out and applied to the default cell text,
  where they were inert on the wrapping View. Matches upstream's
  `{ background, color }` column style and `cellStyle` (`table2.nvue:154-164`).
  A custom `renderCell` returns its own element and is left untouched. `column.style`
  now also styles the body cell box, not only the header, as upstream styles the
  whole column.
- ~~**`UPTable2Column.key` is required**~~ — ✓ Fixed 2026-09-05: `key` is optional;
  the component derives an effective key from the column `type` (else index) so
  upstream's keyless selection/expand columns work without inventing one.
- ~~**`expandRowKeys` compares keys by identity, not loosely.**~~ — ✓ Fixed 2026-09-05:
  caller keys are normalised against the model's node keys by string form
  (`normalizeTable2Keys`), so upstream's string `['1']` pre-expands a numeric
  `id: 1` row. Exact matches are unchanged; keys with no node fall through
  untouched.

### UPCateTab
- ~~**`renderPageItem` slot content was forced into a 33.33%-wide cell**~~ — ✓ Fixed
  2026-09-05: custom `renderPageItem` content now receives the full right-side row;
  the built-in thumbnail renderer deliberately keeps its three-column grid.
  Regression tests pin both widths, and H5 geometry confirms the custom wrapper
  exactly fills its parent content box (166.5 px vs 166.5 px).
- **`height` does not accept CSS `calc()`** — upstream passes
  `calc(100vh - 150px)`; the demo substitutes `useWindowDimensions().height - 150`.
  This remains a React Native platform boundary, not a fabricated CSS parser.

### UPCityLocate
- ~~**No `hotCity` prop**~~ — ✓ Fixed 2026-09-05: `hotCity` now owns the chip
  grid when supplied, while omitting it preserves the old `cityList[0]` fallback.
  CityLocateDemo passes upstream's `hotCity` and `cityList` separately instead of
  folding one into the other.

### UPShortVideo
- ~~**Ignores `item.bgColor` and `item.author`**~~ — ✓ Fixed 2026-09-05: the default
  placeholder now paints the per-video `bgColor` and shows an author overlay
  (name + desc), matching the fields upstream carries (shortVideo.nvue:109-114).
  `videoUrl` / `progress` still route through the `renderVideo` native player
  seam and its events — a platform boundary, not a defect.
- **Renders its own progress bar with a `+10%` button** that has no upstream
  counterpart and overlaps an injected tabbar (demo artefact, recorded boundary)

### UPCropper
- **No default slot and no adapter seam.** Upstream nests the trigger inside
  `<up-cropper>` and drives selection through `uni.chooseImage`; the local
  component accepts neither `children` nor an injection prop, so the demo places
  the trigger outside it

### UPLoadingIcon
- **`mode` renders identically for all three values** (one `ActivityIndicator`),
  so 3 of the demo's 6 sections look the same. Already marked `@deprecated`, so
  this is a recorded boundary rather than a new defect.

### Native seams are documented but undemonstrated
`renderPdf`, `exportImageAdapter` and `renderVideo` appear nowhere in
`example/` — only in `src/` and `tests/`. On a device, PdfReaderDemo shows a
placeholder, PosterDemo's generate button always ends in a toast with no image,
and ShortVideoDemo shows a glyph instead of video. Honest, but the seam-injection
API has no worked example.

---

## Critical Gaps (Prop Defined But Not Implemented)

### ~~UPMarkdown~~ ✓ FIXED
- ~~**showLineNumber**~~ — ✓ Fixed 2026-09-03: now renders line numbers when `showLineNumber={true}`

### ~~UPCoupon~~ ✓ FIXED
- ~~**circle** prop~~ — ✓ Fixed 2026-09-03: now controls action button border radius (25dp vs 3dp)

### UPParse (Major Implementation Gap)
- ~~**containerStyle**~~ — ✓ Documented 2026-09-03: CSS string syntax incompatible with RN; marked `@deprecated`, use `customStyle` instead
- ~~**domain**~~ — ✓ Fixed 2026-09-03: now resolves relative image/link URLs with domain prefix; `onLinktap` and `onImgtap` receive resolved URLs
- ~~**scrollTable**~~ — ✓ Fixed 2026-09-03: tables wrap in a horizontal `ScrollView` and cells switch from `flex: 1` to `minWidth: 100`, since RN has no auto table layout (upstream uses an `overflow:auto` div — parser.js)
- ~~**useAnchor**~~ — ✓ Fixed 2026-09-03: `id`-bearing nodes register their offset via `measureLayout`; component exposes `navigateTo(id, offset)` through a ref, and in-page `#id` links scroll automatically (upstream: u-parse.vue:157)
- ~~**Image rendering**~~ — ✓ Fixed 2026-09-03: now renders `<img>` as actual Image components with loading/error states
- ~~**Missing tag support**~~ — ✓ Fixed 2026-09-03: now renders `<ruby>`, `<rp>`, `<rt>`, `<sup>`, `<sub>`, `<s>`, `<big>`, `<small>`, `<section>` with proper styling (SVG remains unsupported in RN Text)

**Verified on device 2026-09-03**: `navigateTo` now scrolls on an Android
emulator. See "Scroll container composition" for the four things that all had to
be true.

---

## Scroll container composition (fixed and device-verified 2026-09-03)

`navigateTo(id)` used to compute a correct offset and then call `scrollTo` on a
container with **no scrollable extent**, so nothing moved. Reproduced identically
on H5 and on Android before the fix.

Measured on ParseDemo in the H5 harness — three nested vertical scrollers, none
overflowing (each grew to its content height while an ancestor scrolled):

| scroller | scrollHeight | clientHeight | overflows |
|---|---|---|---|
| `host.tsx` ScrollView | 1750 | 1750 | no |
| `DemoPage` ScrollView | 1694 | 1694 | no |
| `up-parse` ScrollView | 1639 | 1639 | no |

Root cause: **upstream `u-parse`'s root is a plain `<view id="_root">`, not a
scroller** (u-parse.vue:2). The page owns scrolling, which is why upstream's
`navigateTo` measures against the viewport and scrolls the *page*.

Four separate causes, each masking the next:

1. **`UPParse` root -> `View`**, matching upstream. Its own `ScrollView` both
   deviated from the source and handed `navigateTo` a container that could not
   move.
2. **`scrollRef` prop.** RN has no page scroller, so the caller passes theirs.
   `navigateTo` now rejects with a clear message when it is missing instead of
   silently doing nothing.
3. **`host.tsx` no longer wraps demos in a `ScrollView`.** Every page already
   brings its own, so the wrapper only produced the nesting above.
4. **Anchor registration was wiped by its own effect.** Anchors register through
   ref callbacks during commit, and a `useEffect` keyed on `nodes` cleared the map
   *after* that commit, destroying the registrations for the render that produced
   them; every id reported `not found`. Ref callbacks already delete on unmount,
   so the clearing effect is gone.

Also required on Fabric: `measureLayout` needs the inner view **instance**
(`getInnerViewRef()`), not the numeric handle from `getInnerViewNode()`. The
handle warns `ref.measureLayout must be called with a ref to a native component`
and never fires the callback.

Every one of these failed silently — the anchor tap did nothing and no error
appeared. `navigateTo` rejections are now logged under `__DEV__`, which is what
finally made the cause visible.


---

## Missing Props

### UPCoupon
- ~~**amountNode** slot~~ — ✓ Fixed 2026-09-03: upstream `#amount` slot replaces amount display; implemented as `amountNode?: React.ReactNode | ((amount: string | number) => React.ReactNode)`
- ~~**titleNode** slot~~ — ✓ Fixed 2026-09-03: upstream `#title` slot replaces title text; implemented as `titleNode?: React.ReactNode | ((title: string) => React.ReactNode)`

### UPColorPicker
- ~~**children** slot~~ — ✓ Fixed 2026-09-03: default slot now accepted as the trigger, replacing the built-in swatch (upstream: colorPicker.nvue:13-16)

### UPSignature
- ~~**Canvas adapter requirement**~~ — ✓ Fixed 2026-09-03, and it was **misdescribed**. It was recorded as "requires explicit canvas adapter configuration", i.e. a design choice. On a device it was a hard crash: `UPCanvas`'s default adapter uses `react-native-canvas`, whose peer is `react-native-webview >= 5.10`. The root declared it but `example` did not, so autolinking never saw it and the page died with `TypeError: Cannot read property 'WebView' of undefined`. No adapter configuration is needed — the peer just has to be declared where autolinking can see it. Found by the native sweep.
- ~~**Theme reactivity**~~ — ✓ Fixed 2026-09-03, and it was **misclassified as a library gap**. Upstream's component takes a plain `bgColor` prop too; it is the *demo* that computes `upThemeIsDark ? '#1c1c1e' : '#f5f5f5'` (signature.nvue:11,34). The local demo had hardcoded the light branch. Fixed in `SignatureDemo` by deriving it from `useUPTheme().mode` — no library change needed.

### UPDragsort
- **vibrate** — upstream calls `uni.vibrateShort()` on drag start; RN has no cross-platform haptic API (deprecated as no-op)

### UPNovelReader
- ~~**toolbar slot**~~ — ✓ Fixed 2026-09-03: added `toolbarExtraNode`, rendered after the built-in catalog/settings/bookmark buttons in the top toolbar (upstream: novelReader.nvue:18-25). Demo now wires the scroll/page mode toggle through it.

### UPLazyLoad
- ~~**borderRadius** prop~~ — ✓ Fixed 2026-09-03: now accepts `borderRadius` prop directly (no longer requires `customStyle` workaround)
- **onStatusChange** event — upstream demo (lazyLoad.nvue:6) references `@statusChange` but component source never emits it; appears to be upstream bug (component only emits `click`, `load`, `error`)
- **onClickImg** event — upstream demo (lazyLoad.nvue:6) references `@clickImg` but component source never emits it; the actual event is `@click` (u-lazy-load.vue:172)

---

## API Discrepancies

### ~~UPButton~~ ✓ FIXED
- ~~**type="default"**~~ — ✓ Fixed 2026-09-03: added to `UPButtonType` union, renders like 'info' (white bg, gray border)

### ~~UPVirtualList~~ ✓ FIXED
- ~~**scrollTop bidirectional binding**~~ — ✓ Fixed 2026-09-03, and it was
  **misclassified**. Both directions already existed: the `[props.scrollTop]`
  effect scrolls, and `onUpdateScrollTop` fires on every scroll. The real problem
  was the echo — a caller wiring the two together arrived back with the value the
  component had just reported, and the effect re-issued `scrollTo` mid-gesture,
  fighting momentum. The effect now ignores values within 1px of what it last
  reported, so `v-model:scrollTop` semantics work.

---

## Platform Limitations (Not Fixable)

### UPPullRefresh
- **Virtual list integration** — upstream "结合虚拟列表" section shows `up-virtual-list` with scroll integration; local integration not documented (demo uses ScrollView substitute)

### UPIndexList
- **height prop requirement** — upstream auto-fills via CSS flex; RN requires explicit `height` prop or ScrollView collapses

### UPWaterfall
- **column slot** — upstream Vue slot `<template v-slot:column="{ colList, colIndex }">` vs local `renderItem` per-item approach (functionally equivalent, different API surface)

### UPDragsort
- **CSS pseudo-elements** — upstream `.handle::before` and `::after` create hamburger icon; RN approximated with single `<View style={s.handle} />`

### UPSignature
- **Fixed demo dimensions** — upstream `width="700"` `height="200"` are literal pixels for H5; may overflow on narrow RN devices

### UPLazyLoad (Upstream Bugs)
- **@statusChange event** — upstream demo (lazyLoad.nvue:6) references this event but component (u-lazy-load.vue) never emits it; component only emits `@click`, `@load`, `@error`
- **@clickImg event** — upstream demo (lazyLoad.nvue:6) references this event but component never emits it; the actual click event is `@click` (u-lazy-load.vue:172)

---

## Enum Corrections Made

### UPCoupon.shape
- **Before**: `'coupon' | 'circle'`  
- **After**: `'coupon' | 'envelope' | 'card'`  
- **Reason**: `'circle'` never existed in upstream; added missing `'envelope'` variant with top ribbon

---

## Summary

**Total gaps identified**: 40 (20 from the first replication rounds, 20 added 2026-09-04)  
**Fixed**: 34 — the original 18 (UPMarkdown.showLineNumber, UPCoupon.circle/amountNode/titleNode, UPButton.type="default", UPLazyLoad.borderRadius, UPColorPicker.children, UPNovelReader.toolbarExtraNode, UPSignature theme bgColor + canvas peer, UPVirtualList.scrollTop echo, UPParse.containerStyle documented + domain + scrollTable + useAnchor + image rendering + missing tags), the eight found on 2026-09-04 (UPTransition, UPNoNetwork, UPReadMore, UPSelect, the overlay host's missing containing block, UPPopup.onOpen, UPPopup centre mode, UPCopy nested press), plus UPCityLocate.hotCity, UPCateTab.renderPageItem width, UPPoster onExport + radius, UPTable2 cell/column text styling + optional key + loose expandRowKeys, and UPShortVideo bgColor + author on 2026-09-05
**Remaining**: 6
- Critical (defined but broken): 0
- Actionable API gaps: UPCropper slot/adapter seam
- Platform/recorded boundaries: UPCateTab CSS `calc()` height, UPLoadingIcon.mode, native seam demos, and the React Native limitations listed below
- Upstream defects retained as references: UPLazyLoad's nonexistent `statusChange` / `clickImg` events

**Components with most gaps**:
1. ~~UPParse (6 gaps, all fixed)~~ ✓ — `navigateTo` anchor scrolling verified on an
   Android emulator; see "Scroll container composition"
2. UPLazyLoad (2 upstream bugs) — statusChange/clickImg events referenced in demo but never emitted by component
3. ~~UPCoupon~~ ✓ / ~~UPColorPicker~~ ✓ / ~~UPNovelReader~~ ✓ / ~~UPMarkdown~~ ✓ / ~~UPButton~~ ✓ / ~~UPVirtualList~~ ✓ / ~~UPSignature~~ ✓ / ~~UPTransition~~ ✓ / ~~UPNoNetwork~~ ✓ / ~~UPReadMore~~ ✓ / ~~UPSelect~~ ✓ / ~~OverlayProvider~~ ✓ / ~~UPPopup~~ ✓ / ~~UPCopy~~ ✓ / ~~UPCityLocate~~ ✓ / ~~UPCateTab~~ ✓ / ~~UPPoster~~ ✓ / ~~UPTable2~~ ✓ / ~~UPShortVideo~~ ✓

**The classification lesson**: four entries on this list were not what they said.
`UPSignature` theme reactivity was the local *demo* failing to replicate what the
upstream *demo* computes. `UPSignature`'s "canvas adapter requirement" was framed
as a design choice but was a hard native crash from an undeclared peer.
`UPLazyLoad`'s `@statusChange` / `@clickImg` are upstream referencing events its
own component never emits. `UPVirtualList`'s `scrollTop` was called write-only
when both directions worked — the defect was the feedback echo.

Three of those four only became visible by running the app on a device; none of
them failed a unit test or a typecheck. When an entry reads "upstream does X and
we don't", check whether X lives in upstream's component or only in its demo,
re-read the local source, and run the page.

**The 2026-09-04 lesson is narrower and sharper**: all three bugs found that day
were *state-machine* defects that a single-render test cannot see. Two were the
identical mistake (`input` in a dep array) in different files, and the third was
a measurement that fed back into the layout it controlled. When reviewing a
component, read its `useEffect` dependency arrays and ask what a second render
would do; when a measurement drives a style, check whether that style can change
the measurement.

**Next steps**: See task #2 "Fix library gaps surfaced by replication"
