/**
 * UPWaterfall 组件示例 — 瀑布流
 * 展示：基础瀑布流、自定义列数、自定义渲染
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPWaterfall } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const ITEMS = Array.from({ length: 20 }, (_, i) => ({
 id: String(i + 1),
 title: `项目 ${i + 1}`,
 height: 60 + Math.floor(Math.random() * 80),
 color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'][i % 6],
}));

const PROPS = [
 { prop: 'value', type: 'T[]', default: '[]', desc: '数据源' },
 { prop: 'columns', type: "number | 'auto'", default: '2', desc: '列数' },
 { prop: 'height', type: 'number | string', default: '—', desc: '容器高度' },
 { prop: 'minColumnWidth', type: 'number | string', default: '—', desc: '最小列宽' },
 { prop: 'idKey', type: 'string', default: "'id'", desc: '唯一标识字段' },
 { prop: 'renderItem', type: '(payload) => ReactNode', default: '—', desc: '自定义渲染' },
];

export default function WaterfallDemo() {
 return (
 <DemoPage>
 <Section title="基础瀑布流（2列）">
 <UPWaterfall
 value={ITEMS}
 columns={2}
 height={300}
 renderItem={({ item, index }) => (
 <View style={[wf.card, { backgroundColor: item.color, height: item.height }]}>
 <Text style={wf.text}>{item.title}</Text>
 <Text style={wf.id}>#{item.id}</Text>
 </View>
 )}
 />
 </Section>

 <Section title="3列瀑布流">
 <UPWaterfall
 value={ITEMS.slice(0, 12)}
 columns={3}
 height={250}
 renderItem={({ item, index }) => (
 <View style={[wf.card, { backgroundColor: item.color, height: item.height * 0.8 }]}>
 <Text style={wf.text}>{item.title}</Text>
 </View>
 )}
 />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const wf = StyleSheet.create({
 card: { borderRadius: 8, padding: 12, marginBottom: 4 },
 text: { color: '#fff', fontWeight: '600', fontSize: 14 },
 id: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
});
