/**
 * UPDatetimePicker 组件示例 — 日期时间选择器
 * 复刻 uview-plus u-datetime-picker 页面结构
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UPDatetimePicker } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'modelValue', type: 'string | Date', default: '—', desc: '受控值' },
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
 { prop: 'mode', type: "'date' | 'time' | 'year-month' | 'datetime'", default: "'datetime'", desc: '选择模式' },
 { prop: 'format', type: 'string', default: '—', desc: '格式化' },
 { prop: 'hasInput', type: 'boolean', default: 'false', desc: '显示输入框' },
 { prop: 'placeholder', type: 'string', default: '—', desc: '占位文字' },
 { prop: 'showToolbar', type: 'boolean', default: 'true', desc: '显示工具栏' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '禁用' },
 { prop: 'onChange', type: '(value) => void', default: '—', desc: '值变化回调' },
 { prop: 'onConfirm', type: '(value) => void', default: '—', desc: '确认回调' },
 { prop: 'onCancel', type: '() => void', default: '—', desc: '取消回调' },
];

export default function DatetimePickerDemo() {
 const [show1, setShow1] = useState(false);
 const [show2, setShow2] = useState(false);
 const [show3, setShow3] = useState(false);
 const [date1, setDate1] = useState('');
 const [date2, setDate2] = useState('');
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="日期选择">
 <Pressable style={dp.trigger} onPress={() => setShow1(true)}>
 <Text style={{ color: date1 ? '#333' : '#999' }}>{date1 || '请选择日期'}</Text>
 </Pressable>
 <UPDatetimePicker
 show={show1}
 mode="date"
 modelValue={date1}
 onChange={(v) => setDate1(String(v))}
 onConfirm={(v) => { setDate1(String(v)); setShow1(false); setEvents((e) => [...e, `date: ${v}`]); }}
 onCancel={() => setShow1(false)}
 />
 </Section>

 <Section title="时间选择">
 <Pressable style={dp.trigger} onPress={() => setShow2(true)}>
 <Text style={{ color: date2 ? '#333' : '#999' }}>{date2 || '请选择时间'}</Text>
 </Pressable>
 <UPDatetimePicker
 show={show2}
 mode="time"
 modelValue={date2}
 onChange={(v) => setDate2(String(v))}
 onConfirm={(v) => { setDate2(String(v)); setShow2(false); setEvents((e) => [...e, `time: ${v}`]); }}
 onCancel={() => setShow2(false)}
 />
 </Section>

 <Section title="带输入框">
 <UPDatetimePicker
 mode="datetime"
 hasInput
 placeholder="点击输入或选择"
 onChange={(v) => setEvents((e) => [...e, `input: ${v}`])}
 />
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const dp = StyleSheet.create({
 trigger: { height: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
});
