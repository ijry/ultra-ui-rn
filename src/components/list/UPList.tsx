import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPListAnchorContext } from './context';

export type UPListProps = {
  showScrollbar?: boolean;
  lowerThreshold?: UPDimension;
  upperThreshold?: UPDimension;
  scrollTop?: UPDimension;
  /** @deprecated React Native core does not expose nvue scroll accuracy. */
  offsetAccuracy?: UPDimension;
  /** @deprecated React Native always supports native flex layout. */
  enableFlex?: boolean;
  pagingEnabled?: boolean;
  scrollable?: boolean;
  scrollIntoView?: string;
  scrollWithAnimation?: boolean;
  /** @deprecated React Native does not expose mini-program status-bar back-to-top behavior. */
  enableBackToTop?: boolean;
  height?: UPDimension;
  width?: UPDimension;
  /** @deprecated React Native core ScrollView does not virtualize source child preloading. */
  preLoadScreen?: UPDimension;
  refresherEnabled?: boolean;
  /** @deprecated Core RefreshControl does not expose a source pull threshold. */
  refresherThreshold?: number;
  /** @deprecated Core RefreshControl does not expose source default-style modes. */
  refresherDefaultStyle?: string;
  refresherBackground?: string;
  refresherTriggered?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  onScrollToLower?: () => void;
  onScrollToUpper?: () => void;
  onRefresherRefresh?: () => void;
  /** @deprecated Core RefreshControl does not expose source pulling lifecycle events. */
  onRefresherPulling?: () => void;
  /** @deprecated Core RefreshControl does not expose source restore lifecycle events. */
  onRefresherRestore?: () => void;
  /** @deprecated Core RefreshControl does not expose source abort lifecycle events. */
  onRefresherAbort?: () => void;
};

function dimension(value: UPDimension | undefined): number | undefined {
  if (value === undefined || value === '' || Number(value) === 0) return undefined;
  return getPx(value);
}

export function UPList(input: UPListProps): React.JSX.Element {
  const props = { ...useUPConfig().props.list, ...input } as UPListProps;
  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef(new Map<string | number, number>());
  const edgeState = useRef({ lower: false, upper: false });
  const registerAnchor = useCallback((anchor: string | number, y: number) => {
    anchors.current.set(anchor, y);
    if (String(anchor) === props.scrollIntoView) {
      scrollRef.current?.scrollTo({ animated: Boolean(props.scrollWithAnimation), y });
    }
  }, [props.scrollIntoView, props.scrollWithAnimation]);
  const context = useMemo(() => ({ registerAnchor }), [registerAnchor]);
  const height = dimension(props.height) ?? Dimensions.get('window').height;
  const width = dimension(props.width);
  const refreshControl = props.refresherEnabled ? (
    <RefreshControl
      onRefresh={input.onRefresherRefresh}
      progressBackgroundColor={props.refresherBackground}
      refreshing={Boolean(props.refresherTriggered)}
      testID="up-list-refresh"
    />
  ) : undefined;

  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: Boolean(props.scrollWithAnimation), y: getPx(props.scrollTop ?? 0) });
  }, [props.scrollTop, props.scrollWithAnimation]);

  useEffect(() => {
    if (!props.scrollIntoView) return;
    const y = anchors.current.get(props.scrollIntoView);
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ animated: Boolean(props.scrollWithAnimation), y });
    }
  }, [props.scrollIntoView, props.scrollWithAnimation]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offset = contentOffset.y;
    const upperThreshold = getPx(props.upperThreshold ?? 0);
    const lowerThreshold = getPx(props.lowerThreshold ?? 50);
    const upper = offset <= upperThreshold;
    const lower = offset + layoutMeasurement.height >= contentSize.height - lowerThreshold;
    input.onScroll?.(offset);
    if (upper && !edgeState.current.upper) input.onScrollToUpper?.();
    if (lower && !edgeState.current.lower) input.onScrollToLower?.();
    edgeState.current = { lower, upper };
  };

  return (
    <UPListAnchorContext.Provider value={context}>
      <ScrollView
        onScroll={onScroll}
        pagingEnabled={Boolean(props.pagingEnabled)}
        refreshControl={refreshControl}
        ref={scrollRef}
        scrollEnabled={props.scrollable !== false}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={Boolean(props.showScrollbar)}
        style={[{ height, width }, input.customStyle]}
        testID="up-list"
      >
        {input.children}
      </ScrollView>
    </UPListAnchorContext.Provider>
  );
}
