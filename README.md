# ultra-ui-rn

`uview-plus` 的 React Native 组件库实现，公共组件使用 `UP*` 命名。

## Prerequisites

- Node.js 20.19 或更高版本
- React Native CLI Android/iOS 项目

## Development

```sh
npm install
npm test
npm run build
```

Source compatibility is tracked against `uview-plus` 3.8.86.

## Upload and Lazy Load

`UPUpload` keeps file-list state and delegates picker/upload work to the host
application. Install picker peers only when the app needs the default picker
bridge:

```sh
npm install react-native-image-picker @react-native-documents/picker
```

```tsx
import { UPUpload, createImagePickerChooseFile } from 'ultra-ui-rn';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const uploadAdapter = {
  chooseFile: createImagePickerChooseFile(launchImageLibrary, launchCamera),
  uploadFile: async ({ file, onProgress }) => {
    onProgress(50);
    return appUploadFile(file);
  },
};

<UPUpload uploadAdapter={uploadAdapter} />;
```

Source-shaped `fileList` items (`url`, `thumb`, `size`, `name`, `type`) are
accepted and normalized, so uview-plus upload code ports directly. Source
props and events sit on top of the RN surface with explicit precedence:
`autoUploadApi`/`autoUploadHeader`/`autoUploadDriver` configure the upload
request, `onOversize` rejects an oversized batch, `onClickPreview` fires on
every item tap, `useBeforeRead` gates through `onBeforeRead`, `autoDelete`
switches delete to source semantics, and `customAfterAutoUpload` resolves the
success URL through `onAfterAutoUpload`.

`UPLazyLoad` is explicit. Pass `visible`, or provide scroll/viewport inputs
from the screen that owns scrolling. Source aliases `image`/`imgMode`,
`loadingImg`, `errorImg`, `index`, and `onClick` are supported; the source's
implicit scroll observation remains an RN boundary.

```tsx
<UPLazyLoad src={imageUrl} visible={isImageVisible} width="100%" height={180} />;
```

### Tree

`UPTree` accepts arbitrary object nodes. Source-shaped callers can use `props`
for key, label, children, and disabled field mapping. Existing React Native
callers can continue using `fieldNames`; explicit `fieldNames` takes precedence
over `props`, and top-level `nodeKey` takes precedence over both. Pass
`expandedKeys`, `checkedKeys`, and `currentNodeKey` for controlled state, or
use the corresponding `default*` props for local state.

```tsx
<UPTree
  data={nodes}
  props={{ nodeKey: 'code', label: 'title', children: 'items' }}
  expandIcon="play-right-fill"
  collapseIcon="arrow-down-fill"
  showCheckbox
  onCheck={(node, state) => setCheckedKeys(state.checkedKeys)}
/>
```

The existing RN alias remains valid:

```tsx
<UPTree
  data={nodes}
  fieldNames={{ nodeKey: 'code', label: 'title', children: 'items' }}
/>
```

`expandOnClickNode` defaults to `true`. Nodes with `disabled: true` remain
clickable and expandable, but their checkbox cannot change checked state.

### Waterfall

`UPWaterfall` uses FlashList masonry for dynamic-height items. Use
`columns={2}` for a fixed layout or `columns="auto"` with `minColumnWidth`
for width-based column calculation. `modelValue` and `onUpdateModelValue`
match the source Vue 3 binding; existing `value`/`defaultValue` and
`onChange` remain supported React Native interfaces.

```tsx
<UPWaterfall
  columns="auto"
  minColumnWidth={220}
  modelValue={items}
  onUpdateModelValue={setItems}
  renderItem={({ item }) => <ProductCard item={item} />}
/>
```

When both `modelValue` and `value` are supplied, `modelValue` is authoritative.
`remove(id)`, `clear()`, and `modify(id, key, value)` are exposed through
`UPWaterfallRef`; ref mutations call `onUpdateModelValue` before `onChange`.
The render callback does not receive a column index because masonry placement
can change after measurement.

### Table2

