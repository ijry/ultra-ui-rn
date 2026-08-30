/**
 * UPRow 组件示例 — 行布局
 * 展示：基础行、对齐方式、间距
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPRow, UPCol } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'gutter', type: 'number | string', default: '0', desc: '列间距' },
  { prop: 'justify', type: "'start' | 'end' | 'center' | 'around' | 'between'", default: "'start'", desc: '水平对齐' },
  { prop: 'align', type: "'top' | 'center' | 'bottom'", default: 'stretch', desc: '垂直对齐' },
];

export default function RowDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Row 行布局" onBack={onBack}>
      <Section title="基础行">
        <UPRow gutter={8}>
          <UPCol span={8}><View style={[r.box, { backgroundColor: '#3c9cff' }]}><Text style={r.text}>8</Text></View></UPCol>
          <UPCol span={8}><View style={[r.box, { backgroundColor: '#67c23a' }]}><Text style={r.text}>8</Text></View></UPCol>
          <UPCol span={8}><View style={[r.box, { backgroundColor: '#ff6600' }]}><Text style={r.text}>8</Text></View></UPCol>
        </UPRow>
      </Section>

      <Section title="不同列宽">
        <UPRow gutter={8}>
          <UPCol span={6}><View style={[r.box, { backgroundColor: '#e3f2fd' }]}><Text style={r.text}>6</Text></View></UPCol>
          <UPCol span={12}><View style={[r.box, { backgroundColor: '#f3e5f5' }]}><Text style={r.text}>12</Text></View></UPCol>
          <UPCol span={6}><View style={[r.box, { backgroundColor: '#e8f5e9' }]}><Text style={r.text}>6</Text></View></UPCol>
        </UPRow>
      </Section>

      <Section title="justify: between">
        <UPRow justify="between">
          <View style={[r.box, { backgroundColor: '#fff3e0' }]}><Text style={r.text}>左</Text></View>
          <View style={[r.box, { backgroundColor: '#fce4ec' }]}><Text style={r.text}>右</Text></View>
        </UPRow>
      </Section>

      <Section title="align: center">
        <UPRow align="center" gutter={8}>
          <UPCol span={12}><View style={[r.box, { height: 60, backgroundColor: '#e3f2fd' }]}><Text style={r.text}>60h</Text></View></UPCol>
          <UPCol span={12}><View style={[r.box, { height: 30, backgroundColor: '#f3e5f5' }]}><Text style={r.text}>30h</Text></View></UPCol>
        </UPRow>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const r = StyleSheet.create({
  box: { height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
