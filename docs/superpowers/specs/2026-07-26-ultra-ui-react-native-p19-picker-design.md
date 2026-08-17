# React Native P19 Picker Family Design

## Goal

Port `u-picker`, `u-picker-data`, `u-picker-column`, and `u-select` from
uview-plus 3.8.86.

Export `UPPicker`, `UPPickerData`, `UPPickerColumn`, and `UPSelect`, together
with their public props, payload, value, and ref types.

Preserve source multi-column selection, tentative picker selection before
confirmation, controlled source values, callback payloads, defaults, and
select-menu behavior without adding dependencies.

## Scope

P19 adds only the picker family, its picker configuration defaults, exports,
tests, example, and compatibility documentation.

It uses the existing root `UPPopup`/overlay infrastructure, native
`ScrollView`, `Pressable`, and `View`. It does not add a native picker package,
gesture dependency, date/time data logic, cascading data adapter, or a
standalone modal host.

`UPPicker` provides the primitive needed by later `UPDatetimePicker`,
`UPCalendar`, and `UPCascader` phases, but those components remain out of
scope for P19.

## Source Defaults

```ts
picker: {
  show: false,
  popupMode: 'bottom',
  showToolbar: true,
  title: '',
  columns: [],
  loading: false,
  itemHeight: 44,
  cancelText: '取消',
  confirmText: '确认',
  cancelColor: '#909193',
  confirmColor: '',
  visibleItemCount: 5,
  keyName: 'text',
  valueName: 'value',
  closeOnClickOverlay: false,
  defaultIndex: [],
  immediateChange: true,
  zIndex: 10076,
  disabled: false,
  disabledColor: '',
  placeholder: '请选择',
  inputProps: {},
  bgColor: '',
  round: 0,
  duration: 300,
  overlayOpacity: 0.5,
  pageInline: false,
}
```

`UPSelect` has no upstream registered global default table. Its source defaults
remain local: `maxHeight: '90vh'`, `overlay: true`, `overlayOpacity: 0.01`,
`duration: 300`, `label: '选项'`, `keyName: 'id'`, `labelName: 'name'`,
`showOptionsLabel: false`, `current: ''`, `zIndex: 11000`, `iconSize: '13px'`,
`disabled: false`, `border: false`, and an empty `optionsWidth`.

`UPPickerColumn` has no source props or behavior. `UPPickerData` owns no
registered source default table.

## React Native API

```tsx
export type UPPickerPrimitive = string | number | boolean;
export type UPPickerOption = UPPickerPrimitive | Record<string, unknown>;
export type UPPickerColumns = readonly (readonly UPPickerOption[])[];

export type UPPickerChangePayload = {
  value: UPPickerOption[];
  index: number;
  indexs: number[];
  values: UPPickerColumns;
  columnIndex: number;
};

export type UPPickerConfirmPayload = {
  indexs: number[];
  value: UPPickerOption[];
  values: UPPickerColumns;
};

export type UPPickerRef = {
  getColumnValues: (columnIndex: number) => readonly UPPickerOption[];
  getIndexs: () => number[];
  getValues: () => UPPickerOption[];
  setColumns: (columns: UPPickerColumns) => void;
  setColumnValues: (columnIndex: number, values: readonly UPPickerOption[]) => void;
  setIndexs: (indexs: readonly number[], setLastIndex?: boolean) => void;
};

export type UPPickerProps = {
  modelValue?: readonly UPPickerPrimitive[];
  hasInput?: boolean;
  inputProps?: Partial<UPInputProps>;
  inputBorder?: UPInputProps['border'];
  disabled?: boolean;
  disabledColor?: string;
  placeholder?: string;
  show?: boolean;
  popupMode?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showToolbar?: boolean;
  title?: string;
  columns?: UPPickerColumns;
  loading?: boolean;
  itemHeight?: UPDimension;
  cancelText?: string;
  confirmText?: string;
  cancelColor?: string;
  confirmColor?: string;
  visibleItemCount?: number | string;
  keyName?: string;
  valueName?: string;
  closeOnClickOverlay?: boolean;
  defaultIndex?: readonly number[];
  immediateChange?: boolean;
  toolbarRightSlot?: boolean;
  toolbarRight?: React.ReactNode;
  toolbarBottom?: React.ReactNode;
  trigger?: React.ReactNode | ((label: string) => React.ReactNode);
  zIndex?: number | string;
  bgColor?: string;
  round?: boolean | UPDimension;
  duration?: UPDimension;
  overlayOpacity?: number | string;
  pageInline?: boolean;
  maskClass?: string;
  maskStyle?: string;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onChange?: (payload: UPPickerChangePayload) => void;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: (payload: UPPickerConfirmPayload) => void;
  onUpdateModelValue?: (values: UPPickerPrimitive[]) => void;
  onChangeShow?: (show: boolean) => void;
};

export type UPPickerDataOption = Record<string, unknown>;

export type UPPickerDataProps = {
  modelValue?: string | number;
  title?: string;
  description?: string;
  options?: readonly UPPickerDataOption[];
  valueKey?: string;
  labelKey?: string;
  trigger?: React.ReactNode | ((label: string) => React.ReactNode);
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  onUpdateModelValue?: (value: string | number | undefined) => void;
};

export type UPPickerColumnProps = {
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
};

export type UPSelectOption = Record<string, unknown>;

export type UPSelectProps = {
  maxHeight?: UPDimension;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayStyle?: StyleProp<ViewStyle>;
  duration?: UPDimension;
  label?: string;
  options?: readonly UPSelectOption[];
  keyName?: string;
  labelName?: string;
  showOptionsLabel?: boolean;
  current?: string | number;
  zIndex?: number;
  itemColor?: string;
  iconColor?: string;
  iconSize?: UPDimension;
  disabled?: boolean;
  border?: boolean;
  optionsWidth?: UPDimension;
  renderText?: (currentLabel: string) => React.ReactNode;
  icon?: React.ReactNode;
  renderOptions?: () => React.ReactNode;
  renderOption?: (item: UPSelectOption, index: number) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onSelect?: (item: UPSelectOption) => void;
  onUpdateCurrent?: (current: string | number | undefined) => void;
};
```

