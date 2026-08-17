import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPGridContext } from '../layout-context';

export type UPGridProps = {
  col?: number | string;
  border?: boolean;
  align?: 'left' | 'center' | 'right';
  gap?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (name: string | number) => void;
};

export function UPGrid(input: UPGridProps): React.JSX.Element {
  const props = { ...useUPConfig().props.grid, ...input };
  const children = React.Children.toArray(input.children);
  const col = Math.max(1, Number(props.col));
  const justifyContent = props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <UPGridContext.Provider
      value={{ border: props.border, col, count: children.length, onItemClick: input.onClick }}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: input.gap === undefined ? 0 : getPx(input.gap),
            justifyContent,
          },
          input.customStyle,
        ]}
        testID="up-grid"
      >
        {children.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ _upGridIndex?: number }>, {
                _upGridIndex: index,
              })
            : child,
        )}
      </View>
    </UPGridContext.Provider>
  );
}
