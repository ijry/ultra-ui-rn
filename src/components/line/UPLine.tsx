import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { sourceSpacing } from '../shared';

export type UPLineProps = {
  color?: string;
  length?: UPDimension;
  direction?: 'row' | 'col';
  hairline?: boolean;
  margin?: UPDimension;
  dashed?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** Native testing/customization hook; not part of the uview source API. */
  testID?: string;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPLine(input: UPLineProps): React.JSX.Element {
  const props = { ...useUPConfig().props.line, ...input };
  const isRow = props.direction === 'row';
  const lineStyle: ViewStyle = {
    ...(sourceSpacing(props.margin) as ViewStyle),
    borderColor: props.color,
    borderStyle: props.dashed ? 'dashed' : 'solid',
    borderBottomWidth: isRow ? 1 : undefined,
    borderLeftWidth: isRow ? undefined : 1,
    height: isRow ? undefined : getPx(props.length),
    transform: props.hairline
      ? isRow
        ? [{ scaleY: 0.5 }]
        : [{ scaleX: 0.5 }]
      : undefined,
    width: isRow
      ? String(props.length).includes('%')
        ? (props.length as ViewStyle['width'])
        : getPx(props.length)
      : undefined,
  };

  return <View style={[lineStyle, input.customStyle]} testID={input.testID ?? 'up-line'} />;
}
