/**
 * UPBarcode 组件示例 — 条形码
 * 展示：基础条形码、自定义
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPBarcode } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string', default: '""', desc: '条形码内容' },
 { prop: 'type', type: 'string', default: "'CODE128'", desc: '条形码类型' },
 { prop: 'width', type: 'number', default: '2', desc: '线条宽度' },
 { prop: 'height', type: 'number', default: '100', desc: '条形码高度' },
 { prop: 'showText', type: 'boolean', default: 'true', desc: '显示文字' },
 { prop: 'color', type: 'string', default: "'#000'", desc: '前景色' },
 { prop: 'bgColor', type: 'string', default: "'#fff'", desc: '背景色' },
];

export default function BarcodeDemo() {
 return (
 <DemoPage>
 <Section title="基础条形码">
 <View style={bc.center}>
 <UPBarcode value="6901234567892" displayValue />
 </View>
 <Value label="内容" value={"6901234567892"} />
 </Section>

 <Section title="自定义高度和宽度">
 <View style={bc.center}>
 <UPBarcode value="ABC123456" width={3} height={80} displayValue />
 </View>
 </Section>

 <Section title="隐藏文字">
 <View style={bc.center}>
 <UPBarcode value="9876543210" displayValue={false} />
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const bc = StyleSheet.create({
 center: { alignItems: 'center', paddingVertical: 16 },
});
