import React from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { sourceSpacing, sourceTextAlign } from '../shared';

export type UPTextMode = 'text' | 'price' | 'phone' | 'name' | 'date' | 'link';
export type UPTextType =
  | 'info'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'main'
  | 'content'
  | 'tips'
  | 'light';

export type UPTextProps = {
  type?: UPTextType | '';
  show?: boolean;
  text?: string | number;
  prefixIcon?: string;
  suffixIcon?: string;
  mode?: UPTextMode | string;
  href?: string;
  format?: string | ((value: string | number) => string | number);
  call?: boolean;
  /** @deprecated Mini-program open types are unsupported in React Native. */
  openType?: string;
  bold?: boolean;
  block?: boolean;
  lines?: string | number;
  color?: string;
  size?: UPDimension;
  iconStyle?: StyleProp<TextStyle>;
  decoration?: 'none' | 'underline' | 'line-through';
  margin?: UPDimension;
  lineHeight?: UPDimension;
  align?: 'left' | 'center' | 'right';
  wordWrap?: 'normal' | 'break-word' | 'anywhere';
  flex1?: boolean;
  customStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  onLinkPress?: (href: string) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onGetuserinfo?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onContact?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onGetphonenumber?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onError?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onLaunchapp?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  onOpensetting?: (event: unknown) => void;
  /** @deprecated Mini-program event retained as a no-op. */
  lang?: string;
  /** @deprecated Mini-program property retained as a no-op. */
  sessionFrom?: string;
  /** @deprecated Mini-program property retained as a no-op. */
  sendMessageTitle?: string;
  /** @deprecated Mini-program property retained as a no-op. */
  sendMessagePath?: string;
  /** @deprecated Mini-program property retained as a no-op. */
  sendMessageImg?: string;
  /** @deprecated Mini-program property retained as a no-op. */
  showMessageCard?: boolean;
  /** @deprecated Mini-program property retained as a no-op. */
  appParameter?: string;
};

function formatName(value: string): string {
  if (value.length === 2) {
    return `${value.slice(0, 1)}*`;
  }
  if (value.length > 2) {
    return `${value.slice(0, 1)}${'*'.repeat(value.length - 2)}${value.slice(-1)}`;
  }
  return value;
}

function formatDate(value: string | number, format: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  const parts = {
    dd: String(date.getDate()).padStart(2, '0'),
    hh: String(date.getHours()).padStart(2, '0'),
    mi: String(date.getMinutes()).padStart(2, '0'),
    mm: String(date.getMonth() + 1).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    yyyy: String(date.getFullYear()),
  };
  return format
    .replace(/yyyy/g, parts.yyyy)
    .replace(/mm/g, parts.mm)
    .replace(/dd/g, parts.dd)
    .replace(/hh/g, parts.hh)
    .replace(/mi/g, parts.mi)
    .replace(/ss/g, parts.ss);
}

function resolveValue(
  text: string | number,
  mode: string,
  format: UPTextProps['format'],
): string {
  if (typeof format === 'function') {
    return String(format(text));
  }
  const value = String(text);
  switch (mode) {
    case 'price': {
      const number = Number(value);
      return Number.isFinite(number) ? number.toFixed(2) : value;
    }
    case 'date':
      return formatDate(value, typeof format === 'string' && format ? format : 'yyyy-mm-dd');
    case 'phone':
      return format === 'encrypt' && value.length >= 7
        ? `${value.slice(0, 3)}****${value.slice(7)}`
        : value;
    case 'name':
      return format === 'encrypt' ? formatName(value) : value;
    default:
      return value;
  }
}

function typeColor(
  type: UPTextProps['type'],
  colors: ReturnType<typeof useUPTheme>['colors'],
  fallback: string,
): string {
  const map: Record<Exclude<UPTextType, ''>, string> = {
    content: colors.contentColor,
    error: colors.error,
    info: colors.info,
    light: colors.lightColor,
    main: colors.mainColor,
    primary: colors.primary,
    success: colors.success,
    tips: colors.tipsColor,
    warning: colors.warning,
  };
  return type ? map[type as Exclude<UPTextType, ''>] : fallback;
}

export function UPText(input: UPTextProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.text, ...input };
  const { colors } = useUPTheme();
  if (!props.show) {
    return null;
  }

  const value = resolveValue(props.text, props.mode, props.format);
  const fontSize = getPx(props.size);
  const valueStyle: TextStyle = {
    color: typeColor(props.type, colors, props.color || colors.contentColor),
    fontSize,
    fontWeight: props.bold ? '700' : '400',
    lineHeight: props.lineHeight ? getPx(props.lineHeight) : undefined,
    textAlign: sourceTextAlign(props.align),
    textDecorationLine: props.decoration,
  };
  const wrapperStyle: ViewStyle = {
    alignItems: 'center',
    flex: props.flex1 ? 1 : undefined,
    flexDirection: 'row',
    justifyContent:
      props.align === 'left'
        ? 'flex-start'
        : props.align === 'center'
          ? 'center'
          : 'flex-end',
    width: props.flex1 ? '100%' : undefined,
    ...sourceSpacing(props.margin),
  };
  const lineCount = Number(props.lines);
  const inputIconStyle = StyleSheet.flatten(input.iconStyle) ?? {};
  const iconStyle: StyleProp<TextStyle> = {
    ...inputIconStyle,
    fontSize: getPx(inputIconStyle.fontSize ?? config.props.text.iconStyle.fontSize),
  };
  const handlePress = (event: GestureResponderEvent) => {
    if (props.mode === 'link' && props.href) {
      if (input.onLinkPress) {
        input.onLinkPress(props.href);
      } else {
        void Linking.openURL(props.href);
      }
    }
    if (props.call && props.mode === 'phone') {
      void Linking.openURL(`tel:${props.text}`);
    }
    input.onClick?.(event);
  };

  return (
    <Pressable
      accessibilityRole={input.onClick || props.mode === 'link' || props.call ? 'button' : 'text'}
      disabled={!input.onClick && props.mode !== 'link' && !(props.call && props.mode === 'phone')}
      onPress={handlePress}
      style={props.block ? { alignSelf: 'stretch' } : undefined}
      testID="up-text"
    >
      <View style={wrapperStyle}>
        {props.mode === 'price' ? (
          <Text style={[{ color: valueStyle.color, fontSize: 14 }, valueStyle]}>￥</Text>
        ) : null}
        {props.prefixIcon ? (
          <View testID="up-text-prefix-icon">
            <UPIcon customStyle={iconStyle} name={props.prefixIcon} />
          </View>
        ) : null}
        <Text
          numberOfLines={Number.isFinite(lineCount) && lineCount > 0 ? lineCount : undefined}
          style={[valueStyle, input.customStyle]}
          testID="up-text-value"
        >
          {input.children ?? value}
        </Text>
        {props.suffixIcon ? (
          <View testID="up-text-suffix-icon">
            <UPIcon customStyle={iconStyle} name={props.suffixIcon} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
