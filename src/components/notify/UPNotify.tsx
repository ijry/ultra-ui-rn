import React, { useEffect } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPNotifyOptions = {
  top?: UPDimension;
  type?: 'primary' | 'success' | 'warning' | 'error';
  color?: string;
  bgColor?: string;
  message?: string;
  duration?: UPDimension;
  fontSize?: UPDimension;
  safeAreaInsetTop?: boolean;
  customStyle?: StyleProp<ViewStyle>;
};

export type UPNotifyProps = UPNotifyOptions & {
  show?: boolean;
  onChangeShow?: (show: boolean) => void;
};

const icons: Record<NonNullable<UPNotifyOptions['type']>, string> = {
  error: 'close-circle',
  primary: 'info-circle',
  success: 'checkmark-circle',
  warning: 'error-circle',
};

export function UPNotify(input: UPNotifyProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.notify, ...input } as UPNotifyProps;
  const { colors } = useUPTheme();
  const insets = useSafeAreaInsets();
  const duration = getPx(props.duration ?? 3000);
  const showing = Boolean(props.show);
  useEffect(() => {
    if (!showing || duration <= 0) return;
    const timer = setTimeout(() => input.onChangeShow?.(false), duration);
    return () => clearTimeout(timer);
  }, [duration, input, showing]);
  if (!showing) return null;
  const type = props.type ?? 'primary';
  return (
    <View style={[{ alignItems: 'center', backgroundColor: props.bgColor || colors[type], flexDirection: 'row', left: 0, minHeight: 40, paddingHorizontal: 10, paddingVertical: 8, position: 'absolute', right: 0, top: getPx(props.top ?? 0) + (props.safeAreaInsetTop ? insets.top : 0), zIndex: 10076 }, input.customStyle]} testID="up-notify">
      {type !== 'primary' ? <UPIcon color={props.color} name={icons[type]} size={17} /> : null}
      <Text style={{ color: props.color, flex: 1, fontSize: getPx(props.fontSize ?? 15), marginLeft: type === 'primary' ? 0 : 5, textAlign: 'center' }}>{props.message}</Text>
    </View>
  );
}
