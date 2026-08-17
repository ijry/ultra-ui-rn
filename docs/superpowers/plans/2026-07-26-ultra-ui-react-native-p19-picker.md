# React Native P19 Picker Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-compatible `UPPicker`, `UPPickerData`, `UPPickerColumn`, and `UPSelect` components without native dependencies.

**Architecture:** `UPPicker` owns mutable columns plus draft and confirmed indexes, rendering snapped native `ScrollView` columns inside the existing `UPPopup` overlay. `UPPickerData` is a one-column controlled wrapper, while `UPSelect` uses the root overlay registry and a measured trigger frame for an unclipped menu. Shared picker value/index normalization stays in a focused helper module so public component files retain clear responsibilities.

**Tech Stack:** React 19, React Native `ScrollView`/`Pressable`/`View`, TypeScript 5.9, Jest, React Native Testing Library, `UPPopup`, `UPToolbar`, `UPInput`, `UPLoadingIcon`, `useUPConfig`, and existing overlay/config infrastructure.

## Global Constraints

- Port only `u-picker`, `u-picker-data`, `u-picker-column`, and `u-select` from uview-plus 3.8.86.
- Do not add a package, change `package.json`/`package-lock.json`, add a platform picker, or add a gesture dependency.
- `UPPicker` must use the existing `UPPopup`/root overlay infrastructure and native snapped vertical `ScrollView` columns.
- Preserve picker tentative selection: changes update only draft state; only confirm calls `onUpdateModelValue`.
- Preserve exact selected source option object references in picker `change`/`confirm` payloads and select `onSelect` callbacks.
- `UPPicker` registered defaults must react through `UP.setConfig({ props: { picker } })`; explicit props win.
- `UPPickerData` and `UPSelect` have no upstream registered global default tables.
- `UPPickerColumn` is a compatibility `View`; upstream has no independent behavior.
- `maskClass`, CSS string `maskStyle`, `customClass`, `UPPickerData.description`, exact source `immediateChange` timing, and select CSS hover/transition behavior remain typed no-ops.
- `UPSelect` must render menus through `UPRoot`'s overlay registry so ancestor scroll views do not clip them.
- Do not commit, push, branch, create worktrees, reset, clean, delete unrelated files, or alter the intentionally dirty repository state.

## File Structure

- Create `src/components/picker/types.ts` for public picker option/value/payload/ref types.
- Create `src/components/picker/value.ts` for cloning, index normalization, object label/value extraction, and source payload construction.
- Create `src/components/picker/UPPicker.tsx` for popup lifecycle, column scroll UI, input trigger, draft/confirmed state, and ref methods.
- Create `src/components/picker/UPPickerData.tsx` for the source one-column controlled wrapper.
- Create `src/components/picker/UPPickerColumn.tsx` for the source empty-wrapper compatibility container.
- Create `src/components/picker/index.ts` for picker-family exports.
- Create `src/components/select/UPSelect.tsx` for the measured overlay menu and source select lifecycle.
- Create `src/components/select/index.ts` for select exports.
- Modify `src/config/defaults.ts` and `src/config/store.ts` for reactive picker defaults only.
- Modify `src/components/index.ts` for public barrels.
- Create `tests/components/UPPicker.test.tsx` for the complete P19 component contract.
- Modify `tests/config/store.test.ts` for picker config merge coverage before UI implementation.
- Modify `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx` for public evidence and usage.

### Task 1: Create Failing P19 Contract Tests

**Files:**
- Create: `tests/components/UPPicker.test.tsx`

**Interfaces:**
- Consumes planned root `UP`, `UPRoot`, `UPPicker`, `UPPickerData`, `UPPickerColumn`, `UPSelect`, `UPPickerRef`, and `UPPickerOption` exports.
- Requires deterministic test IDs: `up-picker`, `up-picker-trigger`, `up-picker-column-<index>`, `up-picker-option-<column>-<index>`, `up-picker-selection-band`, `up-picker-loading`, `up-picker-data`, `up-picker-column-compat`, `up-select`, `up-select-trigger`, `up-select-menu`, `up-select-option-<index>`, and `up-select-overlay`.

