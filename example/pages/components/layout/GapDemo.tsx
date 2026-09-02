/**
 * Gap 间隔槽
 * 严格复刻 uview-plus pages/componentsA/gap/gap.nvue
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UPGap } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'bgColor', type: 'string', default: 'transparent', desc: '背景颜色' },
  { prop: 'height', type: 'number | string', default: '20', desc: '间隔槽高度' },
  { prop: 'marginTop', type: 'number | string', default: '0', desc: '与上一个元素的距离' },
  { prop: 'marginBottom', type: 'number | string', default: '0', desc: '与下一个元素的距离' },
];

/** Upstream wraps each gap in `.u-page__gap-item`. */
function Item({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

export default function GapDemo() {
  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="基本案列">
        <Item>
          <UPGap bgColor="#f3f4f6" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义颜色">
        <Item>
          <UPGap bgColor="#2979ff" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义高度">
        <Item>
          <UPGap bgColor="#f3f4f6" height="40" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义上下边距">
        <Item>
          <UPGap bgColor="#f3f4f6" marginBottom="20" marginTop="20" />
        </Item>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  flush: { padding: 0 },
});
