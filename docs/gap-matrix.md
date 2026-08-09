# React Native Compatibility Matrix

Source: `uview-plus` 3.8.86. Status values: Supported, Emulated, No-op retained, Host adapter, Deferred.

## P0

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-button` | `hairline`, `type`, `size`, `shape`, `plain`, `disabled`, `loading`, `loadingText`, `loadingSize`, `text`, `icon`, `iconColor`, `color`, `throttleTime`, `customStyle` | Identical `UPButtonProps` | Source 3.8.86 defaults; native states and throttle behavior | Supported | `tests/components/UPButton.test.tsx` |
| `u-button` | CSS gradient `color` | First color-stop fallback | Development warning; a native gradient adapter is deferred | Emulated | `src/components/button/UPButton.tsx` |
| `u-button` | `openType`, `formType`, mini-program metadata and open-capability events | Retained deprecated props | Accepted but neither rendered nor invoked on React Native | No-op retained | `src/components/button/UPButton.tsx` |
| `u-icon` | `name`, theme colors, image/font size, labels, `index`, `click`, `customStyle` | `UPIconProps`, `onClick` | Source icon font map, URI image handling, and label layout | Supported | `tests/components/UPIcon.test.tsx` |
| `u-icon` | uni `imgMode` | `Image.resizeMode` | `aspectFill`, `aspectFit`, `scaleToFill`, `widthFix`, and related values map to their closest React Native mode | Emulated | `tests/components/UPIcon.test.tsx` |
| `u-icon` | `hoverClass`, `customClass`, `stop` | Retained deprecated props | React Native has no CSS class or uni propagation equivalent | No-op retained | `src/components/icon/UPIcon.tsx` |

## P1 Display Essentials

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-text` | `type`, `show`, `text`, `prefixIcon`, `suffixIcon`, `mode`, `format`, `bold`, `block`, `lines`, `color`, `size`, `iconStyle`, `decoration`, `margin`, `lineHeight`, `align`, `wordWrap`, `flex1`, `click` | Identical `UPTextProps`, `onClick` | Source defaults; `price`, `phone`, `name`, `date`, and link formatting are implemented | Supported | `tests/components/UPText.test.tsx` |
| `u-text` | `href`, `call` | `href`, `call`, `onLinkPress` | Opens `Linking` URL or `tel:` URI when no handler is supplied | Emulated | `tests/components/UPText.test.tsx` |
| `u-text` | `openType`, mini-program metadata/events, `customClass` | Retained deprecated props | Accepted but not rendered or invoked on React Native | No-op retained | `src/components/text/UPText.tsx` |
| `u-tag` | `type`, `disabled`, `size`, `shape`, `text`, colors, `name`, `plainFill`, `plain`, `closable`, `show`, icon and custom size props, `click`, `close` | Identical `UPTagProps`, `onClick`, `onClose` | Source `mini`/`medium`/`large` metrics, colors, plain fill, named callbacks | Supported | `tests/components/UPTag.test.tsx` |
| `u-tag` | source fade transition | Render visibility | React Native base package does not bundle a transition runtime for tags | Emulated | `tests/components/UPTag.test.tsx` |
| `u-tag` | `customClass` | Retained deprecated prop | CSS class runtime unavailable | No-op retained | `src/components/tag/UPTag.tsx` |
| `u-badge` | `isDot`, `value`, `modelValue`, `show`, `max`, `type`, `showZero`, colors, `shape`, `numberType`, `offset`, `inverted`, `absolute` | Identical `UPBadgeProps` | Source overflow/ellipsis/limit display and absolute offsets | Supported | `tests/components/UPBadge.test.tsx` |
| `u-badge` | Vue default slot | `children` | Children are wrapped in a relative React Native view and badge attaches top-right | Emulated | `tests/components/UPBadge.test.tsx` |
| `u-gap` | `bgColor`, `height`, `marginTop`, `marginBottom`, `customStyle` | Identical `UPGapProps` | Source defaults and 750rpx conversion | Supported | `tests/components/UPLayoutPrimitives.test.tsx` |
| `u-line` | `color`, `length`, `direction`, `hairline`, `margin`, `dashed`, `customStyle` | Identical `UPLineProps` | Source 0.5px transform and horizontal/vertical geometry | Supported | `tests/components/UPLayoutPrimitives.test.tsx` |
| `u-line` | CSS dashed border rasterization | Native `borderStyle: 'dashed'` | Native dash pattern is platform-dependent | Emulated | `tests/components/UPLayoutPrimitives.test.tsx` |
| `u-divider` | `dashed`, `hairline`, `dot`, text props, `customStyle`, `click` | Identical `UPDividerProps`, `onClick` | Source 15px spacing and left/right `80rpx` alignment | Supported | `tests/components/UPLayoutPrimitives.test.tsx` |
| `u-divider` | Vue default slot | `children` | React node replaces source text content | Emulated | `src/components/divider/UPDivider.tsx` |
| `u-title` | prefix/default slots | `prefix`, `children` | Source 4×18 primary prefix and 10px spacing | Emulated | `tests/components/UPContainers.test.tsx` |
| `u-section` | `title`, `subTitle`, `right`, typography/color/line/arrow props | Identical `UPSectionProps` | Source defaults, including localized `更多` fallback | Supported | `tests/components/UPContainers.test.tsx` |
| `u-section` | Vue default/right slots | `children`, `rightContent` | Named nodes map to ReactNode props | Emulated | `tests/components/UPContainers.test.tsx` |
| `u-view` | style props and `click` | Identical `UPViewProps`, `onClick` | Maps source dimensions, padding, margins, flex and native press behavior | Supported | `tests/components/UPLayoutPrimitives.test.tsx` |
| `u-box` | `bgColors`, `height`, `borderRadius`, `gap`, icon/title props | Identical `UPBoxProps` | Source three-panel dimensions and colors | Supported | `tests/components/UPContainers.test.tsx` |
| `u-box` | Vue `left`, `rightTop`, `rightBottom` named slots | `left`, `rightTop`, `rightBottom` ReactNode props | Named slot mapping | Emulated | `tests/components/UPContainers.test.tsx` |
| `u-image` | `src`, `mode`, dimensions, shape/radius, loading/error state props, `click`, `load`, `error` | Identical `UPImageProps`, `onClick`, `onLoad`, `onError` | Source default metrics, image state and callbacks | Supported | `tests/components/UPContentMedia.test.tsx` |
| `u-image` | uni `mode` and Vue loading/error slots | Native `Image.resizeMode`, `loading`, `error` ReactNode props | Closest source-compatible native mapping | Emulated | `tests/components/UPContentMedia.test.tsx` |
| `u-image` | `lazyLoad`, `showMenuByLongpress`, `webp`, CSS fade transition, `customClass` | Retained deprecated props | Native image loading differs; CSS fade is opacity-only | No-op retained | `src/components/image/UPImage.tsx` |
| `u-avatar` | `src`, shape, size, mode, text, colors, icon, random background, `name` | Identical `UPAvatarProps`, `onClick` | Source fallback order and source defaults | Supported | `tests/components/UPContentMedia.test.tsx` |
| `u-avatar` | `mpAvatar` | Retained deprecated prop | Mini-program chooser unavailable | No-op retained | `src/components/avatar/UPAvatar.tsx` |
| `u-empty` | icon/text/color/size/mode/dimension/show/margin props | Identical `UPEmptyProps` | Source visibility and source-mode icon fallback | Supported | `tests/components/UPContentMedia.test.tsx` |
| `u-empty` | Vue icon/default slots | `iconNode`, `children` ReactNode props | Named slot mapping | Emulated | `src/components/empty/UPEmpty.tsx` |
| `u-skeleton` | loading, title/avatar/row dimensions and shapes | Identical `UPSkeletonProps` | Source placeholder layout and loaded child content | Supported | `tests/components/UPContentMedia.test.tsx` |
| `u-skeleton` | CSS shimmer `animate` | Retained deprecated prop | Static native placeholder; Reanimated shimmer deferred | Emulated | `src/components/skeleton/UPSkeleton.tsx` |
| `u-cell` | text/icon/state/arrow/style/name props, `click` | Identical `UPCellProps`, `onClick({ name })` | Source 13×15 metrics, icon, required marker, border, and disabled behavior | Supported | `tests/components/UPCellCard.test.tsx` |
| `u-cell` | Vue icon/title/label/value/right-icon slots | `iconNode`, `titleNode`, `labelNode`, `valueNode`, `rightIconNode` | Named slot mapping | Emulated | `tests/components/UPCellCard.test.tsx` |
| `u-cell` | `url`, `linkType`, `stop`, `customClass` | Retained deprecated props | Navigation and event propagation are application-owned | No-op retained | `src/components/cell/UPCell.tsx` |
| `u-cell-group` | `title`, `border`, `customStyle` | Identical `UPCellGroupProps` | Source title spacing and wrapper border | Supported | `tests/components/UPCellCard.test.tsx` |
| `u-cell-group` | title/default Vue slots | `titleNode`, `children` ReactNode props | Named slot mapping | Emulated | `src/components/cell/UPCellGroup.tsx` |
| `u-card` | source title/subtitle/layout/border/thumb/padding/show props | Identical `UPCardProps` | Source margin, radius, section borders, and spacing | Supported | `tests/components/UPCellCard.test.tsx` |
| `u-card` | head/body/foot Vue slots | `head`, `children`, `foot` ReactNode props | Named slot mapping | Emulated | `tests/components/UPCellCard.test.tsx` |
| `u-card` | CSS `boxShadow`, `customClass` | Retained deprecated props | Use React Native `customStyle` shadow/elevation values | No-op retained | `src/components/card/UPCard.tsx` |
| `u-row` | `gutter`, `justify`, `align`, `click` | Identical `UPRowProps`, `onClick` | Source flex alignment and negative gutter margins | Supported | `tests/components/UPLayoutGrid.test.tsx` |
| `u-col` | `span`, `offset`, alignment, text alignment, `click` | Identical `UPColProps`, `onClick` | Source 12-column percentage dimensions and inherited gutter | Supported | `tests/components/UPLayoutGrid.test.tsx` |
| `u-grid` | `col`, `border`, `align`, `gap`, `click` | Identical `UPGridProps`, `onClick` | Source wrapping/alignment and child-name forwarding | Supported | `tests/components/UPLayoutGrid.test.tsx` |
| `u-grid-item` | `name`, `bgColor`, `click` | Identical `UPGridItemProps`, `onClick` | Source name-or-index output and adjacent 0.5px borders | Supported | `tests/components/UPLayoutGrid.test.tsx` |
| `u-grid` / `u-grid-item` | Vue parent/child instance communication | React context + child index injection | Direct `UPGridItem` children receive source column, border, index behavior | Emulated | `tests/components/UPLayoutGrid.test.tsx` |

