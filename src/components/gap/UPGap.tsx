import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPGapProps = {
  bgColor?: string;
  height?: UPDimension;
  marginTop?: UPDimension;
  marginBottom?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPGap(input: UPGapProps): React.JSX.Element {
  const props = { ...useUPConfig().props.gap, ...input };
  return (
    <View
      style={[
        {
          backgroundColor: props.bgColor,
          height: getPx(props.height),
          marginBottom: getPx(props.marginBottom),
          marginTop: getPx(props.marginTop),
        },
        input.customStyle,
      ]}
      testID="up-gap"
    />
  );
}
