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
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPLoadingIcon } from '../loading-icon';
import { UPLoadmore, type UPLoadmoreProps } from '../loadmore';

export type UPPullRefreshStatus = 'pull' | 'release' | 'refreshing';

export type UPPullRefreshRenderState = {
  distance: number;
  threshold: number;
  status: UPPullRefreshStatus;
};

export type UPPullRefreshRef = {
  startRefresh: () => void;
  finishRefresh: () => void;
  resetRefresh: () => void;
};

export type UPPullRefreshProps = {
  refreshing?: boolean;
  threshold?: UPDimension;
  damping?: number;
  maxDistance?: UPDimension;
  showLoadmore?: boolean;
  loadmoreProps?: UPLoadmoreProps;
  useScrollView?: boolean;
  enableBackToTop?: boolean;
  lowerThreshold?: UPDimension;
  scrollTop?: UPDimension;
  height?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  children?: React.ReactNode;
  pull?: (state: UPPullRefreshRenderState) => React.ReactNode;
  release?: (state: UPPullRefreshRenderState) => React.ReactNode;
  refreshingNode?: React.ReactNode;
  onRefresh?: () => void;
  onLoadmore?: () => void;
  onScroll?: (scrollTop: number) => void;
};

function readTouchY(event: unknown) {
  const nativeEvent = (event as { nativeEvent?: { pageY?: number; touches?: Array<{ pageY?: number }> } }).nativeEvent;
  return nativeEvent?.touches?.[0]?.pageY ?? nativeEvent?.pageY ?? 0;
}

