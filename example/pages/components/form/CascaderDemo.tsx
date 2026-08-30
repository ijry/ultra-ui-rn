/**
 * UPCascader 组件示例 — 级联选择器
 * 复刻 uview-plus u-cascader 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPCascader } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const DATA = [
 {
 value: '1', label: '浙江省',
 children: [
 { value: '11', label: '杭州市' },
 { value: '12', label: '宁波市' },
 { value: '13', label: '温州市' },
 ],
 },
 {
 value: '2', label: '广东省',
 children: [
 { value: '21', label: '广州市' },
 { value: '22', label: '深圳市' },
 { value: '23', label: '东莞市' },
 ],
 },
 {
 value: '3', label: '北京市',
 children: [
 { value: '31', label: '朝阳区' },
 { value: '32', label: '海淀区' },
 ],
 },
];

const PROPS = [
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
 { prop: 'data', type: 'CascaderNode[]', default: '[]', desc: '级联数据' },
 { prop: 'modelValue', type: 'string[]', default: '[]', desc: '受控值' },
 { prop: 'autoClose', type: 'boolean', default: 'true', desc: '选择后自动关闭' },
 { prop: 'closeable', type: 'boolean', default: 'true', desc: '显示关闭按钮' },
];

export default function CascaderDemo() {
 const [show, setShow] = useState(false);
 const [value, setValue] = useState<string[]>([]);
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <View style={{ padding: 12 }}>
 <View
 style={{ height: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#ddd' }}
 onTouchEnd={() => setShow(true)}
 >
 <Text style={{ color: value.length ? '#333' : '#999' }}>
 {value.length ? value.join(' / ') : '请选择地区'}
 </Text>
 </View>
 </View>
 <UPCascader
 show={show}
 data={DATA}
 modelValue={value}
 autoClose
 closeable
 onChange={(v) => {
 setValue(v as string[]);
 setEvents((e) => [...e, `change: ${v.join('/')}`]);
 }}
 
 />
 </Section>

 <Value label="当前值" value={value.join(' → ') || '—'} />
 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