## P2 Core Inputs

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-input` | value, formatter, clear, password, word limit, borders, icons, focus/blur/confirm | `UPInputProps`, `value` / `modelValue`, `onChange`, `onFocus`, `onBlur`, `onConfirm` | Native `TextInput` maps source text/password/clear behavior and dimensions | Supported | `tests/components/UPInputs.test.tsx` |
| `u-textarea` | value, formatter, maxlength, count, height, borders, focus/blur/confirm | `UPTextareaProps`, controlled aliases and callbacks | Native multiline `TextInput`, source count and dimensions | Supported | `tests/components/UPInputs.test.tsx` |
| `u-search` | source shape, label, clear/action/search/custom callbacks | `UPSearchProps`, controlled aliases and callbacks | Source round/square metrics and search action behavior | Supported | `tests/components/UPInputs.test.tsx` |
| input / textarea / search | uni cursor, keyboard, fixed positioning, placeholder classes, `customClass` | Retained deprecated props | No direct React Native core equivalent | No-op retained | Component prop types |
| `u-switch` | active/inactive values, async change, colors, size, disabled/loading | `UPSwitchProps`, `value` / `modelValue`, `onChange` | Source active value mapping and async controlled behavior | Supported | `tests/components/UPSelectionControls.test.tsx` |
| `u-checkbox` / group | names, selected array, group inheritance, placement, colors, labels | `UPCheckboxProps`, `UPCheckboxGroupProps` | Context-based group model and source named callbacks | Emulated | `tests/components/UPSelectionControls.test.tsx` |
| `u-radio` / group | selected value, group inheritance, placement, colors, labels | `UPRadioProps`, `UPRadioGroupProps` | Context-based group model and source named callbacks | Emulated | `tests/components/UPSelectionControls.test.tsx` |
| `u-rate` | count, min count, half values, icons/colors, readonly | `UPRateProps`, `onChange` | Source values and half-rate press behavior | Supported | `tests/components/UPSelectionControls.test.tsx` |
| `u-slider` | min/max/step, colors, range, vertical, `useNative`, changing/change | `UPSliderProps`, `onChanging`, `onChange` | Step-based press segments provide RN-core fallback values | Emulated | `tests/components/UPSelectionControls.test.tsx` |
| `u-number-box` | min/max/step, integer, decimal, async, input/button props | `UPNumberBoxProps`, `onChange`, `onBlur` | Source range/step callbacks and native numeric input | Supported | `tests/components/UPSelectionControls.test.tsx` |
| `u-number-box` | continuous long press | Retained `longPress` prop | RN-core implementation only changes on individual presses | No-op retained | `src/components/number-box/UPNumberBox.tsx` |
| `u-code-input` | value, length, dot, box/line mode, focus, finish | `UPCodeInputProps`, `onChange`, `onFinish` | Hidden native numeric input drives source-style visual boxes | Emulated | `tests/components/UPSelectionControls.test.tsx` |
| `u-form` / `u-form-item` | model, rules, labels, error type, `validate*`, reset/clear | `UPForm`, `UPFormItem`, `UPFormRef` | Required/pattern/min/max/custom async rules and message/border errors | Supported | `tests/components/UPForm.test.tsx` |
| `u-form` | source `errorType="toast"` | Retained `errorType` value | Overlay toast presentation is deferred; no toast emitted yet | No-op retained | `src/components/form/UPForm.tsx` |
| form item | Vue default/label/right/error slots | `children`, `labelNode`, `right`, `error` | ReactNode slot mapping | Emulated | `src/components/form/UPFormItem.tsx` |

## P3 Feedback and Overlays

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-transition` | show, mode, duration, timing, lifecycle and click events | `UPTransitionProps` | Animated fade, slide, and zoom visibility with source lifecycle callbacks | Emulated | `tests/components/UPOverlayTransition.test.tsx` |
| `u-overlay` | show, zIndex, duration, opacity, click, slot | `UPOverlayProps`, `children`, `onClick` | Full-screen source black opacity and configurable stacking | Supported | `tests/components/UPOverlayTransition.test.tsx` |
| `u-popup` | show, overlay, position, safe area, round, close, Vue slots | `UPPopupProps`, `children`, `bottom`, `onChangeShow` | Root overlay stack, native safe-area insets, controlled close events | Emulated | `tests/components/UPPopupModal.test.tsx` |
| `u-popup` | `touchable`, min/max pan resizing, CSS class props | Retained deprecated props | Native drag-to-resize is deferred; max height remains mapped | No-op retained | `src/components/popup/UPPopup.tsx` |
| `u-modal` | title/content/buttons/async close/overlay/width | `UPModalProps`, `onConfirm`, `onCancel`, `onChangeShow` | Source default width, button order, controlled and async close semantics | Supported | `tests/components/UPPopupModal.test.tsx` |
| `u-action-sheet` | actions, key names, cancel, overlay, safe bottom, select/close | `UPActionSheetProps`, `onSelect(action)`, `onChangeShow` | Source action payload, disabled state, and controlled closing | Supported | `tests/components/UPFeedbackDisplay.test.tsx` |
| `u-action-sheet` | mini-program `openType` | Retained deprecated prop | Application-owned native capability handling | No-op retained | `src/components/action-sheet/UPActionSheet.tsx` |
| `u-loading-icon` | show/color/text/layout/mode/size | `UPLoadingIconProps` | Native ActivityIndicator with source text/layout metrics | Emulated | `tests/components/UPFeedbackDisplay.test.tsx` |
| `u-loading-page` | loading/text/image/mode/colors/z-index | `UPLoadingPageProps` | Absolute native loading layer with optional image | Emulated | `tests/components/UPFeedbackDisplay.test.tsx` |
| `u-toast` | declarative/ref `show`, theme shortcuts, duration, overlay, position | `UPToast`, `UP.toast` host API | Source duration, type, loading, position and completion behavior | Emulated | `tests/feedback/UPFeedbackHost.test.tsx` |
| `u-notify` | declarative/ref `show`, type, colors, duration, safe top | `UPNotify`, `UP.notify` host API | Root-hosted source duration/type/safe-area presentation | Emulated | `tests/components/UPToastNotify.test.tsx` |
| toast / notify | uni navigation callbacks, CSS transition/class runtime | Retained deprecated props | Navigation is app-owned; Animated/native views replace CSS behavior | No-op retained | `src/components/toast/UPToast.tsx` |