- [ ] **Step 1: Add render helpers and source option fixtures**

  Create the shared root helper and stable columns at the top of the test file:

  ```tsx
  import React, { createRef } from 'react';
  import { ScrollView, StyleSheet, Text } from 'react-native';
  import { act, fireEvent, render } from '@testing-library/react-native';
  import {
    UP,
    UPPicker,
    UPPickerColumn,
    UPPickerData,
    UPRoot,
    UPSelect,
    type UPPickerRef,
  } from '../../src';

  function renderRoot(node: React.ReactElement) {
    return render(<UPRoot>{node}</UPRoot>);
  }

  const columns = [
    [{ text: 'Red', value: 'red' }, { text: 'Blue', value: 'blue' }],
    ['Small', 'Large'],
  ] as const;
  ```

- [ ] **Step 2: Write failing picker render/lifecycle/ref/default tests**

  Add tests covering all source behavior owned by `UPPicker`:

  ```tsx
  it('renders object and primitive columns with source metrics and toolbar', () => {
    const screen = renderRoot(
      <UPPicker columns={columns} itemHeight={40} show title="Choose" visibleItemCount={3} />,
    );
    expect(screen.getByTestId('up-picker')).toBeTruthy();
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Small')).toBeTruthy();
    expect(screen.getByTestId('up-picker-column-0').props.style).toEqual(
      expect.objectContaining({ height: 120 }),
    );
  });

  it('resolves controlled object values, loading, and source toolbar replacements', () => {
    const screen = renderRoot(
      <UPPicker
        columns={columns}
        confirmColor="#123456"
        keyName="text"
        loading
        modelValue={['blue', 'Large']}
        show
        toolbarBottom={<Text>Toolbar bottom</Text>}
        toolbarRight={<Text>Custom toolbar right</Text>}
        toolbarRightSlot
        visibleItemCount={3}
      />,
    );
    expect(screen.getByTestId('up-picker-option-0-1')).toBeTruthy();
    expect(screen.getByTestId('up-picker-loading')).toBeTruthy();
    expect(screen.getByText('Toolbar bottom')).toBeTruthy();
    expect(screen.getByText('Custom toolbar right')).toBeTruthy();
    expect(screen.queryByTestId('up-toolbar-confirm')).toBeNull();
  });

  it('keeps draft changes out of model updates until confirm', () => {
    const onChange = jest.fn();
    const onUpdateModelValue = jest.fn();
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPPicker columns={columns} onChange={onChange} onConfirm={onConfirm}
        onUpdateModelValue={onUpdateModelValue} show />,
    );
    fireEvent.press(screen.getByTestId('up-picker-option-0-1'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      columnIndex: 0, index: 1, indexs: [1, 0], value: [columns[0][1], columns[1][0]], values: columns,
    }));
    expect(onUpdateModelValue).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
    expect(onUpdateModelValue).toHaveBeenCalledWith(['blue', 'Small']);
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      indexs: [1, 0], value: [columns[0][1], columns[1][0]], values: columns,
    }));
  });

  it('supports source picker instance methods', () => {
    const ref = createRef<UPPickerRef>();
    const screen = renderRoot(<UPPicker columns={columns} ref={ref} show />);
    act(() => ref.current?.setColumnValues(0, ['A', 'B']));
    expect(ref.current?.getColumnValues(0)).toEqual(['A', 'B']);
    expect(ref.current?.getIndexs()).toEqual([0, 0]);
    act(() => ref.current?.setIndexs([1, 1], true));
    expect(ref.current?.getIndexs()).toEqual([1, 1]);
    expect(ref.current?.getValues()).toEqual(['B', 'Large']);
    act(() => ref.current?.setColumns([['Only']]));
    expect(ref.current?.getIndexs()).toEqual([0]);
    expect(ref.current?.getValues()).toEqual(['Only']);
    expect(screen.getByTestId('up-picker-option-0-0')).toBeTruthy();
  });

  it('reacts to configured picker defaults while explicit props win', () => {
    const screen = renderRoot(<UPPicker show />);
    act(() => UP.setConfig({ props: { picker: { columns: [['Configured']], title: 'Configured title' } } }));
    expect(screen.getByText('Configured')).toBeTruthy();
    screen.rerender(<UPRoot><UPPicker columns={[['Explicit']]} show title="Explicit title" /></UPRoot>);
    expect(screen.getByText('Explicit')).toBeTruthy();
  });
  ```

