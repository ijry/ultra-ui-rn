/**
 * UPCircleProgress 组件示例 — 环形进度条
 * 展示：基础、不同百分比、自定义内容
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPCircleProgress } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'percentage', type: 'number | string', default: '0', desc: '进度百分比(0-100)' },
];

export default function CircleProgressDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <View style={{ alignItems: 'center', padding: 16 }}>
 <UPCircleProgress percentage={50}>
 <Text style={{ fontSize: 16, fontWeight: '600' }}>50%</Text>
 </UPCircleProgress>
 </View>
 </Section>

 <Section title="不同进度">
 <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 16 }}>
 <UPCircleProgress percentage={25}>
 <Text style={{ fontSize: 14 }}>25%</Text>
 </UPCircleProgress>
 <UPCircleProgress percentage={60}>
 <Text style={{ fontSize: 14 }}>60%</Text>
 </UPCircleProgress>
 <UPCircleProgress percentage={100}>
 <Text style={{ fontSize: 14 }}>100%</Text>
 </UPCircleProgress>
 </View>
 </Section>

 <Section title="自定义内容">
 <View style={{ alignItems: 'center', padding: 16 }}>
 <UPCircleProgress percentage={80}>
 <View style={{ alignItems: 'center' }}>
 <Text style={{ fontSize: 20, fontWeight: '700', color: '#303133' }}>80</Text>
 <Text style={{ fontSize: 10, color: '#909399' }}>完成率</Text>
 </View>
 </UPCircleProgress>
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
