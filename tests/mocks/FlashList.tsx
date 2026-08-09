import React, { forwardRef, useImperativeHandle } from 'react';
import { View, type FlatListProps } from 'react-native';

type MockFlashListRef = {
  scrollToIndex: (options: { index: number; animated?: boolean }) => void;
  scrollToOffset: (options: { offset: number; animated?: boolean }) => void;
};

type MockFlashListProps = FlatListProps<unknown> & {
  masonry?: boolean;
  numColumns?: number;
  optimizeItemArrangement?: boolean;
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

    const data = Array.from(props.data ?? []);
    const keyExtractor = props.keyExtractor ?? ((_item, index) => String(index));
    const empty = props.ListEmptyComponent;
    const emptyElement =
      data.length === 0 && empty
        ? React.isValidElement(empty)
          ? empty
          : React.createElement(empty as React.ComponentType)
        : null;
    const layoutProps = {
      masonry: props.masonry,
      numColumns: props.numColumns,
      optimizeItemArrangement: props.optimizeItemArrangement,
    } as unknown as React.ComponentProps<typeof View>;

    return (
      <View {...layoutProps} testID={props.testID}>
        {data.map((item, index) => (
          <React.Fragment key={keyExtractor(item, index)}>
            {props.renderItem?.({
              item,
              index,
              separators: {
                highlight: () => undefined,
                unhighlight: () => undefined,
                updateProps: () => undefined,
              },
            })}
          </React.Fragment>
        ))}
        {emptyElement}
      </View>
    );
  },
);
