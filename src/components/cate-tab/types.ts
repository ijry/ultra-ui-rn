import React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';

export type UPCateTabMode = 'follow' | 'tab';

export type UPCateTabItem = Record<string, unknown> & {
  children?: readonly UPCateTabItem[];
  icon?: string;
};

export type UPCateTabRenderPayload = {
  item: UPCateTabItem;
  index: number;
  active: boolean;
};

export type UPCateTabPageItemPayload = {
  item: UPCateTabItem;
  index: number;
  parent: UPCateTabItem;
  parentIndex: number;
};

export type UPCateTabProps = {
  mode?: UPCateTabMode;
  height?: UPDimension;
  tabList?: readonly UPCateTabItem[];
  tabKeyName?: string;
  itemKeyName?: string;
  current?: number;
  defaultCurrent?: number;
  animated?: boolean;
  renderTabItem?: (payload: UPCateTabRenderPayload) => React.ReactNode;
  renderRightTop?: (payload: { tabList: readonly UPCateTabItem[] }) => React.ReactNode;
  renderItemList?: (payload: UPCateTabRenderPayload) => React.ReactNode;
  renderPageItem?: (payload: UPCateTabPageItemPayload) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  menuStyle?: StyleProp<ViewStyle>;
  menuItemStyle?: StyleProp<ViewStyle>;
  activeMenuItemStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  sectionStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onUpdateCurrent?: (index: number) => void;
  onChange?: (index: number, item: UPCateTabItem) => void;
};
