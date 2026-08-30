/**
 * UPGap 组件示例 — 间距
 * 展示：基础间距、背景色、上下边距
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPGap } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'height', type: 'number | string', default: '20', desc: '高度' },
 { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
 { prop: 'marginTop', type: 'number | string', default: '—', desc: '上边距' },
 { prop: 'marginBottom', type: 'number | string', default: '—', desc: '下边距' },
];

export default function GapDemo() {
 return (
 <DemoPage>
 <Section title="基础间距">
 <View style={gp.block}><Text>上方内容</Text></View>
 <UPGap height={20} />
 <View style={gp.block}><Text>下方内容</Text></View>
 </Section>

 <Section title="带背景色的间距">
 <View style={gp.block}><Text>内容 A</Text></View>
 <UPGap height={30} bgColor="#f5f5f5" />
 <View style={gp.block}><Text>内容 B</Text></View>
 </Section>

 <Section title="上下边距">
 <UPGap height={15} bgColor="#e3f2fd" marginTop={10} marginBottom={10} />
 <View style={gp.block}><Text>中间内容</Text></View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const gp = StyleSheet.create({
 block: { backgroundColor: '#fff', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#eee' },
});
