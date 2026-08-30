/**
 * UPRate 组件示例 — 评分
 * 展示：基础评分、受控、禁用、自定义颜色/图标、半星
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPRate } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'number | string', default: '—', desc: '受控值（v-model）' },
 { prop: 'count', type: 'number | string', default: '5', desc: '星星总数' },
 { prop: 'size', type: 'number | string', default: '20', desc: '图标大小' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
 { prop: 'activeColor', type: 'string', default: '#f7ba2a', desc: '选中颜色' },
 { prop: 'inactiveColor', type: 'string', default: '#c0c4cc', desc: '未选中颜色' },
 { prop: 'gutter', type: 'number | string', default: '4', desc: '间距' },
 { prop: 'allowHalf', type: 'boolean', default: 'false', desc: '允许半星' },
 { prop: 'touchable', type: 'boolean', default: 'true', desc: '是否可点击' },
 { prop: 'onChange', type: '(value: number) => void', default: '—', desc: '评分变化回调' },
];

export default function RateDemo() {
 const [v1, setV1] = useState(3);
 const [v2, setV2] = useState(0);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法（受控）">
 <UPRate
 value={v1}
 onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
 />
 <Value label="评分" value={v1} />
 </Section>

 <Section title="自定义星星数 + 颜色">
 <UPRate count={7} size={24} activeColor="#ff6600" />
 </Section>

 <Section title="只读 + 自定义评分">
 <UPRate value={4.5} readonly count={5} />
 </Section>

 <Section title="禁用">
 <UPRate value={2} disabled />
 </Section>

 <Section title="自定义间距">
 <UPRate value={3} gutter={12} />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
