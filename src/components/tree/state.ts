import type {
  UPKey,
  UPTreeCheckState,
  UPTreeFieldNames,
  UPTreeVisibleNode,
} from './types';

export type UPTreeNodeRecord<T> = {
  children: UPKey[];
  disabled: boolean;
  key: UPKey;
  label: string;
  level: number;
  node: T;
  parentKey: UPKey | null;
};

export type UPTreeNodeModel<T> = {
  nodes: Map<UPKey, UPTreeNodeRecord<T>>;
  roots: UPKey[];
  visibleKeys: UPKey[];
};

function pathKey(path: number[]): string {
  return `path:${path.join('.')}`;
}

function warnInDevelopment(message: string): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(message);
  }
}

export function normalizeTree<T extends object>(
  data: readonly T[],
  fieldNames: Required<UPTreeFieldNames>,
  nodeKeyOverride?: string,
): UPTreeNodeModel<T> {
  const nodes = new Map<UPKey, UPTreeNodeRecord<T>>();
  const roots: UPKey[] = [];
  let warnedMissingKey = false;
  let warnedDuplicateKey = false;

  const visit = (
    items: readonly T[],
    parentKey: UPKey | null,
    level: number,
    parentPath: number[],
  ): void => {
    items.forEach((node, index) => {
      const path = [...parentPath, index];
      const recordNode = node as Record<string, unknown>;
      const rawKey = recordNode[nodeKeyOverride || fieldNames.nodeKey];
      const missingKey = rawKey === undefined || rawKey === null || rawKey === '';
      const candidate: UPKey = missingKey
        ? pathKey(path)
        : typeof rawKey === 'string' || typeof rawKey === 'number'
          ? rawKey
          : String(rawKey);

      if (missingKey && !warnedMissingKey) {
        warnInDevelopment('UPTree found a node without a key; using a deterministic path key.');
        warnedMissingKey = true;
      }

      let key = candidate;
      if (nodes.has(key)) {
        if (!warnedDuplicateKey) {
          warnInDevelopment('UPTree found duplicate node keys; using path-qualified internal keys.');
          warnedDuplicateKey = true;
        }
        key = `${String(candidate)}@${pathKey(path)}`;
        while (nodes.has(key)) {
          key = `${String(key)}@duplicate`;
        }
      }

      const childrenValue = recordNode[fieldNames.children];
      const children = Array.isArray(childrenValue) ? childrenValue as T[] : [];
      const record: UPTreeNodeRecord<T> = {
        children: [],
        disabled: Boolean(recordNode[fieldNames.disabled]),
        key,
        label: String(recordNode[fieldNames.label] ?? ''),
        level,
        node,
        parentKey,
      };
      nodes.set(key, record);
      if (parentKey === null) roots.push(key);
      else nodes.get(parentKey)?.children.push(key);
      visit(children, key, level + 1, path);
    });
  };

  visit(data, null, 0, []);
  return { nodes, roots, visibleKeys: roots };
}

export function flattenVisibleTree<T>(
  model: UPTreeNodeModel<T>,
  expandedKeys: readonly UPKey[],
): UPTreeVisibleNode<T>[] {
  const expanded = new Set(expandedKeys);
  const rows: UPTreeVisibleNode<T>[] = [];

  const visit = (key: UPKey): void => {
    const record = model.nodes.get(key);
    if (!record) return;
    rows.push({
      disabled: record.disabled,
      hasChildren: record.children.length > 0,
      key: record.key,
      label: record.label,
      level: record.level,
      node: record.node,
      parentKey: record.parentKey,
    });
    if (expanded.has(key)) record.children.forEach(visit);
  };

  model.roots.forEach(visit);
  return rows;
}

export function collectExpandableKeys<T>(model: UPTreeNodeModel<T>): UPKey[] {
  return [...model.nodes.values()]
    .filter((record) => record.children.length > 0)
    .map((record) => record.key);
}

