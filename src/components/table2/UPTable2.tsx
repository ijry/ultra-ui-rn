import React, { useMemo, useRef, useState } from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import {
  Pressable,
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
import {
  buildTable2SpanMap,
  collectTable2ExpandableKeys,
  collectTable2SelectableKeys,
  createTable2CellPayload,
  filterTable2Rows,
  flattenTable2Rows,
  normalizeTable2Tree,
  resolveTable2Rows,
  sortTable2Rows,
  toggleTable2Selection,
  type UPTable2CellSpan,
  type UPTable2TreeModel,
  type UPTable2VisibleRow,
} from './state';
import type {
  UPTable2Align,
  UPTable2Column,
  UPTable2HeaderPayload,
  UPTable2Props,
  UPTable2RowPayload,
} from './types';
import type { UPKey } from '../tree/types';

function resolveHeight(value: UPDimension | undefined): ViewStyle['height'] {
  if (value === undefined || value === '' || String(value).trim() === 'auto') {
    return undefined;
  }
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    return value as ViewStyle['height'];
  }
  const height = getPx(value);
  return Number.isFinite(height) && height > 0 ? height : undefined;
}

function resolvePositivePx(value: UPDimension | undefined, fallback: number): number {
  if (value === undefined || value === '' || String(value).trim() === 'auto') return fallback;
  const next = getPx(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function resolveColumnWidth<T>(column: UPTable2Column<T>): number {
  return resolvePositivePx(column.width, column.type === 'selection' ? 48 : 100);
}

function resolveAlign(align: UPTable2Align | undefined): ViewStyle {
  if (align === 'center') return { justifyContent: 'center' };
  if (align === 'right') return { justifyContent: 'flex-end' };
  return { justifyContent: 'flex-start' };
}

function renderContent(content: React.ReactNode): React.ReactNode {
  if (React.isValidElement(content)) return content;
  if (content === undefined || content === null) return null;
  return <Text>{String(content)}</Text>;
}

function valueAt<T extends object>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function resolveSpanStyle(
  span: UPTable2CellSpan,
  width: number,
  rowHeight: number,
): ViewStyle {
  if (span.hidden) return { display: 'none' };
  return {
    height: rowHeight * Math.max(1, span.rowspan),
    width: width * Math.max(1, span.colspan),
  };
}

function resolveRowPayload<T extends object>(
  row: UPTable2VisibleRow<T>,
  context: unknown,
): UPTable2RowPayload<T> {
  return {
    context,
    expanded: row.expanded,
    level: row.level,
    parentRow: row.parentRow,
    row: row.row,
    rowIndex: row.rowIndex,
    rowKey: row.key,
    selected: row.selected,
  };
}

function UPTable2Inner<T extends object = Record<string, unknown>>(
  input: UPTable2Props<T>,
): React.JSX.Element {
  const config = useUPConfig();
  const defaults = config.props.table2;
  const props = {
    ...defaults,
    ...input,
    columns: (input.columns ?? defaults.columns) as readonly UPTable2Column<T>[],
    data: (input.data ?? defaults.data) as readonly T[],
    filters: input.filters ?? defaults.filters,
    sortOrders: input.sortOrders ?? defaults.sortOrders,
    treeProps: {
      ...defaults.treeProps,
      ...input.treeProps,
    },
  } as UPTable2Props<T> & typeof defaults;
  const columns = props.columns as readonly UPTable2Column<T>[];
  const data = props.data as readonly T[];
  const childrenKey = props.treeProps.children ?? 'children';
  const hasChildrenKey = props.treeProps.hasChildren ?? 'hasChildren';
  const rowHeight = resolvePositivePx(props.rowHeight, 36);
  const fixedColumns = useMemo(
    () => columns.filter((column) => column.fixed === 'left'),
    [columns],
  );
  const columnsWithIndex = useMemo(
    () => columns.map((column, columnIndex) => ({ column, columnIndex })),
    [columns],
  );
  const fixedColumnsWithIndex = useMemo(
    () => columnsWithIndex.filter(({ column }) => column.fixed === 'left'),
    [columnsWithIndex],
  );
  const fixedWidth = fixedColumns.reduce(
    (total, column) => total + resolveColumnWidth(column),
    0,
  );
  const totalWidth = Math.max(
    1,
    columnsWithIndex.reduce((total, { column }) => total + resolveColumnWidth(column), 0),
  );
  const sourceRows = useMemo(
    () => sortTable2Rows(
      filterTable2Rows(data, props.filters ?? {}),
      columns,
      [],
      props.sortBy,
      props.sortMethod,
      props.context,
    ),
    [columns, data, props.context, props.filters, props.sortBy, props.sortMethod],
  );
  const model = useMemo<UPTable2TreeModel<T>>(
    () => normalizeTable2Tree(
      sourceRows,
      props.rowKey,
      childrenKey,
      hasChildrenKey,
      new Map(),
    ),
    [childrenKey, hasChildrenKey, props.rowKey, sourceRows],
  );
  const [localSelectedKeys, setLocalSelectedKeys] = useState<readonly UPKey[]>(
    () => [...(props.defaultSelectedRowKeys ?? [])],
  );
  const [localExpandedKeys, setLocalExpandedKeys] = useState<readonly UPKey[]>(
    () => props.defaultExpandAll
      ? collectTable2ExpandableKeys(model)
      : [...(props.defaultExpandedRowKeys ?? [])],
  );
  const [localCurrentKey, setLocalCurrentKey] = useState<UPKey | null>(
    () => props.defaultCurrentRowKey ?? null,
  );
  const selectedKeys = props.selectedRowKeys !== undefined
    ? props.selectedRowKeys
    : localSelectedKeys;
  const expandedKeys = props.expandedRowKeys !== undefined
    ? props.expandedRowKeys
    : localExpandedKeys;
  const currentKey = props.currentRowKey !== undefined
    ? props.currentRowKey
    : localCurrentKey;
  const visibleRows = useMemo(
    () => flattenTable2Rows(model, expandedKeys, selectedKeys),
    [expandedKeys, model, selectedKeys],
  );
  const spanMap = useMemo(
    () => buildTable2SpanMap(visibleRows, columns, props.spanMethod, props.context),
    [columns, props.context, props.spanMethod, visibleRows],
  );
  const bodyMaxHeight = resolveHeight(props.maxHeight);
  const listRef = useRef<FlashListRef<UPTable2VisibleRow<T>> | null>(null);
  const fixedListRef = useRef<FlashListRef<UPTable2VisibleRow<T>> | null>(null);
  const syncingVerticalRef = useRef(false);

  const selectRow = (key: UPKey, nextSelected: boolean): void => {
    const nextKeys = toggleTable2Selection(model, selectedKeys, key, nextSelected);
    if (props.selectedRowKeys === undefined) setLocalSelectedKeys(nextKeys);
    const selectedRows = resolveTable2Rows(model, nextKeys);
    const row = model.nodes.get(key)?.row;
    if (row) props.onSelect?.(row, selectedRows, nextKeys);
    props.onSelectionChange?.(selectedRows, nextKeys);
  };

  const selectAll = (nextSelected: boolean): void => {
    const nextKeys = nextSelected ? collectTable2SelectableKeys(model) : [];
    if (props.selectedRowKeys === undefined) setLocalSelectedKeys(nextKeys);
    const selectedRows = resolveTable2Rows(model, nextKeys);
    props.onSelectAll?.(selectedRows, nextKeys);
    props.onSelectionChange?.(selectedRows, nextKeys);
  };

  const toggleExpanded = (key: UPKey): void => {
    const node = model.nodes.get(key);
    if (!node?.hasChildren) return;
    const isExpanded = expandedKeys.includes(key);
    const nextKeys = isExpanded
      ? expandedKeys.filter((candidate) => candidate !== key)
      : [...expandedKeys, key];
    if (props.expandedRowKeys === undefined) setLocalExpandedKeys(nextKeys);
    props.onExpandChange?.(nextKeys, node.row);
  };

  const handleRowPress = (row: UPTable2VisibleRow<T>): void => {
    const payload = resolveRowPayload(row, props.context);
    props.onRowClick?.(row.row, payload);
    if (!props.highlightCurrentRow) return;
    const previousRow = currentKey === null || currentKey === undefined
      ? null
      : model.nodes.get(currentKey)?.row ?? null;
    if (props.currentRowKey === undefined) setLocalCurrentKey(row.key);
    props.onCurrentChange?.(row.row, previousRow);
  };

  const handleCellPress = (
    row: UPTable2VisibleRow<T>,
    column: UPTable2Column<T>,
    columnIndex: number,
  ): void => {
    const payload = createTable2CellPayload(
      row,
      column,
      columnIndex,
      props.context,
      () => selectRow(row.key, !row.selected),
      () => toggleExpanded(row.key),
    );
    props.onCellClick?.(payload);
  };

  const allRowsSelected = model.nodes.size > 0
    && collectTable2SelectableKeys(model).every((key) => selectedKeys.includes(key));

  const renderHeader = (
    headerColumns: readonly { column: UPTable2Column<T>; columnIndex: number }[],
  ): React.JSX.Element => (
    <View
      style={{
        backgroundColor: '#f5f7fa',
        flexDirection: 'row',
        height: rowHeight,
        minWidth: headerColumns.reduce(
          (total, { column }) => total + resolveColumnWidth(column),
          0,
        ),
      }}
      testID="up-table2-header"
    >
      {headerColumns.map(({ column, columnIndex }) => {
        const payload: UPTable2HeaderPayload<T> = {
          column,
          columnIndex,
          context: props.context,
          sortOrder: null,
        };
        const content = column.renderHeader?.(payload)
          ?? column.title
          ?? column.label
          ?? column.key;
        const width = resolveColumnWidth(column);
        const headerContent = column.type === 'selection' ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allRowsSelected }}
            onPress={() => selectAll(!allRowsSelected)}
            testID="up-table2-select-all"
          >
            <Text>{allRowsSelected ? '✓' : ''}</Text>
          </Pressable>
        ) : renderContent(content);
        return (
          <View
            key={column.key}
            style={[
              {
                alignItems: 'center',
                borderBottomColor: '#ebeef5',
                borderBottomWidth: props.border ? 1 : 0,
                borderRightColor: '#ebeef5',
                borderRightWidth: props.border ? 1 : 0,
                flexDirection: 'row',
                minWidth: width,
                paddingHorizontal: 8,
                width,
              },
              resolveAlign(column.headerAlign ?? column.align),
            ]}
            testID={`up-table2-header-${column.key}`}
          >
            {headerContent}
          </View>
        );
      })}
    </View>
  );

  const renderRow = (
    row: UPTable2VisibleRow<T>,
    rowColumns: readonly { column: UPTable2Column<T>; columnIndex: number }[],
  ): React.JSX.Element => {
    const rowPayload = resolveRowPayload(row, props.context);
    const rowStyle = typeof props.rowStyle === 'function'
      ? props.rowStyle(rowPayload)
      : props.rowStyle;
    return (
      <Pressable
        onPress={() => handleRowPress(row)}
        style={[
          {
            backgroundColor: props.highlightCurrentRow && row.key === currentKey
              ? '#e6f4ff'
              : '#ffffff',
            flexDirection: 'row',
            height: rowHeight,
            minWidth: rowColumns.reduce(
              (total, { column }) => total + resolveColumnWidth(column),
              0,
            ),
          },
          props.stripe && row.flatIndex % 2 === 1 ? { backgroundColor: '#fafafa' } : undefined,
          rowStyle as StyleProp<ViewStyle>,
        ]}
        testID={`up-table2-row-${String(row.key)}`}
      >
        {rowColumns.map(({ column, columnIndex }) => {
          const width = resolveColumnWidth(column);
          const span = spanMap.get(`${row.flatIndex}:${columnIndex}`) ?? {
            colspan: 1,
            hidden: false,
            rowspan: 1,
          };
          const payload = createTable2CellPayload(
            row,
            column,
            columnIndex,
            props.context,
            () => selectRow(row.key, !row.selected),
            () => toggleExpanded(row.key),
          );
          const value = valueAt(row.row, column.key);
          const content = column.renderCell?.(payload)
            ?? renderContent(value === undefined || value === null ? null : String(value));
          const cellStyle = props.cellStyle?.(payload);
          const cellContent = column.type === 'selection' ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: row.selected }}
              onPress={() => selectRow(row.key, !row.selected)}
              testID={`up-table2-select-${String(row.key)}`}
            >
              <Text>{row.selected ? '✓' : ''}</Text>
            </Pressable>
          ) : (
            <>
              {column.type === 'expand' && row.hasChildren ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleExpanded(row.key)}
                  testID={`up-table2-expand-${String(row.key)}`}
                >
                  <Text>{row.expanded ? '−' : '+'}</Text>
                </Pressable>
              ) : null}
              {content}
            </>
          );
          return (
            <Pressable
              key={column.key}
              onPress={() => handleCellPress(row, column, columnIndex)}
              style={[
                {
                  alignItems: 'center',
                  borderBottomColor: '#ebeef5',
                  borderBottomWidth: props.border ? 1 : 0,
                  borderRightColor: '#ebeef5',
                  borderRightWidth: props.border ? 1 : 0,
                  minWidth: width,
                  overflow: 'hidden',
                  paddingHorizontal: 8,
                  width,
                },
                resolveAlign(column.align),
                resolveSpanStyle(span, width, rowHeight),
                cellStyle,
              ]}
              testID={`up-table2-cell-${String(row.key)}-${column.key}`}
            >
              {cellContent}
            </Pressable>
          );
        })}
      </Pressable>
    );
  };

  const emptyComponent = () => (
    <View style={{ alignItems: 'center', padding: 20 }} testID="up-table2-empty">
      {renderContent(props.emptyText)}
    </View>
  );
  const fixedHeader = props.showHeader && props.fixedHeader;
  const listHeader = props.showHeader && !props.fixedHeader
    ? renderHeader(columnsWithIndex)
    : undefined;
  const fixedListHeader = props.showHeader && !props.fixedHeader
    ? renderHeader(fixedColumnsWithIndex)
    : undefined;
  const onMainListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = Math.max(0, event.nativeEvent.contentOffset.y);
    input.onScroll?.(offset);
    if (!fixedListRef.current || syncingVerticalRef.current) return;
    syncingVerticalRef.current = true;
    fixedListRef.current.scrollToOffset({ animated: false, offset });
    syncingVerticalRef.current = false;
  };

  return (
    <View
      style={[
        {
          height: resolveHeight(props.height),
          maxHeight: bodyMaxHeight,
          overflow: 'hidden',
        },
        input.customStyle,
      ]}
      testID="up-table2"
    >
      <View style={{ flex: 1 }} testID="up-table2-main-plane">
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={{ flex: 1 }}
          testID="up-table2-main-scroll"
        >
          <View style={{ width: totalWidth }}>
            {fixedHeader ? renderHeader(columnsWithIndex) : null}
            <FlashList
              data={visibleRows}
              keyExtractor={(row) => String(row.key)}
              ListEmptyComponent={emptyComponent}
              ListHeaderComponent={listHeader}
              onScroll={onMainListScroll}
              ref={listRef}
              renderItem={({ item }) => renderRow(item, columnsWithIndex)}
              style={{ maxHeight: bodyMaxHeight }}
              testID="up-table2-main-list"
            />
          </View>
        </ScrollView>
      </View>
      {fixedColumns.length > 0 ? (
        <View
          style={{
            backgroundColor: '#ffffff',
            bottom: 0,
            elevation: 2,
            left: 0,
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            width: fixedWidth,
            zIndex: 2,
          }}
          testID="up-table2-fixed-plane"
        >
          {fixedHeader ? renderHeader(fixedColumnsWithIndex) : null}
          <FlashList
            data={visibleRows}
            keyExtractor={(row) => String(row.key)}
            ListHeaderComponent={fixedListHeader}
            onScroll={() => undefined}
            ref={fixedListRef}
            renderItem={({ item }) => renderRow(item, fixedColumnsWithIndex)}
            style={{ maxHeight: bodyMaxHeight }}
            testID="up-table2-fixed-list"
          />
        </View>
      ) : null}
    </View>
  );
}

export function UPTable2<T extends object = Record<string, unknown>>(
  input: UPTable2Props<T>,
): React.JSX.Element {
  return <UPTable2Inner {...input} />;
}
