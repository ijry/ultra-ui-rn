# P26 Calendar Component Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible React Native `UPCalendar` and `UPCalendarStrip` components with bounded date selection, lunar labels, popup/inline rendering, time selection, and native pull-to-expand interaction.

**Architecture:** Keep calendar math in focused pure utilities, including local-day normalization and lunar conversion, so component state never depends on UTC serialization. Build `UPCalendar` from typed selection/data helpers plus small native views, then compose it into the controlled `UPCalendarStrip`. Reuse the existing configuration store, popup, safe-area, toolbar, icon, and feedback-host contracts rather than adding dependencies.

**Tech Stack:** React 19, React Native 0.86 core (`ScrollView`, `Pressable`, `PanResponder`), TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; do not create branches or worktrees.
- Do not commit, stage, push, reset, or clean git state.
- Add no package dependency; use existing React Native primitives only.
- Edit repository files only with `apply_patch`.
- Preserve local-calendar `YYYY-MM-DD` semantics; never use `Date#toISOString()` for a selected date.
- Keep React Native compatibility limits explicit: Vue slots map only to React nodes, CSS-string/no-web props are typed no-ops, and no routing integration is added.
- Component defaults must merge `useUPConfig().props` first, then let explicit props win and react to `UP.setConfig` updates.
- All interactive controls require stable test IDs and accessible labels/states.

## File Structure

- Create `src/utils/calendar.ts`: local-day parsing, comparison, generated month grids, range helpers, and source-compatible lunar labels.
- Modify `src/utils/index.ts`: re-export shared calendar utility types and functions.
- Modify `src/config/defaults.ts`: define `UPCalendarDefaults` and `UPCalendarStripDefaults`, and add frozen source defaults to `sourceDefaultConfig.props`.
- Modify `src/config/store.ts`: expose the new configuration keys through `UPConfigProps` and config merge typing.
- Create `src/components/calendar/types.ts`: public component prop, callback, formatter, time, and day-data types.
- Create `src/components/calendar/calendar-data.ts`: selection reducer and day-data shaping independent of React rendering.
- Create `src/components/calendar/UPCalendar.tsx`: popup/inline calendar shell, header, generated month grid, selection behavior, and confirmation area.
- Create `src/components/calendar/UPCalendarTimePicker.tsx`: nested native time-column popup used by the calendar.
- Create `src/components/calendar/index.ts`: calendar family barrel export.
- Create `src/components/calendar-strip/UPCalendarStrip.tsx`: controlled horizontal date strip, month controls, full-calendar composition, and `PanResponder` gesture handling.
- Create `src/components/calendar-strip/index.ts`: strip barrel export.
- Modify `src/components/index.ts` and `src/index.ts`: expose both public components and types.
- Create `tests/utils/calendar.test.ts`: pure local-date, grid, range, and lunar regression coverage.
- Create `tests/components/UPCalendar.test.tsx`: rendered calendar behavior and popup/time coverage.
- Create `tests/components/UPCalendarStrip.test.tsx`: controlled callback order, full-calendar, and gesture coverage.
- Modify `example/App.tsx`: controlled examples for calendar modes, time, and expandable strip.
- Modify `docs/compatibility.md` and `docs/gap-matrix.md`: document P26 API coverage and native limitations.

---

### Task 1: Date Utilities and Source Defaults

**Files:**
- Create: `src/utils/calendar.ts`
- Modify: `src/utils/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/utils/calendar.test.ts`

**Interfaces:**
- Produces `UPCalendarDateInput = string | number | Date` and `UPCalendarMonthGrid` for component and strip state.
- Produces `normalizeCalendarDate(input): Date | null`, `formatCalendarDate(date): string`, `compareCalendarDates(left, right): number`, `addCalendarDays(date, amount): Date`, `addCalendarMonths(date, amount): Date`, `createCalendarMonthGrid(month): UPCalendarMonthGrid`, `calendarDateRange(start, end): Date[]`, `createCalendarMonths(start, end, fallbackMonthCount): Date[]`, and `getCalendarLunarLabel(date): string | null`.
- Produces `UPCalendarDefaults` and `UPCalendarStripDefaults` configuration types and `UP.props.calendar` / `UP.props.calendarStrip` source defaults.

