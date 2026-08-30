/**
 * UPCode 组件示例 — 验证码倒计时
 * 复刻 uview-plus u-code 页面结构
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UPCode } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'seconds', type: 'number | string', default: '60', desc: '倒计时秒数' },
  { prop: 'startText', type: 'string', default: "'获取验证码'", desc: '开始文字' },
  { prop: 'changeText', type: 'string', default: "'xs后重新获取'", desc: '倒计时文字' },
  { prop: 'endText', type: 'string', default: "'重新获取'", desc: '结束文字' },
  { prop: 'keepRunning', type: 'boolean', default: 'false', desc: '保持运行状态' },
  { prop: 'onStart', type: '() => void', default: '—', desc: '开始回调' },
  { prop: 'onChange', type: '(text) => void', default: '—', desc: '文字变化回调' },
  { prop: 'onEnd', type: '() => void', default: '—', desc: '结束回调' },
];

export default function CodeDemo({ onBack }: DemoProps) {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Code 验证码倒计时" onBack={onBack}>
      <Section title="基础用法">
        <View style={{ padding: 12, alignItems: 'center' }}>
          <UPCode
            seconds={10}
            startText="获取验证码"
            changeText="xs后重新获取"
            endText="重新获取"
            onStart={() => setEvents((e) => [...e, 'start'])}
            onChange={(text) => setEvents((e) => [...e, `change: ${text}`])}
            onEnd={() => setEvents((e) => [...e, 'end'])}
          />
        </View>
      </Section>

      <Section title="自定义秒数">
        <View style={{ padding: 12, alignItems: 'center' }}>
          <UPCode
            seconds={30}
            startText="发送短信"
            changeText="秒后可重发"
            endText="重发短信"
            onStart={() => setEvents((e) => [...e, 'start (30s)'])}
            onEnd={() => setEvents((e) => [...e, 'end (30s)'])}
          />
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
