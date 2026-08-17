# P27 Selector Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible React Native `UPDatetimePicker`, `UPCascader`, and `UPCityLocate` components with bounded selection, controlled callbacks, and an explicit host-owned location adapter.

**Architecture:** Keep datetime column generation and cascader-path derivation in pure, tested helpers. `UPDatetimePicker` composes `UPPicker` and adds one opt-in picker behavior that preserves source confirmation ordering; `UPCascader` composes existing native popup/navigation primitives; `UPCityLocate` composes the already-tested index-list family. Each component reads its default configuration through `useUPConfig()` and lets explicit props win.

**Tech Stack:** React 19, React Native 0.86 core, TypeScript 5.9, Jest, React Native Testing Library, existing `UPPopup`, `UPPicker`, `UPIndexList`, `UPTabs`, `UPSteps`, and `UPButton` primitives.

## Global Constraints

- Work directly on `main`; do not create branches or worktrees.
- Do not commit, stage, push, reset, clean, or otherwise alter git history/state.
- Add no dependency; use existing React Native and package primitives only.
- Edit repository files only with `apply_patch`.
- Preserve source public component and prop names where React Native has a direct mapping.
- Preserve local-calendar construction for date-bearing values; do not serialize a selected date using `Date#toISOString()`.
- Configuration must merge `useUPConfig().props.<family>` first and explicit component props last, and must react to `UP.setConfig` updates.
- Vue slots map only to documented React nodes; CSS classes, CSS-string styles, source masks, Web/NVue runtime behavior, device geocoding, and navigation remain typed no-ops or application-owned responsibilities.
- `UPCityLocate` must never claim device location without an explicit `locate` adapter.
- All interactive controls require stable test IDs and accessible roles, labels, and selected/disabled state where applicable.
- The root `tsconfig.json` deliberately excludes `example/`; do not introduce an example-specific compiler configuration solely to satisfy a standalone compiler invocation.

## File Structure

- Create `src/components/datetime-picker/types.ts`: public datetime picker modes, option shapes, callback payloads, and component props.
- Create `src/components/datetime-picker/datetime-data.ts`: pure date/time parsing, clamping, column creation, selection reconstruction, and input-label formatting.
- Create `src/components/datetime-picker/UPDatetimePicker.tsx`: controlled wrapper around `UPPicker` that owns datetime draft state and source callback order.
- Create `src/components/datetime-picker/index.ts`: datetime picker barrel export.
- Create `src/components/cascader/types.ts`: public cascader node, key, header, and callback types.
- Create `src/components/cascader/cascader-data.ts`: pure tree-path initialization, branch replacement, level lookup, and value/label projection.
- Create `src/components/cascader/UPCascader.tsx`: popup surface, accessible path header, level option views, and source confirmation/cancel behavior.
- Create `src/components/cascader/index.ts`: cascader barrel export.
- Create `src/components/city-locate/types.ts`: public city item and location-adapter types.
- Create `src/components/city-locate/UPCityLocate.tsx`: index-list composition, location adapter lifecycle, and city selection behavior.
- Create `src/components/city-locate/index.ts`: city locate barrel export.
- Modify `src/components/picker/types.ts` and `src/components/picker/UPPicker.tsx`: add the internal `closeOnConfirm` control required for the datetime wrapper to emit source events before requesting closure.
- Modify `src/config/defaults.ts` and `src/config/store.ts`: source defaults, `UPProps`, override typing, source-state cloning, and merge support for the three new families.
- Modify `src/components/index.ts`: public family exports.
- Create `tests/components/UPDatetimePicker.test.tsx`, `tests/components/UPCascader.test.tsx`, and `tests/components/UPCityLocate.test.tsx`: focused pure and rendered regression coverage.
- Modify `example/App.tsx`: controlled datetime, cascader, and deterministic-city-locate examples.
- Modify `docs/compatibility.md` and `docs/gap-matrix.md`: P27 usage, coverage, and React Native limitations.

---

### Task 1: Datetime Data Model, Picker Confirmation Control, and Defaults

**Files:**
- Create: `src/components/datetime-picker/types.ts`
- Create: `src/components/datetime-picker/datetime-data.ts`
- Modify: `src/components/picker/types.ts`
- Modify: `src/components/picker/UPPicker.tsx`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `tests/components/UPDatetimePicker.test.tsx`

