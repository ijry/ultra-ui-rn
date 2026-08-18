import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
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

export type UPNotifyRef = {
  /** Imperatively show a notify with options (source `show`). */
  show: (options: UPNotifyOptions) => void;
  /** Imperatively close the notify (source `close`). */
  close: () => void;
};

export const UPNotify = forwardRef<UPNotifyRef, UPNotifyProps>(function UPNotify(input, ref) {
  const props = { ...useUPConfig().props.notify, ...input } as UPNotifyProps;
  const { colors } = useUPTheme();
  const insets = useSafeAreaInsets();
  const [imperative, setImperative] = useState<UPNotifyOptions | null>(null);
  const duration = getPx(props.duration ?? 3000);
  const showing = Boolean(props.show) || imperative !== null;
  const show = useCallback((options: UPNotifyOptions) => {
    setImperative(options);
    input.onChangeShow?.(true);
  }, [input]);
  const close = useCallback(() => {
    setImperative(null);
    input.onChangeShow?.(false);
  }, [input]);
  useImperativeHandle(ref, () => ({ close, show }), [close, show]);
  useEffect(() => {
    if (!showing || duration <= 0) return;
    const timer = setTimeout(() => {
      setImperative(null);
      input.onChangeShow?.(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, input, showing]);
  if (!showing) return null;
  const effective = { ...props, ...imperative } as UPNotifyProps;
  const type = effective.type ?? 'primary';
  return (
    <View style={[{ alignItems: 'center', backgroundColor: effective.bgColor || colors[type], flexDirection: 'row', left: 0, minHeight: 40, paddingHorizontal: 10, paddingVertical: 8, position: 'absolute', right: 0, top: getPx(effective.top ?? 0) + (effective.safeAreaInsetTop ? insets.top : 0), zIndex: 10076 }, effective.customStyle]} testID="up-notify">
      {type !== 'primary' ? <UPIcon color={effective.color} name={icons[type]} size={17} /> : null}
      <Text style={{ color: effective.color, flex: 1, fontSize: getPx(effective.fontSize ?? 15), marginLeft: type === 'primary' ? 0 : 5, textAlign: 'center' }}>{effective.message}</Text>
    </View>
  );
});
