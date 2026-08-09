import type { UPKey } from '../tree/types';
import type {
  UPTable2CellPayload,
  UPTable2Column,
  UPTable2SortCondition,
  UPTable2Span,
  UPTable2SpanResult,
  UPTable2SpanPayload,
} from './types';

export type UPTable2TreeNode<T extends object> = {
  key: UPKey;
  row: T;
  parentKey: UPKey | null;
  parentRow: T | null;
  children: UPKey[];
  hasChildren: boolean;
  level: number;
  sourceIndex: number;
};

export type UPTable2TreeModel<T extends object> = {
  nodes: Map<UPKey, UPTable2TreeNode<T>>;
  roots: UPKey[];
};

export type UPTable2VisibleRow<T extends object> = {
  row: T;
  key: UPKey;
  parentRow: T | null;
  rowIndex: number;
  flatIndex: number;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  selected: boolean;
};

export type UPTable2CellSpan = UPTable2Span & {
  hidden: boolean;
  origin?: { flatIndex: number; columnIndex: number };
};

function warnInDevelopment(message: string): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(message);
  }
}

function pathKey(path: readonly number[], index: number): string {
  return `path:${path.length > 0 ? path.join('.') : index}`;
}

function valueAt<T extends object>(row: T, field: string): unknown {
  return (row as Record<string, unknown>)[field];
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === undefined || left === null) return -1;
  if (right === undefined || right === null) return 1;
  if (left < right) return -1;
  if (left > right) return 1;
  return String(left).localeCompare(String(right));
}

function resolveSortValue<T extends object>(
  row: T,
  field: string,
  sortBy: string | readonly string[] | ((row: T) => unknown) | undefined,
): unknown {
  if (typeof sortBy === 'function') return sortBy(row);
  if (Array.isArray(sortBy)) return sortBy.map((key) => valueAt(row, key)).join('');
  if (typeof sortBy === 'string' && sortBy) return valueAt(row, sortBy);
  return valueAt(row, field);
}

export function resolveTable2RowKey<T>(
  row: T,
  index: number,
  rowKey: string,
  path: readonly number[],
): UPKey {
  const raw = row !== null && typeof row === 'object'
    ? (row as Record<string, unknown>)[rowKey]
    : undefined;
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (raw !== undefined && raw !== null && raw !== '') return String(raw);
  return pathKey(path, index);
}

export function filterTable2Rows<T extends object>(
  rows: readonly T[],
  filters: Readonly<Record<string, unknown>>,
): T[] {
  return rows.filter((row) => Object.keys(filters).every((field) => {
    const filter = filters[field];
    if (!filter) return true;
    return String(valueAt(row, field) ?? '').includes(String(filter));
  }));
}

export function sortTable2Rows<T extends object>(
  rows: readonly T[],
  columns: readonly UPTable2Column<T>[],
  conditions: readonly UPTable2SortCondition<T>[],
  tableSortBy?: string | readonly string[] | ((row: T) => unknown),
  sortMethod?: (a: T, b: T, field: string, context: unknown) => number,
  context?: unknown,
): T[] {
  if (conditions.length === 0) return [...rows];

  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  return rows
    .map((row, index) => ({ index, row }))
    .sort((left, right) => {
      for (const condition of conditions) {
        const column = columnByKey.get(condition.field) ?? condition.column;
        const sortBy = column.sortBy ?? tableSortBy;
        const customResult = sortMethod?.(left.row, right.row, condition.field, context);
        const result = customResult === undefined || customResult === 0
          ? compareValues(
              resolveSortValue(left.row, condition.field, sortBy),
              resolveSortValue(right.row, condition.field, sortBy),
            )
          : customResult;
        if (result !== 0) {
          return condition.order === 'ascending' ? result : -result;
        }
      }
      return left.index - right.index;
    })
    .map(({ row }) => row);
}