**Interfaces:**
- Produces `UPDatetimePickerMode = 'date' | 'time' | 'year-month' | 'datetime' | 'datehour' | 'timesecond' | 'datetimesecond'`.
- Produces `UPDatetimePickerValue = number | string`, `UPDatetimePickerOption = { type: UPDatetimePickerColumnType; value: number; text: string }`, and `UPDatetimePickerPayload = { value: UPDatetimePickerValue; mode: UPDatetimePickerMode }`.
- Produces `UPDatetimePickerState = { value: UPDatetimePickerValue; columns: readonly (readonly UPDatetimePickerOption[])[]; indexs: readonly number[] }`.
- Produces `createDatetimePickerState(input: UPDatetimePickerDataOptions): UPDatetimePickerState`, `changeDatetimePickerState(state, columnIndex, optionIndex, input): UPDatetimePickerState`, and `formatDatetimePickerValue(value, mode, format?): string`.
- Adds `closeOnConfirm?: boolean` to `UPPickerProps`; it defaults to `true`. When `false`, generic picker confirmation updates its own confirmed indexes and calls `onConfirm`, but does not emit `onChangeShow(false)` or close the input trigger.
- Produces `UPDatetimePickerDefaults` at `UP.props.datetimePicker` with source values: `show=false`, `popupMode='bottom'`, `showToolbar=true`, `mode='datetime'`, the source ±10-year date bounds, inclusive hour/minute/second bounds, `itemHeight=44`, five visible rows, source Chinese toolbar labels, and `pageInline=false`.

- [ ] **Step 1: Write failing data and generic-picker ordering tests**

Create `tests/components/UPDatetimePicker.test.tsx` with pure-helper tests before importing the not-yet-created component:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import { UPPicker, UPRoot } from '../../src';
import {
  changeDatetimePickerState,
  createDatetimePickerState,
  formatDatetimePickerValue,
} from '../../src/components/datetime-picker/datetime-data';

it('generates a leap-day date-time draft bounded by the source date limits', () => {
  const state = createDatetimePickerState({
    maxDate: new Date(2024, 1, 29, 23, 59, 59).getTime(),
    minDate: new Date(2024, 1, 1).getTime(),
    mode: 'datetime',
    value: new Date(2024, 1, 29, 8, 15).getTime(),
  });

  expect(state.columns.map((column) => column[0]?.type)).toEqual([
    'year', 'month', 'day', 'hour', 'minute',
  ]);
  expect(state.columns[2]?.map((option) => option.value)).toContain(29);
  expect(formatDatetimePickerValue(state.value, 'datetime')).toBe('2024-02-29 08:15');
});

it('rebuilds downstream columns and clamps an invalid selected day', () => {
  const initial = createDatetimePickerState({
    maxDate: new Date(2024, 11, 31).getTime(),
    minDate: new Date(2024, 0, 1).getTime(),
    mode: 'date',
    value: new Date(2024, 0, 31).getTime(),
  });
  const februaryIndex = initial.columns[1]!.findIndex((option) => option.value === 2);
  const next = changeDatetimePickerState(initial, 1, februaryIndex, {
    maxDate: new Date(2024, 11, 31).getTime(),
    minDate: new Date(2024, 0, 1).getTime(),
    mode: 'date',
  });

  expect(formatDatetimePickerValue(next.value, 'date')).toBe('2024-02-29');
});

it('keeps generic picker open when closeOnConfirm is false', () => {
  const onChangeShow = jest.fn();
  const onConfirm = jest.fn();
  const screen = render(
    <UPRoot>
      <UPPicker closeOnConfirm={false} columns={[['A', 'B']]} onChangeShow={onChangeShow} onConfirm={onConfirm} show />
    </UPRoot>,
  );

  fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onChangeShow).not.toHaveBeenCalledWith(false);
  expect(screen.getByTestId('up-picker')).toBeTruthy();
});
```

Add time-only tests asserting `time` clamps to `minHour`/`maxHour` and `timesecond` includes the third `second` column. Add a formatter/filter test asserting a filter can remove minute values and formatter only changes `text`, not numeric `value`.

- [ ] **Step 2: Run the focused test to establish failure**

Run: `npm test -- --runTestsByPath tests/components/UPDatetimePicker.test.tsx`

Expected: FAIL because the datetime helper module and `UPPickerProps.closeOnConfirm` do not exist.

- [ ] **Step 3: Define public datetime types and pure data helpers**

Implement `types.ts` with the public type surface and `datetime-data.ts` with local-construction helpers. Use a local numeric date constructor for all date-bearing values; time-only modes retain their source strings.

```ts
export type UPDatetimePickerColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
export type UPDatetimePickerMode =
  | 'date' | 'time' | 'year-month' | 'datetime' | 'datehour' | 'timesecond' | 'datetimesecond';
export type UPDatetimePickerValue = number | string;

export type UPDatetimePickerOption = {
  type: UPDatetimePickerColumnType;
  value: number;
  text: string;
};

