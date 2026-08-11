# Compatibility

## Installation

```sh
npm install ultra-ui-rn react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-worklets
```

Register the bundled icon font in the consuming application's `react-native.config.js`:

```js
module.exports = {
  assets: ['./node_modules/ultra-ui-rn/src/icons'],
};
```

Then run the asset linker so Android and iOS include `uicon-iconfont.ttf`:

```sh
npx react-native-asset
```

Wrap the application once to provide safe-area, gesture, theme, and overlay infrastructure:

```tsx
import { UPRoot } from 'ultra-ui-rn';

export function App() {
  return <UPRoot>{/* application */}</UPRoot>;
}
```

## Vue-to-React Native conversion

`<u-button text="Save" @click="save" />` becomes:

```tsx
<UPButton text="Save" onClick={save} />
```

`<u-icon name="search" color="primary" />` becomes:

```tsx
<UPIcon name="search" color="primary" />
```

Vue slots become `children` or documented `ReactNode` props. `customStyle` accepts a React Native style. `customClass` is retained for source compatibility but has no effect. Mini-program-only button attributes remain accepted no-ops and are listed in `docs/gap-matrix.md`.

## Configuration and units

`UP.setConfig` merges global config, color tokens, z-indexes, and P0 component defaults. Mounted components react to configuration updates.

```tsx
UP.setConfig({
  color: { primary: '#4f46e5' },
  props: { button: { size: 'large' } },
});
```

`UP.rpx2px` and `UP.getPx('24rpx')` use the uview 750rpx design baseline against the current window width.

## P1 display essentials

The first P1 batch ports source-compatible text, tag, badge, spacing, divider,
and simple container components. React Native equivalents use the same source
prop names and defaults:

```tsx
<UPText mode="price" text="199" type="error" />
<UPTag closable name="new" plain plainFill text="New" onClose={removeTag} />
<UPBadge value={12}><UPIcon name="bell" /></UPBadge>
<UPDivider text="No more" />
<UPSection title="Recommended" />
<UPBox />
```

`UPText` converts source `link` and `call` modes to React Native `Linking` by
default; pass `onLinkPress` to own link handling. Vue named slots map to React
node props: `UPTitle.prefix`, `UPSection.rightContent`, and `UPBox.left`,
`rightTop`, and `rightBottom`.

## P1 content and layout

The remainder of P1 provides source-driven content, media and responsive layout
primitives:

```tsx
<UPCellGroup title="Profile">
  <UPCell isLink label="Account" name="settings" title="Settings" onClick={openSettings} />
</UPCellGroup>
<UPCard foot={<UPText text="Footer" />} title="Card title">Body</UPCard>
<UPRow gutter="20px"><UPCol span={6}>Half width</UPCol></UPRow>
<UPGrid border col={3}><UPGridItem name="one">One</UPGridItem></UPGrid>
```

`UPImage` maps uni image modes to React Native resize modes and maps source
loading/error slots to `loading` and `error` ReactNode props. `UPAvatar`,
`UPEmpty`, and `UPSkeleton` have equivalent React Native fallback rendering.
Cell, card, and grid Vue named slots become documented ReactNode properties.

## P2 core inputs

P2 ports the core source input, selection, numeric, and form APIs. Vue
`v-model` maps to controlled `value` / `modelValue` plus `onChange`; use
`defaultValue` when an uncontrolled control is appropriate.

```tsx
const [choices, setChoices] = useState(['news']);
const [enabled, setEnabled] = useState(false);
const formRef = useRef<UPFormRef>(null);
const profile = { email: '' };

<UPInput clearable value={profile.email} onChange={(value) => { profile.email = value; }} />
<UPSwitch value={enabled} onChange={setEnabled} />
<UPCheckboxGroup value={choices} onChange={setChoices}>
  <UPCheckbox label="News" name="news" />
</UPCheckboxGroup>
<UPForm ref={formRef} model={profile} rules={{ email: { required: true, message: 'Email is required' } }}>
  <UPFormItem label="Email" prop="email" required><UPInput /></UPFormItem>
</UPForm>
```

`UPFormRef` exposes `validate`, `validateField`, `resetFields`, and
`clearValidate`. Rules support source-compatible `required`, `pattern`, `min`,
`max`, `validator`, `trigger`, and `message` fields. `errorType="message"`
and `"border-bottom"` render natively. `errorType="toast"` can be mapped to
the host-backed `UP.toast` API by the application. Slider values use
step-based press targets in the RN-core build rather than source drag tracking;
long-press number changes and uni keyboard/cursor properties remain retained
no-ops where React Native has no equivalent.

## P3 feedback and overlays

`UPRoot` mounts the single feedback host needed by imperative toast and notify
calls. `UP.toast` and `UP.notify` are safe no-ops before a root is mounted, so
they can be called from application service code without crashing an event
handler. Declarative overlays remain controlled through `show` and
`onChangeShow`.

```tsx
const [popupOpen, setPopupOpen] = useState(false);

<UPButton text="Saved" onClick={() => UP.toast.success('Saved')} />
<UPButton text="Show popup" onClick={() => setPopupOpen(true)} />
<UPPopup show={popupOpen} onChangeShow={setPopupOpen}>Popup body</UPPopup>
<UPModal show={modalOpen} onChangeShow={setModalOpen} content="Continue?" />
<UPActionSheet show={sheetOpen} onChangeShow={setSheetOpen} actions={[{ name: 'Share' }]} />
```

