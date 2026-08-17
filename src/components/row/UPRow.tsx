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
import { UPRowContext } from '../layout-context';

export type UPRowProps = {
  gutter?: UPDimension;
  justify?: 'start' | 'end' | 'center' | 'around' | 'between' | ViewStyle['justifyContent'];
  align?: 'top' | 'center' | 'bottom' | ViewStyle['alignItems'];
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

export function UPRow(input: UPRowProps): React.JSX.Element {
  const props = { ...useUPConfig().props.row, ...input };
  const gutter = getPx(props.gutter);
  const style: ViewStyle = {
    alignItems: resolveAlign(props.align),
    flexDirection: 'row',
    justifyContent: resolveJustify(props.justify),
    marginHorizontal: gutter ? -gutter / 2 : undefined,
  };
  const content = <UPRowContext.Provider value={{ gutter }}>{input.children}</UPRowContext.Provider>;
  if (!input.onClick) {
    return <View style={[style, input.customStyle]} testID="up-row">{content}</View>;
  }
  return (
    <Pressable accessibilityRole="button" onPress={input.onClick} style={[style, input.customStyle]} testID="up-row">
      {content}
    </Pressable>
  );
}