function isTimeMode(mode: UPDatetimePickerMode): boolean {
  return mode === 'time' || mode === 'timesecond';
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
```

For date-bearing modes, clamp the initial number to inclusive `minDate`/`maxDate`, derive only valid years/months/days/hours/minutes/seconds for the selected date, and clamp each downstream field after a parent-column change. For time-only modes, parse only `HH:mm` or `HH:mm:ss`; malformed or absent values start at the configured lower limits. Apply `filter(type, stringValues)` after the built-in range and preserve a non-empty built-in list if the filter returns a non-array or empty list. Apply `formatter(type, rawText)` only to displayed `text` and keep the numeric `value` independent from formatting.

`formatDatetimePickerValue` must support exact source defaults:

```ts
const sourceFormats: Record<UPDatetimePickerMode, string> = {
  date: 'YYYY-MM-DD',
  datehour: 'YYYY-MM-DD HH',
  datetime: 'YYYY-MM-DD HH:mm',
  datetimesecond: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm',
  timesecond: 'HH:mm:ss',
  'year-month': 'YYYY-MM',
};
```

Replace `YYYY`, `MM`, `DD`, `HH`, `mm`, and `ss` tokens sequentially when an explicit `format` is present. Do not add a date library.

- [ ] **Step 4: Add controlled generic-picker close behavior**

Add the optional prop to `src/components/picker/types.ts`:

```ts
/** Internal composition control; default behavior remains source-compatible close-on-confirm. */
closeOnConfirm?: boolean;
```

In `UPPicker.handleConfirm`, retain confirmation index commits and `onUpdateModelValue` for all callers. Gate only `closeInput()` and `input.onChangeShow?.(false)`:

```ts
const handleConfirm = () => {
  const indexes = commitConfirmedIndexes(draftIndexesRef.current);
  const columns = columnsRef.current;
  input.onUpdateModelValue?.(pickerPrimitiveValues(columns, indexes, valueName));
  if (input.closeOnConfirm !== false) {
    closeInput();
    input.onChangeShow?.(false);
  }
  input.onConfirm?.(pickerConfirmPayload(columns, indexes));
};
```

Use `input.closeOnConfirm`, rather than configuration defaults, so it remains an internal wrapper control and existing consumers retain their present behavior.

- [ ] **Step 5: Add datetime default typing and configuration merges**

In `src/config/defaults.ts`, add `UPDatetimePickerDefaults`, add `datetimePicker` to `UPProps`, and add a frozen `sourceDefaultConfig.props.datetimePicker` object. Compute date defaults once while the source-default object initializes:

```ts
const sourceNow = new Date();
const datetimePickerMinDate = new Date(sourceNow.getFullYear() - 10, 0, 1).getTime();
const datetimePickerMaxDate = new Date(sourceNow.getFullYear() + 10, 0, 1).getTime();
```

Use `minHour: 0`, `maxHour: 23`, `minMinute: 0`, `maxMinute: 59`, `minSecond: 0`, `maxSecond: 59`, `filter: null`, `formatter: null`, `closeOnClickOverlay: false`, `cancelText: '取消'`, and `confirmText: '确认'`.

In `src/config/store.ts`, add `datetimePicker?: Partial<UPProps['datetimePicker']>` to `UPConfigOverrides['props']`, clone `sourceDefaults.props.datetimePicker` in `createSourceState`, and merge it in `setUPConfig`. Keep the exact key spelling identical in all three locations.

- [ ] **Step 6: Run focused regression and static checks**

Run: `npm test -- --runTestsByPath tests/components/UPDatetimePicker.test.tsx && npm run typecheck && npm run lint`

Expected: PASS. The datetime data helpers correctly clamp leap dates/time values and `UPPicker` only suppresses close behavior when explicitly requested.

### Task 2: Controlled `UPDatetimePicker` Rendering and Source Events

**Files:**
- Create: `src/components/datetime-picker/UPDatetimePicker.tsx`
- Create: `src/components/datetime-picker/index.ts`
- Modify: `src/components/index.ts`
- Modify: `tests/components/UPDatetimePicker.test.tsx`

**Interfaces:**
- Consumes Task 1 `UPDatetimePickerProps`, `UPDatetimePickerPayload`, `UPDatetimePickerState`, `createDatetimePickerState`, `changeDatetimePickerState`, and the internal `UPPicker.closeOnConfirm` control.
- Produces public `UPDatetimePicker` and types exported from `src/components/datetime-picker/index.ts`.
- Emits `onChange({ value, mode })`, then on confirmation `onUpdateModelValue(value)`, `onConfirm({ value, mode })`, and `onChangeShow(false)` in that order.
- Produces test IDs `up-datetime-picker`, `up-datetime-picker-input`, and reuses generic picker IDs `up-picker-option-<column>-<index>`, `up-toolbar-cancel`, and `up-toolbar-confirm`.

- [ ] **Step 1: Add failing rendered behavior tests**

Append these cases to `tests/components/UPDatetimePicker.test.tsx`:

```tsx
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPDatetimePicker, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source-shaped datetime change and confirm callbacks in deterministic order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPDatetimePicker
      maxDate={new Date(2024, 11, 31).getTime()}
      minDate={new Date(2024, 0, 1).getTime()}
      mode="date"
      modelValue={new Date(2024, 0, 1).getTime()}
      onChange={({ value, mode }) => events.push(`change:${mode}:${value}`)}
      onChangeShow={(show) => events.push(`show:${show}`)}
      onConfirm={({ value, mode }) => events.push(`confirm:${mode}:${value}`)}
      onUpdateModelValue={(value) => events.push(`update:${value}`)}
      show
    />,
  );

  fireEvent.press(screen.getByTestId('up-picker-option-1-1'));
  expect(events[0]).toMatch(/^change:date:/);
  fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
  expect(events.slice(1).map((entry) => entry.split(':')[0])).toEqual(['update', 'confirm', 'show']);
});

