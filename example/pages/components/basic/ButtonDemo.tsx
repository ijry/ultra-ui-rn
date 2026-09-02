/**
 * UPButton 组件示例 — 按钮
 * 复刻 uview-plus pages/componentsA/button/button.nvue
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPButton } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'info'", desc: '按钮类型' },
  { prop: 'size', type: "'large' | 'normal' | 'small' | 'mini'", default: "'normal'", desc: '按钮大小' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '按钮形状' },
  { prop: 'plain', type: 'boolean', default: 'false', desc: '是否镂空背景色透明' },
  { prop: 'hairline', type: 'boolean', default: 'true', desc: '是否显示按钮的细边框' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'loading', type: 'boolean', default: 'false', desc: '按钮名称前是否带 loading 图标' },
  { prop: 'loadingText', type: 'string | number', default: '—', desc: '加载中提示文字' },
  { prop: 'loadingMode', type: "'circle' | 'spinner' | 'semicircle'", default: "'spinner'", desc: 'loading 图标类型' },
  { prop: 'text', type: 'string | number', default: '—', desc: '按钮文字' },
  { prop: 'icon', type: 'string', default: '—', desc: '按钮图标' },
  { prop: 'color', type: 'string', default: '—', desc: '按钮颜色，支持渐变色' },
];

/** Upstream wraps every button in `.u-page__button-item` (`margin: 0 15px 15px 0`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function ButtonDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  return (
    <DemoPage>
      <Section title="按钮类型" direction="row">
        <Item>
          <UPButton text="默认按钮" size="normal" type="info" onClick={() => log('click')} />
        </Item>
        <Item>
          <UPButton text="成功按钮" size="normal" type="success" />
        </Item>
        <Item>
          <UPButton text="危险按钮" size="normal" type="error" />
        </Item>
        <Item>
          <UPButton text="主要按钮" size="normal" type="primary" />
        </Item>
        <Item>
          <UPButton text="警告按钮" size="normal" type="warning" />
        </Item>
      </Section>

      <Section title="镂空按钮" direction="row">
        <Item>
          <UPButton text="镂空按钮" size="normal" type="info" plain />
        </Item>
        <Item>
          <UPButton text="镂空按钮" size="normal" type="success" plain />
        </Item>
        <Item>
          <UPButton text="镂空按钮" size="normal" type="error" plain />
        </Item>
        <Item>
          <UPButton text="镂空按钮" size="normal" type="primary" plain />
        </Item>
        <Item>
          <UPButton text="镂空按钮" size="normal" type="warning" plain />
        </Item>
      </Section>

      <Section title="细边按钮" direction="row">
        <Item>
          <UPButton text="细边按钮" size="normal" type="info" plain hairline />
        </Item>
        <Item>
          <UPButton text="细边按钮" size="normal" type="success" plain hairline />
        </Item>
        <Item>
          <UPButton text="细边按钮" size="normal" type="error" plain hairline />
        </Item>
        <Item>
          <UPButton text="细边按钮" size="normal" type="primary" plain hairline />
        </Item>
        <Item>
          <UPButton text="细边按钮" size="normal" type="warning" plain hairline />
        </Item>
      </Section>

      <Section title="禁用按钮" direction="row">
        <Item>
          <UPButton disabled text="禁用按钮" size="normal" type="info" />
        </Item>
        <Item>
          <UPButton disabled text="禁用按钮" size="normal" type="success" />
        </Item>
        <Item>
          <UPButton disabled text="禁用按钮" size="normal" type="error" />
        </Item>
        <Item>
          <UPButton disabled text="禁用按钮" size="normal" type="primary" />
        </Item>
        <Item>
          <UPButton disabled text="禁用按钮" size="normal" type="warning" />
        </Item>
      </Section>

      <Section title="加载中" direction="row">
        <Item>
          <UPButton loadingText="加载中" size="normal" loading loadingMode="circle" type="success" />
        </Item>
        <Item>
          <UPButton loadingText="加载中" size="normal" loading type="error" />
        </Item>
      </Section>

      <Section title="按钮图标&按钮形状" direction="row">
        <Item>
          <UPButton text="按钮图标" size="normal" icon="map" plain type="warning" />
        </Item>
        <Item>
          <UPButton text="按钮图标" size="normal" plain shape="circle" type="success" />
        </Item>
      </Section>

      <Section title="自定义颜色" direction="row">
        <Item>
          <UPButton
            text="渐变色按钮"
            size="normal"
            color="linear-gradient(to right, rgb(66, 83, 216), rgb(213, 51, 186))"
          />
        </Item>
        <Item>
          <UPButton
            text="渐变色按钮"
            size="normal"
            color="linear-gradient(to right, rgb(220, 194, 11), rgb(4, 151, 99))"
          />
        </Item>
        <Item>
          <UPButton text="青绿色按钮" size="normal" color="rgb(10, 185, 156)" />
        </Item>
      </Section>

      <Section title="自定义大小" contentStyle={s.stretchContent}>
        <UPButton text="超大尺寸" size="large" type="success" />
        <View style={s.sizeRow}>
          <Item>
            <UPButton text="普通尺寸" size="normal" type="error" />
          </Item>
          <Item>
            <UPButton text="小型尺寸" size="small" type="primary" />
          </Item>
          <Item>
            <UPButton text="超小尺寸" size="mini" type="warning" />
          </Item>
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginBottom: 15, marginRight: 15 },
  sizeRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  stretchContent: { alignItems: 'stretch' },
});
