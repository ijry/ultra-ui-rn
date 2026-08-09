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
  createWaterfallAddQueue,
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
    input.value !== undefined
      ? input.value
      : input.defaultValue !== undefined
        ? input.defaultValue
        : props.value ?? [];
  const [displayed, setDisplayed] = useState<readonly T[]>(() => [...sourceValue]);
  const [pending, setPending] = useState<readonly T[]>([]);
  const displayedRef = useRef<readonly T[]>([...sourceValue]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlashListRef<T> | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const replaceDisplayed = useCallback((next: readonly T[]) => {
    const normalized = [...next];
    displayedRef.current = normalized;
    setDisplayed(normalized);
  }, []);

  const emitChange = useCallback(
    (next: readonly T[]) => {
      const normalized = [...next];
      displayedRef.current = normalized;
      setDisplayed(normalized);
      input.onChange?.(normalized);
    },
    [input.onChange],
  );

  useEffect(() => {
    warnDuplicateWaterfallIds(sourceValue, props.idKey);

    const previous = displayedRef.current;
    const reconciled = reconcileWaterfallItems(previous, sourceValue, props.idKey);
    const additions = createWaterfallAddQueue(previous, sourceValue, props.idKey);

    if (props.addTime <= 0 || additions.length === 0) {
      replaceDisplayed(reconciled.displayed);
      setPending([]);
      return;
    }

    const previousIds = new Set(
      previous.map((item, index) => resolveWaterfallId(item, index, props.idKey)),
    );
    const additionIds = new Set(
      sourceValue
        .map((item, index) => ({
          id: resolveWaterfallId(item, index, props.idKey),
          isAddition: !previousIds.has(resolveWaterfallId(item, index, props.idKey)),
        }))
        .filter(({ isAddition }) => isAddition)
        .map(({ id }) => id),
    );
    const existingIncoming = reconciled.displayed.filter(
      (item, index) => !additionIds.has(resolveWaterfallId(item, index, props.idKey)),
    );

    replaceDisplayed(existingIncoming);
    setPending(additions);
  }, [
    props.addTime,
    props.idKey,
    replaceDisplayed,
    sourceValue,
  ]);

  useEffect(() => {
    if (pending.length === 0) return undefined;

    timerRef.current = setTimeout(() => {
      const [nextItem, ...remaining] = pending;
      const nextIndex = displayedRef.current.length;
      replaceDisplayed([...displayedRef.current, nextItem]);
      setPending(remaining);
      input.onAfterAddOne?.(nextItem, nextIndex);
      if (remaining.length === 0) input.onAfterAddAll?.();
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
    replaceDisplayed,
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
        const index = displayedRef.current.findIndex(
          (item, itemIndex) =>
            resolveWaterfallId(item, itemIndex, props.idKey) === id,
        );
        const pendingWithoutId = pending.filter(
          (item, itemIndex) =>
            resolveWaterfallId(item, itemIndex, props.idKey) !== id,
        );
        const removedFromPending = pendingWithoutId.length !== pending.length;

        if (index < 0 && !removedFromPending) return false;

        setPending(pendingWithoutId);
        if (index < 0) return true;

        emitChange(
          displayedRef.current.filter((_item, itemIndex) => itemIndex !== index),
        );
        return true;
      },
      clear: () => {
        setPending([]);
        emitChange([]);
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
    [emitChange, pending, props.idKey],
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
          String(resolveWaterfallId(item, index, props.idKey))
        }
        masonry
        numColumns={columnCount}
        onEndReached={() => input.onEndReached?.()}
        onScroll={onScroll}
        optimizeItemArrangement={Boolean(props.optimizeItemArrangement)}
        ref={listRef}
        renderItem={({ item, index }) =>
          input.renderItem
            ? (
                <>
                  {input.renderItem({
                    id: resolveWaterfallId(item, index, props.idKey),
                    index,
                    item,
                  })}
                </>
              )
            : null
        }
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