`UPTable2` is a separate virtualized data grid built on the existing FlashList
dependency. It supports generic source-shaped columns, React
`renderCell`/`renderHeader`, fixed row heights, sorting/filter events,
recursive tree selection, callback or Promise lazy children, fixed headers, and
fixed-left columns. P35 adds the source-named `expandRowKeys` controlled
expansion prop, source column `style` mapping to the header cell, and source
selection callback ordering. The existing `expandedRowKeys` prop remains
supported for P34 callers.

```tsx
type OrderRow = {
  id: string;
  customer: string;
  amount: number;
  children?: readonly OrderRow[];
};

const columns = [
  { fixed: 'left' as const, key: 'customer', title: 'Customer', width: 140, type: 'expand' as const },
  { key: 'amount', title: 'Amount', sortable: true, width: 100, style: { backgroundColor: '#f5f7fa' } },
  { key: 'status', title: 'Status', width: 100 },
];

const [selectedRowKeys, setSelectedRowKeys] = useState<readonly string[]>([]);

<UPTable2<OrderRow>
  columns={columns}
  data={orders}
  expandRowKeys={['order-1']}
  height={320}
  onSelectionChange={(_rows, keys) => setSelectedRowKeys(keys.map(String))}
  rowHeight={40}
  selectedRowKeys={selectedRowKeys}
  showHeader
/>
```

`UPTable2` keeps FlashList refs private, supports fixed-left columns only, and
uses fixed row height as its virtualization contract. `expandRowKeys` follows
the source naming; `expandedRowKeys` remains as a P34 compatibility alias.
Column `style` is applied to the corresponding header cell. Selection emits
`onSelectionChange` before `onSelect`, matching the source event order.
Pagination and remote fetching remain application-owned. Fixed-right columns,
dynamic row-height virtualization, half-selection, filter UI, and exposed
native refs are not part of the source-compatible API.

## Status

- [Design](docs/superpowers/specs/2026-07-25-ultra-ui-react-native-design.md)
- [Implementation plan](docs/superpowers/plans/2026-07-25-ultra-ui-react-native-p0.md)
- [P1 display essentials plan](docs/superpowers/plans/2026-07-25-ultra-ui-react-native-p1-display-essentials.md)
- [P2 core inputs plan](docs/superpowers/plans/2026-07-25-ultra-ui-react-native-p2-core-inputs.md)
- [P3 feedback overlays plan](docs/superpowers/plans/2026-07-25-ultra-ui-react-native-p3-feedback-overlays.md)
- [P4 status and progress plan](docs/superpowers/plans/2026-07-25-ultra-ui-react-native-p4-status-progress.md)
- [P5 scroll surfaces plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p5-scroll-surfaces.md)
- [P6 display state plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p6-display-state.md)
- [P7 navigation surfaces plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p7-navigation-surfaces.md)
- [P8 static table plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p8-static-table.md)
- [P9 swiper plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p9-swiper.md)
- [P10 list plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p10-list.md)
- [P11 utility surfaces plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p11-utility-surfaces.md)
- [P12 copy plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p12-copy.md)
- [P13 choose plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p13-choose.md)
- [P14 column notice plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p14-column-notice.md)
- [P15 row notice plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p15-row-notice.md)
- [P16 swipe action plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p16-swipe-action.md)
- [P17 album plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p17-album.md)
- [P18 index list plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p18-index-list.md)
- [P19 picker family plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p19-picker.md)
- [P20 keyboard family plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p20-keyboard.md)
- [P21 tooltip and popover plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p21-tooltip-popover.md)
- [P22 index list PanResponder plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p22-index-list-pan-responder.md)
- [P23 code countdown plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p23-code.md)
- [P33 tree and waterfall plan](docs/superpowers/plans/2026-08-09-ultra-ui-react-native-p33-waterfall.md)
- [P34 table2 design](docs/superpowers/specs/2026-08-09-ultra-ui-react-native-p34-table2-design.md)
- [P34 table2 plan](docs/superpowers/plans/2026-08-09-ultra-ui-react-native-p34-table2.md)
- [Compatibility guide](docs/compatibility.md)
- [API gap matrix](docs/gap-matrix.md)
- [Native smoke tests](tests/e2e/README.md)

