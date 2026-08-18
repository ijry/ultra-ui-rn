import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPLoadingIcon } from '../loading-icon';
import { UPOverlay } from '../overlay';

export type UPToastType = '' | 'primary' | 'success' | 'error' | 'warning' | 'default' | 'loading';

export type UPToastOptions = {
  zIndex?: number;
  loading?: boolean;
  message?: string | number;
  icon?: boolean | string;
  type?: UPToastType;
  /** @deprecated React Native uses the system loading indicator. */
  loadingMode?: string;
  show?: boolean;
  overlay?: boolean;
  position?: 'top' | 'center' | 'bottom';
  /** @deprecated Navigation params are application-owned in React Native. */
  params?: Record<string, unknown>;
  duration?: UPDimension;
  /** @deprecated Navigation target type is application-owned in React Native. */
  isTab?: boolean;
  /** @deprecated Navigation is application-owned in React Native. */
  url?: string;
  complete?: () => void;
  /** @deprecated Navigation is application-owned in React Native. */
  back?: boolean;
  customStyle?: StyleProp<ViewStyle>;
};

export type UPToastProps = UPToastOptions & {
  onChangeShow?: (show: boolean) => void;
};

const typeIcons: Record<Exclude<UPToastType, '' | 'default' | 'loading'>, string> = {
  error: 'close-circle',
  primary: 'info-circle',
  success: 'checkmark-circle',
  warning: 'error-circle',
};

export type UPToastRef = {
  /** Imperatively show a toast with options (source `show`). */
  show: (options: UPToastOptions) => void;
};

export const UPToast = forwardRef<UPToastRef, UPToastProps>(function UPToast(input, ref) {
  const props = { ...useUPConfig().props.toast, ...input } as UPToastProps;
  const { colors } = useUPTheme();
  const [imperative, setImperative] = useState<UPToastOptions | null>(null);
  const duration = getPx(props.duration ?? 2000);
  const showing = Boolean(props.show) || imperative !== null;
  const show = useCallback((options: UPToastOptions) => {
    setImperative(options);
    input.onChangeShow?.(true);
  }, [input]);
  useImperativeHandle(ref, () => ({ show }), [show]);

  useEffect(() => {
    if (!showing || duration <= 0) return;
    const timer = setTimeout(() => {
      setImperative(null);
      input.onChangeShow?.(false);
      input.complete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, input, showing]);

  if (!showing) return null;
  const effective = { ...props, ...imperative } as UPToastProps;
  const type = effective.type ?? '';
  const loading = Boolean(effective.loading || type === 'loading');
  const iconName = typeof effective.icon === 'string'
    ? effective.icon
    : effective.icon === false
      ? ''
      : typeIcons[type as keyof typeof typeIcons] ?? '';
  const typeColor = type && type in colors ? colors[type as keyof typeof colors] : '#ffffff';
  const offset = effective.position === 'top' ? -140 : effective.position === 'bottom' ? 140 : 0;
  return (
    <View pointerEvents={effective.overlay ? 'auto' : 'box-none'} style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: effective.zIndex }} testID="up-toast">
      {effective.overlay ? <UPOverlay opacity={0} show zIndex={effective.zIndex} /> : null}
      <View pointerEvents="box-none" style={{ alignItems: 'center', flex: 1, justifyContent: 'center', transform: [{ translateY: offset }] }}>
        <View style={[{ alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.78)', borderRadius: 6, flexDirection: loading ? 'column' : 'row', maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12 }, effective.customStyle]}>
          {loading ? <UPLoadingIcon color="#ffffff" show size={25} /> : iconName ? <UPIcon color={typeColor} name={iconName} size={18} /> : null}
          {effective.message !== '' ? <Text style={{ color: '#ffffff', fontSize: 14, marginLeft: loading || !iconName ? 0 : 5, marginTop: loading ? 8 : 0, textAlign: 'center' }}>{effective.message}</Text> : null}
        </View>
      </View>
    </View>
  );
});
