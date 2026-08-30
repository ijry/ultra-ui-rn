/**
 * UPText 组件示例 — 文本
 * 复刻 uview-plus u-text 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPText } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error' | 'text' | 'main'", default: "'info'", desc: '文字类型' },
  { prop: 'text', type: 'string | number', default: '—', desc: '文字内容' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '加粗' },
  { prop: 'block', type: 'boolean', default: 'false', desc: '块级' },
  { prop: 'lines', type: 'number', default: '—', desc: '最大行数' },
  { prop: 'color', type: 'string', default: '—', desc: '颜色' },
  { prop: 'size', type: 'number | string', default: '—', desc: '字号' },
  { prop: 'decoration', type: "'underline' | 'line-through' | 'none'", default: '—', desc: '装饰线' },
];

export default function TextDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Text 文本" onBack={onBack}>
      <Section title="文字类型">
        <View style={tx.row}>
          <UPText type="info" text="info" />
          <UPText type="primary" text="primary" />
          <UPText type="success" text="success" />
          <UPText type="warning" text="warning" />
          <UPText type="error" text="error" />
        </View>
      </Section>

      <Section title="加粗">
        <UPText type="primary" text="加粗文字" bold />
      </Section>

      <Section title="自定义颜色和大小">
        <View style={tx.row}>
          <UPText text="橙色16号" color="#ff6600" size={16} />
          <UPText text="绿色14号" color="#67c23a" size={14} />
          <UPText text="蓝色12号" color="#3c9cff" size={12} />
        </View>
      </Section>

      <Section title="装饰线">
        <View style={tx.row}>
          <UPText text="下划线" decoration="underline" />
          <UPText text="删除线" decoration="line-through" />
        </View>
      </Section>

      <Section title="多行省略">
        <UPText
          text="这是一段很长的文本内容，用于演示多行省略的效果。当文本超过指定行数时，会自动截断并显示省略号。这个功能在标题、描述等场景下非常实用。"
          lines={2}
          color="#666"
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const tx = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 4 },
});
