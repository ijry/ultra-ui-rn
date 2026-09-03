import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPVirtualListRange = {
  start: number;
  end: number;
};

export type UPVirtualListRenderItem<T = unknown> = T extends object
  ? T & { _virtualIndex: number }
  : { value: T; _virtualIndex: number };

export type UPVirtualListRenderPayload<T = unknown> = {
  item: UPVirtualListRenderItem<T>;
  index: number;
};

export type UPVirtualListRef = {
  scrollTo: (top: number) => void;
  scrollToTop: () => void;
  getVisibleRange: () => UPVirtualListRange;
};

export type UPVirtualListProps<T = unknown> = {
  listData?: readonly T[];
  itemHeight?: UPDimension;
  height?: UPDimension;
  buffer?: number;
  keyField?: string;
  scrollTop?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPVirtualListRenderPayload<T>) => React.ReactNode;
  children?: React.ReactNode | ((payload: UPVirtualListRenderPayload<T>) => React.ReactNode);
  onUpdateScrollTop?: (scrollTop: number) => void;
  onScroll?: (scrollTop: number) => void;
};

export type UPVirtualListComponent = <T = unknown>(
  props: UPVirtualListProps<T> & React.RefAttributes<UPVirtualListRef>,
) => React.JSX.Element;

function normalizeItem<T>(item: T, index: number): UPVirtualListRenderItem<T> {
  if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
    return { ...(item as Record<string, unknown>), _virtualIndex: index } as UPVirtualListRenderItem<T>;
  }
  return { value: item, _virtualIndex: index } as UPVirtualListRenderItem<T>;
}

function calculationHeight(value: UPDimension | undefined) {
  if (value === undefined || value === '') return 500;
  if (typeof value === 'string' && value.trim().endsWith('%')) return 500;
  const next = getPx(value);
  return Number.isFinite(next) && next > 0 ? next : 500;
}

function nativeHeight(value: UPDimension | undefined): ViewStyle['height'] {
  if (value === undefined || value === '') return '100%';
  if (typeof value === 'string' && value.trim().endsWith('%')) return value as ViewStyle['height'];
  const next = getPx(value);
  return Number.isFinite(next) && next > 0 ? next : undefined;
}

function positivePx(value: UPDimension | undefined, fallback: number) {
  const next = value === undefined || value === '' ? fallback : getPx(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function UPVirtualListInner<T = unknown>(input: UPVirtualListProps<T>, ref: React.ForwardedRef<UPVirtualListRef>) {
  const props = { ...useUPConfig().props.virtualList, ...input } as Required<
    Pick<UPVirtualListProps<T>, 'buffer' | 'height' | 'itemHeight' | 'keyField' | 'listData' | 'scrollTop'>
  > &
    UPVirtualListProps<T>;
  const scrollRef = useRef<ScrollView>(null);
  const itemHeight = positivePx(props.itemHeight, 50);
  const containerHeight = calculationHeight(props.height);
  const [scrollTop, setScrollTop] = useState(() => Math.max(0, getPx(props.scrollTop)));
  const scrollTopRef = useRef(scrollTop);
  const buffer = Math.max(0, Math.floor(Number(props.buffer) || 0));
  const remain = Math.max(1, Math.ceil(containerHeight / itemHeight));
  const visibleCount = remain + buffer;
  const range = useMemo<UPVirtualListRange>(() => {
    const rawStart = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, rawStart - Math.floor(buffer / 2));
    const end = Math.min(props.listData.length, start + visibleCount);
    return { end, start };
  }, [buffer, itemHeight, props.listData.length, scrollTop, visibleCount]);
  const rangeRef = useRef(range);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    const next = Math.max(0, getPx(props.scrollTop));
    // Source `scrollTop` is a two-way binding, so a caller that feeds
    // `onUpdateScrollTop` back arrives here with the value we just reported.
    // Re-issuing `scrollTo` for it would fight the in-progress gesture and kill
    // momentum, so echoes are ignored.
    if (Math.abs(next - scrollTopRef.current) < 1) return;
    scrollTopRef.current = next;
    setScrollTop(next);
    scrollRef.current?.scrollTo({ animated: false, y: next });
  }, [props.scrollTop]);

  const scrollTo = useCallback((top: number) => {
    const next = Number.isFinite(top) && top > 0 ? top : 0;
    scrollTopRef.current = next;
    setScrollTop(next);
    scrollRef.current?.scrollTo({ animated: false, y: next });
  }, []);

  const scrollToTop = useCallback(() => scrollTo(0), [scrollTo]);
  const getVisibleRange = useCallback(() => rangeRef.current, []);

  useImperativeHandle(ref, () => ({ getVisibleRange, scrollTo, scrollToTop }), [
    getVisibleRange,
    scrollTo,
    scrollToTop,
  ]);

  const render = input.renderItem ?? (typeof input.children === 'function' ? input.children : undefined);
  const visibleItems = props.listData.slice(range.start, range.end).map((item, index) => ({
    item: normalizeItem(item, range.start + index),
    sourceIndex: range.start + index,
  }));
  const topHeight = range.start * itemHeight;
  const bottomHeight = Math.max(0, (props.listData.length - range.end) * itemHeight);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y;
    const normalized = Number.isFinite(next) && next > 0 ? next : 0;
    scrollTopRef.current = normalized;
    setScrollTop(normalized);
    input.onUpdateScrollTop?.(normalized);
    input.onScroll?.(normalized);
  };

  return (
    <View style={[{ height: nativeHeight(props.height), overflow: 'hidden' }, input.customStyle]} testID="up-virtual-list">
      <ScrollView
        onScroll={onScroll}
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ height: '100%' }}
        testID="up-virtual-list-scroll"
      >
        <View style={{ height: topHeight }} testID="up-virtual-list-top-spacer" />
        {visibleItems.map(({ item, sourceIndex }) => {
          const record = item as Record<string, unknown>;
          const key = props.keyField in record ? String(record[props.keyField]) : String(sourceIndex);
          return (
            <View key={key} style={{ height: itemHeight }} testID={`up-virtual-list-item-${sourceIndex}`}>
              {render?.({ item, index: sourceIndex })}
            </View>
          );
        })}
        <View style={{ height: bottomHeight }} testID="up-virtual-list-bottom-spacer" />
      </ScrollView>
    </View>
  );
}

export const UPVirtualList = forwardRef(UPVirtualListInner) as UPVirtualListComponent;