Implemented components: `UPRoot`, `UPButton`, `UPIcon`, `UPText`, `UPTag`,
`UPBadge`, `UPGap`, `UPLine`, `UPDivider`, `UPTitle`, `UPSection`, `UPView`, and
`UPBox`, `UPImage`, `UPAvatar`, `UPEmpty`, `UPSkeleton`, `UPCell`,
`UPCellGroup`, `UPCard`, `UPRow`, `UPCol`, `UPGrid`, and `UPGridItem`.
P2 adds `UPInput`, `UPTextarea`, `UPSearch`, `UPSwitch`, `UPCheckbox`,
`UPCheckboxGroup`, `UPRadio`, `UPRadioGroup`, `UPRate`, `UPSlider`,
`UPNumberBox`, `UPCodeInput`, `UPForm`, and `UPFormItem`.
P3 adds `UPTransition`, `UPOverlay`, `UPPopup`, `UPModal`, `UPActionSheet`,
`UPLoadingIcon`, `UPLoadingPage`, `UPToast`, and `UPNotify`, including
host-backed `UP.toast` and `UP.notify` APIs through `UPRoot`.
P4 adds `UPLineProgress`, `UPCircleProgress`, `UPLoadmore`, `UPCountDown`, and
`UPCountTo` with source-compatible timing refs.
P5 adds `UPStatusBar`, `UPSafeBottom`, `UPNoticeBar`, `UPReadMore`,
`UPScrollHost`, `UPSticky`, and `UPBackTop`. `UPSticky` and `UPBackTop` bind
to an explicit `UPScrollHost` rather than an implicit page scroll source.
P6 adds `UPLink`, `UPAlert`, `UPAvatarGroup`, `UPSubsection`, `UPCollapse`,
`UPCollapseItem`, `UPSteps`, and `UPStepsItem` with source event payloads and
React context parent/child state.
P7 adds `UPToolbar`, `UPScrollList`, `UPTabs`, and `UPPagination` with native
accessible navigation roles, source selection callbacks, and RN-core scroll or
modal adapters.
P8 adds `UPTable`, `UPTr`, `UPTh`, and `UPTd` with inherited source borders,
alignment, typography, padding, and per-cell overrides.
P9 adds `UPSwiper` and `UPSwiperIndicator` with controlled source indices,
autoplay, native pagination, and line/dot indicators.
P10 adds `UPList` and `UPListItem` with source threshold events, native pull
refresh mapping, controlled scroll positions, and registered item anchors.
P11 adds `UPAgreement`, `UPNoNetwork`, and `UPFloatButton` with ref-driven
agreement confirmation, explicit reachability overlays, and expandable menus.
P12 adds `UPCopy` with source feedback modes and an explicit application-owned
clipboard adapter.
P13 adds `UPChoose`, preserving source index selection, tag appearance, custom
click callbacks, native wrapping, and horizontal no-wrap scrolling.
P14 adds `UPColumnNotice`, preserving source `step` paging direction, timed
notice cycling, touch configuration, icon modes, and current-index click events
with React Native core.
P15 adds `UPRowNotice`, preserving source string marquee measurement, speed,
icon modes, close behavior, and no-payload click events with React Native
`Animated`.
P16 adds `UPSwipeAction` and `UPSwipeActionItem`, preserving source right-side
options, controlled opening, sibling auto-close, and action payloads through
native `ReanimatedSwipeable`.
P17 adds `UPAlbum`, preserving source single/multiple image layouts, `+N`
overflow indicators, reactive defaults, and `onPreview` callbacks for
application-owned image viewing.
P18 adds `UPIndexList`, `UPIndexItem`, and `UPIndexAnchor`, preserving
default/custom index rails, exact source selection payloads, measured native
jumps, accessible discrete rail controls, and continuous native vertical rail
drag selection through `PanResponder`.
P19 adds `UPPicker`, `UPPickerData`, `UPPickerColumn`, and `UPSelect`,
preserving source multi-column drafts, confirmation payloads, picker ref
methods, one-column data triggers, and root-overlay selection menus.
P20 adds `UPKeyboard`, `UPNumberKeyboard`, and `UPCarKeyboard`, preserving
source number, identity-card, and vehicle-plate layouts, controlled popup
visibility, toolbar callbacks, key payloads, and press-and-hold backspace.
P21 adds `UPTooltip` and `UPPopover`, preserving source copy/actions,
singleton behavior, imperative refs, transparent overlays, and measured
root-overlay placement through `UPRoot`.
P23 adds headless `UPCode`, preserving source verification-code messages,
`start()`/`reset()` refs, absolute-deadline countdowns, and optional
application-owned persistence for `keepRunning`.
P32 adds `UPUpload` and `UPLazyLoad`, preserving source upload queue callbacks
through explicit picker/upload adapters and source lazy image behavior through
controlled or scroll-host-provided visibility inputs.
P33 adds `UPTree` and `UPWaterfall`. `UPTree` uses virtualized visible rows,
expansion/current/check state, field mapping, custom node rendering, and
imperative ref methods. `UPWaterfall` uses FlashList masonry for dynamic item
heights, fixed or automatic columns, delayed additions, source-shaped
`modelValue` callbacks, immutable ref mutations, and ref-driven
remove/clear/modify/scroll methods.
P34 adds `UPTable2`, a FlashList-backed generic data grid with source-shaped
columns, controlled selection/expansion/current-row state, tree flattening,
sorting/filtering, callback or Promise lazy children, fixed headers, and a
synchronized fixed-left overlay. The static `UPTable` family remains unchanged.
P39 completes the interface audit: the full 91-component props + events
comparison against uview-plus@3.8.86 is green. Source emit names are kept
verbatim (`onScrolltolower`, `onTouchstart`, `onHeadClick`, `onUpdateModelValue`),
existing RN callbacks are unchanged, and every remaining event gap is closed —
number-box plus/minus/overlimit, card section clicks, popup click, modal
cancelOnAsync, slider start, barcode rendered, canvas touch aliases, list
scroll/refresher aliases, input/textarea keyboard and input events, plus the
`onInput` v-model aliases across code-input, rate, switch, search,
datetime-picker, and waterfall. `UPRadio.color` completes the prop surface.
Remaining source components stay explicitly tracked in the gap matrix.

