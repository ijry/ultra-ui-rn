/**
 * UPCheckbox 组件示例 — 复选框
 * 展示：单独使用、复选组、自定义颜色、禁用、方形
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { UPCheckbox, UPCheckboxGroup } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'name', type: 'string | number', default: '—', desc: '选项唯一标识' },
 { prop: 'checked', type: 'boolean', default: 'false', desc: '受控选中状态' },
 { prop: 'defaultChecked', type: 'boolean', default: 'false', desc: '默认选中（非受控）' },
 { prop: 'label', type: 'string | number', default: '—', desc: '标签文字' },
 { prop: 'shape', type: 'circle | square', default: 'square', desc: '形状' },
 { prop: 'size', type: 'number | string', default: '18', desc: '复选框大小' },
 { prop: 'disabled', type: 'boolean | string', default: 'false', desc: '是否禁用' },
 { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '选中颜色' },
 { prop: 'onChange', type: '(checked, { name }) => void', default: '—', desc: '选中变化回调' },
];

export default function CheckboxDemo() {
 const [checked, setChecked] = useState(false);
 const [groupVal, setGroupVal] = useState<Array<string | number | boolean>>(['apple']);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 {/* 1. 单独使用 */}
 <Section title="单独使用">
 <UPCheckbox
 name="agree"
 label="同意协议"
 checked={checked}
 onChange={(c) => { setChecked(c); log(`onChange: ${c}`); }}
 />
 <Value label="选中" value={checked} />
 </Section>

 {/* 2. 不同形状 */}
 <Section title="形状">
 <Row label="方形">
 <UPCheckbox name="s1" label="方形" defaultChecked />
 </Row>
 <Row label="圆形">
 <UPCheckbox name="c1" label="圆形" shape="circle" defaultChecked />
 </Row>
 </Section>

 {/* 3. 自定义颜色 */}
 <Section title="自定义颜色">
 <UPCheckbox name="color1" label="绿色" activeColor="#07c160" defaultChecked />
 <View style={{ height: 8 }} />
 <UPCheckbox name="color2" label="橙色" activeColor="#ff9900" defaultChecked />
 </Section>

 {/* 4. 禁用 */}
 <Section title="禁用">
 <Row label="未选+禁用">
 <UPCheckbox name="d1" label="禁用" disabled />
 </Row>
 <Row label="已选+禁用">
 <UPCheckbox name="d2" label="禁用已选" disabled defaultChecked />
 </Row>
 </Section>

 {/* 5. 复选组（UPSelection） */}
 <Section title="复选组">
 <UPCheckboxGroup value={groupVal} onChange={(val) => { setGroupVal(val); log(`group: ${JSON.stringify(val)}`); }}>
 <Row label="苹果">
 <UPCheckbox name="apple" label="苹果" />
 </Row>
 <Row label="香蕉">
 <UPCheckbox name="banana" label="香蕉" />
 </Row>
 <Row label="橘子">
 <UPCheckbox name="orange" label="橘子" />
 </Row>
 </UPCheckboxGroup>
 <Value label="已选" value={JSON.stringify(groupVal)} />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
