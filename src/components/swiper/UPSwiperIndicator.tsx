import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';

export type UPSwiperIndicatorProps = {
  length?: number | string;
  current?: number | string;
  indicatorActiveColor?: string;
  indicatorInactiveColor?: string;
  indicatorMode?: 'line' | 'dot';
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

const lineWidth = 22;

function integer(value: number | string | undefined): number {
  const result = Number(value);
  return Number.isFinite(result) ? Math.trunc(result) : 0;
}

export function UPSwiperIndicator(input: UPSwiperIndicatorProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.swiperIndicator, ...input } as UPSwiperIndicatorProps;
  const length = Math.max(0, integer(props.length));
  const current = Math.max(0, Math.min(Math.max(0, length - 1), integer(props.current)));

  return (
    <View style={input.customStyle} testID="up-swiper-indicator">
      {props.indicatorMode === 'dot' ? (
        <View style={{ flexDirection: 'row' }}>
          {Array.from({ length }, (_, index) => {
            const active = index === current;
            return (
              <View
                key={index}
                style={{ backgroundColor: active ? props.indicatorActiveColor : props.indicatorInactiveColor, borderRadius: 100, height: 5, marginHorizontal: 4, width: active ? 12 : 5 }}
                testID={`up-swiper-indicator-dot-${index}`}
              />
            );
          })}
        </View>
      ) : (
        <View
          style={{ backgroundColor: props.indicatorInactiveColor, borderRadius: 100, height: 4, overflow: 'hidden', width: lineWidth * length }}
          testID="up-swiper-indicator-line"
        >
          <View
            style={{ backgroundColor: props.indicatorActiveColor, borderRadius: 100, height: 4, transform: [{ translateX: current * lineWidth }], width: lineWidth }}
            testID="up-swiper-indicator-line-bar"
          />
        </View>
      )}
    </View>
  );
}