- [ ] **Step 3: Add failing cancellation, input, scroll, and no-op tests**

  Add source lifecycle boundaries that distinguish draft state from confirmed state:

  ```tsx
  it('restores the confirmed draft on cancel and permitted overlay close', () => {
    const onCancel = jest.fn();
    const onClose = jest.fn();
    const onUpdateModelValue = jest.fn();
    const screen = renderRoot(
      <UPPicker closeOnClickOverlay columns={columns} modelValue={['red', 'Small']}
        onCancel={onCancel} onClose={onClose} onUpdateModelValue={onUpdateModelValue} show />,
    );
    fireEvent.press(screen.getByTestId('up-picker-option-0-1'));
    fireEvent.press(screen.getByTestId('up-toolbar-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onUpdateModelValue).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('up-picker-option-0-1'));
    fireEvent.press(screen.getByTestId('up-popup-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUpdateModelValue).not.toHaveBeenCalled();
  });

  it('opens a confirmed-value input trigger only when enabled', () => {
    const screen = renderRoot(
      <UPPicker columns={columns} hasInput modelValue={['blue', 'Large']} />, 
    );
    expect(screen.getByTestId('up-picker-trigger')).toBeTruthy();
    expect(screen.getByDisplayValue('Blue/Large')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-picker-trigger'));
    expect(screen.getByTestId('up-picker')).toBeTruthy();
    const disabled = renderRoot(<UPPicker columns={columns} disabled hasInput />);
    fireEvent.press(disabled.getByTestId('up-picker-trigger'));
    expect(disabled.queryByTestId('up-picker')).toBeNull();
  });

  it('maps snapped native scroll completion and stable no-op props', () => {
    const onChange = jest.fn();
    const screen = renderRoot(
      <UPPicker columns={columns} maskClass="mask" maskStyle="background:red" immediateChange={false}
        onChange={onChange} show />,
    );
    fireEvent(screen.getByTestId('up-picker-column-1'), 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 44 } },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ columnIndex: 1, index: 1 }));
    expect(screen.getByTestId('up-picker-selection-band')).toBeTruthy();
  });
  ```

- [ ] **Step 4: Add failing picker-data, picker-column, and select tests**

  Add family coverage for all remaining P19 public exports:

  ```tsx
  it('bridges picker-data object values including zero', () => {
    const onUpdateModelValue = jest.fn();
    const onConfirm = jest.fn();
    const screen = renderRoot(
      <UPPickerData modelValue={0} onConfirm={onConfirm} onUpdateModelValue={onUpdateModelValue}
        options={[{ id: 0, name: 'None' }, { id: 2, name: 'Two' }]} />,
    );
    expect(screen.getByDisplayValue('None')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-picker-data'));
    fireEvent.press(screen.getByTestId('up-picker-option-0-1'));
    fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
    expect(onUpdateModelValue).toHaveBeenCalledWith(2);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('exports the empty source picker-column compatibility container', () => {
    const screen = renderRoot(<UPPickerColumn><Text>Column children</Text></UPPickerColumn>);
    expect(screen.getByTestId('up-picker-column-compat')).toBeTruthy();
    expect(screen.getByText('Column children')).toBeTruthy();
  });

  it('opens select through the root overlay and preserves option identity', () => {
    const options = [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }];
    const onSelect = jest.fn();
    const onUpdateCurrent = jest.fn();
    const screen = renderRoot(
      <UPSelect current="first" onSelect={onSelect} onUpdateCurrent={onUpdateCurrent}
        options={options} showOptionsLabel />,
    );
    expect(screen.getByText('First')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-select-trigger'));
    expect(screen.getByTestId('up-select-menu')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-select-option-1'));
    expect(onUpdateCurrent).toHaveBeenCalledWith('second');
    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it('honors select disabled/overlay/render replacement/source style contracts', () => {
    const screen = renderRoot(
      <UPSelect border current="a" disabled icon={<Text>Custom icon</Text>}
        itemColor="#112233" options={[{ id: 'a', name: 'Alpha' }]} renderText={(label) => <Text>{`Current:${label}`}</Text>}
        renderOption={(item) => <Text>{`Option:${String(item.name)}`}</Text>} showOptionsLabel />,
    );
    expect(screen.getByText('Current:Alpha')).toBeTruthy();
    fireEvent.press(screen.getByTestId('up-select-trigger'));
    expect(screen.queryByTestId('up-select-menu')).toBeNull();
  });
  ```

- [ ] **Step 5: Run focused tests and confirm the expected missing-export failure**

  Run:

  ```powershell
  npm test -- --runInBand tests/components/UPPicker.test.tsx
  ```

  Expected: TypeScript/Jest fails because P19 components and picker configuration are not exported or implemented yet.

