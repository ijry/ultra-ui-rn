import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { throttle, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPButtonType = 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error';
export type UPButtonSize = 'large' | 'normal' | 'small' | 'mini';

export type UPButtonProps = {
  hairline?: boolean;
  type?: UPButtonType;
  size?: UPButtonSize;
  shape?: 'circle' | 'square';
  plain?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string | number;
  /** @deprecated React Native renders one native activity indicator mode. */
  loadingMode?: string;
  loadingSize?: UPDimension;
  text?: string | number;
  icon?: string;
  iconColor?: string;
  color?: string;
  throttleTime?: UPDimension;
  /** @deprecated React Native press propagation differs from uni-app. */
  stop?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  /** @deprecated React Native no-op. */
  openType?: string;
  /** @deprecated React Native no-op. */
  formType?: string;
  /** @deprecated React Native no-op. */
  appParameter?: string;
  /** @deprecated React Native no-op. */
  hoverStopPropagation?: boolean;
  /** @deprecated React Native no-op. */
  lang?: string;
  /** @deprecated React Native no-op. */
  sessionFrom?: string;
  /** @deprecated React Native no-op. */
  sendMessageTitle?: string;
  /** @deprecated React Native no-op. */
  sendMessagePath?: string;
  /** @deprecated React Native no-op. */
  sendMessageImg?: string;
  /** @deprecated React Native no-op. */
  showMessageCard?: boolean;
  /** @deprecated React Native no-op. */
  dataName?: string;
  /** @deprecated React Native no-op. */
  hoverStartTime?: UPDimension;
  /** @deprecated React Native no-op. */
  hoverStayTime?: UPDimension;
  /** @deprecated React Native no-op. */
  onGetphonenumber?: (event: unknown) => void;
  /** @deprecated React Native no-op. */
  onGetuserinfo?: (event: unknown) => void;
  /** @deprecated React Native no-op. */
  onError?: (event: unknown) => void;
  /** @deprecated React Native no-op. */
  onOpensetting?: (event: unknown) => void;
  /** @deprecated React Native no-op. */
  onLaunchapp?: (event: unknown) => void;
  /** @deprecated React Native no-op. */
  onAgreeprivacyauthorization?: (event: unknown) => void;
};

type ButtonMetrics = {
  fontSize: number;
  height: number;
  minWidth?: number;
  padding: number;
  width?: '100%';
};

const metrics: Record<UPButtonSize, ButtonMetrics> = {
  large: { fontSize: 16, height: 50, padding: 15, width: '100%' },
  mini: { fontSize: 10, height: 22, minWidth: 50, padding: 8 },
  normal: { fontSize: 14, height: 40, padding: 12 },
  small: { fontSize: 12, height: 30, minWidth: 60, padding: 8 },
};

function resolveCustomColor(color: string, fallback: string): string {
  if (!color.includes('gradient')) {
    return color || fallback;
  }
  const firstStop = color.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/)?.[0];
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      'UPButton: CSS gradients are emulated with their first color stop in P0.',
    );
  }
  return firstStop || fallback;
}

export function UPButton(input: UPButtonProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.button, ...input };
  const { colors } = useUPTheme();
  const metric = metrics[props.size];
  const typeColor = colors[props.type];
  const hasCustomColor = props.color.length > 0;
  const customColor = resolveCustomColor(props.color, typeColor);
  const plainColor = hasCustomColor ? customColor : typeColor;
  const backgroundColor = props.plain
    ? '#ffffff'
    : hasCustomColor
      ? customColor
      : props.type === 'info' || props.type === 'default'
        ? '#ffffff'
        : typeColor;
  const borderColor = hasCustomColor
    ? customColor
    : props.type === 'info' || props.type === 'default'
      ? colors.borderColor
      : typeColor;
  const textColor = props.plain
    ? plainColor
    : hasCustomColor || (props.type !== 'info' && props.type !== 'default')
      ? '#ffffff'
      : colors.mainColor;
  const buttonStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    borderRadius: props.shape === 'circle' ? 100 : 3,
    borderWidth: props.hairline ? 0.5 : 1,
    height: metric.height,
    minWidth: metric.minWidth,
    opacity: props.disabled ? 0.5 : 1,
    paddingHorizontal: metric.padding,
    width: metric.width,
  };
  const click = useMemo(
    () =>
      throttle((event: GestureResponderEvent) => {
        if (!props.disabled && !props.loading) {
          input.onClick?.(event);
        }
      }, Number(props.throttleTime)),
    [input.onClick, props.disabled, props.loading, props.throttleTime],
  );
  const label = props.loading ? props.loadingText || props.text : props.text;
  const showsText = input.children || label !== '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: props.loading, disabled: props.disabled || props.loading }}
      disabled={props.disabled || props.loading}
      onPress={click}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !props.disabled && !props.loading ? { opacity: 0.85 } : null,
        input.customStyle,
      ]}
      testID="up-button"
    >
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {props.loading ? (
          <ActivityIndicator
            color={
              props.plain
                ? plainColor
                : props.type === 'info'
                  ? '#c9c9c9'
                  : '#c8c8c8'
            }
            size={Number(props.loadingSize) * 1.15}
            testID="up-button-loading"
          />
        ) : props.icon ? (
          <UPIcon
            color={props.iconColor || textColor}
            name={props.icon}
            size={metric.fontSize * 1.35}
          />
        ) : null}
        {showsText ? (
          <Text
            style={{
              color: textColor,
              fontSize: metric.fontSize,
              lineHeight: metric.fontSize,
              marginLeft: props.loading || props.icon ? 4 : 0,
            }}
          >
            {input.children || label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
