import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPIcon } from '../icon';
import { UPPopup } from '../popup';
import { UPSteps, UPStepsItem } from '../steps';
import { UPTabs } from '../tabs';
import {
  cascaderPathLabels,
  cascaderPathValues,
  createCascaderState,
  isCascaderLeaf,
  nodeChildren,
  selectCascaderNode,
} from './cascader-data';
import type { UPCascaderKeys, UPCascaderNode, UPCascaderProps, UPCascaderState } from './types';

export type { UPCascaderProps } from './types';

function optionsForState(state: UPCascaderState, columns: 1 | 2): number[] {
  if (columns === 1) return [state.activeLevel];
  const current = Math.max(0, state.activeLevel);
  return current > 0 ? [current - 1, current] : [0];
}

function hasSelection(state: UPCascaderState, levelIndex: number, optionIndex: number): boolean {
  return state.indexs[levelIndex] === optionIndex;
}

export function UPCascader(input: UPCascaderProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.cascader, ...input } as UPCascaderProps;
  const keys = useMemo<UPCascaderKeys>(() => ({
    childrenKey: props.childrenKey ?? 'children',
    labelKey: props.labelKey ?? 'label',
    valueKey: props.valueKey ?? 'value',
  }), [props.childrenKey, props.labelKey, props.valueKey]);
  const sourceData = (props.data ?? []) as readonly UPCascaderNode[];
  const initial = useMemo(
    () => createCascaderState(sourceData, props.modelValue, keys),
    [keys, props.modelValue, sourceData],
  );
  const [draft, setDraft] = useState(initial);
  const draftRef = useRef(draft);
  const cancelledRef = useRef(false);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    draftRef.current = initial;
    setDraft(initial);
  }, [initial]);

  useEffect(() => {
    if (props.show) cancelledRef.current = false;
  }, [props.show]);

  const closeWithCancel = useCallback(() => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    input.onCancel?.();
    input.onChangeShow?.(false);
  }, [input]);

  const confirm = useCallback(() => {
    const values = cascaderPathValues(draftRef.current, keys);
    input.onUpdateModelValue?.(values);
    input.onConfirm?.(values);
    input.onChangeShow?.(false);
  }, [input, keys]);

  const select = useCallback((levelIndex: number, optionIndex: number) => {
    const next = selectCascaderNode(draftRef.current, levelIndex, optionIndex, keys);
    draftRef.current = next;
    setDraft(next);
    if (!isCascaderLeaf(next, keys)) return;
    const values = cascaderPathValues(next, keys);
    input.onChange?.(values);
    if (props.autoClose) {
      input.onUpdateModelValue?.(values);
      input.onConfirm?.(values);
      input.onChangeShow?.(false);
    }
  }, [input, keys, props.autoClose]);

  const labels = cascaderPathLabels(draft, keys);
  const headerLabels = [...labels];
  const selectedNode = draft.levels[draft.activeLevel]?.[draft.indexs[draft.activeLevel] ?? -1];
  const selectedHasChildren = nodeChildren(selectedNode, keys).length > 0;
  if (!labels.length || selectedHasChildren) headerLabels.push('请选择');

  const rows = optionsForState(draft, props.optionsCols ?? 2);
  const header = props.headerDirection === 'column' ? (
    <View testID="up-cascader-header-column">
      <UPSteps current={draft.activeLevel} direction="column" dot>
        {headerLabels.map((label, index) => (
          <Pressable key={`${label}-${index}`} onPress={() => setDraft((previous) => ({ ...previous, activeLevel: Math.min(index, previous.levels.length - 1) }))} testID={`up-cascader-tab-${index}`}>
            <UPStepsItem title={label} />
          </Pressable>
        ))}
      </UPSteps>
    </View>
  ) : (
    <View testID="up-cascader-header-row">
      <UPTabs
        current={draft.activeLevel}
        keyName="name"
        list={headerLabels.map((name) => ({ name }))}
        onUpdateCurrent={(index) => setDraft((previous) => ({ ...previous, activeLevel: Math.min(index, previous.levels.length - 1) }))}
      />
    </View>
  );

  return (
    <UPPopup
      closeOnClickOverlay={props.maskCloseAble}
      closeable={props.closeable}
      mode="bottom"
      onChangeShow={(show) => {
        if (!show) closeWithCancel();
      }}
      onClose={closeWithCancel}
      show={props.show}
      zIndex={props.zIndex}
    >
      <View style={input.customStyle} testID="up-cascader">
        {props.closeable ? (
          <Pressable accessibilityLabel="Close cascader" accessibilityRole="button" onPress={closeWithCancel} testID="up-cascader-close">
            <UPIcon name="close" size={18} />
          </Pressable>
        ) : null}
        {header}
        <View style={{ flexDirection: 'row', height: 400 }}>
          {rows.map((levelIndex) => {
            const level = draft.levels[levelIndex] ?? [];
            return (
              <ScrollView key={levelIndex} style={{ flex: 1 }} testID={`up-cascader-column-${levelIndex}`}>
                {level.map((node, optionIndex) => {
                  const selected = hasSelection(draft, levelIndex, optionIndex);
                  const label = String(node[keys.labelKey] ?? '');
                  return (
                    <Pressable
                      accessibilityLabel={label}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={`${label}-${optionIndex}`}
                      onPress={() => select(levelIndex, optionIndex)}
                      style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 16 }}
                      testID={`up-cascader-option-${levelIndex}-${optionIndex}`}
                    >
                      <Text style={{ color: '#303133', flex: 1, fontSize: 15 }}>{label}</Text>
                      {selected ? <UPIcon color="#3c9cff" name="checkbox-mark" size={17} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            );
          })}
        </View>
        <View style={{ borderTopColor: '#eeeeee', borderTopWidth: 1, flexDirection: 'row', gap: 12, padding: 12 }}>
          <Pressable
            accessibilityLabel="取消"
            accessibilityRole="button"
            onPress={closeWithCancel}
            style={{ alignItems: 'center', borderColor: '#dcdfe6', borderRadius: 3, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 40 }}
            testID="up-cascader-cancel"
          >
            <Text style={{ color: '#303133', fontSize: 14 }}>取消</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="确认"
            accessibilityRole="button"
            onPress={confirm}
            style={{ alignItems: 'center', backgroundColor: '#3c9cff', borderRadius: 3, flex: 1, justifyContent: 'center', minHeight: 40 }}
            testID="up-cascader-confirm"
          >
            <Text style={{ color: '#ffffff', fontSize: 14 }}>确认</Text>
          </Pressable>
        </View>
      </View>
    </UPPopup>
  );
}
