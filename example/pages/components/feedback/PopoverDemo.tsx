/**
 * UPPopover 组件示例 — 气泡弹出
 * 复刻 uview-plus u-popover 页面结构
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPPopover } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string | number', default: '—', desc: '提示文字' },
  { prop: 'color', type: 'string', default: '—', desc: '背景色' },
  { prop: 'placement', type: 'top | bottom | left | right', default: "'top'", desc: '弹出位置' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
  { prop: 'trigger', type: 'ReactNode', default: '—', desc: '触发元素' },
  { prop: 'content', type: 'ReactNode', default: '—', desc: '自定义内容' },
];

export default function PopoverDemo({ onBack }: DemoProps) {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Popover 气泡弹出" onBack={onBack}>
      <Section title="基础用法">
        <View style={pp.row}>
          <UPPopover
            text="上方弹出"
            placement="top"
            trigger={<View style={pp.trigger}><Text>上</Text></View>}
          />
          <UPPopover
            text="下方弹出"
            placement="bottom"
            trigger={<View style={pp.trigger}><Text>下</Text></View>}
          />
        </View>
      </Section>

      <Section title="自定义内容">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <UPPopover
            content={
              <View style={{ padding: 8 }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>自定义气泡内容</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>支持 ReactNode</Text>
              </View>
            }
            trigger={<View style={pp.trigger}><Text>自定义内容</Text></View>}
          />
        </View>
      </Section>

      <Section title="自定义颜色">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <UPPopover
            text="橙色气泡"
            color="#ff6600"
            trigger={<View style={pp.trigger}><Text>自定义颜色</Text></View>}
          />
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const pp = StyleSheet.create({
  trigger: { backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
});
