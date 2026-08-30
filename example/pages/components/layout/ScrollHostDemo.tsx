/**
 * UPScrollHost 组件示例 — 滚动容器
 * 展示：基础滚动
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPScrollHost } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
 { prop: 'overlay', type: 'ReactNode', default: '—', desc: '悬浮层' },
 { prop: 'style', type: 'ViewStyle', default: '—', desc: '容器样式' },
 { prop: 'contentContainerStyle', type: 'ViewStyle', default: '—', desc: '内容区域样式' },
];

export default function ScrollHostDemo() {
 return (
 <DemoPage>
 <Section title="基础滚动">
 <UPScrollHost style={{ height: 200, backgroundColor: '#f5f5f5' }}>
 {Array.from({ length: 20 }, (_, i) => (
 <View key={i} style={sh.item}>
 <Text>滚动项 {i + 1}</Text>
 </View>
 ))}
 </UPScrollHost>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const sh = StyleSheet.create({
 item: { height: 44, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd', backgroundColor: '#fff' },
});
