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

`UPLazyLoad` is explicit. Pass `visible`, or provide scroll/viewport inputs
from the screen that owns scrolling.

```tsx
<UPLazyLoad src={imageUrl} visible={isImageVisible} width="100%" height={180} />;
```

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
Remaining source components stay explicitly tracked in the gap matrix.
