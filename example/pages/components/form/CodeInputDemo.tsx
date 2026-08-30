/**
 * UPCodeInput 组件示例 — 验证码输入框
 * 复刻 uview-plus u-code-input 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPCodeInput } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string | number', default: '—', desc: '受控值' },
 { prop: 'maxlength', type: 'number | string', default: '6', desc: '最大长度' },
 { prop: 'mode', type: "'box' | 'line'", default: "'box'", desc: '输入模式' },
 { prop: 'dot', type: 'boolean', default: 'false', desc: '密码模式' },
 { prop: 'hairline', type: 'boolean', default: 'false', desc: '细边框' },
 { prop: 'bold', type: 'boolean', default: 'false', desc: '加粗' },
 { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'fontSize', type: 'number | string', default: '18', desc: '字号' },
 { prop: 'size', type: 'number | string', default: '40', desc: '格子大小' },
 { prop: 'space', type: 'number | string', default: '10', desc: '格子间距' },
 { prop: 'borderColor', type: 'string', default: '—', desc: '边框颜色' },
 { prop: 'focus', type: 'boolean', default: 'true', desc: '自动聚焦' },
 { prop: 'onChange', type: '(value) => void', default: '—', desc: '值变化回调' },
 { prop: 'onFinish', type: '(value) => void', default: '—', desc: '输入完成回调' },
];

export default function CodeInputDemo() {
 const [code1, setCode1] = useState('');
 const [code2, setCode2] = useState('');
 const [code3, setCode3] = useState('');
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="box模式">
 <View style={{ padding: 12 }}>
 <UPCodeInput
 maxlength={6}
 mode="box"
 value={code1}
 onChange={(v) => setCode1(v)}
 onFinish={(v) => setEvents((e) => [...e, `finish: ${v}`])}
 />
 </View>
 <Value label="输入值" value={code1 || '—'} />
 </Section>

 <Section title="line模式">
 <View style={{ padding: 12 }}>
 <UPCodeInput
 maxlength={4}
 mode="line"
 value={code2}
 onChange={(v) => setCode2(v)}
 onFinish={(v) => setEvents((e) => [...e, `finish: ${v}`])}
 />
 </View>
 <Value label="输入值" value={code2 || '—'} />
 </Section>

 <Section title="密码模式（dot）">
 <View style={{ padding: 12 }}>
 <UPCodeInput
 maxlength={6}
 mode="box"
 dot
 value={code3}
 onChange={(v) => setCode3(v)}
 onFinish={(v) => setEvents((e) => [...e, `finish: ${v}`])}
 />
 </View>
 <Value label="输入值" value={code3 || '—'} />
 </Section>

 <Section title="自定义颜色 + 大小">
 <View style={{ padding: 12 }}>
 <UPCodeInput
 maxlength={4}
 mode="box"
 size={50}
 fontSize={24}
 bold
 color="#3c9cff"
 borderColor="#3c9cff"
 />
 </View>
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
