/**
 * UPSlider 组件示例 — 滑块
 * 展示：基础步进、范围、禁用、自定义颜色
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPSlider } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'number | string', default: '—', desc: '受控值（v-model）' },
 { prop: 'min', type: 'number | string', default: '0', desc: '最小值' },
 { prop: 'max', type: 'number | string', default: '100', desc: '最大值' },
 { prop: 'step', type: 'number | string', default: '1', desc: '步长' },
 { prop: 'showValue', type: 'boolean', default: 'false', desc: '显示当前值' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '激活段颜色' },
 { prop: 'inactiveColor', type: 'string', default: '#ebedf5', desc: '未激活段颜色' },
 { prop: 'onChange', type: '(value: number) => void', default: '—', desc: '值变化回调' },
];

export default function SliderDemo() {
 const [v1, setV1] = useState(30);
 const [v2, setV2] = useState(50);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
 <UPSlider
 value={v1}
 min={0}
 max={100}
 step={10}
 showValue
 onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
 />
 </View>
 <Value label="当前值" value={v1} />
 </Section>

 <Section title="步长 5 + 自定义颜色">
 <UPSlider
 min={0}
 max={50}
 step={5}
 value={v2}
 showValue
 activeColor="#07c160"
 inactiveColor="#e8f5e9"
 onChange={setV2}
 />
 </Section>

 <Section title="禁用">
 <UPSlider min={0} max={100} step={1} value={60} disabled showValue />
 </Section>

 <Section title="小步长 (step=1)">
 <UPSlider min={0} max={20} step={1} showValue />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
