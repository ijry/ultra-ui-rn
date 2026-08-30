/**
 * UPBackTop 组件示例 — 回到顶部
 * 展示：不同模式
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { UPBackTop } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'mode', type: "'circle' | 'square'", default: "'circle'", desc: '形状' },
 { prop: 'icon', type: 'string', default: '—', desc: '图标' },
 { prop: 'text', type: 'string', default: '—', desc: '文字' },
 { prop: 'top', type: 'number | string', default: '—', desc: '距顶部距离' },
 { prop: 'bottom', type: 'number | string', default: '100', desc: '距底部距离' },
 { prop: 'right', type: 'number | string', default: '20', desc: '距右侧距离' },
];

export default function BackTopDemo() {
 return (
 <DemoPage>
 <Section title="圆形回到顶部">
 <ScrollView style={bt.scroll} nestedScrollEnabled>
 {Array.from({ length: 30 }, (_, i) => (
 <View key={i} style={bt.item}><Text>第 {i + 1} 行</Text></View>
 ))}
 <UPBackTop mode="circle" icon="↑" />
 </ScrollView>
 </Section>

 <Section title="方形 + 文字">
 <ScrollView style={bt.scroll} nestedScrollEnabled>
 {Array.from({ length: 30 }, (_, i) => (
 <View key={i} style={bt.item}><Text>第 {i + 1} 行</Text></View>
 ))}
 <UPBackTop mode="square" text="TOP" />
 </ScrollView>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const bt = StyleSheet.create({
 scroll: { height: 200, backgroundColor: '#f5f5f5' },
 item: { height: 44, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd', backgroundColor: '#fff' },
});