## P4 Status and Progress

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-line-progress` | colors, percentage, text, height, from-right | `UPLineProgressProps` | Source defaults, clamped percentage, and left/right fill origin | Supported | `tests/components/UPProgressStatus.test.tsx` |
| `u-circle-progress` | percentage | `UPCircleProgressProps` | RN-core filled-circle percentage approximation | Emulated | `tests/components/UPProgressStatus.test.tsx` |
| `u-loadmore` | state, labels, loading icon, line/margins, `loadmore` | `UPLoadmoreProps`, `onLoadmore` | Source state labels, dot behavior, and actionable loadmore state | Supported | `tests/components/UPProgressStatus.test.tsx` |
| `u-count-down` | time, format, autoStart, millisecond, `change`, `finish`, instance controls | `UPCountDown`, `UPCountDownRef` | Source time formatting, fake-timer-safe scheduling, and start/pause/reset controls | Supported | `tests/components/UPProgressStatus.test.tsx` |
| `u-count-to` | start/end, duration, autoplay, decimals, easing, color, separator, `end`, instance controls | `UPCountTo`, `UPCountToRef` | Source number formatting/easing and start/pause/resume/reset controls | Supported | `tests/components/UPProgressStatus.test.tsx` |
 
## P5 Scroll Surfaces

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-status-bar` | `bgColor`, `height`, `update:height`, child slot | `UPStatusBarProps`, `onUpdateHeight`, `children` | Uses `react-native-safe-area-context` top inset unless an explicit source height is supplied | Emulated | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-safe-bottom` | childless safe-area spacer and `customStyle` | `UPSafeBottomProps` | Uses the native bottom inset supplied by `UPRoot` | Supported | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-notice-bar` | text, direction, step, icon, mode, colors, speed/duration, click, close | `UPNoticeBarProps`, `onClick`, `onClose` | Source labels/icons, animated row marquee, and timed column/step index cycles | Emulated | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-notice-bar` | `url`, `linkType`, `customClass` | Retained deprecated props | Navigation and CSS class resolution are application-owned on React Native | No-op retained | `src/components/notice-bar/UPNoticeBar.tsx` |
| `u-read-more` | show height, labels, colors, toggle, name, open/close | `UPReadMoreProps`, `onOpen`, `onClose` | Native `onLayout` measurement clamps then expands arbitrary React children | Emulated | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-read-more` | CSS `shadowStyle`, arbitrary-child `textIndent`, `customClass` | Retained deprecated props | React Native cannot apply source CSS gradient or text-indent behavior to arbitrary trees | No-op retained | `src/components/read-more/UPReadMore.tsx` |
| `u-sticky` | offsets, disabled, bg/z-index/index, fixed/unfixed | `UPStickyProps`, `onFixed`, `onUnfixed` inside `UPScrollHost` | Explicit host scroll position drives a native fixed overlay with source callbacks | Emulated | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-back-top` | mode, icon/text, source scroll position, threshold, placement, click | `UPBackTopProps`, `onClick` inside `UPScrollHost` | Explicit host calls native `scrollTo({ y: 0 })`; controlled `scrollTop` remains supported | Emulated | `tests/components/UPScrollSurfaces.test.tsx` |
| `u-back-top` / `u-sticky` | implicit `uni.pageScrollTo` / global page scroll | `UPScrollHost` contract | No undocumented global scroll source is assumed; host currently wraps React Native `ScrollView` | Emulated | `src/components/scroll-host/UPScrollHost.tsx` |

## P6 Display State

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-link` | color, font, underline, href, text, `click` | `UPLinkProps`, `onClick`, `onLinkPress` | Uses React Native `Linking` for source HTTP/deep links; app handler can override | Emulated | `tests/components/UPDisplayState.test.tsx` |
| `u-link` | `mpTips`, `customClass` | Retained deprecated props | Mini-program clipboard feedback and CSS runtime are unavailable | No-op retained | `src/components/link/UPLink.tsx` |
| `u-alert` | model value, title/type/description, icon/effect, duration, click/close/closed | `UPAlertProps`, `onUpdateModelValue`, `onClose`, `onClosed` | Source colors, controlled visibility, close callbacks, and duration | Emulated | `tests/components/UPDisplayState.test.tsx` |
| `u-alert` | CSS `transitionMode`, close named slot, `customClass` | Retained props / ReactNode replacement | Core native View updates replace CSS animation; pass composition outside the close control | No-op retained | `src/components/alert/UPAlert.tsx` |
| `u-avatar-group` | URL list, object key, overlap, shape/mode, max count, extra count, `showMore` | `UPAvatarGroupProps`, `onShowMore` | Reuses `UPAvatar`; final rendered item receives source `+N` overlay | Supported | `tests/components/UPDisplayState.test.tsx` |
| `u-subsection` | list/current, source colors, modes, item color keys, disabled, `change`, `update:current` | `UPSubsectionProps`, `onChange`, `onUpdateCurrent` | Controlled current alias and RN-core segmented layout | Emulated | `tests/components/UPDisplayState.test.tsx` |
| `u-collapse` / `u-collapse-item` | value, accordion, borders, labels/icons, slots, open/close/change | `UPCollapse`, `UPCollapseItem`, React children | Context-driven source selection; `change` returns each `{ name, status }` item | Emulated | `tests/components/UPDisplayState.test.tsx` |
| `u-collapse-item` | CSS height transition duration, `cellCustomClass`, `customClass` | Retained deprecated props | Core visibility update preserves state callbacks but not source exact height animation | No-op retained | `src/components/collapse/UPCollapseItem.tsx` |
| `u-steps` / `u-steps-item` | direction/current/colors/icons/dot and title/desc/error/item slot | `UPSteps`, `UPStepsItem`, ReactNode props | Context derives source finish/process/error/wait precedence and row/column layout | Emulated | `tests/components/UPDisplayState.test.tsx` |