`UPOverlay`, `UPPopup`, `UPModal`, and `UPActionSheet` render through the root
overlay provider so they are not clipped by scroll containers. Source CSS
transitions are emulated with the React Native `Animated` API. `UPLoadingIcon`
maps source spinner/circle/semicircle modes to `ActivityIndicator`; continuous
visual mode differences, CSS classes, mini-program navigation callbacks, and
native popup drag resizing remain retained no-ops.

## P4 status and progress

P4 adds source-style progress, loadmore, and timer components. Progress values
are clamped to `0..100`; source `fromRight` flips the line-progress fill
origin. `UPCountDown` and `UPCountTo` use typed refs for source control
methods.

```tsx
const countDownRef = useRef<UPCountDownRef>(null);
const countToRef = useRef<UPCountToRef>(null);

<UPLineProgress percentage={70} fromRight />
<UPLoadmore status="loadmore" onLoadmore={fetchNextPage} />
<UPCountDown ref={countDownRef} time={60_000} format="mm:ss" onFinish={expired} />
<UPCountTo ref={countToRef} endVal={1234.5} decimals={1} separator="," onEnd={done} />
```

`UPCountDownRef` provides `start`, `pause`, and `reset`; `UPCountToRef`
provides `start`, `pause`, `resume`, and `reset`. `UPCircleProgress` is an
RN-core filled-circle approximation because React Native does not include an
SVG arc primitive.

## P5 scroll surfaces

`UPStatusBar` and `UPSafeBottom` consume the native insets supplied by
`UPRoot`. Pass `height` to `UPStatusBar` when an application needs an explicit
source-compatible override; otherwise it reports the actual top inset through
`onUpdateHeight`.

```tsx
<UPStatusBar bgColor="#ffffff" onUpdateHeight={setStatusBarHeight} />
<UPSafeBottom />
```

`UPNoticeBar` supports source row marquee and column/step cycles using React
Native `Animated` and timers. Its `url` and `linkType` props remain accepted
no-ops because React Native navigation belongs to the application. `UPReadMore`
measures arbitrary children through `onLayout`; `shadowStyle` and `textIndent`
are retained because React Native cannot apply source CSS effects to arbitrary
child trees.

```tsx
<UPNoticeBar mode="closable" text="Maintenance starts at 22:00" onClose={dismiss} />
<UPReadMore showHeight={160} toggle><ArticleBody /></UPReadMore>
```

`UPSticky` and `UPBackTop` require an explicit `UPScrollHost`. The host owns
the native `ScrollView` ref and publishes its scroll offset, which avoids an
unreliable global-scroll assumption. `UPBackTop` may still receive a controlled
`scrollTop` for standalone visibility. React Native cannot preserve interactive
child state while moving a sticky child into its fixed overlay, so sticky
rendering is an emulation; keep state above `UPSticky` when that state must
survive fixing.

```tsx
<UPScrollHost overlay={<UPBackTop top={400} />}>
  <UPSticky offsetTop={0} onFixed={onFixed} onUnfixed={onUnfixed}>
    <UPNoticeBar text="Pinned announcement" />
  </UPSticky>
  <ScreenContent />
</UPScrollHost>
```

## P6 display state

`UPLink` opens source `href` values with React Native `Linking` and emits
`onClick`; pass `onLinkPress` when the application owns navigation or deep-link
policy. `mpTips` remains accepted but is a mini-program clipboard no-op.
`UPAlert` retains `modelValue` / `value`, close lifecycle callbacks, source
type/effect colors, and automatic close duration. React Native renders it with
core Views instead of a CSS transition.

```tsx
<UPLink href="https://uviewui.com" text="uView documentation" underLine />
<UPAlert closable modelValue={showAlert} onUpdateModelValue={setShowAlert} title="Notice" />
```

`UPAvatarGroup` preserves source overlap, object URL extraction, max count and
overflow callback. `UPSubsection` maps Vue `update:current` to
`onUpdateCurrent`; its item list accepts source primitive or object values.
`UPCollapse` maps source child slots to React children and emits the original
array of `{ name, status: 'open' | 'close' }` entries. `UPSteps` and
`UPStepsItem` use React context to derive source finish/process/error/wait
states from `current` and child index.

```tsx
<UPSubsection current={current} list={['Day', 'Week']} onUpdateCurrent={setCurrent} />
<UPCollapse value={openNames} onChange={(items) => setOpenNames(
  items.filter((item) => item.status === 'open').map((item) => item.name),
)}>
  <UPCollapseItem name="details" title="Details">Body</UPCollapseItem>
</UPCollapse>
<UPSteps current={1}><UPStepsItem title="Packed" /><UPStepsItem title="Shipped" /></UPSteps>
```

Source CSS class properties are retained no-ops. `UPCollapseItem.duration` is
also retained because React Native core does not expose an exact source
content-height transition duration; collapsed content still follows source
visibility and callbacks.

## P7 navigation surfaces

`UPToolbar` maps the source right slot to a `right` ReactNode and keeps source
cancel/confirm labels and events. Each action exposes a 44px native press
target. `UPScrollList` maps the source horizontal scroller and indicator to a
React Native `ScrollView`; `onLeft` and `onRight` fire when it reaches an edge.

```tsx
<UPToolbar title="Filters" onCancel={close} onConfirm={apply} />
<UPScrollList onLeft={loadPrevious} onRight={loadNext}>
  <HorizontalCards />
</UPScrollList>
```

`UPTabs` retains source list, item keys, shape modes, line colors, source
`current`, and `click` / `change` payloads. It measures native layout to
position the source indicator and centers the selected tab when scrollable.
Like the source component, clicking a disabled item emits `onClick` but does
not emit `onChange` or update `current`. Vue `update:current` maps to
`onUpdateCurrent`.

