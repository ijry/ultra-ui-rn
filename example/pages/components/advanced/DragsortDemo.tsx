/**
 * UPDragsort 组件示例 — 拖拽排序
 * 展示：基础拖拽排序
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPDragsort } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'initialList', type: 'T[]', default: '[]', desc: '初始列表' },
  { prop: 'draggable', type: 'boolean', default: 'true', desc: '是否可拖拽' },
  { prop: 'itemHeight', type: 'number | string', default: '—', desc: '项高度' },
  { prop: 'columns', type: 'number', default: '1', desc: '列数' },
  { prop: 'onDragEnd', type: '(list) => void', default: '—', desc: '拖拽结束回调' },
];

export default function DragsortDemo({ onBack }: DemoProps) {
  const [list, setList] = useState(
    Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), text: `项目 ${i + 1}` }))
  );

  return (
    <DemoPage title="Dragsort 拖拽排序" onBack={onBack}>
      <Section title="基础拖拽排序">
        <UPDragsort
          initialList={list}
          draggable
          itemHeight={48}
          onDragEnd={(nextList) => {
            setList(nextList as { id: string; text: string }[]);
          }}
          renderItem={({ item }) => (
            <View style={ds.item}>
              <Text style={ds.text}>{item.text}</Text>
              <Text style={ds.handle}>⠿</Text>
            </View>
          )}
        />
      </Section>

      <Value label="当前顺序" value={list.map((i) => i.text).join(' → ')} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const ds = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 48, paddingHorizontal: 16, backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee',
  },
  text: { fontSize: 14, color: '#333' },
  handle: { fontSize: 18, color: '#999' },
});
