import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type UPPickerColumnProps = {
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPPickerColumn(input: UPPickerColumnProps): React.JSX.Element {
  return (
    <View style={input.customStyle} testID="up-picker-column-compat">
      {input.children}
    </View>
  );
}
