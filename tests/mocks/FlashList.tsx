import React, { forwardRef, useImperativeHandle } from 'react';
import { FlatList } from 'react-native';

export const FlashList = forwardRef<any, any>(function FlashListMock(props, ref) {
  useImperativeHandle(ref, () => ({
    scrollToIndex: (options: { index: number; animated?: boolean }) => {
      props.__onScrollToIndex?.(options);
    },
    scrollToOffset: (options: { offset: number; animated?: boolean }) => {
      props.__onScrollToOffset?.(options);
    },
  }));

  return <FlatList {...props} />;
});
