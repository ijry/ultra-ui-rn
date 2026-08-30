/**
 * UPColorPicker 组件示例 — 颜色选择器
 * 展示：基础选择、自定义常用色、受控
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPColorPicker } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string', default: '—', desc: '当前颜色（受控）' },
 { prop: 'defaultValue', type: 'string', default: '—', desc: '默认颜色' },
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示弹窗' },
 { prop: 'commonColors', type: 'string[]', default: '系统预设', desc: '常用颜色列表' },
 { prop: 'onChange', type: '(color) => void', default: '—', desc: '颜色变化回调' },
 { prop: 'onConfirm', type: '(color) => void', default: '—', desc: '确认回调' },
];

export default function ColorPickerDemo() {
 const [color, setColor] = useState('#3c9cff');
 const [show, setShow] = useState(false);
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="内嵌模式">
 <UPColorPicker
 value={color}
 onChange={(c) => {
 setColor(c);
 setEvents((e) => [...e, `change: ${c}`]);
 }}
 />
 <Value label="当前颜色" value={color} />
 </Section>

 <Section title="自定义常用色">
 <UPColorPicker
 commonColors={['#ff0000', '#00ff00', '#0000ff', '#ff6600', '#333']}
 value={color}
 onChange={(c) => {
 setColor(c);
 setEvents((e) => [...e, `change: ${c}`]);
 }}
 />
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
