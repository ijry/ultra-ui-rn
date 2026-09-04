import React, { createRef } from 'react';
import { StyleSheet, Text } from 'react-native';
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

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders object and primitive columns with source metrics and toolbar', () => {
  const screen = renderRoot(
    <UPPicker columns={columns} itemHeight={40} show title="Choose" visibleItemCount={3} />,
  );

  expect(screen.getByTestId('up-picker')).toBeTruthy();
  expect(screen.getByText('Red')).toBeTruthy();
  expect(screen.getByText('Small')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-picker-column-0').props.style)).toEqual(
    expect.objectContaining({ height: 120 }),
  );
  expect(screen.getByText('Choose')).toBeTruthy();
});

it('resolves controlled object values, loading, and source toolbar replacements', () => {
  const screen = renderRoot(
    <UPPicker
      columns={columns}
      confirmColor="#123456"
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
    <UPPicker
      columns={columns}
      onChange={onChange}
      onConfirm={onConfirm}
      onUpdateModelValue={onUpdateModelValue}
      show
    />,
  );

  fireEvent.press(screen.getByTestId('up-picker-option-0-1'));

  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
    columnIndex: 0,
    index: 1,
    indexs: [1, 0],
    value: [columns[0][1], columns[1][0]],
    values: columns,
  }));
  expect(onUpdateModelValue).not.toHaveBeenCalled();

  fireEvent.press(screen.getByTestId('up-toolbar-confirm'));

  expect(onUpdateModelValue).toHaveBeenCalledWith(['blue', 'Small']);
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
    indexs: [1, 0],
    value: [columns[0][1], columns[1][0]],
    values: columns,
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

  act(() => {
    UP.setConfig({ props: { picker: { columns: [['Configured']], title: 'Configured title' } } });
  });
  expect(screen.getByText('Configured')).toBeTruthy();
  expect(screen.getByText('Configured title')).toBeTruthy();

  screen.rerender(
    <UPRoot><UPPicker columns={[['Explicit']]} show title="Explicit title" /></UPRoot>,
  );
  expect(screen.getByText('Explicit')).toBeTruthy();
  expect(screen.getByText('Explicit title')).toBeTruthy();
});

it('restores the confirmed draft on cancel and permitted overlay close', () => {
  const onCancel = jest.fn();
  const onClose = jest.fn();
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(
    <UPPicker
      closeOnClickOverlay
      columns={columns}
      modelValue={['red', 'Small']}
      onCancel={onCancel}
      onClose={onClose}
      onUpdateModelValue={onUpdateModelValue}
      show
    />,
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
    <UPPicker
      columns={columns}
      immediateChange={false}
      maskClass="mask"
      maskStyle="background:red"
      onChange={onChange}
      show
    />,
  );

  fireEvent(screen.getByTestId('up-picker-column-1'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0, y: 44 } },
  });
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ columnIndex: 1, index: 1 }));
  expect(screen.getByTestId('up-picker-selection-band')).toBeTruthy();
});

it('bridges picker-data object values and preserves the confirmed value', () => {
  const onUpdateModelValue = jest.fn();
  const onConfirm = jest.fn();
  const screen = renderRoot(
    <UPPickerData
      modelValue={2}
      onConfirm={onConfirm}
      onUpdateModelValue={onUpdateModelValue}
      options={[{ id: 0, name: 'None' }, { id: 2, name: 'Two' }]}
    />,
  );

  expect(screen.getByDisplayValue('Two')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-picker-data'));
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
    <UPSelect
      current="first"
      onSelect={onSelect}
      onUpdateCurrent={onUpdateCurrent}
      options={options}
      showOptionsLabel
    />,
  );

  expect(screen.getByText('First')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-select-trigger'));
  expect(screen.getByTestId('up-select-menu')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-select-option-1'));
  expect(onUpdateCurrent).toHaveBeenCalledWith('second');
  expect(onSelect).toHaveBeenCalledWith(options[1]);
});

it('falls back to the select label when showOptionsLabel has nothing selected', () => {
  // `showOptionsLabel` swaps the label for the *selected* option's text. With no
  // selection there is no such text, and returning it unguarded left the trigger
  // completely blank — SelectDemo rendered three chevrons and no words on device.
  const screen = renderRoot(
    <UPSelect
      current=""
      label="分类"
      options={[{ id: '1', name: '分类1' }]}
      showOptionsLabel
    />,
  );

  expect(screen.getByText('分类')).toBeTruthy();
});

it('honors select disabled and render replacement contracts', () => {
  const screen = renderRoot(
    <UPSelect
      border
      current="a"
      disabled
      icon={<Text>Custom icon</Text>}
      itemColor="#112233"
      options={[{ id: 'a', name: 'Alpha' }]}
      renderOption={(item) => <Text>{`Option:${String(item.name)}`}</Text>}
      renderText={(label) => <Text>{`Current:${label}`}</Text>}
      showOptionsLabel
    />,
  );

  expect(screen.getByText('Current:Alpha')).toBeTruthy();
  expect(screen.getByText('Custom icon')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-select-trigger'));
  expect(screen.queryByTestId('up-select-menu')).toBeNull();
});
