/**
 * UPQrcode 组件示例 — 二维码
 * 展示：基础二维码、自定义大小、颜色
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPQrcode } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string', default: '""', desc: '二维码内容' },
 { prop: 'size', type: 'number', default: '200', desc: '二维码大小' },
 { prop: 'color', type: 'string', default: "'#000'", desc: '前景色' },
 { prop: 'bgColor', type: 'string', default: "'#fff'", desc: '背景色' },
 { prop: 'level', type: "'L' | 'M' | 'Q' | 'H'", default: "'M'", desc: '容错级别' },
];

export default function QrcodeDemo() {
 return (
 <DemoPage>
 <Section title="基础二维码">
 <View style={qrc.center}>
 <UPQrcode val="https://ultra-ui-rn.example.com" size={160} />
 </View>
 <Value label="内容" value={"https://ultra-ui-rn.example.com"} />
 </Section>

 <Section title="自定义颜色">
 <View style={qrc.center}>
 <UPQrcode val="Hello Ultra UI" size={160} foreground="#3c9cff" background="#f0f9ff" />
 </View>
 </Section>

 <Section title="高容错级别">
 <View style={qrc.center}>
 <UPQrcode val="https://example.com/product/123" size={120} lv={3} />
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const qrc = StyleSheet.create({
 center: { alignItems: 'center', paddingVertical: 16 },
});
