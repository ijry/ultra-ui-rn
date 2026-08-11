import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';
import type { UPKey } from '../tree/types';

export type UPWaterfallRenderPayload<T> = {
  item: T;
  index: number;
  id: UPKey;
};

export type UPWaterfallAfterAddOnePayload<T> =
  T extends object ? T & { height: number } : { item: T; height: number };

export type UPWaterfallAfterAddAllPayload<T> = {
  newData: readonly T[];
};

export type UPWaterfallRef<T = unknown> = {
  remove: (id: UPKey) => boolean;
  clear: () => void;
  modify: (id: UPKey, key: string, value: unknown) => boolean;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToTop: (animated?: boolean) => void;
  getData: () => readonly T[];
};

export type UPWaterfallProps<T = unknown> = {
  modelValue?: readonly T[];
  value?: readonly T[];
  defaultValue?: readonly T[];
  columns?: number | 'auto';
  columnsMin?: number;
  minColumnWidth?: UPDimension;
  addTime?: number;
  idKey?: string;
  optimizeItemArrangement?: boolean;
  estimatedItemSize?: UPDimension;
  height?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPWaterfallRenderPayload<T>) => React.ReactNode;
  empty?: React.ReactNode;
  onChange?: (value: readonly T[]) => void;
  onUpdateModelValue?: (value: readonly T[]) => void;
  onAfterAddOne?: (payload: UPWaterfallAfterAddOnePayload<T>) => void;
  onAfterAddAll?: (payload: UPWaterfallAfterAddAllPayload<T>) => void;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
};
