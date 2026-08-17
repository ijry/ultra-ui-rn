import React from 'react';
import { Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { getPx, type UPDimension } from '../../utils';
import { useUPTableContext } from './context';

export function resolveTableWidth(value: UPDimension | undefined): ViewStyle['flexBasis'] | undefined {
  if (value === undefined || value === '' || value === 'auto') return undefined;
  const text = String(value).trim();
  return text.includes('%') ? text as ViewStyle['flexBasis'] : getPx(value);
}

export function tableContent(
  children: React.ReactNode,
  style: StyleProp<TextStyle>,
  testID?: string,
): React.ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style} testID={testID}>{children}</Text>;
  }
  return children;
}

export function useTableCellBase() {
  return useUPTableContext() ?? {
    align: 'center' as const,
    bgColor: '#ffffff',
    borderColor: '#e4e7ed',
    color: '#606266',
    fontSize: 14,
    paddingHorizontal: 3,
    paddingVertical: 5,
    thStyle: {},
  };
}
