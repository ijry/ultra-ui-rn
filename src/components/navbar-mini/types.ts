import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';

export type UPNavbarMiniPressEvent = Parameters<
  NonNullable<React.ComponentProps<typeof Pressable>['onPress']>
>[0];

export type UPNavbarMiniHomePayload = {
  homeUrl: string;
  event: UPNavbarMiniPressEvent;
};

export type UPNavbarMiniProps = {
  safeAreaInsetTop?: boolean;
  placeholder?: boolean;
  fixed?: boolean;
  leftIcon?: string;
  bgColor?: string;
  height?: UPDimension;
  iconSize?: UPDimension;
  iconColor?: string;
  leftIconColor?: string;
  autoBack?: boolean;
  homeUrl?: string;
  renderLeft?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftStyle?: StyleProp<ViewStyle>;
  centerStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onLeftClick?: (event: UPNavbarMiniPressEvent) => void;
  onHomeClick?: (payload: UPNavbarMiniHomePayload) => void;
};