```tsx
<UPTabs
  current={tab}
  list={[{ name: 'News' }, { name: 'Saved' }]}
  onUpdateCurrent={setTab}
  onChange={(item, index) => trackTab(item.name, index)}
/>
```

`UPPagination` retains the source range, total, layout string, callbacks, and
page-size values. React Native has no core selector equivalent to the source
picker, so the `sizes` layout token opens an accessible core `Modal` list.
`jumper` remains omitted because the upstream template has it commented out;
CSS `customClass`, `lineBgSize`, and CSS string-style props remain retained
no-ops where no native equivalent exists.

```tsx
<UPPagination
  currentPage={page}
  layout="prev, pager, total, sizes, next"
  onCurrentChange={setPage}
  onSizeChange={setPageSize}
  pageSize={pageSize}
  total={95}
/>
```

## P8 static tables

`UPTable`, `UPTr`, `UPTh`, and `UPTd` reproduce the source component family
for static structured data. `UPTable` supplies source border, alignment,
padding, color, font size, background, and header styles through React context;
header and data cells inherit those values and retain source per-cell width,
text alignment, color, font-size, and border overrides.

```tsx
<UPTable align="left" borderColor="#e4e7ed">
  <UPTr><UPTh width="50%">Metric</UPTh><UPTh>Value</UPTh></UPTr>
  <UPTr><UPTd width="50%">Orders</UPTd><UPTd>128</UPTd></UPTr>
</UPTable>
```

Primitive string or number children render as native `Text`; pass ReactNodes
for custom cell layouts. `customClass` remains a CSS-runtime no-op. The
separate `u-table2` data-grid feature set (sorting, selections, tree rows,
fixed columns, virtual scrolling, and arbitrary span methods) is deliberately
deferred to a dedicated native data-grid adapter rather than misrepresented as
the static table API.

## P9 swiper

`UPSwiper` maps the source image carousel to a native paged `ScrollView` and
keeps the source `current`/`update:current`, `change`, click, autoplay,
orientation, indicator, title, sizing, and image-mode APIs. Vue's default item
slot becomes `renderItem`; the named indicator slot becomes `renderIndicator`.

```tsx
const [slide, setSlide] = useState(0);

<UPSwiper
  current={slide}
  indicator
  list={[
    { title: 'Spring collection', url: 'https://picsum.photos/seed/spring/800/320' },
    { title: 'Summer collection', url: 'https://picsum.photos/seed/summer/800/320' },
  ]}
  onUpdateCurrent={setSlide}
/>
```

`UPSwiperIndicator` is also available as a standalone line or dot surface.
Native core does not include a video view, custom scroll easing, explicit
source-duration control, or source-equivalent infinite drag looping. Provide
`renderItem` for video/custom content. `currentItemId`, `acceleration`,
`easingFunction`, CSS string `indicatorStyle`, and `customClass` remain typed
no-ops. `previousMargin`, `nextMargin`, and `displayMultipleItems` approximate
source geometry through core `ScrollView` padding and snap intervals; `circular`
wraps timer-driven autoplay only.

## P10 list surfaces

`UPList` maps the source vertical list to React Native `ScrollView`. It keeps
source height/width, paging, scrollability, scrollbar visibility, controlled
`scrollTop`, source upper/lower thresholds, `scroll`, `scroll-to-upper`, and
`scroll-to-lower` callbacks. `UPListItem.anchor` registers a native layout
position for `scrollIntoView`.

```tsx
<UPList height={180} lowerThreshold={20} onScrollToLower={loadNextPage}>
  <UPListItem anchor="profile"><UPCell title="Profile" /></UPListItem>
  <UPListItem anchor="settings"><UPCell title="Settings" /></UPListItem>
</UPList>
```

Vue child slots become `children`. Native `RefreshControl` maps
`refresherEnabled`, `refresherTriggered`, `refresherBackground`, and
`onRefresherRefresh`. `scrollIntoView` only targets anchors registered by a
descendant `UPListItem`; React Native has no document-ID scrolling runtime.
Source virtual preloading, nvue `offsetAccuracy`, mini-program
`enableFlex`/`enableBackToTop`, custom refresh threshold/style, CSS classes,
and refresher pulling/restore/abort lifecycle callbacks remain accepted
documented no-ops.

## P11 utility surfaces

`UPAgreement` preserves the source imperative modal contract through an
`UPAgreementRef`. The source `showModal()` method opens the existing native
modal; confirmation emits `onConfirm(1)`. Agreement routes are surfaced to
application-owned callbacks rather than opened automatically, so React
Navigation or deep-link policy remains explicit.

```tsx
const agreementRef = useRef<UPAgreementRef>(null);

<UPButton text="Read agreement" onClick={() => agreementRef.current?.showModal()} />
<UPAgreement
  ref={agreementRef}
  onConfirm={() => UP.toast.success('Accepted')}
  onProtocolPress={(url) => navigation.navigate('Web', { url })}
/>
```

`UPNoNetwork` uses the React Native-specific `connected` adapter. React Native
core has no network-status subscription, so the application supplies current
reachability and receives source retry/connected/disconnected callbacks.
`UPFloatButton` keeps source button/menu colors, dimensions, item icons, and
indexed item payloads. Its layout is absolute within the nearest React Native
parent instead of CSS `fixed` positioning.

```tsx
<UPNoNetwork connected={connected} onRetry={recheckConnection} />
<UPFloatButton
  isMenu
  list={[{ name: 'edit' }, { name: 'share' }]}
  onItemClick={(item) => trackAction(item.name, item.index)}
/>
```

Source quit-app cancellation, automatic `uni` network monitoring, system
settings navigation, CSS classes, and CSS string styles have no React Native
core equivalent. `UPAgreement.onClose`, `UPNoNetwork.connected`, and React
render props/children provide the explicit native integration points.

