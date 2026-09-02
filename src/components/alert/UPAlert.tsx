import React, { useEffect, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

const lightBackgrounds = {
  error: '#FEF0F0',
  info: '#f4f4f5',
  primary: '#ecf5ff',
  success: '#f5fff0',
  warning: '#FDF6EC',
};

const typeIcons = {
  error: 'close-circle-fill',
  info: 'info-circle-fill',
  primary: 'more-circle-fill',
  success: 'checkmark-circle-fill',
  warning: 'error-circle-fill',
};

export type UPAlertProps = {
  title?: string;
  type?: keyof typeof typeIcons;
  description?: string;
  closable?: boolean;
  showIcon?: boolean;
  effect?: 'light' | 'dark';
  center?: boolean;
  fontSize?: UPDimension;
  /** @deprecated React Native Animated transitions replace CSS transition modes. */
  transitionMode?: string;
  duration?: number;
  icon?: string;
  value?: boolean;
  modelValue?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Source `close` slot: replaces the default close icon. */
  closeNode?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  onClose?: () => void;
  onClosed?: () => void;
  onUpdateModelValue?: (value: boolean) => void;
  onUpdateValue?: (value: boolean) => void;
};

export function UPAlert(input: UPAlertProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.alert, ...input } as UPAlertProps;
  const configuredValue = input.modelValue ?? input.value ?? props.value ?? true;
  const [show, setShow] = useState(configuredValue);
  const type = props.type ?? 'warning';

  useEffect(() => {
    setShow(configuredValue);
  }, [configuredValue]);
  useEffect(() => {
    if (!show || !props.duration || props.duration <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShow(false);
      input.onClose?.();
      input.onUpdateModelValue?.(false);
      input.onUpdateValue?.(false);
      input.onClosed?.();
    }, props.duration);
    return () => clearTimeout(timer);
  }, [input, props.duration, show]);

  if (!show) {
    return null;
  }

  const close = () => {
    setShow(false);
    input.onClose?.();
    input.onUpdateModelValue?.(false);
    input.onUpdateValue?.(false);
    input.onClosed?.();
  };
  const dark = props.effect === 'dark';
  const textColor = dark ? '#ffffff' : props.type === 'info' ? '#909399' : type === 'primary' ? '#3c9cff' : type === 'success' ? '#5ac725' : type === 'error' ? '#f56c6c' : '#f9ae3d';
  const fontSize = getPx(props.fontSize ?? 14);

  return (
    <Pressable
      accessibilityRole={input.onClick ? 'button' : undefined}
      onPress={input.onClick}
      style={[
        {
          alignItems: 'center',
          backgroundColor: dark ? textColor : lightBackgrounds[type],
          borderRadius: 4,
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 8,
          position: 'relative',
        },
        input.customStyle,
      ]}
      testID="up-alert"
    >
      {props.showIcon ? <View style={{ marginRight: 5 }}><UPIcon color={dark ? '#ffffff' : textColor} name={props.icon || typeIcons[type]} size={18} /></View> : null}
      <View style={{ flex: 1, paddingRight: props.closable ? 20 : 0 }}>
        {props.title ? <Text style={{ color: textColor, fontSize, fontWeight: '700', marginBottom: props.description ? 2 : 0, textAlign: props.center ? 'center' : 'left' }}>{props.title}</Text> : null}
        {props.description ? <Text style={{ color: textColor, fontSize, textAlign: props.center ? 'center' : 'left' }}>{props.description}</Text> : null}
      </View>
      {props.closable ? (
        <Pressable
          accessibilityLabel="Close alert"
          accessibilityRole="button"
          hitSlop={8}
          onPress={close}
          style={{ position: 'absolute', right: 10, top: 10 }}
          testID="up-alert-close"
        >
          {input.closeNode ?? (
            <UPIcon color={dark ? '#ffffff' : textColor} name="close" size={15} />
          )}
        </Pressable>
      ) : null}
    </Pressable>
  );
}
