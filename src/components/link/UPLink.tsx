import React from 'react';
import {
  Linking,
  Pressable,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPLinkProps = {
  color?: string;
  fontSize?: UPDimension;
  underLine?: boolean;
  href?: string;
  /** @deprecated Mini-program clipboard feedback is unavailable in React Native. */
  mpTips?: string;
  lineColor?: string;
  text?: string;
  customStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  onLinkPress?: (href: string) => void;
};

export function UPLink(input: UPLinkProps): React.JSX.Element {
  const props = { ...useUPConfig().props.link, ...input };
  const onPress = (event: GestureResponderEvent) => {
    if (props.href) {
      if (input.onLinkPress) {
        input.onLinkPress(props.href);
      } else {
        void Linking.openURL(props.href);
      }
    }
    input.onClick?.(event);
  };
  const fontSize = getPx(props.fontSize);
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      testID="up-link"
    >
      <Text
        style={[
          {
            color: props.color,
            fontSize,
            lineHeight: fontSize + 2,
            textDecorationColor: props.lineColor || props.color,
            textDecorationLine: props.underLine ? 'underline' : 'none',
          },
          input.customStyle,
        ]}
      >
        {input.children ?? props.text}
      </Text>
    </Pressable>
  );
}