## P12 copy

`UPCopy` preserves `content`, `alertStyle`, `notice`, its default child label,
and source success behavior through `onSuccess`. React Native core has no
clipboard API, so applications pass their writer via `writeText`; it may return
either `void` or a promise.

```tsx
<UPCopy
  content={invoiceId}
  writeText={clipboard.setString}
  onSuccess={() => UP.toast.success('Invoice ID copied')}
>
  <UPText text="Copy invoice ID" />
</UPCopy>
```

Empty content reports `暂无`; missing, throwing, or rejecting writers report
`复制失败` and never call `onSuccess`. `alertStyle="modal"` maps to `UPModal`; all
other source strings use host-backed `UP.toast`. The package adds no native
clipboard dependency. Source `uni.setClipboardData`, `uni.showToast`,
`uni.showModal`, and CSS classes are not React Native core APIs.

## P13 choose

`UPChoose` maps the source tag chooser to `UPTag` instances. It preserves the
source index model: `modelValue` identifies an option array index and normal
presses emit `onUpdateModelValue(index)`. Use `customClick` with
`onCustomClick(index)` when the application owns selection changes.

```tsx
const [choice, setChoice] = useState(0);

<UPChoose
  modelValue={choice}
  options={[{ title: 'Daily' }, { title: 'Weekly' }, { title: 'Monthly' }]}
  onUpdateModelValue={setChoice}
/>
```

`wrap={false}` maps to a horizontal native `ScrollView`; the default maps to a
wrapping row. `renderItem({ item, index, selected, press })` replaces the Vue
scoped slot. Upstream uses `index == currentIndex`, so strings, `false`, and
arrays follow JavaScript coercion; this is preserved for compatibility. `type`
and `valueName` remain accepted but do not create multiselect/value-based
behavior because source code never reads them. CSS classes and Vue slot syntax
remain unavailable on React Native.

## P14 column notice

`UPColumnNotice` ports `u-column-notice` as a paged native notice list. Source
template `vertical="step ? false : true"` makes default `step={false}` vertical;
`step` switches to horizontal paging. `disableTouch` maps to native
`ScrollView.scrollEnabled`, so the source default disables manual swiping.

```tsx
<UPColumnNotice
  mode="closable"
  text={['Deployment completed', 'A new report is available']}
  onClick={(index) => openNotice(index)}
  onClose={() => setNoticeVisible(false)}
/>
```

With two or more items, the component advances every `duration` (default 1500)
and timer progression wraps to the first notice. Native manual paging stops at
physical edges; core React Native cannot exactly reproduce source swiper's
infinite drag or CSS transition. `iconNode` replaces the named Vue icon slot.
`speed` remains accepted but inactive because source never reads it. The unused
source `mode === 'horizontal'` computed branch is not mapped; only `step`
controls direction. CSS classes remain unavailable.

## P15 row notice

`UPRowNotice` ports the standalone source `u-row-notice` string marquee. It is
separate from `UPNoticeBar` and `UPColumnNotice`: it accepts one string, measures
the native viewport and text width, then moves from the right edge to past the
left edge at source `speed` (default `80`). `onClick()` and `onClose()` have no
payloads, matching source events.

```tsx
<UPRowNotice
  mode="closable"
  text="Nightly maintenance begins at 22:00."
  onClick={() => openNoticeDetails()}
  onClose={() => setRowNoticeVisible(false)}
/>
```

`iconNode` replaces the named Vue icon slot. Text, font size, and speed changes
restart the measured native animation. React Native `Animated.loop` replaces
source CSS/nvue animation but cannot reproduce WebView visibility pause,
scoped CSS classes, or the web-only 20-character text splitting workaround.
`customClass` remains a typed no-op.

## P16 swipe action

`UPSwipeAction` coordinates sibling `UPSwipeActionItem` rows. A native left
swipe opens source-compatible right-side `options`; the default parent
`autoClose` closes another row as one opens. `show` and `onUpdateShow` retain
the source controlled contract, while option clicks emit `{ index, name }`.

```tsx
<UPSwipeAction>
  <UPSwipeActionItem
    name="invoice-42"
    options={[{ icon: 'trash', style: { backgroundColor: '#fa3534' }, text: 'Delete' }]}
    onClick={({ name }) => removeInvoice(name)}
  >
    <UPCell title="Invoice #42" />
  </UPSwipeActionItem>
</UPSwipeAction>
```

The implementation uses `react-native-gesture-handler/ReanimatedSwipeable`.
Source WXS/nvue gesture code, CSS transition-duration control, content-tap
close behavior, left actions, and CSS classes are unavailable in this native
mapping. `duration`, child `autoClose`, and `customClass` remain typed no-ops.

## P17 album

`UPAlbum` ports the source image grid for string URLs or object entries. Fixed
layouts use `rowCount`, while `autoWrap` uses a native wrapping row. The
component retains the source `maxCount`/`showMore` behavior and places `+N` on
the final visible image. One source image uses `Image.getSize` to preserve the
source long-edge size; unavailable metadata falls back to a measured square.

```tsx
<UPAlbum
  maxCount={4}
  urls={photos}
  onPreview={({ urls, currentIndex }) => openPhotoViewer(urls, currentIndex)}
/>
```

React Native core has no `uni.previewImage` equivalent, so `onPreview` is the
host-owned full-screen viewer handoff whether `previewFullImage` is true or
false. Vue slots, CSS classes, non-pixel CSS units, and exact
`uni.getImageInfo` timing are unavailable; `customClass` and `unit` remain
typed compatibility props.

## P18 index list

