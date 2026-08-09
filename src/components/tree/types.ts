import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type UPKey = string | number;

export type UPTreeFieldNames = {
  nodeKey?: string;
  label?: string;
  children?: string;
  disabled?: string;
};

export type UPTreeCheckState<T> = {
  checkedNodes: readonly T[];
  checkedKeys: readonly UPKey[];
  halfCheckedNodes: readonly T[];
  halfCheckedKeys: readonly UPKey[];
};

export type UPTreeVisibleNode<T> = {
  node: T;
  key: UPKey;
  parentKey: UPKey | null;
  level: number;
  label: string;
  disabled: boolean;
  hasChildren: boolean;
};

export type UPTreeRenderPayload<T> = UPTreeVisibleNode<T> & {
  expanded: boolean;
  checked: boolean;
  halfChecked: boolean;
  selected: boolean;
  toggle: () => void;
};

export type UPTreeProps<T extends object = Record<string, unknown>> = {
  data?: readonly T[];
  fieldNames?: UPTreeFieldNames;
  nodeKey?: string;
  showCheckbox?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: readonly UPKey[];
  expandedKeys?: readonly UPKey[];
  defaultCheckedKeys?: readonly UPKey[];
  checkedKeys?: readonly UPKey[];
  expandOnClickNode?: boolean;
  checkOnClickNode?: boolean;
  checkStrictly?: boolean;
  accordion?: boolean;
  highlightCurrent?: boolean;
  defaultCurrentNodeKey?: UPKey | null;
  currentNodeKey?: UPKey | null;
  indent?: number | string;
  iconSize?: number | string;
  checkboxSize?: number | string;
  height?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  renderNode?: (payload: UPTreeRenderPayload<T>) => React.ReactNode;
  onNodeClick?: (node: T) => void;
  onCheckChange?: (node: T, checked: boolean) => void;
  onCheck?: (node: T, state: UPTreeCheckState<T>) => void;
  onNodeExpand?: (node: T) => void;
  onNodeCollapse?: (node: T) => void;
  onCurrentChange?: (currentNode: T | null, oldCurrentNode: T | null) => void;
  onUpdateExpandedKeys?: (keys: readonly UPKey[]) => void;
  onUpdateCheckedKeys?: (keys: readonly UPKey[]) => void;
  onUpdateCurrentNodeKey?: (key: UPKey | null) => void;
};

export type UPTreeRef<T extends object = Record<string, unknown>> = {
  getCheckedNodes: (leafOnly?: boolean) => readonly T[];
  getCheckedKeys: (leafOnly?: boolean) => readonly UPKey[];
  getHalfCheckedNodes: () => readonly T[];
  getHalfCheckedKeys: () => readonly UPKey[];
  setCheckedKeys: (keys: readonly UPKey[], leafOnly?: boolean) => void;
  setChecked: (key: UPKey, checked: boolean, deep?: boolean) => void;
  setCurrentKey: (key: UPKey | null) => void;
  getCurrentKey: () => UPKey | null;
  getCurrentNode: () => T | null;
  scrollToKey: (key: UPKey, animated?: boolean) => boolean;
};
