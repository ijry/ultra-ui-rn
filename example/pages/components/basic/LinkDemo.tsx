/**
 * UPLink 组件示例 — 链接
 * 复刻 uview-plus u-link 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPLink } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string', default: '—', desc: '链接文字' },
  { prop: 'color', type: 'string', default: '主题色', desc: '文字颜色' },
  { prop: 'fontSize', type: 'number | string', default: '15', desc: '字号' },
  { prop: 'underLine', type: 'boolean', default: 'true', desc: '下划线' },
  { prop: 'href', type: 'string', default: '—', desc: '链接地址' },
  { prop: 'lineColor', type: 'string', default: '—', desc: '下划线颜色' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
];

export default function LinkDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Link 链接" onBack={onBack}>
      <Section title="基础用法">
        <UPLink text="默认链接" />
      </Section>

      <Section title="自定义颜色">
        <View style={lk.row}>
          <UPLink text="橙色链接" color="#ff6600" />
          <UPLink text="绿色链接" color="#67c23a" />
          <UPLink text="蓝色链接" color="#3c9cff" />
        </View>
      </Section>

      <Section title="无下划线">
        <UPLink text="无下划线链接" underLine={false} />
      </Section>

      <Section title="自定义字号">
        <View style={lk.row}>
          <UPLink text="12号字" fontSize={12} />
          <UPLink text="16号字" fontSize={16} />
          <UPLink text="20号字" fontSize={20} />
        </View>
      </Section>

      <Section title="子节点模式">
        <UPLink>
          <Text style={{ color: '#3c9cff', textDecorationLine: 'underline' }}>自定义内容链接</Text>
        </UPLink>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const lk = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', paddingVertical: 4 },
});
