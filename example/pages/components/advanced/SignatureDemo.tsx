/**
 * UPSignature 组件示例 — 签名
 * 展示：基础签名、自定义颜色粗细、工具栏
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPSignature } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'color', type: 'string', default: "'#000'", desc: '画笔颜色' },
 { prop: 'bgColor', type: 'string', default: "'#fff'", desc: '背景色' },
 { prop: 'thickness', type: 'number', default: '2', desc: '画笔粗细' },
 { prop: 'showToolbar', type: 'boolean', default: 'true', desc: '是否显示工具栏' },
 { prop: 'presetColors', type: 'string[]', default: '["#000"]', desc: '预设颜色' },
 { prop: 'onConfirm', type: '(result) => void', default: '—', desc: '确认回调' },
 { prop: 'onClear', type: '() => void', default: '—', desc: '清除回调' },
];

export default function SignatureDemo() {
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="基础签名">
 <UPSignature
 height={200}
 showToolbar
 onConfirm={(result) => setEvents((e) => [...e, `confirm: ${result.dataUrl?.substring(0, 30)}...`])}
 onClear={() => setEvents((e) => [...e, 'clear'])}
 onError={(err) => setEvents((e) => [...e, `error: ${err.message}`])}
 />
 </Section>

 <Section title="自定义颜色和粗细">
 <UPSignature
 color="#ff6600"
 thickness={4}
 bgColor="#f5f5f5"
 height={150}
 presetColors={['#ff6600', '#333', '#3c9cff', '#67c23a']}
 onConfirm={(result) => setEvents((e) => [...e, 'confirm (custom)'])}
 />
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
