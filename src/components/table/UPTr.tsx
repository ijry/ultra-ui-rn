import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type UPTrProps = {
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPTr(input: UPTrProps): React.JSX.Element {
  return <View style={[{ alignSelf: 'stretch', flexDirection: 'row' }, input.customStyle]} testID="up-tr">{input.children}</View>;
}
