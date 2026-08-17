import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPDatetimePicker, UPPicker, UPRoot } from '../../src';
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
  const input = {
    maxDate: new Date(2024, 11, 31).getTime(),
    minDate: new Date(2024, 0, 1).getTime(),
    mode: 'date' as const,
  };
  const initial = createDatetimePickerState({ ...input, value: new Date(2024, 0, 31).getTime() });
  const februaryIndex = initial.columns[1]!.findIndex((option) => option.value === 2);
  const next = changeDatetimePickerState(initial, 1, februaryIndex, input);

  expect(formatDatetimePickerValue(next.value, 'date')).toBe('2024-02-29');
});

it('clamps time-only drafts and applies filter and formatter without changing option values', () => {
  const state = createDatetimePickerState({
    filter: (type, values) => type === 'minute' ? values.filter((value) => Number(value) % 15 === 0) : values,
    formatter: (type, value) => `${value}${type === 'hour' ? '时' : ''}`,
    maxHour: 18,
    maxMinute: 45,
    minHour: 9,
    minMinute: 15,
    mode: 'timesecond',
    value: '01:02:03',
  });

  expect(state.value).toBe('09:15:03');
  expect(state.columns).toHaveLength(3);
  expect(state.columns[0]?.[0]).toEqual({ text: '09时', type: 'hour', value: 9 });
  expect(state.columns[1]?.map((option) => option.value)).toEqual([15, 30, 45]);
  expect(state.columns[2]?.[0]?.type).toBe('second');
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

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source-shaped datetime callbacks in deterministic confirmation order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPDatetimePicker
      maxDate={new Date(2024, 11, 31).getTime()}
      minDate={new Date(2024, 0, 1).getTime()}
      mode="date"
      modelValue={new Date(2024, 0, 1).getTime()}
      onChange={({ mode }) => events.push(`change:${mode}`)}
      onChangeShow={(show) => events.push(`show:${show}`)}
      onConfirm={({ mode }) => events.push(`confirm:${mode}`)}
      onUpdateModelValue={() => events.push('update')}
      show
    />,
  );

  fireEvent.press(screen.getByTestId('up-picker-option-1-1'));
  expect(events).toEqual(['change:date']);
  fireEvent.press(screen.getByTestId('up-toolbar-confirm'));
  expect(events).toEqual(['change:date', 'update', 'confirm:date', 'show:false']);
});

it('uses input labels, controlled rerendering, and configured defaults', () => {
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

  screen.rerender(
    <UPRoot>
      <UPDatetimePicker hasInput mode="date" modelValue={new Date(2024, 5, 8).getTime()} />
    </UPRoot>,
  );
  expect(screen.getByDisplayValue('2024-06-08')).toBeTruthy();

  act(() => {
    UP.setConfig({ props: { datetimePicker: { title: 'Configured title' } } });
  });
  expect(screen.getByText('Configured title')).toBeTruthy();
  screen.rerender(
    <UPRoot>
      <UPDatetimePicker hasInput mode="date" modelValue={new Date(2024, 5, 8).getTime()} title="Explicit title" />
    </UPRoot>,
  );
  expect(screen.getByText('Explicit title')).toBeTruthy();
});

it('keeps time source strings and forwards cancellation', () => {
  const onCancel = jest.fn();
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(
    <UPDatetimePicker
      minHour={9}
      mode="timesecond"
      modelValue="09:10:11"
      onCancel={onCancel}
      onUpdateModelValue={onUpdateModelValue}
      show
    />,
  );

  expect(screen.getByTestId('up-picker-option-2-11')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-toolbar-cancel'));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onUpdateModelValue).not.toHaveBeenCalled();
});

it('fires source input alias with the selected value', () => {
  const onInput = jest.fn();
  const screen = renderRoot(
    <UPDatetimePicker mode="date" onInput={onInput} show showToolbar />,
  );
  fireEvent.press(screen.getByTestId('up-picker-option-2-11'));
  expect(onInput).toHaveBeenCalledWith(expect.any(Number));
});