`UPIndexList` owns a native `ScrollView` and exposes accessible discrete rail
buttons. An omitted or empty `indexList` renders the source A-Z rail. Custom
primitive and object entries retain their original value in `onSelect`; each
`UPIndexItem` registers the native layout position reported for its
`UPIndexAnchor` label.

```tsx
const [selectedIndex, setSelectedIndex] = useState('A');

<UPIndexList
  height={240}
  indexList={['A', 'B', 'C']}
  onSelect={(value) => setSelectedIndex(String(value))}
>
  <UPIndexItem index="A">
    <UPIndexAnchor text="A" />
    <UPCell title="Amsterdam" />
  </UPIndexItem>
  <UPIndexItem index="B">
    <UPIndexAnchor text="B" />
    <UPCell title="Berlin" />
  </UPIndexItem>
</UPIndexList>
```

Rail presses always emit selection and make an animated native jump after the
corresponding group has reported layout. `PanResponder` also supports dragging
vertically across the rail: each changed item emits selection once, positions
above or below the rail clamp to its endpoints, and registered groups jump
without animation. `customNavHeight` offsets both jump modes and active-state
derivation. The application owns index data and navigation around this
component.

React Native core does not offer the source enlarged drag indicator or CSS
sticky positioning. `sticky` gives anchors an opaque elevated state rather
than moving them during scrolling; `safeBottomFix`, `customClass`, and CSS-only
styles remain typed no-ops.

## P19 picker family

`UPPicker` maps source multi-column `picker-view` behavior to snapped native
`ScrollView` columns inside `UPPopup`. Column rows and settled native scrolling
update a draft selection through `onChange`; only confirmation commits the
primitive `modelValue` values and emits `onUpdateModelValue`.

```tsx
const [pickerOpen, setPickerOpen] = useState(false);
const [pickerValue, setPickerValue] = useState<(string | number | boolean)[]>(['red', 'Small']);

<UPPicker
  columns={[
    [{ text: 'Red', value: 'red' }, { text: 'Blue', value: 'blue' }],
    ['Small', 'Large'],
  ]}
  modelValue={pickerValue}
  onChangeShow={setPickerOpen}
  onUpdateModelValue={setPickerValue}
  show={pickerOpen}
/>
```

`UPPickerRef` exposes `setColumns`, `setColumnValues`, `setIndexs`,
`getColumnValues`, `getIndexs`, and `getValues`. `UPPickerData` is the
source one-column input wrapper and maps object `valueKey`/`labelKey` values;
`0` remains a valid selected value. `UPPickerColumn` is exported as the
source-compatible empty native `View` wrapper.

`UPSelect` measures its trigger then renders its option list through `UPRoot`'s
overlay registry, avoiding clipping inside scroll containers. It emits the
exact original option through `onSelect` and source key through
`onUpdateCurrent`.

```tsx
<UPSelect
  current={city}
  options={[{ id: 'ams', name: 'Amsterdam' }, { id: 'ber', name: 'Berlin' }]}
  showOptionsLabel
  onSelect={(option) => trackCity(option)}
  onUpdateCurrent={setCity}
/>
```

React Native core has no exact platform `picker-view`, CSS mask gradient,
hover, or source inertia implementation. Snapped native scroll plus accessible
row presses provide the portable mapping. `maskClass`, `maskStyle`,
`customClass`, `UPPickerData.description`, CSS select transitions, and exact
`immediateChange` timing remain typed no-ops; date, calendar, and cascader
data adapters remain separate phases.

## P20 keyboard family

`UPKeyboard` maps the source controlled bottom keyboard popup to `UPPopup`.
It supports `number`, `card`, and `car` modes, keeping source `onChange`,
`onBackspace`, `onCancel`, `onConfirm`, `onClose`, and `onChangeShow`
callbacks. The parent remains responsible for updating `show` after any
dismissal callback.

```tsx
const [keyboardOpen, setKeyboardOpen] = useState(false);
const [amount, setAmount] = useState('');

<UPKeyboard
  onBackspace={() => setAmount((value) => value.slice(0, -1))}
  onChange={(value) => setAmount((current) => `${current}${value}`)}
  onChangeShow={setKeyboardOpen}
  show={keyboardOpen}
/>
```

`UPNumberKeyboard` exposes the standalone number/card grid. Digits emit
numbers; `.` and identity-card `X` remain strings. `dotDisabled` gives the
zero key the source-wide final-row layout. `UPCarKeyboard` starts on the
province layout, toggles `中/英`, and can enable the source 200 ms
`autoChange` transition after a province entry. Pressing and holding either
backspace repeats its callback every 250 ms until release.

The mapping uses native accessible `Pressable` keys and the existing root
overlay. CSS hover classes, touch-move prevention, and exact platform press
timing do not exist in React Native core; `customClass` stays a typed no-op.
Random key ordering preserves the same source key membership but is not
cryptographic and must not be treated as a security control.

## P21 tooltip and popover

`UPTooltip` measures its trigger with `measureInWindow` then renders a
source-style popup through `UPRoot`'s overlay registry. It supports `click`,
`longpress`, and `manual` trigger modes, transparent overlay dismissal,
`direction`, `forcePosition`, singleton operation, and imperative `open()` /
`close()` refs. The parent receives source `onOpen`, `onClose`, and
`onUpdateShow` transitions.

```tsx
const [lastAction, setLastAction] = useState('');

<UPTooltip
  buttons={['Archive']}
  onClick={(index) => setLastAction(index === 0 ? 'Archived' : 'Copied')}
  showCopy={false}
  text="Actions"
  triggerMode="click"
/>
```

