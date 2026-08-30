/**
 * UPTextarea 组件示例 — 多行输入框
 * 展示：基础用法、字数统计、自动高度、禁用、边框样式
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { UPTextarea } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string | number', default: '—', desc: '受控值（v-model）' },
 { prop: 'placeholder', type: 'string', default: '—', desc: '占位文本' },
 { prop: 'height', type: 'number | string', default: '150', desc: '高度' },
 { prop: 'maxlength', type: 'number | string', default: '—', desc: '最大长度' },
 { prop: 'count', type: 'boolean', default: 'false', desc: '显示字数统计' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'autoHeight', type: 'boolean', default: 'false', desc: '自动撑高' },
 { prop: 'border', type: 'surround | bottom', default: 'surround', desc: '边框样式' },
 { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '值变化回调' },
 { prop: 'onFocus', type: '() => void', default: '—', desc: '聚焦回调' },
 { prop: 'onBlur', type: '(value: string) => void', default: '—', desc: '失焦回调' },
];

export default function TextareaDemo() {
 const [v1, setV1] = useState('');
 const [v2, setV2] = useState('第一行\n第二行\n第三行');
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPTextarea
 placeholder="请输入内容..."
 value={v1}
 onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
 />
 <Value label="当前值" value={v1 || '—'} />
 </Section>

 <Section title="字数统计">
 <UPTextarea
 placeholder="最多200个字符"
 maxlength={200}
 count
 value={v1}
 onChange={setV1}
 />
 </Section>

 <Section title="预置值 + 高度">
 <UPTextarea
 value={v2}
 onChange={setV2}
 height={200}
 />
 <Value label="当前值" value={v2} />
 </Section>

 <Section title="底部边框">
 <UPTextarea placeholder="底部边框样式" border="bottom" />
 </Section>

 <Section title="禁用">
 <UPTextarea placeholder="禁用" disabled value="禁用状态" />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
