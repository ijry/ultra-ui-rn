/**
 * UPView 组件示例 — 视图容器
 * 展示：基础视图、样式配置
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPView } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'backgroundColor', type: 'string', default: '—', desc: '背景色' },
 { prop: 'flexDirection', type: "'row' | 'column'", default: "'column'", desc: '排列方向' },
 { prop: 'justifyContent', type: 'Flexjustify', default: '—', desc: '主轴对齐' },
 { prop: 'alignItems', type: 'Flexalign', default: '—', desc: '交叉轴对齐' },
 { prop: 'flex1', type: 'boolean | number', default: 'false', desc: 'flex:1' },
 { prop: 'width', type: 'number | string', default: '—', desc: '宽度' },
 { prop: 'height', type: 'number | string', default: '—', desc: '高度' },
 { prop: 'padding', type: 'number | string', default: '—', desc: '内边距' },
 { prop: 'margin', type: 'number | string', default: '—', desc: '外边距' },
 { prop: 'borderColor', type: 'string', default: '—', desc: '边框颜色' },
];

export default function ViewDemo() {
 return (
 <DemoPage>
 <Section title="基础视图">
 <UPView backgroundColor="#e3f2fd" padding={12}>
 <Text>基础 View</Text>
 </UPView>
 </Section>

 <Section title="flex-direction: row">
 <UPView backgroundColor="#f3e5f5" flexDirection="row" padding={12} justifyContent="space-around">
 <Text>项目1</Text>
 <Text>项目2</Text>
 <Text>项目3</Text>
 </UPView>
 </Section>

 <Section title="居中 + 边框">
 <UPView backgroundColor="#e8f5e9" justifyContent="center" alignItems="center" height={100} borderColor="#4caf50">
 <Text>居中内容</Text>
 </UPView>
 </Section>

 <Section title="flex1 等分">
 <UPView flexDirection="row" height={60}>
 <UPView flex1 backgroundColor="#ff6600" justifyContent="center" alignItems="center">
 <Text style={{ color: '#fff' }}>1</Text>
 </UPView>
 <UPView flex1={2} backgroundColor="#3c9cff" justifyContent="center" alignItems="center">
 <Text style={{ color: '#fff' }}>2</Text>
 </UPView>
 <UPView flex1 backgroundColor="#67c23a" justifyContent="center" alignItems="center">
 <Text style={{ color: '#fff' }}>3</Text>
 </UPView>
 </UPView>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
