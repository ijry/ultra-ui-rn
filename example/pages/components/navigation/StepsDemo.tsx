/**
 * UPSteps 组件示例 — 步骤条
 * 展示：水平步骤、垂直步骤、带图标、自定义颜色
 */
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPSteps, UPStepsItem } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'current', type: 'number | string', default: '0', desc: '当前步骤索引' },
 { prop: 'direction', type: 'row | column', default: 'row', desc: '排列方向' },
 { prop: 'activeColor', type: 'string', default: '#3c9cff', desc: '激活颜色' },
 { prop: 'inactiveColor', type: 'string', default: '#969799', desc: '未激活颜色' },
 { prop: 'dot', type: 'boolean', default: 'false', desc: '点状模式' },
];

export default function StepsDemo() {
 const [step, setStep] = useState(1);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="水平步骤">
 <UPSteps current={step}>
 <UPStepsItem title="下单" />
 <UPStepsItem title="支付" />
 <UPStepsItem title="完成" />
 </UPSteps>
 <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center' }}>
 <Pressable onPress={() => { setStep(Math.max(0, step - 1)); log(`prev: ${step - 1}`); }} style={{ backgroundColor: '#e4e7ed', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 }}>
 <Text>上一步</Text>
 </Pressable>
 <Pressable onPress={() => { setStep(Math.min(2, step + 1)); log(`next: ${step + 1}`); }} style={{ backgroundColor: '#3c9cff', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 }}>
 <Text style={{ color: '#fff' }}>下一步</Text>
 </Pressable>
 </View>
 <Value label="当前步骤" value={step} />
 </Section>

 <Section title="垂直步骤">
 <UPSteps current={1} direction="column">
 <UPStepsItem title="填写信息" />
 <UPStepsItem title="审核中" />
 <UPStepsItem title="已完成" />
 </UPSteps>
 </Section>

 <Section title="自定义颜色 + 完成描述">
 <UPSteps current={2} activeColor="#07c160">
 <UPStepsItem title="步骤一" desc="已完成描述" />
 <UPStepsItem title="步骤二" desc="已完成描述" />
 <UPStepsItem title="步骤三" desc="当前步骤" />
 </UPSteps>
 </Section>

 <Section title="点状步骤">
 <UPSteps current={1} dot>
 <UPStepsItem title="第一步" />
 <UPStepsItem title="第二步" />
 <UPStepsItem title="第三步" />
 </UPSteps>
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