## P7 Navigation Surfaces

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-toolbar` | show, title, cancel/confirm labels/colors, right slot, cancel/confirm | `UPToolbarProps`, `right`, `onCancel`, `onConfirm` | Source labels and colors with accessible 44px press actions | Supported | `tests/components/UPNavigationSurfaces.test.tsx` |
| `u-scroll-list` | horizontal slot list, source indicator metrics/colors, edge callbacks | `UPScrollListProps`, React children, `onLeft`, `onRight` | Core horizontal `ScrollView` maps edge offset to source indicator position | Emulated | `tests/components/UPNavigationSurfaces.test.tsx` |
| `u-tabs` | list/current/key/style/shape/indicator/icons/badges; click/change/long press | `UPTabsProps`, `onClick`, `onChange`, `onLongPress`, `onUpdateCurrent` | Native layout measurement drives source indicator and scroll centering; disabled tabs still emit click | Emulated | `tests/components/UPNavigationSurfaces.test.tsx` |
| `u-tabs` | `lineBgSize`, CSS string styles, `customClass`, Vue slots | Retained props / render callbacks | Native core lacks CSS background-image sizing; use React render callbacks for slots | No-op retained | `src/components/tabs/UPTabs.tsx` |
| `u-pagination` | page/current/total/layout/labels/colors/sizes/single-page hiding | `UPPaginationProps`, current/page-size callbacks | Source page range and callbacks; `sizes` uses a core RN Modal picker | Emulated | `tests/components/UPNavigationSurfaces.test.tsx` |
| `u-pagination` | `jumper` | Omitted source template feature | Upstream implementation comments out its jumper markup | Deferred source behavior | `src/components/pagination/UPPagination.tsx` |

## P8 Static Tables

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-table` | border, alignment, padding, font/color, header style, background, child rows | `UPTableProps`, React children | Provides source table values to descendant static cells through React context | Supported | `tests/components/UPStaticTable.test.tsx` |
| `u-tr` | row child slot | `UPTrProps`, React children | Source flex row with full-width children | Supported | `tests/components/UPStaticTable.test.tsx` |
| `u-th` | source inherited header style and percentage width | `UPThProps` | Inherits source table context; supports percentage or native dimension width | Supported | `tests/components/UPStaticTable.test.tsx` |
| `u-td` | inherited table styles plus width/text/border/color overrides | `UPTdProps` | Inherits table defaults and applies source per-cell overrides | Supported | `tests/components/UPStaticTable.test.tsx` |
| `u-table` family | CSS `customClass`, style effects on arbitrary React child trees | Retained deprecated props | React Native CSS classes are unavailable; source text styles apply automatically to primitive children | No-op retained | `src/components/table/cell.tsx` |
| `u-table2` | sortable/tree/selectable/fixed-column data grid | `UPTable2Props`, `UPTable2Column`, `renderCell`, `renderHeader`, FlashList virtualization, sort/filter events, recursive tree selection, callback/Promise lazy loading, fixed-left overlay, fixed header, `spanMethod` | Generic source-shaped columns with fixed row height; FlashList refs remain private; fixed-right and pagination/remote fetching remain application-owned boundaries | Emulated | `tests/components/UPTable2.test.tsx`, `tests/components/UPTable2State.test.ts` |