`trigger`, `toolbarRight`, `toolbarBottom`, `renderText`, `icon`,
`renderOptions`, and `renderOption` are the React Native counterparts of the
source default/named slots. A `trigger` render function receives the committed
picker label. `UPPickerData` and `UPSelect` render functions receive their
current resolved label.

`customClass` is a typed no-op. `description` on `UPPickerData` remains a
typed no-op because upstream declares but does not render it.

## `UPPicker` Architecture

`UPPicker` merges `useUPConfig().props.picker` with explicit props. Explicit
props always win and mounted unresolved values react to `UP.setConfig`.

It stores mutable local columns, draft indexes, and confirmed indexes. Indexes
are always normalized to an existing option, or `0` for empty columns. On
initial mount and when explicit `modelValue` or `defaultIndex` changes,
`modelValue` resolves by `valueName` for object options and by strict value
comparison for primitive options; otherwise `defaultIndex` resolves; otherwise
each populated column begins at zero.

The draft remains independent of the confirmed indexes while the popup is
open. Choosing a row or ending a snapped column scroll updates the draft and
emits `onChange` with the source-shaped change payload. It never emits
`onUpdateModelValue` until confirmation. Cancel and permitted overlay close
restore the draft to the most recently confirmed indexes. Confirm emits
`onUpdateModelValue` using the selected primitive values (`valueName` for
objects), commits the draft, emits the source-shaped confirm payload, and asks
the parent to hide the picker through `onChangeShow(false)`.

Each column is a vertical native `ScrollView` with `snapToInterval` equal to
the resolved item height. The content receives symmetric padding so its
selected row lands in a centered selection band. Every row is also an
accessible `Pressable`; a row press scrolls to it and emits the same selection
change. Native momentum completion rounds its offset to an index and produces
the selection change. This supports accessible discrete selection without
requiring an extra picker dependency.

`UPPicker` reuses `UPPopup`, forwarding `popupMode`, `zIndex`, roundness,
color, duration, overlay opacity, page-inline behavior, and overlay-close
policy. `UPToolbar` renders source cancel/confirm controls unless
`showToolbar={false}`. `toolbarRightSlot` selects the `toolbarRight` React node
instead of the native confirm control. `toolbarBottom` renders below the
toolbar. A loading overlay uses `UPLoadingIcon`.

When `hasInput` is true, a readonly `UPInput` or `trigger` sits in the normal
layout and opens a private picker display state. The label is based only on
confirmed `modelValue`, never on an unconfirmed draft. Disabled inputs do not
open. External `show` still opens the picker, matching source `show ||
showByClickInput` behavior.

The imperative `UPPickerRef` methods preserve upstream spellings. `setColumns`
replaces all columns and keeps indexes normalized. `setColumnValues` replaces
one column then resets all later indexes to zero. `setIndexs` changes the draft
and optionally commits it as the last confirmed state. `getColumnValues`,
`getIndexs`, and `getValues` expose the current mutable picker state.

`maskClass` and CSS string `maskStyle` remain accepted no-ops. The source
`immediateChange` timing distinction cannot be reproduced exactly by RN core;
row presses emit immediately and scroll gestures emit when their momentum
settles. CSS mask gradients and platform `picker-view` implementation details
are not claimed.

## `UPPickerData` Architecture

