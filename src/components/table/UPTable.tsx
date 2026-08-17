import React, { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPTableContext } from './context';

export type UPTableProps = {
  borderColor?: string;
  align?: 'left' | 'center' | 'right';
  padding?: UPDimension;
  fontSize?: UPDimension;
  color?: string;
  thStyle?: StyleProp<ViewStyle>;
  bgColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

function spacing(value: UPDimension): { horizontal: number; vertical: number } {
  const tokens = String(value).trim().split(/\s+/).filter(Boolean).map(getPx);
  if (!tokens.length) return { horizontal: 0, vertical: 0 };
  if (tokens.length === 1) return { horizontal: tokens[0], vertical: tokens[0] };
  if (tokens.length === 2) return { horizontal: tokens[1], vertical: tokens[0] };
  return { horizontal: tokens[1], vertical: tokens[0] };
}

export function UPTable(input: UPTableProps): React.JSX.Element {
  const props = { ...useUPConfig().props.table, ...input } as UPTableProps;
  const padding = spacing(props.padding ?? '5px 3px');
  const context = useMemo(
    () => ({
      align: props.align ?? 'center',
      bgColor: props.bgColor ?? '#ffffff',
      borderColor: props.borderColor ?? '#e4e7ed',
      color: props.color ?? '#606266',
      fontSize: getPx(props.fontSize ?? '14px'),
      paddingHorizontal: padding.horizontal,
      paddingVertical: padding.vertical,
      thStyle: props.thStyle,
    }),
    [padding.horizontal, padding.vertical, props.align, props.bgColor, props.borderColor, props.color, props.fontSize, props.thStyle],
  );
  return (
    <UPTableContext.Provider value={context}>
      <View
        style={[
          {
            backgroundColor: context.bgColor,
            borderLeftColor: context.borderColor,
            borderLeftWidth: 1,
            borderTopColor: context.borderColor,
            borderTopWidth: 1,
          },
          input.customStyle,
        ]}
        testID="up-table"
      >
        {input.children}
      </View>
    </UPTableContext.Provider>
  );
}
