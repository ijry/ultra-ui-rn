/**
 * UPCanvas 组件示例 — 画布
 * 展示：基础画布、事件
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPCanvas } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'width', type: 'number | string', default: '300', desc: '画布宽度' },
  { prop: 'height', type: 'number | string', default: '300', desc: '画布高度' },
  { prop: 'bgColor', type: 'string', default: "'#fff'", desc: '背景色' },
  { prop: 'disableScroll', type: 'boolean', default: 'false', desc: '禁止滚动' },
  { prop: 'onTouchStart', type: '(e) => void', default: '—', desc: '触摸开始' },
  { prop: 'onTouchMove', type: '(e) => void', default: '—', desc: '触摸移动' },
  { prop: 'onTouchEnd', type: '(e) => void', default: '—', desc: '触摸结束' },
];

export default function CanvasDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Canvas 画布" onBack={onBack}>
      <Section title="基础画布">
        <UPCanvas
          width={300}
          height={200}
          bgColor="#f5f5f5"
          onTouchStart={() => console.log('touch start')}
          onTouchMove={() => console.log('touch move')}
          onTouchEnd={() => console.log('touch end')}
        />
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>
          画布组件需要原生 Canvas 支持，Web 端使用 canvas 元素
        </Text>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
