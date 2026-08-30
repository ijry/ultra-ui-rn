/**
 * UPForm 组件示例 — 表单
 * 展示：基础验证、Rules 配置、ref 调用 validate
 */
import React, { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPForm, UPFormItem, UPInput, UPButton, type UPFormRef } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'model', type: 'Record<string, unknown>', default: '—', desc: '表单数据对象' },
 { prop: 'rules', type: 'UPFormRules', default: '—', desc: '验证规则（按 prop 键名）' },
 { prop: 'errorType', type: 'message | toast | border-bottom | none', default: 'message', desc: '错误提示类型' },
 { prop: 'borderBottom', type: 'boolean', default: 'false', desc: '底部边框模式' },
 { prop: 'labelPosition', type: 'left | top', default: 'left', desc: '标签位置' },
 { prop: 'labelWidth', type: 'number | string', default: '—', desc: '标签宽度' },
];

export default function FormDemo() {
 const formRef = useRef<UPFormRef>(null);
 const [model, setModel] = useState({ name: '', password: '' });
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 const rules = {
 name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
 password: [
 { required: true, message: '请输入密码' },
 { min: 6, message: '密码至少6位' },
 ],
 };

 const handleValidate = async () => {
 try {
 await formRef.current?.validate();
 log('validate: success ✅');
 } catch {
 log('validate: failed ❌');
 }
 };

 return (
 <DemoPage>
 <Section title="基础表单验证">
 <UPForm ref={formRef} model={model} rules={rules}>
 <UPFormItem prop="name" label="用户名" required>
 <UPInput
 placeholder="请输入用户名"
 value={model.name}
 onChange={(val) => setModel((m) => ({ ...m, name: val }))}
 />
 </UPFormItem>
 <View style={{ height: 8 }} />
 <UPFormItem prop="password" label="密码" required>
 <UPInput
 placeholder="请输入密码（至少6位）"
 type="password"
 password
 value={model.password}
 onChange={(val) => setModel((m) => ({ ...m, password: val }))}
 />
 </UPFormItem>
 </UPForm>
 <Pressable
 onPress={handleValidate}
 style={{ alignItems: 'center', backgroundColor: '#3c9cff', borderRadius: 6, marginTop: 16, paddingVertical: 10 }}
 >
 <Text style={{ color: '#fff', fontSize: 14 }}>提交验证</Text>
 </Pressable>
 </Section>

 <Section title="异步验证 (ref.validateField)">
 <Pressable
 onPress={async () => {
 try {
 await formRef.current?.validateField('name', 'blur');
 log('validateField name: success ✅');
 } catch {
 log('validateField name: failed ❌');
 }
 }}
 style={{ alignItems: 'center', backgroundColor: '#e6a23c', borderRadius: 6, paddingVertical: 10 }}
 >
 <Text style={{ color: '#fff', fontSize: 14 }}>只验证用户名</Text>
 </Pressable>
 </Section>

 <Section title="清除验证状态">
 <Pressable
 onPress={() => { formRef.current?.clearValidate(); log('clearValidate'); }}
 style={{ alignItems: 'center', backgroundColor: '#909399', borderRadius: 6, paddingVertical: 10 }}
 >
 <Text style={{ color: '#fff', fontSize: 14 }}>清除验证</Text>
 </Pressable>
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
