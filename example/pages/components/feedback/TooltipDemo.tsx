/**
 * UPTooltip 组件示例 — 文字提示
 * 复刻 uview-plus u-tooltip 页面结构
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPTooltip } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string | number', default: '—', desc: '提示文字' },
  { prop: 'color', type: 'string', default: '主题色', desc: '背景色' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '文字颜色' },
  { prop: 'direction', type: 'top | bottom | left | right', default: "'top'", desc: '弹出方向' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
  { prop: 'showCopy', type: 'boolean', default: 'false', desc: '显示复制按钮' },
  { prop: 'overlay', type: 'boolean', default: 'false', desc: '显示遮罩' },
  { prop: 'trigger', type: 'ReactNode', default: '—', desc: '触发元素' },
];

export default function TooltipDemo({ onBack }: DemoProps) {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Tooltip 文字提示" onBack={onBack}>
      <Section title="基础用法">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <UPTooltip
            text="提示文字内容"
            direction="top"
            trigger={<View style={tt.trigger}><Text>点击触发</Text></View>}
          />
        </View>
      </Section>

      <Section title="不同方向">
        <View style={tt.row}>
          <UPTooltip text="上方提示" direction="top" trigger={<View style={tt.trigger}><Text>上</Text></View>} />
          <UPTooltip text="下方提示" direction="bottom" trigger={<View style={tt.trigger}><Text>下</Text></View>} />
          <UPTooltip text="左侧提示" direction="left" trigger={<View style={tt.trigger}><Text>左</Text></View>} />
          <UPTooltip text="右侧提示" direction="right" trigger={<View style={tt.trigger}><Text>右</Text></View>} />
        </View>
      </Section>

      <Section title="自定义颜色">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <UPTooltip
            text="橙色背景"
            color="#ff6600"
            trigger={<View style={tt.trigger}><Text>自定义颜色</Text></View>}
          />
        </View>
      </Section>

      <Section title="显示复制按钮">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <UPTooltip
            text="可复制的提示文字"
            showCopy
            trigger={<View style={tt.trigger}><Text>带复制</Text></View>}
          />
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const tt = StyleSheet.create({
  trigger: { backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
});
