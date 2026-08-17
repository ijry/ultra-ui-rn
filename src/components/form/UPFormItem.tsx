import React, { useEffect, useState } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { getProperty, setProperty } from './UPForm';
import { type UPFormRule, useUPFormContext } from './context';

export type UPFormItemProps = {
  label?: string;
  prop?: string;
  rules?: UPFormRule[];
  borderBottom?: boolean | '';
  labelPosition?: 'left' | 'top' | '';
  labelWidth?: UPDimension | '';
  rightIcon?: string;
  leftIcon?: string;
  required?: boolean;
  leftIconStyle?: StyleProp<TextStyle> | string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  labelNode?: React.ReactNode;
  right?: React.ReactNode;
  error?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function UPFormItem(input: UPFormItemProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.formItem, ...input };
  const context = useUPFormContext();
  const { colors } = useUPTheme();
  const [message, setMessage] = useState('');
  const itemRules = (input.rules ?? []) as UPFormRule[];
  const labelPosition = props.labelPosition || context?.labelPosition || 'left';
  const labelWidth = getPx(props.labelWidth || context?.labelWidth || 45);
  const borderBottom = props.borderBottom === '' ? (context?.borderBottom ?? true) : Boolean(props.borderBottom);
  const errorType = context?.errorType ?? 'message';
  const errorColor = colors.error;

  useEffect(() => {
    if (!context || !props.prop) return;
    return context.registerItem({
      clearValidate: () => setMessage(''),
      prop: props.prop,
      resetField: () => {
        setProperty(context.model, props.prop, getProperty(context.originalModel, props.prop));
        setMessage('');
      },
      rules: itemRules,
      setMessage,
    });
  }, [context, props.prop, itemRules]);

  const label = input.labelNode ?? (props.label ? (
    <View style={{ alignItems: 'center', flexDirection: 'row', flex: 1 }}>
      {props.required ? <Text style={{ color: errorColor, fontSize: 18, marginRight: 3 }}>*</Text> : null}
      {props.leftIcon ? <UPIcon customStyle={typeof props.leftIconStyle === 'string' ? undefined : props.leftIconStyle} name={props.leftIcon} size={16} /> : null}
      <Text style={[{ color: colors.mainColor, flex: 1, fontSize: 15, textAlign: context?.labelAlign }, context?.labelStyle]}>{props.label}</Text>
    </View>
  ) : null);

  return (
    <View testID={`up-form-item-wrapper-${props.prop}`}>
      <Pressable onPress={input.onClick} style={[{ flexDirection: labelPosition === 'left' ? 'row' : 'column', paddingVertical: 10 }, input.customStyle]} testID={`up-form-item-${props.prop}`}>
        {label ? <View style={{ marginBottom: labelPosition === 'top' ? 5 : 0, width: labelPosition === 'left' ? labelWidth : undefined }}>{label}</View> : null}
        <View style={{ alignItems: 'center', flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>{input.children}</View>
          {input.right ?? (props.rightIcon ? <UPIcon color={colors.lightColor} name={props.rightIcon} size={18} /> : null)}
        </View>
      </Pressable>
      {message && errorType === 'message' ? input.error ?? <Text style={{ color: errorColor, fontSize: 12, marginLeft: labelPosition === 'left' ? labelWidth : 0 }}>{message}</Text> : null}
      {borderBottom ? <View style={[{ backgroundColor: message && errorType === 'border-bottom' ? errorColor : '#d6d7d9', height: 1, marginTop: message && errorType === 'message' ? 5 : 0 },]} testID={`up-form-item-${props.prop}-line`} /> : null}
    </View>
  );
}