### Task 2: Add Picker Types, Defaults, Exports, and Pure Value Helpers

**Files:**
- Create: `src/components/picker/types.ts`
- Create: `src/components/picker/value.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/components/UPPicker.test.tsx`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Produces all picker types: `UPPickerPrimitive`, `UPPickerOption`, `UPPickerColumns`, `UPPickerChangePayload`, `UPPickerConfirmPayload`, `UPPickerRef`, and `UPPickerProps`.
- Produces pure helpers `clonePickerColumns`, `normalizePickerIndexes`, `pickerDisplay`, `pickerPrimitiveValues`, `pickerSelectedValues`, `resolvePickerIndexes`, and `pickerChangePayload` for `UPPicker` and `UPPickerData`.
- Produces `UPPickerDefaults`, `UPProps['picker']`, and the reactive config override path. Task 3 exports the picker family only after its concrete modules exist.

- [ ] **Step 1: Add the picker type module and default contract**

  Define public types in `src/components/picker/types.ts`, keeping option objects broad enough for source custom keys:

  ```ts
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
  ```

  Add `UPPickerDefaults` in `src/config/defaults.ts` and add the exact frozen source table:

  ```ts
  export type UPPickerDefaults = {
    show: boolean; popupMode: 'top' | 'bottom' | 'left' | 'right' | 'center'; showToolbar: boolean;
    title: string; columns: readonly (readonly unknown[])[]; loading: boolean; itemHeight: number;
    cancelText: string; confirmText: string; cancelColor: string; confirmColor: string;
    visibleItemCount: number; keyName: string; valueName: string; closeOnClickOverlay: boolean;
    defaultIndex: readonly number[]; immediateChange: boolean; zIndex: number; disabled: boolean;
    disabledColor: string; placeholder: string; inputProps: Record<string, never>; bgColor: string;
    round: number; duration: number; overlayOpacity: number; pageInline: boolean;
  };

  picker: Object.freeze({
    show: false, popupMode: 'bottom' as const, showToolbar: true, title: '', columns: Object.freeze([]),
    loading: false, itemHeight: 44, cancelText: '取消', confirmText: '确认', cancelColor: '#909193',
    confirmColor: '', visibleItemCount: 5, keyName: 'text', valueName: 'value',
    closeOnClickOverlay: false, defaultIndex: Object.freeze([]), immediateChange: true, zIndex: 10076,
    disabled: false, disabledColor: '', placeholder: '请选择', inputProps: Object.freeze({}), bgColor: '',
    round: 0, duration: 300, overlayOpacity: 0.5, pageInline: false,
  }),
  ```

- [ ] **Step 2: Implement deterministic picker value helpers**

  Implement helpers in `src/components/picker/value.ts` without React state:

  ```ts
  export function optionText(option: UPPickerOption, keyName: string): string {
    return option && typeof option === 'object' ? String(option[keyName] ?? '') : String(option);
  }

  export function optionValue(option: UPPickerOption, valueName: string): UPPickerPrimitive {
    if (option && typeof option === 'object') return option[valueName] as UPPickerPrimitive;
    return option;
  }

  export function normalizePickerIndexes(columns: UPPickerColumns, indexes: readonly number[]): number[] {
    return columns.map((column, index) => {
      if (!column.length) return 0;
      return Math.max(0, Math.min(column.length - 1, Math.trunc(indexes[index] ?? 0)));
    });
  }
  ```

  Implement `resolvePickerIndexes` with this precedence: a complete matching `modelValue` array; otherwise `defaultIndex`; otherwise zeros. It must compare primitive options with `===`, object values by `valueName`, and normalize every result. Build payloads from the current columns so option object references are not cloned.

- [ ] **Step 3: Wire reactive picker configuration and add a focused store test**

  Update every picker configuration site in `src/config/store.ts`:

  ```ts
  // UPConfigOverrides['props']
  picker?: Partial<UPProps['picker']>;

  // createSourceState().props
  picker: { ...sourceDefaults.props.picker },

  // setUPConfig().props
  picker: { ...state.props.picker, ...overrides.props?.picker },
  ```

  Add `picker: UPPickerDefaults` in `UPProps`. Do not add public barrels until
  Task 3 creates their concrete component modules. Add this test to
  `tests/config/store.test.ts`:

  ```tsx
  it('merges picker prop overrides without losing source picker defaults', () => {
    setUPConfig({ props: { picker: { title: 'Configured picker' } } });

    expect(getUPConfig().props.picker.title).toBe('Configured picker');
    expect(getUPConfig().props.picker.itemHeight).toBe(44);
  });
  ```

