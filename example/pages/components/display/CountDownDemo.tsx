/**
 * UPCountDown 组件示例 — 倒计时
 * 展示：基础倒计时、自定义格式、毫秒、完成回调
 */
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPCountDown } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'time', type: 'number | string', default: '—', desc: '倒计时时长(ms)' },
  { prop: 'format', type: 'string', default: 'HH:mm:ss', desc: '时间格式' },
  { prop: 'autoStart', type: 'boolean', default: 'true', desc: '自动开始' },
  { prop: 'millisecond', type: 'boolean', default: 'false', desc: '显示毫秒' },
  { prop: 'onFinish', type: '() => void', default: '—', desc: '倒计时结束回调' },
  { prop: 'onChange', type: '(timeData) => void', default: '—', desc: '时间变化回调' },
];

export default function CountDownDemo({ onBack }: DemoProps) {
  const [finished, setFinished] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="CountDown 倒计时" onBack={onBack}>
      <Section title="基础倒计时（10秒）">
        <UPCountDown
          time={10000}
          onFinish={() => { log('onFinish'); setFinished(true); }}
          onChange={(data) => log(`tick: ${data.seconds}s`)}
        />
        {finished ? <Text style={{ color: '#67c23a', marginTop: 8 }}>✅ 倒计时结束！</Text> : null}
      </Section>

      <Section title="自定义格式（mm:ss）">
        <UPCountDown time={120000} format="mm:ss" />
      </Section>

      <Section title="显示毫秒">
        <UPCountDown time={5000} millisecond format="ss.S" />
      </Section>

      <Section title="自定义渲染">
        <UPCountDown time={15000}>
          {(timeData) => (
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <View style={{ backgroundColor: '#3c9cff', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{String(timeData.hours).padStart(2, '0')}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700' }}>:</Text>
              <View style={{ backgroundColor: '#3c9cff', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{String(timeData.minutes).padStart(2, '0')}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700' }}>:</Text>
              <View style={{ backgroundColor: '#3c9cff', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{String(timeData.seconds).padStart(2, '0')}</Text>
              </View>
            </View>
          )}
        </UPCountDown>
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