export function normalizeTable2Tree<T extends object>(
  data: readonly T[],
  rowKey: string,
  childrenKey: string,
  hasChildrenKey: string,
  loadedChildren: ReadonlyMap<UPKey, readonly T[]>,
): UPTable2TreeModel<T> {
  const nodes = new Map<UPKey, UPTable2TreeNode<T>>();
  const roots: UPKey[] = [];
  let warnedMissingKey = false;
  let warnedDuplicateKey = false;

  const visit = (
    rows: readonly T[],
    parentKey: UPKey | null,
    parentRow: T | null,
    level: number,
    parentPath: readonly number[],
  ): void => {
    rows.forEach((row, index) => {
      const path = [...parentPath, index];
      const candidate = resolveTable2RowKey(row, index, rowKey, path);
      const missing = candidate === pathKey(path, index);
      if (missing && !warnedMissingKey) {
        warnedMissingKey = true;
        warnInDevelopment('[UPTable2] Found a row without a stable key; using a deterministic path key.');
      }

      let key = candidate;
      if (nodes.has(key)) {
        if (!warnedDuplicateKey) {
          warnedDuplicateKey = true;
          warnInDevelopment('[UPTable2] Found duplicate row keys; using path-qualified internal keys.');
        }
        key = `${String(candidate)}@${pathKey(path, index)}`;
        while (nodes.has(key)) key = `${String(key)}@duplicate`;
      }

      const rawChildren = valueAt(row, childrenKey);
      const sourceChildren = Array.isArray(rawChildren) ? rawChildren as T[] : [];
      const children = loadedChildren.has(key)
        ? [...(loadedChildren.get(key) ?? [])]
        : sourceChildren;
      const hasChildren = children.length > 0
        || (Boolean(valueAt(row, hasChildrenKey)) && !loadedChildren.has(key));
      const node: UPTable2TreeNode<T> = {
        children: [],
        hasChildren,
        key,
        level,
        parentKey,
        parentRow,
        row,
        sourceIndex: index,
      };
      nodes.set(key, node);
      if (parentKey === null) roots.push(key);
      else nodes.get(parentKey)?.children.push(key);
      visit(children, key, row, level + 1, path);
    });
  };

  visit(data, null, null, 0, []);
  return { nodes, roots };
}

export function collectTable2ExpandableKeys<T extends object>(
  model: UPTable2TreeModel<T>,
): UPKey[] {
  return [...model.nodes.values()]
    .filter((node) => node.hasChildren)
    .map((node) => node.key);
}

export function collectTable2SelectableKeys<T extends object>(
  model: UPTable2TreeModel<T>,
): UPKey[] {
  return [...model.nodes.keys()];
}

export function resolveTable2Rows<T extends object>(
  model: UPTable2TreeModel<T>,
  keys: readonly UPKey[],
): T[] {
  return keys
    .map((key) => model.nodes.get(key)?.row)
    .filter((row): row is T => row !== undefined);
}

export function flattenTable2Rows<T extends object>(
  model: UPTable2TreeModel<T>,
  expandedKeys: readonly UPKey[],
  selectedKeys: readonly UPKey[],
): UPTable2VisibleRow<T>[] {
  const expanded = new Set(expandedKeys);
  const selected = new Set(selectedKeys);
  const rows: UPTable2VisibleRow<T>[] = [];

  const visit = (key: UPKey): void => {
    const node = model.nodes.get(key);
    if (!node) return;
    rows.push({
      expanded: expanded.has(key),
      flatIndex: rows.length,
      hasChildren: node.hasChildren,
      key: node.key,
      level: node.level,
      parentRow: node.parentRow,
      row: node.row,
      rowIndex: node.sourceIndex,
      selected: selected.has(node.key),
    });
    if (expanded.has(key)) node.children.forEach(visit);
  };

  model.roots.forEach(visit);
  return rows;
}

function collectDescendantKeys<T extends object>(
  model: UPTable2TreeModel<T>,
  key: UPKey,
): UPKey[] {
  const node = model.nodes.get(key);
  if (!node) return [];
  return node.children.flatMap((childKey) => [
    childKey,
    ...collectDescendantKeys(model, childKey),
  ]);
}

