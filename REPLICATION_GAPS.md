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
- **domain** — prop accepted but unused; relative image/link URLs cannot resolve — parse.nvue:3
- **scrollTable** — prop accepted but not implemented; wide tables cannot scroll horizontally — parse.nvue:3
- **useAnchor** — prop accepted but not implemented; `<a href="#id">` anchor navigation broken — parse.nvue:3
- **Image rendering** — upstream renders `<img>` as actual images with preview; local renders as `[图片:filename]` text placeholder
- ~~**Missing tag support**~~ — ✓ Fixed 2026-09-03: now renders `<ruby>`, `<rp>`, `<rt>`, `<sup>`, `<sub>`, `<s>`, `<big>`, `<small>`, `<section>` with proper styling (SVG remains unsupported in RN Text)

---

## Missing Props

### UPCoupon
- **amountNode** slot — upstream `#amount` slot replaces amount display; added during this replication
- **titleNode** slot — upstream `#title` slot replaces title text; added during this replication

### UPColorPicker
- **children** slot — upstream wraps trigger in `<up-color-picker>` default slot; RN component renders internal trigger only, no children accepted (upstream: colorPicker.nvue:7-17)

### UPSignature
- **Canvas adapter requirement** — RN component requires explicit canvas adapter configuration; upstream `.nvue` works with built-in `uni.createCanvasContext`
- **Theme reactivity** — upstream demo uses `upThemeIsDark` for conditional bg-color; RN component has no built-in theme reactivity for `bgColor` prop

### UPDragsort
- **vibrate** — upstream calls `uni.vibrateShort()` on drag start; RN has no cross-platform haptic API (deprecated as no-op)

### UPNovelReader
- **toolbar slot** — upstream `#toolbar-extra` slot allows custom toolbar buttons; local component has no slot or children extension point

### UPLazyLoad
- ~~**borderRadius** prop~~ — ✓ Fixed 2026-09-03: now accepts `borderRadius` prop directly (no longer requires `customStyle` workaround)
- **onStatusChange** event — upstream `@statusChange` tracks load state transitions; local has `onClick` only
- **onClickImg** event — upstream `@clickImg` separate from generic click; local has no image-specific handler

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

---

## Enum Corrections Made

### UPCoupon.shape
- **Before**: `'coupon' | 'circle'`  
- **After**: `'coupon' | 'envelope' | 'card'`  
- **Reason**: `'circle'` never existed in upstream; added missing `'envelope'` variant with top ribbon

---

## Summary

**Total gaps identified**: 20  
**Fixed**: 6 (UPMarkdown.showLineNumber, UPCoupon.circle, UPButton.type="default", UPLazyLoad.borderRadius, UPParse.containerStyle documented, UPParse missing tags)
**Remaining**: 14
- Critical (defined but broken): 4  
- Missing props/events: 7  
- API discrepancies: 1  
- Platform limitations: 4  
- Enum corrections: 1 (already applied)

**Components with most gaps**:
1. UPParse (4 gaps remaining, down from 6) — domain/scrollTable/useAnchor/image rendering
2. UPLazyLoad (2 gaps remaining, borderRadius fixed)
3. ~~UPCoupon (3 gaps, all fixed)~~ ✓

**Next steps**: See task #2 "Fix library gaps surfaced by replication"
