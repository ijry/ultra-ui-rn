import React from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { UPIcon } from '../icon';

export type UPSectionProps = {
  title?: string | number;
  subTitle?: string | number;
  right?: boolean;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  subColor?: string;
  showLine?: boolean;
  lineColor?: string;
  arrow?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
};

export function UPSection(input: UPSectionProps): React.JSX.Element {
  const props = { ...useUPConfig().props.section, ...input };
  const { colors } = useUPTheme();
  const lineColor = props.lineColor || colors.primary;
  return (
    <View
      style={[
        {
          alignItems: 'center',
          borderLeftColor: props.showLine ? lineColor : 'transparent',
          borderLeftWidth: props.showLine ? 4 : 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: props.showLine ? 8 : 0,
        },
        input.customStyle,
      ]}
      testID="up-section"
    >
      <Text style={{ color: props.color, fontSize: props.fontSize, fontWeight: props.bold ? '700' : '400' }}>
        {input.children ?? props.title}
      </Text>
      {props.right ? (
        <Pressable
          accessibilityRole="button"
          disabled={!input.onClick}
          onPress={input.onClick}
          style={{ alignItems: 'center', flexDirection: 'row' }}
          testID="up-section-right"
        >
          {input.rightContent ?? (
            <>
              <Text style={{ color: props.subColor, fontSize: 13 }}>{props.subTitle}</Text>
              {props.arrow ? <UPIcon color={props.subColor} name="arrow-right" size={14} /> : null}
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
