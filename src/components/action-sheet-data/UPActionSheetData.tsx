import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPActionSheet, type UPActionSheetAction } from '../action-sheet';

export type UPActionSheetDataOption = Record<string, unknown>;

export type UPActionSheetDataProps = {
  modelValue?: string | number;
  /** RN binding alias: source `modelValue` maps to `value`. */
  value?: string | number;
  defaultValue?: string | number;
  title?: string;
  description?: string;
  options?: readonly UPActionSheetDataOption[];
  valueKey?: string;
  labelKey?: string;
  /** Source `trigger` slot: replaces the default disabled input trigger. */
  renderTrigger?: () => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (value: string | number) => void;
  /** Source `input` event: fires on every value change (same timing as `onChange`). */
  onInput?: (value: string | number) => void;
  onSelect?: (option: UPActionSheetDataOption) => void;
};

function resolveLabel(
  value: string | number | undefined,
  options: readonly UPActionSheetDataOption[],
  valueKey: string,
  labelKey: string,
): string {
  if (value === undefined || value === null || value === '') return '';
  const found = options.find((option) => option[valueKey] === value);
  return found ? String(found[labelKey] ?? '') : '';
}

export function UPActionSheetData(input: UPActionSheetDataProps): React.JSX.Element {
  const props = { ...useUPConfig().props.actionSheetData, ...input } as UPActionSheetDataProps;
  const options = props.options ?? [];
  const valueKey = props.valueKey ?? 'value';
  const labelKey = props.labelKey ?? 'name';
  const external = input.value ?? input.modelValue;
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(() => resolveLabel(external, options, valueKey, labelKey));

  useEffect(() => {
    setCurrent(resolveLabel(external, options, valueKey, labelKey));
  }, [external]);

  const select = (action: UPActionSheetAction) => {
    const nextValue = action[valueKey] as string | number;
    setCurrent(String(action[labelKey] ?? ''));
    input.onChange?.(nextValue);
    input.onInput?.(nextValue);
    input.onSelect?.(action);
    setShow(false);
  };

  return (
    <View style={input.customStyle} testID="up-action-sheet-data">
      <Pressable onPress={() => setShow(true)} testID="up-action-sheet-data-trigger">
        {props.renderTrigger ? (
          props.renderTrigger()
        ) : (
          <TextInput
            editable={false}
            placeholder={props.title}
            placeholderTextColor="#909399"
            style={{ color: '#303133', fontSize: 16, height: 44, paddingHorizontal: 12 }}
            testID="up-action-sheet-data-input"
            value={current}
          />
        )}
      </Pressable>
      <UPActionSheet
        actions={options}
        description={props.description}
        nameKey={labelKey}
        onChangeShow={(next) => setShow(next)}
        onSelect={select}
        show={show}
        title={props.title}
      />
    </View>
  );
}