## P9 Swiper

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-swiper` | list/image items, current, autoplay, orientation, dimensions, image mode, title, change/click/update events | `UPSwiperProps`, `renderItem`, `onClick`, `onChange`, `onUpdateCurrent` | Native paged `ScrollView` with controlled index synchronization, source callbacks, source image defaults, and timer-driven circular autoplay | Emulated | `tests/components/UPSwiper.test.tsx` |
| `u-swiper-indicator` | length/current, active/inactive colors, line/dot mode | `UPSwiperIndicatorProps` | Standalone native line/dot indicator; `UP.setConfig({ props: { swiperIndicator } })` updates mounted instances | Supported | `tests/components/UPSwiper.test.tsx` |
| `u-swiper` | default item/indicator Vue slots | `renderItem`, `renderIndicator` | Render functions replace Vue slots and support arbitrary React Native slide content | Emulated | `src/components/swiper/UPSwiper.tsx` |
| `u-swiper` | video item rendering, exact `duration`, custom `easingFunction`, infinite drag `circular`, acceleration, item IDs, CSS styles | Retained source props / custom rendering | Core React Native lacks a video primitive and source swiper runtime; `circular` wraps autoplay only and `renderItem` owns video content | No-op retained | `src/components/swiper/UPSwiper.tsx` |

## P10 List Surfaces

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-list` | vertical scroll, source dimensions, scrollbar/paging/scrollable, `scroll`, upper/lower thresholds, controlled scroll top | `UPListProps`, `onScroll`, `onScrollToUpper`, `onScrollToLower` | Core `ScrollView` emits numeric source offsets and fires each edge callback once when entering its configured threshold | Emulated | `tests/components/UPList.test.tsx` |
| `u-list-item` | `anchor`, child slot | `UPListItemProps`, React children | Registers a measured anchor within its nearest `UPList` for source `scrollIntoView` | Emulated | `tests/components/UPList.test.tsx` |
| `u-list` | source refresher enabled/triggered/background/refresh | `RefreshControl`, `onRefresherRefresh` | Core native pull-to-refresh maps controlled source refreshing state and refresh callback | Emulated | `tests/components/UPList.test.tsx` |
| `u-list` / `u-list-item` | virtual preloading, nvue accuracy, mini-program flex/back-to-top, refresh threshold/style and pulling lifecycle, CSS classes | Retained deprecated props | Core `ScrollView` has no source virtual-list or mini-program refresh lifecycle; registered anchors replace document-ID targeting | No-op retained | `src/components/list/UPList.tsx` |

## P11 Utility Surfaces

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-agreement` | `showModal`, protocol/privacy URLs, confirm | `UPAgreement`, `UPAgreementRef`, `onConfirm`, URL press callbacks | Ref exposes source-style modal opening; confirmation emits `1` and default agreement content maps to native text/press controls | Emulated | `tests/components/UPUtilitySurfaces.test.tsx` |
| `u-no-network` | tips, image, z-index, retry, automatic connected/disconnected events | `UPNoNetworkProps`, `connected`, `onRetry`, `onConnected`, `onDisconnected` | Explicit reachability adapter mounts a source white overlay with retry control and image/icon fallback | Emulated | `tests/components/UPUtilitySurfaces.test.tsx` |
| `u-float-button` | colors, dimensions, offsets, expandable list, click/item-click | `UPFloatButtonProps`, `onClick`, `onItemClick` | Parent-relative native absolute surface preserves source menu toggle and `{ ...item, index }` callbacks | Emulated | `tests/components/UPUtilitySurfaces.test.tsx` |
| P11 utility surfaces | quit-app behavior, automatic `uni` network listening/settings navigation, CSS fixed/classes/string styles | Explicit callbacks / retained props | Application owns navigation and network subscriptions; React Native core layout is parent-relative rather than CSS fixed | No-op retained | Component prop types |

## P12 Copy

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-copy` | `content`, `alertStyle`, `notice`, default/slot label, `success` | `UPCopy`, React children, `onSuccess` | Source empty/success/failure feedback and modal-or-toast branch are preserved | Emulated | `tests/components/UPCopy.test.tsx` |
| `u-copy` | `uni.setClipboardData` | Required `writeText(content)` application adapter | Core RN has no clipboard API; missing or failing adapters report source failure feedback without success | Host adapter | `tests/components/UPCopy.test.tsx` |
| `u-copy` | `uni.showToast`, `uni.showModal`, CSS classes | `UP.toast`, `UPModal`, retained `customClass` | Native feedback surfaces replace uni APIs; CSS class resolution is unavailable | No-op retained | `src/components/copy/UPCopy.tsx` |

## P13 Choose

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-choose` | options, modelValue, index tag state, custom-click, wrap | `UPChoose`, `onUpdateModelValue`, `onCustomClick`, `wrap` | Reuses native `UPTag`; source local index updates and loose `index == currentIndex` behavior are preserved | Emulated | `tests/components/UPChoose.test.tsx` |
| `u-choose` | Vue scoped slot | `renderItem({ item, index, selected, press })` | React render callback replaces source option slot while preserving the same index press flow | Emulated | `tests/components/UPChoose.test.tsx` |
| `u-choose` | type/valueName multiselect semantics, CSS classes | Retained `type`, `valueName`, `customClass` props | Source implementation never consumes type/valueName for selection; CSS class runtime is unavailable | No-op retained | `src/components/choose/UPChoose.tsx` |

## P14 Column Notice

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-column-notice` | `text`, `step`, `duration`, `disableTouch`, `click` | `UPColumnNotice`, `onClick(index)` | `step=false` is vertical and `step=true` is horizontal; duration wraps and disableTouch controls scrolling | Emulated | `tests/components/UPColumnNotice.test.tsx` |
| `u-column-notice` | named `icon` slot, `link`/`closable`, `close` | `iconNode`, `mode`, `onClose` | React node replaces the Vue slot; source icons and close/removal behavior remain | Emulated | `tests/components/UPColumnNotice.test.tsx` |
| `u-column-notice` | `speed`, unused horizontal computed state, circular dragging, CSS classes | Retained `speed`, `customClass` | Speed and unused direction are no-ops; exact infinite drag/CSS transitions are unavailable with core ScrollView | No-op retained | `src/components/column-notice/UPColumnNotice.tsx` |

