/**
 * UPLine 组件示例 — 分割线
 * 展示：水平/垂直、虚线、自定义颜色
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPLine } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'color', type: 'string', default: "'#ebeef5'", desc: '线条颜色' },
  { prop: 'length', type: 'number | string', default: '100%', desc: '长度' },
  { prop: 'direction', type: "'row' | 'col'", default: "'row'", desc: '方向' },
  { prop: 'hairline', type: 'boolean', default: 'true', desc: '1px细线' },
  { prop: 'dashed', type: 'boolean', default: 'false', desc: '虚线' },
  { prop: 'margin', type: 'number | string', default: '0', desc: '外边距' },
];

export default function LineDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Line 分割线" onBack={onBack}>
      <Section title="水平分割线">
        <Text>上方内容</Text>
        <UPLine />
        <Text>下方内容</Text>
      </Section>

      <Section title="自定义颜色">
        <Text>内容</Text>
        <UPLine color="#3c9cff" />
        <Text>内容</Text>
      </Section>

      <Section title="虚线">
        <Text>内容</Text>
        <UPLine dashed color="#999" />
        <Text>内容</Text>
      </Section>

      <Section title="垂直分割线">
        <View style={ln.row}>
          <Text>左</Text>
          <UPLine direction="col" length={20} margin={12} color="#999" />
          <Text>中</Text>
          <UPLine direction="col" length={20} margin={12} color="#999" />
          <Text>右</Text>
        </View>
      </Section>

      <Section title="非 hairline">
        <Text>内容</Text>
        <UPLine hairline={false} color="#ff6600" />
        <Text>内容</Text>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const ln = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
});
