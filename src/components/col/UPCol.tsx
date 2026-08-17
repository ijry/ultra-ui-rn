import React from 'react';
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPRowContext } from '../layout-context';

export type UPColProps = {
  span?: number | string;
  offset?: number | string;
  justify?: 'start' | 'end' | 'center' | 'around' | 'between' | ViewStyle['justifyContent'];
  align?: 'top' | 'center' | 'bottom' | 'stretch' | ViewStyle['alignItems'];
  textAlign?: 'left' | 'center' | 'right';
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
};

function resolveJustify(value: string | undefined): ViewStyle['justifyContent'] {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  if (value === 'around') return 'space-around';
  if (value === 'between') return 'space-between';
  return value as ViewStyle['justifyContent'];
}

function resolveAlign(value: string | undefined): ViewStyle['alignItems'] {
  if (value === 'top') return 'flex-start';
  if (value === 'bottom') return 'flex-end';
  return value as ViewStyle['alignItems'];
}

export function UPCol(input: UPColProps): React.JSX.Element {
  const props = { ...useUPConfig().props.col, ...input };
  const { gutter } = useUPRowContext();
  const span = Math.max(0, Math.min(12, Number(props.span)));
  const offset = Math.max(0, Math.min(12, Number(props.offset)));
  const percentage = `${(span / 12) * 100}%` as `${number}%`;
  const style: ViewStyle = {
    alignItems: resolveAlign(props.align),
    flexBasis: percentage,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: resolveJustify(props.justify),
    marginLeft: offset ? (`${(offset / 12) * 100}%` as `${number}%`) : undefined,
    maxWidth: percentage,
    paddingHorizontal: gutter ? gutter / 2 : undefined,
  };
  if (!input.onClick) {
    return <View style={[style, input.customStyle]} testID="up-col">{input.children}</View>;
  }
  return (
    <Pressable accessibilityRole="button" onPress={input.onClick} style={[style, input.customStyle]} testID="up-col">
      {input.children}
    </Pressable>
  );
}
