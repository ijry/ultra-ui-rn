# P26: `u-calendar` Component Family Design

## Goal

Port uView Plus `u-calendar` and `u-calendar-strip` to React Native as
`UPCalendar` and `UPCalendarStrip`. Preserve the source date-selection
semantics, calendar constraints, time selection, and strip expansion while
using native layout, scrolling, and overlay primitives.

## Scope

This phase adds the complete calendar family:

- `UPCalendar`
- `UPCalendarStrip`
- Focused date, month-grid, and lunar conversion utilities needed by the two
  public components
- Default configuration, public exports, tests, example, compatibility
  documentation, and P26 gap-matrix rows

The phase reuses `UPPopup`, `UPSafeBottom`, `UPToolbar`, `UPIcon`, and the
existing feedback API. It introduces no dependency, navigation integration,
or other deferred upstream component.

## Public API

### Shared Date Types

`UPCalendarDateInput` accepts `string | number | Date`. Dates normalize to
local-calendar `YYYY-MM-DD` values, avoiding `toISOString()` UTC day shifts.
`UPCalendarMode` is `'single' | 'multiple' | 'range'`.

`UPCalendarDay` is the source-shaped formatter/custom-list value:

```ts
type UPCalendarDay = {
  date: Date;
  day: number;
  week: number;
  month: number;
  disabled: boolean;
  bottomInfo: string;
  dot: boolean;
  [key: string]: unknown;
};
```

`formatter` receives an `UPCalendarDay` and returns an `UPCalendarDay`.
`customList` entries are merged by normalized `date`, after the base day is
created and before it is rendered.

### `UPCalendar`

`UPCalendar` retains source props for:

- header and grid: `title`, `showTitle`, `showSubtitle`, `weekText`,
  `showMark`, `showLunar`, `monthNum`, `monthSwitch`, `showToday`,
  `todayColor`, `monthFormat`, `rowHeight`, `round`, and `color`
- selection: `mode`, `defaultDate`, `minDate`, `maxDate`, `maxCount`,
  `startText`, `endText`, `maxRange`, `rangePrompt`, `showRangePrompt`,
  `allowSameDay`, `rangeResultMode`, `readonly`, and `forbidDays`
- extensibility: `customList`, `formatter`, `confirmText`,
  `confirmDisabledText`, and `footer`
- time: `enableTime`, `timePrecision`, and `defaultTime`
- popup behavior: `show`, `overlay`, `duration`, `overlayStyle`,
  `overlayOpacity`, `zIndex`, `safeAreaInsetBottom`, `safeAreaInsetTop`,
  `bgColor`, `closeOnClickOverlay`, `pageInline`, and `showConfirm`

The public selection callbacks are:

```ts
onConfirm?: (dates: string[]) => void;
onClose?: () => void;
onChangeShow?: (show: boolean) => void;
```

`defaultDate` seeds and synchronizes the source selection. For a single mode,
the first valid source date is selected. Multiple and range modes require an
array; invalid/out-of-range values are dropped. With no valid `defaultDate`,
the implementation selects today when it is within the generated range.

The selected dates passed to `onConfirm` follow source ordering:

- `single`: one normalized day
- `multiple`: selected normalized days in selection order
- `range` with `rangeResultMode="all"`: each inclusive day from start to end
- `range` with `rangeResultMode="boundary"`: start and end only

With `enableTime`, only `single` and boundary-range confirmation append a
space and `HH`, `HH:mm`, or `HH:mm:ss` according to `timePrecision`. A
same-day range cannot confirm when its ending time precedes its start time.

When `showConfirm` is false, a valid single/multiple selection confirms
immediately; range selection confirms only after both boundaries exist. When
`showConfirm` is true, the confirmation button emits the current valid
selection. The range confirmation control remains disabled until both
boundaries are selected.

`forbidDays` prevents a matching non-range day from selecting and calls
`UP.toast.default(forbidDaysToast)` when the feedback host is mounted. A range
selection follows upstream behavior and does not use `forbidDays` to reject
intermediate days. `readonly` prevents every grid selection. `maxCount` limits
additional multiple-mode dates. `maxRange` rejects a range exceeding the
source day limit and uses `rangePrompt` or the default message when
`showRangePrompt` is true.

### `UPCalendarStrip`

`UPCalendarStrip` retains `modelValue`, `minDate`, `maxDate`, `color`,
`weekText`, `fullCalendar`, `fullCalendarProps`, `fullMonthNum`,
`pullDownThreshold`, `collapseAfterSelect`, `readonly`, `showToday`,
`monthFormat`, `expandHint`, and `collapseHint`.

It exposes:

```ts
onUpdateModelValue?: (date: string) => void;
onChange?: (payload: { date: string; month: string; scene: 'tap' | 'switch' | 'full' }) => void;
onConfirm?: (payload: { date: string; month: string; scene: 'tap' | 'switch' | 'full' }) => void;
onMonthChange?: (payload: { month: string; scene: 'switch' | 'tap' | 'full' }) => void;
onToggleFull?: (payload: { show: boolean; source: 'button' | 'hint' | 'pull-down' | 'pull-up' | 'auto' }) => void;
```