- [ ] **Step 1: Write pure local-day and grid regression tests**

```tsx
import {
  createCalendarMonthGrid,
  formatCalendarDate,
  getCalendarLunarLabel,
  normalizeCalendarDate,
} from '../../src';

it('normalizes date-only values without a UTC calendar shift', () => {
  expect(formatCalendarDate(normalizeCalendarDate('2024-05-01')!)).toBe('2024-05-01');
  expect(normalizeCalendarDate('2024-02-30')).toBeNull();
});

it('builds a Monday-first 42-cell May 2024 grid', () => {
  const grid = createCalendarMonthGrid(new Date(2024, 4, 1));
  expect(grid.days).toHaveLength(42);
  expect(formatCalendarDate(grid.days[2]!.date)).toBe('2024-05-01');
});

it('returns source lunar labels only in its supported date interval', () => {
  expect(getCalendarLunarLabel(new Date(2024, 1, 10))).toBe('正月');
  expect(getCalendarLunarLabel(new Date(2024, 1, 11))).toBe('初二');
  expect(getCalendarLunarLabel(new Date(1899, 11, 31))).toBeNull();
});
```

- [ ] **Step 2: Run the utilities test to establish the failure**

Run: `npm test -- --runTestsByPath tests/utils/calendar.test.ts`

Expected: FAIL because calendar utilities and exports do not exist.

- [ ] **Step 3: Implement local-day helpers and the lunar adapter**

```ts
export function normalizeCalendarDate(input: UPCalendarDateInput | null | undefined): Date | null {
  if (typeof input === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return formatCalendarDate(date) === input ? date : null;
  }
  const value = input instanceof Date ? input.getTime() : input;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfCalendarDay(date);
}

export function formatCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
```

Port the upstream `solar2lunar` data tables and calculation into the same utility as private helpers. Keep the public adapter focused: return the lunar month name for first lunar days, the lunar day name otherwise, and `null` outside `1900-01-31` through `2100-12-31`. Generate every month as exactly 42 cells with Monday-first padding; mark cells belonging to adjacent months with `inMonth: false`.

- [ ] **Step 4: Add frozen source defaults and configuration typing**

```ts
export type UPCalendarDefaults = {
  title: string;
  mode: 'single' | 'multiple' | 'range';
  color: string;
  monthNum: number;
  showConfirm: boolean;
  rangeResultMode: 'all' | 'boundary';
  timePrecision: 'hour' | 'minute' | 'second';
  weekText: readonly string[];
};

calendar: Object.freeze({
  title: '日期选择', mode: 'single' as const, color: '#3c9cff', monthNum: 3,
  showConfirm: true, rangeResultMode: 'all' as const, timePrecision: 'minute' as const,
  weekText: Object.freeze(['一', '二', '三', '四', '五', '六', '日']),
}),
```

Complete the defaults with every source-shaped prop consumed in the component, including Chinese confirmation, range, forbidden-day, expand, and collapse strings. Add the two keys to the config props type so `UP.setConfig({ props: { calendar: { ... } } })` compiles and updates mounted consumers.

- [ ] **Step 5: Run focused tests and static checks**

Run: `npm test -- --runTestsByPath tests/utils/calendar.test.ts && npm run typecheck && npm run lint`

Expected: PASS; calendar utilities export from `src/utils/index.ts`, typed defaults merge cleanly, and unrelated tests are untouched.

### Task 2: Calendar Data Model and Core Selection Rendering

**Files:**
- Create: `src/components/calendar/types.ts`
- Create: `src/components/calendar/calendar-data.ts`
- Create: `src/components/calendar/UPCalendar.tsx`
- Create: `src/components/calendar/index.ts`
- Modify: `src/components/index.ts`
- Modify: `src/index.ts`
- Test: `tests/components/UPCalendar.test.tsx`

