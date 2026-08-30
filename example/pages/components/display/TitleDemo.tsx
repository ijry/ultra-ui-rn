/**
 * UPTitle 组件示例 — 标题
 * 复刻 uview-plus u-title 页面结构
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPTitle } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'prefix', type: 'ReactNode', default: '—', desc: '标题前缀' },
 { prop: 'children', type: 'ReactNode', default: '—', desc: '标题内容' },
 { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '自定义样式' },
];

export default function TitleDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPTitle>组件标题</UPTitle>
 </Section>

 <Section title="带前缀标记">
 <UPTitle prefix={<View style={{ width: 4, height: 16, backgroundColor: '#3c9cff', borderRadius: 2, marginRight: 8 }} />}>
 带竖线的标题
 </UPTitle>
 </Section>

 <Section title="自定义颜色">
 <UPTitle customStyle={{ color: '#ff6600' } as any}>橙色标题</UPTitle>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
