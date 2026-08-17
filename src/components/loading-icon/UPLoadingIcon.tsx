import React from 'react';
import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPLoadingIconProps = {
  show?: boolean;
  color?: string;
  textColor?: string;
  vertical?: boolean;
  /** @deprecated React Native maps all source modes to ActivityIndicator. */
  mode?: 'spinner' | 'circle' | 'semicircle';
  size?: UPDimension;
  textSize?: UPDimension;
  text?: string | number;
  /** @deprecated Native ActivityIndicator timing is platform-owned. */
  timingFunction?: string;
  /** @deprecated Native ActivityIndicator timing is platform-owned. */
  duration?: UPDimension;
  /** @deprecated Native ActivityIndicator has no inactive ring color. */
  inactiveColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPLoadingIcon(input: UPLoadingIconProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.loadingIcon, ...input } as UPLoadingIconProps;
  if (!props.show) return null;
  const size = getPx(props.size ?? 24);
  return (
    <View style={[{ alignItems: 'center', flexDirection: props.vertical ? 'column' : 'row', justifyContent: 'center' }, input.customStyle]} testID="up-loading-icon">
      <ActivityIndicator color={props.color} size={size >= 28 ? 'large' : 'small'} />
      {props.text !== '' ? <Text style={{ color: props.textColor, fontSize: getPx(props.textSize ?? 15), marginLeft: props.vertical ? 0 : 5, marginTop: props.vertical ? 5 : 0 }}>{props.text}</Text> : null}
    </View>
  );
}