**Interfaces:**
- Consumes Task 1 date/grid/default interfaces plus `useUPConfig`, `UP.toast`, `UPIcon`, `UPPopup`, and `UPSafeBottom`.
- Produces `UPCalendar`, `UPCalendarProps`, `UPCalendarDay`, `UPCalendarMode`, `UPCalendarFormatter`, and `UPCalendarDateInput` public exports.
- Produces `createCalendarDay`, `mergeCalendarDay`, `selectCalendarDate`, and `resultCalendarDates` internal helpers with no React dependency.

- [ ] **Step 1: Write failing calendar selection and configuration tests**

```tsx
const screen = renderRoot(
  <UPCalendar
    maxDate="2024-05-31"
    minDate="2024-05-01"
    onConfirm={onConfirm}
    pageInline
    show
  />,
);

fireEvent.press(screen.getByTestId('up-calendar-day-20240502'));
fireEvent.press(screen.getByTestId('up-calendar-confirm'));
expect(onConfirm).toHaveBeenCalledWith(['2024-05-02']);

act(() => UP.setConfig({ props: { calendar: { title: '配置标题' } } }));
expect(screen.getByText('配置标题')).toBeTruthy();
```

Add cases for multiple toggle and `maxCount`, range start/end and both result modes, invalid defaults, range length prompt, `allowSameDay`, `readonly`, min/max disabled cells, and a forbidden day. All rendered fixtures must set `minDate="2024-05-01"` and `maxDate="2024-05-31"` unless validating another window.

- [ ] **Step 2: Run the component test to establish the failure**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx`

Expected: FAIL because `UPCalendar` has not been exported.

- [ ] **Step 3: Define the public API and pure selection rules**

```ts
export type UPCalendarMode = 'single' | 'multiple' | 'range';
export type UPCalendarDay = {
  date: Date; day: number; week: number; month: number; disabled: boolean;
  bottomInfo: string; dot: boolean; [key: string]: unknown;
};

export type UPCalendarProps = {
  show?: boolean;
  mode?: UPCalendarMode;
  defaultDate?: UPCalendarDateInput | readonly UPCalendarDateInput[];
  minDate?: UPCalendarDateInput;
  maxDate?: UPCalendarDateInput;
  onConfirm?: (dates: string[]) => void;
  onClose?: () => void;
  onChangeShow?: (show: boolean) => void;
  // The remaining source-compatible visual, range, popup, and time props are explicit here.
};
```

Implement selection as a pure function. It must reject disabled and readonly dates, preserve multiple insertion order, remove a tapped selected multiple date, reset a completed range when a new start is tapped, reject a same-day range when `allowSameDay` is false, and reject a range whose inclusive length exceeds `maxRange`. Call the feedback host only through `UP.toast.default(message)` when a configured forbidden day or range prompt needs to be shown.

- [ ] **Step 4: Implement calendar rendering, custom day shaping, and exports**

```tsx
<Pressable
  accessibilityLabel={formatCalendarDate(day.date)}
  accessibilityState={{ disabled: day.disabled, selected: day.selected }}
  disabled={day.disabled || readonly}
  onPress={() => selectDay(day.date)}
  testID={`up-calendar-day-${formatCalendarDate(day.date).replaceAll('-', '')}`}
>
  <Text>{day.day}</Text>
  <Text>{day.bottomInfo}</Text>
</Pressable>
```

Build base `UPCalendarDay` values from each in-month grid cell, merge `customList` by normalized date, then apply `formatter`. Treat adjacent-month cells as disabled. Render a `testID="up-calendar"` root and `testID="up-calendar-content"` content root. Each month uses `up-calendar-month-<index>`, a month watermark when enabled, Monday-first week labels, range fills, start/end labels, dots, custom lower labels, selected and today states, configurable `rowHeight`, `round`, and `color`.

Use explicit prop precedence over `useUPConfig().props.calendar`. Seed/synchronize selection from `defaultDate`, dropping invalid/out-of-bounds inputs; select today only when no valid default exists and today is in range. Export from component, component-index, and root barrels.

- [ ] **Step 5: Run core calendar tests**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx && npm run typecheck`

