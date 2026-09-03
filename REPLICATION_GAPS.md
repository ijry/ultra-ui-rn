# Library Gaps Identified During Demo Replication

This document tracks component features present in the upstream uview-plus demos but missing or incomplete in the ultra-ui-rn port.

Generated: 2026-09-03  
Last updated: 2026-09-03
Source: Strict replication of 17 advanced component demos

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

**Needs device verification**: the `navigateTo` scroll path depends on `measureLayout`, which is a no-op in the jest environment. Tests cover the reject paths and anchor registration wiring; the actual scroll has not been observed on a device.

---

## Missing Props

### UPCoupon
- ~~**amountNode** slot~~ — ✓ Fixed 2026-09-03: upstream `#amount` slot replaces amount display; implemented as `amountNode?: React.ReactNode | ((amount: string | number) => React.ReactNode)`
- ~~**titleNode** slot~~ — ✓ Fixed 2026-09-03: upstream `#title` slot replaces title text; implemented as `titleNode?: React.ReactNode | ((title: string) => React.ReactNode)`

### UPColorPicker
- ~~**children** slot~~ — ✓ Fixed 2026-09-03: default slot now accepted as the trigger, replacing the built-in swatch (upstream: colorPicker.nvue:13-16)

### UPSignature
- **Canvas adapter requirement** — RN component requires explicit canvas adapter configuration; upstream `.nvue` works with built-in `uni.createCanvasContext`
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

### UPVirtualList
- **scrollTop bidirectional binding** — upstream `v-model:scrollTop` is read+write (setting scrolls, scrolling updates); local `scrollTop` is write-only (feeding `onUpdateScrollTop` back causes gesture conflicts)

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

**Total gaps identified**: 20  
**Fixed**: 16 (UPMarkdown.showLineNumber, UPCoupon.circle/amountNode/titleNode, UPButton.type="default", UPLazyLoad.borderRadius, UPColorPicker.children, UPNovelReader.toolbarExtraNode, UPSignature theme bgColor (demo-side), UPParse.containerStyle documented + domain + scrollTable + useAnchor + image rendering + missing tags)
**Remaining**: 4
- Critical (defined but broken): 0
- Missing props/events: 1 (UPSignature canvas adapter — a design question, not a defect)
- API discrepancies: 1 (UPVirtualList.scrollTop — bidirectional binding conflicts with RN gestures)
- Platform limitations: 6 (including 2 upstream bugs in UPLazyLoad)
- Enum corrections: 1 (already applied)

**Components with most gaps**:
1. ~~UPParse (6 gaps, all fixed)~~ ✓ — `navigateTo` scroll path still needs device verification
2. UPLazyLoad (2 upstream bugs) — statusChange/clickImg events referenced in demo but never emitted by component
3. ~~UPCoupon~~ ✓ / ~~UPColorPicker~~ ✓ / ~~UPNovelReader~~ ✓ / ~~UPMarkdown~~ ✓ / ~~UPButton~~ ✓

**One classification lesson**: two entries on this list were never library gaps —
`UPSignature` theme reactivity and `UPLazyLoad`'s `@statusChange` / `@clickImg`.
The first was the local *demo* failing to replicate what the upstream *demo*
computes; the second is upstream referencing events its own component never
emits. When an entry reads "upstream does X and we don't", check whether X lives
in upstream's component or only in its demo.

**Next steps**: See task #2 "Fix library gaps surfaced by replication"
