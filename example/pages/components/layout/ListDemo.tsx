/**
 * UPList 组件示例 — 列表
 * 展示：基础列表
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPList, UPListItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'scrollable', type: 'boolean', default: 'true', desc: '是否可滚动' },
 { prop: 'showScrollbar', type: 'boolean', default: 'false', desc: '显示滚动条' },
 { prop: 'height', type: 'number | string', default: 'auto', desc: '高度' },
 { prop: 'children', type: 'ReactNode', default: '—', desc: '列表项' },
];

export default function ListDemo() {
 return (
 <DemoPage>
 <Section title="基础列表">
 <UPList height={250}>
 {Array.from({ length: 15 }, (_, i) => (
 <UPListItem key={i}>
 <View style={lt.item}>
 <Text style={lt.title}>列表项 {i + 1}</Text>
 <Text style={lt.desc}>描述文字</Text>
 </View>
 </UPListItem>
 ))}
 </UPList>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const lt = StyleSheet.create({
 item: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
 title: { fontSize: 14, color: '#333', fontWeight: '500' },
 desc: { fontSize: 12, color: '#999', marginTop: 4 },
});
