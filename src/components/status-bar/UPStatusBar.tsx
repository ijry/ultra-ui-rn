import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPStatusBarProps = {
  bgColor?: string;
  /** Source-compatible status bar height override. When omitted, uses the native top inset. */
  height?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onUpdateHeight?: (height: number) => void;
  children?: React.ReactNode;
};

export function UPStatusBar(input: UPStatusBarProps): React.JSX.Element {
  const props = { ...useUPConfig().props.statusBar, ...input };
  const insets = useSafeAreaInsets();
  const configuredHeight = input.height ?? props.height;
  const height = configuredHeight ? getPx(configuredHeight) : insets.top;

  useEffect(() => {
    input.onUpdateHeight?.(height);
  }, [height, input.onUpdateHeight]);

  return (
    <View
      style={[{ backgroundColor: props.bgColor, height, width: '100%' }, input.customStyle]}
      testID="up-status-bar"
    >
      {input.children}
    </View>
  );
}
