/**
 * UPSwitch 组件示例 — 开关
 * 展示：受控/非受控、自定义颜色、自定义值、禁用、加载中
 */
import React, { useState } from 'react';
import { UPSwitch } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'boolean | string | number', default: 'false', desc: '受控值（v-model）' },
 { prop: 'activeValue', type: 'boolean | string | number', default: 'true', desc: '开启时的值' },
 { prop: 'inactiveValue', type: 'boolean | string | number', default: 'false', desc: '关闭时的值' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'loading', type: 'boolean', default: 'false', desc: '加载中状态' },
 { prop: 'size', type: 'number | string', default: '26', desc: '开关大小' },
 { prop: 'activeColor', type: 'string', default: '#ebedf5', desc: '开启时背景色' },
 { prop: 'inactiveColor', type: 'string', default: '#ebedf5', desc: '关闭时背景色' },
 { prop: 'dotActiveColor', type: 'string', default: '#ffffff', desc: '开启时滑块色' },
 { prop: 'dotInactiveColor', type: 'string', default: '#ffffff', desc: '关闭时滑块色' },
 { prop: 'onChange', type: '(value) => void', default: '—', desc: '切换回调' },
];

export default function SwitchDemo() {
 const [v1, setV1] = useState(false);
 const [v2, setV2] = useState<string | number | boolean>('off');
 const [v3, setV3] = useState(true);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 {/* 1. 基础用法 */}
 <Section title="基础用法">
 <Row label="当前值">
 <Value label="" value={v1} />
 </Row>
 <UPSwitch
 value={v1}
 onChange={(val) => { setV1(Boolean(val)); log(`onChange: ${val}`); }}
 />
 </Section>

 {/* 2. 自定义颜色 */}
 <Section title="自定义颜色">
 <UPSwitch
 activeColor="#07c160"
 inactiveColor="#dedede"
 dotActiveColor="#ffffff"
 dotInactiveColor="#f0f0f0"
 />
 </Section>

 {/* 3. 自定义值（activeValue / inactiveValue） */}
 <Section title="自定义值">
 <Row label="当前值">
 <Value label="" value={v2} />
 </Row>
 <UPSwitch
 value={v2}
 activeValue="on"
 inactiveValue="off"
 activeColor="#409eff"
 onChange={(val) => { setV2(val); log(`onChange: ${val}`); }}
 />
 </Section>

 {/* 4. 禁用 */}
 <Section title="禁用">
 <Row label="关闭">
 <UPSwitch disabled />
 </Row>
 <Row label="开启">
 <UPSwitch disabled value />
 </Row>
 </Section>

 {/* 5. 加载中 */}
 <Section title="加载中">
 <UPSwitch loading value={v3} onChange={(val) => setV3(Boolean(val))} />
 </Section>

 {/* 6. 自定义大小 */}
 <Section title="自定义大小">
 <Row label="小 (20px)">
 <UPSwitch size={20} />
 </Row>
 <Row label="默认 (26px)">
 <UPSwitch />
 </Row>
 <Row label="大 (36px)">
 <UPSwitch size={36} />
 </Row>
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
