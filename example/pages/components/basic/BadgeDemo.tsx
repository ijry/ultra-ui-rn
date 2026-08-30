/**
 * UPBadge 组件示例 — 徽标
 * 复刻 uview-plus u-badge 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPBadge } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'isDot', type: 'boolean', default: 'false', desc: '圆点模式' },
  { prop: 'value', type: 'string | number', default: '—', desc: '徽标值' },
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示' },
  { prop: 'max', type: 'number', default: '99', desc: '最大值' },
  { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'error'", desc: '类型' },
  { prop: 'shape', type: "'circle' | 'horn'", default: "'circle'", desc: '形状' },
  { prop: 'numberType', type: "'overflow' | 'ellipsis' | 'limit'", default: "'overflow'", desc: '数字处理方式' },
  { prop: 'offset', type: '[number, number?]', default: '—', desc: '偏移量' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
  { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
];

export default function BadgeDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Badge 徽标" onBack={onBack}>
      <Section title="基础用法">
        <View style={bd.row}>
          <UPBadge value={5}>
            <View style={bd.box}><Text>消息</Text></View>
          </UPBadge>
          <UPBadge value={100} max={99}>
            <View style={bd.box}><Text>邮件</Text></View>
          </UPBadge>
          <UPBadge isDot>
            <View style={bd.box}><Text>通知</Text></View>
          </UPBadge>
        </View>
      </Section>

      <Section title="类型">
        <View style={bd.row}>
          <UPBadge type="info" value="info"><View style={bd.box}><Text>info</Text></View></UPBadge>
          <UPBadge type="primary" value="primary"><View style={bd.box}><Text>primary</Text></View></UPBadge>
          <UPBadge type="success" value="success"><View style={bd.box}><Text>success</Text></View></UPBadge>
          <UPBadge type="warning" value="warning"><View style={bd.box}><Text>warning</Text></View></UPBadge>
          <UPBadge type="error" value="error"><View style={bd.box}><Text>error</Text></View></UPBadge>
        </View>
      </Section>

      <Section title="自定义颜色">
        <View style={bd.row}>
          <UPBadge value={1} bgColor="#ff6600"><View style={bd.box}><Text>自定义</Text></View></UPBadge>
          <UPBadge isDot bgColor="#67c23a"><View style={bd.box}><Text>绿点</Text></View></UPBadge>
        </View>
      </Section>

      <Section title="独立使用">
        <View style={bd.row}>
          <UPBadge value={5} />
          <UPBadge value={100} max={99} />
          <UPBadge isDot />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const bd = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', paddingVertical: 8 },
  box: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 },
});
