/**
 * UPSafeBottom 组件示例 — 安全区域底部填充
 * SafeBottom 是一个纯占位组件，用于在页面底部填充安全区域高度
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPSafeBottom } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '自定义样式' },
];

export default function SafeBottomDemo() {
 return (
 <DemoPage>
 <Section title="底部安全区域占位">
 <View style={sb.container}>
 <View style={sb.content}>
 <Text style={sb.text}>页面内容区域</Text>
 <Text style={sb.hint}>SafeBottom 会在底部自动填充 iPhone X 等异形屏的安全区域高度</Text>
 </View>
 <View style={sb.bottomBar}>
 <Text style={sb.bottomText}>底部固定栏</Text>
 </View>
 <UPSafeBottom />
 </View>
 </Section>

 <Section title="自定义背景色">
 <View style={{ backgroundColor: '#333' }}>
 <View style={sb.content}>
 <Text style={[sb.text, { color: '#fff' }]}>深色底部栏 + SafeBottom</Text>
 </View>
 <View style={[sb.bottomBar, { backgroundColor: '#333' }]}>
 <Text style={[sb.bottomText, { color: '#fff' }]}>底部栏</Text>
 </View>
 <UPSafeBottom customStyle={{ backgroundColor: '#333' }} />
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const sb = StyleSheet.create({
 container: { backgroundColor: '#f5f5f5', borderRadius: 8, overflow: 'hidden' },
 content: { padding: 16 },
 text: { fontSize: 14, color: '#333', fontWeight: '500' },
 hint: { fontSize: 12, color: '#999', marginTop: 4 },
 bottomBar: { backgroundColor: '#fff', padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', alignItems: 'center' },
 bottomText: { fontSize: 14, color: '#333' },
});
