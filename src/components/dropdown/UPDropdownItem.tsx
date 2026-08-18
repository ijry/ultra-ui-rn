import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { useUPDropdownContext } from './context';

export type UPDropdownValue = string | number | readonly (string | number)[];

export type UPDropdownOption = {
  label: string | number;
  value: UPDropdownValue;
};

export type UPDropdownItemProps = {
  modelValue?: UPDropdownValue;
  value?: UPDropdownValue;
  title?: string | number;
  options?: readonly UPDropdownOption[];
  disabled?: boolean;
  height?: UPDimension | 'auto';
  closeOnClickOverlay?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onUpdateModelValue?: (value: UPDropdownValue) => void;
  onChange?: (value: UPDropdownValue) => void;
  onInput?: (value: UPDropdownValue) => void;
  itemIndex?: number;
};

let dropdownItemSequence = 0;

export function UPDropdownItem(input: UPDropdownItemProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.dropdownItem, ...input } as UPDropdownItemProps;
  const dropdown = useUPDropdownContext();
  const activeColor = dropdown?.activeColor;
  const close = dropdown?.close;
  const inactiveColor = dropdown?.inactiveColor;
  const register = dropdown?.register;
  const id = useRef(`up-dropdown-item-${dropdownItemSequence++}`).current;
  const itemIndex = input.itemIndex ?? 0;
  const controlledValue = input.modelValue !== undefined
    ? input.modelValue
    : input.value !== undefined
      ? input.value
      : undefined;
  const [localValue, setLocalValue] = useState<UPDropdownValue>(props.modelValue ?? '');
  const currentValue = controlledValue === undefined ? localValue : controlledValue;
  const options = props.options ?? [];
  const hasCustomChildren = input.children !== null && input.children !== undefined;

  const panel = useMemo(() => {
    if (!activeColor || !close || !inactiveColor) return null;
    if (hasCustomChildren) {
      return <View style={{ backgroundColor: '#ffffff' }}>{input.children}</View>;
    }

    const maxHeight = props.height === 'auto' ? undefined : getPx(props.height ?? 'auto');
    return (
      <ScrollView
        style={{ backgroundColor: '#ffffff', maxHeight }}
        testID={`up-dropdown-options-${itemIndex}`}
      >
        <View style={input.customStyle}>
          {options.map((option, optionIndex) => {
            const selected = currentValue == option.value;
            return (
              <Pressable
                accessibilityRole="button"
                key={`${String(option.value)}-${optionIndex}`}
                onPress={() => {
                  if (controlledValue === undefined) setLocalValue(option.value);
                  input.onUpdateModelValue?.(option.value);
                  input.onChange?.(option.value);
                  input.onInput?.(option.value);
                  close();
                }}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  minHeight: 48,
                  paddingHorizontal: 15,
                }}
                testID={`up-dropdown-option-${itemIndex}-${optionIndex}`}
              >
                <Text style={{ color: selected ? activeColor : inactiveColor, fontSize: 15 }}>
                  {String(option.label)}
                </Text>
                {selected ? <UPIcon color={activeColor} name="checkbox-mark" size={16} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }, [
    controlledValue,
    currentValue,
    activeColor,
    close,
    hasCustomChildren,
    input.children,
    input.customStyle,
    input.onChange,
    input.onInput,
    input.onUpdateModelValue,
    itemIndex,
    inactiveColor,
    options,
    props.height,
  ]);

  useEffect(() => {
    if (!register || panel === null) return undefined;
    return register({
      closeOnClickOverlay: Boolean(props.closeOnClickOverlay),
      disabled: Boolean(props.disabled),
      id,
      index: itemIndex,
      node: panel,
      title: props.title ?? '',
    });
  }, [id, itemIndex, panel, props.closeOnClickOverlay, props.disabled, props.title, register]);

  return null;
}