Expected: PASS for configuration precedence and single/multiple/range behavior; popup and time-specific tests may remain pending until Tasks 3 and 4 add their rendering controls.

### Task 3: Popup, Header, Month Navigation, and Confirmation Semantics

**Files:**
- Modify: `src/components/calendar/types.ts`
- Modify: `src/components/calendar/calendar-data.ts`
- Modify: `src/components/calendar/UPCalendar.tsx`
- Modify: `tests/components/UPCalendar.test.tsx`

**Interfaces:**
- Consumes Task 2 calendar selection/data API and existing `UPPopup` close callback contract.
- Produces `pageInline` versus popup behavior, `monthSwitch` navigation, today jump, custom footer replacement, and valid/disabled confirmation state.

- [ ] **Step 1: Add failing popup/header/auto-confirm tests**

```tsx
const onChangeShow = jest.fn();
const onClose = jest.fn();
const screen = renderRoot(
  <UPCalendar onChangeShow={onChangeShow} onClose={onClose} show />,
);
fireEvent.press(screen.getByTestId('up-popup-overlay'));
expect(onChangeShow).toHaveBeenCalledWith(false);
expect(onClose).toHaveBeenCalledTimes(1);

const auto = renderRoot(
  <UPCalendar maxDate="2024-05-31" minDate="2024-05-01" onConfirm={onConfirm} pageInline showConfirm={false} />,
);
fireEvent.press(auto.getByTestId('up-calendar-day-20240505'));
expect(onConfirm).toHaveBeenCalledWith(['2024-05-05']);
```

Cover `pageInline`, popup forwarding (`overlay`, `overlayOpacity`, `duration`, `round`, `bgColor`, safe areas, z-index, and close-on-overlay), range confirm disabled state, custom `footer`, explicit `confirmText`/`confirmDisabledText`, month switch previous/next clamping, and today jump.

- [ ] **Step 2: Run the focused test to verify failure**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx`

Expected: FAIL on missing popup/header controls or incorrect callback ordering.

- [ ] **Step 3: Add a shell that composes existing native primitives**

```tsx
const content = <View testID="up-calendar-content">{calendarBody}</View>;
return pageInline ? (
  show ? content : null
) : (
  <UPPopup
    bgColor={bgColor}
    closeOnClickOverlay={closeOnClickOverlay}
    duration={duration}
    mode="bottom"
    onChange={(nextShow) => { onChangeShow?.(nextShow); if (!nextShow) onClose?.(); }}
    overlay={overlay}
    overlayOpacity={overlayOpacity}
    pageInline={false}
    round={round}
    safeAreaInsetBottom={safeAreaInsetBottom}
    safeAreaInsetTop={safeAreaInsetTop}
    show={show}
    zIndex={zIndex}
  >
    {content}
  </UPPopup>
);
```

Use a vertical `ScrollView` when `monthSwitch` is false; use a single displayed month with previous and next `Pressable` controls when it is true. The header shows `title`, a range-aware subtitle, `showTitle`, and `showSubtitle`. Ensure popup close goes through the existing `UPPopup` change callback exactly once: `onChangeShow(false)` followed by `onClose()`.

- [ ] **Step 4: Implement confirmation and automatic result dispatch**

```ts
function emitConfirmedDates() {
  const dates = resultCalendarDates(selection, rangeResultMode);
  if (dates.length === 0 || !isSelectionConfirmable(selection)) return;
  onConfirm?.(dates);
}
```

When `showConfirm={false}`, immediately dispatch valid single and multiple selections; dispatch ranges only after both endpoints exist. When visible, `up-calendar-confirm` remains disabled for incomplete ranges and emits without changing the external `show` prop. A `footer` React node fully replaces the standard confirmation region. Add `UPSafeBottom` when its source prop is enabled.

- [ ] **Step 5: Run calendar component coverage and static checks**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx && npm run typecheck && npm run lint`

Expected: PASS for popup/inline lifecycle, header navigation, footer replacement, confirm validity, and automatic confirmations.

### Task 4: Native Time Picker and Time-Aware Confirmation

