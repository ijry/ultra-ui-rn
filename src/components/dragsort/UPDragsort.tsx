import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';

export type UPDragsortDirection = 'vertical' | 'horizontal' | 'all';

export type UPDragsortItem = Record<string, unknown> & {
  draggable?: boolean;
  id?: number | string;
  key?: number | string;
  label?: React.ReactNode;
};

export type UPDragsortRenderPayload<T = UPDragsortItem> = {
  dragging: boolean;
  index: number;
  item: T;
};

export type UPDragsortProps<T = UPDragsortItem> = {
  children?: React.ReactNode | ((payload: UPDragsortRenderPayload<T>) => React.ReactNode);
  columns?: number;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  direction?: UPDragsortDirection;
  draggable?: boolean;
  initialList?: readonly T[];
  itemHeight?: UPDimension;
  itemWidth?: UPDimension;
  renderHandler?: (payload: UPDragsortRenderPayload<T>) => React.ReactNode;
  renderItem?: (payload: UPDragsortRenderPayload<T>) => React.ReactNode;
  /** @deprecated React Native core has no source-equivalent haptic API. */
  vibrate?: boolean;
  onDragEnd?: (nextList: readonly T[]) => void;
};

type ResolvedUPDragsortProps<T> = UPDragsortProps<T> & {
  columns: number;
  direction: UPDragsortDirection;
  draggable: boolean;
  initialList: readonly T[];
  itemHeight: UPDimension;
  itemWidth: UPDimension;
  vibrate: boolean;
};

type DragState = {
  fromIndex: number;
  targetIndex: number;
};

function clampIndex(value: number, length: number): number {
  return range(0, Math.max(0, length - 1), value);
}