P40 ports the last 8 pure-JS source components that had no local equivalent:
`UPActionSheetData`, `UPColorPicker`, `UPCoupon`, `UPGoodsSku`, `UPMarkdown`,
`UPMessageInput`, `UPParse`, `UPNovelReader`. All follow the source contract
(props, defaults, events) with zero new runtime dependencies — markdown and
HTML parsing are built in, SKU availability is pure logic, and the novel
reader ships scroll reading, catalog, settings, bookmarks, and injectable
storage (`setUPNovelStorage`). Native-dependent source components
(cropper/poster/pdf-reader/short-video) remain documented React Native
boundaries. The example app demos all 8 new components.

P41 ships the final 4 source components as interface skeletons with native
boundaries: `UPCropper` (crop box interaction, export injected),
`UPPoster` (json layout, export adapter), `UPPdfReader` (`renderPdf` slot),
and `UPShortVideo` (tabs/pager/action rail, `renderVideo` slot). Source
coverage is now 140/140 components.

P43–P55 close the remaining surfaces against uview-plus@3.8.86:
`scripts/audit-source-compat.mjs` audits props/events/defaults/refs with a
source-contract regression test; the `$u` utility library is fully ported
(`timeFormat`, `deepMerge`, float-safe `plus/minus/times/divide`, 16 extra
validators, `os`/`sys`/`getWindowInfo`, …) and exposed as `UP.<fn>`;
ref methods match the source `.d.ts` `_XxxRef` interfaces; theme colors
(`borderColor` `#e4e7ed`, `default` token) and zIndex align with source.

P47 ports the official demo app's 29 navigable pages (`src/pages/` of
`ijry/uview-plus@3.x`) into `example/pages/`: a grouped index with in-app
navigation (`DemoPagesHost`, opened from the example app's `Pages` tab) that
exercises the ported components the way the source demos do — card/tabbar/
steps/tooltip variants, guide, cate-tab, dragsort, pull-refresh, select, and
14 business templates (address, region picker, comments, coupons, pay
keyboard, login + sms code, mall menus, order list with tabs+swiper, submit
bar, profile). See `docs/compatibility-report.md` for the full cross-surface
consistency report.