**Files:**
- Create: `src/components/calendar/UPCalendarTimePicker.tsx`
- Modify: `src/components/calendar/types.ts`
- Modify: `src/components/calendar/UPCalendar.tsx`
- Modify: `tests/components/UPCalendar.test.tsx`

**Interfaces:**
- Consumes Task 2 selection model and Task 3 popup rendering conventions.
- Produces `UPCalendarTimePicker` with `value`, `precision`, `onConfirm`, and `onChangeShow`; `UPCalendar` exposes `enableTime`, `timePrecision`, and `defaultTime`.

- [ ] **Step 1: Add failing time picker and same-day range tests**

```tsx
const screen = renderRoot(
  <UPCalendar enableTime maxDate="2024-05-31" minDate="2024-05-01" pageInline show timePrecision="second" />,
);
fireEvent.press(screen.getByTestId('up-calendar-day-20240503'));
fireEvent.press(screen.getByTestId('up-calendar-time-single'));
fireEvent.press(screen.getByTestId('up-calendar-time-hour-09'));
fireEvent.press(screen.getByTestId('up-calendar-time-minute-05'));
fireEvent.press(screen.getByTestId('up-calendar-time-second-07'));
fireEvent.press(screen.getByTestId('up-calendar-time-confirm'));
fireEvent.press(screen.getByTestId('up-calendar-confirm'));
expect(onConfirm).toHaveBeenCalledWith(['2024-05-03 09:05:07']);
```

Add a range fixture selecting the same date twice with `allowSameDay`, choose start `14:00` and end `13:59`, and assert the normal confirmation control is disabled until the ending time is later or equal. Verify hour and minute precision hide unused columns and format `HH` or `HH:mm` exactly.

- [ ] **Step 2: Run the focused test to verify failure**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx`

Expected: FAIL because time triggers and nested popup columns do not exist.

- [ ] **Step 3: Implement typed time values and a center popup**

```tsx
export type UPCalendarTimePrecision = 'hour' | 'minute' | 'second';
export type UPCalendarTimeValue = { hour: number; minute: number; second: number };

<UPPopup mode="center" onChange={onChangeShow} show={show}>
  <ScrollView testID="up-calendar-time-hours">{hours}</ScrollView>
  {precision !== 'hour' && <ScrollView testID="up-calendar-time-minutes">{minutes}</ScrollView>}
  {precision === 'second' && <ScrollView testID="up-calendar-time-seconds">{seconds}</ScrollView>}
  <Pressable onPress={() => onConfirm(draft)} testID="up-calendar-time-confirm"><Text>确认</Text></Pressable>