- [ ] **Step 4: Run the focused store test before UI implementation**

  Run:

  ```powershell
  npm test -- --runInBand tests/config/store.test.ts
  ```

  Expected: picker override types compile and the store preserves the source
  `itemHeight` default while applying the title override. The P19 public
  component test remains intentionally failing until Task 3 exports the
  implemented picker modules.

### Task 3: Implement `UPPicker`, `UPPickerData`, and `UPPickerColumn`

**Files:**
- Create: `src/components/picker/UPPicker.tsx`
- Create: `src/components/picker/UPPickerData.tsx`
- Create: `src/components/picker/UPPickerColumn.tsx`
- Create: `src/components/picker/index.ts`
- Modify: `src/components/picker/types.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPPicker.test.tsx`

**Interfaces:**
- Consumes Task 2 picker helpers/defaults and existing `UPPopup`, `UPToolbar`, `UPInput`, `UPLoadingIcon`, `getPx`, and `useUPConfig`.
- Produces public `UPPicker`, `UPPickerProps`, `UPPickerRef`, `UPPickerData`, `UPPickerDataProps`, `UPPickerColumn`, and `UPPickerColumnProps` exports.

- [ ] **Step 1: Define public component/ref props exactly once**

  Put `UPPickerRef` and `UPPickerProps` in `UPPicker.tsx` or re-export them from `types.ts`; do not duplicate shapes. Implement the forwarded ref surface exactly:

  ```tsx
  export type UPPickerRef = {
    getColumnValues: (columnIndex: number) => readonly UPPickerOption[];
    getIndexs: () => number[];
    getValues: () => UPPickerOption[];
    setColumns: (columns: UPPickerColumns) => void;
    setColumnValues: (columnIndex: number, values: readonly UPPickerOption[]) => void;
    setIndexs: (indexs: readonly number[], setLastIndex?: boolean) => void;
  };
  ```

  Use `forwardRef<UPPickerRef, UPPickerProps>`. Merge `useUPConfig().props.picker` and `input`, but invoke callbacks only from `input` so configuration cannot introduce accidental side effects.

- [ ] **Step 2: Implement mutable columns plus confirmed/draft selection state**

  Initialize local columns from resolved props, then synchronize only when resolved `columns` changes. Keep two state arrays:

  ```tsx
  const [innerColumns, setInnerColumns] = useState<UPPickerColumns>(() => clonePickerColumns(props.columns));
  const [draftIndexes, setDraftIndexes] = useState(() => resolvePickerIndexes(props.columns, input.modelValue, props.defaultIndex, props.valueName));
  const [confirmedIndexes, setConfirmedIndexes] = useState(() => resolvePickerIndexes(props.columns, input.modelValue, props.defaultIndex, props.valueName));
  ```

  On controlled `input.modelValue` changes, recompute both draft and confirmed indexes. On a changed `defaultIndex` without a controlled model, recompute both indexes. When columns change, preserve indexes by normalization; resolve fresh defaults only for an initially empty or newly populated column. Normalize all ref-originated changes.

  Implement a single `selectIndex(columnIndex, requestedIndex)` function that updates only draft indexes and calls:

  ```ts
  input.onChange?.(pickerChangePayload(innerColumns, nextIndexes, columnIndex));
  ```

- [ ] **Step 3: Render source popup, toolbar, selection band, loading, and snapped columns**

  Use `UPPopup` rather than a native `Modal`:

  ```tsx
  <UPPopup
    bgColor={props.bgColor}
    closeOnClickOverlay={props.closeOnClickOverlay}
    duration={props.duration}
    mode={props.popupMode}
    onChangeShow={handleOverlayChange}
    onClose={handleOverlayClose}
    overlayOpacity={props.overlayOpacity}
    pageInline={props.pageInline}
    round={props.round}
    show={shown}
    zIndex={props.zIndex}
  >
    <View testID="up-picker">...</View>
  </UPPopup>
  ```

  Resolve `itemHeight = getPx(props.itemHeight)` and `visibleCount = Math.max(1, Math.trunc(Number(props.visibleItemCount)))`. Each column height is `itemHeight * visibleCount`; selection padding is `(visibleCount - 1) * itemHeight / 2`. Render each column with `snapToInterval={itemHeight}`, `decelerationRate="fast"`, `showsVerticalScrollIndicator={false}`, `onMomentumScrollEnd`, and rows with `up-picker-option-<column>-<row>` IDs. A row press must call both its native ref `scrollTo({ y: row * itemHeight, animated: true })` and `selectIndex`.

  Add a non-interactive absolute `up-picker-selection-band` with `height: itemHeight` and source light border colors. Render `UPToolbar` when `showToolbar`; its cancel restores `confirmedIndexes`, emits `onChangeShow(false)`, then `onCancel`. Confirm commits draft, emits primitive `pickerPrimitiveValues`, emits `pickerConfirmPayload`, and asks to hide. If `toolbarRightSlot`, forward `rightSlot`, `right`, and leave confirm rendering to the custom node. Render `toolbarBottom` below it. Overlay close must restore draft and emit `onClose` only when source close is permitted.

  Render `UPLoadingIcon` inside an absolute opaque `up-picker-loading` layer when `loading`.

