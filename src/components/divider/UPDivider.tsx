import React from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPLine } from '../line';

export type UPDividerProps = {
  dashed?: boolean;
  hairline?: boolean;
  dot?: boolean;
  textPosition?: 'left' | 'center' | 'right';
  text?: string | number;
  textSize?: UPDimension;
  textColor?: string;
  lineColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
};

export function UPDivider(input: UPDividerProps): React.JSX.Element {
  const props = { ...useUPConfig().props.divider, ...input };
  const leftStyle: ViewStyle =
    props.textPosition === 'left' ? { width: getPx('80rpx') } : { flex: 1 };
  const rightStyle: ViewStyle =
    props.textPosition === 'right' ? { width: getPx('80rpx') } : { flex: 1 };
  const textStyle: TextStyle = {
    color: props.textColor,
    fontSize: getPx(props.textSize),
    marginHorizontal: props.dot ? 12 : 15,
  };
  const content = (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: 'row',
          marginVertical: 15,
        },
        input.customStyle,
      ]}
    >
      <UPLine
        color={props.lineColor}
        customStyle={leftStyle}
        dashed={props.dashed}
        hairline={props.hairline}
        testID="up-divider-left-line"
      />
      {props.dot ? (
        <Text style={[textStyle, { color: '#c0c4cc', fontSize: 12 }]}>●</Text>
      ) : input.children ? (
        input.children
      ) : props.text !== '' ? (
        <Text style={textStyle}>{props.text}</Text>
      ) : null}
      <UPLine
        color={props.lineColor}
        customStyle={rightStyle}
        dashed={props.dashed}
        hairline={props.hairline}
        testID="up-divider-right-line"
      />
    </View>
  );

  if (!input.onClick) {
    return <View testID="up-divider">{content}</View>;
  }
  return (
    <Pressable accessibilityRole="button" onPress={input.onClick} testID="up-divider">
      {content}
    </Pressable>
  );
}
