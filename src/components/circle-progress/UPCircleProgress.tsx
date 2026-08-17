import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { range } from '../../utils';

export type UPCircleProgressProps = {
  percentage?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native core has no vector arc primitive; this is a border approximation. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPCircleProgress(input: UPCircleProgressProps): React.JSX.Element {
  const props = { ...useUPConfig().props.circleProgress, ...input } as UPCircleProgressProps;
  const percentage = range(0, 100, Number(props.percentage));
  const color = percentage > 0 ? '#42b983' : '#c8c8c8';
  return (
    <View style={[{ alignItems: 'center', backgroundColor: '#c8c8c8', borderRadius: 50, height: 100, justifyContent: 'center', overflow: 'hidden', width: 100 }, input.customStyle]} testID="up-circle-progress">
      <View style={{ backgroundColor: color, bottom: 0, height: `${percentage}%`, left: 0, position: 'absolute', right: 0 }} />
      <View style={{ alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 45, height: 90, justifyContent: 'center', width: 90 }}>
        {input.children ?? <Text style={{ color: '#606266', fontSize: 15 }}>{percentage}%</Text>}
      </View>
    </View>
  );
}
