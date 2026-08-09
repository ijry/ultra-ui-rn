import React, { forwardRef, useImperativeHandle } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

type MockFlashListRef = {
  scrollToIndex: (options: { index: number; animated?: boolean }) => void;
  scrollToOffset: (options: { offset: number; animated?: boolean }) => void;
};

type MockFlashListProps = FlatListProps<unknown> & {
  __onScrollToIndex?: (options: { index: number; animated?: boolean }) => void;
  __onScrollToOffset?: (options: { offset: number; animated?: boolean }) => void;
};

export const FlashList = forwardRef<MockFlashListRef, MockFlashListProps>(
  function FlashListMock(props, ref) {
    useImperativeHandle(ref, () => ({
      scrollToIndex: (options: { index: number; animated?: boolean }) => {
        props.__onScrollToIndex?.(options);
      },
      scrollToOffset: (options: { offset: number; animated?: boolean }) => {
        props.__onScrollToOffset?.(options);
      },
    }));

    return <FlatList {...(props as FlatListProps<unknown>)} />;
  },
);
