import React from 'react';
import {
  Pressable,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { UPDimension } from '../../utils';

export type UPNavbarPressEvent = Parameters<
  NonNullable<React.ComponentProps<typeof Pressable>['onPress']>
>[0];

export type UPNavbarProps = {
  safeAreaInsetTop?: boolean;
  placeholder?: boolean;
  fixed?: boolean;
  border?: boolean;
  leftIcon?: string;
  leftText?: string;
  rightText?: string;
  rightIcon?: string;
  title?: string | number;
  titleColor?: string;
  bgColor?: string;
  statusBarBgColor?: string;
  titleWidth?: UPDimension;
  height?: UPDimension;
  leftIconSize?: UPDimension;
  leftIconColor?: string;
  autoBack?: boolean;
  titleStyle?: StyleProp<TextStyle> | string;
  renderLeft?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onLeftClick?: (event: UPNavbarPressEvent) => void;
  onRightClick?: (event: UPNavbarPressEvent) => void;
};