When `showCopy` is enabled, `onClick(0)` represents copying and button indexes
are offset by one. Supply `writeText` as the application-owned native
clipboard adapter; toast feedback follows `showToast`. `UPPopover` wraps the
same behavior, maps source trigger/content slots to `trigger`/`content` React
nodes, and exposes the same ref methods.

React Native core has no hover event, so `hover` is retained but noninteractive.
The source `placement` prop is retained on `UPPopover` but is a no-op upstream;
use `direction` to control the native position. CSS classes, source transition
animation, and exact platform layout timing are unavailable; `customClass`
remains a typed no-op.

## P23 code countdown

`UPCode` preserves the source verification-code timer as a headless component:
it renders no button or label, and emits the source message through `onChange`.
Applications render the visible control and invoke the imperative `start()` or
`reset()` methods through `UPCodeRef`.

```tsx
const codeRef = useRef<UPCodeRef>(null);
const [codeText, setCodeText] = useState('获取验证码');

<UPButton onClick={() => codeRef.current?.start()} text={codeText} />
<UPCode onChange={setCodeText} ref={codeRef} seconds={60} />
```

`start()` emits `onStart` and the initial `changeText` value immediately;
`changeText` replaces its first `x` or `X` with remaining seconds. Completion
emits `endText` and `onEnd`; `reset()` emits `endText` without `onEnd`. The
native countdown uses an absolute deadline, preventing delayed JavaScript
timers from extending the duration.

React Native core has no source `uni` persistence API. To retain `keepRunning`
across remounts, provide `uniqueKey` and an application-owned `storage` adapter
with `getItem`, `setItem`, and `removeItem`. Without an adapter, or when it
fails, countdowns safely remain in memory. The source Vue shell and i18n
runtime are unavailable; explicit text props replace localization integration.

## P24 dropdown family

`UPDropdown` renders a source-style equal-width menu bar, measures it with
`measureInWindow`, and presents the current `UPDropdownItem` below the bar
through the `UPRoot` overlay registry. This avoids clipping inside native scroll
and overflow containers, so render the family below `UPRoot`.

`UPDropdownItem` supports controlled `modelValue`, the legacy `value` alias,
and source-shaped `{ label, value }` options. Selecting a default option emits
`onUpdateModelValue(value)`, then `onChange(value)`, and then closes its parent.
The parent ref exposes `open(index)`, `close()`, and `highlight(index?)`.

```tsx
const menuRef = useRef<UPDropdownRef>(null);
const [delivery, setDelivery] = useState('standard');

<UPDropdown ref={menuRef}>
  <UPDropdownItem
    modelValue={delivery}
    onUpdateModelValue={(value) => setDelivery(String(value))}
    options={[{ label: 'Standard', value: 'standard' }]}
    title="Delivery"
  />
</UPDropdown>
```

React children replace the default option list completely. Their owner updates
application state and calls `menuRef.current?.close()` when custom content
should dismiss the panel. The source CSS classes/transforms, Vue instance
registration, and touch-move prevention have no direct React Native core
mapping; `customClass` is retained as a typed no-op and `UPTransition` supplies
the native panel motion.

## P25 tabbar family

`UPTabbar` supports controlled `value` / `modelValue` selection or an
uncontrolled `defaultValue`. It does not navigate: applications own routing,
update the controlled value, and handle `onChange`. Pressing a non-active item
emits `onChange(name)` and then `onClick(name)`; pressing the active item emits
only `onClick(name)`.

```tsx
const [tab, setTab] = useState('home');

<UPTabbar onChange={setTab} value={tab}>
  <UPTabbarItem activeIcon="home-fill" icon="home" name="home" text="Home" />
  <UPTabbarItem icon="star" name="favorites" text="Favorites" />
</UPTabbar>
```

`UPTabbarItem` retains the source index fallback for missing names, supports
active/inactive icon and text React-node replacements, applies dot-over-badge
precedence, and maps the source mid-button treatment to native views. Fixed
tabbars are parent-relative absolute surfaces rather than viewport CSS fixed;
their optional placeholder tracks measured height and `UPSafeBottom` supplies
the native safe-area inset.

CSS classes, keyframe loops, touch-prevention behavior, CSS shadow strings,
and CSS-string badge styles have no React Native core equivalent. These props
remain typed no-ops; static native transforms provide visual variant feedback.

## P26 calendar family

`UPCalendar` preserves source `single`, `multiple`, and `range` selection,
local-calendar `YYYY-MM-DD` values, min/max bounds, forbidden dates, range
limits, lunar lower labels, custom day formatting, and popup or `pageInline`
rendering. The default range result contains every inclusive date; set
`rangeResultMode="boundary"` to receive only the start/end dates. `showConfirm`
can be disabled for immediate valid-selection confirmation.

```tsx
const [open, setOpen] = useState(false);
const [value, setValue] = useState<string[]>([]);

<UPCalendar
  enableTime
  maxDate="2024-06-30"
  minDate="2024-05-01"
  onChangeShow={setOpen}
  onConfirm={setValue}
  show={open}
  timePrecision="minute"
/>
```

`enableTime` provides native hour/minute/second scroll columns. Time appends to
single values and `rangeResultMode="boundary"` range endpoints. Same-day
boundary ranges cannot confirm when the ending time precedes the starting time.
`footer` accepts a React node and replaces the default confirmation region.

`UPCalendarStrip` is controlled by `modelValue`; it emits
`onUpdateModelValue`, `onChange`, then `onConfirm`, followed by
`onMonthChange` when selection crosses a month. With `fullCalendar`, its
button, hint, and vertical `PanResponder` pull gesture toggle an inline
single-date `UPCalendar`; `collapseAfterSelect` closes it after a full-calendar
selection.