export function toggleExpandedKeys<T>(
  model: UPTreeNodeModel<T>,
  expandedKeys: readonly UPKey[],
  key: UPKey,
  expanded: boolean,
  accordion: boolean,
): UPKey[] {
  const record = model.nodes.get(key);
  if (!record || record.disabled || record.children.length === 0) return [...expandedKeys];
  const next = new Set(expandedKeys);
  if (!expanded) next.delete(key);
  else {
    if (accordion && record.parentKey !== null) {
      const parent = model.nodes.get(record.parentKey);
      parent?.children.forEach((sibling) => next.delete(sibling));
    }
    next.add(key);
  }
  return [...next];
}

function collectDescendants<T>(model: UPTreeNodeModel<T>, key: UPKey): UPKey[] {
  const record = model.nodes.get(key);
  if (!record) return [];
  return record.children.flatMap((childKey) => [
    childKey,
    ...collectDescendants(model, childKey),
  ]);
}

export function toggleCheckedKeys<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  key: UPKey,
  checked: boolean,
  options: { checkStrictly: boolean; deep?: boolean },
): UPKey[] {
  const next = new Set(checkedKeys);
  const target = model.nodes.get(key);
  if (!target || target.disabled) return [...next];

  const keys = options.checkStrictly || options.deep === false
    ? [key]
    : [key, ...collectDescendants(model, key)];

  keys.forEach((candidate) => {
    if (!model.nodes.get(candidate)?.disabled) {
      if (checked) next.add(candidate);
      else next.delete(candidate);
    }
  });
  return [...next];
}

export function deriveTreeCheckState<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  checkStrictly: boolean,
): UPTreeCheckState<T> {
  const checked = new Set(checkedKeys);
  const halfChecked = new Set<UPKey>();

  if (!checkStrictly) {
    const evaluate = (key: UPKey): 'checked' | 'half' | 'empty' => {
      const record = model.nodes.get(key);
      if (!record || record.disabled) return 'empty';
      const children = record.children
        .map((childKey) => model.nodes.get(childKey))
        .filter((child): child is UPTreeNodeRecord<T> => child !== undefined && !child.disabled);
      if (children.length === 0) return checked.has(key) ? 'checked' : 'empty';

      const states = children.map((child: UPTreeNodeRecord<T>) => evaluate(child.key));
      const allChecked = states.every((state) => state === 'checked');
      const anyChecked = states.some((state) => state !== 'empty');
      if (allChecked) {
        checked.add(key);
        halfChecked.delete(key);
        return 'checked';
      }
      if (anyChecked) {
        checked.delete(key);
        halfChecked.add(key);
        return 'half';
      }
      checked.delete(key);
      halfChecked.delete(key);
      return 'empty';
    };
    model.roots.forEach((key) => evaluate(key));
  }

  const checkedKeyList = [...checked];
  const halfCheckedKeyList = [...halfChecked];
  return {
    checkedKeys: checkedKeyList,
    checkedNodes: checkedKeyList
      .map((key) => model.nodes.get(key)?.node)
      .filter((node): node is T => node !== undefined),
    halfCheckedKeys: halfCheckedKeyList,
    halfCheckedNodes: halfCheckedKeyList
      .map((key) => model.nodes.get(key)?.node)
      .filter((node): node is T => node !== undefined),
  };
}

export function getCheckedKeys<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  leafOnly: boolean,
): UPKey[] {
  const checked = new Set(checkedKeys);
  return [...checked].filter((key) => {
    const node = model.nodes.get(key);
    return node !== undefined && (!leafOnly || node.children.length === 0);
  });
}

export function getCheckedNodes<T>(
  model: UPTreeNodeModel<T>,
  checkedKeys: readonly UPKey[],
  leafOnly: boolean,
): T[] {
  return getCheckedKeys(model, checkedKeys, leafOnly)
    .map((key) => model.nodes.get(key)?.node)
    .filter((node): node is T => node !== undefined);
}