## P15 Row Notice

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-row-notice` | string text, icon, speed, click, close | `UPRowNotice`, `onClick()`, `onClose()` | Measured content/text widths drive a source-speed horizontal native Animated loop | Emulated | `tests/components/UPRowNotice.test.tsx` |
| `u-row-notice` | named `icon` slot, `link`/`closable` modes | `iconNode`, `mode` | React node replaces the slot; source arrow, close, and local removal behavior remain | Emulated | `tests/components/UPRowNotice.test.tsx` |
| `u-row-notice` | nvue animation, WebView pause, CSS keyframes/classes, 20-character splitting | Retained `customClass` | Core RN Animated does not expose these source web/nvue runtimes | No-op retained | `src/components/row-notice/UPRowNotice.tsx` |

## P16 Swipe Action

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-swipe-action` | `autoClose`, `opendItem` | `UPSwipeAction`, `onUpdateOpendItem` | Parent coordinates registered children and closes siblings by default | Emulated | `tests/components/UPSwipeAction.test.tsx` |
| `u-swipe-action-item` | `show`, `options`, `click`, `closeOnClick` | `UPSwipeActionItem`, `onUpdateShow`, `onClick({ index, name })` | Native right actions retain source option payload and close semantics | Emulated | `tests/components/UPSwipeAction.test.tsx` |
| `u-swipe-action-item` | WXS/nvue gestures, CSS duration/classes, child `autoClose` | Retained `duration`, `autoClose`, `customClass` | `ReanimatedSwipeable` owns native gesture/timing; source-only values are no-ops | No-op retained | `src/components/swipe-action/UPSwipeActionItem.tsx` |

## P17 Album

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-album` | URLs, sizing, rows, `maxCount`, shape, `preview`, `albumWidth` | `UPAlbum`, `onPreview`, `onAlbumWidth` | Native image grid preserves source visible-item, sizing, and callback behavior | Emulated | `tests/components/UPAlbum.test.tsx` |
| `u-album` | `uni.previewImage`, Vue slots, CSS units/classes, `uni.getImageInfo` | Host callback / retained props | Application owns viewer UI; native image metadata and layout control timing | Host adapter / no-op retained | `src/components/album/UPAlbum.tsx` |

## P18 Index List

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-index-list`, `u-index-item`, `u-index-anchor` | index rail, grouped anchors, selection, item margin, `customNavHeight` | `UPIndexList`, `UPIndexItem`, `UPIndexAnchor`, `onSelect` | Empty rails render A-Z; measured item positions drive native jumps and scroll-derived active selection while preserving the exact source selection value | Emulated | `tests/components/UPIndexList.test.tsx` |
| `u-index-list` | continuous rail drag and selection | `UPIndexList` PanResponder rail | Vertical drag selects each newly crossed source index once, clamps outside bounds, and makes non-animated measured jumps | Emulated | `tests/components/UPIndexList.test.tsx` |
| `u-index-list` family | source enlarged drag indicator, exact CSS sticky pinning, CSS classes/styles, safe-area fix | Retained `sticky`, `safeBottomFix`, `customClass` | Core PanResponder has no source magnifier or CSS runtime; sticky remains elevated anchor styling | No-op retained | `src/components/index-list/UPIndexList.tsx` |

## P19 Picker Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-picker` | columns, model value, toolbar, selection events, input trigger, instance methods | `UPPicker`, `UPPickerRef`, `onChange`, `onConfirm`, `onUpdateModelValue` | Snapped core scroll columns preserve draft-before-confirm selection and source payloads | Emulated | `tests/components/UPPicker.test.tsx` |
| `u-picker-data` / `u-picker-column` | one-column data trigger / platform column wrapper | `UPPickerData` / `UPPickerColumn` | Data wrapper maps object value/label keys; column is an empty compatibility View | Emulated | `tests/components/UPPicker.test.tsx` |
| `u-select` | current value, inline trigger, option overlay, select callback | `UPSelect`, `onUpdateCurrent`, `onSelect` | Measured root-overlay menu avoids clipping and preserves source option identity | Emulated | `tests/components/UPPicker.test.tsx` |
| P19 picker family | CSS picker mask, CSS classes/hover, exact picker inertia and immediate timing | Retained props | Native snapped scroll and accessible presses replace source platform/CSS behavior | No-op retained | `src/components/picker/UPPicker.tsx` |

## P20 Keyboard Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-keyboard` | number/card/car modes, popup visibility, toolbar, overlay, safe area, change/backspace/cancel/confirm/close | `UPKeyboard`, `onChangeShow`, source callbacks | Controlled `UPPopup` renders source toolbar and forwards selected grid payloads without implicit close on cancel/confirm | Emulated | `tests/components/UPKeyboard.test.tsx` |
| `u-number-keyboard` | number/card values, dot disable, random, backspace | `UPNumberKeyboard`, `onChange`, `onBackspace` | Native grid emits number digits plus string `.`/`X`; normal disabled-dot layout gives zero the source wide final row | Emulated | `tests/components/UPKeyboard.test.tsx` |
| `u-car-keyboard` | province/alphanumeric layouts, language toggle, random, auto change, backspace | `UPCarKeyboard`, `onChange`, `onBackspace` | Source key membership and 200 ms province-to-alphanumeric transition are preserved with accessible native keys | Emulated | `tests/components/UPKeyboard.test.tsx` |
| P20 keyboard family | CSS hover/move prevention, exact platform touch timing, CSS classes | Retained `customClass` and native press lifecycle | React Native `Pressable` and timers replace source hover/touch handlers; random ordering is not a security feature | No-op retained | `src/components/keyboard/UPKeyboard.tsx` |

## P21 Tooltip and Popover

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-tooltip` | text/copy/actions/direction/overlay/singleton/show, open/close/update callbacks | `UPTooltip`, `UPTooltipRef`, source callbacks | Measured trigger popup renders through `UPRoot`; transparent overlay and source action index behavior are retained | Emulated | `tests/components/UPTooltip.test.tsx` |
| `u-tooltip` | `triggerMode="click"`, `longpress`, `manual`; `forcePosition` | Identical props and imperative `open`/`close` | Native Pressable modes plus measured, 12 px-clamped root-layer placement; force styles override computed placement | Emulated | `tests/components/UPTooltip.test.tsx` |
| `u-tooltip` | uni clipboard copy | `writeText(content)` adapter | Application owns clipboard integration; copy emits index `0`, while action buttons offset when copy is visible | Host adapter | `tests/components/UPTooltip.test.tsx` |
| `u-popover` | trigger/content slots, show/direction/callbacks/ref | `UPPopover`, `trigger`, `content`, `UPPopoverRef` | Wrapper forwards tooltip behavior with source visual defaults | Emulated | `tests/components/UPTooltip.test.tsx` |
| tooltip / popover | hover, CSS classes/transitions, popover `placement` | Retained typed props | React Native core has no hover or CSS runtime; upstream `placement` is not consumed by tooltip, so use `direction` | No-op retained | `src/components/tooltip/UPTooltip.tsx` |

## P23 Code Countdown

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-code` | seconds/texts, start/reset, start/change/end callbacks | `UPCode`, `UPCodeRef`, source callbacks | Headless absolute-deadline countdown preserves source text replacement and imperative lifecycle | Emulated | `tests/components/UPCode.test.tsx` |
| `u-code` | `keepRunning`, `uniqueKey`, uni storage | `keepRunning`, `uniqueKey`, optional `UPCodeStorage` | Host adapter stores the source-compatible deadline key; absent or failed storage remains in memory | Host adapter | `tests/components/UPCode.test.tsx` |
| `u-code` | Vue visual shell and source i18n runtime | No visual output; explicit text props | Application owns UI and localization; React Native package has fixed source Chinese defaults | No-op retained | `src/components/code/UPCode.tsx` |