</UPPopup>
```

Render zero-padded `00` through `23` hours and `00` through `59` minutes/seconds as pressable native scroll-column rows. Use `defaultTime` as the initial single value and initialize range endpoints independently. All picker test IDs use `up-calendar-time-hour-HH`, `up-calendar-time-minute-MM`, and `up-calendar-time-second-SS`.

- [ ] **Step 4: Wire time values into confirmation validity and output**

```ts
function formatDateTime(date: string, time: UPCalendarTimeValue, precision: UPCalendarTimePrecision): string {
  const values = [String(time.hour).padStart(2, '0')];
  if (precision !== 'hour') values.push(String(time.minute).padStart(2, '0'));
  if (precision === 'second') values.push(String(time.second).padStart(2, '0'));
  return `${date} ${values.join(':')}`;
}
```

Append time only to single selection and range boundaries; leave a range `rangeResultMode="all"` list as date-only inclusive values unless it is explicitly boundary mode. For a same-day range, compare the precision-normalized time values and reject end-before-start before enabling the standard confirmation button or auto-confirm dispatch.

- [ ] **Step 5: Run time coverage and type checks**

Run: `npm test -- --runTestsByPath tests/components/UPCalendar.test.tsx && npm run typecheck`

Expected: PASS for nested popup selection, precision, formatting, and same-day temporal validation.

### Task 5: Controlled Calendar Strip and Native Pull Expansion

**Files:**
- Create: `src/components/calendar-strip/UPCalendarStrip.tsx`
- Create: `src/components/calendar-strip/index.ts`
- Modify: `src/components/index.ts`
- Modify: `src/index.ts`
- Test: `tests/components/UPCalendarStrip.test.tsx`

**Interfaces:**
- Consumes Task 1 local date utilities and Task 2/3 `UPCalendar` with `pageInline`, `monthSwitch`, `mode="single"`, and `showConfirm={false}`.
- Produces `UPCalendarStrip`, `UPCalendarStripProps`, and callback payload `UPCalendarStripChange`.
- Produces test IDs `up-calendar-strip`, `up-calendar-strip-day-YYYYMMDD`, `up-calendar-strip-prev`, `up-calendar-strip-next`, `up-calendar-strip-toggle`, `up-calendar-strip-hint`, and `up-calendar-strip-full`.

- [ ] **Step 1: Write failing controlled strip and callback-order tests**

```tsx
const events: string[] = [];
const screen = renderRoot(
  <UPCalendarStrip
    maxDate="2024-06-30"
    minDate="2024-05-01"
    modelValue="2024-05-10"
    onChange={(payload) => events.push(`change:${payload.date}:${payload.scene}`)}
    onConfirm={(payload) => events.push(`confirm:${payload.date}:${payload.scene}`)}
    onMonthChange={(payload) => events.push(`month:${payload.month}:${payload.scene}`)}
    onUpdateModelValue={(date) => events.push(`update:${date}`)}
  />,
);
fireEvent.press(screen.getByTestId('up-calendar-strip-next'));
expect(events).toEqual([
  'update:2024-06-10', 'change:2024-06-10:switch', 'confirm:2024-06-10:switch', 'month:2024-06:switch',
]);
```

Add controlled rerender synchronization, bounds clamping, readonly/disabled press rejection, `showToday`, exact payload month formatting, horizontal strip cells, full-calendar selection with `scene: 'full'`, `collapseAfterSelect`, button/hint toggle behavior, and pull gestures that cross or do not cross `pullDownThreshold`.

- [ ] **Step 2: Run the strip test to establish the failure**

Run: `npm test -- --runTestsByPath tests/components/UPCalendarStrip.test.tsx`

Expected: FAIL because `UPCalendarStrip` has not been exported.

- [ ] **Step 3: Implement controlled normalization, horizontal strip, and ordered emission**

```ts
function emitSelection(date: Date, scene: 'tap' | 'switch' | 'full') {
  const nextDate = formatCalendarDate(date);
  const previousMonth = formatCalendarMonth(selectedDate);
  const nextMonth = formatCalendarMonth(date);
  if (nextDate !== formatCalendarDate(selectedDate)) onUpdateModelValue?.(nextDate);
  const payload = { date: nextDate, month: nextMonth, scene };
  onChange?.(payload);
  onConfirm?.(payload);
  if (previousMonth !== nextMonth) onMonthChange?.({ month: nextMonth, scene });
}
```

Read defaults from `useUPConfig().props.calendarStrip`, then explicit props. Normalize `modelValue`, clamp it to valid bounds, and select today only when an empty value permits it. Render one Monday-first week centered around the selected value inside a horizontal `ScrollView`; previous/next month controls move the selected day while retaining its preferred day number and clamping to month/bounds. The component only emits changes; it never performs navigation.

- [ ] **Step 4: Compose full calendar and implement `PanResponder` expansion**

```tsx
const panResponder = useMemo(() => PanResponder.create({
  onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > Math.abs(gesture.dx),
  onPanResponderRelease: (_, gesture) => {
    if (gesture.dy >= pullDownThreshold) setFull(true, 'pull-down');
    if (gesture.dy <= -pullDownThreshold) setFull(false, 'pull-up');
  },
}), [pullDownThreshold]);
```

When `fullCalendar` is true, provide both an accessible toggle control and a pressable hint. Render a native inline `UPCalendar` below the strip only when expanded, forwarding `fullCalendarProps` but forcing `pageInline`, `monthSwitch`, `mode="single"`, `showConfirm={false}`, and bounded props. Selection from it uses `scene: 'full'` and collapses with source `auto` only when `collapseAfterSelect` is true. Emit `onToggleFull` for button, hint, pull, and automatic changes with the documented source.

- [ ] **Step 5: Run strip coverage and static checks**

Run: `npm test -- --runTestsByPath tests/components/UPCalendarStrip.test.tsx && npm run typecheck && npm run lint`

Expected: PASS for controlled synchronization, deterministic callback ordering, full-calendar composition, and threshold-dependent native pan behavior.

### Task 6: Examples, Documentation, Full Validation, and Packaging Gate

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Verify: `tests/utils/calendar.test.ts`
- Verify: `tests/components/UPCalendar.test.tsx`
- Verify: `tests/components/UPCalendarStrip.test.tsx`

**Interfaces:**
- Consumes final public `UPCalendar` and `UPCalendarStrip` exports.
- Produces a controlled demo and precise compatibility/gap documentation for source consumers.

- [ ] **Step 1: Add controlled examples for all public interaction classes**

```tsx
const [calendarShow, setCalendarShow] = useState(false);
const [stripDate, setStripDate] = useState('2024-05-10');