- [ ] **Step 4: Implement picker input-trigger behavior and ref methods**

  Derive `shown` as `Boolean(props.show || localInputOpen)`. Derive the input label from `input.modelValue` when provided, otherwise `confirmedIndexes`; use `optionText` and join columns with `/`. Render a `Pressable` `up-picker-trigger` around either `trigger` or a readonly `UPInput`:

  ```tsx
  <Pressable disabled={props.disabled} onPress={() => setLocalInputOpen(true)} testID="up-picker-trigger">
    {typeof input.trigger === 'function'
      ? input.trigger(committedLabel)
      : input.trigger ?? <UPInput {...props.inputProps} border={props.inputBorder} disabled={props.disabled}
          disabledColor={props.disabledColor} placeholder={props.placeholder} readonly value={committedLabel} />}
  </Pressable>
  ```

  `handleCancel`, `handleConfirm`, and permitted overlay close must clear `localInputOpen` when `hasInput` is true. `setColumnValues` must replace its column, set all later indexes to zero, normalize, and update draft only unless `setIndexs(..., true)` is explicitly requested. Return the live source option references from getters.

- [ ] **Step 5: Implement `UPPickerData` and the empty source wrapper**

  Define:

  ```tsx
  export type UPPickerDataProps = {
    modelValue?: string | number;
    title?: string;
    description?: string;
    options?: readonly Record<string, unknown>[];
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
  ```

  Resolve a matching option with strict equality so `0` is valid. Render `up-picker-data` as a `Pressable` trigger around `trigger` or `UPInput`, and mount one `UPPicker` with `columns={[options]}`, `keyName={labelKey}`, `valueName={valueKey}`, and local `show`. On picker confirm, emit the selected first option value then `onConfirm`; forward cancel/close in their original event order.

  Implement `UPPickerColumn` as:

  ```tsx
  export function UPPickerColumn(input: UPPickerColumnProps): React.JSX.Element {
    return <View style={input.customStyle} testID="up-picker-column-compat">{input.children}</View>;
  }
  ```

- [ ] **Step 6: Run focused picker tests, typecheck, and lint**

  Run:

  ```powershell
  npm test -- --runInBand tests/components/UPPicker.test.tsx -t "picker|Picker|compatibility container"
  npm run typecheck
  npm run lint
  ```

  Expected: all picker/picker-data/picker-column tests pass, select tests are
  intentionally skipped until Task 4, and no TypeScript or lint failures
  exist. If a test exposes unexpected component behavior, invoke
  `systematic-debugging` before changing source.

### Task 4: Implement `UPSelect` Root-Overlay Menu

**Files:**
- Create: `src/components/select/UPSelect.tsx`
- Create: `src/components/select/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/components/UPPicker.test.tsx`

**Interfaces:**
- Consumes existing `useUPOverlay`, `UPOverlay`, `UPIcon`, `getPx`, `useUPTheme`, and `Dimensions`.
- Produces `UPSelect`, `UPSelectProps`, and `UPSelectOption`.

- [ ] **Step 1: Define source-compatible select props and normalization helpers**

  Define `UPSelectOption = Record<string, unknown>` and `UPSelectProps` using the exact P19 spec. Add a `selectMaxHeight` helper that supports source viewport units:

  ```ts
  function selectMaxHeight(value: UPDimension): number {
    const text = String(value).trim();
    if (text.endsWith('vh')) return (Dimensions.get('window').height * Number.parseFloat(text)) / 100;
    return getPx(value);
  }

  function selectWidth(value: UPDimension | undefined, triggerWidth: number): number {
    if (value === undefined || value === '') return Math.max(100, triggerWidth);
    const text = String(value).trim();
    if (text.endsWith('%')) return (triggerWidth * Number.parseFloat(text)) / 100;
    return getPx(value);
  }
  ```

  Use source local defaults in the component rather than `UP.setConfig`.