it('uses source input labels and controlled configuration defaults', () => {
  const screen = renderRoot(
    <UPDatetimePicker
      format="DD/MM/YYYY"
      hasInput
      mode="date"
      modelValue={new Date(2024, 4, 3).getTime()}
    />,
  );

  expect(screen.getByTestId('up-datetime-picker-input')).toBeTruthy();
  expect(screen.getByDisplayValue('03/05/2024')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-datetime-picker-input'));
  expect(screen.getByTestId('up-datetime-picker')).toBeTruthy();
});
```

Add cases that (1) rerender a controlled `modelValue` while closed and verify the selected date is rebuilt, (2) press Cancel and verify `onCancel` without model update, (3) use `time` and `timesecond` and confirm source string outputs, (4) pass `pageInline` and verify no overlay is required, and (5) call `UP.setConfig({ props: { datetimePicker: { title: 'Configured' } } })` then verify an explicit `title` wins after rerender.

- [ ] **Step 2: Run rendered tests to establish failure**

Run: `npm test -- --runTestsByPath tests/components/UPDatetimePicker.test.tsx`

Expected: FAIL because `UPDatetimePicker` is not exported.

- [ ] **Step 3: Implement the controlled wrapper**

In `UPDatetimePicker.tsx`, merge configuration and props, keep a local `draft` state from `createDatetimePickerState`, and resynchronize it whenever the externally resolved value or data-defining props change. Resolve the value as `input.modelValue ?? input.value` to retain the legacy source alias.

```tsx
const config = useUPConfig();
const props = { ...config.props.datetimePicker, ...input } as UPDatetimePickerProps;
const controlledValue = input.modelValue ?? input.value;
const [draft, setDraft] = useState(() => createDatetimePickerState({ ...props, value: controlledValue }));

const handleChange = (payload: UPPickerChangePayload) => {
  const changed = changeDatetimePickerState(draftRef.current, payload.columnIndex, payload.index, props);
  draftRef.current = changed;
  setDraft(changed);
  input.onChange?.({ mode: props.mode, value: changed.value });
};
```

Pass `columns={draft.columns}`, `keyName="text"`, `valueName="value"`, `modelValue={draft.columns.map((column, index) => column[draft.indexs[index]]?.value ?? column[0]?.value ?? 0)}`, and `closeOnConfirm={false}` to `UPPicker`. Keep the generic picker toolbar, loading overlay, popup mode, dimensions, colors, input props, page-inline behavior, and toolbar replacements by forwarding the matching props.

On generic confirmation, reconstruct the current draft from its values, then emit source callbacks in the required order:

```ts
const handleConfirm = () => {
  const value = draftRef.current.value;
  input.onUpdateModelValue?.(value);
  input.onConfirm?.({ mode: props.mode, value });
  input.onChangeShow?.(false);
};
```

Forward generic cancel to `onCancel`; forward overlay close to `onClose` only when `closeOnClickOverlay` permits the popup close. Do not expose generic picker `values`, `indexs`, or `columnIndex` in datetime callbacks. Render the wrapper host with `testID="up-datetime-picker"`, and give the explicit input trigger `testID="up-datetime-picker-input"` by using the picker `trigger` prop.

- [ ] **Step 4: Export the family and run its full suite**

Create `src/components/datetime-picker/index.ts`:

```ts
export { UPDatetimePicker } from './UPDatetimePicker';
export type {
  UPDatetimePickerColumnType,
  UPDatetimePickerMode,
  UPDatetimePickerOption,
  UPDatetimePickerPayload,
  UPDatetimePickerProps,
  UPDatetimePickerValue,
} from './types';
```

Add `export * from './datetime-picker';` immediately after the existing picker export in `src/components/index.ts`.

Run: `npm test -- --runTestsByPath tests/components/UPDatetimePicker.test.tsx && npm run typecheck && npm run lint`

Expected: PASS for bounded date/time modes, source payload shape/order, controlled rerendering, input labels, and configuration updates.

### Task 3: `UPCascader` Path Reducer, Popup Rendering, and Confirmation

**Files:**
- Create: `src/components/cascader/types.ts`
- Create: `src/components/cascader/cascader-data.ts`
- Create: `src/components/cascader/UPCascader.tsx`
- Create: `src/components/cascader/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`
- Create: `tests/components/UPCascader.test.tsx`

**Interfaces:**
- Produces `UPCascaderNode = Record<string, unknown>`, `UPCascaderValue = string | number | boolean | null`, and `UPCascaderPath = readonly UPCascaderValue[]`.
- Produces pure `createCascaderState(data, modelValue, keys): UPCascaderState`, `selectCascaderNode(state, levelIndex, optionIndex, keys): UPCascaderState`, `cascaderPathValues(state, keys): UPCascaderValue[]`, and `cascaderPathLabels(state, keys): string[]`.
- Produces public `UPCascaderProps` with source `show`, `data`, `modelValue`, `valueKey`, `labelKey`, `childrenKey`, `maskCloseAble`, `zIndex`, `autoClose`, `headerDirection`, `optionsCols`, and `closeable` props plus React Native callbacks.
- Emits leaf `onChange(values)` using the draft path. Explicit confirmation emits `onUpdateModelValue(values)`, `onConfirm(values)`, then `onChangeShow(false)`. Cancel/close emits `onCancel()` then `onChangeShow(false)` without changing the controlled model.
- Produces test IDs `up-cascader`, `up-cascader-tab-<level>`, `up-cascader-option-<level>-<index>`, `up-cascader-cancel`, `up-cascader-confirm`, and `up-cascader-close`.

- [ ] **Step 1: Write failing path and rendered interaction tests**

Create `tests/components/UPCascader.test.tsx`:

```tsx
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCascader, UPRoot } from '../../src';
import { createCascaderState, selectCascaderNode } from '../../src/components/cascader/cascader-data';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const data = [
  { code: 'zj', name: 'Zhejiang', nodes: [{ code: 'hz', name: 'Hangzhou' }, { code: 'nb', name: 'Ningbo' }] },
  { code: 'gd', name: 'Guangdong', nodes: [{ code: 'sz', name: 'Shenzhen' }] },
] as const;

