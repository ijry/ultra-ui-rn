/**
 * UPTextarea 文本域
 * 严格复刻 uview-plus pages/componentsC/textarea/textarea.nvue
 */
import React, { useState } from 'react';
import { Text } from 'react-native';
import { UPTextarea } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: "''", desc: '输入框内容（v-model）' },
  { prop: 'placeholder', type: 'string | number', default: "''", desc: '占位文本' },
  { prop: 'height', type: 'number | string', default: '70', desc: '输入框高度' },
  { prop: 'confirmType', type: 'string', default: "'done'", desc: '右下角按钮的文字' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'count', type: 'boolean', default: 'false', desc: '是否显示统计字数' },
  { prop: 'focus', type: 'boolean', default: 'false', desc: '是否自动获取焦点' },
  { prop: 'autoHeight', type: 'boolean', default: 'false', desc: '是否自动增高' },
  { prop: 'maxlength', type: 'number | string', default: '140', desc: '最大输入长度，-1 为不限制' },
  { prop: 'border', type: "'surround' | 'bottom'", default: "'surround'", desc: '边框类型' },
  { prop: 'formatter', type: '(value: string) => string', default: '—', desc: '内容格式化函数' },
  { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '内容变化时触发' },
  { prop: 'onFocus', type: '() => void', default: '—', desc: '获得焦点时触发' },
  { prop: 'onBlur', type: '(value: string) => void', default: '—', desc: '失去焦点时触发' },
  { prop: 'onConfirm', type: '(value: string) => void', default: '—', desc: '点击完成时触发' },
  { prop: 'onLinechange', type: '(payload) => void', default: '—', desc: '行数变化时触发' },
];

export default function TextareaDemo() {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('统计字数');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  const [value5, setValue5] = useState('');

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPTextarea onChange={setValue1} placeholder="请输入内容" value={value1} />
        <Text>{value1}</Text>
      </Section>

      <Section title="字数统计">
        <UPTextarea count onChange={setValue2} placeholder="请输入内容" value={value2} />
        <Text>{value2}</Text>
      </Section>

      <Section title="自动增高">
        <UPTextarea autoHeight onChange={setValue3} placeholder="请输入内容" value={value3} />
      </Section>

      <Section title="禁用状态">
        <UPTextarea count disabled onChange={setValue4} placeholder="文本域已被禁用" value={value4} />
      </Section>

      <Section title="下划线模式">
        <UPTextarea border="bottom" onChange={setValue5} placeholder="请输入内容" value={value5} />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
