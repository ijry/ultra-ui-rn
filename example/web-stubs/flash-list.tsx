import React, { forwardRef } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

// FlashList is a FlatList replacement - on web we just use FlatList
export const FlashList = forwardRef<any, FlatListProps<any>>((props, ref) => (
  <FlatList ref={ref} {...props} />
));
FlashList.displayName = 'FlashList';

export type FlashListRef<T> = any;
export default FlashList;
