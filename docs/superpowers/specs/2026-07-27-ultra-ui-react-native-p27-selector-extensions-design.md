# P27 Selector Extensions Design

**Goal:** Add source-compatible React Native implementations of `u-datetime-picker`, `u-cascader`, and `u-city-locate` without adding package dependencies or changing the existing generic picker contract.

## Scope

This phase covers the public props, defaults, controlled state, callbacks, and core native interactions of the three source components.

- `UPDatetimePicker` supports source modes `date`, `time`, `year-month`, `datetime`, `datehour`, `timesecond`, and `datetimesecond`.
- `UPCascader` supports arbitrary-depth object trees, configurable value/label/children keys, draft selection, tabs or vertical path headers, one- or two-column option views, explicit confirmation, and source `autoClose` behavior.
- `UPCityLocate` renders its location/header area and grouped city data through the existing `UPIndexList` family, including hot-city rendering.
- Public component names, prop names, defaults, callback timing, and payload fields follow upstream where a React Native mapping exists.

This phase excludes geocoding, application navigation, CSS classes/string styles, Web/NVue-only details, source Vue slots, and external device-location packages. They remain documented typed no-ops or host-owned adapters.

## Architecture

The components reuse established package primitives instead of introducing a general-purpose selection framework:

1. `UPDatetimePicker` owns date/time normalization, source-mode column generation, and range clamping. It renders the existing `UPPicker`, which continues to own popup state, native scroll columns, toolbar rendering, and generic picker callbacks.
2. `UPCascader` owns its path reducer. It renders the existing `UPPopup`, `UPTabs`, `UPSteps`, `UPScrollView`, `UPCell`, and `UPButton` primitives as a dedicated cascading surface. A shared pure helper derives levels, selected indexes, and values from the data tree.
3. `UPCityLocate` composes the existing `UPIndexList`, `UPIndexItem`, and `UPIndexAnchor` with header and grouped city renderers. It accepts an explicit `locate` promise adapter rather than coupling React Native core to a location provider.

Each component receives default values from `useUPConfig().props` first and applies explicit caller props last, so `UP.setConfig` updates mounted instances consistently with the rest of the package.

## `UPDatetimePicker`

### Inputs and values

`modelValue` accepts the source-compatible epoch millisecond value. `value` is retained as the legacy alias. The component resolves the controlled value as `modelValue ?? value`, then clamps it to the applicable date or time constraints.

- Date-bearing modes use `minDate` and `maxDate`, whose values are epoch milliseconds.
- `time` and `timesecond` use independent inclusive `minHour`/`maxHour`, `minMinute`/`maxMinute`, and `minSecond`/`maxSecond` limits.
- The emitted confirm value is an epoch millisecond for date-bearing modes and an `HH:mm` or `HH:mm:ss` string for time-only modes, matching source semantics.
- `format`, when supplied, is used for the input trigger label. It supports the source tokens `YYYY`, `MM`, `DD`, `HH`, `mm`, and `ss`.

### Column generation and events

Pure helpers create columns in source order: year/month/day/hour/minute/second, omitting fields not present in the selected mode. Changing a parent field regenerates downstream columns and clamps its draft selection before `UPPicker` receives the updated columns.

`filter(type, options)` runs after built-in bounds and can replace a column's options. `formatter(type, option)` receives each source-shaped option and may replace its displayed text. Source option objects retain their numeric `value`, textual `text`, and `type` fields.

On a native column change, the component derives the normalized draft and emits the exact source-shaped `onChange({ value, mode })` payload. On confirm it emits `onUpdateModelValue(value)` before `onConfirm({ value, mode })`, then requests closure through `onChangeShow(false)`. The generic picker columns and indexes remain internal implementation details. Cancel emits `onCancel`; all popup visibility transitions emit `onChangeShow(show)`.

## `UPCascader`

### Data model

`data` is an object tree. `valueKey`, `labelKey`, and `childrenKey` default to `value`, `label`, and `children`. The component derives an ordered path of levels from the supplied `modelValue`; each selected node determines the following level. Missing or stale controlled values stop the path at the deepest valid level rather than selecting arbitrary defaults.

Selecting a node replaces that level of the draft path and discards all descendants. Nodes with non-empty children append their child level and move the active tab to it. Selecting a leaf emits `onChange(values)` but does not update the controlled model until confirmation, matching upstream's draft-before-confirm behavior.

### Presentation and callbacks

The default row header shows the selected labels plus a trailing `请选择`; `headerDirection="column"` uses the package's vertical steps presentation. `optionsCols={1}` shows the active level; `optionsCols={2}` shows the compatible adjacent-level layout without relying on CSS transforms. All option presses provide accessible labels and selected state.

`onConfirm(values)` follows `onUpdateModelValue(values)`. `autoClose` performs that commit on a leaf selection and then emits `onChangeShow(false)`. Explicit Cancel or popup close emits `onCancel()` followed by `onChangeShow(false)` and preserves the prior controlled value. `onChangeShow` is emitted for every show transition.

## `UPCityLocate`

### Host location adapter

React Native core does not provide `uni.getLocation`. `locate` is therefore an optional application adapter returning `Promise<UPCityLocationResult>`, where the result may carry arbitrary provider fields and a `locationCity` string. When supplied, it is invoked on mount and whenever the location header is pressed.

Successful lookup updates the visible city and emits `onLocationSuccess({ ...result, locationCity })`. A rejected lookup updates the label to the fixed source failure message and emits no success callback. Without `locate`, the component renders the source locating label until the application supplies `currentCity` or the user selects a city; it never silently claims a device location.

### Rendering and selection

`indexList` defaults to `['🔥']`, and `cityList` defaults to the source hot-city sample. Its group positions correspond to the index list and are rendered through `UPIndexList`, so index rail press and continuous drag use the already-tested native navigation behavior.

The first group uses hot-city buttons. Later groups use full-width rows and separators. Selecting any city updates the visible location city and emits `onSelectCity({ locationCity })`; city objects themselves remain application-owned and are not mutated. `nameKey` defaults to `name`.

## Defaults, exports, and documentation

Add frozen source defaults plus configuration typing for `datetimePicker`, `cascader`, and `cityLocate`. Each family receives its directory barrel, and `src/components/index.ts` exposes its public components and prop/payload types.

The application example will include controlled datetime and cascader demos plus a city list supplied with a deterministic `locate` adapter. `docs/compatibility.md` will document the adapter requirement and React replacements for Vue slots. `docs/gap-matrix.md` will add a P27 row set with explicit core-RN limitations.

## Testing

- Add pure datetime tests for source mode columns, leap-day handling, min/max clamping, time-only constraints, filter application, and formatting.
- Add rendered datetime tests for controlled visibility, draft change payloads, confirmation callback order, and time/date output types.
- Add cascader tests for custom keys, initial path recovery, descendant reset, explicit confirmation, cancellation, and `autoClose` callback order.
- Add city-locate tests for adapter success, rejected lookup, `currentCity` updates, hot/city selection, and `UPIndexList` index navigation composition.
- Run focused suites first, then the repository's full tests, typecheck, lint, build, package dry-run, and whitespace check.

## Compatibility limits

No new dependency is introduced. CSS classes, string style values, source picker masks, source popup CSS transforms, Vue named slots, and Web/NVue-only location/scroll behavior are retained only where needed for type compatibility. Application code owns real device location permission, provider choice, geocoding, and routing.