`UPPickerData` is a one-column controlled wrapper around `UPPicker`. It
resolves `modelValue` against `options` using `valueKey`, displays the matching
`labelKey`, and passes the original option array as its single picker column.

Its default trigger is a readonly no-border `UPInput`; `trigger` replaces it.
Pressing the trigger opens its local picker. On confirmation it reads the first
selected object, emits `onUpdateModelValue(item[valueKey])`, updates the
resolved label, closes, then emits `onConfirm`. Cancel and permitted overlay
closure close the local picker and forward `onCancel`/`onClose`. A model value
of `0` is valid and resolves normally.

## `UPPickerColumn` Architecture

The upstream component is an empty wrapper over the platform
`picker-view-column`. React Native exports `UPPickerColumn` as a plain native
`View` compatibility container with children and styling. It has no selection
state, props, configuration defaults, or direct interaction contract.

## `UPSelect` Architecture

`UPSelect` retains an internally controlled open state, as upstream exposes no
`show` prop. The trigger is a relative accessible `Pressable`. It displays
`label` by default or the resolved current option label when
`showOptionsLabel` is true; `renderText` replaces that text and `icon` replaces
the source arrow icon. `disabled` prevents opening.

On opening, the trigger measures its window frame with `measureInWindow`.
`UPSelect` registers a menu layer with the existing `UPOverlayProvider`, so a
menu is not clipped by an ancestor `ScrollView`. The native `ScrollView` menu
opens below the measured trigger. Its width is the explicit `optionsWidth`
(including `rpx` and percentage relative to the trigger) or the larger of the
trigger width and 100px. If it would overflow the right screen edge, it aligns
its right edge to the trigger. `maxHeight` accepts native dimensions and `vh`
for source's default `90vh`.

When `overlay` is true, the root overlay has the source opacity and closes the
menu on press. When false, no screen blocker is inserted. `renderOptions`
replaces the complete option list; `renderOption` replaces a row. A default row
uses `labelName`, applies `itemColor`, and identifies the current item by
strict key equality. Selecting a row closes the menu, emits
`onUpdateCurrent(item[keyName])`, then emits `onSelect` with the original
option object. `duration` is a typed visual-timing no-op because root menus use
an immediate native layout update rather than CSS transitions.

## Reactivity and Exports

Add a frozen `UP.props.picker` source table and a matching `UPPickerDefaults`
entry to `UPProps`. Add its typed override, source-state copy, and merge path
in the configuration store.

Add `src/components/picker/` and `src/components/select/` barrels, then export
both from `src/components/index.ts`. `src/index.ts` remains unchanged because
it already re-exports the components barrel.

No new package or lockfile dependency is allowed.

## Compatibility Limits

React Native core does not provide the source `picker-view` primitive, native
CSS mask layers, or its exact gesture inertia. P19 provides snapped native
scroll columns and accessible row presses instead.

`maskClass`, `maskStyle`, `customClass`, `UPPickerData.description`, and exact
`immediateChange` timing remain typed compatibility no-ops. `UPSelect` source
CSS hover, scoped classes, and CSS transition duration have no RN equivalent.

`UPSelect` needs `UPRoot` to place its measured menu above scroll containers.
If a trigger cannot be measured, its menu uses the root's top-left fallback;
runtime native layouts always measure the trigger before the effect refreshes
the layer.

## Test Plan

Add `tests/components/UPPicker.test.tsx` under `UPRoot`.

Verify root exports and exact source defaults. Verify primitive and object
labels, `keyName`/`valueName`, default/model value resolution, visible column
height, source toolbar colors, custom toolbar nodes, loading surface, and
typed no-op props.

Verify row press and native scroll momentum produce source-shaped change
payloads. Verify confirmation emits primitive model values and selected source
entries, while cancellation and permitted overlay close restore the draft
without model updates. Verify `hasInput` shows only confirmed labels, opens
when enabled, and does not open when disabled.

Verify every `UPPickerRef` method, including downstream reset behavior from
`setColumnValues`, and verify reactive picker defaults with explicit prop
precedence.

Verify `UPPickerData` resolves object labels and values, including zero, and
forwards confirmation/cancel/close callbacks.

Verify `UPPickerColumn` renders its compatibility container.

Verify `UPSelect` trigger/current labels, disabled state, root overlay,
viewport-safe alignment fallback, object selection identity, current update,
render callbacks, border/colors, and no-op timing/class props.

## Documentation and Acceptance Criteria

Update `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx`.

The example demonstrates a two-column picker controlled by `show`, a
`UPPickerData` trigger, and a `UPSelect` trigger with visible selected-value
feedback.

Acceptance requires source-compatible exports, picker selection lifecycle,
ref methods, picker-data bridge, select menu lifecycle, reactive picker
defaults, and no dependency change.

Library and example typecheck, lint, Jest, build, dry-run package, and
whitespace gates must pass.
