import React from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { getPx, type UPDimension } from '../../utils';
import { resolveTableWidth, tableContent, useTableCellBase } from './cell';

export type UPTdProps = {
  width?: UPDimension | 'auto';
  textAlign?: 'left' | 'center' | 'right' | '';
  fontSize?: UPDimension | '';
  borderColor?: string;
  color?: string;
  customStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPTd(input: UPTdProps): React.JSX.Element {
  const table = useTableCellBase();
  const width = resolveTableWidth(input.width);
  const borderColor = input.borderColor || table.borderColor;
  const textStyle: TextStyle = {
    color: input.color || table.color,
    fontSize: input.fontSize ? getPx(input.fontSize) : table.fontSize,
    textAlign: input.textAlign || table.align,
  };
  return (
    <React.Fragment>
      <View
        style={[
          {
            alignSelf: 'stretch',
            borderBottomColor: borderColor,
            borderBottomWidth: 1,
            borderRightColor: borderColor,
            borderRightWidth: 1,
            flex: width === undefined ? 1 : undefined,
            flexBasis: width,
            justifyContent: 'center',
            paddingHorizontal: table.paddingHorizontal,
            paddingVertical: table.paddingVertical,
          },
          input.customStyle,
        ]}
        testID="up-td"
      >
        {tableContent(input.children, [textStyle, input.textStyle], 'up-td-content')}
      </View>
    </React.Fragment>
  );
}
