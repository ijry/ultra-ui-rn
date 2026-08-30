/**
 * UPChoose 组件示例 — 选择器
 * 复刻 uview-plus u-choose 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPChoose } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const OPTIONS = [
  { value: '1', label: '选项一' },
  { value: '2', label: '选项二' },
  { value: '3', label: '选项三' },
  { value: '4', label: '选项四' },
  { value: '5', label: '选项五' },
  { value: '6', label: '选项六' },
];

const PROPS = [
  { prop: 'options', type: 'ChooseOption[]', default: '[]', desc: '选项列表' },
  { prop: 'modelValue', type: 'number | string | (number | string)[]', default: '—', desc: '受控值' },
  { prop: 'type', type: 'string', default: '—', desc: '类型' },
  { prop: 'wrap', type: 'boolean', default: 'false', desc: '自动换行' },
  { prop: 'itemWidth', type: 'number | string', default: '—', desc: '选项宽度' },
  { prop: 'itemHeight', type: 'number | string', default: '—', desc: '选项高度' },
  { prop: 'onUpdateModelValue', type: '(index) => void', default: '—', desc: '值变化回调' },
];

export default function ChooseDemo({ onBack }: DemoProps) {
  const [value, setValue] = useState<number | string>('');
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Choose 选择器" onBack={onBack}>
      <Section title="基础用法">
        <UPChoose
          options={OPTIONS}
          modelValue={value}
          wrap
          onUpdateModelValue={(v) => {
            setValue(v);
            setEvents((e) => [...e, `select: ${v}`]);
          }}
        />
      </Section>

      <Value label="当前值" value={value || '—'} />
      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
