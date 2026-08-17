import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { type UPDimension } from '../../utils';
import { UPPullRefresh, type UPPullRefreshRef } from '../pull-refresh';
import {
  UPVirtualList,
  type UPVirtualListRange,
  type UPVirtualListRef,
  type UPVirtualListRenderPayload,
} from '../virtual-list';

export type UPRefreshVirtualListRef = {
  finishRefresh: () => void;
  scrollTo: (top: number) => void;
  scrollToTop: () => void;
  getVisibleRange: () => UPVirtualListRange;
};

export type UPRefreshVirtualListProps<T = unknown> = {
  listData?: readonly T[];
  itemHeight?: UPDimension;
  height?: UPDimension;
  buffer?: number;
  keyField?: string;
  scrollTop?: UPDimension;
  threshold?: UPDimension;
  refreshing?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderItem?: (payload: UPVirtualListRenderPayload<T>) => React.ReactNode;
  children?: React.ReactNode | ((payload: UPVirtualListRenderPayload<T>) => React.ReactNode);
  onRefresh?: () => void;
  onScroll?: (scrollTop: number) => void;
  onUpdateScrollTop?: (scrollTop: number) => void;
};

export type UPRefreshVirtualListComponent = <T = unknown>(
  props: UPRefreshVirtualListProps<T> & React.RefAttributes<UPRefreshVirtualListRef>,
) => React.JSX.Element;

function UPRefreshVirtualListInner<T = unknown>(
  input: UPRefreshVirtualListProps<T>,
  ref: React.ForwardedRef<UPRefreshVirtualListRef>,
) {
  const props = { ...useUPConfig().props.refreshVirtualList, ...input } as Required<
    Pick<
      UPRefreshVirtualListProps<T>,
      'buffer' | 'height' | 'itemHeight' | 'keyField' | 'listData' | 'scrollTop' | 'threshold'
    >
  > &
    UPRefreshVirtualListProps<T>;
  const pullRef = useRef<UPPullRefreshRef>(null);
  const listRef = useRef<UPVirtualListRef>(null);
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [localScrollTop, setLocalScrollTop] = useState(0);
  const refreshing = props.refreshing ?? localRefreshing;

  const finishRefresh = useCallback(() => {
    setLocalRefreshing(false);
    pullRef.current?.finishRefresh();
  }, []);

  const handleRefresh = useCallback(() => {
    setLocalRefreshing(true);
    input.onRefresh?.();
  }, [input.onRefresh]);

  const handleScroll = useCallback((next: number) => {
    setLocalScrollTop(next);
    input.onScroll?.(next);
  }, [input.onScroll]);

  const handleUpdateScrollTop = useCallback((next: number) => {
    setLocalScrollTop(next);
    input.onUpdateScrollTop?.(next);
  }, [input.onUpdateScrollTop]);

  useImperativeHandle(ref, () => ({
    finishRefresh,
    getVisibleRange: () => listRef.current?.getVisibleRange() ?? { end: 0, start: 0 },
    scrollTo: (top) => listRef.current?.scrollTo(top),
    scrollToTop: () => listRef.current?.scrollToTop(),
  }), [finishRefresh]);

  return (
    <View style={input.customStyle} testID="up-refresh-virtual-list">
      <UPPullRefresh
        height={props.height}
        onRefresh={handleRefresh}
        ref={pullRef}
        refreshing={refreshing}
        scrollTop={localScrollTop}
        threshold={props.threshold}
        useScrollView={false}
      >
        <UPVirtualList
          buffer={props.buffer}
          height={props.height}
          itemHeight={props.itemHeight}
          keyField={props.keyField}
          listData={props.listData}
          onScroll={handleScroll}
          onUpdateScrollTop={handleUpdateScrollTop}
          ref={listRef}
          renderItem={input.renderItem}
          scrollTop={props.scrollTop}
        >
          {input.children}
        </UPVirtualList>
      </UPPullRefresh>
    </View>
  );
}

export const UPRefreshVirtualList = forwardRef(UPRefreshVirtualListInner) as UPRefreshVirtualListComponent;
