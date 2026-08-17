import React from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { colorToRgba, getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPTagProps = {
  type?: 'info' | 'primary' | 'success' | 'warning' | 'error';
  disabled?: boolean | string;
  size?: 'large' | 'medium' | 'mini';
  shape?: 'circle' | 'square';
  text?: string | number;
  bgColor?: string;
  color?: string;
  borderColor?: string;
  closeColor?: string;
  name?: string | number;
  plainFill?: boolean;
  plain?: boolean;
  closable?: boolean;
  show?: boolean;
  icon?: string;
  iconColor?: string;
  textSize?: UPDimension;
  height?: UPDimension;
  padding?: UPDimension;
  borderRadius?: UPDimension;
  autoBgColor?: number;
  customStyle?: StyleProp<ViewStyle>;
  testID?: string;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (name: string | number) => void;
  onClose?: (name: string | number) => void;
};

const tagMetrics = {
  large: { close: 25, closeIcon: 15, fontSize: 15, height: 32, icon: 21, padding: 15 },
  medium: { close: 22, closeIcon: 13, fontSize: 13, height: 26, icon: 19, padding: 10 },
  mini: { close: 18, closeIcon: 12, fontSize: 12, height: 22, icon: 16, padding: 5 },
} as const;

function isImage(value: string): boolean {
  return /^(https?:|file:|data:|\/)/i.test(value);
}

export function UPTag(input: UPTagProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.tag, ...input };
  const { colors } = useUPTheme();
  if (!props.show) {
    return null;
  }

  const metric = tagMetrics[props.size];
  const color = colors[props.type];
  const backgroundColor = props.bgColor || (props.plain ? (props.plainFill ? colorToRgba(color, 0.12) : '#ffffff') : color);
  const textColor = props.color || (props.plain ? color : '#ffffff');
  const tagStyle: ViewStyle = {
    alignItems: 'center',
    backgroundColor,
    borderColor: props.borderColor || color,
    borderRadius: props.borderRadius ? getPx(props.borderRadius) : props.shape === 'circle' ? 100 : 3,
    borderWidth: 1,
    flexDirection: 'row',
    height: props.height ? getPx(props.height) : metric.height,
    opacity: props.disabled ? 0.5 : 1,
    paddingHorizontal: props.padding ? getPx(props.padding) : metric.padding,
  };
  const textStyle: TextStyle = {
    color: textColor,
    fontSize: props.textSize ? getPx(props.textSize) : metric.fontSize,
    lineHeight: props.height ? getPx(props.height) : metric.fontSize,
  };

  return (
    <View style={{ alignSelf: 'flex-start', position: 'relative' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(props.disabled) }}
        disabled={Boolean(props.disabled)}
        onPress={() => input.onClick?.(props.name)}
        style={[tagStyle, input.customStyle]}
        testID={input.testID ?? 'up-tag'}
      >
        {props.icon ? (
          <View style={{ marginRight: 4 }} testID="up-tag-icon">
            {isImage(props.icon) ? (
              <Image source={{ uri: props.icon }} style={{ height: metric.icon, width: metric.icon }} />
            ) : (
              <UPIcon
                color={props.iconColor || (props.plain ? color : '#ffffff')}
                name={props.icon}
                size={metric.icon}
              />
            )}
          </View>
        ) : null}
        <Text style={textStyle} testID="up-tag-text">
          {input.children ?? props.text}
        </Text>
      </Pressable>
      {props.closable ? (
        <Pressable
          accessibilityLabel="Close tag"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => input.onClose?.(props.name)}
          style={{
            alignItems: 'center',
            backgroundColor: props.closeColor || colors.disabledColor,
            borderRadius: 100,
            height: metric.close,
            justifyContent: 'center',
            position: 'absolute',
            right: -metric.close / 3,
            top: -metric.close / 3,
            width: metric.close,
          }}
          testID="up-tag-close"
        >
          <UPIcon color="#ffffff" name="close" size={metric.closeIcon} />
        </Pressable>
      ) : null}
    </View>
  );
}
