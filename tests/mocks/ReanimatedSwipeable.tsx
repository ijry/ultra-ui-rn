import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

type ReanimatedSwipeableMockProps = {
  children?: React.ReactNode;
  renderRightActions?: () => React.ReactNode;
  testID?: string;
};

export type ReanimatedSwipeableMockMethods = {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
};

const ReanimatedSwipeable = forwardRef<ReanimatedSwipeableMockMethods, ReanimatedSwipeableMockProps>(
  ({ children, renderRightActions, testID }, ref) => {
    useImperativeHandle(ref, () => ({
      close: () => undefined,
      openLeft: () => undefined,
      openRight: () => undefined,
      reset: () => undefined,
    }));

    return (
      <View testID={testID}>
        {renderRightActions?.()}
        {children}
      </View>
    );
  },
);

export default ReanimatedSwipeable;
