import React, { useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { UPInput } from '../input';
import { UPPicker } from './UPPicker';

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
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  onUpdateModelValue?: (value: string | number | undefined) => void;
};

export function UPPickerData(input: UPPickerDataProps): React.JSX.Element {
  const [show, setShow] = useState(false);
  const options = input.options ?? [];
  const valueKey = input.valueKey ?? 'id';
  const labelKey = input.labelKey ?? 'name';
  const current = useMemo(
    () => options.find((option) => option[valueKey] === input.modelValue),
    [input.modelValue, options, valueKey],
  );
  const label = current === undefined ? '' : String(current[labelKey] ?? '');
  const trigger = typeof input.trigger === 'function' ? input.trigger(label) : input.trigger;

  return (
    <View style={input.customStyle}>
      <Pressable accessibilityRole="button" onPress={() => setShow(true)} testID="up-picker-data">
        {trigger ?? <UPInput border="none" placeholder={input.title} readonly value={label} />}
      </Pressable>
      <UPPicker
        columns={[options]}
        keyName={labelKey}
        modelValue={input.modelValue === undefined ? undefined : [input.modelValue]}
        onCancel={() => {
          setShow(false);
          input.onCancel?.();
        }}
        onChangeShow={setShow}
        onClose={() => {
          setShow(false);
          input.onClose?.();
        }}
        onConfirm={(payload) => {
          const selected = payload.value[0] as UPPickerDataOption | undefined;
          input.onUpdateModelValue?.(selected?.[valueKey] as string | number | undefined);
          setShow(false);
          input.onConfirm?.();
        }}
        show={show}
        title={input.title}
        valueName={valueKey}
      />
    </View>
  );
}
