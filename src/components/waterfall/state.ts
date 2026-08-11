import { getPx } from '../../utils';
import type { UPKey } from '../tree/types';
import type { UPWaterfallAfterAddOnePayload } from './types';

export type UPWaterfallReconcileResult<T> = {
  displayed: T[];
  removedIds: UPKey[];
  replacedIds: UPKey[];
};

export function resolveWaterfallId<T>(
  item: T,
  index: number,
  idKey: string,
): UPKey {
  if (item !== null && typeof item === 'object') {
    const value = (item as Record<string, unknown>)[idKey];
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (value !== undefined && value !== null) return String(value);
  }
  return `index:${index}`;
}

export function calculateWaterfallColumns(
  width: number,
  columns: number | 'auto',
  columnsMin: number,
  minColumnWidth: number | string,
): number {
  if (columns !== 'auto') return Math.max(1, Math.floor(Number(columns) || 1));
  const minimum = Math.max(1, Math.floor(Number(columnsMin) || 1));
  const itemWidth = Math.max(1, getPx(minColumnWidth));
  if (!Number.isFinite(width) || width <= 0) return 2;
  return Math.max(minimum, Math.floor(width / itemWidth));
}

export function reconcileWaterfallItems<T>(
  displayed: readonly T[],
  incoming: readonly T[],
  idKey: string,
): UPWaterfallReconcileResult<T> {
  const incomingIds = new Set(
    incoming.map((item, index) => resolveWaterfallId(item, index, idKey)),
  );
  const removedIds = displayed
    .map((item, index) => resolveWaterfallId(item, index, idKey))
    .filter((id) => !incomingIds.has(id));
  const previousById = new Map(
    displayed.map((item, index) => [resolveWaterfallId(item, index, idKey), item]),
  );
  const replacedIds = incoming
    .map((item, index) => resolveWaterfallId(item, index, idKey))
    .filter((id) => previousById.has(id));

  return {
    displayed: [...incoming],
    removedIds,
    replacedIds,
  };
}

export function createWaterfallAddQueue<T>(
  displayed: readonly T[],
  incoming: readonly T[],
  idKey: string,
): T[] {
  const existing = new Set(
    displayed.map((item, index) => resolveWaterfallId(item, index, idKey)),
  );
  return incoming.filter((item, index) => {
    const id = resolveWaterfallId(item, index, idKey);
    if (existing.has(id)) return false;
    existing.add(id);
    return true;
  });
}

export function warnDuplicateWaterfallIds<T>(
  items: readonly T[],
  idKey: string,
): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  const ids = new Set<UPKey>();
  items.forEach((item, index) => {
    const id = resolveWaterfallId(item, index, idKey);
    if (ids.has(id)) {
      console.warn(`[UPWaterfall] Duplicate id "${String(id)}" at index ${index}.`);
    }
    ids.add(id);
  });
}

export function composeWaterfallData<T>(
  displayed: readonly T[],
  pending: readonly T[],
): T[] {
  return [...displayed, ...pending];
}

export function modifyWaterfallItem<T>(
  item: T,
  key: string,
  value: unknown,
): T | undefined {
  if (item === null || typeof item !== 'object' || key.trim().length === 0) {
    return undefined;
  }
  return {
    ...(item as Record<string, unknown>),
    [key]: value,
  } as T;
}

export function createWaterfallAfterAddOnePayload<T>(
  item: T,
  height: number,
): UPWaterfallAfterAddOnePayload<T> {
  if (item !== null && typeof item === 'object') {
    return {
      ...(item as Record<string, unknown>),
      height,
    } as UPWaterfallAfterAddOnePayload<T>;
  }
  return { item, height } as UPWaterfallAfterAddOnePayload<T>;
}
