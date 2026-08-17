import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPInput } from '../input';
import { UPPicker, type UPPickerChangePayload } from '../picker';
import {
  changeDatetimePickerState,
  createDatetimePickerState,
  formatDatetimePickerValue,
} from './datetime-data';
import type {
  UPDatetimePickerDataOptions,
  UPDatetimePickerProps,
  UPDatetimePickerState,
} from './types';

export type { UPDatetimePickerProps } from './types';

function pickerValues(state: UPDatetimePickerState): number[] {
  return state.columns.map((column, index) => (
    column[state.indexs[index] ?? 0]?.value ?? column[0]?.value ?? 0
  ));
}

export function UPDatetimePicker(input: UPDatetimePickerProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.datetimePicker, ...input } as UPDatetimePickerProps;
  const externalValue = input.modelValue ?? input.value ?? props.minDate;
  const dataOptions = useMemo<UPDatetimePickerDataOptions>(() => ({
    filter: props.filter,
    formatter: props.formatter,
    maxDate: props.maxDate,
    maxHour: props.maxHour,
    maxMinute: props.maxMinute,
    maxSecond: props.maxSecond,
    minDate: props.minDate,
    minHour: props.minHour,
    minMinute: props.minMinute,
    minSecond: props.minSecond,
    mode: props.mode,
    value: externalValue,
  }), [
    externalValue, props.filter, props.formatter, props.maxDate, props.maxHour, props.maxMinute,
    props.maxSecond, props.minDate, props.minHour, props.minMinute, props.minSecond, props.mode,
  ]);
  const initialState = useMemo(() => createDatetimePickerState(dataOptions), [dataOptions]);
  const [draft, setDraft] = useState(initialState);
  const draftRef = useRef(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    draftRef.current = initialState;
    setDraft(initialState);
  }, [initialState]);

  const handleChange = useCallback((payload: UPPickerChangePayload) => {
    const next = changeDatetimePickerState(
      draftRef.current,
      payload.columnIndex,
      payload.index,
      dataOptions,
    );
    draftRef.current = next;
    setDraft(next);
    input.onChange?.({ mode: dataOptions.mode ?? 'datetime', value: next.value });
    input.onInput?.(next.value);
  }, [dataOptions, input]);

  const handleConfirm = useCallback(() => {
    const value = draftRef.current.value;
    const mode = dataOptions.mode ?? 'datetime';
    input.onUpdateModelValue?.(value);
    input.onConfirm?.({ mode, value });
    input.onChangeShow?.(false);
  }, [dataOptions.mode, input]);

  const inputLabel = formatDatetimePickerValue(draft.value, props.mode ?? 'datetime', props.format);
  const inputTrigger = props.hasInput ? (
    <View testID="up-datetime-picker-input">
      <UPInput
        {...props.inputProps}
        border={props.inputBorder}
        disabled={props.disabled}
        disabledColor={props.disabledColor}
        placeholder={props.placeholder}
        readonly
        value={inputLabel}
      />
    </View>
  ) : undefined;

  return (
    <View style={input.customStyle} testID="up-datetime-picker">
      <UPPicker
        bgColor={props.bgColor}
        cancelColor={props.cancelColor}
        cancelText={props.cancelText}
        closeOnClickOverlay={props.closeOnClickOverlay}
        closeOnConfirm={false}
        columns={draft.columns}
        confirmColor={props.confirmColor}
        confirmText={props.confirmText}
        defaultIndex={draft.indexs}
        disabled={props.disabled}
        disabledColor={props.disabledColor}
        duration={props.duration}
        hasInput={props.hasInput}
        inputBorder={props.inputBorder}
        inputProps={props.inputProps}
        itemHeight={props.itemHeight}
        keyName="text"
        loading={props.loading}
        modelValue={pickerValues(draft)}
        onCancel={input.onCancel}
        onChange={handleChange}
        onChangeShow={input.onChangeShow}
        onClose={input.onClose}
        onConfirm={handleConfirm}
        overlayOpacity={props.overlayOpacity}
        pageInline={props.pageInline}
        placeholder={props.placeholder}
        popupMode={props.popupMode}
        round={props.round}
        show={props.show}
        showToolbar={props.showToolbar}
        title={props.title}
        toolbarBottom={props.toolbarBottom}
        toolbarRight={props.toolbarRight}
        toolbarRightSlot={props.toolbarRightSlot}
        trigger={input.trigger ?? inputTrigger}
        valueName="value"
        visibleItemCount={props.visibleItemCount}
        zIndex={props.zIndex}
      />
    </View>
  );
}
