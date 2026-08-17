import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { useUPScrollHost, type UPStickyOverlay } from '../scroll-host';

type StickyLayout = { height: number; width: number; x: number; y: number };

export type UPStickyProps = {
  offsetTop?: UPDimension;
  customNavHeight?: UPDimension;
  disabled?: boolean;
  bgColor?: string;
  zIndex?: number | string;
  index?: string | number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onFixed?: (index: string | number) => void;
  onUnfixed?: (index: string | number) => void;
};

function resolveZIndex(value: UPStickyProps['zIndex'], fallback: number): number {
  if (value === '' || value === undefined) {
    return fallback;
  }
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : fallback;
}

export function UPSticky(input: UPStickyProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.sticky, ...input } as UPStickyProps;
  const host = useUPScrollHost();
  const generatedId = useId();
  const id = `up-sticky-${generatedId}`;
  const [layout, setLayout] = useState<StickyLayout | null>(null);
  const previousFixed = useRef(false);
  const stickyTop = getPx(props.offsetTop ?? 0) + getPx(props.customNavHeight ?? 0);
  const fixed = Boolean(
    host && !props.disabled && layout && host.scrollY >= layout.y - stickyTop,
  );
  const zIndex = resolveZIndex(props.zIndex, config.zIndex.sticky);
  const index = props.index ?? '';
  const stickyOverlay = useMemo<UPStickyOverlay | null>(() => {
    if (!fixed || !layout) {
      return null;
    }
    return {
      bgColor: props.bgColor ?? 'transparent',
      content: input.children,
      customStyle: input.customStyle,
      height: layout.height,
      id,
      top: stickyTop,
      width: layout.width,
      x: layout.x,
      zIndex,
    };
  }, [fixed, id, input.children, input.customStyle, layout, props.bgColor, stickyTop, zIndex]);

  useEffect(() => {
    host?.setStickyOverlay(id, stickyOverlay);
    return () => host?.setStickyOverlay(id, null);
  }, [host, id, stickyOverlay]);

  useEffect(() => {
    if (!layout || !host) {
      return;
    }
    if (fixed !== previousFixed.current) {
      if (fixed) {
        input.onFixed?.(index);
      } else {
        input.onUnfixed?.(index);
      }
      previousFixed.current = fixed;
    }
  }, [fixed, host, index, input.onFixed, input.onUnfixed, layout]);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayout(event.nativeEvent.layout);
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          backgroundColor: props.bgColor,
          height: fixed ? layout?.height : undefined,
          zIndex: fixed ? undefined : zIndex,
        },
        fixed ? undefined : input.customStyle,
      ]}
      testID="up-sticky"
    >
      {fixed ? null : input.children}
    </View>
  );
}