export function toggleTable2Selection<T extends object>(
  model: UPTable2TreeModel<T>,
  selectedKeys: readonly UPKey[],
  key: UPKey,
  selected: boolean,
): UPKey[] {
  const next = new Set(selectedKeys);
  const target = model.nodes.get(key);
  if (!target) return [...next];
  const affected = [key, ...collectDescendantKeys(model, key)];
  affected.forEach((candidate) => {
    if (selected) next.add(candidate);
    else next.delete(candidate);
  });
  return [...next];
}

export function normalizeTable2Span(
  result: UPTable2SpanResult,
): UPTable2Span {
  const rawRowspan = Array.isArray(result) ? result[0] : result?.rowspan;
  const rawColspan = Array.isArray(result) ? result[1] : result?.colspan;
  const normalize = (value: number | undefined): number => {
    if (value === 0) return 0;
    if (!Number.isFinite(value) || value === undefined || value < 0) return 1;
    return Math.max(1, Math.floor(value));
  };
  return {
    colspan: normalize(rawColspan),
    rowspan: normalize(rawRowspan),
  };
}

function spanKey(flatIndex: number, columnIndex: number): string {
  return `${flatIndex}:${columnIndex}`;
}

export function buildTable2SpanMap<T extends object>(
  rows: readonly UPTable2VisibleRow<T>[],
  columns: readonly UPTable2Column<T>[],
  spanMethod: ((payload: UPTable2SpanPayload<T>) => UPTable2SpanResult) | undefined,
  context?: unknown,
): Map<string, UPTable2CellSpan> {
  const map = new Map<string, UPTable2CellSpan>();
  rows.forEach((row) => {
    columns.forEach((_column, columnIndex) => {
      map.set(spanKey(row.flatIndex, columnIndex), {
        colspan: 1,
        hidden: false,
        rowspan: 1,
      });
    });
  });
  if (!spanMethod) return map;

  rows.forEach((row) => {
    columns.forEach((column, columnIndex) => {
      const span = normalizeTable2Span(spanMethod({
        column,
        columnIndex,
        context,
        row: row.row,
        rowIndex: row.rowIndex,
      }));
      const originKey = spanKey(row.flatIndex, columnIndex);
      const origin: UPTable2CellSpan = {
        ...span,
        hidden: span.rowspan === 0 || span.colspan === 0,
        origin: { columnIndex, flatIndex: row.flatIndex },
      };
      map.set(originKey, origin);
      if (origin.hidden) return;

      for (let rowOffset = 0; rowOffset < span.rowspan; rowOffset += 1) {
        for (let columnOffset = 0; columnOffset < span.colspan; columnOffset += 1) {
          if (rowOffset === 0 && columnOffset === 0) continue;
          const coveredRow = rows[row.flatIndex + rowOffset];
          if (!coveredRow) continue;
          const coveredColumnIndex = columnIndex + columnOffset;
          if (coveredColumnIndex >= columns.length) continue;
          map.set(spanKey(coveredRow.flatIndex, coveredColumnIndex), {
            colspan: 0,
            hidden: true,
            rowspan: 0,
            origin: { columnIndex, flatIndex: row.flatIndex },
          });
        }
      }
    });
  });
  return map;
}

export function createTable2CellPayload<T extends object>(
  row: UPTable2VisibleRow<T>,
  column: UPTable2Column<T>,
  columnIndex: number,
  context: unknown,
  toggleSelect: () => void,
  toggleExpand: () => void,
): UPTable2CellPayload<T> {
  return {
    column,
    columnIndex,
    context,
    expanded: row.expanded,
    level: row.level,
    parentRow: row.parentRow,
    row: row.row,
    rowIndex: row.rowIndex,
    selected: row.selected,
    toggleExpand,
    toggleSelect,
  };
}