```tsx
const [date, setDate] = useState('2024-05-10');

<UPCalendarStrip
  fullCalendar
  modelValue={date}
  onUpdateModelValue={setDate}
  onToggleFull={({ show }) => console.log(show)}
/>
```

Vue slots map to the `footer` React node only. CSS classes/string styles,
source locale runtime, Web/NVue scroll targeting, and `uni picker-view` have
no React Native core equivalent; related retained props are typed no-ops.

## P27 selector extensions

`UPDatetimePicker` builds on native `UPPicker` columns and supports source
`date`, `time`, `year-month`, `datetime`, `datehour`, `timesecond`, and
`datetimesecond` modes. Date-bearing values are epoch milliseconds and time-only
values remain `HH:mm` or `HH:mm:ss` strings. It enforces date/time bounds,
regenerates dependent columns after a change, and accepts source-style `filter`
and `formatter` callbacks. Its callbacks are source-shaped: `onChange` and
`onConfirm` receive `{ value, mode }`; confirmation emits
`onUpdateModelValue`, `onConfirm`, then `onChangeShow(false)`.

```tsx
const [showTime, setShowTime] = useState(false);
const [deliveryTime, setDeliveryTime] = useState(Date.now());

<UPDatetimePicker
  mode="datetime"
  modelValue={deliveryTime}
  onChangeShow={setShowTime}
  onUpdateModelValue={(value) => setDeliveryTime(Number(value))}
  show={showTime}
/>
```

`UPCascader` accepts arbitrary-depth object trees and defaults to
`value`/`label`/`children` keys. It keeps a local draft path: selecting a leaf
emits `onChange(values)`, while pressing confirmation emits
`onUpdateModelValue(values)`, `onConfirm(values)`, then
`onChangeShow(false)`. Set `autoClose` to commit a leaf selection immediately.
`headerDirection="column"` maps the source vertical path to native steps, and
`optionsCols={1 | 2}` controls the rendered native level panes.

`UPCityLocate` composes `UPIndexList` with the current-location surface, hot
cities, and grouped city rows. React Native core has no `uni.getLocation`;
provide the application-owned `locate` adapter to request permissions and return
the provider result. A successful adapter result emits `onLocationSuccess`, and
a city press emits `onSelectCity({ locationCity })`.

```tsx
<UPCityLocate
  locate={async (locationType) => {
    const result = await appLocationProvider.locate(locationType);
    return { ...result, locationCity: result.city };
  }}
  onSelectCity={({ locationCity }) => setCity(locationCity)}
/>
```

Without `locate`, the component remains at the source `定位中....` label until a
`currentCity` value or city selection is supplied. CSS classes/string styles,
source picker masks, Vue slots, Day.js i18n, Web/NVue popup behavior, geocoding,
and permission UI are not provided by React Native core and remain typed no-ops
or application-owned responsibilities.

## P28 navigation and category tabs

`UPNavbar` maps the source left, center, and right slots to `renderLeft`,
`renderCenter`, `renderRight`, or their React node aliases. It supports native
safe-area insertion, fixed positioning, an optional measured placeholder,
title and side content, and a bottom border.

```tsx
<UPNavbar
  leftText="返回"
  onLeftClick={() => navigation.goBack()}
  rightText="帮助"
  title="订单详情"
/>
```

Left presses emit `onLeftClick` before optional automatic behavior. React
Native core has no router-agnostic `navigateBack`; setting `autoBack` explicitly
calls Android `BackHandler.exitApp()`. Applications using React Navigation,
Expo Router, or another stack router should leave `autoBack` disabled and own
the route transition in `onLeftClick`.

`UPNavbarMini` renders the source capsule with back, divider, and home regions.
`homeUrl` remains compatibility data and never triggers routing internally.
Home presses emit `onHomeClick({ homeUrl, event })`.

```tsx
<UPNavbarMini
  autoBack={false}
  fixed={false}
  homeUrl="/pages/index/index"
  onHomeClick={({ homeUrl }) => router.replace(homeUrl)}
/>
```

`UPCateTab` supports `mode="follow"` by measuring every right-side category
section and synchronizing the left menu from native right-pane scroll
positions. Pressing a left category scrolls to its measured section and centers
the left item. `mode="tab"` renders only the active category section.

```tsx
const [current, setCurrent] = useState(0);

<UPCateTab
  current={current}
  height={420}
  onUpdateCurrent={setCurrent}
  tabList={categories}
/>
```

Vue slots map to `renderTabItem`, `renderRightTop`, `renderItemList`, and
`renderPageItem`. CSS classes, hover classes, viewport CSS fixed positioning,
`uni.navigateBack`, `uni.reLaunch`, and virtualized extremely large category
trees are not provided by React Native core.

## P29 canvas and code images

`UPCanvas` maps uview-plus `u-canvas` to a React Native adapter contract. The
bundled default adapter uses `react-native-canvas`, which is WebView-backed
through `react-native-webview`.

`UPQrcode` and `UPBarcode` render through `UPCanvas`; they do not create large
React Native `View` grids. Export, preview, and save flows depend on
adapter/platform support. Unsupported export calls reject and call `onError`.

Consumers can replace the renderer with `canvasAdapter` on `UPCanvas` or through
`UP.setConfig({ props: { canvas: { canvasAdapter } } })`.

`useRootHeightAndWidth` waits for a non-zero React Native layout before mounting
the adapter; the parent must provide constrained width and height.

## P30 list enhancements

`UPPullRefresh` implements source-style pull distance, release threshold,
refreshing state, optional internal `ScrollView`, and optional `UPLoadmore`
footer with React Native core primitives. Exact CSS transition classes and
page-level `preventDefault` behavior are not available on React Native.

