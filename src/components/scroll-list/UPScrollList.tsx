import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';

export type UPScrollListProps = {
  indicatorWidth?: UPDimension;
  indicatorBarWidth?: UPDimension;
  indicator?: boolean;
  indicatorColor?: string;
  indicatorActiveColor?: string;
  indicatorStyle?: StyleProp<ViewStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onLeft?: () => void;
  onRight?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function UPScrollList(input: UPScrollListProps): React.JSX.Element {
  const props = { ...useUPConfig().props.scrollList, ...input } as UPScrollListProps;
  const [progress, setProgress] = useState(0);
  const lastEdge = useRef<'left' | 'right' | null>(null);
  const indicatorWidth = getPx(props.indicatorWidth ?? 50);
  const indicatorBarWidth = Math.min(indicatorWidth, getPx(props.indicatorBarWidth ?? 20));
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxOffset = Math.max(0, contentSize.width - layoutMeasurement.width);
    const nextProgress = maxOffset ? range(0, 1, contentOffset.x / maxOffset) : 0;
    setProgress(nextProgress);
    const edge = contentOffset.x <= 0 ? 'left' : contentOffset.x >= maxOffset ? 'right' : null;
    if (edge && edge !== lastEdge.current) {
      if (edge === 'left') input.onLeft?.();
      if (edge === 'right') input.onRight?.();
    }
    lastEdge.current = edge;
    input.onScroll?.(event);
  };

  return (
    <View style={[{ paddingBottom: 10 }, input.customStyle]} testID="up-scroll-list-wrapper">
      <ScrollView
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{ alignSelf: 'stretch' }}
        testID="up-scroll-list"
      >
        <View style={{ flexDirection: 'row' }}>{input.children}</View>
      </ScrollView>
      {props.indicator ? (
        <View style={[{ alignItems: 'center', marginTop: 15 }, props.indicatorStyle]}>
          <View style={{ backgroundColor: props.indicatorColor, borderRadius: 100, height: 4, overflow: 'hidden', width: indicatorWidth }}>
            <View style={{ backgroundColor: props.indicatorActiveColor, borderRadius: 100, height: 4, transform: [{ translateX: (indicatorWidth - indicatorBarWidth) * progress }], width: indicatorBarWidth }} testID="up-scroll-list-indicator" />
          </View>
        </View>
      ) : null}
    </View>
  );
}
