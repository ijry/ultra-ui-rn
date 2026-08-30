/**
 * UPCol 组件示例 — 列布局
 * 展示：不同span、偏移、对齐
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPRow, UPCol } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'span', type: 'number | string', default: '24', desc: '列宽(共24)' },
  { prop: 'offset', type: 'number | string', default: '0', desc: '偏移' },
  { prop: 'justify', type: "'start' | 'end' | 'center' | 'around' | 'between'", default: '—', desc: '水平对齐' },
  { prop: 'align', type: "'top' | 'center' | 'bottom' | 'stretch'", default: '—', desc: '垂直对齐' },
];

export default function ColDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Col 列布局" onBack={onBack}>
      <Section title="基础列">
        <UPRow gutter={8}>
          <UPCol span={24}><View style={[c.box, { backgroundColor: '#3c9cff' }]}><Text style={c.text}>span=24</Text></View></UPCol>
        </UPRow>
      </Section>

      <Section title="三等分">
        <UPRow gutter={8}>
          <UPCol span={8}><View style={[c.box, { backgroundColor: '#e3f2fd' }]}><Text style={c.text}>8</Text></View></UPCol>
          <UPCol span={8}><View style={[c.box, { backgroundColor: '#f3e5f5' }]}><Text style={c.text}>8</Text></View></UPCol>
          <UPCol span={8}><View style={[c.box, { backgroundColor: '#e8f5e9' }]}><Text style={c.text}>8</Text></View></UPCol>
        </UPRow>
      </Section>

      <Section title="offset 偏移">
        <UPRow gutter={8}>
          <UPCol span={8} offset={4}><View style={[c.box, { backgroundColor: '#fff3e0' }]}><Text style={c.text}>8 offset=4</Text></View></UPCol>
          <UPCol span={12}><View style={[c.box, { backgroundColor: '#fce4ec' }]}><Text style={c.text}>12</Text></View></UPCol>
        </UPRow>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const c = StyleSheet.create({
  box: { height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