## P24 Dropdown Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-dropdown` | title bar, colors, mask/self close, open/close/highlight | `UPDropdown`, `UPDropdownRef` | One measured root-overlay panel is active; disabled menus never open and highlight is visual-only | Emulated | `tests/components/UPDropdown.test.tsx` |
| `u-dropdown-item` | `modelValue`/`value`, options, disabled, height, mask close, change | `UPDropdownItem`, `onUpdateModelValue`, `onChange` | Source options update then emit change before parent close; React children replace default options | Emulated | `tests/components/UPDropdown.test.tsx` |
| dropdown family | Vue instances, CSS classes/transforms, touch-move prevention | React context, root overlay, `UPTransition`, retained `customClass` | Root overlay avoids native clipping; exact CSS and platform gesture behavior have no RN-core equivalent | No-op retained | `src/components/dropdown/UPDropdown.tsx` |

## P25 Tabbar Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-tabbar` | value, safe area, border, fixed/placeholder, colors, styles, change/click | `UPTabbar`, `value` / `modelValue` / `defaultValue`, callbacks | Parent-managed selection with parent-relative absolute fixed layout and measured placeholder | Emulated | `tests/components/UPTabbar.test.tsx` |
| `u-tabbar-item` | name, icons, badge/dot, text, slots, mid button | `UPTabbarItem`, React nodes, native badge/mid button | Source name-index fallback, icon/text replacement, and badge precedence are retained | Emulated | `tests/components/UPTabbar.test.tsx` |
| tabbar family | routing, CSS classes/keyframes, viewport fixed, shadow strings, touch prevention | Application callbacks, React context, native layout/transforms | Applications own navigation; parent-relative fixed and static native transforms replace CSS behavior | No-op retained | `src/components/tabbar/UPTabbar.tsx` |

## P26 Calendar Family

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-calendar` | single/multiple/range dates, bounds, custom/formatter data, lunar labels, ranges, popup/inline, confirmations | `UPCalendar`, `onConfirm`, `onChangeShow`, `onClose` | Local-day utilities, bounded 42-cell month grids, source result ordering, month navigation, native popup, footer replacement, and automatic confirmation are retained | Emulated | `tests/components/UPCalendar.test.tsx` |
| `u-calendar` | `enableTime`, hour/minute/second picker, same-day boundary validation | `UPCalendar`, `timePrecision`, `defaultTime` | Nested native center popup columns format single and boundary-range results; ending time cannot precede starting time on the same day | Emulated | `tests/components/UPCalendar.test.tsx` |
| `u-calendar-strip` | controlled date strip, month movement, callback ordering, full-calendar expansion | `UPCalendarStrip`, `modelValue`, source-shaped callbacks | Horizontal Monday-first week strip clamps bounds and emits update/change/confirm/month callbacks in source order | Emulated | `tests/components/UPCalendarStrip.test.tsx` |
| `u-calendar-strip` | pull-to-expand/collapse full calendar | `UPCalendarStrip` `PanResponder` | Native vertical pulls crossing `pullDownThreshold` toggle inline full calendar; button/hint and auto-collapse callbacks retain source payloads | Emulated | `tests/components/UPCalendarStrip.test.tsx` |
| calendar family | Vue slots, CSS classes/string styles/gradients, source locale runtime, Web/NVue scroll targeting, `uni picker-view` | React `footer`, native `ScrollView`, retained props | Footer React node replaces the confirmation slot; unavailable platform-specific styling and scroll APIs are typed no-ops | No-op retained | `src/components/calendar/UPCalendar.tsx` |

## P27 Selector Extensions

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-datetime-picker` | seven date/time modes, date/time bounds, filter/formatter, input trigger, change/confirm | `UPDatetimePicker`, source-shaped `{ value, mode }` callbacks | Local date construction and rebuilt bounded picker columns preserve source date/time output, formatting, and confirmation order | Emulated | `tests/components/UPDatetimePicker.test.tsx` |
| `u-datetime-picker` | CSS masks/classes, Day.js locale runtime, platform picker inertia | Retained typed props / native `UPPicker` | Core native scroll columns replace CSS masks and source runtime localization | No-op retained | `src/components/datetime-picker/UPDatetimePicker.tsx` |
| `u-cascader` | arbitrary tree, configurable keys, path headers, draft change, explicit/automatic confirmation | `UPCascader`, `onChange`, `onConfirm`, `onUpdateModelValue` | Pure path state discards stale descendants; native popup supports row/column headers and one/two level panes | Emulated | `tests/components/UPCascader.test.tsx` |
| `u-cascader` | Vue slots, CSS transforms/classes, source template styling | React native children and typed retained props | React Native has no Vue slot or CSS runtime; accessible native press rows replace template DOM | No-op retained | `src/components/cascader/UPCascader.tsx` |
| `u-city-locate` | current/hot/grouped cities, index rail, `uni.getLocation` | `UPCityLocate`, `locate(locationType)` adapter | Existing native index rail drives city groups; host adapter owns permission/provider and emits resolved city results | Emulated / Host adapter | `tests/components/UPCityLocate.test.tsx` |
| `u-city-locate` | geocoding, permission/settings UI, CSS classes | Application location provider / retained props | React Native core does not provide source `uni` geolocation or CSS styling runtime | No-op retained | `src/components/city-locate/UPCityLocate.tsx` |

