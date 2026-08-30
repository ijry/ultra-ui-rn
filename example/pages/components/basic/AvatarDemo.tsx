/**
 * UPAvatar 组件示例 — 头像
 * 复刻 uview-plus u-avatar 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPAvatar } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'src', type: 'string', default: '—', desc: '头像图片' },
  { prop: 'size', type: 'number | string', default: '40', desc: '头像大小' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '形状' },
  { prop: 'text', type: 'string', default: '—', desc: '文字头像' },
  { prop: 'icon', type: 'string', default: '—', desc: '图标头像' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
  { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
  { prop: 'fontSize', type: 'number | string', default: '—', desc: '字号' },
  { prop: 'randomBgColor', type: 'boolean', default: 'false', desc: '随机背景色' },
  { prop: 'mode', type: 'string', default: "'aspectFill'", desc: '图片模式' },
];

export default function AvatarDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Avatar 头像" onBack={onBack}>
      <Section title="图片头像">
        <View style={av.row}>
          <UPAvatar src="https://picsum.photos/100/100?random=1" size={48} />
          <UPAvatar src="https://picsum.photos/100/100?random=2" size={64} />
          <UPAvatar src="https://picsum.photos/100/100?random=3" size={80} />
        </View>
      </Section>

      <Section title="文字头像">
        <View style={av.row}>
          <UPAvatar text="张" size={40} bgColor="#3c9cff" />
          <UPAvatar text="李" size={40} bgColor="#67c23a" />
          <UPAvatar text="王" size={40} bgColor="#ff6600" />
        </View>
      </Section>

      <Section title="方形头像">
        <View style={av.row}>
          <UPAvatar src="https://picsum.photos/100/100?random=4" size={48} shape="square" />
          <UPAvatar text="方" size={48} shape="square" bgColor="#3c9cff" />
        </View>
      </Section>

      <Section title="随机背景色">
        <View style={av.row}>
          {['A', 'B', 'C', 'D'].map((t, i) => (
            <UPAvatar key={i} text={t} size={40} randomBgColor />
          ))}
        </View>
      </Section>

      <Section title="无图片时显示文字">
        <View style={av.row}>
          <UPAvatar text="默认" size={48} />
          <UPAvatar text="" size={48} icon="person" />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const av = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 8 },
});
