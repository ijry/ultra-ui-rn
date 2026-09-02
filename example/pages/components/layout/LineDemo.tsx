/**
 * Line 线条
 * 严格复刻 uview-plus pages/componentsA/line/line.nvue
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UPLine } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'color', type: 'string', default: '#d6d7d9', desc: '线条颜色' },
  { prop: 'length', type: 'number | string', default: "'100%'", desc: '线条长度（横向为宽，竖向为高）' },
  { prop: 'direction', type: "'row' | 'col'", default: "'row'", desc: '线条方向' },
  { prop: 'hairline', type: 'boolean', default: 'true', desc: '是否显示 0.5px 细线' },
  { prop: 'margin', type: 'number | string', default: '0', desc: '线条与上下左右元素的间距' },
  { prop: 'dashed', type: 'boolean', default: 'false', desc: '是否虚线' },
];

/** Upstream wraps each line in `.u-page__line-item` (`margin-top: 5px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function LineDemo() {
  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="基本案例">
        <Item>
          <UPLine />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义颜色">
        <Item>
          <UPLine color="#2979ff" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义长度">
        <Item>
          <UPLine length="200" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="自定义方向">
        <Item>
          <UPLine color="#2979ff" direction="col" length="30" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="是否显示1px粗线条">
        <Item>
          <UPLine hairline={false} />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="线条与上下左右元素的间距">
        <Item>
          <UPLine margin="20" />
        </Item>
      </Section>

      <Section contentStyle={s.flush} title="是否虚线">
        <Item>
          <UPLine color="#2979ff" dashed />
        </Item>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  flush: { paddingVertical: 8 },
  item: { marginTop: 5 },
});
