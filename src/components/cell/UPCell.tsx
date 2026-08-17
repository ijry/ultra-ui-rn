import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { UPIcon } from '../icon';
import { UPLine } from '../line';

export type UPCellProps = {
  title?: string | number;
  label?: string | number;
  value?: string | number;
  icon?: string;
  disabled?: boolean;
  border?: boolean;
  center?: boolean;
  /** @deprecated Navigation is app-owned in React Native. */
  url?: string;
  /** @deprecated Navigation is app-owned in React Native. */
  linkType?: string;
  clickable?: boolean;
  isLink?: boolean;
  required?: boolean;
  rightIcon?: string;
  arrowDirection?: 'left' | 'up' | 'down' | '';
  iconStyle?: StyleProp<TextStyle>;
  rightIconStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  size?: 'large' | '';
  /** @deprecated React Native press propagation differs from uni-app. */
  stop?: boolean;
  name?: string | number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  iconNode?: React.ReactNode;
  titleNode?: React.ReactNode;
  labelNode?: React.ReactNode;
  valueNode?: React.ReactNode;
  rightIconNode?: React.ReactNode;
  onClick?: (payload: { name: string | number }) => void;
};

function rotation(direction: string | undefined): string | undefined {
  if (direction === 'up') return '-90deg';
  if (direction === 'down') return '90deg';
  if (direction === 'left') return '180deg';
  return undefined;
}

export function UPCell(input: UPCellProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.cell, ...input };
  const { colors } = useUPTheme();
  const large = props.size === 'large';
  const iconStyle = StyleSheet.flatten(input.iconStyle);
  const rightIconStyle = StyleSheet.flatten(input.rightIconStyle);
  const titleStyle = StyleSheet.flatten(input.titleStyle);
  const arrowRotation = rotation(props.arrowDirection);
  const interactive = !props.disabled && (Boolean(input.onClick) || props.clickable || props.isLink);
  const body = (
    <View
      style={{
        alignItems: props.center ? 'center' : 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 13,
      }}
      testID="up-cell-body"
    >
      {input.iconNode ?? (props.icon ? (
        <View style={{ marginRight: 4 }}>
          <UPIcon customStyle={iconStyle} name={props.icon} size={large ? 22 : 18} />
        </View>
      ) : null)}
      <View style={{ flex: 1, justifyContent: props.center ? 'center' : 'flex-start' }}>
        {input.titleNode ?? (props.title !== '' ? (
          <View style={{ flexDirection: 'row' }}>
            {props.required ? <Text style={{ color: colors.error, fontSize: 14, marginRight: 3 }}>*</Text> : null}
            <Text
              style={[
                {
                  color: props.disabled ? colors.disabledColor : colors.mainColor,
                  fontSize: large ? 16 : 15,
                  lineHeight: 22,
                },
                titleStyle,
              ]}
            >
              {props.title}
            </Text>
          </View>
        ) : null)}
        {input.labelNode ?? (props.label !== '' ? (
          <Text
            style={{
              color: props.disabled ? colors.disabledColor : colors.tipsColor,
              fontSize: large ? 14 : 12,
              lineHeight: 18,
              marginTop: 5,
            }}
          >
            {props.label}
          </Text>
        ) : null)}
      </View>
      {input.valueNode ?? (props.value !== '' ? (
        <Text
          style={{
            alignSelf: props.center ? 'center' : 'flex-start',
            color: props.disabled ? colors.disabledColor : colors.contentColor,
            fontSize: large ? 15 : 14,
            lineHeight: 24,
            marginLeft: 8,
            textAlign: 'right',
          }}
        >
          {props.value}
        </Text>
      ) : null)}
      {props.isLink || input.rightIconNode ? (
        <View style={{ alignSelf: 'center', marginLeft: 4 }} testID="up-cell-right-icon">
          {input.rightIconNode ?? (
            <UPIcon
              color={props.disabled ? colors.disabledColor : 'info'}
              customStyle={[
                rightIconStyle,
                arrowRotation ? { transform: [{ rotate: arrowRotation }] } : null,
              ]}
              name={props.rightIcon}
              size={large ? 18 : 16}
              top={0}
            />
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled || !interactive}
      onPress={() => input.onClick?.({ name: props.name })}
      style={({ pressed }) => [
        pressed && interactive ? { backgroundColor: '#f1f1f1' } : null,
        input.customStyle,
      ]}
      testID="up-cell"
    >
      {body}
      {props.border ? <UPLine testID="up-cell-border" /> : null}
    </Pressable>
  );
}
