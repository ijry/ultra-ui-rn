import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUPConfig } from '../../config/useUPConfig';

export type UPSafeBottomProps = {
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPSafeBottom(input: UPSafeBottomProps): React.JSX.Element {
  useUPConfig();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[{ height: insets.bottom, width: '100%' }, input.customStyle]}
      testID="up-safe-bottom"
    />
  );
}
