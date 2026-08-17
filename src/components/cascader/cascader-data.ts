import type {
  UPCascaderKeys,
  UPCascaderNode,
  UPCascaderPath,
  UPCascaderState,
  UPCascaderValue,
} from './types';

function asValue(value: unknown): UPCascaderValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null
    ? value
    : null;
}

export function nodeChildren(
  node: UPCascaderNode | undefined,
  keys: UPCascaderKeys,
): readonly UPCascaderNode[] {
  const value = node?.[keys.childrenKey];
  return Array.isArray(value) ? value as readonly UPCascaderNode[] : [];
}

export function selectedCascaderNode(
  state: UPCascaderState,
  levelIndex: number,
): UPCascaderNode | undefined {
  const index = state.indexs[levelIndex];
  return index === undefined ? undefined : state.levels[levelIndex]?.[index];
}

export function createCascaderState(
  data: readonly UPCascaderNode[] | undefined,
  modelValue: UPCascaderPath | undefined,
  keys: UPCascaderKeys,
): UPCascaderState {
  const levels: UPCascaderNode[][] = [Array.isArray(data) ? [...data] : []];
  const indexs: number[] = [];
  let current = levels[0] ?? [];

  for (const value of modelValue ?? []) {
    const index = current.findIndex((node) => node[keys.valueKey] === value);
    if (index < 0) break;
    indexs.push(index);
    const children = nodeChildren(current[index], keys);
    if (!children.length) break;
    current = [...children];
    levels.push(current);
  }

  if (!indexs.length) return { activeLevel: 0, indexs, levels };
  const state = { activeLevel: 0, indexs, levels };
  const lastLevel = indexs.length - 1;
  const selected = selectedCascaderNode(state, lastLevel);
  return {
    activeLevel: nodeChildren(selected, keys).length ? indexs.length : lastLevel,
    indexs,
    levels,
  };
}

export function selectCascaderNode(
  state: UPCascaderState,
  levelIndex: number,
  optionIndex: number,
  keys: UPCascaderKeys,
): UPCascaderState {
  const current = state.levels[levelIndex] ?? [];
  if (optionIndex < 0 || optionIndex >= current.length) return state;
  const levels = state.levels.slice(0, levelIndex + 1).map((level) => [...level]);
  const indexs = state.indexs.slice(0, levelIndex + 1);
  indexs[levelIndex] = optionIndex;
  const children = nodeChildren(current[optionIndex], keys);
  if (children.length) levels.push([...children]);
  return { activeLevel: children.length ? levelIndex + 1 : levelIndex, indexs, levels };
}

export function cascaderPathValues(state: UPCascaderState, keys: UPCascaderKeys): UPCascaderValue[] {
  return state.levels.reduce<UPCascaderValueAccumulator>((values, _level, levelIndex) => {
    const node = selectedCascaderNode(state, levelIndex);
    if (node) values.push(asValue(node[keys.valueKey]));
    return values;
  }, []);
}

type UPCascaderValueAccumulator = UPCascaderValue[];

export function cascaderPathLabels(state: UPCascaderState, keys: UPCascaderKeys): string[] {
  return state.levels.reduce<string[]>((labels, _level, levelIndex) => {
    const node = selectedCascaderNode(state, levelIndex);
    if (node) labels.push(String(node[keys.labelKey] ?? ''));
    return labels;
  }, []);
}

export function isCascaderLeaf(state: UPCascaderState, keys: UPCascaderKeys): boolean {
  const node = selectedCascaderNode(state, state.activeLevel);
  return Boolean(node) && nodeChildren(node, keys).length === 0;
}
