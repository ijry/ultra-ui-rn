import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import {
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import {
  calculateWaterfallColumns,
  composeWaterfallData,
  createWaterfallAddQueue,
  createWaterfallAfterAddOnePayload,
  modifyWaterfallItem,
  reconcileWaterfallItems,
  resolveWaterfallId,
  warnDuplicateWaterfallIds,
} from './state';
import type { UPWaterfallProps, UPWaterfallRef } from './types';

function resolveHeight(value: number | string): ViewStyle['height'] {
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    return value as ViewStyle['height'];
  }
  const height = getPx(value);
  return Number.isFinite(height) && height > 0 ? height : undefined;
}

function resolveItemHeight(
  measured: number | undefined,
  estimatedItemSize: number | string,
): number {
  if (measured !== undefined && Number.isFinite(measured) && measured > 0) {
    return measured;
  }
  const estimated = getPx(estimatedItemSize);
  return Number.isFinite(estimated) && estimated > 0 ? estimated : 0;
}

function resolveWaterfallRenderKey<T>(
  items: readonly T[],
  item: T,
  index: number,
  idKey: string,
): string {
  const id = resolveWaterfallId(item, index, idKey);
  const occurrence = items
    .slice(0, index)
    .filter(
      (candidate, candidateIndex) =>
        resolveWaterfallId(candidate, candidateIndex, idKey) === id,
    ).length;
  return occurrence === 0 ? String(id) : `${String(id)}:${occurrence}`;
}