it('recovers a configured key path and discards descendants when its branch changes', () => {
  const initial = createCascaderState(data, ['zj', 'hz'], { childrenKey: 'nodes', labelKey: 'name', valueKey: 'code' });
  expect(initial.indexs).toEqual([0, 0]);
  const next = selectCascaderNode(initial, 0, 1, { childrenKey: 'nodes', labelKey: 'name', valueKey: 'code' });
  expect(next.indexs).toEqual([1]);
  expect(next.levels[1]).toEqual([{ code: 'sz', name: 'Shenzhen' }]);
});

it('keeps a leaf draft until explicit confirmation and closes in source callback order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPCascader
      childrenKey="nodes"
      data={data}
      labelKey="name"
      onChange={(values) => events.push(`change:${values.join('/')}`)}
      onChangeShow={(show) => events.push(`show:${show}`)}
      onConfirm={(values) => events.push(`confirm:${values.join('/')}`)}
      onUpdateModelValue={(values) => events.push(`update:${values.join('/')}`)}
      show
      valueKey="code"
    />,
  );

  fireEvent.press(screen.getByTestId('up-cascader-option-0-0'));
  fireEvent.press(screen.getByTestId('up-cascader-option-1-1'));
  expect(events).toEqual(['change:zj/nb']);
  fireEvent.press(screen.getByTestId('up-cascader-confirm'));
  expect(events).toEqual(['change:zj/nb', 'update:zj/nb', 'confirm:zj/nb', 'show:false']);
});
```

Add rendered tests for an unmatched controlled path, one-column active-level mode, two-column rendering, `headerDirection="column"`, close-icon cancellation, overlay cancellation only when `maskCloseAble` is true, controlled model rerender synchronization, and `autoClose` on a leaf with `change → update → confirm → show:false` ordering.

- [ ] **Step 2: Run the cascader suite to establish failure**

Run: `npm test -- --runTestsByPath tests/components/UPCascader.test.tsx`

Expected: FAIL because the cascader helper and component exports do not exist.

- [ ] **Step 3: Implement typed pure path derivation**

In `cascader-data.ts`, never mutate input `data` or its nodes. A state contains the root-through-current `levels`, selected `indexs`, and `activeLevel`. Walk `modelValue` only while a node whose configured value strictly equals the segment exists. Retain the deepest valid path when a segment is missing.

```ts
export type UPCascaderKeys = {
  childrenKey: string;
  labelKey: string;
  valueKey: string;
};

function nodeChildren(node: UPCascaderNode | undefined, keys: UPCascaderKeys): readonly UPCascaderNode[] {
  const value = node?.[keys.childrenKey];
  return Array.isArray(value) ? value as readonly UPCascaderNode[] : [];
}

