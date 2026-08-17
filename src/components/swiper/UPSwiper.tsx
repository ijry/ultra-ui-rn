import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageResizeMode,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPLoadingIcon } from '../loading-icon';
import { UPSwiperIndicator } from './UPSwiperIndicator';

export type UPSwiperItem = string | {
  title?: string;
  type?: 'image' | 'video' | string;
  [key: string]: unknown;
};

export type UPSwiperChangeEvent = {
  current: number;
};

export type UPSwiperProps = {
  list?: readonly UPSwiperItem[];
  indicator?: boolean;
  indicatorActiveColor?: string;
  indicatorInactiveColor?: string;
  indicatorStyle?: StyleProp<ViewStyle> | string;
  indicatorMode?: 'line' | 'dot';
  autoplay?: boolean;
  current?: number | string;
  /** @deprecated Source swiper items do not receive item IDs, so this has no React Native effect. */
  currentItemId?: string;
  interval?: number | string;
  /** @deprecated Core ScrollView owns the animated scroll duration. */
  duration?: number | string;
  circular?: boolean;
  vertical?: boolean;
  previousMargin?: UPDimension;
  nextMargin?: UPDimension;
  /** @deprecated Core ScrollView does not expose source multi-page acceleration. */
  acceleration?: boolean;
  displayMultipleItems?: number;
  /** @deprecated Core ScrollView does not expose source easing functions. */
  easingFunction?: string;
  keyName?: string;
  imgMode?: string;
  height?: UPDimension;
  bgColor?: string;
  radius?: UPDimension;
  loading?: boolean;
  showTitle?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  renderItem?: (item: UPSwiperItem, index: number) => React.ReactNode;
  renderIndicator?: (current: number, length: number) => React.ReactNode;
  onClick?: (index: number) => void;
  onChange?: (event: UPSwiperChangeEvent) => void;
  onUpdateCurrent?: (current: number) => void;
};

type SwiperViewport = { height: number; width: number };

const resizeModes: Record<string, ImageResizeMode> = {
  aspectFill: 'cover',
  aspectFit: 'contain',
  bottom: 'center',
  bottomLeft: 'center',
  bottomRight: 'center',
  center: 'center',
  cover: 'cover',
  heightFix: 'contain',
  left: 'center',
  repeat: 'repeat',
  right: 'center',
  scaleToFill: 'stretch',
  stretch: 'stretch',
  top: 'center',
  topLeft: 'center',
  topRight: 'center',
  widthFix: 'contain',
};

function integer(value: number | string | undefined): number {
  const result = Number(value);
  return Number.isFinite(result) ? Math.trunc(result) : 0;
}

function number(value: number | string | undefined, fallback: number): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function normalizeIndex(value: number | string | undefined, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, integer(value)));
}

function sourceOf(item: UPSwiperItem, keyName: string): string {
  if (typeof item === 'string') return item;
  const source = item[keyName];
  return typeof source === 'string' ? source : '';
}

function titleOf(item: UPSwiperItem): string {
  return typeof item === 'string' || typeof item.title !== 'string' ? '' : item.title;
}

