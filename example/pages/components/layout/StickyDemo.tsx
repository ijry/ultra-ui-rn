/**
 * UPSticky 组件示例 — 吸顶
 * 展示：基础吸顶
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPSticky } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'offsetTop', type: 'number | string', default: '0', desc: '吸顶偏移' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '禁用吸顶' },
  { prop: 'bgColor', type: 'string', default: "'#fff'", desc: '吸顶背景色' },
  { prop: 'zIndex', type: 'number | string', default: '10', desc: '层级' },
  { prop: 'index', type: 'string | number', default: '—', desc: '索引标识' },
  { prop: 'onFixed', type: '(index) => void', default: '—', desc: '吸顶回调' },
  { prop: 'onUnfixed', type: '(index) => void', default: '—', desc: '取消吸顶回调' },
];

export default function StickyDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Sticky 吸顶" onBack={onBack}>
      <Section title="基础吸顶">
        <UPSticky index="section-a">
          <View style={st.header}>
            <Text style={st.headerText}>📌 吸顶标题 A</Text>
          </View>
        </UPSticky>
        <View style={st.content}>
          {Array.from({ length: 5 }, (_, i) => (
            <View key={i} style={st.item}><Text>A - 内容 {i + 1}</Text></View>
          ))}
        </View>

        <UPSticky index="section-b">
          <View style={[st.header, { backgroundColor: '#e3f2fd' }]}>
            <Text style={st.headerText}>📌 吸顶标题 B</Text>
          </View>
        </UPSticky>
        <View style={st.content}>
          {Array.from({ length: 5 }, (_, i) => (
            <View key={i} style={st.item}><Text>B - 内容 {i + 1}</Text></View>
          ))}
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const st = StyleSheet.create({
  header: { backgroundColor: '#fff', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  headerText: { fontSize: 14, fontWeight: '600', color: '#333' },
  content: { backgroundColor: '#f9f9f9' },
  item: { height: 44, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', backgroundColor: '#fff' },
});