export function selectCascaderNode(
  state: UPCascaderState,
  levelIndex: number,
  optionIndex: number,
  keys: UPCascaderKeys,
): UPCascaderState {
  const levels = state.levels.slice(0, levelIndex + 1);
  const indexs = state.indexs.slice(0, levelIndex + 1);
  indexs[levelIndex] = optionIndex;
  const selected = levels[levelIndex]?.[optionIndex];
  const children = nodeChildren(selected, keys);
  if (children.length) levels.push(children);
  return { activeLevel: children.length ? levelIndex + 1 : levelIndex, indexs, levels };
}
```

`cascaderPathValues` and `cascaderPathLabels` must return only selected nodes that still exist. Leaf detection is `nodeChildren(selected, keys).length === 0`.

- [ ] **Step 4: Implement defaults and the popup surface**

In `src/config/defaults.ts`, add `UPCascaderDefaults`, add `cascader` to `UPProps`, and add frozen values under `sourceDefaultConfig.props`: `show=false`, an empty frozen `data`, empty frozen `modelValue`, key defaults `value`/`label`/`children`, `maskCloseAble=true`, `zIndex=0`, `autoClose=false`, `headerDirection='row'`, `optionsCols=2`, and `closeable=true`. Add the matching override, source clone, and state merge entries to `src/config/store.ts`.

In `UPCascader.tsx`, merge these defaults then explicit props. Resynchronize the local draft state when controlled `modelValue`, `data`, or any key prop changes. Render `UPPopup` with `mode="bottom"`, `closeOnClickOverlay={props.maskCloseAble}`, `closeable={props.closeable}`, and map popup close to cancellation exactly once.

Render the row header with `UPTabs` and one pressable tab per resolved label plus a final `请选择` tab. Render the column header with `UPSteps` / `UPStepsItem`, and make each step pressable. For `optionsCols={1}`, render only `state.levels[state.activeLevel]`; for `optionsCols={2}`, render the active parent and current level as equal flex columns. Each option is a `Pressable` with `accessibilityRole="button"`, `accessibilityState={{ selected }}`, label text from `labelKey`, and a trailing check icon or `✓` text for selected options.

On option press, derive the next state. When it selects a leaf, emit `onChange(cascaderPathValues(next, keys))`; if `autoClose`, immediately emit the model update, confirmation, and `onChangeShow(false)` after that change. The bottom actions use `UPButton` with test IDs on enclosing `Pressable` hosts so tests can invoke them reliably.

```ts
const confirm = () => {
  const values = cascaderPathValues(draftRef.current, keys);
  input.onUpdateModelValue?.(values);
  input.onConfirm?.(values);
  input.onChangeShow?.(false);
};

const cancel = () => {
  input.onCancel?.();
  input.onChangeShow?.(false);
};
```

The popup close callback must call `cancel()` only once per close action; use a `closingRef` reset when `show` becomes true to prevent an overlay callback and transition callback from double-emitting cancellation.

- [ ] **Step 5: Export and validate cascader behavior**

Create `src/components/cascader/index.ts`:

```ts
export { UPCascader } from './UPCascader';
export type {
  UPCascaderHeaderDirection,
  UPCascaderNode,
  UPCascaderPath,
  UPCascaderProps,
  UPCascaderValue,
} from './types';
```

Add `export * from './cascader';` near the picker exports in `src/components/index.ts`.

Run: `npm test -- --runTestsByPath tests/components/UPCascader.test.tsx && npm run typecheck && npm run lint`

Expected: PASS for custom keys, branch changes, draft-before-confirm behavior, explicit callback order, source header variants, and permitted popup cancellation.

### Task 4: `UPCityLocate` Host Adapter and Index-List Composition

**Files:**
- Create: `src/components/city-locate/types.ts`
- Create: `src/components/city-locate/UPCityLocate.tsx`
- Create: `src/components/city-locate/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `src/components/index.ts`
- Create: `tests/components/UPCityLocate.test.tsx`

**Interfaces:**
- Produces `UPCityItem = Record<string, unknown>` and `UPCityLocationResult = { locationCity?: string; address?: { city?: string }; [key: string]: unknown }`.
- Produces `UPCityLocateProps` with source `indexList`, `cityList`, `locationType`, `currentCity`, and `nameKey`, plus optional `locate: (locationType: string) => Promise<UPCityLocationResult>`.
- Emits `onLocationSuccess(resultWithLocationCity)` after an adapter resolves to a non-empty city and `onSelectCity({ locationCity })` after a city row press.
- Produces test IDs `up-city-locate`, `up-city-locate-location`, `up-city-locate-status`, `up-city-locate-hot-<group>-<item>`, and `up-city-locate-city-<group>-<item>`.

- [ ] **Step 1: Write failing location and city-selection tests**

Create `tests/components/UPCityLocate.test.tsx`:

```tsx
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPCityLocate, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses the application location adapter on mount and emits the resolved city', async () => {
  const locate = jest.fn().mockResolvedValue({ address: { city: 'Hangzhou' }, latitude: 30.2 });
  const onLocationSuccess = jest.fn();
  const screen = renderRoot(<UPCityLocate locate={locate} onLocationSuccess={onLocationSuccess} />);

  await act(async () => {});
  expect(locate).toHaveBeenCalledWith('wgs84');
  expect(screen.getByTestId('up-city-locate-status').props.children).toBe('Hangzhou');
  expect(onLocationSuccess).toHaveBeenCalledWith(expect.objectContaining({ locationCity: 'Hangzhou', latitude: 30.2 }));
});

it('renders grouped cities through the native index list and selects a city without mutating data', () => {
  const city = { name: 'Suzhou', value: 'suzhou' };
  const onSelectCity = jest.fn();
  const screen = renderRoot(
    <UPCityLocate cityList={[[{ name: 'Hangzhou' }], [city]]} indexList={['🔥', 'S']} onSelectCity={onSelectCity} />,
  );

  expect(screen.getByTestId('up-index-list')).toBeTruthy();
  expect(screen.getByTestId('up-index-rail-1')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-city-locate-city-1-0'));
  expect(onSelectCity).toHaveBeenCalledWith({ locationCity: 'Suzhou' });
  expect(city).toEqual({ name: 'Suzhou', value: 'suzhou' });
});
```

