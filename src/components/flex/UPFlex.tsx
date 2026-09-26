import React from 'react';
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type UPFlexJustify =
  | 'flex-start' | 'flex-end' | 'center'
  | 'space-between' | 'space-around' | 'space-evenly';
export type UPFlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

/** Accepted for cross-platform parity; not rendered on RN (glass is iOS/Android-only). */
export type UPFlexGlass = {
  enabled?: boolean;
  variant?: 'regular' | 'clear';
  tint?: string;
  interactive?: boolean;
  cornerRadius?: UPDimension;
};

export type UPFlexProps = {
  direction?: UPFlexDirection;
  justify?: UPFlexJustify | 'start' | 'end';
  align?: UPFlexAlign;
  wrap?: boolean;
  gap?: UPDimension;
  glass?: UPFlexGlass;
  customStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
};

function resolveJustify(value: string | undefined): ViewStyle['justifyContent'] {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value as ViewStyle['justifyContent'];
}

export function UPFlex(input: UPFlexProps): React.JSX.Element {
  const props = { ...useUPConfig().props.flex, ...input };
  const gap = getPx(props.gap as UPDimension);
  const style: ViewStyle = {
    flexDirection: props.direction as ViewStyle['flexDirection'],
    justifyContent: resolveJustify(props.justify as string),
    alignItems: props.align as ViewStyle['alignItems'],
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    gap: gap || undefined,
  };
  if (!input.onClick) {
    return (
      <View style={[style, input.customStyle]} testID="up-flex">
        {input.children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={input.onClick}
      style={[style, input.customStyle]}
      testID="up-flex"
    >
      {input.children}
    </Pressable>
  );
}