- [ ] **Step 2: Implement trigger measurement and overlay lifecycle**

  Hold a `View` ref, `open` state, and `{ x, y, width, height }` frame. On trigger press, skip disabled controls; otherwise call `measureInWindow` and then set open. Provide a fallback `{ x: 0, y: 0, width: 100, height: 0 }` if no native measurement callback arrives in the test renderer.

  Use a stable overlay ID and effect to register/remove an overlay entry only while open:

  ```tsx
  useEffect(() => {
    if (!open) {
      overlay.remove(id);
      return;
    }
    overlay.add({ id, zIndex: props.zIndex, node: <SelectLayer props={props} frame={frame} close={close} select={select} /> });
    return () => overlay.remove(id);
  }, [close, frame, id, open, overlay, props, select]);
  ```

  The root trigger has `up-select`, an accessible button `up-select-trigger`, optional source border, default arrow icon, and `renderText`/`icon` replacement paths.

- [ ] **Step 3: Render the menu, safe horizontal alignment, overlay, and selection callbacks**

  Build `SelectLayer` as a root absolute layer. If `props.overlay`, render `UPOverlay` with `testID="up-select-overlay"`, `opacity={props.overlayOpacity}`, and `onClick={close}`. Position the menu below the trigger, use explicit/default width and max height, and clamp horizontal placement:

  ```ts
  const windowWidth = Dimensions.get('window').width;
  const width = selectWidth(props.optionsWidth, frame.width);
  const left = Math.max(0, Math.min(frame.x, Math.max(0, windowWidth - width)));
  const top = frame.y + frame.height + 4;
  ```

  Render `up-select-menu` as a native `ScrollView`. `renderOptions` replaces all default rows. Default rows use a `Pressable` `up-select-option-<index>`, source item color, strict `current === item[keyName]` active background, and `renderOption` replacement. Selecting closes first, emits `onUpdateCurrent(item[keyName] as string | number | undefined)`, then emits `onSelect(item)` with the original reference.

- [ ] **Step 4: Run focused select coverage and verify overlay cleanup**

  Run:

  ```powershell
  npm test -- --runInBand tests/components/UPPicker.test.tsx
  npm run typecheck
  npm run lint
  ```

  Expected: select tests pass, disabled controls do not register a menu, row selection removes the menu, and the focused suite has no leaked overlay warning.

### Task 5: Document and Demonstrate P19

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Documents source draft-confirm semantics, snapped-core picker mapping, ref methods, picker-data wrapper, root-overlay select requirement, and explicit native limitations.
- Demonstrates controlled `UPPicker`, `UPPickerData`, and `UPSelect` with visible selected values.

- [ ] **Step 1: Add P19 status and component summary to README**

  Add a P19 plan link after P18 and append this status statement after the P18 paragraph:

  ```md
  P19 adds `UPPicker`, `UPPickerData`, `UPPickerColumn`, and `UPSelect`,
  preserving source multi-column drafts, confirmation payloads, picker ref
  methods, one-column data triggers, and root-overlay selection menus.
  ```

- [ ] **Step 2: Add compatibility guide examples and native boundaries**

  Append a `## P19 picker family` section to `docs/compatibility.md` with a controlled picker example:

  ```tsx
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sizes, setSizes] = useState(['blue', 'Large']);

  <UPPicker
    columns={[[{ text: 'Red', value: 'red' }, { text: 'Blue', value: 'blue' }], ['Small', 'Large']]}
    modelValue={sizes}
    onChangeShow={setPickerOpen}
    onUpdateModelValue={setSizes}
    show={pickerOpen}
  />
  ```

  Document that row/scroll changes are drafts until confirm, `UPPickerRef` supports column replacement, `UPPickerData` maps `valueKey`/`labelKey`, and `UPSelect` needs `UPRoot` to escape scroll clipping. State that core snapped scrolling replaces exact `picker-view`, CSS masks/classes/hover and exact immediate timing remain no-ops, and later date/cascader adapters are separate phases.