function isVideo(item: UPSwiperItem, keyName: string): boolean {
  if (typeof item !== 'string' && item.type) return item.type === 'video';
  return /\.(mp4|mov|m4v|webm)(?:[?#]|$)/i.test(sourceOf(item, keyName));
}

function nativeIndicatorStyle(value: UPSwiperProps['indicatorStyle']): StyleProp<ViewStyle> | undefined {
  return typeof value === 'string' ? undefined : value;
}

export function UPSwiper(input: UPSwiperProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.swiper, ...input } as UPSwiperProps;
  const items = props.list ?? [];
  const scrollRef = useRef<ScrollView>(null);
  const sourceCurrent = input.current ?? props.current;
  const lastSourceCurrent = useRef(sourceCurrent);
  const [viewport, setViewport] = useState<SwiperViewport>({ height: 0, width: 0 });
  const [currentIndex, setCurrentIndex] = useState(() => normalizeIndex(sourceCurrent, items.length));
  const height = getPx(props.height ?? 130);
  const radius = getPx(props.radius ?? 4);
  const previousMargin = getPx(props.previousMargin ?? 0);
  const nextMargin = getPx(props.nextMargin ?? 0);
  const displayMultipleItems = Math.max(1, integer(props.displayMultipleItems ?? 1));
  const viewportSpan = props.vertical ? viewport.height : viewport.width;
  const visibleSpan = Math.max(0, viewportSpan - previousMargin - nextMargin);
  const slideSpan = visibleSpan > 0 ? visibleSpan / displayMultipleItems : 0;

  const scrollToIndex = useCallback((index: number) => {
    if (!slideSpan) return;
    scrollRef.current?.scrollTo({
      animated: number(props.duration, 300) !== 0,
      x: props.vertical ? 0 : index * slideSpan,
      y: props.vertical ? index * slideSpan : 0,
    });
  }, [props.duration, props.vertical, slideSpan]);

  useEffect(() => {
    const next = normalizeIndex(currentIndex, items.length);
    if (next !== currentIndex) setCurrentIndex(next);
  }, [currentIndex, items.length]);

  useEffect(() => {
    if (lastSourceCurrent.current === sourceCurrent) return;
    lastSourceCurrent.current = sourceCurrent;
    const next = normalizeIndex(sourceCurrent, items.length);
    setCurrentIndex(next);
    scrollToIndex(next);
  }, [items.length, scrollToIndex, sourceCurrent]);

  useEffect(() => {
    if (slideSpan) scrollToIndex(currentIndex);
  }, [currentIndex, scrollToIndex, slideSpan]);

  const transitionTo = useCallback((nextValue: number, notify: boolean) => {
    const next = normalizeIndex(nextValue, items.length);
    if (next === currentIndex) return;
    setCurrentIndex(next);
    scrollToIndex(next);
    if (notify) {
      input.onUpdateCurrent?.(next);
      input.onChange?.({ current: next });
    }
  }, [currentIndex, input, items.length, scrollToIndex]);

  useEffect(() => {
    if (!props.autoplay || props.loading || items.length < 2) return undefined;
    const timer = setInterval(() => {
      const next = currentIndex + 1;
      if (next < items.length) transitionTo(next, true);
      else if (props.circular) transitionTo(0, true);
    }, Math.max(1, number(props.interval, 3000)));
    return () => clearInterval(timer);
  }, [currentIndex, items.length, props.autoplay, props.circular, props.interval, props.loading, transitionTo]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { height: measuredHeight, width } = event.nativeEvent.layout;
    setViewport((previous) => previous.height === measuredHeight && previous.width === width ? previous : { height: measuredHeight, width });
  };
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const measuredSpan = props.vertical
      ? event.nativeEvent.layoutMeasurement.height
      : event.nativeEvent.layoutMeasurement.width;
    const offset = props.vertical
      ? event.nativeEvent.contentOffset.y
      : event.nativeEvent.contentOffset.x;
    const span = slideSpan || measuredSpan;
    if (!span) return;
    transitionTo(Math.round(offset / span), true);
  };
  const renderSlide = (item: UPSwiperItem, index: number) => {
    const source = sourceOf(item, props.keyName ?? 'url');
    const frameStyle: ViewStyle = {
      height: props.vertical ? slideSpan || height : height,
      overflow: 'hidden',
      width: props.vertical ? '100%' : slideSpan || '100%',
    };
    const defaultItem = isVideo(item, props.keyName ?? 'url') ? (
      <View style={{ alignItems: 'center', backgroundColor: '#202124', flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: '#ffffff', fontSize: 13 }}>Use renderItem for video slides</Text>
      </View>
    ) : (
      <Image resizeMode={resizeModes[props.imgMode ?? 'aspectFill'] ?? 'cover'} source={{ uri: source }} style={{ flex: 1, height: '100%', width: '100%' }} testID={`up-swiper-image-${index}`} />
    );
    const title = props.showTitle ? titleOf(item) : '';
    return (
      <Pressable key={`${source}-${index}`} onPress={() => input.onClick?.(index)} style={frameStyle} testID={`up-swiper-item-${index}`}>
        {input.renderItem?.(item, index) ?? defaultItem}
        {title ? <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', bottom: 0, left: 0, paddingHorizontal: 12, paddingVertical: 6, position: 'absolute', right: 0 }}><Text numberOfLines={1} style={{ color: '#ffffff', fontSize: 14 }}>{title}</Text></View> : null}
      </Pressable>
    );
  };
  const indicator = input.renderIndicator?.(currentIndex, items.length) ?? (
    props.indicator && !props.loading && !props.showTitle ? (
      <UPSwiperIndicator
        current={currentIndex}
        customStyle={nativeIndicatorStyle(props.indicatorStyle)}
        indicatorActiveColor={props.indicatorActiveColor}
        indicatorInactiveColor={props.indicatorInactiveColor}
        indicatorMode={props.indicatorMode}
        length={items.length}
      />
    ) : null
  );

  return (
    <View
      onLayout={onLayout}
      style={[{ backgroundColor: props.bgColor, borderRadius: radius, height, overflow: 'hidden', position: 'relative', width: '100%' }, input.customStyle]}
      testID="up-swiper"
    >
      {props.loading ? (
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }} testID="up-swiper-loading">
          <UPLoadingIcon mode="circle" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={props.vertical ? { paddingBottom: nextMargin, paddingTop: previousMargin } : { paddingLeft: previousMargin, paddingRight: nextMargin }}
          decelerationRate="fast"
          horizontal={!props.vertical}
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled={displayMultipleItems === 1 && !previousMargin && !nextMargin}
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={slideSpan || undefined}
          testID="up-swiper-scroll"
        >
          {items.map(renderSlide)}
        </ScrollView>
      )}
      {indicator ? <View style={{ bottom: 10, left: 0, position: 'absolute', right: 0, alignItems: 'center' }} testID="up-swiper-indicator-container">{indicator}</View> : null}
    </View>
  );
}
