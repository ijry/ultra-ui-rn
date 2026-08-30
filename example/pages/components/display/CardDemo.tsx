/**
 * UPCard 组件示例 — 卡片
 * 展示：基础卡片、带标题/副标题、全宽、无边框、自定义圆角
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPCard } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'title', type: 'string', default: '—', desc: '标题' },
 { prop: 'subTitle', type: 'string', default: '—', desc: '副标题' },
 { prop: 'full', type: 'boolean', default: 'false', desc: '全宽（无左右 margin）' },
 { prop: 'border', type: 'boolean', default: 'true', desc: '显示边框' },
 { prop: 'margin', type: 'number | string', default: '—', desc: '外边距' },
 { prop: 'borderRadius', type: 'number | string', default: '—', desc: '圆角大小' },
 { prop: 'headBorderBottom', type: 'boolean', default: 'true', desc: '标题底部分割线' },
 { prop: 'titleColor', type: 'string', default: '—', desc: '标题颜色' },
 { prop: 'subTitleColor', type: 'string', default: '—', desc: '副标题颜色' },
];

export default function CardDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPCard>
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 这是一段卡片内容，可以通过 children 传入任意内容。
 </Text>
 </UPCard>
 </Section>

 <Section title="带标题和副标题">
 <UPCard title="订单信息" subTitle="2026-08-20">
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 商品：Ultra UI React Native{'\n'}数量：1{'\n'}价格：¥299.00
 </Text>
 </UPCard>
 </Section>

 <Section title="无边框 + 自定义圆角">
 <UPCard border={false} borderRadius={16}>
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 无边框卡片，圆角 16px。
 </Text>
 </UPCard>
 </Section>

 <Section title="标题底部无分割线">
 <UPCard title="无分割线" headBorderBottom={false}>
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 标题和内容之间没有分割线。
 </Text>
 </UPCard>
 </Section>

 <Section title="自定义标题颜色">
 <UPCard title="彩色标题" titleColor="#07c160" subTitle="副标题" subTitleColor="#909399">
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 标题使用自定义颜色。
 </Text>
 </UPCard>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
