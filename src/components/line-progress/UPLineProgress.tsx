import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { range, getPx, type UPDimension } from '../../utils';

export type UPLineProgressProps = {
  activeColor?: string;
  inactiveColor?: string;
  percentage?: number | string;
  showText?: boolean;
  height?: UPDimension;
  fromRight?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPLineProgress(input: UPLineProgressProps): React.JSX.Element {
  const props = { ...useUPConfig().props.lineProgress, ...input } as UPLineProgressProps;
  const percentage = range(0, 100, Number(props.percentage));
  const height = getPx(props.height ?? 12);
  return (
    <View style={[{ backgroundColor: props.inactiveColor, borderRadius: 100, height, overflow: 'hidden', position: 'relative', width: '100%' }, input.customStyle]} testID="up-line-progress">
      <View style={{ alignItems: 'center', backgroundColor: props.activeColor, bottom: 0, height, justifyContent: 'center', [props.fromRight ? 'right' : 'left']: 0, position: 'absolute', top: 0, width: `${percentage}%` }} testID="up-line-progress-active">
        {input.children ?? (props.showText && percentage >= 10 ? <Text style={{ color: '#ffffff', fontSize: 10, marginRight: 5 }}>{percentage}%</Text> : null)}
      </View>
    </View>
  );
}