function UPWaterfallInner<T = unknown>(
  input: UPWaterfallProps<T>,
  ref: React.ForwardedRef<UPWaterfallRef<T>>,
): React.JSX.Element {
  const config = useUPConfig();
  const defaults = config.props.waterfall;
  const props = {
    ...defaults,
    ...input,
  } as Required<
    Pick<
      UPWaterfallProps<T>,
      | 'addTime'
      | 'columns'
      | 'columnsMin'
      | 'estimatedItemSize'
      | 'height'
      | 'idKey'
      | 'minColumnWidth'
      | 'optimizeItemArrangement'
    >
  > &
    UPWaterfallProps<T>;
  const sourceValue =
    input.modelValue !== undefined
      ? input.modelValue
      : input.value !== undefined
        ? input.value
        : input.defaultValue !== undefined
          ? input.defaultValue
          : props.value ?? [];
  const [displayed, setDisplayed] = useState<readonly T[]>(() => [...sourceValue]);
  const [pending, setPending] = useState<readonly T[]>([]);
  const displayedRef = useRef<readonly T[]>([...sourceValue]);
  const pendingRef = useRef<readonly T[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlashListRef<T> | null>(null);
  const measuredHeightsRef = useRef<Map<string | number, number>>(new Map());
  const modelValueWarningRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const replaceQueue = useCallback(
    (nextDisplayed: readonly T[], nextPending: readonly T[]) => {
      const displayedNext = [...nextDisplayed];
      const pendingNext = [...nextPending];
      displayedRef.current = displayedNext;
      pendingRef.current = pendingNext;
      setDisplayed(displayedNext);
      setPending(pendingNext);
    },
    [],
  );

  const emitMutation = useCallback(
    (nextDisplayed: readonly T[], nextPending: readonly T[]) => {
      const displayedNext = [...nextDisplayed];
      const pendingNext = [...nextPending];
      const next = composeWaterfallData(displayedNext, pendingNext);
      displayedRef.current = displayedNext;
      pendingRef.current = pendingNext;
      setDisplayed(displayedNext);
      setPending(pendingNext);
      input.onUpdateModelValue?.(next);
      input.onChange?.(next);
    },
    [input.onChange, input.onUpdateModelValue],
  );

  useEffect(() => {
    if (
      typeof __DEV__ !== 'undefined' &&
      __DEV__ &&
      input.modelValue !== undefined &&
      input.value !== undefined &&
      !modelValueWarningRef.current
    ) {
      modelValueWarningRef.current = true;
      console.warn('[UPWaterfall] modelValue takes precedence over value.');
    }
  }, [input.modelValue, input.value]);

  useEffect(() => {
    warnDuplicateWaterfallIds(sourceValue, props.idKey);

    const previousDisplayed = displayedRef.current;
    const previousPending = pendingRef.current;
    const previousQueue = composeWaterfallData(previousDisplayed, previousPending);
    const reconciled = reconcileWaterfallItems(
      previousQueue,
      sourceValue,
      props.idKey,
    );

    if (props.addTime <= 0) {
      replaceQueue(reconciled.displayed, []);
      return;
    }

    const additions = createWaterfallAddQueue(
      previousQueue,
      sourceValue,
      props.idKey,
    );
    const previousIds = new Set(
      previousQueue.map((item, index) =>
        resolveWaterfallId(item, index, props.idKey),
      ),
    );
    const pendingIds = new Set(
      previousPending.map((item, index) =>
        resolveWaterfallId(item, index, props.idKey),
      ),
    );
    const incomingPending = sourceValue.filter((item, index) =>
      pendingIds.has(resolveWaterfallId(item, index, props.idKey)),
    );
    const nextPending = [...incomingPending, ...additions];
    const nextPendingIds = new Set(
      nextPending.map((item, index) =>
        resolveWaterfallId(item, index, props.idKey),
      ),
    );
    const nextDisplayed = sourceValue.filter(
      (item, index) =>
        !nextPendingIds.has(resolveWaterfallId(item, index, props.idKey)),
    );

    if (additions.length === 0 && previousPending.length === 0) {
      replaceQueue(reconciled.displayed, []);
      return;
    }

    if (previousPending.length > 0 && nextPending.length === 0) {
      replaceQueue(nextDisplayed, []);
      return;
    }

    if (additions.length > 0 || nextPending.length > 0) {
      replaceQueue(nextDisplayed, nextPending);
      return;
    }

    if (previousIds.size === 0) {
      replaceQueue(reconciled.displayed, []);
    }
  }, [
    props.addTime,
    props.idKey,
    replaceQueue,
    sourceValue,
  ]);

  useEffect(() => {
    if (pending.length === 0) return undefined;

    timerRef.current = setTimeout(() => {
      const queued = pendingRef.current;
      if (queued.length === 0) return;

      const [nextItem, ...remaining] = queued;
      const nextDisplayed = [...displayedRef.current, nextItem];
      const itemId = resolveWaterfallId(
        nextItem,
        nextDisplayed.length - 1,
        props.idKey,
      );
      const height = resolveItemHeight(
        measuredHeightsRef.current.get(itemId),
        props.estimatedItemSize,
      );

      timerRef.current = null;
      replaceQueue(nextDisplayed, remaining);
      input.onAfterAddOne?.(
        createWaterfallAfterAddOnePayload(nextItem, height),
      );
      if (remaining.length === 0) {
        input.onAfterAddAll?.({ newData: [...nextDisplayed] });
      }
    }, Math.max(0, Number(props.addTime)));

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    input.onAfterAddAll,
    input.onAfterAddOne,
    pending,
    props.addTime,
    props.estimatedItemSize,
    props.idKey,
    replaceQueue,
  ]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      remove: (id) => {
        const displayedIndex = displayedRef.current.findIndex(
          (item, index) =>
            resolveWaterfallId(item, index, props.idKey) === id,
        );
        if (displayedIndex >= 0) {
          emitMutation(
            displayedRef.current.filter(
              (_item, index) => index !== displayedIndex,
            ),
            pendingRef.current,
          );
          return true;
        }

        const pendingIndex = pendingRef.current.findIndex(
          (item, index) =>
            resolveWaterfallId(item, index, props.idKey) === id,
        );
        if (pendingIndex < 0) return false;

        emitMutation(
          displayedRef.current,
          pendingRef.current.filter((_item, index) => index !== pendingIndex),
        );
        return true;
      },
      clear: () => {
        emitMutation([], []);
      },
      modify: (id, key, value) => {
        const displayedIndex = displayedRef.current.findIndex(
          (item, index) =>
            resolveWaterfallId(item, index, props.idKey) === id,
        );
        if (displayedIndex >= 0) {
          const modified = modifyWaterfallItem(
            displayedRef.current[displayedIndex],
            key,
            value,
          );
          if (modified === undefined) return false;
          const nextDisplayed = [...displayedRef.current];
          nextDisplayed[displayedIndex] = modified;
          emitMutation(nextDisplayed, pendingRef.current);
          return true;
        }

        const pendingIndex = pendingRef.current.findIndex(
          (item, index) =>
            resolveWaterfallId(item, index, props.idKey) === id,
        );
        if (pendingIndex < 0) return false;

        const modified = modifyWaterfallItem(
          pendingRef.current[pendingIndex],
          key,
          value,
        );
        if (modified === undefined) return false;
        const nextPending = [...pendingRef.current];
        nextPending[pendingIndex] = modified;
        emitMutation(displayedRef.current, nextPending);
        return true;
      },
      getData: () => displayedRef.current,
      scrollToIndex: (index, animated = false) => {
        if (index < 0 || index >= displayedRef.current.length) return;
        listRef.current?.scrollToIndex({ index, animated });
      },
      scrollToTop: (animated = false) => {
        listRef.current?.scrollToOffset({ offset: 0, animated });
      },
    }),
    [emitMutation, props.idKey],
  );

  const columnCount = calculateWaterfallColumns(
    containerWidth,
    props.columns,
    props.columnsMin,
    props.minColumnWidth,
  );
  const emptyComponent =
    input.empty === undefined ? undefined : () => <>{input.empty}</>;
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    input.onScroll?.(event.nativeEvent.contentOffset.y);
  };

  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={[
        { height: resolveHeight(props.height), overflow: 'hidden' },
        input.customStyle as StyleProp<ViewStyle>,
      ]}
      testID="up-waterfall"
    >
      <FlashList
        data={[...displayed]}
        keyExtractor={(item, index) =>
          resolveWaterfallRenderKey(displayed, item, index, props.idKey)
        }
        masonry
        numColumns={columnCount}
        onEndReached={() => input.onEndReached?.()}
        onScroll={onScroll}
        optimizeItemArrangement={Boolean(props.optimizeItemArrangement)}
        ref={listRef}
        renderItem={({ item, index }) => {
          const id = resolveWaterfallId(item, index, props.idKey);
          return (
            <View
              onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) {
                  measuredHeightsRef.current.set(id, height);
                }
              }}
              testID={`up-waterfall-item-${String(id)}`}
            >
              {input.renderItem?.({ id, index, item })}
            </View>
          );
        }}
        testID="up-waterfall-list"
        ListEmptyComponent={emptyComponent}
      />
    </View>
  );
}

export const UPWaterfall = forwardRef(UPWaterfallInner) as <
  T = unknown
>(
  props: UPWaterfallProps<T> & React.RefAttributes<UPWaterfallRef<T>>,
) => React.JSX.Element;