Add tests for a rejected `locate` promise rendering the source failure copy `定位失败`, a header press running the adapter again, `currentCity` rerender overriding the displayed label, a successful result using `locationCity` over `address.city`, default hot-city rendering, and missing `locate` retaining the source locating copy `定位中....` without emitting success.

- [ ] **Step 2: Run the city locate suite to establish failure**

Run: `npm test -- --runTestsByPath tests/components/UPCityLocate.test.tsx`

Expected: FAIL because `UPCityLocate` is not exported.

- [ ] **Step 3: Add city defaults and configuration store support**

In `src/config/defaults.ts`, add `UPCityLocateDefaults`, add `cityLocate` to `UPProps`, and add frozen source defaults to `sourceDefaultConfig.props.cityLocate`:

```ts
cityLocate: Object.freeze({
  cityList: Object.freeze([
    Object.freeze([
      Object.freeze({ name: '北京', value: 'beijing' }),
      Object.freeze({ name: '上海', value: 'shanghai' }),
      Object.freeze({ name: '广州', value: 'guangzhou' }),
      Object.freeze({ name: '深圳', value: 'shenzhen' }),
      Object.freeze({ name: '杭州', value: 'hangzhou' }),
    ]),
  ]),
  currentCity: '',
  indexList: Object.freeze(['🔥']),
  locationType: 'wgs84',
  nameKey: 'name',
}),
```

Use readonly `Record<string, unknown>` arrays in the defaults type. Add matching `cityLocate` entries in `UPConfigOverrides`, `createSourceState`, and `setUPConfig`.

- [ ] **Step 4: Implement location lifecycle and grouped list rendering**

In `UPCityLocate.tsx`, merge config defaults then explicit props. Maintain visible city state initialized to `input.currentCity || '定位中....'`. Keep a monotonically increasing request ID in a ref so stale promise resolutions cannot overwrite a newer press/current-city update.

```ts
const resolveCity = (result: UPCityLocationResult): string => {
  const direct = result.locationCity;
  const nested = result.address?.city;
  return typeof direct === 'string' && direct ? direct : typeof nested === 'string' ? nested : '';
};

const requestLocation = useCallback(() => {
  if (!input.locate) return;
  const requestId = ++requestIdRef.current;
  void input.locate(props.locationType).then((result) => {
    if (requestId !== requestIdRef.current) return;
    const locationCity = resolveCity(result);
    if (!locationCity) {
      setLocationCity('定位失败');
      return;
    }
    setLocationCity(locationCity);
    input.onLocationSuccess?.({ ...result, locationCity });
  }).catch(() => {
    if (requestId === requestIdRef.current) setLocationCity('定位失败');
  });
}, [input, props.locationType]);
```

Call `requestLocation` from an effect and header press. A `currentCity` update takes precedence: increment the request ID and update state, then do not call the adapter solely because `currentCity` changed.

Render `UPIndexList` with `indexList={props.indexList}`, a header location `Pressable`, `UPIndexItem` per `cityList` group, and `UPIndexAnchor` labels from the same index position. Treat group zero as hot cities; render other groups as full-width `Pressable` rows separated by `UPLine`. Resolve display names through `String(item[props.nameKey] ?? '')`. Selecting a valid item updates local state and calls `onSelectCity({ locationCity })`; it does not mutate the item or controlled `currentCity` prop.

- [ ] **Step 5: Export and run city locate checks**

Create `src/components/city-locate/index.ts`:

```ts
export { UPCityLocate } from './UPCityLocate';
export type { UPCityItem, UPCityLocateProps, UPCityLocationResult } from './types';
```

Add `export * from './city-locate';` after the index-list export in `src/components/index.ts`.

Run: `npm test -- --runTestsByPath tests/components/UPCityLocate.test.tsx && npm run typecheck && npm run lint`

Expected: PASS for success/failure adapter states, stale-result protection, external city synchronization, default/grouped city rendering, and index-list composition.

### Task 5: Examples, Compatibility Documentation, and Repository Validation

**Files:**
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Verify: `tests/components/UPDatetimePicker.test.tsx`
- Verify: `tests/components/UPCascader.test.tsx`
- Verify: `tests/components/UPCityLocate.test.tsx`

**Interfaces:**
- Consumes final `UPDatetimePicker`, `UPCascader`, and `UPCityLocate` public exports.
- Produces controlled package examples and explicit P27 compatibility documentation.

- [ ] **Step 1: Add controlled P27 examples**

Update `example/App.tsx` imports to include `UPDatetimePicker`, `UPCascader`, and `UPCityLocate`. Add state in `App`:

