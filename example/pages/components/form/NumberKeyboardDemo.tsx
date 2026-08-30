/**
 * UPNumberKeyboard 组件示例 — 数字键盘
 * 复刻 uview-plus u-number-keyboard 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPNumberKeyboard } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'mode', type: "'number' | 'price' | 'idcard'", default: "'number'", desc: '键盘模式' },
 { prop: 'dotDisabled', type: 'boolean', default: 'false', desc: '禁用小数点' },
 { prop: 'random', type: 'boolean', default: 'false', desc: '随机排列' },
 { prop: 'onChange', type: '(value) => void', default: '—', desc: '按键回调' },
 { prop: 'onBackspace', type: '() => void', default: '—', desc: '退格回调' },
];

export default function NumberKeyboardDemo() {
 const [value, setValue] = useState('');
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="数字模式">
 <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8 }}>
 <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
 <Text style={{ fontSize: 20, color: '#333' }}>{value || '0'}</Text>
 </View>
 </View>
 <UPNumberKeyboard
 mode="number"
 onChange={(v) => {
 setValue((prev) => prev + v);
 setEvents((e) => [...e, `key: ${v}`]);
 }}
 onBackspace={() => {
 setValue((prev) => prev.slice(0, -1));
 setEvents((e) => [...e, 'backspace']);
 }}
 />
 </Section>

 <Section title="价格模式（带小数点）">
 <UPNumberKeyboard
 mode="number" dotDisabled={false}
 onChange={(v) => setEvents((e) => [...e, `price key: ${v}`])}
 />
 </Section>

 <Section title="身份证模式">
 <UPNumberKeyboard
 mode="card"
 onChange={(v) => setEvents((e) => [...e, `idcard key: ${v}`])}
 />
 </Section>

 <Section title="随机排列 + 禁用小数点">
 <UPNumberKeyboard
 random
 dotDisabled
 onChange={(v) => setEvents((e) => [...e, `random key: ${v}`])}
 />
 </Section>

 <Value label="当前输入" value={value || '—'} />
 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
