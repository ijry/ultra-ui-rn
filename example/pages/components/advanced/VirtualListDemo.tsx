/**
 * UPVirtualList 组件示例 — 虚拟列表
 * 展示：大数据量虚拟滚动
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPVirtualList } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const DATA = Array.from({ length: 10000 }, (_, i) => ({
  id: String(i + 1),
  text: `第 ${i + 1} 条数据`,
}));

const PROPS = [
  { prop: 'listData', type: 'T[]', default: '[]', desc: '数据列表' },
  { prop: 'itemHeight', type: 'number | string', default: '40', desc: '项高度' },
  { prop: 'height', type: 'number | string', default: '300', desc: '容器高度' },
  { prop: 'buffer', type: 'number', default: '5', desc: '缓冲区大小' },
  { prop: 'renderItem', type: '(payload) => ReactNode', default: '—', desc: '自定义渲染' },
];

export default function VirtualListDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="VirtualList 虚拟列表" onBack={onBack}>
      <Section title="10000条数据虚拟滚动">
        <UPVirtualList
          listData={DATA}
          itemHeight={44}
          height={300}
          renderItem={({ item, index }) => (
            <View style={vl.item}>
              <Text style={vl.text}>{item.text}</Text>
            </View>
          )}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const vl = StyleSheet.create({
  item: { height: 44, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  text: { fontSize: 14, color: '#333' },
});