function safePx(value: UPDimension | undefined, fallback: number): number {
  const next = getPx(value ?? fallback);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  if (fromIndex === toIndex) return next;
  if (fromIndex < 0 || fromIndex >= next.length) return next;
  if (toIndex < 0 || toIndex >= next.length) return next;
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function getDragsortTargetIndex(options: {
  columns: number;
  direction: UPDragsortDirection;
  dx: number;
  dy: number;
  fromIndex: number;
  itemHeight: number;
  itemWidth: number;
  length: number;
}): number {
  const {
    columns,
    direction,
    dx,
    dy,
    fromIndex,
    itemHeight,
    itemWidth,
    length,
  } = options;

  if (length <= 0) return 0;
  if (direction === 'horizontal') {
    return clampIndex(fromIndex + Math.round(dx / itemWidth), length);
  }
  if (direction === 'all') {
    const safeColumns = Math.max(1, Math.floor(columns));
    const startRow = Math.floor(fromIndex / safeColumns);
    const startColumn = fromIndex % safeColumns;
    const nextRow = Math.max(0, startRow + Math.round(dy / itemHeight));
    const nextColumn = range(0, safeColumns - 1, startColumn + Math.round(dx / itemWidth));
    return clampIndex(nextRow * safeColumns + nextColumn, length);
  }
  return clampIndex(fromIndex + Math.round(dy / itemHeight), length);
}

function getItemKey(item: unknown, index: number): string {
  if (item && typeof item === 'object') {
    const keyed = item as { id?: number | string; key?: number | string };
    const key = keyed.id ?? keyed.key;
    if (key !== undefined) return String(key);
  }
  return `up-dragsort-${index}`;
}

function defaultContent(item: unknown): React.ReactNode {
  if (item && typeof item === 'object' && 'label' in item) {
    const label = (item as { label?: React.ReactNode }).label;
    return typeof label === 'string' || typeof label === 'number' ? <Text>{label}</Text> : label;
  }
  return <Text>{String(item)}</Text>;
}

function InnerUPDragsort<T = UPDragsortItem>(input: UPDragsortProps<T>) {
  const config = useUPConfig();
  const props = {
    ...config.props.dragsort,
    ...input,
  } as ResolvedUPDragsortProps<T>;
  const [items, setItems] = useState<T[]>(() => [...props.initialList]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemHeight = safePx(props.itemHeight, 50);
  const itemWidth = safePx(props.itemWidth, 100);
  const columns = props.direction === 'all'
    ? Math.max(1, Math.floor(Number(props.columns)))
    : Math.max(1, items.length);
  const rows = props.direction === 'all' ? Math.ceil(items.length / columns) : 1;

  useEffect(() => {
    setItems([...(input.initialList ?? props.initialList)]);
  }, [input.initialList, props.initialList]);

  const startDrag = useCallback((index: number) => {
    const item = items[index] as { draggable?: boolean } | undefined;
    if (!props.draggable || item?.draggable === false) return;
    const next = { fromIndex: index, targetIndex: index };
    dragRef.current = next;
    setDrag(next);
  }, [items, props.draggable]);

  const moveDrag = useCallback((gesture: PanResponderGestureState) => {
    const current = dragRef.current;
    if (!current) return;
    const targetIndex = getDragsortTargetIndex({
      columns,
      direction: props.direction,
      dx: gesture.dx,
      dy: gesture.dy,
      fromIndex: current.fromIndex,
      itemHeight,
      itemWidth,
      length: items.length,
    });
    const next = { ...current, targetIndex };
    dragRef.current = next;
    setDrag(next);
  }, [columns, itemHeight, itemWidth, items.length, props.direction]);

  const finishDrag = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current || current.fromIndex === current.targetIndex) return;
    setItems((latest) => {
      const next = moveItem(latest, current.fromIndex, current.targetIndex);
      input.onDragEnd?.(next);
      return next;
    });
  }, [input]);

  const createResponder = useCallback((index: number) => PanResponder.create({
    onMoveShouldSetPanResponder: () => Boolean(props.draggable),
    onMoveShouldSetPanResponderCapture: () => Boolean(props.draggable),
    onPanResponderGrant: () => startDrag(index),
    onPanResponderMove: (_event: GestureResponderEvent, gesture) => moveDrag(gesture),
    onPanResponderRelease: finishDrag,
    onPanResponderTerminate: finishDrag,
    onStartShouldSetPanResponder: () => Boolean(props.draggable),
  }), [finishDrag, moveDrag, props.draggable, startDrag]);

  const responders = useMemo(
    () => items.map((_item, index) => createResponder(index)),
    [createResponder, items],
  );
  const width = props.direction === 'horizontal'
    ? itemWidth * items.length
    : props.direction === 'all'
      ? itemWidth * columns
      : itemWidth;
  const height = props.direction === 'horizontal'
    ? itemHeight
    : props.direction === 'all'
      ? rows * itemHeight
      : itemHeight * items.length;

  return (
    <View style={[{ height, position: 'relative', width }, input.customStyle]} testID="up-dragsort">
      {items.map((item, index) => {
        const dragging = drag?.fromIndex === index;
        const displayIndex = dragging ? drag.targetIndex : index;
        const row = props.direction === 'all' ? Math.floor(displayIndex / columns) : displayIndex;
        const column = props.direction === 'all' ? displayIndex % columns : displayIndex;
        const payload = { dragging, index, item };
        const content = props.renderItem?.(payload)
          ?? (typeof input.children === 'function' ? input.children(payload) : input.children)
          ?? defaultContent(item);
        const panHandlers = responders[index]?.panHandlers ?? {};
        const itemHandlers = props.renderHandler ? {} : panHandlers;
        const handler = props.renderHandler ? (
          <View testID={`up-dragsort-handler-${index}`} {...panHandlers}>
            {props.renderHandler(payload)}
          </View>
        ) : null;

        return (
          <View
            key={getItemKey(item, index)}
            style={{
              height: itemHeight,
              left: props.direction === 'vertical' ? 0 : column * itemWidth,
              opacity: dragging ? 0.85 : 1,
              position: 'absolute',
              top: props.direction === 'horizontal' ? 0 : row * itemHeight,
              width: itemWidth,
            }}
            testID={`up-dragsort-item-${index}`}
            {...itemHandlers}
          >
            {handler}
            {content}
          </View>
        );
      })}
    </View>
  );
}

export const UPDragsort = InnerUPDragsort as <T = UPDragsortItem>(
  props: UPDragsortProps<T>,
) => React.JSX.Element;
