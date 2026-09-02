/**
 * UPText 组件示例 — 文本
 * 复刻 uview-plus pages/componentsC/text/text.nvue
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPText } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'type', type: "'' | 'info' | 'primary' | 'success' | 'warning' | 'error' | 'main' | 'content' | 'tips' | 'light'", default: "''", desc: '主题颜色' },
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示' },
  { prop: 'text', type: 'string | number', default: "''", desc: '显示的值' },
  { prop: 'prefixIcon', type: 'string', default: "''", desc: '前置图标' },
  { prop: 'suffixIcon', type: 'string', default: "''", desc: '后置图标' },
  { prop: 'mode', type: "'text' | 'price' | 'phone' | 'name' | 'date' | 'link'", default: "''", desc: '文本处理的匹配模式' },
  { prop: 'href', type: 'string', default: "''", desc: 'mode=link 时的跳转链接' },
  { prop: 'format', type: 'string | ((value) => string | number)', default: "''", desc: '格式化规则' },
  { prop: 'call', type: 'boolean', default: 'false', desc: 'mode=phone 时是否拨打电话' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '是否加粗' },
  { prop: 'block', type: 'boolean', default: 'false', desc: '是否块状' },
  { prop: 'lines', type: 'string | number', default: "''", desc: '文本显示的行数，超出显示省略号' },
  { prop: 'color', type: 'string', default: "''", desc: '字体颜色' },
  { prop: 'size', type: 'string | number', default: '15', desc: '字体大小' },
  { prop: 'iconStyle', type: 'StyleProp<TextStyle>', default: "{ fontSize: '15px' }", desc: '图标样式' },
  { prop: 'decoration', type: "'none' | 'underline' | 'line-through'", default: "'none'", desc: '文字装饰' },
  { prop: 'margin', type: 'string | number', default: '0', desc: '外边距' },
  { prop: 'lineHeight', type: 'string | number', default: "''", desc: '行高' },
  { prop: 'align', type: "'left' | 'center' | 'right'", default: "'left'", desc: '文本对齐方式' },
  { prop: 'wordWrap', type: "'normal' | 'break-word' | 'anywhere'", default: "'normal'", desc: '文字换行方式' },
  { prop: 'flex1', type: 'boolean', default: 'true', desc: '是否撑满剩余空间' },
  { prop: 'openType', type: 'string', default: "''", desc: '小程序开放能力（RN 无对应能力，no-op）' },
];

/** Upstream `.u-page__text-item` (`margin-right: 10px; flex: 1`). */
function Item({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.item, style]}>{children}</View>;
}

export default function TextDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  return (
    <DemoPage>
      <Section title="基础功能" direction="row">
        <Item>
          <UPText text="我用十年青春,赴你最后之约" onClick={() => log('test')} />
        </Item>
      </Section>

      <Section title="设置主题" direction="row">
        <Item>
          <UPText text="主色" type="primary" />
        </Item>
        <Item>
          <UPText type="error" text="错误" />
        </Item>
        <Item>
          <UPText type="success" text="成功" />
        </Item>
        <Item>
          <UPText type="warning" text="警告" />
        </Item>
        <Item>
          <UPText type="info" text="信息" />
        </Item>
        <Item style={s.darkItem}>
          <UPText text="颜色" size="30rpx" color="#fff" />
        </Item>
        <UPText text="颜色" color="#4557FF" size="32rpx" />
      </Section>

      <Section title="拨打电话" direction="row">
        <Item>
          <UPText mode="phone" text="15019479320" />
        </Item>
      </Section>

      <Section title="日期格式化" direction="row">
        <Item>
          <UPText mode="date" text="1612959739" />
        </Item>
      </Section>

      <Section title="姓名脱敏" direction="row">
        <Item>
          <UPText mode="name" text="张三三" format="encrypt" />
        </Item>
      </Section>

      <Section title="超链接" direction="row">
        <Item>
          <UPText
            mode="link"
            text="Go to uview-plus docs"
            href="https://uview-plus.jiangruyi.com"
          />
        </Item>
      </Section>

      <Section title="显示金额" direction="row">
        <Item>
          <UPText mode="price" text="728732.32" />
        </Item>
      </Section>

      <Section title="前后图标" direction="row">
        <Item style={s.iconItem}>
          <UPText prefixIcon="baidu" iconStyle={{ fontSize: 19 }} text="百度一下" />
        </Item>
        <Item>
          <UPText suffixIcon="arrow-rightward" iconStyle={{ fontSize: 18 }} text="查看更多" />
        </Item>
      </Section>

      <Section title="超出隐藏" direction="row">
        <UPText
          lines={2}
          text="关于uview-plus的取名来由，首字母u来自于uni-app首字母，plus参考element-plus起名让大家容易理解这是Vue3版本，uni-app是基于Vue.js，Vue和View(延伸为UI、视图之意)同音，同时view组件uni-app中 最基础，最重要的组件，故取名uview-plus，表达源于uni-app和Vue之意，同时在此也对它们表示感谢。"
        />
      </Section>

      <Section title="小程序开放能力" direction="row">
        <UPText
          text="分享到微信"
          openType="share"
          type="success"
          onClick={() => log('请在微信小程序内查看效果')}
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  darkItem: { backgroundColor: '#000' },
  iconItem: { marginRight: 50 },
  item: { flex: 1, marginRight: 10 },
});