`UPVirtualList` maps upstream `u-virtual-list` to a fixed-item-height native
list. It renders top and bottom spacers plus only the visible buffered rows,
and exposes `scrollTo`, `scrollToTop`, and `getVisibleRange`.

`UPRefreshVirtualList` composes `UPPullRefresh` and `UPVirtualList`; it does
not duplicate virtual-list math. The host can control `refreshing` or call
`finishRefresh()` on the ref after async work completes.

## P31 interaction tools

`UPDragsort` maps source drag sorting to React Native `PanResponder`. `vibrate`
is retained as a no-op because React Native core has no source-equivalent
haptic API.

`UPSignature` composes `UPCanvas`; export support depends on the configured
canvas adapter and uses `toTempFilePath({ fileType: 'png', quality: 1 })`.

`UPGuide` renders through `UPRoot` overlay infrastructure. One-time display
requires an explicit `storage` adapter because React Native core has no
implicit `uni` storage runtime.

P31 adds no new native dependencies.

## P32 upload and lazy load

`UPUpload` provides the native file-list, progress, preview, delete, and retry
surface. Picker packages are optional peers: `react-native-image-picker` and
`@react-native-documents/picker`. Applications provide
`uploadAdapter.chooseFile` and `uploadAdapter.uploadFile`, so authentication,
signed URLs, cloud SDKs, retry policy, and request cancellation remain
host-owned.

`UPLazyLoad` replaces implicit source lazy loading with explicit React Native
visibility inputs. Use controlled `visible`, or pass `viewport` and
`scrollOffset` from the screen that owns scrolling. `UPImage.lazyLoad` remains a
retained compatibility prop and does not start global lazy loading.

## P33 tree

`UPTree` maps the source tree component to a virtualized React Native row
model. The source `props` field mapping is supported alongside the retained RN
`fieldNames` alias. Mapping precedence is top-level `nodeKey`, `fieldNames`,
`props`, then the default `id`/`label`/`children`/`disabled` fields.

Source `expandIcon="play-right-fill"` and
`collapseIcon="arrow-down-fill"` defaults are rendered through `UPIcon`, and
`expandOnClickNode` defaults to `true`. Node-level `expanded` and `checked`
flags are merged into initial uncontrolled state; controlled
`expandedKeys`/`checkedKeys` remain authoritative. The normalized model keeps
caller-owned nodes and child arrays unchanged.

Node content presses follow the source order: current-key update, expansion,
check-change/check, node-click, then current-change. The native update
callbacks remain available as React adapters. Disabled nodes keep
node-click/current-change and expand/collapse behavior, while disabled
checkboxes and `checkOnClickNode` do not mutate checked state.

The component requires stable unique node keys for controlled state and ref
operations. Missing or duplicate keys use deterministic internal fallbacks and
emit development warnings. CSS classes remain accepted as `customClass` but
have no React Native CSS runtime. The audited `u-tree` source does not define
async child loading, network loading, drag sorting, reordering, `allow-drop`,
`node-drag`, or `node-drop`; those APIs are not exposed by `UPTree`.

## P37 waterfall source compatibility

`UPWaterfall` keeps the existing FlashList masonry implementation and adds the
source `modelValue`/`onUpdateModelValue` binding. Input precedence is
`modelValue`, `value`, `defaultValue`, then the configured default `value`.
Existing `onChange` callers continue to work; ref mutations call
`onUpdateModelValue` before `onChange`.

Delayed additions retain the private displayed/pending queue. `onAfterAddOne`
receives a source-shaped item payload with a measured native height when one
is available, otherwise `estimatedItemSize`. `onAfterAddAll` receives
`{ newData }`; `columnHeights` is not reported because FlashList does not
expose stable source-equivalent column measurements.

`remove(id)`, `clear()`, and `modify(id, key, value)` are available through
`UPWaterfallRef`. Mutations create new arrays, and `modify` shallow-clones
object items. The component does not expose `column`/`left` slots, stable
column indices, a manually maintained column model, source window-resize
subscriptions, network loading, pagination, drag/drop, or reordering.

## P34/P35 table2

`UPTable2` is a separate virtualized grid and does not change the static
`UPTable` family. Its public column fields are source-shaped `key`, `title`,
`fixed`, `type`, `sortable`, and `style`; `label` is accepted as a title alias.
React-specific `renderCell` and `renderHeader` callbacks replace Vue slots.

The component supports controlled and default selection, expansion, and
current-row keys. Selecting a tree parent recursively selects loaded
descendants. `load(row, payload, resolve)` may resolve lazy children through
the callback or return a Promise. `expandRowKeys` matches the source expansion
prop name, while `expandedRowKeys` remains as the P34 compatibility alias.
`onSelectionChange` is dispatched before `onSelect`, matching the source event
order. Sort and filter values retain the P34 behavior; P35 does not add filter
UI or synthetic filter events.

FlashList remains an internal implementation detail. `onScroll` emits a
numeric vertical offset, while the fixed-left sibling overlay synchronizes its
private list internally. The source implementation supports fixed-left columns;
fixed-right columns are outside this contract. Rows use a fixed height for
virtualization, and pagination or remote fetching remains application-owned.

`spanMethod` accepts array or object results. Zero spans hide covered cells,
and spans crossing the fixed-column boundary are clipped in the fixed plane
with a development warning. Hover tooltips, CSS classes, and CSS sticky
behavior are retained as native truncation or no-op-compatible boundaries.
The component does not mutate caller data, row objects, nested child arrays, or
incoming key arrays. P35 verification is recorded in
`docs/table2-source-compatibility.md`.
