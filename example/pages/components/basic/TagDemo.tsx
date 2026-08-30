/**
 * UPTag 组件示例 — 标签
 * 复刻 uview-plus u-tag 页面结构
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPTag } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'info'", desc: '标签类型' },
 { prop: 'size', type: "'large' | 'medium' | 'mini'", default: "'medium'", desc: '标签大小' },
 { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '标签形状' },
 { prop: 'plain', type: 'boolean', default: 'false', desc: '是否朴素' },
 { prop: 'closable', type: 'boolean', default: 'false', desc: '是否可关闭' },
 { prop: 'text', type: 'string | number', default: '—', desc: '标签文字' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'color', type: 'string', default: '—', desc: '自定义颜色' },
 { prop: 'bgColor', type: 'string', default: '—', desc: '自定义背景色' },
];

export default function TagDemo() {
 const [show1, setShow1] = useState(true);
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="标签类型">
 <View style={tg.row}>
 <UPTag type="info" text="info" />
 <UPTag type="primary" text="primary" />
 <UPTag type="success" text="success" />
 <UPTag type="warning" text="warning" />
 <UPTag type="error" text="error" />
 </View>
 </Section>

 <Section title="朴素标签">
 <View style={tg.row}>
 <UPTag type="info" plain text="info" />
 <UPTag type="primary" plain text="primary" />
 <UPTag type="success" plain text="success" />
 </View>
 </Section>

 <Section title="可关闭">
 <View style={tg.row}>
 {show1 && (
 <UPTag type="primary" closable text="可关闭" onClose={() => { setShow1(false); setEvents((e) => [...e, 'close']); }} />
 )}
 {!show1 && (
 <UPTag type="info" text="已关闭" plain />
 )}
 </View>
 </Section>

 <Section title="标签尺寸">
 <View style={tg.row}>
 <UPTag type="primary" size="large" text="large" />
 <UPTag type="primary" size="medium" text="medium" />
 <UPTag type="primary" size="mini" text="mini" />
 </View>
 </Section>

 <Section title="自定义颜色">
 <View style={tg.row}>
 <UPTag text="自定义" color="#fff" bgColor="#ff6600" />
 <UPTag text="自定义" color="#fff" bgColor="#67c23a" />
 <UPTag text="边框" borderColor="#3c9cff" color="#3c9cff" plain />
 </View>
 </Section>

 <Section title="禁用状态">
 <View style={tg.row}>
 <UPTag type="primary" disabled text="disabled" />
 </View>
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const tg = StyleSheet.create({
 row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingVertical: 4 },
});
