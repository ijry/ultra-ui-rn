import React from 'react';
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { getPx, type UPDimension } from '../../utils';
import { sourceSpacing } from '../shared';

export type UPViewProps = {
  backgroundColor?: string;
  color?: string;
  flexDirection?: ViewStyle['flexDirection'];
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  flex1?: boolean | string | number;
  width?: UPDimension;
  height?: UPDimension;
  padding?: UPDimension;
  margin?: UPDimension;
  borderColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
};

function resolveSize(value: UPDimension | undefined): ViewStyle['width'] | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  return String(value).includes('%') ? (value as ViewStyle['width']) : getPx(value);
}

export function UPView(input: UPViewProps): React.JSX.Element {
  const style: ViewStyle = {
    alignItems: input.alignItems,
    backgroundColor: input.backgroundColor,
    borderColor: input.borderColor,
    flex: input.flex1 ? 1 : undefined,
    flexDirection: input.flexDirection,
    height: resolveSize(input.height) as ViewStyle['height'],
    justifyContent: input.justifyContent,
    width: resolveSize(input.width),
    ...(sourceSpacing(input.margin) as ViewStyle),
    ...(sourceSpacing(input.padding, 'padding') as ViewStyle),
  };
  if (!input.onClick) {
    return <View style={[style, input.customStyle]} testID="up-view">{input.children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={input.onClick}
      style={[style, input.customStyle]}
      testID="up-view"
    >
      {input.children}
    </Pressable>
  );
}
