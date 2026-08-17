import React from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPGridContext } from '../layout-context';

export type UPGridItemProps = {
  name?: string | number | null;
  bgColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (name: string | number) => void;
  /** @internal Provided by `UPGrid` for source index behavior. */
  _upGridIndex?: number;
};

export function UPGridItem(input: UPGridItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.gridItem, ...input };
  const context = useUPGridContext();
  const itemIndex = input._upGridIndex ?? 0;
  const col = context?.col ?? 1;
  const count = context?.count ?? 1;
  const inferredIndex = itemIndex;
  const name = props.name ?? inferredIndex;
  const isLastColumn = (inferredIndex + 1) % col === 0 || inferredIndex + 1 === count;
  const finalRowLength = count % col || col;
  const isLastRow = inferredIndex >= count - finalRowLength;
  const percentage = `${100 / col}%` as `${number}%`;
  const style: ViewStyle = {
    alignItems: 'center',
    backgroundColor: props.bgColor,
    borderBottomColor: '#dadbde',
    borderBottomWidth: context?.border && !isLastRow ? 0.5 : 0,
    borderRightColor: '#dadbde',
    borderRightWidth: context?.border && !isLastColumn ? 0.5 : 0,
    flexBasis: percentage,
    justifyContent: 'center',
    maxWidth: percentage,
  };
  const onPress = () => {
    input.onClick?.(name);
    context?.onItemClick?.(name);
  };
  if (!input.onClick && !context?.onItemClick) {
    return <View style={[style, input.customStyle]} testID={`up-grid-item-${inferredIndex}`}>{input.children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[style, input.customStyle]}
      testID={`up-grid-item-${inferredIndex}`}
    >
      {input.children}
    </Pressable>
  );
}
