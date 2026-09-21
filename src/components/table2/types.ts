import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { UPDimension } from '../../utils';
import type { UPKey } from '../tree/types';

export type UPTable2SortOrder = 'ascending' | 'descending';
export type UPTable2Align = 'left' | 'center' | 'right';

/**
 * Cell styling accepts view and text properties together, the way upstream's
 * demo passes `{ background, color }` on a single column. The box gets the view
 * props; the default cell text picks up `color` and the other text properties,
 * which are inert on the wrapping View in React Native.
 */
export type UPTable2CellStyle = StyleProp<ViewStyle & TextStyle>;

export type UPTable2Column<T = unknown> = {
  key: string;
  title?: React.ReactNode;
  label?: React.ReactNode;
  width?: UPDimension;
  style?: UPTable2CellStyle;
  fixed?: 'left';
  type?: 'default' | 'selection' | 'expand';
  align?: UPTable2Align;
  headerAlign?: UPTable2Align;
  sortable?: boolean;
  sortBy?: string | readonly string[] | ((row: T) => unknown);
  sortOrders?: readonly UPTable2SortOrder[];
  showOverflowTooltip?: boolean;
  renderHeader?: (payload: UPTable2HeaderPayload<T>) => React.ReactNode;
  renderCell?: (payload: UPTable2CellPayload<T>) => React.ReactNode;
};

export type UPTable2HeaderPayload<T = unknown> = {
  column: UPTable2Column<T>;
  columnIndex: number;
  sortOrder: UPTable2SortOrder | null;
  context: unknown;
};

export type UPTable2RowPayload<T = unknown> = {
  row: T;
  parentRow: T | null;
  rowKey: UPKey;
  rowIndex: number;
  level: number;
  context: unknown;
  selected: boolean;
  expanded: boolean;
};

export type UPTable2CellPayload<T = unknown> = {
  row: T;
  column: UPTable2Column<T>;
  parentRow: T | null;
  rowIndex: number;
  columnIndex: number;
  level: number;
  context: unknown;
  selected: boolean;
  expanded: boolean;
  toggleSelect: () => void;
  toggleExpand: () => void;
};

export type UPTable2LoadPayload<T = unknown> = {
  row: T;
  level: number;
  expanded: boolean;
  loading: boolean;
  context: unknown;
};

export type UPTable2SpanPayload<T = unknown> = {
  row: T;
  column: UPTable2Column<T>;
  rowIndex: number;
  columnIndex: number;
  context: unknown;
};

export type UPTable2SortCondition<T = unknown> = {
  field: string;
  order: UPTable2SortOrder;
  column: UPTable2Column<T>;
};

export type UPTable2Span = {
  rowspan: number;
  colspan: number;
};

export type UPTable2SpanResult =
  | [number?, number?]
  | { rowspan?: number; colspan?: number }
  | undefined;

export type UPTable2Props<T extends object = Record<string, unknown>> = {
  data?: readonly T[];
  columns?: readonly UPTable2Column<T>[];
  rowKey?: string;
  stripe?: boolean;
  border?: boolean;
  height?: UPDimension;
  maxHeight?: UPDimension;
  rowHeight?: UPDimension;
  showHeader?: boolean;
  fixedHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: UPKey | null;
  defaultCurrentRowKey?: UPKey | null;
  selectedRowKeys?: readonly UPKey[];
  defaultSelectedRowKeys?: readonly UPKey[];
  expandRowKeys?: readonly UPKey[];
  expandedRowKeys?: readonly UPKey[];
  defaultExpandedRowKeys?: readonly UPKey[];
  defaultExpandAll?: boolean;
  treeProps?: { children?: string; hasChildren?: string };
  lazy?: boolean;
  load?: (
    row: T,
    payload: UPTable2LoadPayload<T>,
    resolve: (children: readonly T[]) => void,
  ) => void | Promise<readonly T[]>;
  sortable?: boolean | 'custom';
  multiSort?: boolean;
  sortOrders?: readonly UPTable2SortOrder[];
  sortBy?: string | readonly string[] | ((row: T) => unknown);
  sortMethod?: (a: T, b: T, field: string, context: unknown) => number;
  filters?: Readonly<Record<string, unknown>>;
  showOverflowTooltip?: boolean;
  emptyText?: React.ReactNode;
  context?: unknown;
  mainCol?: string;
  expandWidth?: UPDimension;
  rowStyle?: StyleProp<ViewStyle> | ((payload: UPTable2RowPayload<T>) => ViewStyle | undefined);
  cellStyle?: (payload: UPTable2CellPayload<T>) => (ViewStyle & TextStyle) | undefined;
  rowClassName?: string | ((payload: UPTable2RowPayload<T>) => string | undefined);
  cellClassName?: string | ((payload: UPTable2CellPayload<T>) => string | undefined);
  headerCellClassName?: string | ((payload: UPTable2HeaderPayload<T>) => string | undefined);
  spanMethod?: (
    payload: UPTable2SpanPayload<T>,
  ) => UPTable2SpanResult;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onSelect?: (row: T, selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onSelectAll?: (selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onSelectionChange?: (selectedRows: readonly T[], selectedRowKeys: readonly UPKey[]) => void;
  onCellClick?: (payload: UPTable2CellPayload<T>) => void;
  onRowClick?: (row: T, payload: UPTable2RowPayload<T>) => void;
  onRowDoubleClick?: (row: T, payload: UPTable2RowPayload<T>) => void;
  /** Source name for `row-dblclick` (`onRowDoubleClick` is the RN alias). */
  onRowDblclick?: (row: T, payload: UPTable2RowPayload<T>) => void;
  onHeaderClick?: (column: UPTable2Column<T>, columnIndex: number) => void;
  onSortChange?: (conditions: readonly UPTable2SortCondition<T>[]) => void;
  onFilterChange?: (filters: Readonly<Record<string, unknown>>) => void;
  onScroll?: (scrollTop: number) => void;
  onCurrentChange?: (currentRow: T | null, previousRow: T | null) => void;
  onExpandChange?: (expandedRowKeys: readonly UPKey[], row: T) => void;
  onLoadError?: (error: unknown, row: T) => void;
};
