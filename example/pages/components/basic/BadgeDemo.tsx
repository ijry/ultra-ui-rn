/**
 * UPBadge 组件示例 — 徽标
 * 复刻 uview-plus pages/componentsB/badge/badge.nvue
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UPBadge } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'isDot', type: 'boolean', default: 'false', desc: '是否显示圆点' },
  { prop: 'value', type: 'string | number', default: '—', desc: '显示的内容' },
  { prop: 'modelValue', type: 'string | number', default: '—', desc: 'value 的别名，value 优先' },
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示徽标' },
  { prop: 'max', type: 'string | number', default: '999', desc: '最大值，超出显示 max+' },
  { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'error'", desc: '主题类型' },
  { prop: 'showZero', type: 'boolean', default: 'false', desc: 'value 为 0 时是否显示' },
  { prop: 'bgColor', type: 'string | null', default: 'null', desc: '背景颜色，优先于 type' },
  { prop: 'color', type: 'string | null', default: 'null', desc: '文字颜色' },
  { prop: 'shape', type: "'circle' | 'horn'", default: "'circle'", desc: '徽标形状，horn 为左下角直角' },
  { prop: 'numberType', type: "'overflow' | 'ellipsis' | 'limit'", default: "'overflow'", desc: '数字显示方式' },
  { prop: 'offset', type: '[UPDimension, UPDimension?]', default: '—', desc: '位置偏移，absolute 时生效' },
  { prop: 'inverted', type: 'boolean', default: 'false', desc: '是否反转背景和字体颜色' },
  { prop: 'absolute', type: 'boolean', default: 'false', desc: '是否绝对定位' },
];

/** Upstream wraps each badge in `.u-page__tag-item` (`margin-right: 40px; margin-top: 10px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function BadgeDemo() {
  return (
    <DemoPage>
      <Section title="直角边形状" direction="row">
        <Item>
          <UPBadge value={1500} shape="horn" />
        </Item>
      </Section>

      <Section title="徽标数显示方式" direction="row">
        <Item>
          <UPBadge value={5132} numberType="ellipsis" />
        </Item>
        <Item>
          <UPBadge value={1011} numberType="overflow" />
        </Item>
        <Item>
          <UPBadge value={1500} numberType="limit" />
        </Item>
        <Item>
          <UPBadge value={45187} numberType="limit" />
        </Item>
      </Section>

      <Section title="显示圆点" direction="row">
        <Item>
          <UPBadge value={1011} numberType="overflow" isDot />
        </Item>
      </Section>

      <Section title="自定义主题" direction="row">
        <Item>
          <UPBadge value={9} type="error" />
        </Item>
        <Item>
          <UPBadge value={9} type="warning" />
        </Item>
        <Item>
          <UPBadge value={9} type="success" />
        </Item>
        <Item>
          <UPBadge value={9} type="primary" />
        </Item>
      </Section>

      <Section title="反转色" direction="row">
        <Item>
          <UPBadge value={9} type="error" inverted />
        </Item>
        <Item>
          <UPBadge value={1532} inverted type="warning" />
        </Item>
        <Item>
          <UPBadge value={12} inverted type="success" />
        </Item>
        <Item>
          <UPBadge value={999} inverted type="primary" />
        </Item>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginRight: 40, marginTop: 10 },
});