- [ ] **Step 3: Add P19 compatibility matrix rows**

  Insert rows before deferred components:

  ```md
  ## P19 Picker Family

  | Component | Source API | React Native API | Default / behavior | Status | Test |
  |---|---|---|---|---|---|
  | `u-picker` | columns, model value, toolbar, selection events, input trigger, instance methods | `UPPicker`, `UPPickerRef`, `onChange`, `onConfirm`, `onUpdateModelValue` | Snapped core scroll columns preserve draft-before-confirm selection and source payloads | Emulated | `tests/components/UPPicker.test.tsx` |
  | `u-picker-data` / `u-picker-column` | one-column data trigger / platform column wrapper | `UPPickerData` / `UPPickerColumn` | Data wrapper maps object value/label keys; column is an empty compatibility View | Emulated | `tests/components/UPPicker.test.tsx` |
  | `u-select` | current value, inline trigger, option overlay, select callback | `UPSelect`, `onUpdateCurrent`, `onSelect` | Measured root-overlay menu avoids clipping and preserves source option identity | Emulated | `tests/components/UPPicker.test.tsx` |
  | P19 picker family | CSS picker mask, CSS classes/hover, exact picker inertia and immediate timing | Retained props | Native snapped scroll and accessible presses replace source platform/CSS behavior | No-op retained | `src/components/picker/UPPicker.tsx` |
  ```

- [ ] **Step 4: Add an interactive P19 example**

  Add imports, state, and a section near existing input/selection examples in `example/App.tsx`:

  ```tsx
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState<(string | number | boolean)[]>(['red', 'Small']);
  const [pickerDataValue, setPickerDataValue] = useState<string | number>(0);
  const [selectValue, setSelectValue] = useState<string | number>('first');
  ```

  Render a button that sets `pickerOpen`, a two-column `UPPicker` with object color values plus primitive sizes, a `UPPickerData` with zero-valued option, and `UPSelect` with `showOptionsLabel`. Render feedback such as `Picker: {pickerValue.join(' / ')}`, `Picker data: {pickerDataValue}`, and `Select: {selectValue}`. Keep the existing example architecture and avoid adding a dependency.

- [ ] **Step 5: Build before example validation, then run all example gates**

  Run:

  ```powershell
  npm run build
  Push-Location example
  npx tsc --noEmit
  npm run lint
  npm test -- --runInBand
  Pop-Location
  git diff --check
  ```

  Expected: library artifacts expose P19 types to the example, example typecheck/lint/Jest pass, and no whitespace errors exist.

### Task 6: Run the Full P19 Quality Gate

**Files:**
- Verify: all P19 source, tests, docs, example, spec, and plan files.

**Interfaces:**
- Verifies public exports, type declarations, native-core behavior, package contents, no dependency change, no package artifact, and repository whitespace.

- [ ] **Step 1: Run the complete library validation suite**

  Run:

  ```powershell
  npm test -- --runInBand
  npm run typecheck
  npm run lint
  npm run build
  npm pack --dry-run
  git diff --check
  ```

  Expected: all suites pass; build emits P19 commonjs/type declarations; dry run includes picker/select source and built artifacts.

- [ ] **Step 2: Verify P19 did not create forbidden dependency or artifact changes**

  Run:

  ```powershell
  Test-Path ultra-ui-rn-0.1.0.tgz
  rg -n 'picker|select' package.json package-lock.json
  git status --short
  ```

  Expected: `Test-Path` prints `False`; package manifest search has no P19 dependency addition; the intentionally dirty baseline remains intact with only expected P19 paths added or modified.

## Plan Self-Review

- **Spec coverage:** Task 1 locks all source behavior in failing contracts. Task 2 adds picker defaults/config/types/exports and pure value semantics. Task 3 implements picker, picker-data, picker-column, draft lifecycle, trigger, and ref APIs. Task 4 implements the measured select root-overlay menu. Task 5 adds documentation/example evidence. Task 6 validates the complete deliverable and package hygiene.
- **Placeholder scan:** The plan contains concrete file paths, exported symbols, test IDs, expected payload shapes, source values, commands, and acceptance conditions. It intentionally uses no deferred implementation markers.
- **Type consistency:** `UPPickerPrimitive`, `UPPickerOption`, `UPPickerColumns`, `UPPickerChangePayload`, `UPPickerConfirmPayload`, `UPPickerRef`, `onUpdateModelValue`, `onUpdateCurrent`, `setColumnValues`, and `setIndexs` use the same spellings and shapes throughout all tasks.
