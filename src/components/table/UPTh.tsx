import React from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';
import { resolveTableWidth, tableContent, useTableCellBase } from './cell';

export type UPThProps = {
  width?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPTh(input: UPThProps): React.JSX.Element {
  const table = useTableCellBase();
  const width = resolveTableWidth(input.width);
  const textStyle: TextStyle = { color: '#303133', fontSize: table.fontSize, fontWeight: '700', textAlign: table.align };
  return (
    <View
      style={[
        {
          alignSelf: 'stretch',
          backgroundColor: '#f5f6f8',
          borderBottomColor: table.borderColor,
          borderBottomWidth: 1,
          borderRightColor: table.borderColor,
          borderRightWidth: 1,
          flex: width === undefined ? 1 : undefined,
          flexBasis: width,
          justifyContent: 'center',
          paddingHorizontal: table.paddingHorizontal,
          paddingVertical: table.paddingVertical,
        },
        table.thStyle,
        input.customStyle,
      ]}
      testID="up-th"
    >
      {tableContent(input.children, [textStyle, input.textStyle], 'up-th-content')}
    </View>
  );
}