The strip normalizes and clamps its controlled value to the date bounds; if
empty, it uses today when selectable. Tapping a day, switching month, or
choosing from the expanded calendar emits `onUpdateModelValue` only when the
date changes, then `onChange`, then `onConfirm`; a changed month additionally
emits `onMonthChange` last. The component does not internally navigate.

When `fullCalendar` is true, an accessible toggle and hint expand a native
inline `UPCalendar` in `monthSwitch`, `pageInline`, `single`, and
`showConfirm={false}` mode. A vertical `PanResponder` gesture opens on a
downward pull and closes on an upward pull once the supplied threshold is
crossed. Choosing from the expanded calendar emits with `scene: 'full'` and
collapses automatically when `collapseAfterSelect` is true.

## Rendering and State

### Date Utilities and Month Grid

Focused date utilities will parse valid `Date`, numeric timestamp, and
`YYYY-MM-DD` string inputs into local calendar days. They generate month grids
with Monday-first `weekText` labels, calculate weekday padding, compare days,
add days/months, clamp bounds, and generate inclusive ranges. Invalid date
inputs never create a selectable cell.

The calendar generates from `minDate` through `maxDate`; absent bounds match
source behavior by starting from today and producing at most `monthNum` months.
`monthSwitch` renders one generated month with previous/next controls;
otherwise a native vertical `ScrollView` renders all generated months. The
current visible/month-switch index controls the subtitle and today jump.

Each calendar cell is a `Pressable` with an accessible date label and selected
state. Custom bottom text, lunar labels, dots, disabled state, start/end
labels, range fills, active backgrounds, month watermark, today border, and
configured row height map to native `View`/`Text` styles. React Native uses
static colors and layout rather than CSS selectors or gradients.

### Popup, Inline, and Time Picker

With `pageInline`, a shown calendar renders inside normal layout. Otherwise it
uses `UPPopup` in bottom mode and forwards source overlay, safe-area, radius,
background, z-index, and close behavior. Popup closing emits
`onChangeShow(false)` and then `onClose()` through `UPPopup`; confirmation
does not implicitly close the externally controlled popup.

The default confirmation area uses a native `Pressable`; a supplied `footer`
React node replaces it. `showConfirm={false}` hides the footer. A time panel
appears only for enabled single or boundary-range modes. Each time trigger
opens a nested center `UPPopup` containing accessible hour, minute, and second
native `ScrollView` columns. The selected precision limits visible columns and
confirmed formatted value.

### Lunar Mapping

The source `solar2lunar` algorithm is ported as a focused TypeScript utility
with the same supported Gregorian date range of 1900-01-31 through 2100-12-31.
`showLunar` places its Chinese day/month text in the cell's lower label when a
source `bottomInfo` does not override it. Outside that date range, lunar text
is omitted without blocking date selection.

## Defaults and Configuration

`UP.props.calendar` and `UP.props.calendarStrip` reproduce source defaults,
including Chinese source strings:

- calendar: `title: '日期选择'`, `mode: 'single'`, `color: '#3c9cff'`,
  `monthNum: 3`, `showConfirm: true`, `rangeResultMode: 'all'`,
  `timePrecision: 'minute'`, and Monday-first Chinese week labels
- strip: `fullCalendar: true`, `fullMonthNum: 24`,
  `pullDownThreshold: 40`, `collapseAfterSelect: true`, and the source expand
  and collapse hint strings

Both components merge `useUPConfig().props` defaults before explicit props.
Mounted components react to `UP.setConfig`; explicit props continue to win.

## Compatibility Limits

React Native core has no Vue slots, Web/NVue scroll targeting, source locale
runtime, CSS classes, CSS gradients, CSS style strings, or uni `picker-view`.
The port uses React nodes (`footer`), native `ScrollView` positioning, static
range fills, Chinese source defaults, and native time columns. `customClass`,
CSS-string `overlayStyle`, CSS keyframes, and exact web/nvue scroll timing are
typed compatibility no-ops. The public date-selection and callback semantics
remain the compatibility target.

## Tests

`tests/components/UPCalendar.test.tsx` will cover:

- source default configuration, explicit precedence, date parsing, local
  normalization, bounded generated months, and header/week rendering
- single, multiple, and range selection; inclusive versus boundary result;
  max count/range; same-day rules; readonly; date limits; and forbidden dates
- formatter/custom-list merges, dots/bottom text, lunar lower labels, month
  watermark, today state, month switch controls, and today jump
- popup versus inline rendering, overlay close callbacks, confirmation
  disabling/auto-confirming, footer replacement, safe area, and custom colors
- time precision, nested time picker changes, same-day range validation, and
  formatted confirmation output
- calendar-strip controlled synchronization, clamp behavior, day and month
  interactions, callback order/payloads, disabled dates, native horizontal
  scrolling, full-calendar selection, hint/button toggles, collapse behavior,
  and `PanResponder` pull thresholds

The phase adds a controlled example for both components, P26 compatibility
documentation, and gap-matrix rows. Validation runs narrow tests, typecheck,
lint, the full test suite, build, example TypeScript/ESLint checks,
`npm pack --dry-run`, and `git diff --check`.
