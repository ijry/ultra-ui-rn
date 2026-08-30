/**
 * UPCarKeyboard 组件示例 — 车牌键盘
 * 复刻 uview-plus u-car-keyboard 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPCarKeyboard } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'random', type: 'boolean', default: 'false', desc: '随机排列' },
  { prop: 'autoChange', type: 'boolean', default: 'true', desc: '自动切换字母/省份' },
  { prop: 'onChange', type: '(value) => void', default: '—', desc: '按键回调' },
  { prop: 'onBackspace', type: '() => void', default: '—', desc: '退格回调' },
];

export default function CarKeyboardDemo({ onBack }: DemoProps) {
  const [plate, setPlate] = useState('');
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="CarKeyboard 车牌键盘" onBack={onBack}>
      <Section title="基础用法">
        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8 }}>
          <View style={{ height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Text style={{ fontSize: 20, letterSpacing: 4, color: '#333' }}>{plate || '请输入车牌'}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>已输入 {plate.length} 位</Text>
        </View>
        <UPCarKeyboard
          onChange={(value) => {
            setPlate((p) => p + value);
            setEvents((e) => [...e, `key: ${value}`]);
          }}
          onBackspace={() => {
            setPlate((p) => p.slice(0, -1));
            setEvents((e) => [...e, 'backspace']);
          }}
        />
      </Section>

      <Section title="随机排列">
        <UPCarKeyboard
          random
          onChange={(value) => setEvents((e) => [...e, `key: ${value}`])}
        />
      </Section>

      <Value label="当前车牌" value={plate || '—'} />
      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
