/**
 * UPDivider 组件示例 — 分割线
 * 展示：基础分割线、虚线、带文字、文字位置、自定义颜色
 */
import React from 'react';
import { Text } from 'react-native';
import { UPDivider } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'text', type: 'string | number', default: '—', desc: '分割线文字' },
 { prop: 'textPosition', type: 'left | center | right', default: 'center', desc: '文字位置' },
 { prop: 'dashed', type: 'boolean', default: 'false', desc: '虚线样式' },
 { prop: 'lineColor', type: 'string', default: '—', desc: '线条颜色' },
 { prop: 'textColor', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'textSize', type: 'number | string', default: '—', desc: '文字大小' },
 { prop: 'hairline', type: 'boolean', default: 'false', desc: '细线模式' },
];

export default function DividerDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <Text style={{ color: '#606266' }}>上面内容</Text>
 <UPDivider />
 <Text style={{ color: '#606266' }}>下面内容</Text>
 </Section>

 <Section title="虚线">
 <Text style={{ color: '#606266' }}>虚线分割</Text>
 <UPDivider dashed />
 <Text style={{ color: '#606266' }}>下方内容</Text>
 </Section>

 <Section title="带文字（居中）">
 <UPDivider text="分割线文字" />
 </Section>

 <Section title="文字靠左">
 <UPDivider text="左侧文字" textPosition="left" />
 </Section>

 <Section title="文字靠右">
 <UPDivider text="右侧文字" textPosition="right" />
 </Section>

 <Section title="自定义颜色">
 <UPDivider text="彩色分割线" lineColor="#07c160" textColor="#07c160" />
 </Section>

 <Section title="虚线 + 文字">
 <UPDivider text="虚线文字" dashed textPosition="center" />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