## P28 Navigation and Category Tabs

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-navbar` | safe area, fixed/placeholder, border, title, left/right icon/text, custom slots, `autoBack` | `UPNavbarProps` | Native navbar with callback-owned routing; `UPNavigationBar` alias exported | Emulated with RN route limit | `tests/components/UPNavbar.test.tsx` |
| `u-navbar-mini` | capsule fixed navbar, back/home regions, divider, `homeUrl`, custom slots | `UPNavbarMiniProps` | Native capsule control; `homeUrl` is emitted only through `onHomeClick` | Emulated with RN route limit | `tests/components/UPNavbarMini.test.tsx` |
| `u-cate-tab` | `follow`/`tab`, `tabList`, `current`, key names, default grid, slot render props | `UPCateTabProps` | Native vertical category tab with measured right-scroll synchronization | Emulated except virtualization | `tests/components/UPCateTab.test.tsx` |
| navigation/category family | `uni.navigateBack`, `uni.reLaunch`, CSS classes/hover/fixed layout, very large category virtualization | Host routing callbacks, retained props, native `ScrollView` | Applications own routing; parent-relative absolute layout and measured scrolling replace source platform behavior | No-op retained / deferred | `src/components/navbar/UPNavbar.tsx` |

## P29 Canvas And Code Images

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-canvas` | canvas id, width/height/unit, root sizing, background, touch forwarding, draw/export methods | `UPCanvas`, `UPCanvasRef`, `canvasAdapter` | Default `react-native-canvas` adapter, custom adapter supported; bundled renderer is WebView-backed | Host adapter | `tests/components/UPCanvas.test.tsx` |
| `u-qrcode` | value, size/unit, colors, finder color, icon, loading, preview/longpress callbacks | `UPQrcode`, `UPQrcodeRef`, `encodeQrMatrix` | Canvas renderer, export depends on adapter; no React Native module grid fallback | Emulated | `tests/components/UPQrcode.test.tsx` |
| `u-barcode` | value, format, dimensions, text, margins, colors, canvas/export mode | `UPBarcode`, `UPBarcodeRef`, `encodeBarcode` | Canvas renderer, `useCanvas=false` requires export support; no React Native bit grid fallback | Emulated | `tests/components/UPBarcode.test.tsx` |

## P30 List Enhancements

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-pull-refresh` | refreshing, threshold, damping, max distance, optional scroll-view, loadmore footer, scoped state slots | `UPPullRefresh`, render callbacks, `UPPullRefreshRef` | Core touch events drive source pull/release/refreshing states; optional `UPLoadmore` footer is wired to lower-edge detection | Emulated | `tests/components/UPPullRefresh.test.tsx` |
| `u-virtual-list` | list data, fixed item height, height, buffer, key field, scroll top, default slot | `UPVirtualList`, `renderItem`, `UPVirtualListRef` | Fixed-height spacer virtualization with numeric scroll callbacks and visible-range ref | Emulated | `tests/components/UPVirtualList.test.tsx` |
| `u-refresh-virtual-list` | pull refresh wrapper around virtual list, refresh, scroll, finish/scroll methods | `UPRefreshVirtualList`, `UPRefreshVirtualListRef` | Composition of `UPPullRefresh` and `UPVirtualList`; host controls or finishes refresh state | Emulated | `tests/components/UPRefreshVirtualList.test.tsx` |
| P30 list enhancement family | CSS transitions, page-level touch prevention, variable-height virtualization | Retained props / documented limits | React Native core replaces CSS and DOM scroll behavior; variable-height virtualization is deferred | No-op retained / deferred | Component prop types |

## P31 Interaction Tools

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-dragsort` | list, direction, columns, item sizing, handler slot, drag callbacks, vibrate | `UPDragsort`, render callbacks, `moveItem` | `movable-area` physics and `uni.vibrateShort` are mapped to deterministic RN drag math and a retained no-op | Emulated | `tests/components/UPDragsort.test.tsx` |
| `u-signature` | pen color/thickness, canvas sizing, toolbar actions, clear/undo/confirm/export | `UPSignature`, `UPSignatureRef` | Uses `UPCanvas`; export requires the configured canvas adapter to implement `toTempFilePath` | Emulated | `tests/components/UPSignature.test.tsx` |
| `u-guide` | page list, skip/next/finish text, once storage, overlay display callbacks | `UPGuide`, `UPGuideRef`, explicit storage adapter | Full-screen onboarding is supported; spotlight tours and implicit `uni` storage are host responsibilities | Emulated | `tests/components/UPGuide.test.tsx` |
| P31 interaction tool family | CSS classes, `movable-area`, haptics, implicit `uni` storage, page-level touch prevention | Retained props / documented host responsibilities | React Native core primitives replace source platform APIs where possible | No-op retained / host adapter | Component prop types |

## P32 Upload And Lazy Load

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-upload` | file list, image/file selection, before/after read, progress, success/error, preview, delete, manual upload | `UPUpload`, `UPUploadRef`, `UPUploadAdapter` | Queue state is native; picker and upload execution are explicit host adapters with optional peer helper factories | Host adapter / Emulated | `tests/components/UPUpload.test.tsx` |
| `u-upload` | implicit `uni.chooseImage`, `uni.chooseFile`, `uni.uploadFile`, auth/signing/cloud details, background/resumable upload | Optional picker peers and `uploadFile` adapter | Applications own native picker installation, upload transport, auth, retry policy, and provider-specific request formats | Host adapter / Deferred | Component prop types |
| `u-lazy-load` | source lazy image visibility and placeholder behavior | `UPLazyLoad` | Explicit `visible` or host scroll/viewport inputs render placeholders before mounting `UPImage` or custom content | Emulated | `tests/components/UPLazyLoad.test.tsx` |
| `u-image` lazy loading | `lazyLoad` prop | Use `UPLazyLoad` wrapper | `UPImage.lazyLoad` remains a typed compatibility prop; implicit global lazy loading is not provided | No-op retained | `src/components/image/UPImage.tsx` |

## P33 Tree

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-tree` | data, node key/label/children fields, expansion, current node, checkbox, half-check, accordion, scoped node slot, ref methods | `UPTree`, `UPTreeRef`, `fieldNames`, `renderNode` | DFS visible-row model rendered by FlashList; raw nodes are preserved in callbacks and parent-child check state is derived without mutating input data | Emulated | `tests/components/UPTree.test.tsx` |
| `u-tree` | async child loading, drag sorting, CSS class behavior | Retained props / deferred | Application owns data fetching and ordering; React Native does not run source CSS classes | Deferred / No-op retained | Component prop types |

## P33 Waterfall

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-waterfall` | v-model list, columns, auto column width, id key, delayed add events, clear/remove refs, scoped column slot | `UPWaterfall`, `UPWaterfallRef`, `renderItem` | FlashList masonry renders dynamic-height items; fixed or measured automatic columns; `value` remains the external source of truth | Emulated | `tests/components/UPWaterfall.test.tsx` |
| `u-waterfall` | stable internal column arrays and source CSS layout behavior | Per-item render callback and documented limits | Masonry placement is engine-owned; column indices are not stable public data | Deferred / Boundary | Component prop types |

## Deferred Source Components

All upstream component directories not listed above remain deferred to later approved phases. They are intentionally not exported before their props, default styles, tests, and matrix rows are complete.

## P0 Acceptance

| Requirement | Evidence |
|---|---|
| JS utilities and component behavior | `npm test -- --runInBand` |
| Public types | `npm run typecheck` |
| Package build and contents | `npm run build && npm pack --dry-run` |
| Android/iOS smoke behavior | `tests/e2e/README.md` |
| Source prop/event coverage | P0 component rows above |