```tsx
const [datetimeOpen, setDatetimeOpen] = useState(false);
const [datetimeValue, setDatetimeValue] = useState(new Date(2024, 4, 3, 9, 30).getTime());
const [cascaderOpen, setCascaderOpen] = useState(false);
const [cascaderValue, setCascaderValue] = useState<(string | number | boolean | null)[]>([]);
const [locatedCity, setLocatedCity] = useState('');
```

Add a source-shaped two-level cascader data constant outside `App`, controlled trigger buttons, and the components inside the existing `UPRoot` content. Keep all data deterministic:

```tsx
<UPDatetimePicker
  hasInput
  mode="datetime"
  modelValue={datetimeValue}
  onChangeShow={setDatetimeOpen}
  onUpdateModelValue={(value) => setDatetimeValue(Number(value))}
  show={datetimeOpen}
/>
<UPCascader
  data={demoCascaderData}
  modelValue={cascaderValue}
  onChangeShow={setCascaderOpen}
  onUpdateModelValue={setCascaderValue}
  show={cascaderOpen}
/>
<UPCityLocate
  currentCity={locatedCity}
  locate={async () => ({ locationCity: '杭州' })}
  onSelectCity={({ locationCity }) => setLocatedCity(locationCity)}
/>
```

Use an `onLocationSuccess` callback to also update `locatedCity`. Do not add a real location permission request, routing action, or external provider.

- [ ] **Step 2: Document P27 public behavior and native limits**

Add a `## P27 selector extensions` section to `docs/compatibility.md` after P26. Document each component's supported props, controlled callbacks, payloads, date/time values, generic picker reuse, cascader draft/confirm behavior, and city adapter requirement. Include a concise code sample showing the `locate` adapter and explain that it replaces `uni.getLocation`.

Append P27 rows to `docs/gap-matrix.md`:

- `u-datetime-picker`: all seven modes, bounds, filter/formatter, input display, controlled confirmation, and React Native picker columns are `Emulated`; source CSS masks/classes and Day.js i18n runtime are typed no-ops.
- `u-cascader`: arbitrary-depth tree, configured keys, draft path, headers, explicit/automatic confirmation, and native popup are `Emulated`; Vue slots, CSS transforms/classes, and source template styling are typed no-ops.
- `u-city-locate`: grouped city list, current/hot city interaction, and index rail are `Emulated`; `uni.getLocation` is a required host adapter and geocoding/permission UI remains application-owned.

Mention the exact test files for each row.

- [ ] **Step 3: Run focused P27 regressions**

Run: `npm test -- --runTestsByPath tests/components/UPDatetimePicker.test.tsx tests/components/UPCascader.test.tsx tests/components/UPCityLocate.test.tsx`

Expected: PASS for date/time data, picker order, cascader branch/confirmation behavior, and city location adapter states.

- [ ] **Step 4: Run repository quality gates**

Run: `npm run typecheck && npm run lint && npm test && npm run build`

Expected: PASS with no TypeScript errors, lint violations, Jest regressions, or package build errors.

- [ ] **Step 5: Verify package contents, patch hygiene, and known example boundary**

Run: `npm pack --dry-run && git diff --check && npx eslint --no-ignore example/App.tsx`

Expected: package dry run contains new `src` and declaration artifacts; `git diff --check` is clean. The standalone ESLint command may report only the pre-existing warning that `example/App.tsx` has no matching root ESLint configuration, with zero lint errors.

Run: `npx tsc --noEmit --jsx react-jsx --strict example/App.tsx`

Expected: this may fail for the existing reason that `example/` has no `tsconfig.json`, resulting in duplicated root/example React Native and DOM type resolution and missing `esModuleInterop`. Record that limitation if it persists; do not change unrelated compiler configuration. The authoritative repository type gate remains `npm run typecheck`, which excludes `example/` by design.

## Plan Self-Review

- **Spec coverage:** Task 1 defines source-compatible datetime values, bounds, filter/formatter logic, generic picker ordering control, and defaults. Task 2 covers datetime rendering, controlled values, callbacks, input labels, and export. Task 3 covers cascader keys, arbitrary-depth drafts, both headers/layouts, explicit/automatic confirmation, cancellation, defaults, tests, and export. Task 4 covers city lists, index composition, host adapter lifecycle, stale response safety, current-city updates, defaults, tests, and export. Task 5 covers examples, compatibility documentation, gap rows, package contents, and all validation gates.
- **Placeholder scan:** All tasks name concrete files, interfaces, callback order, test IDs, test commands, data structures, and implementation operations. No deferred implementation marker or unspecified testing instruction remains.
- **Type consistency:** `UPDatetimePickerValue`, `UPDatetimePickerPayload`, `UPCascaderPath`, `UPCityLocationResult`, `onChangeShow`, and configuration keys use the same spelling in producer and consumer tasks. Generic `UPPicker.closeOnConfirm` is defined before the datetime wrapper consumes it.
- **Scope control:** The plan adds only P27 selector extensions and direct configuration, tests, examples, and documentation. It does not add dependencies, device-location permissions, routing, geocoding, CSS compatibility shims, commits, or unrelated component changes.
