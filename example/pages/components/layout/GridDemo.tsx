/**
 * UPGrid 组件示例 — 宫格
 * 展示：基础宫格、不同列数、带边框、自定义
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPGrid, UPGridItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'col', type: 'number | string', default: '3', desc: '每行列数' },
 { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示边框' },
 { prop: 'align', type: "'left' | 'center' | 'right'", default: "'center'", desc: '文字对齐' },
 { prop: 'gap', type: 'number | string', default: '0', desc: '间距' },
];

const ITEMS = ['话费充值', '流量包', '宽带办理', '权益中心', '积分商城', '客服热线'];

export default function GridDemo() {
 return (
 <DemoPage>
 <Section title="3列宫格">
 <UPGrid col={3}>
 {ITEMS.map((name, i) => (
 <UPGridItem key={i} name={name}>
 <View style={g.item}>
 <View style={[g.icon, { backgroundColor: ['#3c9cff', '#67c23a', '#ff6600', '#e6a23c', '#f56c6c', '#909399'][i] }]}>
 <Text style={g.iconText}>{name.charAt(0)}</Text>
 </View>
 <Text style={g.name}>{name}</Text>
 </View>
 </UPGridItem>
 ))}
 </UPGrid>
 </Section>

 <Section title="4列无边框">
 <UPGrid col={4} border={false} gap={8}>
 {ITEMS.map((name, i) => (
 <UPGridItem key={i} name={name}>
 <View style={g.item}>
 <View style={[g.icon, { backgroundColor: ['#3c9cff', '#67c23a', '#ff6600', '#e6a23c'][i % 4] }]}>
 <Text style={g.iconText}>{name.charAt(0)}</Text>
 </View>
 <Text style={g.name}>{name}</Text>
 </View>
 </UPGridItem>
 ))}
 </UPGrid>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const g = StyleSheet.create({
 item: { alignItems: 'center', paddingVertical: 12 },
 icon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
 iconText: { color: '#fff', fontSize: 16, fontWeight: '600' },
 name: { fontSize: 12, color: '#333' },
});