<UPCalendar
  defaultDate="2024-05-10"
  enableTime
  onChangeShow={setCalendarShow}
  onConfirm={(dates) => setCalendarValue(dates.join(', '))}
  show={calendarShow}
/>
<UPCalendarStrip
  modelValue={stripDate}
  onUpdateModelValue={setStripDate}
  fullCalendar
/>
```

Keep the example self-contained and use existing app layout/style conventions. Demonstrate one standard popup calendar, one inline range/multiple behavior if room allows, time precision, and the controlled expandable strip without adding navigation or third-party UI.

- [ ] **Step 2: Document coverage and native limitations**

Add `UPCalendar` and `UPCalendarStrip` entries to the compatibility documentation: public API compatibility, selection semantics, callback order, defaults/config override behavior, and exact native differences. Add P26 rows to `docs/gap-matrix.md` marking achieved behavior and retained no-ops: Vue slots replaced by React `footer`, CSS strings/classes ignored, source locale runtime absent, no Web/NVue scroll targeting, and no `uni picker-view` implementation.

- [ ] **Step 3: Run narrow regression suites**

Run: `npm test -- --runTestsByPath tests/utils/calendar.test.ts tests/components/UPCalendar.test.tsx tests/components/UPCalendarStrip.test.tsx`

Expected: PASS with all calendar utility, calendar, time, strip, and pan interaction assertions green.

- [ ] **Step 4: Run repository quality gates**

Run: `npm run typecheck && npm run lint && npm test && npm run build`

Expected: PASS; no TypeScript errors, lint violations, test regressions, or package build errors.

- [ ] **Step 5: Verify example, package contents, and patch hygiene**

Run: `npx tsc --noEmit --jsx react-jsx --strict example/App.tsx && npx eslint example/App.tsx && npm pack --dry-run && git diff --check`

Expected: the example has no TypeScript/ESLint failures, package dry run includes source/package artifacts without unexpected files, and patch whitespace is clean. If the standalone example typecheck requires repository compiler options, run it through the established example command or document the exact external React Native type-resolution limitation without changing unrelated configuration.

## Plan Self-Review

- **Spec coverage:** Task 1 covers local dates, bounded grids, lunar labels, and configuration. Tasks 2 and 3 cover selection, data customization, rendering, popup/inline behavior, navigation, and confirmation. Task 4 covers time precision and same-day range validity. Task 5 covers all strip callbacks, expansion, and native pan handling. Task 6 covers examples, compatibility, matrix rows, and every required quality gate.
- **Placeholder scan:** This plan contains no deferred implementation markers or unspecified test work; each task names files, public interfaces, code structure, and verification commands.
- **Type consistency:** `UPCalendarDateInput`, `UPCalendarMode`, `UPCalendarDay`, time types, and strip callback payloads are defined before their consuming tasks. The documented test IDs are consistent between implementation and test tasks.
- **Scope control:** The plan adds only the P26 calendar family and its direct documentation/testing support. It introduces no dependencies, route integration, unrelated component changes, or git operations.
