/**
 * UPMessageInput 组件示例 — 验证码输入
 * 展示：基础输入、不同模式、自定义样式
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPMessageInput } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '受控值' },
  { prop: 'maxlength', type: 'number | string', default: '6', desc: '最大长度' },
  { prop: 'mode', type: "'box' | 'bottomLine' | 'middleLine'", default: "'box'", desc: '输入模式' },
  { prop: 'dotFill', type: 'boolean', default: 'false', desc: '密码模式(点填充)' },
  { prop: 'breathe', type: 'boolean', default: 'true', desc: '光标呼吸动画' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '加粗文字' },
  { prop: 'fontSize', type: 'number', default: '18', desc: '字号' },
  { prop: 'activeColor', type: 'string', default: '主题色', desc: '激活颜色' },
  { prop: 'width', type: 'number', default: '40', desc: '单格宽度' },
];

export default function MessageInputDemo({ onBack }: DemoProps) {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');

  return (
    <DemoPage title="MessageInput 验证码输入" onBack={onBack}>
      <Section title="基础（box模式）">
        <UPMessageInput
          maxlength={6}
          mode="box"
          value={code1}
          onChange={(v) => setCode1(String(v))}
        />
        <Value label="输入值" value={code1 || '—'} />
      </Section>

      <Section title="密码模式（dotFill）">
        <UPMessageInput
          maxlength={4}
          mode="box"
          dotFill
          value={code2}
          onChange={(v) => setCode2(String(v))}
        />
        <Value label="输入值" value={code2 || '—'} />
      </Section>

      <Section title="底部线条模式">
        <UPMessageInput
          maxlength={6}
          mode="bottomLine"
          value={code3}
          onChange={(v) => setCode3(String(v))}
        />
        <Value label="输入值" value={code3 || '—'} />
      </Section>

      <Section title="加粗 + 自定义颜色">
        <UPMessageInput
          maxlength={4}
          bold
          fontSize={24}
          width={50}
          activeColor="#ff6600"
          breathe={false}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
