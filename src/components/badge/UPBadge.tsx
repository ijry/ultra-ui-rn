import React from 'react';
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';

export type UPBadgeProps = {
  isDot?: boolean;
  value?: string | number;
  /** Source v-model alias. `value` takes precedence when both are supplied. */
  modelValue?: string | number;
  show?: boolean;
  max?: string | number;
  type?: 'info' | 'primary' | 'success' | 'warning' | 'error';
  showZero?: boolean;
  bgColor?: string | null;
  color?: string | null;
  shape?: 'circle' | 'horn';
  numberType?: 'overflow' | 'ellipsis' | 'limit';
  offset?: [UPDimension, UPDimension?] | UPDimension[];
  inverted?: boolean;
  absolute?: boolean;
  customStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

function displayValue(
  value: string | number,
  max: string | number,
  numberType: NonNullable<UPBadgeProps['numberType']>,
): string | number {
  const numericValue = Number(value);
  const numericMax = Number(max);
  if (!Number.isFinite(numericValue)) {
    return value;
  }
  if (numberType === 'overflow') {
    return numericValue > numericMax ? `${max}+` : value;
  }
  if (numberType === 'ellipsis') {
    return numericValue > numericMax ? '...' : value;
  }
  if (numericValue > 9999) {
    return `${Math.floor((numericValue / 1e4) * 100) / 100}w`;
  }
  if (numericValue > 999) {
    return `${Math.floor((numericValue / 1e3) * 100) / 100}k`;
  }
  return value;
}

export function UPBadge(input: UPBadgeProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.badge, ...input };
  const { colors } = useUPTheme();
  const value = input.value ?? input.modelValue ?? props.value;
  const visible = props.show && (props.isDot || props.showZero || Number(value) !== 0);
  if (!visible) {
    return input.children ? <>{input.children}</> : null;
  }

  const offset = props.offset ?? [];
  const top = offset[0] === undefined ? undefined : getPx(offset[0]);
  const right = offset[1] === undefined ? top : getPx(offset[1]);
  const typeColor = colors[props.type];
  const badgeStyle: ViewStyle & TextStyle = {
    alignItems: 'center',
    backgroundColor: props.inverted ? '#ffffff' : props.bgColor || typeColor,
    borderBottomLeftRadius: props.shape === 'horn' ? 0 : 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    color: props.color || (props.inverted ? typeColor : '#ffffff'),
    fontSize: props.inverted ? 13 : 11,
    height: props.isDot ? 8 : undefined,
    justifyContent: 'center',
    lineHeight: 11,
    paddingHorizontal: props.isDot ? 0 : 5,
    paddingVertical: props.isDot ? 0 : 2,
    position: props.absolute || input.children ? 'absolute' : undefined,
    right: props.absolute || input.children ? right ?? 0 : undefined,
    top: props.absolute || input.children ? top ?? 0 : undefined,
    width: props.isDot ? 8 : undefined,
    zIndex: props.absolute || input.children ? 1 : undefined,
  };
  const badge = (
    <Text style={[badgeStyle, input.customStyle]} testID="up-badge">
      {props.isDot ? '' : displayValue(value, props.max, props.numberType)}
    </Text>
  );

  if (!input.children) {
    return badge;
  }
  return (
    <View style={{ alignSelf: 'flex-start', position: 'relative' }}>
      {input.children}
      {badge}
    </View>
  );
}
