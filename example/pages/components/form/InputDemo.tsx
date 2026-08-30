/**
 * UPInput 组件示例 — 输入框
 * 展示：受控/非受控、密码、清空、前缀/后缀图标、字数统计、边框样式
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPInput } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '受控值（v-model）' },
  { prop: 'placeholder', type: 'string', default: '—', desc: '占位提示文本' },
  { prop: 'type', type: 'string', default: '—', desc: '类型：text/password/number/digit/idcard' },
  { prop: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清除按钮' },
  { prop: 'password', type: 'boolean', default: 'false', desc: '是否密码输入' },
  { prop: 'passwordVisibilityToggle', type: 'boolean', default: 'false', desc: '密码显隐切换' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { prop: 'maxlength', type: 'number | string', default: '—', desc: '最大输入长度' },
  { prop: 'showWordLimit', type: 'boolean', default: 'false', desc: '显示字数统计' },
  { prop: 'border', type: "surround | bottom | none", default: 'surround', desc: '边框样式' },
  { prop: 'shape', type: 'circle | square', default: 'square', desc: '边框形状（surround 时）' },
  { prop: 'inputAlign', type: 'left | center | right', default: 'left', desc: '输入文字对齐' },
  { prop: 'prefixIcon', type: 'string', default: '—', desc: '前置图标名' },
  { prop: 'suffixIcon', type: 'string', default: '—', desc: '后置图标名' },
  { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '值变化回调' },
  { prop: 'onFocus', type: '() => void', default: '—', desc: '聚焦回调' },
  { prop: 'onBlur', type: '(value: string) => void', default: '—', desc: '失焦回调' },
  { prop: 'onClear', type: '() => void', default: '—', desc: '清空回调' },
];

export default function InputDemo({ onBack }: DemoProps) {
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [v3, setV3] = useState('');
  const [v4, setV4] = useState('已输入内容');
  const [v5, setV5] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Input 输入框" onBack={onBack}>
      {/* 1. 基础用法 */}
      <Section title="基础用法">
        <UPInput
          placeholder="请输入内容"
          value={v1}
          onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
          onFocus={() => log('onFocus')}
          onBlur={(val) => log(`onBlur: ${val}`)}
        />
        <Value label="当前值" value={v1} />
      </Section>

      {/* 2. 密码输入 + 可见切换 */}
      <Section title="密码输入">
        <UPInput
          type="password"
          placeholder="请输入密码"
          password
          passwordVisibilityToggle
          value={v2}
          onChange={setV2}
        />
        <Value label="当前值" value={v2} />
      </Section>

      {/* 3. 可清空 */}
      <Section title="可清空">
        <UPInput
          placeholder="输入后出现清除按钮"
          clearable
          onlyClearableOnFocused
          value={v3}
          onChange={setV3}
          onClear={() => log('onClear')}
        />
        <Value label="当前值" value={v3} />
      </Section>

      {/* 4. 字数统计 */}
      <Section title="字数统计">
        <UPInput
          placeholder="最多10个字符"
          maxlength={10}
          showWordLimit
          value={v4}
          onChange={setV4}
        />
      </Section>

      {/* 5. 前缀/后缀图标 */}
      <Section title="前后缀图标">
        <UPInput
          placeholder="搜索"
          prefixIcon="search"
          suffixIcon="arrow-right"
          value={v5}
          onChange={setV5}
        />
      </Section>

      {/* 6. 边框变体 */}
      <Section title="边框样式">
        <UPInput placeholder="surround（默认）" border="surround" />
        <View style={{ height: 10 }} />
        <UPInput placeholder="bottom" border="bottom" />
        <View style={{ height: 10 }} />
        <UPInput placeholder="none（无边框）" border="none" />
      </Section>

      {/* 7. 禁用 / 只读 */}
      <Section title="禁用 / 只读">
        <UPInput placeholder="禁用" disabled />
        <View style={{ height: 10 }} />
        <UPInput placeholder="只读" readonly value="只读内容" />
      </Section>

      {/* 8. 圆形边框 + 居中对齐 */}
      <Section title="圆形 + 居中">
        <UPInput placeholder="圆形居中" shape="circle" inputAlign="center" border="surround" />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
