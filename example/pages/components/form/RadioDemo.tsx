/**
 * UPRadio 组件示例 — 单选框
 * 展示：单独使用、单选组、自定义颜色、禁用、形状
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { UPRadio, UPRadioGroup } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'name', type: 'string | number', default: '—', desc: '选项唯一标识' },
 { prop: 'label', type: 'string | number', default: '—', desc: '标签文字' },
 { prop: 'shape', type: 'circle | square', default: 'circle', desc: '形状' },
 { prop: 'size', type: 'number | string', default: '18', desc: '单选框大小' },
 { prop: 'disabled', type: 'boolean | string', default: 'false', desc: '是否禁用' },
 { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '选中颜色' },
 { prop: 'onChange', type: '(name) => void', default: '—', desc: '选中变化回调（返回 name）' },
];

export default function RadioDemo() {
 const [selected, setSelected] = useState('b');
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 {/* 1. 基础用法 */}
 <Section title="基础用法">
 <UPRadio name="a" label="选项 A" />
 <View style={{ height: 8 }} />
 <UPRadio name="b" label="选项 B" />
 </Section>

 {/* 2. 受控单选组 */}
 <Section title="受控单选组">
 <UPRadioGroup value={selected} onChange={(val) => { setSelected(val as string); log(`group: ${val}`); }}>
 <Row label="选项1">
 <UPRadio name="a" label="选项 A" />
 </Row>
 <Row label="选项2">
 <UPRadio name="b" label="选项 B" />
 </Row>
 <Row label="选项3">
 <UPRadio name="c" label="选项 C" />
 </Row>
 </UPRadioGroup>
 <Value label="已选" value={selected} />
 </Section>

 {/* 3. 自定义颜色 */}
 <Section title="自定义颜色">
 <UPRadio name="r1" label="红色" activeColor="#f56c6c" />
 <View style={{ height: 8 }} />
 <UPRadio name="r2" label="绿色" activeColor="#07c160" />
 </Section>

 {/* 4. 禁用 */}
 <Section title="禁用">
 <Row label="未选+禁用">
 <UPRadio name="d1" label="禁用" disabled />
 </Row>
 <Row label="已选+禁用">
 <UPRadio name="d2" label="禁用已选" disabled />
 </Row>
 </Section>

 {/* 5. 方形 */}
 <Section title="方形形状">
 <UPRadio name="sq1" label="方形单选" shape="square" />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
