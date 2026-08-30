/**
 * UPIcon 组件示例 — 图标
 * 复刻 uview-plus u-icon 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPIcon } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'name', type: 'string', default: '—', desc: '图标名称' },
  { prop: 'color', type: 'string', default: '—', desc: '图标颜色' },
  { prop: 'size', type: 'number | string', default: '16', desc: '图标大小' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '加粗' },
  { prop: 'label', type: 'string | number', default: '—', desc: '标签文字' },
  { prop: 'labelPos', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", desc: '标签位置' },
];

export default function IconDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Icon 图标" onBack={onBack}>
      <Section title="基础用法">
        <View style={ic.row}>
          <UPIcon name="info" size={24} />
          <UPIcon name="info-circle" size={24} />
          <UPIcon name="checkmark" size={24} />
          <UPIcon name="close" size={24} />
          <UPIcon name="star" size={24} />
        </View>
      </Section>

      <Section title="不同颜色">
        <View style={ic.row}>
          <UPIcon name="info" size={28} color="#3c9cff" />
          <UPIcon name="checkmark" size={28} color="#67c23a" />
          <UPIcon name="warning" size={28} color="#e6a23c" />
          <UPIcon name="close" size={28} color="#f56c6c" />
        </View>
      </Section>

      <Section title="不同大小">
        <View style={ic.row}>
          <UPIcon name="star" size={16} color="#ff6600" />
          <UPIcon name="star" size={24} color="#ff6600" />
          <UPIcon name="star" size={32} color="#ff6600" />
          <UPIcon name="star" size={40} color="#ff6600" />
        </View>
      </Section>

      <Section title="带标签">
        <View style={ic.row}>
          <UPIcon name="info" size={24} label="提示" labelPos="right" />
          <UPIcon name="star" size={24} label="收藏" labelPos="bottom" />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const ic = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', paddingVertical: 8 },
});
