/**
 * UPFormItem 组件示例 — 表单项
 * 复刻 uview-plus u-form-item 页面结构
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPFormItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'label', type: 'string', default: '—', desc: '标签文字' },
  { prop: 'prop', type: 'string', default: '—', desc: '字段标识' },
  { prop: 'required', type: 'boolean', default: 'false', desc: '是否必填' },
  { prop: 'labelPosition', type: "'left' | 'top'", default: "'left'", desc: '标签位置' },
  { prop: 'labelWidth', type: 'number | string', default: '—', desc: '标签宽度' },
  { prop: 'borderBottom', type: 'boolean', default: 'false', desc: '底部边框' },
  { prop: 'rules', type: 'FormRule[]', default: '—', desc: '校验规则' },
  { prop: 'rightIcon', type: 'string', default: '—', desc: '右侧图标' },
  { prop: 'leftIcon', type: 'string', default: '—', desc: '左侧图标' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
];

export default function FormItemDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="FormItem 表单项" onBack={onBack}>
      <Section title="基础用法">
        <UPFormItem label="姓名">
          <View style={{ height: 40, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <Text style={{ color: '#999' }}>请输入姓名</Text>
          </View>
        </UPFormItem>
      </Section>

      <Section title="必填标记">
        <UPFormItem label="手机号" required>
          <View style={{ height: 40, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <Text style={{ color: '#999' }}>请输入手机号</Text>
          </View>
        </UPFormItem>
      </Section>

      <Section title="标签在上方">
        <UPFormItem label="详细地址" labelPosition="top" required>
          <View style={{ height: 80, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <Text style={{ color: '#999' }}>请输入详细地址</Text>
          </View>
        </UPFormItem>
      </Section>

      <Section title="底部边框">
        <UPFormItem label="用户名" borderBottom>
          <View style={{ height: 40, justifyContent: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: '#999' }}>请输入用户名</Text>
          </View>
        </UPFormItem>
        <UPFormItem label="邮箱" borderBottom>
          <View style={{ height: 40, justifyContent: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: '#999' }}>请输入邮箱</Text>
          </View>
        </UPFormItem>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