function normalizeDistance(value: UPDimension | undefined, fallback: number) {
  const next = value === undefined || value === '' ? fallback : getPx(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function normalizeStyleHeight(value: UPDimension): ViewStyle['height'] {
  if (typeof value === 'string' && value.trim().endsWith('%')) return value as ViewStyle['height'];
  const next = getPx(value);
  return Number.isFinite(next) && next > 0 ? next : undefined;
}

function renderDefaultHeader(status: UPPullRefreshStatus) {
  if (status === 'refreshing') {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
        <UPLoadingIcon mode="circle" size={22} text="刷新中..." vertical />
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
      <UPIcon color="#606266" name={status === 'release' ? 'arrow-upward' : 'arrow-downward'} size={26} />
      <Text style={{ color: '#303133', fontSize: 14 }}>{status === 'release' ? '释放刷新' : '下拉刷新'}</Text>
    </View>
  );
}

export const UPPullRefresh = forwardRef<UPPullRefreshRef, UPPullRefreshProps>(function UPPullRefresh(input, ref) {
  const props = { ...useUPConfig().props.pullRefresh, ...input } as Required<
    Pick<
      UPPullRefreshProps,
      | 'damping'
      | 'enableBackToTop'
      | 'height'
      | 'lowerThreshold'
      | 'maxDistance'
      | 'scrollTop'
      | 'showLoadmore'
      | 'threshold'
      | 'useScrollView'
    >
  > &
    UPPullRefreshProps;
  const threshold = normalizeDistance(props.threshold, 80);
  const maxDistance = normalizeDistance(props.maxDistance, 120);
  const [distance, setDistance] = useState(0);
  const [status, setStatus] = useState<UPPullRefreshStatus>('pull');
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const startYRef = useRef(0);
  const touchingRef = useRef(false);
  const distanceRef = useRef(0);
  const scrollTopRef = useRef(getPx(props.scrollTop));
  const lowerEnteredRef = useRef(false);
  const isRefreshing = props.refreshing ?? internalRefreshing;

  const resetRefresh = useCallback(() => {
    distanceRef.current = 0;
    setDistance(0);
    setStatus('pull');
    setInternalRefreshing(false);
  }, []);

  const startRefresh = useCallback(() => {
    distanceRef.current = threshold;
    setDistance(threshold);
    setStatus('refreshing');
    setInternalRefreshing(true);
  }, [threshold]);

  const finishRefresh = useCallback(() => {
    resetRefresh();
  }, [resetRefresh]);

  useImperativeHandle(ref, () => ({ finishRefresh, resetRefresh, startRefresh }), [
    finishRefresh,
    resetRefresh,
    startRefresh,
  ]);

  useEffect(() => {
    scrollTopRef.current = getPx(props.scrollTop);
  }, [props.scrollTop]);

  useEffect(() => {
    if (props.refreshing === true) {
      distanceRef.current = threshold;
      setDistance(threshold);
      setStatus('refreshing');
    } else if (props.refreshing === false && !touchingRef.current) {
      resetRefresh();
    }
  }, [props.refreshing, resetRefresh, threshold]);

  const renderState = useMemo(() => ({ distance, status, threshold }), [distance, status, threshold]);

  const renderHeader = () => {
    if (status === 'refreshing' && props.refreshingNode) return props.refreshingNode;
    if (status === 'release' && props.release) return props.release(renderState);
    if (status === 'pull' && props.pull) return props.pull(renderState);
    return renderDefaultHeader(status);
  };

  const onTouchStart = (event: unknown) => {
    if (isRefreshing) return;
    touchingRef.current = true;
    startYRef.current = readTouchY(event);
    setStatus('pull');
  };

  const onTouchMove = (event: unknown) => {
    if (!touchingRef.current || isRefreshing || scrollTopRef.current > 0) return;
    const diff = readTouchY(event) - startYRef.current;
    if (diff <= 0) return;
    const nextDistance = Math.min(maxDistance, diff * props.damping);
    distanceRef.current = nextDistance;
    setDistance(nextDistance);
    setStatus(nextDistance >= threshold ? 'release' : 'pull');
  };

  const onTouchEnd = () => {
    if (!touchingRef.current) return;
    touchingRef.current = false;
    if (distanceRef.current >= threshold && !isRefreshing) {
      startRefresh();
      input.onRefresh?.();
    } else if (!isRefreshing) {
      resetRefresh();
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    scrollTopRef.current = Number.isFinite(offset) && offset > 0 ? offset : 0;
    input.onScroll?.(scrollTopRef.current);
    const lowerThreshold = getPx(props.lowerThreshold);
    const lower =
      scrollTopRef.current + event.nativeEvent.layoutMeasurement.height >=
      event.nativeEvent.contentSize.height - lowerThreshold;
    if (
      lower &&
      !lowerEnteredRef.current &&
      props.showLoadmore &&
      (props.loadmoreProps?.status ?? 'loadmore') === 'loadmore'
    ) {
      input.onLoadmore?.();
    }
    lowerEnteredRef.current = lower;
  };

  const footer = props.showLoadmore ? <UPLoadmore {...props.loadmoreProps} onLoadmore={input.onLoadmore} /> : null;
  const content = (
    <>
      {input.children}
      {footer}
    </>
  );

  return (
    <View
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      style={[
        { height: normalizeStyleHeight(props.height), overflow: 'hidden', position: 'relative' },
        input.customStyle,
      ]}
      testID="up-pull-refresh"
    >
      <View
        style={[
          {
            alignItems: 'center',
            height: distance,
            justifyContent: 'flex-end',
            left: 0,
            overflow: 'hidden',
            position: 'absolute',
            right: 0,
            top: 0,
          },
        ]}
        testID="up-pull-refresh-area"
      >
        {renderHeader()}
      </View>
      <View style={{ flex: 1, transform: [{ translateY: distance }] }} testID="up-pull-refresh-content">
        {props.useScrollView ? (
          <ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={Boolean(props.enableBackToTop)}
            testID="up-pull-refresh-scroll"
          >
            {content}
          </ScrollView>
        ) : (
          <View testID="up-pull-refresh-static">{content}</View>
        )}
      </View>
    </View>
  );
});
