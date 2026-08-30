/**
 * UPBox 组件示例 — 三宫格盒子
 * 展示：基础盒子、自定义颜色
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPBox } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'bgColors', type: 'string[]', default: '["#999","#bbb","#ddd"]', desc: '三块背景色' },
  { prop: 'height', type: 'number | string', default: '120', desc: '高度' },
  { prop: 'gap', type: 'number | string', default: '8', desc: '间距' },
  { prop: 'leftTitle', type: 'string', default: '—', desc: '左侧标题' },
  { prop: 'rightTopTitle', type: 'string', default: '—', desc: '右上标题' },
  { prop: 'rightBottomTitle', type: 'string', default: '—', desc: '右下标题' },
  { prop: 'left', type: 'ReactNode', default: '—', desc: '左侧内容' },
  { prop: 'rightTop', type: 'ReactNode', default: '—', desc: '右上内容' },
  { prop: 'rightBottom', type: 'ReactNode', default: '—', desc: '右下内容' },
];

export default function BoxDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Box 三宫格" onBack={onBack}>
      <Section title="基础用法">
        <UPBox
          bgColors={['#3c9cff', '#67c23a', '#ff6600']}
          height={160}
          leftTitle="左侧"
          rightTopTitle="右上"
          rightBottomTitle="右下"
        />
      </Section>

      <Section title="自定义内容">
        <UPBox
          bgColors={['#e3f2fd', '#f3e5f5', '#e8f5e9']}
          height={160}
          left={<View style={bx.custom}><Text style={bx.text}>自定义{'\n'}左</Text></View>}
          rightTop={<View style={bx.custom}><Text style={bx.text}>右上</Text></View>}
          rightBottom={<View style={bx.custom}><Text style={bx.text}>右下</Text></View>}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const bx = StyleSheet.create({
  custom: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 14, color: '#333', textAlign: 'center' },
});
