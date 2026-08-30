/**
 * UPGridItem 组件示例 — 宫格子项
 * 展示：基础子项、自定义背景色、点击事件
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPGrid, UPGridItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'name', type: 'string | number', default: '—', desc: '标识' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
  { prop: 'onClick', type: '(name) => void', default: '—', desc: '点击回调' },
];

export default function GridItemDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="GridItem 宫格子项" onBack={onBack}>
      <Section title="自定义背景色">
        <UPGrid col={3}>
          <UPGridItem name="item1" bgColor="#e3f2fd">
            <View style={gi.item}><Text style={gi.text}>蓝色背景</Text></View>
          </UPGridItem>
          <UPGridItem name="item2" bgColor="#fce4ec">
            <View style={gi.item}><Text style={gi.text}>粉色背景</Text></View>
          </UPGridItem>
          <UPGridItem name="item3" bgColor="#e8f5e9">
            <View style={gi.item}><Text style={gi.text}>绿色背景</Text></View>
          </UPGridItem>
        </UPGrid>
      </Section>

      <Section title="点击事件">
        <UPGrid col={2} onClick={(name) => console.log('clicked:', name)}>
          {['按钮A', '按钮B'].map((name) => (
            <UPGridItem key={name} name={name}>
              <View style={gi.item}>
                <Text style={[gi.text, { color: '#3c9cff' }]}>{name}</Text>
              </View>
            </UPGridItem>
          ))}
        </UPGrid>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const gi = StyleSheet.create({
  item: { height: 60, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 14, color: '#333' },
});
