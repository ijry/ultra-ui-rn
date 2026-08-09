import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import { UPIcon } from '../icon';
import {
  collectExpandableKeys,
  deriveTreeCheckState,
  flattenVisibleTree,
  getCheckedKeys,
  getCheckedNodes,
  normalizeTree,
  toggleCheckedKeys,
  toggleExpandedKeys,
  type UPTreeNodeModel,
} from './state';
import type {
  UPKey,
  UPTreeProps,
  UPTreeRef,
  UPTreeRenderPayload,
  UPTreeVisibleNode,
} from './types';

function resolveHeight(value: number | string): ViewStyle['height'] {
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    return value as ViewStyle['height'];
  }
  const height = getPx(value);
  return Number.isFinite(height) && height > 0 ? height : undefined;
}

function resolveDimension(value: number | string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const resolved = getPx(value);
  return Number.isFinite(resolved) && resolved > 0 ? resolved : fallback;
}

function UPTreeInner<T extends object = Record<string, unknown>>(
  input: UPTreeProps<T>,
  ref: React.ForwardedRef<UPTreeRef<T>>,
): React.JSX.Element {
  const config = useUPConfig();
  const defaults = config.props.tree;
  const props = {
    ...defaults,
    ...input,
    data: (input.data ?? defaults.data) as readonly T[],
    fieldNames: {
      ...defaults.fieldNames,
      ...input.fieldNames,
    },
  } as UPTreeProps<T> & typeof defaults;
  const fieldNames = props.fieldNames as {
    children: string;
    disabled: string;
    label: string;
    nodeKey: string;
  };

  const model = useMemo<UPTreeNodeModel<T>>(
    () => normalizeTree<T>(props.data, fieldNames, props.nodeKey || undefined),
    [fieldNames, props.data, props.nodeKey],
  );
  const [localExpandedKeys, setLocalExpandedKeys] = useState<readonly UPKey[]>(
    () => props.defaultExpandAll
      ? collectExpandableKeys(model)
      : props.defaultExpandedKeys,
  );
  const [localCheckedKeys, setLocalCheckedKeys] = useState<readonly UPKey[]>(
    () => props.defaultCheckedKeys,
  );
  const [localCurrentKey, setLocalCurrentKey] = useState<UPKey | null>(
    () => props.defaultCurrentNodeKey ?? null,
  );

  const expandedKeys = props.expandedKeys ?? localExpandedKeys;
  const checkedKeys = props.checkedKeys ?? localCheckedKeys;
  const currentKey = props.currentNodeKey ?? localCurrentKey;
  const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);
  const checkState = useMemo(
    () => deriveTreeCheckState(model, checkedKeys, Boolean(props.checkStrictly)),
    [checkedKeys, model, props.checkStrictly],
  );
  const checkedSet = useMemo(() => new Set(checkState.checkedKeys), [checkState.checkedKeys]);
  const halfCheckedSet = useMemo(
    () => new Set(checkState.halfCheckedKeys),
    [checkState.halfCheckedKeys],
  );
  const rows = useMemo(
    () => flattenVisibleTree(model, expandedKeys),
    [expandedKeys, model],
  );
  const listRef = useRef<FlashListRef<UPTreeVisibleNode<T>> | null>(null);

  const toggleExpanded = useCallback((key: UPKey, nextExpanded: boolean) => {
    const next = toggleExpandedKeys(
      model,
      expandedKeys,
      key,
      nextExpanded,
      Boolean(props.accordion),
    );
    if (props.expandedKeys === undefined) setLocalExpandedKeys(next);
    props.onUpdateExpandedKeys?.(next);

    const node = model.nodes.get(key)?.node;
    if (node && nextExpanded) props.onNodeExpand?.(node);
    if (node && !nextExpanded) props.onNodeCollapse?.(node);
  }, [
    expandedKeys,
    model,
    props.accordion,
    props.expandedKeys,
    props.onNodeCollapse,
    props.onNodeExpand,
    props.onUpdateExpandedKeys,
  ]);

  const selectNode = useCallback((key: UPKey | null) => {
    const oldNode = currentKey === null ? null : model.nodes.get(currentKey)?.node ?? null;
    const nextNode = key === null ? null : model.nodes.get(key)?.node ?? null;
    if (key !== null && !nextNode) return;
    if (key !== null && model.nodes.get(key)?.disabled) return;
    if (props.currentNodeKey === undefined) setLocalCurrentKey(key);
    props.onUpdateCurrentNodeKey?.(key);
    props.onCurrentChange?.(nextNode, oldNode);
  }, [
    currentKey,
    model,
    props.currentNodeKey,
    props.onCurrentChange,
    props.onUpdateCurrentNodeKey,
  ]);

  const toggleChecked = useCallback((key: UPKey, nextChecked: boolean, deep = true) => {
    const next = toggleCheckedKeys(model, checkedKeys, key, nextChecked, {
      checkStrictly: Boolean(props.checkStrictly),
      deep,
    });
    const state = deriveTreeCheckState(model, next, Boolean(props.checkStrictly));
    if (props.checkedKeys === undefined) setLocalCheckedKeys(next);
    props.onUpdateCheckedKeys?.(next);

    const node = model.nodes.get(key)?.node;
    if (node) {
      props.onCheckChange?.(node, next.includes(key));
      props.onCheck?.(node, state);
    }
  }, [
    checkedKeys,
    model,
    props.checkedKeys,
    props.checkStrictly,
    props.onCheck,
    props.onCheckChange,
    props.onUpdateCheckedKeys,
  ]);

  const onNodePress = useCallback((row: UPTreeVisibleNode<T>) => {
    props.onNodeClick?.(row.node);
    selectNode(row.key);
    if (props.expandOnClickNode && row.hasChildren) {
      toggleExpanded(row.key, !expandedSet.has(row.key));
    }
    if (props.checkOnClickNode && props.showCheckbox) {
      toggleChecked(row.key, !checkedSet.has(row.key));
    }
  }, [
    checkedSet,
    expandedSet,
    props.checkOnClickNode,
    props.expandOnClickNode,
    props.onNodeClick,
    props.showCheckbox,
    selectNode,
    toggleChecked,
    toggleExpanded,
  ]);

  const renderTreeRow = (row: UPTreeVisibleNode<T>): React.JSX.Element => {
    const expanded = expandedSet.has(row.key);
    const checked = checkedSet.has(row.key);
    const halfChecked = halfCheckedSet.has(row.key);
    const selected = currentKey === row.key;
    const iconSize = resolveDimension(props.iconSize, 14);
    const checkboxSize = resolveDimension(props.checkboxSize, 16);
    const payload: UPTreeRenderPayload<T> = {
      ...row,
      checked,
      expanded,
      halfChecked,
      selected,
      toggle: () => {
        if (row.hasChildren) toggleExpanded(row.key, !expanded);
      },
    };
    const defaultContent = (
      <Text style={{ color: row.disabled ? '#c8c9cc' : '#303133', fontSize: 14 }}>
        {row.label}
      </Text>
    );

    return (
      <View
        style={{ minHeight: 44, opacity: row.disabled ? 0.6 : 1 }}
        testID={`up-tree-row-${String(row.key)}`}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', minHeight: 44 }}>
          <View style={{ width: row.level * getPx(props.indent) }}>
            <View />
          </View>
          {row.hasChildren ? (
            <Pressable
              accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${row.label}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: row.disabled, expanded }}
              disabled={row.disabled}
              onPress={() => toggleExpanded(row.key, !expanded)}
              style={{ alignItems: 'center', height: 36, justifyContent: 'center', width: 36 }}
              testID={`up-tree-expand-${String(row.key)}`}
            >
              <UPIcon
                color={row.disabled ? '#c8c9cc' : '#606266'}
                name={expanded ? 'arrow-down' : 'arrow-right'}
                size={iconSize}
              />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
          {props.showCheckbox ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: halfChecked ? 'mixed' : checked,
                disabled: row.disabled,
              }}
              disabled={row.disabled}
              onPress={() => toggleChecked(row.key, !checked, true)}
              style={{
                alignItems: 'center',
                borderColor: checked || halfChecked ? '#2979ff' : '#c8c9cc',
                borderRadius: 3,
                borderWidth: 1,
                height: checkboxSize,
                justifyContent: 'center',
                marginRight: 8,
                width: checkboxSize,
              }}
              testID={`up-tree-checkbox-${String(row.key)}`}
            >
              {checked ? <UPIcon color="#ffffff" name="checkbox-mark" size={checkboxSize - 4} /> : null}
              {halfChecked && !checked ? <UPIcon color="#2979ff" name="minus" size={checkboxSize - 4} /> : null}
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              checked: props.showCheckbox ? (halfChecked ? 'mixed' : checked) : undefined,
              disabled: row.disabled,
              expanded: row.hasChildren ? expanded : undefined,
              selected,
            }}
            disabled={row.disabled}
            onPress={() => onNodePress(row)}
            style={[
              {
                backgroundColor: props.highlightCurrent && selected ? '#e6f4ff' : 'transparent',
                flex: 1,
                justifyContent: 'center',
                minHeight: 36,
                paddingHorizontal: 8,
              },
            ]}
            testID={`up-tree-content-${String(row.key)}`}
          >
            {props.renderNode ? props.renderNode(payload) : defaultContent}
          </Pressable>
        </View>
      </View>
    );
  };

  useImperativeHandle(ref, () => ({
    getCheckedKeys: (leafOnly = false) => getCheckedKeys(model, checkedKeys, leafOnly),
    getCheckedNodes: (leafOnly = false) => getCheckedNodes(model, checkedKeys, leafOnly),
    getHalfCheckedKeys: () => checkState.halfCheckedKeys,
    getHalfCheckedNodes: () => checkState.halfCheckedNodes,
    setCheckedKeys: (keys, leafOnly = false) => {
      const next = [...new Set(keys)].filter((key) => {
        const node = model.nodes.get(key);
        return node !== undefined && (!leafOnly || node.children.length === 0);
      });
      if (props.checkedKeys === undefined) setLocalCheckedKeys(next);
      props.onUpdateCheckedKeys?.(next);
    },
    setChecked: (key, checked, deep = true) => toggleChecked(key, checked, deep),
    setCurrentKey: (key) => selectNode(key),
    getCurrentKey: () => currentKey,
    getCurrentNode: () => currentKey === null ? null : model.nodes.get(currentKey)?.node ?? null,
    scrollToKey: (key, animated = false) => {
      const index = rows.findIndex((row) => row.key === key);
      if (index < 0) return false;
      listRef.current?.scrollToIndex({ animated, index });
      return true;
    },
  }), [
    checkedKeys,
    checkState.checkedKeys,
    checkState.halfCheckedKeys,
    currentKey,
    model,
    props.checkedKeys,
    props.onUpdateCheckedKeys,
    rows,
    selectNode,
    toggleChecked,
  ]);

  return (
    <View
      style={[{ height: resolveHeight(props.height), overflow: 'hidden' }, input.customStyle as StyleProp<ViewStyle>]}
      testID="up-tree"
    >
      <FlashList
        data={rows}
        keyExtractor={(row) => String(row.key)}
        ref={listRef}
        renderItem={({ item: row }) => renderTreeRow(row)}
        showsVerticalScrollIndicator
      />
    </View>
  );
}

export const UPTree = forwardRef(UPTreeInner) as <
  T extends object = Record<string, unknown>
>(
  props: UPTreeProps<T> & React.RefAttributes<UPTreeRef<T>>,
) => React.JSX.Element;
